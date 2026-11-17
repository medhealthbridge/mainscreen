"use client";
import { useEffect, useRef } from "react";

/**
 * THE DATA LINE — idea → connection → structure → working system.
 *
 * One continuous line starts at the hero's lime square and draws itself down the page
 * as you scroll. It runs through reserved gutters and empty section padding, joining
 * every [data-line] anchor with smooth S-curves. When the line reaches a node, the node
 * activates briefly and a lit signal travels from the previous node. Occasionally, while
 * the page is idle and visible, a signal runs along the most recent stretch.
 *
 * Rendering: a viewport-sized <canvas>, redrawn in the same frame as the scroll.
 * Phones (< 760px): disabled — sections keep their static nodes and local connectors.
 * Decorative only: aria-hidden, pointer-events: none.
 *
 * Anchor attributes:
 *   data-line          the line passes through this element's centre
 *   data-turn="top"    curve into it just inside the top of its section
 *   data-turn="scene"  curve into it across the top of its line-art scene
 *   data-turn="<px>"   curve into it, centred this far above it
 *   data-h="<px>"      maximum half-height of that curve
 *   class="lane"       a waypoint (no node activation)
 */
export function DataLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = getComputedStyle(document.documentElement);
    const VOLT = css.getPropertyValue("--volt").trim() || "#d7ff3f";
    const INK = css.getPropertyValue("--ink").trim() || "#080808";
    const VOLT_DIM = "rgba(215, 255, 63, 0.72)";
    const INK_DIM = "rgba(8, 8, 8, 0.7)";

    type Node = { l: number; el: Element; hit: boolean };
    let enabled = false;
    let path2d: Path2D | null = null;
    let total = 0;
    let samples: { l: number; x: number; y: number }[] = [];
    let nodes: Node[] = [];
    let lights: { top: number; bottom: number }[] = [];
    let vw = 0, vh = 0, dpr = 1, headerH = 64;
    let cur = 0, target = 0, raf = 0, lastScroll = -1;
    let width = 1.5;
    let signal: { from: number; to: number; t0: number; dur: number } | null = null;
    let lastActivity = performance.now();
    let idleTimer = 0;
    const test: { enabled: boolean; points: { x: number; y: number }[] } = { enabled: false, points: [] };
    (window as unknown as { __dbLine?: typeof test }).__dbLine = test;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      headerH = (document.querySelector(".site-header") as HTMLElement | null)?.offsetHeight ?? 64;
    };

    const build = () => {
      resizeCanvas();
      enabled = vw >= 760 && vh >= 500; // phones (incl. landscape) get static nodes instead
      test.enabled = enabled;
      if (!enabled) { path2d = null; samples = []; nodes = []; clear(); return; }
      const sy = window.scrollY, sx = window.scrollX;
      // Layout presence, not painted size (the hero square animates in from scale(0)).
      const anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-line-start], [data-line]")).filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).display !== "none",
      );
      if (anchors.length < 2) { path2d = null; clear(); return; }

      const pts = anchors.map((el) => {
        const r = el.getBoundingClientRect();
        const t = el.dataset?.turn;
        let turnY = NaN;
        if (t === "top") {
          const sec = el.closest("section, article");
          if (sec) turnY = sec.getBoundingClientRect().top + sy + 28;
        } else if (t === "scene") {
          const sc = el.closest(".scene");
          if (sc) turnY = sc.getBoundingClientRect().top + sy + 12;
        } else if (t != null && t !== "") turnY = r.top + r.height / 2 + sy - Number(t);
        const hMax = el.dataset?.h ? Number(el.dataset.h) : 200;
        const isLane = el.classList.contains("lane") || el.hasAttribute("data-line-start");
        return { el, x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, turnY, hMax, isLane };
      }).sort((a, b) => a.y - b.y);

      // Geometry measured directly (fast) — never getPointAtLength (very slow).
      samples = [{ l: 0, x: pts[0].x, y: pts[0].y }];
      nodes = [];
      let len = 0, cx = pts[0].x, cy = pts[0].y;
      let d = `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
      const lineTo = (x: number, y: number) => {
        if (x === cx && y === cy) return;
        len += Math.hypot(x - cx, y - cy);
        cx = x; cy = y;
        samples.push({ l: len, x, y });
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      };
      const curveTo = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
        const x0 = cx, y0 = cy, N = 40;
        let px = x0, py = y0;
        for (let k = 1; k <= N; k++) {
          const t = k / N, u = 1 - t;
          const qx = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x;
          const qy = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y;
          len += Math.hypot(qx - px, qy - py);
          samples.push({ l: len, x: qx, y: qy });
          px = qx; py = qy;
        }
        cx = x; cy = y;
        d += ` C${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      };
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1], n = pts[i];
        const dx = n.x - p.x;
        if (Math.abs(dx) < 2) lineTo(p.x, n.y);
        else {
          const gap = n.y - p.y;
          let ty = Number.isFinite(n.turnY) ? n.turnY : p.y + gap / 2;
          ty = Math.min(n.y - 1, Math.max(p.y + 1, ty));
          // Carefully shaped bend: taller for longer sideways moves, limited by the space available.
          const want = Math.min(n.hMax, Math.max(60, Math.abs(dx) * 0.16));
          const h = Math.max(1, Math.min(want, ty - p.y, n.y - ty));
          const y0 = ty - h, y1 = ty + h;
          lineTo(p.x, y0);
          curveTo(p.x, y0 + h * 1.1, n.x, y1 - h * 1.1, n.x, y1);
          lineTo(n.x, n.y);
        }
        if (!n.isLane) nodes.push({ l: len, el: n.el, hit: false });
      }
      total = len;
      path2d = new Path2D(d);
      test.points = [];
      for (let l = 0; l <= total; l += 6) test.points.push(pointAt(l));

      lights = Array.from(document.querySelectorAll<HTMLElement>(".sec-light, [data-theme='light']")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + sy, bottom: r.bottom + sy };
      }).sort((a, b) => a.top - b.top);

      target = reduce ? total : lengthAtY(sy + vh * 0.7);
      if (lastScroll < 0) cur = target; // first paint: no catch-up
      lastScroll = sy;
      nodes.forEach((n) => { n.hit = n.l <= cur; if (n.hit) n.el.classList.add("is-hit"); });
      draw(performance.now());
    };

    const lengthAtY = (y: number) => {
      if (!samples.length || y <= samples[0].y) return 0;
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (samples[mid].y <= y) lo = mid; else hi = mid - 1; }
      const a = samples[lo], b = samples[Math.min(lo + 1, samples.length - 1)];
      if (b.y === a.y) return b.l;
      return a.l + (b.l - a.l) * Math.min(1, (y - a.y) / (b.y - a.y));
    };
    const pointAt = (l: number) => {
      if (!samples.length) return { x: -9999, y: -9999 };
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (samples[mid].l <= l) lo = mid; else hi = mid - 1; }
      const a = samples[lo], b = samples[Math.min(lo + 1, samples.length - 1)];
      const t = b.l === a.l ? 0 : (l - a.l) / (b.l - a.l);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };
    const onLightAt = (y: number) => lights.some((l) => y >= l.top && y <= l.bottom);
    const clear = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); };

    const draw = (now: number) => {
      clear();
      if (!enabled || !path2d || cur <= 0) return;
      const sy = window.scrollY, sx = window.scrollX;
      const top = sy + headerH, bottom = sy + vh; // never paint under the fixed header
      ctx.setTransform(dpr, 0, 0, dpr, -sx * dpr, -sy * dpr);
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      let y = top;
      const bands: { y0: number; y1: number; light: boolean }[] = [];
      for (const l of lights) {
        if (l.bottom <= y || l.top >= bottom) continue;
        if (l.top > y) bands.push({ y0: y, y1: l.top, light: false });
        bands.push({ y0: Math.max(y, l.top), y1: Math.min(bottom, l.bottom), light: true });
        y = Math.min(bottom, l.bottom);
      }
      if (y < bottom) bands.push({ y0: y, y1: bottom, light: false });

      // Signal position (lit pulse with a short fading tail).
      let sig: { pos: number; tail: number } | null = null;
      if (signal) {
        const u = Math.min(1, (now - signal.t0) / signal.dur);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        const pos = signal.from + (signal.to - signal.from) * e;
        sig = { pos: Math.min(pos, cur), tail: Math.min(140, Math.max(40, (signal.to - signal.from) * 0.18)) };
        if (u >= 1) signal = null;
      }

      for (const b of bands) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx, b.y0, vw, b.y1 - b.y0);
        ctx.clip();
        ctx.setLineDash([cur, total + 100]);
        ctx.lineDashOffset = 0;
        ctx.strokeStyle = b.light ? INK_DIM : VOLT_DIM;
        ctx.stroke(path2d);
        if (sig) {
          const start = Math.max(0, sig.pos - sig.tail);
          ctx.setLineDash([sig.pos - start, total + 100]);
          ctx.lineDashOffset = -start;
          ctx.strokeStyle = b.light ? INK : VOLT;
          ctx.lineWidth = width + 0.8;
          ctx.shadowColor = b.light ? "rgba(8,8,8,.25)" : "rgba(215,255,63,.8)";
          ctx.shadowBlur = 10;
          ctx.stroke(path2d);
          ctx.shadowBlur = 0;
          ctx.lineWidth = width;
        }
        ctx.restore();
      }

      const head = (l: number, size: number, glow: number) => {
        const pt = pointAt(l);
        if (pt.y < top - 10 || pt.y > bottom + 10) return;
        const light = onLightAt(pt.y);
        ctx.save();
        ctx.beginPath(); ctx.rect(sx, top, vw, vh - headerH); ctx.clip();
        ctx.setLineDash([]);
        ctx.fillStyle = light ? INK : VOLT;
        ctx.shadowColor = light ? "rgba(8,8,8,.3)" : "rgba(215,255,63,.75)";
        ctx.shadowBlur = glow;
        ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
        ctx.restore();
      };
      if (sig) head(sig.pos, 6, 12);
      if (!reduce && cur < total - 1) head(cur, 8, 10);
    };

    const fire = (from: number, to: number) => {
      if (reduce || to - from < 30) return;
      signal = { from, to, t0: performance.now(), dur: Math.min(1600, Math.max(600, (to - from) * 0.55)) };
      kick();
    };

    const checkNodes = () => {
      let prevL = 0;
      for (const n of nodes) {
        if (!n.hit && n.l <= cur + 1) {
          n.hit = true;
          n.el.classList.remove("is-hit");
          void (n.el as HTMLElement).offsetWidth; // restart the one-shot activation
          n.el.classList.add("is-hit");
          fire(prevL, n.l);
        } else if (n.hit && n.l > cur + 400) {
          n.hit = false; // scrolled well back above it — allow it to activate again later
        }
        if (n.l <= cur) prevL = n.l;
      }
    };

    const step = () => {
      const sy = window.scrollY;
      if (!reduce) target = lengthAtY(sy + vh * 0.7);
      const diff = target - cur;
      cur = Math.abs(diff) < 0.3 ? target : cur + diff * 0.2;
      if (sy !== lastScroll) lastActivity = performance.now();
      lastScroll = sy;
      checkNodes();
      draw(performance.now());
    };
    const tick = () => {
      raf = 0;
      if (!enabled) return;
      step();
      if (cur !== target || signal) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && enabled) raf = requestAnimationFrame(tick); };

    // Occasional idle signal along the latest stretch (paused when hidden or offscreen).
    const scheduleIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (enabled && !reduce && document.visibilityState === "visible" && !signal && performance.now() - lastActivity > 3000 && cur > 200) {
          const pt = pointAt(cur);
          const sy = window.scrollY;
          if (pt.y > sy + headerH && pt.y < sy + vh) fire(Math.max(0, cur - 700), cur);
        }
        scheduleIdle();
      }, 9000);
    };

    // With Lenis, draw inside its scroll callback so line and page move in the same frame.
    type L = { on: (e: string, cb: () => void) => () => void };
    let lenisOff: (() => void) | null = null;
    const attachLenis = () => {
      const lenis = (window as unknown as { __lenis?: L }).__lenis;
      if (!lenis || lenisOff) return;
      lenisOff = lenis.on("scroll", () => { if (!enabled) return; step(); if (cur !== target || signal) kick(); });
    };
    const onScroll = () => { if (!lenisOff) kick(); };
    const onVis = () => { if (document.visibilityState === "visible") kick(); };

    let t = 0, lastW = 0, lastH = 0;
    const rebuild = () => { window.clearTimeout(t); t = window.setTimeout(build, 150); };
    const onBodyResize = () => {
      const w = document.documentElement.scrollWidth, h = document.documentElement.scrollHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h;
      rebuild();
    };
    // The hero headline rises into place on load: re-measure once its animations settle.
    const onAnimEnd = (e: AnimationEvent) => { if ((e.target as Element | null)?.closest?.(".hero")) rebuild(); };
    document.addEventListener("animationend", onAnimEnd);
    window.addEventListener("db:intro-done", rebuild);
    const ro = new ResizeObserver(onBodyResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    window.addEventListener("orientationchange", rebuild);
    window.addEventListener("load", rebuild);
    window.addEventListener("lenisready", attachLenis);
    document.addEventListener("visibilitychange", onVis);
    document.fonts?.ready.then(rebuild);
    attachLenis();
    build();
    scheduleIdle();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("orientationchange", rebuild);
      window.removeEventListener("load", rebuild);
      window.removeEventListener("lenisready", attachLenis);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("animationend", onAnimEnd);
      window.removeEventListener("db:intro-done", rebuild);
      lenisOff?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="dataline" aria-hidden="true" />;
}
