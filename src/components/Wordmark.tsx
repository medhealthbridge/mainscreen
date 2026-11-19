import { site } from "@/content/site";
import { Mark } from "./Mark";

/** Header lockup: the symbol, then the uninterrupted wordmark. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`wordmark ${className}`} aria-label={`${site.name} — home`}>
      <span className="wm-mark"><Mark split /></span>
      <span className="wm-word" aria-hidden="true"><span>{site.wordmark}</span></span>
    </a>
  );
}
