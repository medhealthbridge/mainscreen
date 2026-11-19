import { MARK_BOTTOM, MARK_PATH, MARK_TOP } from "@/lib/mark";

/**
 * The DataBridge symbol (see src/lib/mark.ts). Colour comes from `currentColor`.
 * `split` also renders the two cut pieces used by the entrance; they are hidden
 * (they are hidden by CSS; the single, seamless
 * path is what is drawn at rest).
 */
export function Mark({ className = "", split = false }: { className?: string; split?: boolean }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path className="mk-full" fillRule="evenodd" d={MARK_PATH} />
      {split && (
        <g className="mk-split">
          <path className="mk-a" fillRule="evenodd" d={MARK_TOP} />
          <path className="mk-b" fillRule="evenodd" d={MARK_BOTTOM} />
        </g>
      )}
    </svg>
  );
}
