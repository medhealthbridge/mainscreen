import { site } from "@/content/site";

export function About() {
  const { about } = site;
  return (
    <section id="about" className="sec sec-dark about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono idx"><b>04</b> About</span>
          <span className="mono">{site.name}</span>
        </div>
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
      </div>
    </section>
  );
}
