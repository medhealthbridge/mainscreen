import { services } from "@/content/services";

function Vignette({ id }: { id: string }) {
  if (id === "websites")
    return (
      <div className="vig vig-web" aria-hidden="true">
        <div className="vw-nav"><i /><span /><span /><span /><b /></div>
        <div className="vw-h"><i /><i /><i className="s" /></div>
        <div className="vw-p"><i /><i /></div>
        <div className="vw-cta"><b>Book a call</b><span /></div>
        <div className="vw-cards"><i /><i /><i /></div>
      </div>
    );
  return (
    <div className="vig vig-sys" aria-hidden="true">
      <div className="vs-side"><b /><i /><i /><i /><i /></div>
      <div className="vs-main">
        <div className="vs-kpis"><i><em>12</em></i><i><em>48</em></i><i><em>0</em></i></div>
        <div className="vs-rows">
          {[0, 1, 2, 3].map((r) => (
            <div key={r}><i /><span /><span /><b className={r === 0 ? "on" : ""} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section className="sec sec-dark services" aria-labelledby="services-title">
      <div className="wrap">
        <h2 id="services-title" className="visually-hidden">Services</h2>
        <div className="svc-grid">
          {services.map((s, i) => (
            <article key={s.id} className="svc" data-reveal style={{ "--d": i } as React.CSSProperties}>
              <p className="mono svc-i"><span>{s.index}</span> Service</p>
              <h3 className="svc-title display">{s.title}</h3>
              <p className="lead svc-lead pretty">{s.lead}</p>
              <Vignette id={s.id} />
              <ul className="svc-benefits">
                {s.benefits.map((b) => <li key={b}>{b}</li>)}
              </ul>
              <p className="mono-sm svc-ex-label">Examples</p>
              <ul className="svc-ex">
                {s.examples.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </article>
          ))}
        </div>
        <p className="svc-note muted pretty" data-reveal>
          Not sure which you need? Many projects are a bit of both — a clear website in front, a simple system behind it.{" "}
          <a href="#contact" className="link-u" style={{ color: "var(--ivory)" }}>Describe the problem</a> and I&apos;ll suggest where to start.
        </p>
      </div>
    </section>
  );
}
