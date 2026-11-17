import type { ProjectImage } from "@/content/projects";

/** Screenshot in a minimal window frame. `scroll` makes a long page scroll on hover/focus. */
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
