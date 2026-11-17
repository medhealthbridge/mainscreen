import { site } from "@/content/site";
import { faq } from "@/content/services";

/** Who is behind DataBridge + the questions people ask first. */
export function About() {
  const { about } = site;
  return (
    <section id="about" className="about sec-dark" aria-labelledby="about-title">
      <div className="wrap">
        <p className="mono stage-label"><span className="node" aria-hidden="true" data-line="" />About <em>· who you work with</em></p>
        <div className="about-grid">
          <h2 id="about-title" className="display-2 about-h mask-lines">
            {about.heading.map((l, i) => (
              <span className="ml" key={l}><span style={{ "--i": i } as React.CSSProperties}>{l}</span></span>
            ))}
          </h2>
          <div className="about-text">
            {about.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "lead" : "muted"} data-reveal style={{ "--d": i } as React.CSSProperties}>{p}</p>
            ))}
            {site.links.length > 0 && (
              <ul className="about-links">
                {site.links.map((l) => <li key={l.href}><a className="explore mono" href={l.href} rel="me noopener" target="_blank">{l.label} <span aria-hidden="true">↗</span></a></li>)}
              </ul>
            )}
          </div>
        </div>
        <ol className="principles">
          {about.principles.map((p, i) => (
            <li key={p.title} data-reveal style={{ "--d": i } as React.CSSProperties}>
              <span className="mono-sm">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p className="muted">{p.body}</p>
            </li>
          ))}
        </ol>

        <div className="faq-grid" aria-labelledby="faq-title">
          <div className="faq-side">
            <p className="mono-sm faq-k">FAQ</p>
            <h2 id="faq-title" className="display-3">Good questions to ask first.</h2>
          </div>
          <div className="faq-list">
            {faq.map((f) => (
              <details key={f.q} className="faq-item">
                <summary><span>{f.q}</span><span className="faq-icon" aria-hidden="true" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
