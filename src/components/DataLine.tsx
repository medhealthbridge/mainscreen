"use client";
import { useEffect, useRef } from "react";

/**
 * THE DATA LINE — one continuous line that starts at the hero's accent block and
 * draws itself down the page as you scroll, routed through every [data-line]
 * anchor with rounded right-angle turns. Volt over dark sections, ink over light.
 * Purely decorative (aria-hidden, pointer-events: none). Reduced motion: drawn in full.
 *
 * Anchors: add data-line to any element. Optional data-turn sets where the horizontal run
 * into that anchor happens: "<px>" above the anchor, or "top" = just inside the top of its
 * section (empty padding). Default: halfway between anchors.
 */
export function DataLine() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const volt = svg.querySelector<SVGPathElement>(".dl-volt")!;
    const ink = svg.querySelector<SVGPathElement>(".dl-ink")!;
    const head = svg.querySelector<SVGRectElement>(".dl-head")!;
    const lightClip = svg.querySelector<SVGClipPathElement>("#dl-light")!;
    const darkMask = svg.querySelector<SVGMaskElement>("#dl-dark")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let total = 0;
    let samples: { l: number; y: number; x: number }[] = [];
    let lights: { top: number; bottom: number }[] = [];
    let cur = 0, target = 0, raf = 0, built = false;

    const build = () => {
      const sx = window.scrollX, sy = window.scrollY;
      const W = document.documentElement.scrollWidth;
      const H = document.documentElement.scrollHeight;
      svg.setAttribute("width", String(W));
      svg.setAttribute("height", String(H));
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      const anchors = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[data-line-start], [data-line]")).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 || r.height > 0;
      });
      if (anchors.length < 2) { volt.setAttribute("d", ""); ink.setAttribute("d", ""); return; }
      const pts = anchors.map((el) => {
        const r = el.getBoundingClientRect();
        const turnAttr = (el as HTMLElement).dataset?.turn;
        let turnY = NaN;
        if (turnAttr === "top") {
          const sec = el.closest("section, article");
          if (sec) turnY = sec.getBoundingClientRect().top + sy + 44;
        } else if (turnAttr != null && turnAttr !== "") turnY = r.top + r.height / 2 + sy - Number(turnAttr);
        return { x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, turnY };
      });
      // Sort by vertical position so the line always travels down the page.
      pts.sort((a, b) => a.y - b.y);

      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1], n = pts[i];
        if (Math.abs(p.x - n.x) < 2) { d += ` V${n.y.toFixed(1)}`; continue; }
        const gap = n.y - p.y;
        const ty = Number.isFinite(n.turnY) ? Math.min(n.y, Math.max(p.y + 20, n.turnY)) : p.y + gap / 2;
        const dir = n.x > p.x ? 1 : -1;
        const r = Math.max(0, Math.min(28, (ty - p.y) / 2, (n.y - ty) / 2, Math.abs(n.x - p.x) / 2));
        d += ` V${(ty - r).toFixed(1)}`;
        d += ` Q${p.x.toFixed(1)} ${ty.toFixed(1)} ${(p.x + dir * r).toFixed(1)} ${ty.toFixed(1)}`;
        d += ` H${(n.x - dir * r).toFixed(1)}`;
        d += ` Q${n.x.toFixed(1)} ${ty.toFixed(1)} ${n.x.toFixed(1)} ${(ty + r).toFixed(1)}`;
        d += ` V${n.y.toFixed(1)}`;
      }
      volt.setAttribute("d", d);
      ink.setAttribute("d", d);
      total = volt.getTotalLength();
      samples = [];
      for (let l = 0; l <= total; l += 6) { const pt = volt.getPointAtLength(l); samples.push({ l, x: pt.x, y: pt.y }); }

      // Light-section masks so the line reads on both backgrounds.
      lights = Array.from(document.querySelectorAll<HTMLElement>(".sec-light, [data-theme='light']")).map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top + sy, bottom: r.bottom + sy };
      });
      const rects = lights.map((l) => `<rect x="0" y="${l.top}" width="${W}" height="${l.bottom - l.top}"/>`).join("");
      lightClip.innerHTML = rects;
      darkMask.innerHTML = `<rect x="0" y="0" width="${W}" height="${H}" fill="white"/>` + lights.map((l) => `<rect x="0" y="${l.top}" width="${W}" height="${l.bottom - l.top}" fill="black"/>`).join("");

      [volt, ink].forEach((p) => { p.style.strokeDasharray = `${total} ${total}`; });
      built = true;
      if (reduce) { cur = target = total; paint(); }
      else update(true);
    };

    const lengthAtY = (y: number) => {
      if (!samples.length) return 0;
      let lo = 0, hi = samples.length - 1, best = 0;
      // samples are non-decreasing in y
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (samples[mid].y <= y) { best = mid; lo = mid + 1; } else hi = mid - 1;
      }
      return samples[best].l;
    };

    const paint = () => {
      const off = Math.max(0, total - cur);
      volt.style.strokeDashoffset = String(off);
      ink.style.strokeDashoffset = String(off);
      const pt = cur > 0 ? volt.getPointAtLength(Math.min(cur, total)) : null;
      if (pt && !reduce) {
        head.setAttribute("x", String(pt.x - 5));
        head.setAttribute("y", String(pt.y - 5));
        head.style.opacity = cur < total - 1 ? "1" : "0";
        const onLight = lights.some((l) => pt.y >= l.top && pt.y <= l.bottom);
        head.classList.toggle("on-light", onLight);
      } else head.style.opacity = "0";
    };

    const tick = () => {
      raf = 0;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.5) cur = target;
      paint();
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const update = (instant = false) => {
      if (!built || reduce) return;
      target = lengthAtY(window.scrollY + window.innerHeight * 0.72);
      if (instant) { cur = target; paint(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let t = 0;
    const rebuild = () => { window.clearTimeout(t); t = window.setTimeout(build, 120); };
    const onScroll = () => update();
    const ro = new ResizeObserver(rebuild);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", rebuild);
    document.fonts?.ready.then(rebuild);
    window.addEventListener("load", rebuild);
    build();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", rebuild);
      window.removeEventListener("load", rebuild);
    };
  }, []);

  return (
    <svg ref={svgRef} className="dataline" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="dl-light" />
        <mask id="dl-dark" maskUnits="userSpaceOnUse" />
        <filter id="dl-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path className="dl-volt" mask="url(#dl-dark)" />
      <path className="dl-ink" clipPath="url(#dl-light)" />
      <rect className="dl-head" width="10" height="10" filter="url(#dl-glow)" />
    </svg>
  );
}
