import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject, statusNote } from "@/content/projects";
import { site } from "@/content/site";
import { Frame, Phone } from "@/components/Media";
import { ZoomButton } from "@/components/Lightbox";
import "../casestudy.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const cover = p.images.find((i) => i.kind !== "mobile") ?? p.images[0];
  const title = `${p.name} — ${p.category}`;
  return {
    title,
    description: p.summary,
    openGraph: { title, description: p.summary, images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined },
    twitter: { card: "summary_large_image", title, description: p.summary },
  };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const idx = projects.findIndex((x) => x.slug === p.slug);
  const next = projects[(idx + 1) % projects.length];
  const wide = p.images.filter((i) => i.kind !== "mobile");
  const tall = p.images.filter((i) => i.kind === "mobile");
  const cover = wide[0] ?? p.images[0];
  const rest = p.images.filter((i) => i !== cover && i !== tall[0]);
  const cs = p.caseStudy;

  const sections: { k: string; title: string; body: React.ReactNode }[] = [
    { k: "01", title: "Context", body: <p className="cs-lead">{cs.context}</p> },
    { k: "02", title: "The problem", body: <p className="cs-lead">{p.problem}</p> },
    {
      k: "03", title: "Constraints",
      body: <ul className="cs-list">{cs.constraints.map((c) => <li key={c}>{c}</li>)}</ul>,
    },
    {
      k: "04", title: "Key decisions",
      body: (
        <ol className="cs-decisions">
          {cs.decisions.map((d, i) => (
            <li key={d.title}><span className="mono-sm">0{i + 1}</span><h3>{d.title}</h3><p className="muted">{d.body}</p></li>
          ))}
        </ol>
      ),
    },
    {
      k: "05", title: "The solution",
      body: (
        <>
          <p className="cs-lead">{p.built}</p>
          <ul className="cs-list">{cs.solution.map((c) => <li key={c}>{c}</li>)}</ul>
        </>
      ),
    },
    {
      k: "06", title: cs.outcomeLabel === "Outcome" ? "Outcome" : "Intended benefit",
      body: (
        <>
          <ul className="cs-list cs-outcome">{cs.outcome.map((c) => <li key={c}>{c}</li>)}</ul>
          {cs.outcomeLabel !== "Outcome" && (
            <p className="mono-sm muted cs-honest">No results are claimed here — this describes what the work is designed to improve.</p>
          )}
        </>
      ),
    },
  ];

  return (
    <article className="cs">
      <header className="cs-hero sec-dark">
        <div className="wrap">
          <nav className="cs-crumbs mono-sm" aria-label="Breadcrumb">
            <a href="/#work" className="link-u">← All work</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{p.name}</span>
          </nav>
          <p className="mono cs-meta"><span>{String(idx + 1).padStart(2, "0")}</span> / {p.offering} / {p.category} / {p.year}</p>
          <h1 className="display cs-title mask-lines" style={{ "--len": p.name.length } as React.CSSProperties}><span className="ml"><span>{p.name}</span></span></h1>
          <p className="lead cs-summary pretty">{p.summary}</p>

          {p.status !== "Live" && (
            <p className="cs-banner" role="note">
              <span className="status" data-status={p.status}>{p.status}</span>
              <span>{statusNote[p.status]}{p.sampleData && p.status !== "Visual concept" ? " Screens use sample data." : ""}</span>
            </p>
          )}

          <dl className="cs-facts">
            <div><dt className="mono-sm">Who it serves</dt><dd>{p.serves}</dd></div>
            <div><dt className="mono-sm">My role</dt><dd>{p.role.join(" · ")}</dd></div>
            <div><dt className="mono-sm">Status</dt><dd><span className="status" data-status={p.status}>{p.status}</span></dd></div>
            <div>
              <dt className="mono-sm">Demo</dt>
              <dd>{p.demoUrl ? <a className="link-u" href={p.demoUrl} target="_blank" rel="noopener">Open live demo ↗</a> : <span className="muted">Not public yet</span>}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="cs-cover sec-dark">
        <div className="wrap cs-cover-inner">
          <div className="cs-zoomwrap">
            <Frame im={cover} label={p.name} priority scroll={cover.kind === "page"} />
            <ZoomButton im={cover} className="cs-zoom" label="Enlarge screenshot" />
          </div>
          {tall[0] && <Phone im={tall[0]} className="cs-cover-phone" />}
        </div>
      </div>

      <div className="cs-body sec sec-light panel-in">
        <div className="wrap">
          {sections.map((s) => (
            <section key={s.k} className="cs-row" aria-labelledby={`cs-${s.k}`}>
              <h2 id={`cs-${s.k}`} className="cs-label"><span className="mono-sm">{s.k}</span> {s.title}</h2>
              <div className="cs-content" data-reveal>{s.body}</div>
            </section>
          ))}

          {rest.length > 0 && (
            <section className="cs-gallery" aria-label="More screens">
              {rest.map((im, i) =>
                im.kind === "mobile" ? (
                  <div key={im.src} className="cs-g cs-g-tall cs-zoomwrap" data-reveal><Phone im={im} /><ZoomButton im={im} className="cs-zoom" /></div>
                ) : (
                  <div key={im.src} className={`cs-g cs-zoomwrap ${i % 2 ? "cs-g-r" : "cs-g-l"}`} data-reveal>
                    <Frame im={im} label={p.name} scroll={im.kind === "page"} />
                    <ZoomButton im={im} className="cs-zoom" label="Enlarge screenshot" />
                    <p className="mono-sm muted cs-cap">{im.alt}</p>
                  </div>
                ),
              )}
            </section>
          )}
        </div>
      </div>

      <nav className="cs-next sec-dark" aria-label="Next project">
        <div className="wrap">
          <a href={`/work/${next.slug}/`} className="cs-next-link">
            <span className="mono-sm muted">Next project</span>
            <span className="display cs-next-name" style={{ "--len": next.name.length + 2 } as React.CSSProperties}>{next.name} <span aria-hidden="true">→</span></span>
            <span className="mono-sm muted">{next.category} · {next.status}</span>
          </a>
          <div className="cta-band">
            <h2 className="display-3 balance">Have a problem like this to solve?</h2>
            <a href="/#contact" className="btn btn-primary">{site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span></a>
          </div>
        </div>
      </nav>
    </article>
  );
}
