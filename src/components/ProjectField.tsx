"use client";
import { useEffect, useRef } from "react";
import { projects, type ProjectImage } from "@/content/projects";
import { useNeed } from "./NeedContext";

/**
 * THE PROJECT FIELD — a pointer-driven trail of project screens.
 *
 * - Cards are emitted by distance travelled (not per mousemove), with a small
 *   rotation from the movement direction and a size that grows as you slow down.
 * - The newest card is sharp; older ones recede in depth, opacity and blur.
 * - All motion is imperative (no React renders on pointer move).
 * - Decorative only (aria-hidden, pointer-events: none). The accessible project
 *   index beside it holds the real links; focusing one shows a stable preview.
 * - Touch devices and reduced motion get a static composition / swipe gallery.
 */

const POOL = 12;
const MAX_VISIBLE = 10;

type Slot = { left: number; top: number; w: number; r: number; z: number; mobile?: boolean };
const SLOTS: Slot[] = [
  { left: 5, top: 12, w: 39, r: -3.5, z: 2 },
  { left: 55, top: 7, w: 38, r: 3, z: 1 },
  { left: 27, top: 41, w: 37, r: 1.5, z: 4 },
  { left: 8, top: 60, w: 27, r: -2, z: 3 },
  { left: 63, top: 46, w: 12.5, r: -5, z: 5, mobile: true },
  { left: 80, top: 40, w: 12.5, r: 6, z: 6, mobile: true },
];

/** Picks images for the resting composition: wide screens for wide slots, phones for phone slots. */
function restImages() {
  const wide: ProjectImage[] = [];
  const tall: ProjectImage[] = [];
  const maxLen = Math.max(...projects.map((p) => p.images.length));
  for (let i = 0; i < maxLen; i++) {
    for (const p of projects) {
      const im = p.images[i];
      if (!im) continue;
      (im.kind === "mobile" ? tall : wide).push(im);
    }
  }
  let wi = 0, ti = 0;
  return SLOTS.map((s) => (s.mobile ? tall[ti++ % Math.max(tall.length, 1)] : wide[wi++ % Math.max(wide.length, 1)])).map((im, i) => ({ im, s: SLOTS[i] }));
}

export function ProjectField() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLOListElement>(null);
  const { need } = useNeed();
  const rest = restImages();
  const anySample = projects.some((p) => p.sampleData);

  // ---- Trail engine ----
  useEffect(() => {
    const stage = stageRef.current;
    const trail = trailRef.current;
    if (!stage || !trail) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;

    // Interleave screens from every project so the trail alternates between them.
    const pool: ProjectImage[] = [];
    const maxLen = Math.max(...projects.map((p) => p.images.length));
    for (let i = 0; i < maxLen; i++) for (const p of projects) if (p.images[i]) pool.push(p.images[i]);
    if (!pool.length) return;

    type Card = { el: HTMLDivElement; img: HTMLImageElement; x: number; y: number; r: number; s: number; w: number; h: number };
    const cards: Card[] = [];
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement("div");
      el.className = "tcard";
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.draggable = false;
      el.appendChild(img);
      trail.appendChild(el);
      cards.push({ el, img, x: 0, y: 0, r: 0, s: 1, w: 0, h: 0 });
    }

    // Preload trail thumbnails once the stage is near the viewport.
    let loaded = false;
    const preload = () => {
      if (loaded) return;
      loaded = true;
      pool.forEach((p) => { const i = new Image(); i.decoding = "async"; i.src = p.thumb; });
    };
    const io = new IntersectionObserver((e) => e[0].isIntersecting && preload(), { rootMargin: "600px" });
    io.observe(stage);

    let active: Card[] = [];
    let next = 0, imgIdx = 0, z = 10;
    let last: { x: number; y: number; t: number } | null = null;
    let acc = 0;
    let idleTimer = 0;
    let rect = stage.getBoundingClientRect();

    const place = (c: Card, age: number) => {
      const depth = -age * 42;
      const sc = c.s * (1 - age * 0.018);
      c.el.style.transform = `translate3d(${c.x - c.w / 2}px, ${c.y - c.h / 2}px, ${depth}px) rotate(${c.r}deg) scale(${sc})`;
      c.el.style.opacity = String(Math.max(0, 1 - age * 0.075));
      c.el.style.filter = age >= 3 ? `blur(${Math.min(2.6, (age - 2) * 0.45).toFixed(2)}px)` : "none";
    };

    const fadeAll = (delay = 0) => {
      active.slice().forEach((c, i) => {
        window.setTimeout(() => {
          c.el.style.transition = "transform 900ms var(--ease-out), opacity 650ms var(--ease-out), filter 600ms";
          c.el.style.opacity = "0";
          c.el.style.transform = c.el.style.transform.replace(/translate3d\(([^,]+), ([^,]+), [^)]+\)/, "translate3d($1, $2, -260px)");
        }, delay + i * 55);
      });
      active = [];
      window.setTimeout(() => stage.classList.remove("is-trailing"), delay + 260);
    };

    const emit = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const c = cards[next++ % POOL];
      const im = pool[imgIdx++ % pool.length];
      active = active.filter((a) => a !== c);
      const base = Math.min(400, Math.max(180, rect.width * 0.3));
      const isTall = im.kind === "mobile";
      c.w = isTall ? base * 0.46 : base;
      c.h = isTall ? c.w * (im.height / im.width) : base * 0.625;
      // Slower movement → slightly larger cards, like setting something down.
      const slow = 1 - Math.min(1, speed / 2.2);
      c.s = 0.86 + slow * 0.28;
      const pad = 12;
      const hw = (c.w * c.s) / 2, hh = (c.h * c.s) / 2;
      c.x = Math.min(rect.width - hw - pad, Math.max(hw + pad, x));
      c.y = Math.min(rect.height - hh - pad, Math.max(hh + pad, y));
      c.r = Math.max(-9, Math.min(9, dx * 0.05)) + (Math.random() - 0.5) * 3;
      c.img.src = im.thumb;
      c.el.style.width = `${c.w}px`;
      c.el.style.height = `${c.h}px`;
      c.el.dataset.kind = im.kind;

      // Start slightly behind the pointer, small and transparent, then settle.
      c.el.style.transition = "none";
      c.el.style.zIndex = String(++z);
      c.el.style.filter = "none";
      c.el.style.opacity = "0";
      c.el.style.transform = `translate3d(${c.x - c.w / 2 - dx * 0.7}px, ${c.y - c.h / 2 - dy * 0.7}px, 120px) rotate(${c.r * 0.2}deg) scale(${c.s * 0.62})`;
      void c.el.offsetWidth;
      c.el.style.transition = "transform 1000ms var(--ease-out), opacity 380ms var(--ease-out), filter 700ms var(--ease-out)";

      active.push(c);
      if (active.length > MAX_VISIBLE) {
        const old = active.shift()!;
        old.el.style.opacity = "0";
      }
      const n = active.length;
      active.forEach((a, i) => place(a, n - 1 - i));
      stage.classList.add("is-trailing");

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => fadeAll(), 1150);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (stage.classList.contains("is-previewing")) return;
      preload();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = performance.now();
      if (!last) { last = { x, y, t }; return; }
      const dx = x - last.x, dy = y - last.y;
      const d = Math.hypot(dx, dy);
      acc += d;
      const threshold = Math.max(64, rect.width * 0.075);
      if (acc >= threshold) {
        const speed = acc / Math.max(16, t - last.t);
        emit(x, y, dx * (threshold / Math.max(d, 1)) * 0.5, dy * (threshold / Math.max(d, 1)) * 0.5, speed);
        acc = 0;
        last = { x, y, t };
      } else {
        last = { x, y, t: last.t };
      }
    };
    const onEnter = () => { rect = stage.getBoundingClientRect(); last = null; acc = 0; };
    const onLeave = () => { window.clearTimeout(idleTimer); fadeAll(120); last = null; };
    const onScrollResize = () => { rect = stage.getBoundingClientRect(); };

    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScrollResize, { passive: true });
    window.addEventListener("resize", onScrollResize);
    return () => {
      io.disconnect();
      window.clearTimeout(idleTimer);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScrollResize);
      window.removeEventListener("resize", onScrollResize);
      cards.forEach((c) => c.el.remove());
    };
  }, []);

  // ---- Stable preview for hovered / focused index links ----
  useEffect(() => {
    const stage = stageRef.current, preview = previewRef.current, list = indexRef.current;
    if (!stage || !preview || !list) return;
    const img = preview.querySelector("img")!;
    const cap = preview.querySelector(".fp-cap")!;
    let hideTimer = 0;
    const show = (slug: string) => {
      const p = projects.find((x) => x.slug === slug);
      if (!p) return;
      window.clearTimeout(hideTimer);
      const im = p.images.find((i) => i.kind !== "mobile") ?? p.images[0];
      if (img.getAttribute("src") !== im.src) {
        img.setAttribute("src", im.src);
        img.setAttribute("width", String(im.width));
        img.setAttribute("height", String(im.height));
      }
      cap.textContent = `${p.name} — ${p.category}`;
      stage.classList.add("is-previewing");
      stage.classList.remove("is-trailing");
      stage.querySelectorAll<HTMLElement>(".tcard").forEach((c) => (c.style.opacity = "0"));
    };
    const hide = () => {
      hideTimer = window.setTimeout(() => stage.classList.remove("is-previewing"), 60);
    };
    const links = Array.from(list.querySelectorAll<HTMLAnchorElement>("a[data-slug]"));
    const handlers = links.map((a) => {
      const on = () => show(a.dataset.slug!);
      a.addEventListener("mouseenter", on);
      a.addEventListener("focus", on);
      a.addEventListener("mouseleave", hide);
      a.addEventListener("blur", hide);
      return { a, on };
    });
    return () => handlers.forEach(({ a, on }) => {
      a.removeEventListener("mouseenter", on);
      a.removeEventListener("focus", on);
      a.removeEventListener("mouseleave", hide);
      a.removeEventListener("blur", hide);
    });
  }, []);

  return (
    <section id="work" className="sec sec-light panel-in field-sec" aria-labelledby="work-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono idx"><b>01</b> Selected work</span>
          <span className="mono">{String(projects.length).padStart(2, "0")} projects</span>
        </div>

        <div className="field-head">
          <h2 id="work-title" className="display-2 mask-lines">
            <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>Proof you can</span></span>
            <span className="ml"><span style={{ "--i": 1 } as React.CSSProperties}>click through.</span></span>
          </h2>
          <p className="field-intro muted pretty" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
            Websites and systems shown as they really work: the problem, the screens, and what each one is designed to change.
          </p>
        </div>

        <div className="field">
          <div className="field-stage" ref={stageRef} aria-hidden="true">
            <div className="field-rest">
              {rest.map(({ im, s }, i) =>
                im ? (
                  <div
                    key={i}
                    className={`rest-card ${s.mobile ? "is-tall" : ""}`}
                    data-reveal="scale"
                    style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.w}%`, zIndex: s.z, "--r": `${s.r}deg`, "--d": i } as React.CSSProperties}
                  >
                    <img src={im.thumb} alt="" width={640} height={Math.round((640 * im.height) / im.width)} loading="lazy" decoding="async" draggable={false} />
                  </div>
                ) : null,
              )}
            </div>
            <div className="field-trail" ref={trailRef} />
            <div className="field-preview" ref={previewRef}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" decoding="async" />
              <span className="fp-cap mono-sm" />
            </div>
            <p className="field-hint mono-sm">
              <span className="fh-dot" /> Move to explore the work
            </p>
          </div>

          <div className="field-side">
            <p className="mono-sm muted fs-label">Project index</p>
            <ol className="field-index" ref={indexRef}>
              {projects.map((p, i) => {
                const match = need ? p.needs.includes(need) : null;
                return (
                  <li key={p.slug} className={match === null ? "" : match ? "is-match" : "is-dim"}>
                    <a href={`/work/${p.slug}/`} data-slug={p.slug} className="fi-link">
                      <span className="fi-n mono-sm">{String(i + 1).padStart(2, "0")}</span>
                      <span className="fi-main">
                        <span className="fi-name">{p.name}</span>
                        <span className="fi-meta mono-sm">{p.offering} · {p.category}</span>
                      </span>
                      <span className="fi-end">
                        <span className="status" data-status={p.status}>{p.status}</span>
                        <span className="fi-arr" aria-hidden="true">↗</span>
                      </span>
                      {match && <span className="fi-flag mono-sm">Relevant to you</span>}
                    </a>
                  </li>
                );
              })}
            </ol>
            <a href="#featured" className="arrow-link fs-more">Featured case studies <span className="arr" aria-hidden="true">↓</span></a>
            {anySample && (
              <p className="mono-sm muted fs-note">Concept projects use fictional sample data and are not client engagements.</p>
            )}
          </div>
        </div>

        {/* Touch & reduced-motion alternative: a user-controlled swipe gallery */}
        <div className="field-gallery" role="region" aria-label="Project gallery" tabIndex={0}>
          <ul>
            {projects.map((p) => {
              const wide = p.images.find((i) => i.kind !== "mobile") ?? p.images[0];
              const tall = p.images.find((i) => i.kind === "mobile");
              return (
                <li key={p.slug}>
                  <a href={`/work/${p.slug}/`} className="fg-card">
                    <span className="fg-media">
                      <img src={wide.thumb} alt={wide.alt} width={640} height={400} loading="lazy" decoding="async" />
                      {tall && <img className="fg-tall" src={tall.thumb} alt="" width={640} height={Math.round((640 * tall.height) / tall.width)} loading="lazy" decoding="async" />}
                    </span>
                    <span className="fg-text">
                      <span className="fi-name">{p.name}</span>
                      <span className="mono-sm muted">{p.category}</span>
                      <span className="status" data-status={p.status}>{p.status}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mono-sm muted fg-hint" aria-hidden="true">Swipe to browse →</p>
        </div>
      </div>
    </section>
  );
}
