"use client";
import { useEffect, useRef } from "react";

/**
 * Hero art direction: in the free space beside the second headline line, three loose
 * nodes (ideas) branch together into one path that lands on the headline's lime square —
 * "disconnected ideas become connected". Drawn with SVG, sized from the real text layout,
 * hidden when there isn't room (phones, narrow tablets). Decorative only.
 */
export function HeroDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const hero = svg?.closest(".hero") as HTMLElement | null;
    if (!svg || !hero) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let played = false;

    const layout = () => {
      const title = hero.querySelector<HTMLElement>(".hero-title");
      const stop = hero.querySelector<HTMLElement>(".stop");
      const lines = hero.querySelectorAll<HTMLElement>(".hero-title .ml");
      if (!title || !stop || lines.length < 2) return;
      const H = hero.getBoundingClientRect();
      const T = title.getBoundingClientRect();
      // The free area: right of the lime square, spanning the last two headline lines.
      // The square animates in from scale(0): use its centre plus its layout size.
      const sr = stop.getBoundingClientRect();
      const half = stop.offsetWidth / 2, cxS = sr.left + sr.width / 2, cyS = sr.top + sr.height / 2;
      const S = { left: cxS - half, right: cxS + half, top: cyS - half, bottom: cyS + half, width: half * 2, height: half * 2 };
      const line2 = lines[1].getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const words2 = Array.from(lines[1].querySelectorAll<HTMLElement>(".w"));
      const word2Right = words2.length ? words2[words2.length - 1].getBoundingClientRect().right : line2.left;
      const left = Math.max(S.right + fs * 0.45, word2Right + fs * 0.45);
      const right = Math.min(T.right, H.right - 24);
      const top = line2.top + fs * 0.1;
      const bottom = S.bottom;
      const w = right - left, h = bottom - top;
      const ok = w > 200 && h > 100 && window.innerWidth >= 760;
      svg.style.display = ok ? "" : "none";
      if (!ok) return;

      const ox = H.left, oy = H.top;
      const sx = S.right - ox, sy = S.top + S.height / 2 - oy; // enter the square from the right
      const L = left - ox, R = right - ox, Tp = top - oy, B = bottom - oy;
      const inputs = [
        { x: L + w * 0.30, y: Tp + h * 0.06, label: "NOTES" },
        { x: L + w * 0.62, y: Tp + h * 0.24, label: "INBOX" },
        { x: L + w * 0.90, y: Tp + h * 0.04, label: "SHEETS" },
      ].map((p) => ({ ...p, x: Math.min(p.x, R - 52) }));
      const jx = L + w * 0.16;
      const jy = sy;
      // Inputs drop and bend into the junction; the junction runs straight into the square.
      const curve = (x0: number, y0: number, x1: number, y1: number) =>
        `M${x0.toFixed(1)} ${y0.toFixed(1)} C${x0.toFixed(1)} ${(y0 + (y1 - y0) * 0.9).toFixed(1)} ${(x1 + (x0 - x1) * 0.35).toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      void B;
      svg.setAttribute("viewBox", `0 0 ${H.width} ${H.height}`);
      svg.setAttribute("width", String(H.width));
      svg.setAttribute("height", String(H.height));
      const branch = inputs.map((p) => `<path class="hd-path" pathLength="1" d="${curve(p.x, p.y + 5, jx + 5, jy)}"/>`).join("");
      const out = `<path class="hd-path hd-out" pathLength="1" d="M${(jx - 5).toFixed(1)} ${jy.toFixed(1)} L${(sx + 3).toFixed(1)} ${sy.toFixed(1)}"/>`;
      const nodes = inputs.map((p, i) => `<rect class="hd-node" style="--i:${i}" x="${(p.x - 4).toFixed(1)}" y="${(p.y - 4).toFixed(1)}" width="8" height="8"/><text class="hd-label" style="--i:${i}" x="${(p.x + 10).toFixed(1)}" y="${(p.y + 3.5).toFixed(1)}">${p.label}</text>`).join("");
      const junction = `<rect class="hd-junction" x="${(jx - 5).toFixed(1)}" y="${(jy - 5).toFixed(1)}" width="10" height="10"/>`;
      svg.innerHTML = branch + out + nodes + junction + `<rect class="hd-signal" width="6" height="6" x="-10" y="-10"/>`;
      if (played || reduce) svg.classList.add("is-drawn");
    };

    const playSignal = () => {
      const sig = svg.querySelector<SVGRectElement>(".hd-signal");
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".hd-path"));
      if (!sig || paths.length < 4 || reduce) return;
      // Travel: first input → junction → stop square. Few samples only (cheap).
      const route = [paths[0], paths[3]];
      const pts: { x: number; y: number }[] = [];
      route.forEach((p) => { const L = p.getTotalLength(); for (let k = 0; k <= 24; k++) { const q = p.getPointAtLength((L * k) / 24); pts.push({ x: q.x, y: q.y }); } });
      const t0 = performance.now(), dur = 900;
      const step = (t: number) => {
        const u = Math.min(1, (t - t0) / dur);
        const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        const f = e * (pts.length - 1), i = Math.floor(f), r = f - i;
        const a = pts[i], b = pts[Math.min(i + 1, pts.length - 1)];
        sig.setAttribute("x", (a.x + (b.x - a.x) * r - 3).toFixed(1));
        sig.setAttribute("y", (a.y + (b.y - a.y) * r - 3).toFixed(1));
        sig.style.opacity = u < 0.95 ? "1" : String((1 - u) * 20);
        if (u < 1) requestAnimationFrame(step);
        else hero.querySelector(".stop")?.classList.add("is-hit");
      };
      requestAnimationFrame(step);
    };

    const start = () => {
      layout();
      if (svg.style.display === "none" || played) return;
      played = true;
      requestAnimationFrame(() => svg.classList.add("is-drawn"));
      window.setTimeout(playSignal, 1100);
    };
    // Wait for the brand intro (if any) so motions don't compete.
    const introOn = document.documentElement.classList.contains("intro");
    const t = window.setTimeout(start, introOn ? 1700 : 450);
    let r = 0;
    const onResize = () => { window.clearTimeout(r); r = window.setTimeout(layout, 120); };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(layout);
    // Re-measure when the headline's entrance animation finishes (positions were mid-rise).
    const onAnimEnd = (e: AnimationEvent) => { if ((e.target as Element | null)?.closest?.(".hero-title")) onResize(); };
    hero.addEventListener("animationend", onAnimEnd);
    return () => { window.clearTimeout(t); window.removeEventListener("resize", onResize); hero.removeEventListener("animationend", onAnimEnd); };
  }, []);

  return <svg ref={svgRef} className="hero-diagram" aria-hidden="true" focusable="false" />;
}
