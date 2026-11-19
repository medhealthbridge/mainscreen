"use client";
import { useEffect } from "react";
import { Mark } from "./Mark";
import { WordmarkText } from "./Wordmark";
import { BIG, VIEWBOX, camera, groundY, key, left, piers, right, signalX, signalY, type Piece } from "@/lib/bridgeScene";

/**
 * FIRST-VISIT LOADING SCREEN (≈3.3 s, once per browser session, direct home visits).
 *
 *  0.0–0.5 s  two low ivory piers rise; still camera, quiet near-black canvas.
 *  0.5–1.6 s  three broad deck segments per side glide inward with a slight stagger and
 *             settle firmly, leaving one stepped opening in the middle. Hold.
 *  1.6–2.1 s  the lime key lowers into the opening and seats; at that instant one crisp
 *             lime signal crosses the deck from the left pier to the right.
 *  2.1–2.95 s the view tilts down onto the joint until the key *is* the band of the
 *             DataBridge symbol (identical stepped outline); the D grows out around it,
 *             settles beside DATA—BRIDGE, and the identity holds.
 *  2.95–3.3 s the black screen lifts away onto LOOK SHARP. WORK SMARTER. Desktop: the
 *             lockup settles into the header. Phones: it dissolves into the header logo.
 *
 * Everything up to the lift is CSS animation from the first painted frame (globals.css,
 * "Loading screen"), so it runs while the home page loads underneath and never waits on
 * hydration. The skip control, Escape, scroll gestures and a hard 5 s timeout are wired
 * by the inline script in layout.tsx, so nobody can be stranded on this screen. This
 * component only adds the desktop settle into the header (it needs real measurements).
 */
export function BrandIntro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro") || html.classList.contains("intro-done")) return;
    const done = () => (window as unknown as { __dbIntroDone?: () => void }).__dbIntroDone?.();
    const ld = document.querySelector<HTMLElement>(".ld");
    const panel = ld?.querySelector<HTMLElement>(".ld-panel");
    const id = ld?.querySelector<HTMLElement>(".ld-id");
    if (!ld || !panel || !id) return;

    // Exact lockup width with the real fonts (the CSS carries a measured default).
    const measure = () => {
      const em = parseFloat(getComputedStyle(id).fontSize);
      if (em > 0) id.style.setProperty("--lw-n", (id.scrollWidth / em).toFixed(4));
    };
    document.fonts?.ready.then(measure);

    let flying = false;
    const fly = () => {
      if (html.classList.contains("intro-done") || window.innerWidth < 761) return;
      const target = document.querySelector<HTMLElement>(".site-header .wm-mark");
      const sym = id.querySelector<HTMLElement>(".wm-mark");
      if (!target || !sym) return;
      const from = sym.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const I = id.getBoundingClientRect();
      const s = to.width / from.width;
      const dx = to.left - I.left - s * (from.left - I.left);
      const dy = to.top - I.top - s * (from.top - I.top);
      flying = true;
      html.classList.add("ld-fly");
      const a = id.animate(
        [{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
        { duration: 400, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      a.onfinish = done;
      a.oncancel = done;
    };
    const onStart = (e: AnimationEvent) => { if (e.target === panel && e.animationName === "ldLift") fly(); };
    const onEnd = (e: AnimationEvent) => { if (e.target === panel && e.animationName === "ldLift" && !flying) done(); };
    panel.addEventListener("animationstart", onStart);
    panel.addEventListener("animationend", onEnd);
    // Hydrated after the lift already started? The CSS dissolve and timeout finish the job.
    return () => {
      panel.removeEventListener("animationstart", onStart);
      panel.removeEventListener("animationend", onEnd);
    };
  }, []);

  const seg = (p: Piece, side: "l" | "r", i: number) => (
    <g key={p.id} className={`ld-seg ld-${side}`} style={{ "--i": i } as React.CSSProperties}>
      {p.faces.map((f, k) => <polygon key={k} className={`ld-${f.tone}`} points={f.pts} />)}
    </g>
  );

  return (
    <div className="ld" hidden>
      <div className="ld-panel" aria-hidden="true">
        <div className="ld-stage">
          <svg viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`} focusable="false">
            <g className="ld-cam" style={{ "--cam": camera } as React.CSSProperties}>
              <line className="ld-ground" x1={VIEWBOX.x} x2={VIEWBOX.x + VIEWBOX.w} y1={groundY} y2={groundY} />
              {piers.map((p, i) => (
                <g key={p.id} className="ld-pier" style={{ "--i": i } as React.CSSProperties}>
                  {p.faces.map((f, k) => <polygon key={k} className={`ld-${f.tone}`} points={f.pts} />)}
                </g>
              ))}
              {left.map((p, i) => seg(p, "l", i))}
              {right.slice(0, 2).map((p, i) => seg(p, "r", i))}
              <g className="ld-key">
                {key.fronts.map((f, k) => <polygon key={k} className="ld-key-front" points={f} />)}
                <polygon className="ld-key-top" points={key.top} />
                <polygon className="ld-key-flash" points={key.top} />
              </g>
              {seg(right[2], "r", 2)}
              <line className="ld-trace" x1={signalX[0]} x2={signalX[1]} y1={signalY} y2={signalY} pathLength={1} />
              <g className="ld-signal">
                <rect x={signalX[0] - 7} y={signalY - 1.1} width={14} height={2.2} rx={1.1} />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div className="ld-id" aria-hidden="true" style={{ "--big": BIG } as React.CSSProperties}>
        <span className="wm-mark"><Mark /></span>
        <WordmarkText />
      </div>
      <button type="button" className="ld-skip mono-sm">Skip intro <span aria-hidden="true">→</span></button>
    </div>
  );
}
