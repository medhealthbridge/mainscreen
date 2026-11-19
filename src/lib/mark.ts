/**
 * THE DATABRIDGE SYMBOL — custom geometry on a 24 × 24 grid.
 *
 *  · Silhouette: a heavy D. Flat left spine (x 0–6), right edge squared off with
 *    soft 7.5-unit corners.
 *  · Two counters cut into the face hint at a B. Their facing edges share one
 *    stair-step at x = 12, so the solid band between them rises one level from
 *    left to right: y 10.5–16.5 on the left, y 7.5–13.5 on the right. The two
 *    counters are 180° images of each other (6 × 6 + 6 × 3 units).
 *  · Every edge sits on a multiple of 1.5 units, so at 16 px (favicon) and 32 px
 *    each edge lands on a whole pixel: the step stays crisp in one colour.
 *  · The cut used by the entrance runs through the middle of the band and follows
 *    the same step (y 13.5 → step at x 12 → y 10.5). Each piece keeps its own
 *    counter whole, so the halves read as two pieces of cut type.
 *
 * All paths use the even-odd rule.
 */
const OUTER_TOP = "M0 0H16.5A7.5 7.5 0 0 1 24 7.5";
const OUTER_BOTTOM = "A7.5 7.5 0 0 1 16.5 24H0Z";
/** Upper counter: 6 high on the left, 3 high on the right. */
const COUNTER_UP = "M6 4.5H16.5A1.5 1.5 0 0 1 18 6V7.5H12V10.5H6Z";
/** Lower counter: 3 high on the left, 6 high on the right. */
const COUNTER_DOWN = "M6 16.5H12V13.5H18V18A1.5 1.5 0 0 1 16.5 19.5H6Z";

/** The complete symbol (used whenever it is at rest). */
export const MARK_PATH = `${OUTER_TOP}V16.5${OUTER_BOTTOM}${COUNTER_UP}${COUNTER_DOWN}`;
/** Upper piece: everything above the stepped cut. */
export const MARK_TOP = `${OUTER_TOP}V10.5H12V13.5H0Z${COUNTER_UP}`;
/** Lower piece: everything below the stepped cut. */
export const MARK_BOTTOM = `M0 13.5H12V10.5H24V16.5${OUTER_BOTTOM}${COUNTER_DOWN}`;
