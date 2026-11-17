"use client";
import { useEffect, useRef } from "react";

/**
 * THE DATA LINE — one continuous line that starts at the hero's accent block and
 * draws itself down the page as you scroll.
 *
 * Rendering: a viewport-sized <canvas> redrawn in the same animation frame as the
 * scroll (cheap vector stroke, no page-tall SVG repaints). Geometry: routed through
 * every [data-line] anchor; each change of lane is a long, smooth S-curve.
 * Volt over dark sections, ink over light ones. Decorative only.
 *
 * Anchors: add data-line to any element. Optional data-turn sets where the curve into
 * that anchor happens: "<px>" above the anchor, or "top" = the top of its section.
 */
export function DataLine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const style = getComputedStyle(document.documentElement);
    const VOLT = style.getPropertyValue("--volt").trim() || "#d7ff3f";
    const INK = style.getPropertyValue("--ink").trim() || "#080808";

    let path2d: Path2D | null = null;
    let total = 0;
    let samples: { l: number; x: number; y: number }[] = [];
    let lights: { top: number; bottom: number }[] = [];
    let vw = 0, vh = 0, dpr = 1;
    let cur = 0, target = 0, raf = 0, lastScroll = -1;
    let width = 1.6;

    const resizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      width = vw < 760 ? 1.25 : 1.6;
    };

    const build = () => {
      resizeCanvas();
      const sy = window.scrollY, sx = window.scrollX;
      // Use layout presence (not painted size): the hero's accent block animates in from scale(0).
      const anchors = Array.from(document.querySelectorAll<Element>("[data-line-start], [data-line]")).filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).display !== "none",
      );
      if (anchors.length < 2) { path2d = null; draw(); return; }

      const pts = anchors.map((el) => {
        const r = el.getBoundingClientRect();
        const t = (el as HTMLElement).dataset?.turn;
        let turnY = NaN;
        if (t === "top") {
          const sec = el.closest("section, article");
          if (sec) turnY = sec.getBoundingClientRect().top + sy + 24;
        } else if (t != null && t !== "") turnY = r.top + r.height / 2 + sy - Number(t);
        return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, turnY };
      }).sort((a, b) => a.y - b.y);

      // Smooth routing: vertical runs joined by S-curves (vertical tangents at both ends).
      // Geometry is measured here directly (fast) — never with getPointAtLength (very slow).
      samples = [{ l: 0, x: pts[0].x, y: pts[0].y }];
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
        const x0 = cx, y0 = cy;
        const N = 40;
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
        if (Math.abs(dx) < 2) { lineTo(p.x, n.y); continue; }
        const gap = n.y - p.y;
        let ty = Number.isFinite(n.turnY) ? n.turnY : p.y + gap / 2;
        ty = Math.min(n.y - 1, Math.max(p.y + 1, ty));
        // Half-height of the S-curve: longer sideways moves get gentler, taller curves.
        const want = Math.min(180, Math.max(70, Math.abs(dx) * 0.16));
        const h = Math.max(1, Math.min(want, ty - p.y, n.y - ty));
        const y0 = ty - h, y1 = ty + h;
        lineTo(p.x, y0);
        curveTo(p.x, y0 + h * 1.1, n.x, y1 - h * 1.1, n.x, y1);
        lineTo(n.x, n.y);
      }
      total = len;
      path2d = new Path2D(d);

      lights = Array.from(document.querySelectorAll<HTMLElement>(".sec-light, [data-theme='light']")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + sy, bottom: r.bottom + sy };
      }).sort((a, b) => a.top - b.top);

      target = reduce ? total : lengthAtY(sy + vh * 0.7);
      if (lastScroll < 0) cur = target; // first paint: no catch-up animation
      lastScroll = sy;
      draw();
    };

    // samples are non-decreasing in y
    const lengthAtY = (y: number) => {
      if (!samples.length) return 0;
      if (y <= samples[0].y) return 0;
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (samples[mid].y <= y) lo = mid; else hi = mid - 1; }
      const a = samples[lo], b = samples[Math.min(lo + 1, samples.length - 1)];
      if (b.y === a.y) return b.l;
      return a.l + (b.l - a.l) * Math.min(1, (y - a.y) / (b.y - a.y));
    };
    const pointAt = (l: number) => {
      let lo = 0, hi = samples.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (samples[mid].l <= l) lo = mid; else hi = mid - 1; }
      const a = samples[lo], b = samples[Math.min(lo + 1, samples.length - 1)];
      const t = b.l === a.l ? 0 : (l - a.l) / (b.l - a.l);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!path2d || cur <= 0) return;
      const sy = window.scrollY, sx = window.scrollX;
      const top = sy, bottom = sy + vh;
      ctx.setTransform(dpr, 0, 0, dpr, -sx * dpr, -sy * dpr);
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([cur, total + 100]);

      // Split the visible area into light/dark bands and stroke each in its colour.
      let y = top;
      const bands: { y0: number; y1: number; light: boolean }[] = [];
      for (const l of lights) {
        if (l.bottom <= y || l.top >= bottom) continue;
        if (l.top > y) bands.push({ y0: y, y1: l.top, light: false });
        bands.push({ y0: Math.max(y, l.top), y1: Math.min(bottom, l.bottom), light: true });
        y = Math.min(bottom, l.bottom);
      }
      if (y < bottom) bands.push({ y0: y, y1: bottom, light: false });
      for (const b of bands) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx, b.y0, vw, b.y1 - b.y0);
        ctx.clip();
        ctx.strokeStyle = b.light ? INK : VOLT;
        ctx.stroke(path2d);
        ctx.restore();
      }

      // Glowing head while the line is still drawing.
      if (!reduce && cur < total - 1) {
        const pt = pointAt(cur);
        if (pt.y >= top - 20 && pt.y <= bottom + 20) {
          const onLight = lights.some((l) => pt.y >= l.top && pt.y <= l.bottom);
          ctx.setLineDash([]);
          ctx.fillStyle = onLight ? INK : VOLT;
          ctx.shadowColor = onLight ? "rgba(8,8,8,.35)" : "rgba(215,255,63,.75)";
          ctx.shadowBlur = 14;
          ctx.fillRect(pt.x - 4.5, pt.y - 4.5, 9, 9);
          ctx.shadowBlur = 0;
        }
      }
    };

    const tick = () => {
      raf = 0;
      const sy = window.scrollY;
      if (!reduce) target = lengthAtY(sy + vh * 0.7);
      const diff = target - cur;
      cur = Math.abs(diff) < 0.3 ? target : cur + diff * 0.2;
      draw();
      if (cur !== target || sy !== lastScroll) { lastScroll = sy; raf = requestAnimationFrame(tick); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    // With Lenis, draw synchronously inside its scroll callback so the line and the
    // page move in the same frame (no one-frame lag / jitter).
    type L = { on: (e: string, cb: () => void) => () => void };
    let lenisOff: (() => void) | null = null;
    const attachLenis = () => {
      const lenis = (window as unknown as { __lenis?: L }).__lenis;
      if (!lenis || lenisOff) return;
      lenisOff = lenis.on("scroll", () => {
        const sy = window.scrollY;
        if (!reduce) target = lengthAtY(sy + vh * 0.7);
        const diff = target - cur;
        cur = Math.abs(diff) < 0.3 ? target : cur + diff * 0.2;
        lastScroll = sy;
        draw();
        if (cur !== target) kick();
      });
    };
    const onScroll = () => { if (!lenisOff) kick(); };
    window.addEventListener("lenisready", attachLenis);
    attachLenis();

    let t = 0, lastW = 0, lastH = 0;
    const rebuild = () => { window.clearTimeout(t); t = window.setTimeout(build, 150); };
    const onBodyResize = () => {
      const w = document.documentElement.scrollWidth, h = document.documentElement.scrollHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h;
      rebuild();
    };
    const ro = new ResizeObserver(onBodyResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    window.addEventListener("load", rebuild);
    document.fonts?.ready.then(rebuild);
    build();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("lenisready", attachLenis);
      lenisOff?.();
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("load", rebuild);
    };
  }, []);

  return <canvas ref={canvasRef} className="dataline" aria-hidden="true" />;
}
