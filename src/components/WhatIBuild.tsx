"use client";
import { needOptions, problems, services } from "@/content/services";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { useNeed } from "./NeedContext";

/**
 * WHAT I BUILD + WHAT'S SLOWING YOU DOWN — one section.
 * Two services split from a single line; each recognisable problem is joined
 * to its project example by a short local connector (square → line → square).
 */
export function WhatIBuild() {
  const { need, setNeed } = useNeed();
  const chosen = needOptions.find((o) => o.id === need);

  return (
    <section id="build" className="build sec-dark" aria-labelledby="build-title">
      <div className="wrap">
        <p className="mono stage-label">
          <span className="node" aria-hidden="true" data-line="" />What I build <em>· structure</em>
        </p>
        <h2 id="build-title" className="display-2 build-h mask-lines">
          <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>Clear websites.</span></span>
          <span className="ml"><span className="accent" style={{ "--i": 1 } as React.CSSProperties}>Working systems.</span></span>
        </h2>

        <div className="caps-tree">
          <span className="caps-root" data-line="" data-turn="30" data-h="22" aria-hidden="true" />
          <svg className="caps-branch lineart" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" data-reveal="draw">
            <path pathLength={1} className="d" d="M500 0 V34 Q500 52 482 52 H268 Q250 52 250 70 V100" />
            <path pathLength={1} className="d" d="M500 34 Q500 52 518 52 H732 Q750 52 750 70 V100" />
          </svg>
          <div className="caps-nodes">
            {services.map((s, i) => (
              <article key={s.id} className="cap" data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="cap-dot" aria-hidden="true" />
                <p className="mono cap-k">{s.index} / {s.title}</p>
                <h3 className="cap-t">{s.lead}</h3>
                <p className="mono-sm cap-ex">{s.examples.join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="slow" id="problems">
          <span className="lane slow-lane" data-line="" data-turn="64" data-h="44" aria-hidden="true" />
          <div className="slow-top">
            <h3 className="display-3 slow-h">What&apos;s slowing your business down?</h3>
            <fieldset className="needs-picker">
              <legend className="mono-sm">Optional — pick what sounds closest</legend>
              <div className="np-options">
                {needOptions.map((o) => (
                  <label key={o.id} className={`np-opt ${need === o.id ? "on" : ""}`}>
                    <input type="radio" name="need" value={o.id} checked={need === o.id} onChange={() => setNeed(o.id)} />
                    <span className="np-box" aria-hidden="true" />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
              <div className="np-after" aria-live="polite">
                {chosen ? (
                  <>
                    <span className="mono-sm">Highlighted below and added to your inquiry.</span>
                    <a href="#contact" className="arrow-link">Continue <span className="arr" aria-hidden="true">→</span></a>
                    <button type="button" className="mono-sm np-clear" onClick={() => setNeed(null)}>Clear</button>
                  </>
                ) : (
                  <span className="mono-sm muted">Everything below stays readable without choosing.</span>
                )}
              </div>
            </fieldset>
          </div>

          <ol className="problems">
            {problems.map((p, i) => {
              const rel = p.project ? projects.find((x) => x.slug === p.project) : undefined;
              const state = need ? (p.needs.includes(need) ? "is-match" : "is-dim") : "";
              return (
                <li key={p.problem} className={`problem ${state}`} data-reveal="link">
                  <span className="pr-n mono-sm">{String(i + 1).padStart(2, "0")}</span>
                  <h4 className="pr-q">{p.problem}</h4>
                  <span className="pr-link" aria-hidden="true"><i /><b /><i /></span>
                  <div className="pr-a">
                    {rel && (
                      <a href={`/work/${rel.slug}/`} className="pr-proj mono-sm">
                        <span className="sr-label">Example: </span>{rel.name} <span className="pr-st">{rel.status}</span> <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <p>{p.solution}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="cta-band">
            <p className="display-3 balance">Recognise one of these?</p>
            <a href="#contact" className="btn btn-primary">{site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
