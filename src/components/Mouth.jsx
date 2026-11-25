// A schematic side view of the speech organs (face on the right, as in the
// course slides). `hl` lists the zones to highlight; each highlighted zone gets
// a callout label in the margin, which `marks` can replace (e.g. letters).
// Zones: khayshum, hanak, jawf, shafatan, asnan, taraf-lisan, wasat-lisan,
// aqsa-lisan, hafa-lisan, adna-halq, wasat-halq, aqsa-halq.
const R = 510, L = 58, B = 334; // label columns (right, left) and bottom row
const ZONES = {
  khayshum: { d: 'M400 118 C360 100 290 98 250 108 L250 134 C300 128 360 132 404 144 Z', at: [330, 116], lb: [R, 50], name: 'الخيشوم' },
  hanak: { d: 'M404 150 C370 140 330 140 300 146 L300 156 C330 150 370 152 400 162 Z', at: [350, 146], lb: [R, 100], name: 'الحنك الأعلى' },
  jawf: { d: 'M398 172 C360 162 320 160 290 172 C272 180 262 196 258 236 L248 236 C250 194 262 172 288 162 C322 150 362 154 402 166 Z', at: [300, 166], lb: [L, 110], name: 'الجوف' },
  asnan: { d: 'M414 162 L424 164 L422 184 L416 182 Z M414 194 L422 192 L422 210 L416 210 Z', at: [419, 173], lb: [R, 150], name: 'الأسنان' },
  shafatan: { d: 'M424 160 C438 166 442 178 438 186 L426 186 Z M426 190 C440 194 440 206 434 212 L424 210 Z', at: [436, 198], lb: [R, 200], name: 'الشفتان' },
  'taraf-lisan': { d: 'M410 188 C402 180 390 176 378 175 L380 210 C394 208 406 200 413 194 Z', at: [398, 190], lb: [R, 248], name: 'طرف اللسان' },
  'hafa-lisan': { d: 'M404 186 C382 174 350 168 320 172 L320 182 C350 178 382 184 402 194 Z', at: [352, 178], lb: [R, 296], name: 'حافتا اللسان' },
  'wasat-lisan': { d: 'M378 175 C356 170 338 170 322 172 L326 224 C345 222 364 216 380 210 Z', at: [352, 205], lb: [352, B], name: 'وسط اللسان' },
  'aqsa-lisan': { d: 'M322 172 C300 174 282 184 272 200 L280 232 C295 228 312 226 326 224 Z', at: [298, 205], lb: [262, B], name: 'أقصى اللسان' },
  'adna-halq': { d: 'M240 186 L264 186 L262 222 L240 222 Z', at: [252, 204], lb: [L, 175], name: 'أدنى الحلق' },
  'wasat-halq': { d: 'M240 224 L262 224 L262 258 L240 258 Z', at: [251, 241], lb: [L, 230], name: 'وسط الحلق' },
  'aqsa-halq': { d: 'M240 260 L262 260 L264 296 L242 296 Z', at: [252, 278], lb: [L, 285], name: 'أقصى الحلق' },
};

// Larger zones first, so thin ones drawn later stay tappable.
const HIT_ORDER = ['khayshum', 'hanak', 'wasat-lisan', 'aqsa-lisan', 'hafa-lisan', 'taraf-lisan', 'aqsa-halq', 'wasat-halq', 'adna-halq', 'jawf', 'asnan', 'shafatan'];

// Letters that come out at (or use) each zone, for the tappable diagram.
export const ZONE_LETTERS = {
  jawf: { l: 'ا و ي', d: 'حروف المد الثلاثة: الألف، والواو الساكنة المضموم ما قبلها، والياء الساكنة المكسور ما قبلها', madd: true },
  'aqsa-halq': { l: 'ء ه', d: 'الهمزة والهاء' },
  'wasat-halq': { l: 'ع ح', d: 'العين والحاء' },
  'adna-halq': { l: 'غ خ', d: 'الغين والخاء' },
  'aqsa-lisan': { l: 'ق ك', d: 'القاف (أقصى اللسان مع ما فوقه من الحنك الرخو) والكاف (أسفل منها قليلًا)' },
  'wasat-lisan': { l: 'ج ش ي', d: 'وسط اللسان مع ما يحاذيه من الحنك الأعلى: الجيم والشين والياء غير المدية' },
  'hafa-lisan': { l: 'ض ل', d: 'الضاد: إحدى حافتي اللسان مع الأضراس العليا. اللام: أدنى الحافتين إلى منتهى طرف اللسان' },
  'taraf-lisan': { l: 'ن ر ط د ت ص س ز ظ ذ ث', d: 'النون والراء، والطاء والدال والتاء مع أصول الثنايا العليا، والصاد والسين والزاي فوق الثنايا السفلى، والظاء والذال والثاء مع أطراف الثنايا العليا' },
  asnan: { l: 'ف ظ ذ ث', d: 'الثنايا العليا تشارك في الفاء (مع باطن الشفة السفلى)، وأطرافها في الظاء والذال والثاء' },
  shafatan: { l: 'ف ب م و', d: 'الفاء: باطن الشفة السفلى مع أطراف الثنايا العليا. الباء والميم: بانطباق الشفتين. الواو غير المدية: بانفتاحهما' },
  khayshum: { l: 'ن م', d: 'مخرج الغنة، صفة لازمة للنون والميم' },
  hanak: { l: 'ق ك ج ش ي ل ن ر', d: 'يلتقي به اللسان في حروف أقصى اللسان ووسطه وطرفه' },
};

export default function Mouth({ hl = [], marks = {}, small = false, sel = null, onPick = null }) {
  const on = hl.filter((z) => ZONES[z] && z !== sel);
  const shown = sel && ZONES[sel] ? [...on, sel] : on;
  return (
    <svg viewBox="-24 20 620 336" className="mouth" style={{ maxHeight: small ? 220 : 320 }} role="img"
      aria-label={on.map((z) => marks[z] || ZONES[z].name).join('، ') || 'جهاز النطق'}>
      {/* head and neck */}
      <path className="m-skin" d="M160 330 L160 120 C160 62 222 32 300 32 C360 32 400 52 410 82 L418 112 L446 150 L432 160 L422 162 C430 168 438 176 438 184 C432 188 428 189 424 190 C432 193 438 200 436 210 C428 214 422 217 420 221 C428 236 426 252 412 258 C382 264 352 262 332 268 L314 330 Z" />
      {/* nasal cavity */}
      <path className="m-air" d="M400 118 C360 100 290 98 250 108 L250 134 C300 128 360 132 404 144 Z" />
      {/* throat */}
      <path className="m-air" d="M250 108 C236 140 236 220 240 330 L266 330 C262 260 260 214 266 190 L262 136 Z" />
      {/* mouth cavity */}
      <path className="m-air" d="M404 162 C360 150 310 150 272 184 L266 200 C300 178 360 170 412 186 Z" />
      {/* hard and soft palate, uvula */}
      <path className="m-palate" d="M404 150 C370 140 330 140 300 146 L300 156 C330 150 370 152 404 162 Z" />
      <path className="m-palate soft" d="M300 146 C280 150 268 162 262 184 C266 190 272 188 274 182 C280 168 290 160 300 156 Z" />
      {/* tongue */}
      <path className="m-tongue" d="M412 186 C400 176 370 170 340 170 C305 170 280 180 270 200 C262 216 264 240 272 258 L330 260 C370 252 400 232 416 200 C420 194 418 188 412 186 Z" />
      {/* teeth and lips */}
      <path className="m-tooth" d="M414 162 L424 164 L422 184 L416 182 Z M414 194 L422 192 L422 210 L416 210 Z" />
      <path className="m-lip" d="M424 160 C438 166 442 178 438 186 L426 186 Z M426 190 C440 194 440 206 434 212 L424 210 Z" />
      {/* vocal folds */}
      <path className="m-fold" d="M242 300 L264 296" />
      {on.map((k) => <path key={k} d={ZONES[k].d} className="m-hl" />)}
      {sel && ZONES[sel] && <path d={ZONES[sel].d} className="m-hl m-sel" />}
      {onPick && HIT_ORDER.map((k) => [k, ZONES[k]]).map(([k, z]) => (
        <path key={`h${k}`} d={z.d} className="m-hit" role="button" tabIndex={0} aria-label={z.name}
          onClick={() => onPick(k)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(k)} />
      ))}
      {shown.map((k) => {
        const z = ZONES[k], t = (k !== sel && marks[k]) || z.name, w = Math.max(44, t.length * 13.5 + 26);
        const [x, y] = z.lb, below = y === B;
        const ex = below ? x : x === R ? x - w / 2 : x + w / 2, ey = below ? y - 18 : y;
        return (
          <g key={`l${k}`} className={k === sel ? 'm-picked' : ''}>
            <path className="m-lead" d={`M${z.at[0]} ${z.at[1]} L${ex} ${ey}`} />
            <circle className="m-dot" cx={z.at[0]} cy={z.at[1]} r="3" />
            <rect className="m-pill" x={x - w / 2} y={y - 18} width={w} height="36" rx="18" />
            <text className="m-lbl" x={x} y={y + 7} textAnchor="middle">{t}</text>
          </g>
        );
      })}
    </svg>
  );
}
export const ZONE_NAMES = Object.fromEntries(Object.entries(ZONES).map(([k, z]) => [k, z.name]));
