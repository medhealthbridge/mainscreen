"use client";
import { useEffect } from "react";
import { Mark } from "./Mark";
import { WordmarkText } from "./Wordmark";
import { ART, ASSET_DIR, DECK_LINE, EDGE, JOINT, LAYERS, LOWER, PIECE, PLATE } from "@/lib/introAssets";

/**
 * FIRST-VISIT INTRO (≈3.2 s, once per browser session, direct home visits only).
 * Built from the supplied bridge renders (see src/lib/introAssets.ts) — no redrawn bridge.
 *
 *  0.0–1.2 s   soft-edged masks reveal the artwork in reading order: left pylon from its
 *              base up, its cable fan and half of the deck toward the centre, then the
 *              right pylon and its half.
 *  1.2–1.32 s  hold on the open joint; the lime piece is there, waiting above it.
 *  1.32–1.87 s the piece lowers (550 ms) and eases into a precise stop; on contact the
 *              seated joint from the closed render takes over (nothing else moves).
 *  1.93–2.28 s one fine lime highlight runs along the deck.
 *  2.22–2.9 s  desktop: the view closes in on the seated piece's stepped edge and
 *              match-cuts to the same step in the DataBridge symbol, which settles beside
 *              DATA—BRIDGE. Phones keep the camera still and match-cut in place.
 *  2.9–3.2 s   the black screen lifts onto the home page; desktop settles the lockup
 *              into the header, phones dissolve into it.
 *
 * The decision to play, the preload gate (the intro only starts once the artwork is
 * decoded; if it is slow, the site is shown instead), the match-cut numbers, Skip intro,
 * Escape and a hard timeout all live in the inline script in layout.tsx so they work
 * before hydration. The timeline itself is CSS (globals.css, "Intro"). This component
 * only adds the desktop settle into the header, which needs real measurements.
 */
const pct = (b: { x: number; y: number; w: number; h: number }) => ({
  left: `${(b.x / ART.w) * 100}%`,
  top: `${(b.y / ART.h) * 100}%`,
  width: `${(b.w / ART.w) * 100}%`,
  height: `${(b.h / ART.h) * 100}%`,
});
const art = (id: string, b: { x: number; y: number; w: number; h: number }, extra: React.CSSProperties = {}) =>
  ({ ...pct(b), "--src": `url(${ASSET_DIR}/${id}.webp)`, ...extra }) as React.CSSProperties;

export function BrandIntro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro") || html.classList.contains("intro-done")) return;
    const done = () => (window as unknown as { __dbIntroDone?: () => void }).__dbIntroDone?.();
    const panel = document.querySelector<HTMLElement>(".ld-panel");
    const id = document.querySelector<HTMLElement>(".ld-id");
    if (!panel || !id) return;
    let flying = false;
    const fly = () => {
      if (html.classList.contains("intro-done") || !html.classList.contains("ld-zoom")) return;
      const target = document.querySelector<HTMLElement>(".site-header .wm-mark");
      const sym = id.querySelector<HTMLElement>(".wm-mark");
      if (!target || !sym) return;
      const from = sym.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const I = id.getBoundingClientRect();
      const s = to.width / from.width;
      flying = true;
      html.classList.add("ld-fly");
      const a = id.animate(
        [{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${to.left - I.left - s * (from.left - I.left)}px, ${to.top - I.top - s * (from.top - I.top)}px) scale(${s})` }],
        { duration: 380, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      );
      a.onfinish = done;
      a.oncancel = done;
    };
    const onStart = (e: AnimationEvent) => { if (e.target === panel && e.animationName === "ldLift") fly(); };
    const onEnd = (e: AnimationEvent) => { if (e.target === panel && e.animationName === "ldLift" && !flying) done(); };
    panel.addEventListener("animationstart", onStart);
    panel.addEventListener("animationend", onEnd);
    return () => {
      panel.removeEventListener("animationstart", onStart);
      panel.removeEventListener("animationend", onEnd);
    };
  }, []);

  return (
    <div className="ld" hidden>
      <div className="ld-panel" aria-hidden="true">
        <div className="ld-stage">
          <div className="ld-cam" style={{ transformOrigin: `${(EDGE.x / ART.w) * 100}% ${(EDGE.y / ART.h) * 100}%` }}>
            <div className="ld-art ld-plate" style={art(PLATE.id, PLATE.box)} />
            {LAYERS.map((l) => <div key={l.id} className={`ld-art ld-${l.kind}`} style={art(l.id, l.box)} />)}
            <div className="ld-art ld-joint" style={art(JOINT.id, JOINT.box)} />
            <div
              className="ld-art ld-piece"
              style={art(PIECE.id, PIECE.box, {
                "--lower": `translate(${((LOWER.dx / PIECE.box.w) * 100).toFixed(2)}%, ${((LOWER.dy / PIECE.box.h) * 100).toFixed(2)}%) scale(${LOWER.scale})`,
              } as React.CSSProperties)}
            />
            <svg className="ld-glint" viewBox={`0 0 ${ART.w} ${ART.h}`} preserveAspectRatio="none" focusable="false">
              <polyline points={DECK_LINE} pathLength={1} />
            </svg>
          </div>
        </div>
      </div>
      <div className="ld-id" aria-hidden="true">
        <span className="wm-mark"><Mark /></span>
        <WordmarkText />
      </div>
      <button type="button" className="ld-skip mono-sm">Skip intro <span aria-hidden="true">→</span></button>
    </div>
  );
}
