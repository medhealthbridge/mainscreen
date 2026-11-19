"use client";
import { useEffect } from "react";

/**
 * THE SIGNATURE ENTRANCE (once per browser session, home page only).
 *
 * The header's own symbol performs it — there is no overlay and no duplicate logo,
 * so the last frame *is* the header lockup.
 *
 *  0–300 ms    the two cut pieces sit slightly apart along the step's diagonal
 *              (upper piece up-right, lower piece down-left) and drift a hair closer.
 *  300–560 ms  they slide together along that diagonal and decelerate into register;
 *              the stepped gap closes and the D/B reads. Brief stillness.
 *  650–1050 ms wide screens: the finished symbol (staged large in the free space beside
 *              the first headline line) rises into the gap under the header and glides
 *              into its slot; DATABRIDGE is unmasked as it lands.
 *
 * Small or short screens run the same assembly inside the logo's own footprint and
 * then unmask the word (≈850 ms in all).
 *
 * Whether it plays is decided before first paint by the inline script in layout.tsx
 * (adds `html.intro`): first visit this session, path "/", no #hash, motion allowed.
 * The page stays readable and interactive throughout: scrolling, tapping, a key press
 * or opening the menu settles the logo at once.
 */
export function BrandIntro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("intro") || html.classList.contains("intro-done")) return;
    try { sessionStorage.setItem("db-intro", "1"); } catch {}

    const link = document.querySelector<HTMLElement>(".site-header .wordmark");
    const box = link?.querySelector<HTMLElement>(".wm-mark");
    const word = link?.querySelector<HTMLElement>(".wm-word > span");
    const pa = link?.querySelector<SVGElement>(".mk-a");
    const pb = link?.querySelector<SVGElement>(".mk-b");

    const anims: Animation[] = [];
    const timers: number[] = [];
    let done = false;
    const evs = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    const off = () => evs.forEach((e) => window.removeEventListener(e, finish));
    const stop = () => {
      off();
      timers.forEach((t) => window.clearTimeout(t));
      anims.forEach((a) => a.cancel()); // the resting state *is* the final frame
      link?.classList.remove("is-assembling");
      html.classList.remove("intro-run");
    };
    function finish() {
      if (done) return;
      done = true;
      stop();
      html.classList.add("intro-done");
      window.dispatchEvent(new Event("db:intro-done"));
    }
    if (!link || !box || !word || !pa || !pb) { finish(); return; }
    evs.forEach((e) => window.addEventListener(e, finish, { passive: true }));
    document.addEventListener("visibilitychange", finish, { once: true });

    const DECEL = "cubic-bezier(0.16, 1, 0.3, 1)";
    const run = (el: Element, k: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(k, { fill: "both", ...o });
      anims.push(a);
      return a;
    };
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    /** The two pieces: start `o` units apart on the step's diagonal, register at `s1`. */
    const assemble = (o: number, s0: number, s1: number) => {
      const at = (d: number) => `translate(${d.toFixed(2)}px, ${(-d).toFixed(2)}px)`;
      const kf = (sign: 1 | -1): Keyframe[] => [
        { offset: 0, transform: at(sign * o * 1.12), easing: "linear" },
        { offset: s0 / s1, transform: at(sign * o), easing: DECEL },
        { offset: 1, transform: at(0) },
      ];
      run(pa, kf(1), { duration: s1 });
      run(pb, kf(-1), { duration: s1 });
      // At registration swap to the single seamless path (identical geometry).
      later(() => link.classList.remove("is-assembling"), s1);
    };
    const reveal = (delay: number, duration: number) =>
      run(word, [
        { clipPath: "inset(-10% 100% -10% 0)", transform: "translateX(-8px)" },
        { clipPath: "inset(-10% 0% -10% 0)", transform: "none" },
      ], { delay, duration, easing: DECEL });

    /** Free space beside the first headline line, if the screen has room for a stage. */
    const stage = () => {
      const l1 = document.querySelector<HTMLElement>(".hero-title .ml");
      const title = document.querySelector<HTMLElement>(".hero-title");
      const header = document.querySelector<HTMLElement>(".site-header");
      if (!l1 || !title || !header || window.scrollY > 4) return null;
      if (window.innerWidth < 960 || window.innerHeight < 600) return null;
      const words = l1.querySelectorAll<HTMLElement>(".w");
      if (!words.length) return null;
      const L = l1.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(title).fontSize);
      const left = words[words.length - 1].getBoundingClientRect().right + fs * 0.3;
      // Usually the column's edge; on very wide screens the first line can fill the
      // column, so the stage may use the margin beside it (never the viewport edge).
      const right = Math.min(Math.max(title.getBoundingClientRect().right, left + 100), window.innerWidth - 24);
      const S = Math.min((right - left) * 0.78, L.height * 0.78, 150);
      if (S < 72) return null;
      // The lane the symbol travels in: midway between the nav labels and the headline's
      // caps (the first line's clip box hugs its caps).
      const navText = header.querySelector(".nav-list a")?.firstChild;
      let navBottom = header.getBoundingClientRect().top + 40;
      if (navText) { const r = document.createRange(); r.selectNodeContents(navText); navBottom = r.getBoundingClientRect().bottom; }
      const lane = (navBottom + L.top) / 2;
      return { S, cx: left + (right - left) / 2, cy: L.top + L.height * 0.5, lane };
    };

    const play = () => {
      const M = box.getBoundingClientRect();
      const st = stage();
      link.classList.add("is-assembling");

      if (st) {
        // ---- Wide: stage in the hero, then fly into the header slot. ----
        const T = 1050, HOLD_END = 650;
        const k = st.S / M.width;
        const c1 = { x: M.left + M.width / 2, y: M.top + M.height / 2 };
        const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
        const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
        const easeIn = (u: number) => u * u * u;
        const cl = (u: number) => Math.max(0, Math.min(1, u));
        // Route (u: 0 → 1): rise and shrink into the lane, glide left along it, then lift into the slot.
        const at = (u: number) => {
          const s = k + (1 - k) * easeOut(cl(u / 0.42));
          const x = st.cx + (c1.x - st.cx) * ease(cl((u - 0.3) / 0.7));
          const y = st.cy + (st.lane - st.cy) * easeOut(cl(u / 0.36)) + (c1.y - st.lane) * easeIn(cl((u - 0.62) / 0.38));
          const size = M.width * s;
          return `translate(${(x - size / 2 - M.left).toFixed(2)}px, ${(y - size / 2 - M.top).toFixed(2)}px) scale(${s.toFixed(4)})`;
        };
        const frames: Keyframe[] = [
          { offset: 0, transform: at(0), opacity: 0 },
          { offset: 90 / T, transform: at(0), opacity: 1 },
          { offset: HOLD_END / T, transform: at(0), opacity: 1 },
        ];
        const N = 28;
        for (let i = 1; i <= N; i++) {
          const tau = i / N;
          frames.push({ offset: (HOLD_END + (T - HOLD_END) * tau) / T, transform: at(ease(tau)), opacity: 1 });
        }
        run(box, frames, { duration: T, easing: "linear" });
        assemble(3, 300, 560);
        reveal(950, 280);
        later(finish, T + 320);
      } else {
        // ---- Compact: the same gesture inside the logo's own footprint. ----
        run(box, [{ opacity: 0 }, { opacity: 1 }], { duration: 90 });
        assemble(3, 160, 430);
        reveal(540, 300);
        later(finish, 880);
      }
      html.classList.add("intro-run");
    };

    // Measure with the real fonts (the stage depends on the headline's width), but never
    // keep anyone waiting: if hydration was slow, show the finished logo instead.
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    const fontsReady = Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => window.setTimeout(r, 300))]);
    fontsReady.then(() => {
      if (done) return;
      if (performance.now() - fcp > 1400) finish();
      else play();
    });
    later(finish, 3200); // safety net

    return () => { if (!done) stop(); document.removeEventListener("visibilitychange", finish); };
  }, []);

  return null;
}
