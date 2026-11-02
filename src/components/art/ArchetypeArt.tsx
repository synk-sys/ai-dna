import { useId } from "react";
import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";

/**
 * Original vector illustrations for each archetype. Pure SVG so they stay
 * crisp at any card size and export cleanly to PNG.
 */

interface ArtProps {
  id: ArchetypeId;
  className?: string;
  /** Static art for exports and reduced motion. */
  still?: boolean;
  /** "cover" crops to fill a non-square frame instead of letterboxing. */
  fit?: "contain" | "cover";
}

type SceneProps = { p: string; s: string; d: string; u: (name: string) => string; still: boolean };

export function ArchetypeArt({ id, className, still = false, fit = "contain" }: ArtProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (name: string) => `${raw}-${name}`;
  const { primary: p, secondary: s, deep: d } = ARCHETYPES[id].colors;
  const Scene = SCENES[id];
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
      className={className}
      role="img"
      aria-label={`${ARCHETYPES[id].name} illustration`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={u("bg")} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={p} stopOpacity="0.45" />
          <stop offset="55%" stopColor={d} stopOpacity="0.9" />
          <stop offset="100%" stopColor={d} />
        </radialGradient>
        <linearGradient id={u("ps")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p} />
          <stop offset="100%" stopColor={s} />
        </linearGradient>
        <filter id={u("glow")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="400" fill={`url(#${u("bg")})`} />
      <Stars color={s} />
      <Scene p={p} s={s} d={d} u={u} still={still} />
    </svg>
  );
}

const STAR_POINTS: [number, number, number][] = [
  [32, 40, 1.4], [88, 22, 1], [150, 54, 1.2], [260, 30, 1.6], [330, 64, 1], [372, 120, 1.3],
  [20, 140, 1], [56, 210, 1.5], [350, 200, 1.1], [380, 300, 1.4], [28, 330, 1.2], [120, 372, 1],
  [300, 372, 1.3], [212, 16, 1], [180, 110, 0.9], [240, 96, 1.1],
];

function Stars({ color }: { color: string }) {
  return (
    <g opacity="0.8">
      {STAR_POINTS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? color : "#fff"} opacity={0.4 + (i % 4) * 0.15} />
      ))}
    </g>
  );
}

function spin(still: boolean, dur: number, from = "0 200 200", to = "360 200 200") {
  return still ? null : (
    <animateTransform attributeName="transform" type="rotate" from={from} to={to} dur={`${dur}s`} repeatCount="indefinite" />
  );
}

function pulse(still: boolean, dur: number, values = "0.5;1;0.5") {
  return still ? null : <animate attributeName="opacity" values={values} dur={`${dur}s`} repeatCount="indefinite" />;
}

/** Gear outline path centered at (cx, cy). */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / (teeth * 4);
  for (let i = 0; i < teeth * 4; i++) {
    const rr = i % 4 < 2 ? r + depth : r;
    const a = i * step;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function Visionary({ p, s, u, still }: SceneProps) {
  return (
    <g>
      {/* galaxy */}
      <g filter={`url(#${u("glow")})`} opacity="0.9">
        {[0, 30, 60, 90, 120, 150].map((r, i) => (
          <ellipse
            key={r}
            cx="200"
            cy="150"
            rx={120 - i * 12}
            ry={34 - i * 3}
            transform={`rotate(${r - 20} 200 150)`}
            fill="none"
            stroke={i % 2 ? s : p}
            strokeOpacity={0.55 - i * 0.05}
            strokeWidth="2"
          />
        ))}
        <circle cx="200" cy="150" r="16" fill="#fff" />
        <circle cx="200" cy="150" r="30" fill={p} opacity="0.35">
          {pulse(still, 4, "0.25;0.55;0.25")}
        </circle>
      </g>
      {/* ringed planet */}
      <g transform="translate(316 92)">
        <circle r="18" fill={`url(#${u("ps")})`} />
        <ellipse rx="30" ry="7" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" transform="rotate(-18)" />
      </g>
      {/* holographic future city */}
      <g>
        {[
          [40, 300, 34, 100], [80, 270, 26, 130], [112, 236, 30, 164], [148, 286, 22, 114],
          [176, 206, 48, 194], [230, 256, 28, 144], [264, 226, 36, 174], [306, 280, 24, 120], [334, 250, 30, 150],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} rx="3" fill={i === 4 ? p : s} fillOpacity={0.14 + (i % 3) * 0.05} stroke={i % 2 ? p : s} strokeOpacity="0.8" strokeWidth="1.5" />
            {Array.from({ length: Math.floor((h ?? 0) / 22) }, (_, j) => (
              <rect key={j} x={(x ?? 0) + 6} y={(y ?? 0) + 10 + j * 22} width={(w ?? 0) - 12} height="3" rx="1.5" fill="#fff" opacity={(i + j) % 3 === 0 ? 0.85 : 0.25} />
            ))}
          </g>
        ))}
        <path d="M200 206 L200 180" stroke="#fff" strokeWidth="2" />
        <circle cx="200" cy="176" r="4" fill="#fff">
          {pulse(still, 1.6)}
        </circle>
        <rect x="0" y="388" width="400" height="12" fill={p} opacity="0.35" />
      </g>
    </g>
  );
}

function Builder({ p, s, d, u, still }: SceneProps) {
  return (
    <g>
      {/* blueprint grid */}
      <g stroke={s} strokeOpacity="0.12">
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${i * 40} 0V400M0 ${i * 40}H400`} />
        ))}
      </g>
      {/* gears */}
      <g filter={`url(#${u("glow")})`}>
        <g>
          <path d={gearPath(110, 120, 46, 10, 12)} fill="none" stroke={p} strokeWidth="3" />
          <circle cx="110" cy="120" r="16" fill="none" stroke={p} strokeWidth="3" />
          {spin(still, 16, "0 110 120", "360 110 120")}
        </g>
        <g>
          <path d={gearPath(186, 74, 26, 8, 9)} fill="none" stroke={s} strokeWidth="3" />
          <circle cx="186" cy="74" r="9" fill={s} />
          {spin(still, 10, "360 186 74", "0 186 74")}
        </g>
      </g>
      {/* robot */}
      <g transform="translate(250 160)">
        <line x1="50" y1="-6" x2="50" y2="-34" stroke={s} strokeWidth="3" />
        <circle cx="50" cy="-38" r="7" fill={s}>
          {pulse(still, 1.4)}
        </circle>
        <rect x="0" y="0" width="100" height="78" rx="22" fill={d} stroke={`url(#${u("ps")})`} strokeWidth="4" />
        <rect x="14" y="18" width="72" height="38" rx="14" fill={p} fillOpacity="0.2" />
        <circle cx="36" cy="37" r="8" fill="#fff" />
        <circle cx="64" cy="37" r="8" fill="#fff" />
        <circle cx="38" cy="37" r="3.5" fill={d} />
        <circle cx="66" cy="37" r="3.5" fill={d} />
        <rect x="16" y="88" width="68" height="80" rx="16" fill={d} stroke={p} strokeWidth="3" />
        <circle cx="50" cy="118" r="12" fill={p} opacity="0.85">
          {pulse(still, 2.2, "0.5;0.95;0.5")}
        </circle>
        <path d="M16 106 C-20 112 -24 150 -8 168" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M84 106 C112 100 124 78 120 58" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      {/* wrench */}
      <g transform="rotate(-35 110 300)">
        <rect x="64" y="292" width="96" height="16" rx="8" fill={`url(#${u("ps")})`} />
        <path d="M60 300 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M50 290 h20 v20 h-20z" fill={p} fillRule="evenodd" />
      </g>
      {/* sparks */}
      {[[230, 330], [252, 312], [214, 306], [240, 352]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${(y ?? 0) - 7}L${(x ?? 0) + 2} ${(y ?? 0) - 2}L${(x ?? 0) + 7} ${y}L${(x ?? 0) + 2} ${(y ?? 0) + 2}L${x} ${(y ?? 0) + 7}L${(x ?? 0) - 2} ${(y ?? 0) + 2}L${(x ?? 0) - 7} ${y}L${(x ?? 0) - 2} ${(y ?? 0) - 2}Z`} fill="#fff">
          {pulse(still, 1 + i * 0.3, "0.2;1;0.2")}
        </path>
      ))}
    </g>
  );
}

function Explorer({ p, s, d, u, still }: SceneProps) {
  const constellation: [number, number][] = [[48, 70], [104, 46], [150, 84], [128, 130], [70, 120]];
  return (
    <g>
      {/* constellation */}
      <g stroke={s} strokeOpacity="0.6" strokeWidth="1.5" fill="none">
        <path d={`M${constellation.map(([x, y]) => `${x} ${y}`).join("L")}Z`} strokeDasharray="4 5" />
      </g>
      {constellation.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#fff" filter={`url(#${u("glow")})`} />
      ))}
      {/* holographic globe */}
      <g transform="translate(230 190)" filter={`url(#${u("glow")})`}>
        <circle r="104" fill={p} fillOpacity="0.08" stroke={p} strokeWidth="2.5" />
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = (lat / 90) * 104;
          const rx = Math.sqrt(104 * 104 - y * y);
          return <ellipse key={lat} cx="0" cy={y} rx={rx} ry={rx * 0.18} fill="none" stroke={s} strokeOpacity="0.55" strokeWidth="1.5" />;
        })}
        <g>
          {[20, 50, 80].map((w) => (
            <ellipse key={w} rx={w} ry="104" fill="none" stroke={p} strokeOpacity="0.5" strokeWidth="1.5" />
          ))}
          {still ? null : (
            <animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" dur="14s" repeatCount="indefinite" />
          )}
        </g>
        {/* map pins */}
        {[[-40, -30], [36, 12], [-12, 54]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C-10 -12 -10 -24 0 -28 C10 -24 10 -12 0 0Z" fill={i === 1 ? "#fff" : s} />
            <circle cy="-19" r="4" fill={d} />
          </g>
        ))}
      </g>
      {/* magnifying glass */}
      <g transform="translate(96 284) rotate(-30)">
        <circle r="46" fill={s} fillOpacity="0.12" stroke={`url(#${u("ps")})`} strokeWidth="9" />
        <path d="M-22 -18 A28 28 0 0 1 10 -30" stroke="#fff" strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="-9" y="50" width="18" height="70" rx="9" fill={p} />
        {still ? null : (
          <animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;6 -4;0 0" dur="5s" repeatCount="indefinite" />
        )}
      </g>
    </g>
  );
}

function Creator({ p, s, u, still }: SceneProps) {
  const splats = ["#FBBC04", "#4285F4", "#34A853", p, s];
  return (
    <g>
      {/* paint swirls */}
      <g filter={`url(#${u("glow")})`} fill="none" strokeLinecap="round">
        <path d="M30 120 C90 40 170 180 240 90 S360 60 380 140" stroke={p} strokeWidth="10" strokeOpacity="0.85" />
        <path d="M20 170 C100 120 160 230 250 160 S350 150 390 210" stroke={s} strokeWidth="7" strokeOpacity="0.7" />
        <path d="M40 60 C120 30 180 90 260 40" stroke="#FBBC04" strokeWidth="4" strokeOpacity="0.55" />
      </g>
      {/* holographic canvas on easel */}
      <g transform="translate(120 160)">
        <path d="M30 220 L80 0 M130 220 L80 0 M80 0 L80 230" stroke="#fff" strokeOpacity="0.45" strokeWidth="5" strokeLinecap="round" />
        <rect x="-10" y="20" width="180" height="140" rx="10" fill={p} fillOpacity="0.14" stroke={`url(#${u("ps")})`} strokeWidth="4" />
        <circle cx="50" cy="70" r="22" fill="#FBBC04" opacity="0.9" />
        <path d="M0 150 L50 100 L84 128 L120 84 L160 150Z" fill={s} opacity="0.8" />
        <path d="M0 150 L36 120 L70 150Z" fill={p} opacity="0.9" />
      </g>
      {/* brush */}
      <g transform="rotate(38 320 270)">
        <rect x="310" y="200" width="16" height="110" rx="8" fill="#fff" fillOpacity="0.85" />
        <rect x="308" y="300" width="20" height="14" fill={s} />
        <path d="M308 314 Q318 350 328 314Z" fill={p} />
        {still ? null : (
          <animateTransform attributeName="transform" type="rotate" values="38 320 270;30 320 270;38 320 270" dur="3.2s" repeatCount="indefinite" />
        )}
      </g>
      {/* splats */}
      {splats.map((c, i) => (
        <circle key={i} cx={46 + i * 30} cy={350 - (i % 2) * 14} r={9 - (i % 3) * 2} fill={c}>
          {pulse(still, 2 + i * 0.4, "0.6;1;0.6")}
        </circle>
      ))}
    </g>
  );
}

function Strategist({ p, s, d, u, still }: SceneProps) {
  // Isometric 6x6 chessboard.
  const tiles = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const x = 200 + (c - r) * 26;
      const y = 236 + (c + r) * 14;
      tiles.push(
        <path
          key={`${r}-${c}`}
          d={`M${x} ${y}l26 14l-26 14l-26 -14z`}
          fill={(r + c) % 2 ? p : d}
          fillOpacity={(r + c) % 2 ? 0.35 : 0.9}
          stroke={s}
          strokeOpacity="0.35"
        />,
      );
    }
  }
  return (
    <g>
      {/* geometric data lattice */}
      <g stroke={s} strokeOpacity="0.35" fill="none" strokeWidth="1.5">
        <path d="M60 60 L140 30 L220 70 L300 34 L360 90" />
        <path d="M60 60 L90 140 L140 30 M220 70 L250 150 L300 34 M90 140 L250 150" />
      </g>
      {[[60, 60], [140, 30], [220, 70], [300, 34], [360, 90], [90, 140], [250, 150]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={i % 2 ? "#fff" : s}>
          {pulse(still, 2 + i * 0.35)}
        </circle>
      ))}
      {/* bar chart */}
      {[34, 58, 44, 76].map((h, i) => (
        <rect key={i} x={30 + i * 18} y={260 - h} width="12" height={h} rx="3" fill={`url(#${u("ps")})`} opacity="0.8" />
      ))}
      <g filter={`url(#${u("glow")})`}>{tiles}</g>
      {/* knight */}
      <g transform="translate(200 214)" filter={`url(#${u("glow")})`}>
        <ellipse cx="0" cy="40" rx="30" ry="10" fill={s} opacity="0.5" />
        <path
          d="M-24 38 L24 38 L20 24 L12 20 C14 4 22 -8 18 -26 C14 -44 -2 -54 -18 -50 L-26 -60 L-28 -44 C-38 -36 -42 -22 -36 -14 C-30 -8 -20 -12 -12 -18 C-12 -6 -20 6 -16 20 L-20 24Z"
          fill={`url(#${u("ps")})`}
          stroke="#fff"
          strokeOpacity="0.8"
          strokeWidth="2"
        />
        <circle cx="-6" cy="-34" r="3" fill={d} />
        {still ? null : (
          <animateTransform attributeName="transform" type="translate" values="200 214;200 206;200 214" dur="4s" repeatCount="indefinite" />
        )}
      </g>
    </g>
  );
}

function Connector({ p, s, u, still }: SceneProps) {
  const nodes: [number, number][] = [
    [200, 190], [90, 110], [310, 100], [80, 270], [320, 280], [200, 330], [200, 64], [140, 200], [262, 196],
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [1, 3], [2, 4], [3, 5], [4, 5], [7, 1], [7, 3], [8, 2], [8, 4],
  ];
  return (
    <g>
      <circle cx="200" cy="190" r="120" fill={p} opacity="0.12">
        {pulse(still, 5, "0.08;0.2;0.08")}
      </circle>
      <g stroke={`url(#${u("ps")})`} strokeWidth="2.5" strokeLinecap="round" filter={`url(#${u("glow")})`}>
        {edges.map(([a, b], i) => {
          const [x1, y1] = nodes[a]!;
          const [x2, y2] = nodes[b]!;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity="0.7" strokeDasharray={i % 3 === 0 ? "0" : "6 6"}>
              {still || i % 3 === 0 ? null : (
                <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.6s" repeatCount="indefinite" />
              )}
            </line>
          );
        })}
      </g>
      {nodes.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r={i === 0 ? 30 : 18} fill={i === 0 ? p : "#1a0f02"} stroke={i === 0 ? "#fff" : s} strokeWidth="3" />
          {/* little person glyph */}
          <circle cy={i === 0 ? -8 : -5} r={i === 0 ? 8 : 5} fill={i === 0 ? "#fff" : p} />
          <path
            d={i === 0 ? "M-14 16 C-14 4 14 4 14 16Z" : "M-9 10 C-9 2 9 2 9 10Z"}
            fill={i === 0 ? "#fff" : p}
          />
        </g>
      ))}
      {/* sparkle */}
      <path d="M200 120 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z" fill="#fff">
        {pulse(still, 2)}
      </path>
    </g>
  );
}

const SCENES: Record<ArchetypeId, (props: SceneProps) => React.JSX.Element> = {
  visionary: Visionary,
  builder: Builder,
  explorer: Explorer,
  creator: Creator,
  strategist: Strategist,
  connector: Connector,
};
