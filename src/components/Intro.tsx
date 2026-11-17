import { IntroScene } from "./Scenes";

/** Staggered statement + line drawing: the IDEA stage. */
export function Intro() {
  const lines = ["From scattered", "notes to", "systems that", "actually run."];
  return (
    <section className="intro sec-light" aria-labelledby="intro-title">
      <div className="wrap intro-grid">
        <div className="intro-text">
          <p className="mono stage-label"><span className="node" aria-hidden="true" />01 — Idea</p>
          <h2 id="intro-title" className="display-2 intro-h mask-lines">
            {lines.map((l, i) => (
              <span className="ml" key={l} style={{ paddingLeft: i % 2 ? "0.9em" : 0 }}>
                <span style={{ "--i": i } as React.CSSProperties}>{l}</span>
              </span>
            ))}
          </h2>
          <p className="mono intro-p" data-reveal>
            I turn the way your business really works into websites people understand and tools your team will actually use.
          </p>
        </div>
        <div className="intro-art"><IntroScene /></div>
      </div>
    </section>
  );
}
