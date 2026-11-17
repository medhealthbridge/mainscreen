"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * THE ARRIVAL — interface fragments assemble into a product preview,
 * moving through IDEA → STRUCTURE → DESIGN → SYSTEM → LAUNCH.
 * Pure DOM + CSS transitions; JS only flips a stage class on a timer.
 * The preview is illustrative (not a client product) and labelled so.
 */

const STAGES = ["Idea", "Structure", "Design", "System", "Launch"];
const TIMES = [0, 750, 1550, 2350, 3250]; // ms after start

const KPIS = [
  { label: "New requests", value: 6 },
  { label: "Confirmed this week", value: 18 },
  { label: "Waiting for a reply", value: 0 },
];
const ROWS = [
  { i: "MC", n: "Maya Chen", s: "First consultation", t: "Tue 10:00", st: "New" },
  { i: "OR", n: "Omar Reyes", s: "Follow-up visit", t: "Tue 11:30", st: "Confirmed" },
  { i: "JL", n: "Jun Lee", s: "Site survey", t: "Wed 09:00", st: "Confirmed" },
  { i: "AB", n: "Ada Brooks", s: "Quote review", t: "Thu 14:00", st: "Confirmed" },
];

export function ArrivalMachine() {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(4);
  const [pre, setPre] = useState(true);
  const timers = useRef<number[]>([]);

  const countUp = useCallback(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-count]");
    if (!els) return;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      const e = 1 - Math.pow(1 - p, 3);
      els.forEach((el) => (el.textContent = String(Math.round(Number(el.dataset.count) * e))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPre(false);
      setStage(4);
      return;
    }
    // Snap to the first stage without transitions, then run the sequence.
    el.classList.add("no-trans");
    setStage(0);
    setPre(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.classList.remove("no-trans");
        TIMES.forEach((ms, i) => {
          if (i === 0) return;
          timers.current.push(
            window.setTimeout(() => {
              setStage(i);
              if (i === 3) countUp();
            }, ms + 250),
          );
        });
      }),
    );
  }, [countUp]);

  useEffect(() => {
    play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [play]);

  // Subtle pointer parallax on the whole preview (fine pointers only, rAF-throttled).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    const hero = el.closest("section") ?? el;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0, running = false;
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!running) { running = true; raf = requestAnimationFrame(loop); }
    };
    const onLeave = () => { tx = 0; ty = 0; if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    hero.addEventListener("pointermove", onMove as EventListener);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove as EventListener);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const cls = ["machine", ...[1, 2, 3, 4].filter((s) => stage >= s).map((s) => `s${s}`)].join(" ");

  return (
    <div className="machine-wrap">
      <div
        ref={root}
        className={cls}
        data-pre={pre ? "" : undefined}
        role="img"
        aria-label="Illustration: loose interface fragments assemble into a bookings dashboard, moving from idea to structure, design, working system and launch."
      >
        <div className="mx-win">
          <div className="mx-chrome">
            <i /><i /><i />
            <span className="mx-url">yourbusiness.app/bookings</span>
          </div>
          <div className="mx-body">
            <div className="mx-guides" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, i) => <i key={i} />)}
            </div>

            <div className="frag f-side" style={{ "--sx": "-60%", "--sy": "30%", "--sz": "-260px", "--sr": "-8deg" } as React.CSSProperties}>
              <div className="sk"><b /><b /><b /><b /><b /></div>
              <div className="ds">
                <span className="mx-logo"><i /></span>
                <span className="on">Bookings</span><span>Customers</span><span>Services</span><span>Invoices</span>
              </div>
            </div>

            <div className="frag f-title" style={{ "--sx": "-30%", "--sy": "-160%", "--sz": "120px", "--sr": "5deg" } as React.CSSProperties}>
              <div className="sk"><b style={{ width: "46%" }} /><b style={{ width: "70%" }} /></div>
              <div className="ds"><strong>Bookings</strong><span className="data">Week 47 · 6 new requests</span></div>
            </div>

            <div className="frag f-btn" style={{ "--sx": "80%", "--sy": "-220%", "--sz": "200px", "--sr": "14deg" } as React.CSSProperties}>
              <div className="sk"><b /></div>
              <div className="ds">+ New booking</div>
            </div>

            {KPIS.map((k, i) => (
              <div
                key={k.label}
                className={`frag f-kpi k${i}`}
                style={{ "--sx": `${[-90, 30, 140][i]}%`, "--sy": `${[-120, 160, -60][i]}%`, "--sz": `${[60, -180, 240][i]}px`, "--sr": `${[-12, 6, 10][i]}deg`, "--d": i } as React.CSSProperties}
              >
                <div className="sk"><b style={{ width: "60%" }} /><b style={{ width: "30%", height: 14 }} /></div>
                <div className="ds"><span>{k.label}</span><strong data-count={k.value}>{k.value}</strong></div>
              </div>
            ))}

            {ROWS.map((r, i) => (
              <div
                key={r.n}
                className={`frag f-row r${i}`}
                style={{ "--sx": `${[30, -40, 60, -20][i]}%`, "--sy": `${[180, 260, 120, 320][i]}%`, "--sz": `${[-120, 180, -60, 90][i]}px`, "--sr": `${[4, -6, 8, -3][i]}deg`, "--d": i } as React.CSSProperties}
              >
                <div className="sk"><b className="c" /><b style={{ width: "28%" }} /><b style={{ width: "22%" }} /><b style={{ width: "14%" }} /></div>
                <div className="ds">
                  <span className="av data">{r.i}</span>
                  <span className="nm data">{r.n}</span>
                  <span className="sv data">{r.s}</span>
                  <span className="tm data">{r.t}</span>
                  {i === 0 ? (
                    <span className="st data first">
                      <span className="st-new">New</span>
                      <span className="st-ok">Confirmed</span>
                    </span>
                  ) : (
                    <span className="st data ok">{r.st}</span>
                  )}
                </div>
              </div>
            ))}

            <div className="mx-cursor" aria-hidden="true">
              <svg viewBox="0 0 16 20" width="16" height="20"><path d="M1 1 L1 15 L5 11.5 L8 18 L10.5 17 L7.6 10.6 L13 10.6 Z" fill="#080808" stroke="#F2EFE7" strokeWidth="1.2" strokeLinejoin="round" /></svg>
            </div>
            <div className="mx-toast" aria-hidden="true">
              <span className="tick" /> Booking confirmed · Maya notified
            </div>
          </div>
        </div>
      </div>

      <div className="mx-stages" aria-hidden="true">
        {STAGES.map((s, i) => (
          <span key={s} className={`mx-stage ${stage >= i ? "done" : ""} ${stage === i ? "now" : ""}`}>
            <em>0{i + 1}</em> {s}
          </span>
        ))}
      </div>
      <div className="mx-foot">
        <span className="mono-sm muted">Illustrative preview</span>
        <button type="button" className="mono-sm mx-replay" onClick={play}>
          Replay <span aria-hidden="true">↺</span><span className="visually-hidden"> the assembly animation</span>
        </button>
      </div>
    </div>
  );
}
