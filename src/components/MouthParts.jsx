// Two more drawings for the makharij: the upper teeth seen from below (an arch
// coloured by the names of the teeth), and the tongue seen from above with its
// parts (أقصى، وسط، طرف، الحافتان), optionally with the upper teeth around it.

// One side of the upper arch, from the middle backwards: [group, length].
const SIDE = [['thaniya', 1], ['rubaiya', 1], ['nab', 1], ['dahik', 1], ['tahin', 3], ['najidh', 1]];
export const TEETH = {
  thaniya: { name: 'الثنايا', n: 4 },
  rubaiya: { name: 'الرباعيات', n: 4 },
  nab: { name: 'الأنياب', n: 4 },
  dahik: { name: 'الضواحك', n: 4 },
  tahin: { name: 'الطواحن', n: 12 },
  najidh: { name: 'النواجذ', n: 4 },
};
const ORDER = Object.keys(TEETH);

// Points along a U-shaped arch (front at the top), t from 0 (middle) to 1 (back).
function archPoint(t, side, rx = 92, ry = 120, cx = 150, cy = 150) {
  const a = (Math.PI / 2) * Math.min(t, 1) * 1.08;
  return [cx + side * rx * Math.sin(a), cy - ry * Math.cos(a) + (t > 0.85 ? (t - 0.85) * 120 : 0)];
}

function toothList() {
  const out = [];
  let k = 0;
  const total = SIDE.reduce((n, [, c]) => n + c, 0);
  for (const [g, c] of SIDE) {
    for (let i = 0; i < c; i++, k++) {
      const t = (k + 0.5) / total;
      for (const side of [1, -1]) {
        const [x, y] = archPoint(t, side);
        const [x2, y2] = archPoint(t + 0.01, side);
        const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
        out.push({ g, x, y, ang, big: ['tahin', 'najidh', 'dahik'].includes(g) });
      }
    }
  }
  return out;
}
const TL = toothList();

export function TeethArch({ hl = [] }) {
  const on = new Set(hl.length ? hl : ORDER);
  return (
    <div className="teeth-wrap">
      <svg viewBox="30 10 240 220" className="teeth" role="img" aria-label="أسماء الأسنان">
        <path className="t-gum" d="M58 196 C50 110 90 22 150 22 C210 22 250 110 242 196 L218 196 C222 120 196 52 150 52 C104 52 78 120 82 196 Z" />
        <path className="t-palate" d="M82 196 C78 120 104 52 150 52 C196 52 222 120 218 196 Z" />
        <text x="150" y="130" textAnchor="middle" className="t-cap">سقف الفم</text>
        <text x="150" y="16" textAnchor="middle" className="t-cap">الشفة ↑ الأمام</text>
        {TL.map((t, i) => (
          <rect key={i} x={t.x - (t.big ? 10 : 7)} y={t.y - (t.big ? 9 : 6)} width={t.big ? 20 : 14} height={t.big ? 18 : 12} rx={t.big ? 6 : 4}
            transform={`rotate(${t.ang} ${t.x} ${t.y})`} className={`t-tooth tg-${ORDER.indexOf(t.g)} ${on.has(t.g) ? '' : 'dim'}`} />
        ))}
      </svg>
      <ul className="teeth-key">
        {ORDER.map((g, i) => (
          <li key={g} className={on.has(g) ? '' : 'dim'}><span className={`tg-${i}`} />{TEETH[g].name} <small>({TEETH[g].n})</small></li>
        ))}
      </ul>
    </div>
  );
}

// The tongue from above. Zones: aqsa, wasat, taraf, hafa (both edges),
// hafa-right / hafa-left (one edge), hafa-front (the front part of the edges, for ل).
const TZ = {
  aqsa: { d: 'M96 214 C96 196 100 182 104 172 L196 172 C200 182 204 196 204 214 C190 232 110 232 96 214 Z', name: 'أقصى اللسان', at: [150, 200] },
  wasat: { d: 'M104 172 C108 142 114 116 118 100 L182 100 C186 116 192 142 196 172 Z', name: 'وسط اللسان', at: [150, 138] },
  taraf: { d: 'M118 100 C122 72 134 50 150 48 C166 50 178 72 182 100 Z', name: 'طرف اللسان', at: [150, 76] },
  'hafa-right': { d: 'M196 172 C192 142 186 116 182 100 L172 100 C176 118 182 144 186 172 C190 188 194 200 196 212 L204 212 C204 196 200 184 196 172 Z', name: 'الحافة اليمنى', at: [192, 160] },
  'hafa-left': { d: 'M104 172 C108 142 114 116 118 100 L128 100 C124 118 118 144 114 172 C110 188 106 200 104 212 L96 212 C96 196 100 184 104 172 Z', name: 'الحافة اليسرى', at: [108, 160] },
  'hafa-front': { d: 'M118 100 C122 72 134 50 150 48 C166 50 178 72 182 100 L190 132 L180 134 L172 100 C168 76 160 60 150 58 C140 60 132 76 128 100 L120 134 L110 132 Z', name: 'أدنى الحافتين إلى الطرف', at: [150, 54] },
};
TZ.hafa = { d: `${TZ['hafa-right'].d} ${TZ['hafa-left'].d}`, name: 'حافتا اللسان', at: [108, 176] };

export function TongueTop({ hl = [], marks = {}, teeth = false }) {
  return (
    <svg viewBox="40 10 220 240" className="tongue-top" role="img" aria-label="اللسان من الأعلى">
      {teeth && (
        <g className="tt-teeth">
          {TL.map((t, i) => (
            <rect key={i} x={t.x - 6} y={t.y - 5} width="12" height="10" rx="3" transform={`translate(0 ${-14}) rotate(${t.ang} ${t.x} ${t.y})`} />
          ))}
        </g>
      )}
      <path className="tt-body" d="M150 46 C130 48 118 72 114 100 C108 140 98 180 96 214 C110 236 190 236 204 214 C202 180 192 140 186 100 C182 72 170 48 150 46 Z" />
      <path className="tt-groove" d="M150 66 C150 110 150 170 150 214" />
      {hl.filter((z) => TZ[z]).map((z) => <path key={z} d={TZ[z].d} className="tt-hl" />)}
      {hl.filter((z) => TZ[z]).map((z, i) => {
        const Z = TZ[z], t = marks[z] || Z.name, right = Z.at[0] >= 150, y = Math.max(22, Math.min(236, Z.at[1] + (i % 2) * 12));
        const w = t.length * 6 + 14, x = right ? 258 - w / 2 : 42 + w / 2;
        return (
          <g key={`l${z}`}>
            <path className="tt-lead" d={`M${Z.at[0]} ${Z.at[1]} L${right ? x - w / 2 : x + w / 2} ${y}`} />
            <rect className="tt-pill" x={x - w / 2} y={y - 10} width={w} height="20" rx="10" />
            <text className="tt-lbl" x={x} y={y + 4} textAnchor="middle">{t}</text>
          </g>
        );
      })}
    </svg>
  );
}
