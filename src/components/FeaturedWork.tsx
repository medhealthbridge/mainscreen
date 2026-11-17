import { projects, statusNote, type Project, type ProjectImage } from "@/content/projects";
import { transformation } from "@/content/transformation";
import { site } from "@/content/site";
import { Transformation } from "./Transformation";

/* ---------- small building blocks ---------- */

export function Frame({ im, label, scroll = false, priority = false, className = "" }: { im: ProjectImage; label?: string; scroll?: boolean; priority?: boolean; className?: string }) {
  return (
    <figure className={`frame ${scroll ? "frame-scroll" : ""} ${className}`}>
      <div className="frame-bar" aria-hidden="true"><i /><i /><i />{label && <span>{label}</span>}</div>
      <div className="frame-view" tabIndex={scroll ? 0 : undefined} aria-label={scroll ? `${im.alt} — hover or focus to scroll the page` : undefined}>
        <img src={im.src} alt={im.alt} width={im.width} height={im.height} loading={priority ? "eager" : "lazy"} decoding="async" />
      </div>
    </figure>
  );
}

export function Phone({ im, className = "" }: { im: ProjectImage; className?: string }) {
  return (
    <figure className={`phone ${className}`}>
      <img src={im.src} alt={im.alt} width={im.width} height={im.height} loading="lazy" decoding="async" />
    </figure>
  );
}

function Facts({ p, cols = 1 }: { p: Project; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={`facts facts-${cols}`}>
      <div><dt className="mono-sm">Who it serves</dt><dd>{p.serves}</dd></div>
      <div><dt className="mono-sm">The problem</dt><dd>{p.problem}</dd></div>
      <div><dt className="mono-sm">What I designed &amp; built</dt><dd>{p.built}</dd></div>
      <div><dt className="mono-sm">My role</dt><dd>{p.role.join(" · ")}</dd></div>
      <div>
        <dt className="mono-sm">Status</dt>
        <dd className="facts-status"><span className="status" data-status={p.status}>{p.status}</span> <span className="muted">{statusNote[p.status]}</span></dd>
      </div>
    </dl>
  );
}

function Links({ p }: { p: Project }) {
  return (
    <div className="feat-links">
      <a href={`/work/${p.slug}/`} className="btn btn-ghost">
        Read the {p.name} case study <span className="arr" aria-hidden="true">→</span>
      </a>
      {p.demoUrl && (
        <a href={p.demoUrl} className="arrow-link" target="_blank" rel="noopener">
          Open live demo <span className="arr" aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

function Head({ p, n }: { p: Project; n: number }) {
  return (
    <header className="feat-head">
      <p className="mono feat-n">
        <span>{String(n).padStart(2, "0")}</span> / {p.offering} / {p.year}
      </p>
      <h3 className="feat-name display mask-lines">
        <span className="ml"><span>{p.name}</span></span>
      </h3>
      <p className="feat-summary lead pretty" data-reveal>{p.summary}</p>
    </header>
  );
}

const pick = (p: Project, kind: ProjectImage["kind"] | "wide", skip = 0) => {
  const list = p.images.filter((i) => (kind === "wide" ? i.kind !== "mobile" : i.kind === kind));
  return list[skip] ?? list[0] ?? p.images[0];
};

/* ---------- three individually composed layouts ---------- */

function LayoutA({ p }: { p: Project }) {
  return (
    <article className="feat feat-a sec sec-dark" aria-labelledby={`p-${p.slug}`} id={`project-${p.slug}`}>
      <div className="wrap">
        <div id={`p-${p.slug}`}><Head p={p} n={1} /></div>
        <div className="feat-a-grid">
          <div className="feat-a-facts" data-reveal><Facts p={p} /><Links p={p} /></div>
          <div className="feat-a-media" data-reveal="scale">
            <Frame im={pick(p, "wide", 1)} label={p.name} />
            <Phone im={pick(p, "mobile")} className="feat-a-phone" />
          </div>
        </div>
        {transformation.projectSlug === p.slug && <Transformation />}
      </div>
    </article>
  );
}

function LayoutB({ p }: { p: Project }) {
  const page = p.images.find((i) => i.kind === "page");
  const notes = p.caseStudy.decisions.slice(0, 3);
  return (
    <article className="feat feat-b sec sec-light panel-in" aria-labelledby={`p-${p.slug}`} id={`project-${p.slug}`}>
      <div className="wrap">
        <div className="feat-b-grid">
          <div className="feat-b-media" data-reveal="scale">
            <Frame im={page ?? pick(p, "wide")} label={p.name} scroll={!!page} />
            <Phone im={pick(p, "mobile")} className="feat-b-phone" />
            {page && <p className="mono-sm feat-b-hint" aria-hidden="true">Hover to scroll the page ↓</p>}
          </div>
          <div className="feat-b-text">
            <div id={`p-${p.slug}`}><Head p={p} n={2} /></div>
            <div data-reveal><Facts p={p} /></div>
            <Links p={p} />
          </div>
        </div>
        <ol className="feat-b-notes">
          {notes.map((d, i) => (
            <li key={d.title} data-reveal style={{ "--d": i } as React.CSSProperties}>
              <span className="mono-sm">Decision 0{i + 1}</span>
              <b>{d.title}</b>
              <p className="muted">{d.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function LayoutC({ p }: { p: Project }) {
  return (
    <article className="feat feat-c sec sec-dark-2" aria-labelledby={`p-${p.slug}`} id={`project-${p.slug}`}>
      <div className="wrap">
        <div id={`p-${p.slug}`}><Head p={p} n={3} /></div>
        <div className="feat-c-stage" data-reveal="fade">
          <div className="layer l-back"><Frame im={pick(p, "wide", 0)} label={p.name} /></div>
          <div className="layer l-mid"><Frame im={pick(p, "wide", 1)} label={p.name} /></div>
          <div className="layer l-front"><Phone im={pick(p, "mobile")} /></div>
        </div>
        <div className="feat-c-bottom" data-reveal>
          <Facts p={p} cols={3} />
          <Links p={p} />
        </div>
      </div>
    </article>
  );
}

export function FeaturedWork() {
  const featured = projects.slice(0, 3);
  const layouts = [LayoutA, LayoutB, LayoutC];
  return (
    <div id="featured">
      {featured.map((p, i) => {
        const L = layouts[i];
        return <L key={p.slug} p={p} />;
      })}
      <section className="sec-dark" aria-label="Start a project">
        <div className="wrap">
          <div className="cta-band">
            <h2 className="display-3 balance">Recognise one of these problems in your business?</h2>
            <a href="#contact" className="btn btn-primary">
              {site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
