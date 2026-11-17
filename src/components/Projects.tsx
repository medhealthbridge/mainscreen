import { projects, statusNote, type Project } from "@/content/projects";
import { transformation } from "@/content/transformation";
import { projectScenes } from "./Scenes";
import { Frame, Phone } from "./Media";
import { Transformation } from "./Transformation";
import { ZoomButton } from "./Lightbox";

function FallbackScene({ p }: { p: Project }) {
  const wide = p.images.filter((i) => i.kind !== "mobile");
  const tall = p.images.find((i) => i.kind === "mobile");
  return (
    <div className="pj-fallback" data-reveal="scale">
      {wide[0] && <Frame im={wide[0]} label={p.name} />}
      {tall && <Phone im={tall} className="pj-fb-phone" />}
    </div>
  );
}

function ProjectFeature({ p, n }: { p: Project; n: number }) {
  const Scene = projectScenes[p.slug];
  const cover = p.images.find((i) => i.kind !== "mobile") ?? p.images[0];
  const second = p.images.filter((i) => i.kind !== "mobile")[1];
  const page = p.images.find((i) => i.kind === "page");
  return (
    <>
      <article className="pj sec-dark" id={`project-${p.slug}`} aria-labelledby={`pj-${p.slug}`}>
        <div className="wrap pj-head">
          <p className="mono pj-k">{String(n).padStart(2, "0")} / {p.category}</p>
          <p className="mono pj-desc">{p.summary}</p>
        </div>
        <div className="wrap pj-scene">{Scene ? Scene() : <FallbackScene p={p} />}</div>
        <div className="pj-name-wrap" aria-hidden="true" data-reveal="fade" style={{ "--len": p.name.length } as React.CSSProperties}>
          <span className="display pj-name">{p.name}</span>
        </div>
      </article>

      <section className="pj-band sec-light" aria-labelledby={`pj-${p.slug}`}>
        <span className="lane" data-line="" data-turn="40" data-h="36" aria-hidden="true" />
        <div className="wrap pj-band-grid">
          <div className="pj-info" data-reveal>
            <h3 id={`pj-${p.slug}`} className="display-3">{p.name}</h3>
            <p className="pj-for muted">{p.serves}</p>
            <dl className="pj-facts">
              <div><dt className="mono-sm">Problem</dt><dd>{p.brief.problem}</dd></div>
              <div><dt className="mono-sm">Solution</dt><dd>{p.brief.solution}</dd></div>
              <div><dt className="mono-sm">Role</dt><dd>{p.role.join(" · ")}</dd></div>
              <div><dt className="mono-sm">Status</dt><dd><span className="status" data-status={p.status}>{p.status}</span> <span className="pj-note muted">{statusNote[p.status]}</span></dd></div>
            </dl>
            <div className="pj-links">
              <a href={`/work/${p.slug}/`} className="explore mono">Explore project <span aria-hidden="true">↗</span><span className="visually-hidden"> — {p.name} case study</span></a>
              {p.demoUrl && <a href={p.demoUrl} className="explore mono" target="_blank" rel="noopener">{p.status === "Live" ? "Live site" : "Open prototype"} <span aria-hidden="true">↗</span></a>}
              {p.walkthroughUrl && <a href={p.walkthroughUrl} className="explore mono">Watch walkthrough <span aria-hidden="true">▸</span></a>}
            </div>
          </div>
          <div className="pj-shot" data-reveal="scale">
            <Frame im={page ?? second ?? cover} label={p.name} scroll={!!page} />
            <ZoomButton im={page ?? second ?? cover} className="pj-zoom" label="Enlarge screenshot" />
          </div>
        </div>
        {transformation.projectSlug === p.slug && <div className="wrap"><Transformation /></div>}
      </section>
    </>
  );
}

export function Projects() {
  return (
    <div id="featured">
      {projects.slice(0, 3).map((p, i) => <ProjectFeature key={p.slug} p={p} n={i + 1} />)}
    </div>
  );
}
