"use client";
import { useEffect, useRef, useState } from "react";
import { projects, type ProjectImage } from "@/content/projects";
import { useNeed } from "./NeedContext";
import { ZoomButton } from "./Lightbox";

/**
 * WORK STAGE — a cursor image trail of project screens.
 * Moving emits small screens along the path (by distance travelled). The newest stays sharp;
 * older ones fade and soften out of focus, leaving a long trail behind the pointer. A small
 * label travels with the cursor. When you stop, the trail fades (oldest first) and the
 * newest four glide into a resting stack.
 * Imperative DOM only (no React renders on pointer move). Decorative: real links live in the index.
 */

const POOL = 26;
const MAX_VISIBLE = 22;
const SLOTS = [
  { dx: -0.07, dy: 0.05, r: -5 },
  { dx: 0.06, dy: -0.03, r: 4 },
  { dx: -0.015, dy: -0.06, r: -1.5 },
  { dx: 0.01, dy: 0.02, r: 1 },
];

function interleave(): ProjectImage[] {
  const out: ProjectImage[] = [];
  const max = Math.max(...projects.map((p) => p.images.length));
  for (let i = 0; i < max; i++) for (const p of projects) if (p.images[i]) out.push(p.images[i]);
  return out;
}
const stackImages = () => interleave().filter((i) => i.kind !== "mobile").slice(0, 4);

export function WorkStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLOListElement>(null);
  const { need } = useNeed();
  const stack = stackImages();

  useEffect(() => {
    const stage = stageRef.current, field = fieldRef.current;
    if (!stage || !field) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 761px)");
    if (!mq.matches) return;
    const pool = interleave();
    const stackPool = stackImages();
    if (!pool.length) return;

    type Card = { el: HTMLDivElement; img: HTMLImageElement; x: number; y: number; r: number; s: number; w: number; h: number };
    const cards: Card[] = [];
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement("div");
      el.className = "wcard";
      const img = document.createElement("img");
      img.alt = ""; img.decoding = "async"; img.draggable = false;
      el.appendChild(img);
      field.appendChild(el);
      cards.push({ el, img, x: 0, y: 0, r: 0, s: 1, w: 0, h: 0 });
    }
    pool.forEach((p) => { const i = new Image(); i.src = p.thumb; });

    let rect = field.getBoundingClientRect();
    let active: Card[] = [];
    let next = 0, imgIdx = 0, z = 10, acc = 0, idle = 0;
    let last: { x: number; y: number; t: number } | null = null;

    const T_MOVE = "transform 700ms var(--ease-out), opacity 420ms var(--ease-out), filter 420ms var(--ease-out)";
    const T_SETTLE = "transform 1000ms var(--ease-out), opacity 600ms var(--ease-out)";
    const put = (c: Card, depth = 0, extraScale = 1) => {
      c.el.style.transform = `translate3d(${c.x - c.w / 2}px, ${c.y - c.h / 2}px, ${depth}px) rotate(${c.r}deg) scale(${c.s * extraScale})`;
    };
    const stackSize = () => {
      const w = Math.min(500, Math.max(250, rect.width * 0.3));
      return { w, h: w * 0.625 };
    };

    // Resting stack (replaces the static HTML fallback).
    const settle = (initial = false) => {
      const keep = active.slice(-4);
      // Fade the trail gracefully, oldest first.
      active.slice(0, -4).forEach((c, i) => {
        c.el.style.transition = T_SETTLE;
        c.el.style.transitionDelay = initial ? "0ms" : `${i * 28}ms`;
        c.el.style.opacity = "0";
      });
      const { w, h } = stackSize();
      const chosen = keep.length === 4 ? keep : cards.slice(0, 4);
      chosen.forEach((c, i) => {
        c.el.getAnimations().forEach((a) => a.cancel());
        if (keep.length !== 4) {
          const im = stackPool[i % stackPool.length];
          c.img.src = im.thumb;
          c.el.dataset.kind = im.kind;
        }
        const slot = SLOTS[i];
        c.w = w; c.h = h; c.s = 1; c.r = slot.r;
        c.x = rect.width / 2 + slot.dx * rect.width;
        c.y = rect.height / 2 + slot.dy * rect.height;
        c.el.style.width = `${w}px`; c.el.style.height = `${h}px`;
        c.el.style.transition = initial ? "none" : T_SETTLE;
        c.el.style.transitionDelay = initial ? "0ms" : "220ms";
        c.el.style.filter = "none";
        c.el.style.zIndex = String(++z);
        c.el.style.opacity = "1";
        put(c);
      });
      active = chosen.slice();
    };

    const emit = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const c = cards[next++ % POOL];
      const im = pool[imgIdx++ % pool.length];
      active = active.filter((a) => a !== c);
      const base = Math.min(230, Math.max(132, rect.width * 0.13));
      const tall = im.kind === "mobile";
      c.w = tall ? base * 0.48 : base;
      c.h = tall ? c.w * (im.height / im.width) : base * 0.625;
      const slow = 1 - Math.min(1, speed / 1.8);
      c.s = 0.94 + slow * 0.22;
      const hw = (c.w * c.s) / 2, hh = (c.h * c.s) / 2;
      c.x = Math.min(rect.width - hw, Math.max(hw, x));
      c.y = Math.min(rect.height - hh, Math.max(hh, y));
      c.r = Math.max(-8, Math.min(8, dx * 0.06)) + (Math.random() - 0.5) * 2.5;
      c.img.src = im.thumb;
      c.el.dataset.kind = im.kind;
      c.el.style.width = `${c.w}px`; c.el.style.height = `${c.h}px`;
      // Entrance via the Web Animations API — no forced layout, stays on the compositor.
      const from = `translate3d(${c.x - c.w / 2 - dx * 0.35}px, ${c.y - c.h / 2 - dy * 0.35}px, 40px) rotate(${c.r * 0.5}deg) scale(${c.s * 0.86})`;
      c.el.getAnimations().forEach((a) => a.cancel());
      c.el.style.transition = "none";
      c.el.style.transitionDelay = "0ms";
      c.el.style.filter = "none";
      c.el.style.zIndex = String(++z);
      c.el.style.opacity = "1";
      put(c);
      c.el.animate(
        [{ transform: from, opacity: 0 }, { transform: c.el.style.transform, opacity: 1 }],
        { duration: 560, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      active.push(c);
      if (active.length > MAX_VISIBLE) { const o = active.shift()!; o.el.style.opacity = "0"; }
      const n = active.length;
      active.forEach((a, i) => {
        const age = n - 1 - i;
        if (age === 0) return;
        a.el.style.transition = T_MOVE;
        // Older cards recede: fainter, slightly smaller, and progressively out of focus.
        a.el.style.opacity = String(Math.max(0.12, 1 - age * 0.04));
        a.el.style.filter = age > 2 ? `blur(${Math.min(9, (age - 2) * 0.6).toFixed(1)}px)` : "none";
        const sc = a.s * (1 - age * 0.01);
        a.el.style.transform = `translate3d(${a.x - a.w / 2}px, ${a.y - a.h / 2}px, ${-age * 8}px) rotate(${a.r}deg) scale(${sc})`;
      });
      window.clearTimeout(idle);
      idle = window.setTimeout(() => settle(), 1500);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      movePill(e);
      if (stage.classList.contains("is-previewing")) return;
      const x = e.clientX - rect.left, y = e.clientY - rect.top, t = performance.now();
      if (!last) { last = { x, y, t }; return; }
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      acc += d;
      const threshold = Math.max(34, rect.width * 0.03);
      if (acc >= threshold) {
        const speed = acc / Math.max(16, t - last.t);
        const k = threshold / Math.max(d, 1);
        emit(x, y, dx * k * 0.5, dy * k * 0.5, speed);
        acc = 0; last = { x, y, t };
      } else last = { x, y, t: last.t };
    };
    // Cursor label: follows the pointer with a light lag (rAF only while it's moving).
    const pill = stage.querySelector<HTMLElement>(".ws-cursor");
    const sRect = () => stage.getBoundingClientRect();
    let px = 0, py = 0, tx = 0, ty = 0, praf = 0;
    const pillLoop = () => {
      px += (tx - px) * 0.22; py += (ty - py) * 0.22;
      if (pill) pill.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      praf = Math.abs(tx - px) + Math.abs(ty - py) > 0.3 ? requestAnimationFrame(pillLoop) : 0;
    };
    // Offset beside the pointer; flips to the left/above near the stage edges so it never clips.
    const target = (e: PointerEvent, r: DOMRect) => {
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const w = pill?.offsetWidth ?? 0, h = pill?.offsetHeight ?? 0;
      tx = x + 18 + w > r.width - 12 ? x - 18 - w : x + 18;
      ty = y + 18 + h > r.height - 12 ? y - 18 - h : y + 18;
    };
    const movePill = (e: PointerEvent) => {
      target(e, sRect());
      if (!praf) praf = requestAnimationFrame(pillLoop);
    };
    const onEnter = (e: PointerEvent) => {
      rect = field.getBoundingClientRect(); last = null; acc = 0;
      target(e, sRect()); px = tx; py = ty;
      stage.classList.add("is-hovering");
    };
    const onLeave = () => { window.clearTimeout(idle); settle(); last = null; stage.classList.remove("is-hovering"); };
    const onResize = () => { rect = field.getBoundingClientRect(); settle(true); };
    const onScroll = () => { rect = field.getBoundingClientRect(); };

    settle(true);
    stage.classList.add("is-live");
    (stage as HTMLDivElement & { __settle?: () => void }).__settle = () => settle();

    stage.addEventListener("pointerenter", onEnter as EventListener);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idle);
      stage.removeEventListener("pointerenter", onEnter as EventListener);
      cancelAnimationFrame(praf);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      stage.classList.remove("is-live");
      cards.forEach((c) => c.el.remove());
    };
  }, []);

  // Stable preview for hovered / focused index links.
  useEffect(() => {
    const stage = stageRef.current, preview = previewRef.current, list = indexRef.current;
    if (!stage || !preview || !list) return;
    const img = preview.querySelector("img")!;
    let t = 0;
    const show = (slug: string) => {
      const p = projects.find((x) => x.slug === slug);
      if (!p) return;
      window.clearTimeout(t);
      const im = p.images.find((i) => i.kind !== "mobile") ?? p.images[0];
      if (img.getAttribute("src") !== im.src) img.setAttribute("src", im.src);
      stage.classList.add("is-previewing");
    };
    const hide = () => {
      t = window.setTimeout(() => {
        stage.classList.remove("is-previewing");
        (stage as HTMLDivElement & { __settle?: () => void }).__settle?.();
      }, 60);
    };
    const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a[data-slug]"));
    const hs = links.map((a) => {
      const on = () => show(a.dataset.slug!);
      a.addEventListener("mouseenter", on); a.addEventListener("focus", on);
      a.addEventListener("mouseleave", hide); a.addEventListener("blur", hide);
      return { a, on };
    });
    return () => hs.forEach(({ a, on }) => {
      a.removeEventListener("mouseenter", on); a.removeEventListener("focus", on);
      a.removeEventListener("mouseleave", hide); a.removeEventListener("blur", hide);
    });
  }, []);

  const anySample = projects.some((p) => p.sampleData);

  return (
    <section id="work" className="work sec-light" aria-labelledby="work-title">
      <div className="work-stage" ref={stageRef}>
        <div className="wrap ws-top">
          <p className="ws-statement">Websites that explain.</p>
          <p className="ws-statement ws-r">Systems that run the work.</p>
        </div>

        <div className="ws-cursor mono-sm" aria-hidden="true"><span className="wsc-dot" />[ move to explore the work ]</div>
        <div className="ws-field" ref={fieldRef} aria-hidden="true">
          <div className="ws-rest">
            {stack.map((im, i) => (
              <div key={im.src} className="ws-rest-card" style={{ "--dx": SLOTS[i].dx, "--dy": SLOTS[i].dy, "--r": `${SLOTS[i].r}deg`, zIndex: i } as React.CSSProperties}>
                <img src={im.thumb} alt="" width={640} height={400} decoding="async" draggable={false} />
              </div>
            ))}
          </div>
          <div className="ws-preview" ref={previewRef}>
            <img alt="" decoding="async" />
          </div>
        </div>

        <Gallery />

        <div className="wrap ws-bottom">
          <div className="ws-meta">
            <h2 id="work-title" className="mono"><span className="tick" aria-hidden="true" data-line="" data-turn="118" data-h="34" />Selected work <em>· connection</em></h2>
            <p className="mono-sm ws-hint" aria-hidden="true">Move to explore the work</p>
          </div>
          <ol className="ws-index" ref={indexRef}>
            {projects.map((p, i) => {
              const match = need ? p.needs.includes(need) : null;
              return (
                <li key={p.slug} className={match === null ? "" : match ? "is-match" : "is-dim"}>
                  <a href={`/work/${p.slug}/`} data-slug={p.slug}>
                    <span className="mono-sm wi-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="wi-name">{p.name}</span>
                    <span className="mono-sm wi-meta">{p.category} · {p.status}{match ? " · relevant" : ""}</span>
                  </a>
                </li>
              );
            })}
          </ol>
          {anySample && <p className="mono-sm ws-note">Concept projects · fictional sample data</p>}
        </div>
      </div>
    </section>
  );
}

/**
 * Touch / small-screen gallery: native horizontal swipe (vertical page scroll untouched),
 * the next card's edge stays visible, plus a position indicator and previous/next buttons.
 */
function Gallery() {
  const ulRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const items = interleave().filter((i) => i.kind !== "mobile");

  useEffect(() => {
    const ul = ulRef.current;
    if (!ul) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i)); }),
      { root: ul, threshold: 0.6 },
    );
    ul.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, []);

  const go = (d: number) => {
    const ul = ulRef.current;
    const li = ul?.children[Math.max(0, Math.min(items.length - 1, index + d))] as HTMLElement | undefined;
    if (!ul || !li) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollTo({ left: li.offsetLeft - ul.offsetLeft - parseFloat(getComputedStyle(ul).paddingLeft || "0"), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="ws-gallery" role="region" aria-roledescription="carousel" aria-label="Project screens">
      <ul ref={ulRef} tabIndex={0} aria-label="Swipe or use the buttons to browse">
        {items.map((im, i) => {
          const p = projects.find((x) => im.src.startsWith(`/work/${x.slug}/`))!;
          return (
            <li key={im.src} data-i={i} aria-label={`${i + 1} of ${items.length}`}>
              <div className="wg-media">
                <img src={im.thumb} alt={im.alt} width={640} height={400} loading="lazy" decoding="async" />
                <ZoomButton im={im} className="wg-zoom" />
              </div>
              <a href={`/work/${p.slug}/`} className="wg-link mono-sm">{p.name} — {p.category} <span aria-hidden="true">↗</span></a>
            </li>
          );
        })}
      </ul>
      <div className="wrap wg-controls">
        <p className="mono-sm wg-pos" aria-live="polite">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
        <div className="wg-btns">
          <button type="button" className="wg-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous screen">←</button>
          <button type="button" className="wg-btn" onClick={() => go(1)} disabled={index === items.length - 1} aria-label="Next screen">→</button>
        </div>
      </div>
    </div>
  );
}
