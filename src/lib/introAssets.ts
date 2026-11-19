/**
 * The supplied bridge artwork, cut into layers for the first-visit intro.
 *
 * Source: the two renders supplied for the brief (bridge-open.svg, bridge-closed.svg —
 * PNG renders, 1672 × 941). Nothing is redrawn: each layer below is pixels cut from those
 * renders with a soft alpha against an estimated empty backdrop (plate), so the layers
 * composited over the plate rebuild the open render. The whole bridge comes from the
 * open render; only the seated joint comes from the closed render (aligned and
 * feathered), so nothing else moves when the piece locks in. Regenerate with
 * scripts/intro/build_layers.py if the artwork changes.
 */
export const ART = { w: 1672, h: 941 };
export const ASSET_DIR = "/intro";

/** Reveal order (reading order): left pylon, its cable fan + half deck, then the right side. */
export const LAYERS = [
  { id: "pylon-left", kind: "pyl", box: { x: 0, y: 70, w: 359, h: 871 } },
  { id: "fan-left", kind: "fanL", box: { x: 247, y: 178, w: 655, h: 763 } },
  { id: "pylon-right", kind: "pyl", box: { x: 1384, y: 170, w: 228, h: 647 } },
  { id: "fan-right", kind: "fanR", box: { x: 898, y: 177, w: 532, h: 569 } },
] as const;
export const PLATE = { id: "plate", box: { x: 0, y: 0, w: 1672, h: 941 } };
/** The lime piece as it floats in the open render. */
export const PIECE = { id: "piece", box: { x: 799, y: 512, w: 203, h: 83 } };
/** The seated joint, from the closed render. */
export const JOINT = { id: "joint", box: { x: 803, y: 587, w: 226, h: 99 } };
/** Lowering: floating piece → seated position (centre offset in px of the art, and scale). */
export const LOWER = { dx: 3.5, dy: 85.0, scale: 0.9330 };
/** Top edge of the deck, pylon to pylon (for the highlight). */
export const DECK_LINE = "265,631 845,604 955,602 1440,580";
/**
 * The stepped edge used for the match-cut: the first step of the seated piece's
 * underside on the right (x 936, y 656 → 675). In the logo it is the step of the
 * symbol's band at (12, 13.5 → 16.5); one symbol unit = 19 / 3 px of the art.
 */
export const EDGE = { x: 936, y: 665.5, unit: 19 / 3, symbol: { x: 12, y: 15 } };
export const ALL_ASSETS = [PLATE, ...LAYERS, PIECE, JOINT].map((l) => `${ASSET_DIR}/${l.id}.webp`);
