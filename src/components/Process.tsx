import { process } from "@/content/services";

export function Process() {
  return (
    <section id="process" className="sec sec-light panel-in process" aria-labelledby="process-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono idx"><b>03</b> Process</span>
          <span className="mono">Four stages, no surprises</span>
        </div>
        <div className="proc-top">
          <h2 id="process-title" className="display-2 mask-lines">
            <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>From problem</span></span>
            <span className="ml"><span style={{ "--i": 1 } as React.CSSProperties}>to handoff.</span></span>
          </h2>
          <p className="muted pretty proc-intro" data-reveal>
            You always know what stage we&apos;re in, what I need from you, and what you&apos;ll have at the end of it.
          </p>
        </div>
        <div className="proc-wrap">
        <span className="proc-line" aria-hidden="true"><i /></span>
        <ol className="proc">
          {process.map((p, i) => (
            <li key={p.step} className="proc-step" data-reveal style={{ "--d": i } as React.CSSProperties}>
              <span className="proc-n mono">{p.step}</span>
              <h3 className="proc-title">{p.title}</h3>
              <p className="proc-body">{p.body}</p>
              <dl className="proc-dl">
                <div><dt className="mono-sm">Your part</dt><dd>{p.you}</dd></div>
                <div><dt className="mono-sm">You get</dt><dd>{p.output}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}
