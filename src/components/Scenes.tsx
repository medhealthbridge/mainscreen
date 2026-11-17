/**
 * Line-art scenes. Monochrome strokes in currentColor, drawn in on scroll,
 * with crisp HTML "paper" cards layered on top. Each project can have one
 * (keyed by slug in `projectScenes`); projects without a scene fall back to
 * a large screenshot composition.
 */
import type { ReactNode } from "react";

const P = { pathLength: 1, className: "d" } as const; // drawable stroke

function Card({ left, top, width, r = 0, children, dark = false, d = 0 }: { left: string; top: string; width: string; r?: number; children: ReactNode; dark?: boolean; d?: number }) {
  return (
    <div className={`scard ${dark ? "scard-dark" : ""}`} style={{ left, top, width, "--r": `${r}deg`, "--d": d } as React.CSSProperties}>
      {children}
    </div>
  );
}

function Scene({ vb, children, cards, label }: { vb: string; children: ReactNode; cards?: ReactNode; label: string }) {
  const [, , w, h] = vb.split(" ").map(Number);
  return (
    <figure className="scene" data-reveal="draw" style={{ aspectRatio: `${w} / ${h}` }} role="img" aria-label={label}>
      <svg className="lineart" viewBox={vb} preserveAspectRatio="xMidYMid meet" aria-hidden="true">{children}</svg>
      {cards}
    </figure>
  );
}

const T = (x: number, y: number, s: string, size = 11, anchor: "start" | "middle" | "end" = "start") => (
  <text x={x} y={y} className="lt" fontSize={size} textAnchor={anchor}>{s}</text>
);

/* ---------------- Fieldbook ---------------- */
function FieldbookScene() {
  return (
    <Scene
      vb="0 0 1200 600"
      label="Line drawing: a service van follows a route to a customer's house while a phone shows the crew checklist."
      cards={
        <>
          <Card left="31%" top="15%" width="23%" r={-3}>
            <span className="sc-k">Job · J-2318</span>
            <b>Boiler service</b>
            <span>14 Larch Close</span>
            <span>Thu 09:30 · Crew A</span>
            <span className="sc-row"><i className="on" />Isolate supply</span>
            <span className="sc-row"><i className="on" />Inspect flue</span>
            <span className="sc-row"><i />Re-pressurise</span>
            <span className="sc-foot">In progress</span>
          </Card>
          <Card left="71%" top="74%" width="21%" r={2} d={2}>
            <span className="sc-k">Invoice</span>
            <span>Drafts when the job is done</span>
          </Card>
        </>
      }
    >
      <path {...P} className="d ground" d="M0 472 H1200" />
      <path {...P} d="M70 472 V332 Q70 318 84 318 H300 L372 382 H414 Q430 382 430 398 V472" />
      <path {...P} d="M306 332 L356 380 H306 Z" /><path {...P} d="M82 348 H290 M82 360 H200" />
      <path {...P} d="M92 318 V302 H282 V318 M120 302 V318 M150 302 V318 M180 302 V318 M210 302 V318 M240 302 V318" />
      <circle {...P} cx="150" cy="472" r="30" /><circle {...P} cx="150" cy="472" r="11" />
      <circle {...P} cx="362" cy="472" r="30" /><circle {...P} cx="362" cy="472" r="11" />
      {T(70, 528, "CREW A · VAN 2", 11)}{T(250, 528, "EN ROUTE · 6 MIN", 11)}
      <path {...P} className="d dash" d="M440 420 H520 V236 H880 V392 H930" />
      <rect x="516" y="232" width="8" height="8" className="node-fill" />
      <rect x="676" y="232" width="8" height="8" className="node-fill" data-line="" data-turn="scene" data-h="40" /><rect x="876" y="232" width="8" height="8" className="node-fill" />
      <path {...P} d="M932 472 V332 L1032 256 L1132 332 V472" />
      <rect {...P} x="1012" y="402" width="40" height="70" /><rect {...P} x="956" y="352" width="40" height="34" /><rect {...P} x="1068" y="352" width="40" height="34" />
      <path {...P} d="M1092 302 V262 H1112 V316" />
      <path {...P} d="M1032 226 C1012 200 1008 190 1008 180 A24 24 0 1 1 1056 180 C1056 190 1052 200 1032 226 Z" /><circle {...P} cx="1032" cy="180" r="8" />
      {T(932, 528, "14 LARCH CLOSE", 11)}
      <g transform="translate(560 448) rotate(-24)">
        <path {...P} d="M0 -8 H150 A8 8 0 0 1 150 8 H0" />
        <path {...P} d="M0 -8 L-6 -22 A28 28 0 1 0 -6 22 L0 8 M-30 -12 H-14 V12 H-30" />
      </g>
      <rect {...P} x="736" y="292" width="134" height="244" rx="18" />
      <path {...P} d="M750 322 H856 M756 352 H836 M756 380 H820" />
      <rect {...P} x="756" y="404" width="12" height="12" /><path {...P} d="M776 410 H846" />
      <rect {...P} x="756" y="428" width="12" height="12" /><path {...P} d="M776 434 H836" />
      <rect {...P} x="756" y="452" width="12" height="12" /><path {...P} d="M776 458 H826" />
      <path {...P} d="M758 410 L762 414 L768 406 M758 434 L762 438 L768 430" />
      <rect x="756" y="488" width="94" height="28" rx="4" className="solid" />
      <text x="803" y="506" className="lt lt-inv" fontSize="10" textAnchor="middle">MARK DONE</text>
    </Scene>
  );
}

/* ---------------- Halden Physio ---------------- */
function HaldenScene() {
  const cells: ReactNode[] = [];
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 7; c++) {
      const day = r * 7 + c - 4;
      const x = 772 + c * 49, y = 186 + r * 44;
      if (day < 1 || day > 30) continue;
      const sel = day === 20;
      const off = [3, 7, 11, 14, 18, 25].includes(day) || c > 4;
      cells.push(
        <g key={`${r}-${c}`}>
          {sel && <rect x={x + 2} y={y + 2} width="44" height="38" className="solid" />}
          <text x={x + 24} y={y + 26} className={`lt ${sel ? "lt-inv" : ""} ${off ? "lt-dim" : ""}`} fontSize="11" textAnchor="middle">{day}</text>
        </g>,
      );
    }
  return (
    <Scene
      vb="0 0 1200 600"
      label="Line drawing: a clinic website with a booking button, a calendar with one appointment selected, and a phone."
      cards={
        <>
          <Card left="67%" top="72%" width="25%" r={-2}>
            <span className="sc-k">✓ Booking confirmed</span>
            <b>First assessment</b>
            <span>Wed 20 Nov · 17:40</span>
            <span>With Idris Coleman</span>
          </Card>
          <Card left="4%" top="80%" width="27%" r={1.5} d={2}>
            <span className="sc-k">“Which appointment do I need?”</span>
            <span>Start with a first assessment →</span>
          </Card>
        </>
      }
    >
      <rect {...P} x="90" y="70" width="600" height="410" rx="6" />
      <path {...P} d="M90 100 H690" /><circle {...P} cx="110" cy="85" r="4" /><circle {...P} cx="124" cy="85" r="4" /><circle {...P} cx="138" cy="85" r="4" />
      <path {...P} className="d thick" d="M130 162 H420 M130 196 H380 M130 230 H300" />
      <path {...P} d="M130 266 H390 M130 282 H352" />
      <rect {...P} x="130" y="304" width="160" height="34" rx="17" /><rect {...P} x="302" y="304" width="132" height="34" rx="17" />
      {T(210, 325, "BOOK AN APPOINTMENT", 9, "middle")}{T(368, 325, "FIND TREATMENT", 9, "middle")}
      <rect {...P} x="470" y="128" width="190" height="200" rx="8" />
      <circle {...P} cx="565" cy="208" r="24" /><path {...P} d="M518 328 C518 274 544 256 565 256 C586 256 612 274 612 328" />
      <rect {...P} x="130" y="366" width="124" height="80" rx="6" /><rect {...P} x="134" y="370" width="116" height="72" rx="4" />
      <rect {...P} x="266" y="366" width="124" height="80" rx="6" /><rect {...P} x="402" y="366" width="124" height="80" rx="6" /><rect {...P} x="538" y="366" width="124" height="80" rx="6" />
      {T(146, 394, "BACK & NECK", 9)}{T(282, 394, "SPORTS", 9)}{T(418, 394, "JOINTS", 9)}{T(554, 394, "AFTER SURGERY", 9)}
      <rect {...P} x="760" y="110" width="366" height="320" rx="4" />
      {T(780, 142, "NOVEMBER 2026", 11)}{T(1106, 142, "← →", 11, "end")}
      <path {...P} d="M760 158 H1126" />
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <text key={i} x={796 + i * 49} y={178} className="lt lt-dim" fontSize="10" textAnchor="middle">{d}</text>)}
      {cells}
      <path {...P} className="d dash" d="M210 338 V530 H700" /><path {...P} className="d dash" d="M967 430 V470" />
      <rect x="206" y="526" width="8" height="8" className="node-fill" />
      <rect x="436" y="526" width="8" height="8" className="node-fill" data-line="" data-turn="scene" data-h="40" />
      <rect x="632" y="256" width="146" height="286" rx="22" className="occlude" />
      <rect {...P} x="632" y="256" width="146" height="286" rx="22" />
      <path {...P} className="d thick" d="M652 312 H742 M652 336 H720" />
      <path {...P} d="M652 362 H756 M652 376 H736" />
      <rect {...P} x="652" y="396" width="104" height="58" rx="6" />
      <rect x="652" y="494" width="104" height="26" rx="13" className="solid" />
      <text x="704" y="511" className="lt lt-inv" fontSize="9" textAnchor="middle">BOOK</text>
    </Scene>
  );
}

/* ---------------- Ledgerroom ---------------- */
function LedgerroomScene() {
  const rows = [
    { y: 196, done: true, s: "RECEIVED" },
    { y: 258, done: true, s: "RECEIVED" },
    { y: 320, done: false, s: "WAITING" },
    { y: 382, done: false, s: "OVERDUE" },
  ];
  return (
    <Scene
      vb="0 0 1200 600"
      label="Line drawing: a stack of bank statements and a receipt are uploaded into a client portal checklist."
      cards={
        <>
          <Card left="62%" top="77%" width="27%" r={-1.5}>
            <span className="sc-k">Month-end · Copperleaf Café</span>
            <b>8 of 12 received</b>
            <span>Auto-reminder Thu 09:00</span>
          </Card>
          <Card left="3%" top="81%" width="29%" r={2} d={2}>
            <span className="sc-k">Photo of receipt</span>
            <span>Matched to “Repair receipts” ✓</span>
          </Card>
        </>
      }
    >
      <g transform="rotate(-8 220 300)"><rect {...P} x="80" y="140" width="260" height="340" /></g>
      <g transform="rotate(-3 230 300)"><rect {...P} x="100" y="128" width="260" height="340" /></g>
      <rect x="120" y="116" width="260" height="340" className="occlude" />
      <rect {...P} x="120" y="116" width="260" height="340" />
      {T(140, 150, "BANK STATEMENT", 12)}{T(140, 168, "MARCH · BUSINESS ACCOUNT", 9)}
      <path {...P} d="M140 186 H360 M140 214 H300 M330 214 H360 M140 238 H280 M330 238 H360 M140 262 H310 M330 262 H360 M140 286 H260 M330 286 H360 M140 310 H290 M330 310 H360 M140 334 H270 M330 334 H360" />
      <path {...P} className="d thick" d="M140 410 H230 M310 410 H360" />
      <path d="M410 176 H540 V430 L527 418 L514 430 L501 418 L488 430 L475 418 L462 430 L449 418 L436 430 L423 418 L410 430 Z" className="occlude" />
      <path {...P} d="M410 176 H540 V430 L527 418 L514 430 L501 418 L488 430 L475 418 L462 430 L449 418 L436 430 L423 418 L410 430 Z" />
      <path {...P} d="M428 206 H522 M428 230 H500 M428 254 H512 M428 278 H490 M428 302 H506" />
      {T(428, 350, "TOTAL", 10)}{T(522, 350, "248.00", 10, "end")}
      <path {...P} className="d dash" d="M540 300 H600 V206 H660" /><path {...P} d="M650 198 L662 206 L650 214" />
      <rect x="596" y="296" width="8" height="8" className="node-fill" data-line="" data-turn="scene" data-h="40" />
      <rect {...P} x="660" y="110" width="470" height="380" rx="6" />
      <path {...P} d="M660 142 H1130" /><circle {...P} cx="680" cy="126" r="4" /><circle {...P} cx="694" cy="126" r="4" /><circle {...P} cx="708" cy="126" r="4" />
      {T(690, 176, "OUTSTANDING · COPPERLEAF CAFÉ", 11)}
      {rows.map((r) => (
        <g key={r.y}>
          <rect {...P} x="690" y={r.y} width="410" height="50" rx="4" />
          {r.done ? <circle cx="716" cy={r.y + 25} r="10" className="solid" /> : <circle {...P} cx="716" cy={r.y + 25} r="10" />}
          {r.done && <path d={`M711 ${r.y + 25} L715 ${r.y + 29} L722 ${r.y + 20}`} className="check-inv" />}
          <path {...P} d={`M740 ${r.y + 19} H900 M740 ${r.y + 33} H850`} />
          {T(1086, r.y + 30, r.s, 9, "end")}
        </g>
      ))}
      <path {...P} className="d thick" d="M690 462 H880" />
    </Scene>
  );
}

export const projectScenes: Record<string, () => ReactNode> = {
  fieldbook: () => <FieldbookScene />,
  "halden-physio": () => <HaldenScene />,
  ledgerroom: () => <LedgerroomScene />,
};
