"use client";
import { useEffect } from "react";
import { Mark } from "./Mark";
import { WordmarkText } from "./Wordmark";
import { ART, ASSET_DIR, DECK_LINE, EDGE, GLOW, JOINT, LAYERS, LOWER, MASK, PIECE, PLATE } from "@/lib/introAssets";

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
 *  3.0–3.75 s  behind it all, a "Databridge" signature has been writing itself since the
 *              start (the ink appears behind a pen moving along the letters' centre line);
 *              as the screen lifts, its underline swash runs on as a lime line into the
 *              hero's lime square — where the page's data line begins — then fades.
 *
 * A soft violet glow (from the bridge's own silhouette) breathes in once the structure
 * stands and swells at contact; one glossy sheen sweeps across it with the highlight.
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
    // The signature's last stroke runs on into the hero's lime square (the data line's start).
    const tail = () => {
      if (html.classList.contains("intro-done")) return;
      const sig = document.querySelector<SVGSVGElement>(".ld-sig");
      const svg = document.querySelector<SVGSVGElement>(".ld-tail");
      const stop = document.querySelector<HTMLElement>(".hero-title .stop");
      const ctm = sig?.getScreenCTM();
      const end = sig?.dataset.end?.split(" ").map(Number);
      if (!sig || !svg || !stop || !ctm || !end || end.length !== 2) return;
      const a = new DOMPoint(end[0], end[1]).matrixTransform(ctm);
      const r = stop.getBoundingClientRect();
      const b = { x: r.left + r.width * 0.15, y: r.top + r.height / 2 };
      const vw = window.innerWidth, vh = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = `M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${(a.x + Math.max(60, Math.abs(dx) * 0.35)).toFixed(1)} ${(a.y + Math.abs(dy) * 0.2 + 40).toFixed(1)} ${(b.x + Math.max(90, Math.abs(dx) * 0.45)).toFixed(1)} ${(b.y + 6).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      svg.querySelector("path")?.setAttribute("d", d);
      html.classList.add("ld-tailing");
      window.setTimeout(() => stop.classList.add("is-hit"), 380);
      window.setTimeout(() => html.classList.remove("ld-tailing"), 1000);
    };
    const onStart = (e: AnimationEvent) => { if (e.target === panel && e.animationName === "ldLift") { tail(); fly(); } };
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
      <div className="ld-bg" aria-hidden="true" />
      {/* the signature (public/intro/signature.svg) is inserted here by the boot script */}
      <div className="ld-sigwrap" aria-hidden="true" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} />
      <div className="ld-panel" aria-hidden="true">
        <div className="ld-stage">
          <div className="ld-cam" style={{ transformOrigin: `${(EDGE.x / ART.w) * 100}% ${(EDGE.y / ART.h) * 100}%` }}>
            <div className="ld-art ld-plate" style={art(PLATE.id, PLATE.box)} />
            <div className="ld-art ld-glow" style={art(GLOW.id, GLOW.box)} />
            {LAYERS.map((l) => <div key={l.id} className={`ld-art ld-${l.kind} ld-${l.id}`} style={art(l.id, l.box)} />)}
            <div className="ld-art ld-joint" style={art(JOINT.id, JOINT.box)} />
            <div
              className="ld-art ld-piece"
              style={art(PIECE.id, PIECE.box, {
                "--lower": `translate(${((LOWER.dx / PIECE.box.w) * 100).toFixed(2)}%, ${((LOWER.dy / PIECE.box.h) * 100).toFixed(2)}%) scale(${LOWER.scale})`,
              } as React.CSSProperties)}
            />
            <div className="ld-sheen" style={{ "--mask": `url(${ASSET_DIR}/${MASK.id}.webp)` } as React.CSSProperties} />
            <svg className="ld-glint" viewBox={`0 0 ${ART.w} ${ART.h}`} preserveAspectRatio="none" focusable="false">
              <polyline points={DECK_LINE} pathLength={1} />
            </svg>
          </div>
        </div>
      </div>
      <svg className="ld-tail" aria-hidden="true" focusable="false"><path pathLength={1} /></svg>
      <div className="ld-id" aria-hidden="true">
        <span className="wm-mark"><Mark /></span>
        <WordmarkText />
      </div>
      <button type="button" className="ld-skip mono-sm">Skip intro <span aria-hidden="true">→</span></button>
    </div>
  );
}
