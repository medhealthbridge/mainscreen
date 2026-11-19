/**
 * Geometry for the first-visit loading screen (see BrandIntro.tsx).
 *
 * A small beam bridge drawn in a shallow three-quarter view (camera raised, looking
 * slightly down: the top of the deck and the space beneath it are both visible).
 * Plan coordinates: x across (−110…110), d = depth from the back edge (0…D), z up.
 *
 * THE JOINT. The opening left in the middle of the deck is, in plan, exactly the
 * stepped band of the DataBridge symbol (src/lib/mark.ts) at 2.5 plan units per symbol
 * unit:  left half x −15…0, d 7.5…22.5   ·   right half x 0…15, d 0…15.
 * The last left segment carries a tongue at the back (x −15…0, d 0…7.5) and the last
 * right segment a tongue at the front (x 0…15, d 15…22.5), so their two stepped edges
 * frame that opening. The lime key piece is the band itself; when the camera tilts to
 * look straight down at it, it becomes the symbol's band and the D grows around it.
 */
export const VIEWBOX = { x: -140, y: -95, w: 280, h: 190 };

const D = 22.5; // deck depth = 9 symbol units
const T = 8; // deck thickness
const SY = 0.68; // how much depth shows (sin of the camera's tilt)
const CZ = 0.85; // vertical faces (cos of the tilt)
const Y0 = -12; // screen y of the deck's front top edge

type V = [number, number];
/** Project a plan point (x, d, z) to screen (SVG user units). */
const P = (x: number, d: number, z = 0): V => [x, Y0 - (D - d) * SY - z * CZ];
const pts = (vs: V[]) => vs.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(" ");
/** A horizontal face (top) from a plan outline at height z. */
const top = (outline: [number, number][], z = 0) => pts(outline.map(([x, d]) => P(x, d, z)));
/** A vertical face facing the viewer, at depth d, from x0 to x1, z from z0 down to z1. */
const front = (x0: number, x1: number, d: number, z0 = 0, z1 = -T) =>
  pts([P(x0, d, z0), P(x1, d, z0), P(x1, d, z1), P(x0, d, z1)]);
const rect = (x0: number, x1: number, d0 = 0, d1 = D): [number, number][] => [[x0, d0], [x1, d0], [x1, d1], [x0, d1]];

export type Face = { pts: string; tone: "top" | "front" | "inner" };
export type Piece = { id: string; faces: Face[] };

const PIER_Z = -44;
export const piers: Piece[] = [
  [-110, -86],
  [86, 110],
].map(([x0, x1], i) => ({
  id: `p${i + 1}`,
  faces: [
    { pts: top(rect(x0, x1, 2, 20.5), -T), tone: "top" },
    { pts: front(x0, x1, 20.5, -T, PIER_Z), tone: "front" },
  ],
}));
export const groundY = P(0, 20.5, PIER_Z)[1];

/** Deck segments, outermost first, per side. */
export const left: Piece[] = [
  { id: "l1", faces: [{ pts: top(rect(-110, -78)), tone: "top" }, { pts: front(-110, -78, D), tone: "front" }] },
  { id: "l2", faces: [{ pts: top(rect(-78, -46)), tone: "top" }, { pts: front(-78, -46, D), tone: "front" }] },
  {
    id: "l3",
    faces: [
      { pts: top([[-46, 0], [0, 0], [0, 7.5], [-15, 7.5], [-15, D], [-46, D]]), tone: "top" },
      { pts: front(-46, -15, D), tone: "front" },
      { pts: front(-15, 0, 7.5), tone: "inner" }, // the tongue's end, seen inside the opening
    ],
  },
];
export const right: Piece[] = [
  { id: "r1", faces: [{ pts: top(rect(78, 110)), tone: "top" }, { pts: front(78, 110, D), tone: "front" }] },
  { id: "r2", faces: [{ pts: top(rect(46, 78)), tone: "top" }, { pts: front(46, 78, D), tone: "front" }] },
  {
    id: "r3",
    faces: [
      { pts: top([[15, 0], [46, 0], [46, D], [0, D], [0, 15], [15, 15]]), tone: "top" },
      { pts: front(0, 46, D), tone: "front" },
    ],
  },
];

/** The key piece: the symbol's stepped band, as a solid block. */
export const key = {
  top: top([[-15, 7.5], [0, 7.5], [0, 0], [15, 0], [15, 15], [0, 15], [0, D], [-15, D]]),
  fronts: [front(-15, 0, D), front(0, 15, 15)],
};

/** The signal runs along the deck's centre line, pier to pier. */
export const signalY = P(0, D / 2)[1];
export const signalX = [-104, 104] as const;

/**
 * Camera: the affine move that tilts the view to straight down and brings the key's
 * top face onto the band of a flat symbol `BIG` units wide, centred on the stage.
 * Band (symbol units x 6–18, y 7.5–16.5) ↔ key top (x −15…15, d 0…22.5).
 */
export const BIG = 100;
const a = BIG / 2 / 30; // 12 of 24 symbol units across 30 plan units
const b = ((9 / 24) * BIG) / (D * SY); // 9 symbol units across the key's projected depth
const keyMidY = Y0 - (D / 2) * SY;
export const camera = `matrix(${a.toFixed(5)}, 0, 0, ${b.toFixed(5)}, 0, ${(-b * keyMidY).toFixed(4)})`;
