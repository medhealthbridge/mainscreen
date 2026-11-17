"use client";
import { useEffect, useRef } from "react";
import { projects, type ProjectImage } from "@/content/projects";
import { useNeed } from "./NeedContext";

/**
 * WORK STAGE — full-screen pointer trail of project screens.
 * Moving emits screens along the path (by distance travelled), larger when you slow down;
 * older screens recede. When you stop, the newest four glide back into a resting stack.
 * Imperative DOM only (no React renders on pointer move). Decorative: real links live in the index.
 */

const POOL = 14;
const MAX_VISIBLE = 12;
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

    const T_MOVE = "transform 950ms var(--ease-out), opacity 420ms var(--ease-out), filter 600ms var(--ease-out)";
    const T_SETTLE = "transform 1150ms var(--ease-out), opacity 700ms var(--ease-out), filter 500ms";
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
      active.slice(0, -4).forEach((c) => { c.el.style.transition = T_SETTLE; c.el.style.opacity = "0"; });
      const { w, h } = stackSize();
      const chosen = keep.length === 4 ? keep : cards.slice(0, 4);
      chosen.forEach((c, i) => {
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
        c.el.style.zIndex = String(++z);
        c.el.style.filter = "none";
        c.el.style.opacity = "1";
        put(c);
      });
      active = chosen.slice();
      stage.classList.remove("is-moving");
    };

    const emit = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const c = cards[next++ % POOL];
      const im = pool[imgIdx++ % pool.length];
      active = active.filter((a) => a !== c);
      const base = Math.min(380, Math.max(190, rect.width * 0.2));
      const tall = im.kind === "mobile";
      c.w = tall ? base * 0.48 : base;
      c.h = tall ? c.w * (im.height / im.width) : base * 0.625;
      const slow = 1 - Math.min(1, speed / 1.8);
      c.s = 0.9 + slow * 0.5;
      const hw = (c.w * c.s) / 2, hh = (c.h * c.s) / 2;
      c.x = Math.min(rect.width - hw, Math.max(hw, x));
      c.y = Math.min(rect.height - hh, Math.max(hh, y));
      c.r = Math.max(-8, Math.min(8, dx * 0.06)) + (Math.random() - 0.5) * 2.5;
      c.img.src = im.thumb;
      c.el.dataset.kind = im.kind;
      c.el.style.width = `${c.w}px`; c.el.style.height = `${c.h}px`;
      c.el.style.transition = "none";
      c.el.style.zIndex = String(++z);
      c.el.style.filter = "none";
      c.el.style.opacity = "0";
      c.el.style.transform = `translate3d(${c.x - c.w / 2 - dx * 0.8}px, ${c.y - c.h / 2 - dy * 0.8}px, 80px) rotate(${c.r * 0.3}deg) scale(${c.s * 0.7})`;
      void c.el.offsetWidth;
      c.el.style.transition = T_MOVE;
      c.el.style.opacity = "1";
      put(c);
      active.push(c);
      if (active.length > MAX_VISIBLE) { const o = active.shift()!; o.el.style.opacity = "0"; }
      const n = active.length;
      active.forEach((a, i) => {
        const age = n - 1 - i;
        if (age === 0) return;
        a.el.style.opacity = String(Math.max(0.15, 1 - age * 0.065));
        a.el.style.filter = age > 5 ? `blur(${Math.min(2.4, (age - 5) * 0.5).toFixed(2)}px) brightness(.8)` : age > 2 ? "brightness(.9)" : "none";
        put(a, -age * 26, 1 - age * 0.012);
      });
      stage.classList.add("is-moving");
      window.clearTimeout(idle);
      idle = window.setTimeout(() => settle(), 900);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (stage.classList.contains("is-previewing")) return;
      const x = e.clientX - rect.left, y = e.clientY - rect.top, t = performance.now();
      if (!last) { last = { x, y, t }; return; }
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      acc += d;
      const threshold = Math.max(38, rect.width * 0.032);
      if (acc >= threshold) {
        const speed = acc / Math.max(16, t - last.t);
        const k = threshold / Math.max(d, 1);
        emit(x, y, dx * k * 0.5, dy * k * 0.5, speed);
        acc = 0; last = { x, y, t };
      } else last = { x, y, t: last.t };
    };
    const onEnter = () => { rect = field.getBoundingClientRect(); last = null; acc = 0; };
    const onLeave = () => { window.clearTimeout(idle); settle(); last = null; };
    const onResize = () => { rect = field.getBoundingClientRect(); settle(true); };
    const onScroll = () => { rect = field.getBoundingClientRect(); };

    settle(true);
    stage.classList.add("is-live");
    (stage as HTMLDivElement & { __settle?: () => void }).__settle = () => settle();

    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(idle);
      stage.removeEventListener("pointerenter", onEnter);
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
    <section id="work" className="work sec-dark" aria-labelledby="work-title">
      <div className="work-stage" ref={stageRef}>
        <div className="wrap ws-top">
          <p className="ws-statement">Websites that explain.</p>
          <p className="ws-statement ws-r">Systems that run the work.</p>
        </div>

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

        <div className="ws-gallery" role="region" aria-label="Project screens" tabIndex={0}>
          <ul>
            {interleave().filter((i) => i.kind !== "mobile").map((im) => {
              const p = projects.find((x) => im.src.startsWith(`/work/${x.slug}/`))!;
              return (
                <li key={im.src}>
                  <a href={`/work/${p.slug}/`}>
                    <img src={im.thumb} alt={im.alt} width={640} height={400} loading="lazy" decoding="async" />
                    <span className="mono-sm">{p.name} — {p.category}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="wrap ws-bottom">
          <div className="ws-meta">
            <h2 id="work-title" className="mono"><span className="tick" aria-hidden="true" data-line="" />Selected work</h2>
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
