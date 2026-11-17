import { site } from "@/content/site";

/** Typographic wordmark: two words joined by the accent "bridge" span. */
export function Wordmark({ className = "" }: { className?: string }) {
  const [a, b] = site.wordmark;
  return (
    <a href="/" className={`wordmark ${className}`} aria-label={`${site.name} — home`}>
      <span aria-hidden="true">{a}</span>
      <span className="span" aria-hidden="true" />
      <span aria-hidden="true">{b}</span>
    </a>
  );
}
