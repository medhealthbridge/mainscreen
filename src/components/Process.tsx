import { process } from "@/content/services";

export function Process() {
  return (
    <section id="process" className="proc-sec sec-light" aria-labelledby="process-title">
      <div className="wrap">
        <p className="mono stage-label"><span className="node" aria-hidden="true" data-line="" />How we work together <em>· system</em></p>
        <h2 id="process-title" className="display-2 mask-lines">
          <span className="ml"><span style={{ "--i": 0 } as React.CSSProperties}>Four steps.</span></span>
          <span className="ml" style={{ paddingLeft: "0.9em" }}><span style={{ "--i": 1 } as React.CSSProperties}>No surprises.</span></span>
        </h2>
        <ol className="proc">
          {process.map((p, i) => (
            <li key={p.step} className="proc-step" data-reveal style={{ "--d": i } as React.CSSProperties}>
              <span className="proc-n">{p.step}</span>
              <h3 className="proc-title">{p.title}</h3>
              <p className="proc-body muted">{p.body}</p>
              <dl className="proc-dl">
                <div><dt className="mono-sm">Your part</dt><dd>{p.you}</dd></div>
                <div><dt className="mono-sm">You get</dt><dd>{p.output}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
