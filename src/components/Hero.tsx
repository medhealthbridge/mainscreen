import { site } from "@/content/site";
import { HeroDiagram } from "./HeroDiagram";

/** Renders a headline line; a trailing "." on the last line becomes the accent block (the start of the data line). */
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
                  <span className="stop" data-line-start aria-hidden="true" />
                  <span className="visually-hidden">.</span>
                </>
              ) : w}
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
      <HeroDiagram />
      <div className="wrap hero-inner">
        <h1 id="hero-title" className="display hero-title">
          {hero.headline.map((l, i) => (
            <span key={l}>
              <Line text={l} i={i} last={i === hero.headline.length - 1} />{" "}
            </span>
          ))}
        </h1>

        <div className="hero-foot">
          <span className="lane hero-lane" data-line="" aria-hidden="true" />
          <div className="hero-copy">
            <p className="mono hero-label"><span className="tick" aria-hidden="true" />{hero.label}</p>
            <p className="hero-intro pretty">{hero.intro}</p>
          </div>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-primary">
              {hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
            </a>
            <a href="#work" className="hero-link mono">
              <span>{hero.secondaryCta}</span> <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
