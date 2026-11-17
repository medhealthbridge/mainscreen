"use client";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";

/**
 * THE BRAND ENTRANCE (≈950 ms, once per browser session).
 *
 * Two lime endpoints appear → a fine connector draws between them → one signal crosses →
 * the connector resolves into the dash of DATA—BRIDGE → the words open out from the
 * dash → the wordmark settles into the header. The hero's lime square then takes over.
 *
 * Whether it plays is decided before first paint by a tiny inline script (adds
 * `html.intro`): first visit this session, home page, no #deep-link, motion allowed.
 * The real page is already rendered and interactive underneath — this layer is
 * transparent, aria-hidden and pointer-events: none. Any interaction fast-forwards it.
 */
export function BrandIntro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.classList.contains("intro")) return;
    try { sessionStorage.setItem("db-intro", "1"); } catch {}

    const q = <T extends Element>(s: string) => el.querySelector(s) as T;
    const mark = q<HTMLElement>(".bi-mark");
    const left = q<HTMLElement>(".bi-a");
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
    // Steps 1–5 run as CSS animations from first paint (see globals.css), so they stay
    // in sync with the hero headline even before this script hydrates.
    const introAnims = () => el.getAnimations({ subtree: true });
    const a = (n: Element, k: Keyframe[], o: KeyframeAnimationOptions) => n.animate(k, { fill: "both", ...o });

    // 6 · settle into the header wordmark (FLIP), then hand over.
    const target = document.querySelector<HTMLElement>(".site-header .wordmark");
    const settle = () => {
      if (!target) return finish();
      // Map the intro's "DATA" exactly onto the header's "DATA" (transform-origin: 0 0).
      const M = mark.getBoundingClientRect();
      const from = left.getBoundingClientRect();
      const to = (target.firstElementChild as HTMLElement | null)?.getBoundingClientRect() ?? target.getBoundingClientRect();
      const s = to.height / from.height;
      const dx = to.left - M.left - s * (from.left - M.left);
      const dy = to.top - M.top - s * (from.top - M.top);
      const fly = a(mark, [{ transform: "translate(0,0) scale(1)" }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }], { duration: 260, easing: EASE });
      fly.onfinish = finish;
    };
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      html.classList.add("intro-done");
      window.dispatchEvent(new Event("db:intro-done"));
      window.setTimeout(() => el.remove(), 50);
    };
    // Hand over ~900 ms after first paint (when the CSS sequence started).
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? performance.now();
    const t = window.setTimeout(settle, Math.max(0, fcp + 900 - performance.now()));

    // Any interaction: finish quickly instead of making the visitor wait.
    const hurry = () => {
      introAnims().forEach((x) => { try { x.playbackRate = 6; } catch {} });
      window.clearTimeout(t);
      window.setTimeout(settle, 120);
      off();
    };
    const evs = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const off = () => evs.forEach((e) => window.removeEventListener(e, hurry));
    evs.forEach((e) => window.addEventListener(e, hurry, { passive: true, once: true }));
    // Safety net: never leave the overlay behind.
    const safety = window.setTimeout(finish, 2200);

    return () => { window.clearTimeout(t); window.clearTimeout(safety); off(); };
  }, []);

  const [a, b] = site.wordmark;
  return (
    <div ref={root} className="brand-intro" aria-hidden="true">
      <div className="bi-mark">
        <span className="bi-a">{a}</span>
        <span className="bi-bridge">
          <span className="bi-end bi-end-1" />
          <span className="bi-wire" />
          <span className="bi-signal" />
          <span className="bi-dash" />
          <span className="bi-end bi-end-2" />
        </span>
        <span className="bi-b">{b}</span>
      </div>
    </div>
  );
}
