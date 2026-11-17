import { site } from "@/content/site";
import { ArrivalMachine } from "./ArrivalMachine";

/** Renders a headline line word by word; a trailing "." on the last line becomes the accent block. */
function Line({ text, last, i }: { text: string; last: boolean; i: number }) {
  const words = text.split(" ");
  return (
    <span className="ml">
      <span style={{ "--i": i } as React.CSSProperties}>
        {words.map((w, wi) => {
          const isEnd = last && wi === words.length - 1 && w.endsWith(".");
          return (
            <span className="w" key={wi}>
              {isEnd ? (
                <>
                  {w.slice(0, -1)}
                  <span className="stop" aria-hidden="true" />
                  <span className="visually-hidden">.</span>
                </>
              ) : (
                w
              )}
              {wi < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export function Hero() {
  const { hero } = site;
  return (
    <section className="hero sec-dark" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true">
        {Array.from({ length: 13 }).map((_, i) => <i key={i} />)}
      </div>
      <div className="wrap hero-inner">
        <div className="hero-meta">
          <p className="mono"><span className="tick" aria-hidden="true" />{hero.label}</p>
          <p className="mono muted hero-meta-r">Independent designer &amp; developer</p>
        </div>

        <h1 id="hero-title" className="display hero-title">
          {hero.headline.map((l, i) => (
            <span key={l}>
              <Line text={l} i={i} last={i === hero.headline.length - 1} />{" "}
            </span>
          ))}
        </h1>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="lead pretty">{hero.intro}</p>
            <div className="hero-ctas">
              <a href="#contact" className="btn btn-primary">
                {hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
              </a>
              <a href="#work" className="btn btn-ghost">
                {hero.secondaryCta} <span className="arr" aria-hidden="true">↓</span>
              </a>
            </div>
            <ul className="hero-offer mono-sm" aria-label="What I build">
              <li><span>A</span> Websites that explain and convert</li>
              <li><span>B</span> Systems that organise the work</li>
            </ul>
          </div>
          <ArrivalMachine />
        </div>
      </div>
    </section>
  );
}
