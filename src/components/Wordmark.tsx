import { site } from "@/content/site";
import { Mark } from "./Mark";
import { BridgeDash } from "./BridgeDash";

/** The lockup's word part: DATA, the bridge-shaped dash, BRIDGE. */
export function WordmarkText() {
  const [a, b] = site.wordmark;
  return (
    <span className="wm-word" aria-hidden="true">
      <span>{a}</span><BridgeDash /><span>{b}</span>
    </span>
  );
}

/** Header lockup: the D/B symbol, then DATA—BRIDGE with a bridge for a dash. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`wordmark ${className}`} aria-label={`${site.name} — home`}>
      <span className="wm-mark"><Mark /></span>
      <WordmarkText />
    </a>
  );
}
