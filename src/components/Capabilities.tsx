import { services } from "@/content/services";

/** STRUCTURE stage: one line splits into the two things I build. */
export function Capabilities() {
  return (
    <section id="build" className="caps sec-dark" aria-labelledby="caps-title">
      <span className="lane" data-line="" data-turn="110" aria-hidden="true" />
      <div className="wrap">
        <p className="mono stage-label"><span className="node" aria-hidden="true" />02 — Structure</p>
        <h2 id="caps-title" className="display-2 caps-h mask-lines">
          <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>Websites that explain.</span></span>
          <span className="ml"><span className="accent" style={{ "--i": 1 } as React.CSSProperties}>Systems that run the work.</span></span>
        </h2>

        <div className="caps-tree">
          <span className="caps-root" data-line="" data-turn="60" aria-hidden="true" />
          <svg className="caps-branch lineart" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" data-reveal="draw">
            <path pathLength={1} className="d" d="M500 0 V40 Q500 60 480 60 H270 Q250 60 250 80 V120" />
            <path pathLength={1} className="d" d="M500 40 Q500 60 520 60 H730 Q750 60 750 80 V120" />
          </svg>
          <div className="caps-nodes">
            {services.map((s, i) => (
              <article key={s.id} className="cap" data-reveal style={{ "--d": i } as React.CSSProperties}>
                <span className="cap-dot" aria-hidden="true" />
                <p className="mono cap-k">{s.index} / {s.title}</p>
                <h3 className="cap-t">{s.lead}</h3>
                <ul className="cap-b">
                  {s.benefits.map((b) => <li key={b}>{b}</li>)}
                </ul>
                <p className="mono-sm cap-ex">{s.examples.join(" · ")}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
