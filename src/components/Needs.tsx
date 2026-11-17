"use client";
import { needOptions, problems } from "@/content/services";
import { projects } from "@/content/projects";
import { useNeed } from "./NeedContext";

/** "What's slowing your business down?" — optional selector + problem → solution rows. */
export function Needs() {
  const { need, setNeed } = useNeed();
  const chosen = needOptions.find((o) => o.id === need);

  return (
    <section id="build" className="sec sec-light panel-in needs" aria-labelledby="needs-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono idx"><b>02</b> What I build</span>
          <span className="mono">Problems → solutions</span>
        </div>

        <div className="needs-top">
          <h2 id="needs-title" className="display-2 mask-lines">
            <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>What&apos;s slowing</span></span>
            <span className="ml"><span style={{ "--i": 1 } as React.CSSProperties}>your business</span></span>
            <span className="ml"><span style={{ "--i": 2 } as React.CSSProperties}>down?</span></span>
          </h2>

          <fieldset className="needs-picker" data-reveal>
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
                  <span className="mono-sm">Highlighted below, and added to your inquiry.</span>
                  <a href="#contact" className="arrow-link">Continue to the form <span className="arr" aria-hidden="true">→</span></a>
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
              <li key={p.problem} className={`problem ${state}`} data-reveal style={{ "--d": i % 3 } as React.CSSProperties}>
                <span className="pr-n mono-sm">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="pr-q">{p.problem}</h3>
                <span className="pr-arrow" aria-hidden="true">→</span>
                <div className="pr-a">
                  <p>{p.solution}</p>
                  <p className="pr-meta mono-sm">
                    <span className="pr-tag">{p.service}</span>
                    {rel && (
                      <a href={`/work/${rel.slug}/`} className="link-u">
                        Related: {rel.name}
                        {rel.sampleData ? " (concept)" : ""}
                      </a>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
