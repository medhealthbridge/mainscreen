"use client";
import { useEffect, useRef, useState } from "react";
import { transformation as T } from "@/content/transformation";

/**
 * THE TRANSFORMATION — the same six elements move between four states.
 * Positions are expressed in container units so the choreography scales.
 * Autoplays once when in view (pausable); every step is also a button,
 * and each step has a written caption so it's understandable without motion.
 */

type P = [x: number, y: number, r?: number];

const WIDE = {
  scatter: [[3, 6, -6], [55, 3, 4], [30, 34, 3], [71, 40, -4], [7, 60, 5], [45, 70, -2.5]] as P[],
  colX: [1.5, 26, 50.5, 75],
  rowY: [12, 32, 52, 72],
};
const NARROW = {
  scatter: [[3, 3, -5], [50, 9, 4], [12, 28, 3], [48, 39, -4], [5, 56, 5], [42, 72, -2]] as P[],
  grid: [[3, 44], [52, 28], [52, 12], [3, 28], [52, 44], [3, 12]] as P[],
};

export function Transformation() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 620));
    ro.observe(el);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current && !reduce) {
          started.current = true;
          setPlaying(true);
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= T.steps.length - 1) { setPlaying(false); return; }
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 2400 : 3200);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  const go = (i: number) => { setPlaying(false); setStep(i); };
  const replay = () => { setStep(0); setPlaying(true); };

  // Position of each item for the current step.
  const pos = (i: number): P => {
    const it = T.items[i];
    if (step === 0) return narrow ? NARROW.scatter[i] : WIDE.scatter[i];
    if (narrow) {
      if (i === 0 && step === 2) return [3, 5];
      if (i === 0 && step === 3) return [3, 62];
      return NARROW.grid[i];
    }
    if (i === 0 && step === 3) return [WIDE.colX[3], WIDE.rowY[0]];
    const sameCol = T.items.filter((x, j) => x.col === it.col && j < i && !(step === 3 && j === 0)).length;
    return [WIDE.colX[it.col], WIDE.rowY[sameCol]];
  };
  const statusOf = (i: number) => {
    if (i === 0 && step === 3) return "Done";
    return T.columns[T.items[i].col];
  };

  const s = T.steps[step];

  return (
    <div className="tf">
      <div className="tf-top">
        <p className="mono-sm tf-kicker"><span className="tick" aria-hidden="true" />How the system works</p>
        <div className="tf-steps" role="group" aria-label="Demo steps">
          {T.steps.map((st, i) => (
            <button
              key={st.label}
              type="button"
              className={`tf-step ${i === step ? "on" : ""} ${i < step ? "past" : ""}`}
              aria-pressed={i === step}
              onClick={() => go(i)}
            >
              <span className="mono-sm">0{i + 1}</span> {st.label}
              {i === step && playing && <i className="tf-prog" style={{ animationDuration: step === 0 ? "2400ms" : "3200ms" }} />}
            </button>
          ))}
          <button type="button" className="tf-ctl mono-sm" onClick={playing ? () => setPlaying(false) : replay}>
            {playing ? "Pause" : step === T.steps.length - 1 ? "Replay ↺" : "Play ▸"}
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className={`tf-stage step-${step} ${narrow ? "is-narrow" : ""}`}
        aria-hidden="true"
      >
        <div className="tf-cols">
          {T.columns.map((c, ci) => (
            <div key={c} className="tf-col" style={{ "--x": WIDE.colX[ci] } as React.CSSProperties}>
              <span>{c}</span>
              <em>{T.items.filter((x, j) => (ci === 3 ? j === 0 && step === 3 : x.col === ci && !(j === 0 && step === 3))).length}</em>
            </div>
          ))}
        </div>

        <div className="tf-panel">
          <div className="tfp-head" />
          <div className="tfp-grid">
            <div>
              <span className="mono-sm">Customer</span>
              <b>{T.detail.customer}</b>
              <span>{T.items[0].place} · {T.detail.note}</span>
            </div>
            <div>
              <span className="mono-sm">Crew</span>
              <b>Crew {T.items[0].crew}</b>
              <span>{T.items[0].when}</span>
            </div>
          </div>
          <ul className="tfp-check">
            {T.detail.checklist.map((c, i) => (
              <li key={c} style={{ "--i": i } as React.CSSProperties}><i />{c}</li>
            ))}
          </ul>
          <span className="tfp-btn">Mark job as done</span>
        </div>

        {T.items.map((it, i) => {
          const [x, y, r = 0] = pos(i);
          return (
            <div
              key={it.id}
              className={`tf-item ${i === 0 ? "is-hero" : ""}`}
              style={{ "--x": x, "--y": y, "--r": `${r}deg`, "--i": i } as React.CSSProperties}
            >
              <div className="tf-raw">
                <span className="mono-sm">{it.source}</span>
                <p>{it.raw}</p>
              </div>
              <div className="tf-card">
                <div className="tfc-top">
                  <span className="mono-sm">{it.id}</span>
                  {it.crew ? <span className="tfc-crew">{it.crew}</span> : <span className="tfc-un mono-sm">Unassigned</span>}
                </div>
                <b>{it.title}</b>
                <span className="tfc-place">{it.place}</span>
                <span className={`tfc-chip ${statusOf(i) === "Done" ? "done" : ""}`}>
                  {statusOf(i) === "Done" ? "Done · invoiced" : narrow ? statusOf(i) : it.when}
                </span>
              </div>
            </div>
          );
        })}

        <div className="tf-toast"><i /> {T.detail.toast}</div>
        <span className="tf-sample mono-sm">Fictional sample data</span>
      </div>

      <div className="tf-caption" aria-live="polite">
        <p className="mono-sm">Step {step + 1} of {T.steps.length} — {s.label}</p>
        <h4>{s.title}</h4>
        <p className="muted">{s.body}</p>
      </div>
    </div>
  );
}
