import { site } from "@/content/site";

export function About() {
  const { about } = site;
  return (
    <section id="about" className="about sec-light" aria-labelledby="about-title">
      <div className="wrap about-grid">
        <h2 id="about-title" className="display-2 about-h mask-lines">
          {about.heading.map((l, i) => (
            <span className="ml" key={l} style={{ paddingLeft: i === 1 ? "0.9em" : 0 }}><span style={{ "--i": i } as React.CSSProperties}>{l}</span></span>
          ))}
        </h2>
        <div className="about-text">
          {about.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "lead" : "muted"} data-reveal style={{ "--d": i } as React.CSSProperties}>{p}</p>
          ))}
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
