/**
 * The dash in DATA—BRIDGE, drawn as a bridge: one solid lime span with an arch cut
 * out beneath its deck, standing on the baseline. Sized in em so it scales with the
 * wordmark; colour from `currentColor`. viewBox 40 × 16 (deck 7 units deep at the
 * crown, arch opening 27 units wide).
 */
export function BridgeDash({ className = "" }: { className?: string }) {
  return (
    <svg className={`bridge-dash ${className}`} viewBox="0 0 40 16" aria-hidden="true" focusable="false">
      <path d="M0 0H40V16H33.5C33.5 10.6 27.6 7 20 7S6.5 10.6 6.5 16H0Z" />
    </svg>
  );
}
