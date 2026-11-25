// A drawn side view of the speech organs (face to the right, as in the course
// slides), with the tongue, lips and soft palate placed for the letter shown.
//
//   pose   rest | low | tipUp | interdental | sibilant | midUp | backUp | velar |
//          side | uvular | glottal | pharynx
//   lips   open | closed | labiodental | round
//   nasal  true: soft palate lowered, air through the nose (ghunnah)
//   air    oral | nasal | none (arrow showing where the air goes)
//   at     [x, y] the articulation point (defaults per pose); label beside it
//   hl     zones to tint (same names as before), labels in `marks`
import { useId } from 'react';

// Tongue outlines per pose. All start at the root (behind the epiglottis),
// run up the back, over the dorsum to the tip, and back along the floor.
const T = {
  rest: 'M236 262 C232 236 232 214 240 198 C252 180 276 174 300 176 C316 178 326 186 330 196 C332 202 330 206 324 208 C312 214 300 222 292 232 C280 246 262 256 236 262 Z',
  low: 'M236 262 C232 240 234 224 244 212 C258 198 282 194 302 198 C318 202 328 208 330 214 C331 219 327 222 320 224 C306 228 296 234 288 242 C276 252 260 258 236 262 Z',
  tipUp: 'M236 262 C232 236 232 214 240 198 C252 182 274 178 292 180 C304 182 312 180 318 176 C322 174 326 176 324 182 C320 192 312 206 304 214 C296 224 286 236 276 244 C264 254 252 260 236 262 Z',
  interdental: 'M236 262 C232 236 232 214 240 198 C252 182 276 178 298 182 C314 186 330 190 342 194 C346 196 345 200 340 201 C326 204 312 212 300 222 C286 236 266 254 236 262 Z',
  sibilant: 'M236 262 C232 236 232 214 240 198 C252 182 276 178 296 180 C310 182 318 186 324 192 C330 198 334 204 330 208 C320 214 304 222 292 232 C280 246 262 256 236 262 Z',
  midUp: 'M236 262 C232 234 234 208 246 190 C258 174 278 166 296 168 C310 170 320 180 326 192 C330 200 328 206 322 208 C310 214 298 222 290 232 C278 246 262 256 236 262 Z',
  backUp: 'M236 262 C230 232 232 196 244 178 C252 168 264 168 278 176 C296 184 316 188 326 196 C330 202 328 206 322 208 C310 214 298 222 290 232 C278 246 262 256 236 262 Z',
  velar: 'M236 262 C232 234 236 196 250 178 C260 166 274 166 288 172 C304 180 318 188 326 196 C330 202 328 206 322 208 C310 214 298 222 290 232 C278 246 262 256 236 262 Z',
  uvular: 'M236 262 C228 232 228 200 236 184 C242 174 254 174 270 180 C290 186 314 188 326 196 C330 202 328 206 322 208 C310 214 298 222 290 232 C278 246 262 256 236 262 Z',
};
T.side = T.midUp;
T.glottal = T.rest;
T.pharynx = 'M236 262 C226 240 224 218 232 200 C244 182 272 176 298 178 C314 180 326 188 330 196 C332 202 330 206 324 208 C312 214 300 222 292 232 C280 246 262 256 236 262 Z';

// The articulation point drawn for each pose.
const AT = {
  rest: null, low: null, tipUp: [318, 178], interdental: [340, 196], sibilant: [329, 203], midUp: [290, 168],
  backUp: [258, 172], velar: [270, 168], uvular: [240, 180], side: [296, 170], glottal: [222, 302], pharynx: [226, 248],
};
const LIP_AT = { closed: [354, 198], labiodental: [344, 199], round: [362, 199] };

// Lips: upper and lower, per lip pose.
const UL = {
  open: 'M338 172 C348 176 356 182 360 189 C361 192 358 194 352 194 L338 192 Z',
  closed: 'M338 172 C348 176 356 182 360 190 C362 195 360 198 354 198 L338 197 Z',
  labiodental: 'M338 172 C348 176 356 182 360 189 C361 192 358 194 352 194 L338 192 Z',
  round: 'M338 172 C350 176 362 182 368 190 C370 194 367 197 360 196 L340 193 Z',
};
const LL = {
  open: 'M338 206 L352 205 C358 206 361 210 360 214 C356 222 348 226 338 226 Z',
  closed: 'M338 199 L354 199 C360 200 362 205 360 210 C356 220 348 224 338 224 Z',
  labiodental: 'M336 200 L346 197 C352 197 356 201 355 206 C352 216 346 222 336 222 Z',
  round: 'M340 202 L360 202 C367 204 369 209 366 214 C360 222 350 225 340 224 Z',
};

// Zones that can be highlighted or tapped (shapes on this drawing).
export const HEAD_ZONES = {
  khayshum: { d: 'M232 128 C262 116 312 116 352 140 L352 156 C316 140 270 138 236 148 Z', at: [300, 132], name: 'الخيشوم' },
  hanak: { d: 'M252 164 C276 158 304 158 320 168 L318 176 C300 168 276 168 254 172 Z', at: [288, 164], name: 'الحنك الأعلى' },
  jawf: { d: 'M214 140 L230 140 L236 196 C256 182 290 178 326 184 L330 190 C292 186 258 192 238 206 L232 280 L214 280 Z', at: [226, 210], name: 'الجوف' },
  asnan: { d: 'M326 176 L338 176 L342 196 L332 196 Z M328 202 L340 202 L336 224 L326 222 Z', at: [334, 186], name: 'الأسنان' },
  shafatan: { d: 'M338 172 C350 176 360 184 362 192 L338 194 Z M338 204 L358 204 C362 212 354 224 338 226 Z', at: [354, 200], name: 'الشفتان' },
  'taraf-lisan': { d: 'M304 180 C316 180 326 186 330 196 C331 204 322 210 310 214 Z', at: [318, 194], name: 'طرف اللسان' },
  'hafa-lisan': { d: 'M262 184 C280 178 300 178 314 182 L310 192 C296 188 280 188 264 192 Z', at: [288, 184], name: 'حافتا اللسان' },
  'wasat-lisan': { d: 'M266 178 C282 172 300 174 312 180 L304 216 C290 214 276 214 266 216 Z', at: [288, 194], name: 'وسط اللسان' },
  'aqsa-lisan': { d: 'M240 198 C246 186 256 178 268 178 L266 218 C256 222 246 228 238 236 Z', at: [252, 200], name: 'أقصى اللسان' },
  'adna-halq': { d: 'M208 186 L232 186 L232 222 L206 222 Z', at: [220, 204], name: 'أدنى الحلق' },
  'wasat-halq': { d: 'M206 224 L232 224 L232 262 L206 262 Z', at: [219, 243], name: 'وسط الحلق' },
  'aqsa-halq': { d: 'M206 264 L234 264 L236 308 L208 308 Z', at: [221, 286], name: 'أقصى الحلق' },
};

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

export default function Head({ pose = 'rest', lips = 'open', nasal = false, air = null, at, label, hl = [], marks = {}, sel = null, onPick = null, small = false }) {
  const id = useId().replace(/:/g, '');
  const tongue = T[pose] || T.rest;
  const point = at || LIP_AT[lips] || AT[pose];
  const on = hl.filter((z) => HEAD_ZONES[z]);
  const velum = nasal
    ? 'M254 166 C240 170 230 180 226 196 C224 204 230 206 234 200 C238 190 246 182 256 176 Z'
    : 'M254 166 C238 166 222 162 212 156 C206 160 208 166 214 170 C226 176 242 178 256 176 Z';
  const uvula = nasal ? 'M226 196 C222 206 226 212 232 206' : 'M212 158 C202 156 198 162 204 168';
  const labelPos = point && [point[0] > 300 ? Math.min(point[0] + 26, 392) : point[0] - 20, point[1] < 150 ? point[1] - 26 : point[1] - 34];
  const zoneLabels = (() => {
    const list = [...on, ...(sel && !on.includes(sel) ? [sel] : [])]
      .map((z) => ({ z, t: (z !== sel && marks[z]) || HEAD_ZONES[z].name }))
      .filter(({ t }) => !(point && t === label))
      .map((o) => {
        const Z = HEAD_ZONES[o.z], left = Z.at[0] < 270, w = o.t.length * 6.4 + 16;
        return { ...o, left, w, x: left ? 176 : 384, y: Z.at[1] };
      });
    const busy = labelPos ? [{ left: labelPos[0] < 270, y: labelPos[1] + 8 }] : [];
    for (const side of [true, false]) {
      const col = list.filter((o) => o.left === side).sort((p, q) => p.y - q.y);
      let last = -Infinity;
      for (const o of col) {
        o.y = Math.max(o.y, last + 27);
        for (const b of busy) if (b.left === side && Math.abs(o.y - b.y) < 26) o.y = b.y + 27;
        last = o.y;
      }
    }
    return list;
  })();
  const art = (
    <g>
      {/* head and neck */}
      <path fill={`url(#sk${id})`} className="h-skin" d="M170 360 L166 230 C150 170 160 92 214 58 C262 30 330 36 352 74 C360 92 356 108 362 120 L386 148 C390 154 384 160 374 160 L356 162 C358 170 362 176 362 184 C364 192 360 194 358 196 C364 200 366 204 362 210 C364 220 360 226 354 230 C356 240 356 250 348 260 C334 272 312 272 292 274 C282 290 276 320 276 360 Z" />
      {/* eye and brow */}
      <path className="h-face" d="M318 92 C326 88 336 88 344 92 M322 104 C328 108 336 108 342 104" />
      <path className="h-face" d="M370 156 C366 152 362 152 360 156" />
      {/* nasal cavity with turbinates, nostril */}
      <path className="h-cavity" d="M232 128 C262 112 316 112 346 132 C356 140 364 150 366 158 L356 160 C342 152 324 150 304 152 C282 154 262 156 248 160 L232 156 Z" />
      <path className="h-turb" d="M262 130 C282 124 302 126 318 134 M258 142 C280 136 304 138 326 146" />
      {/* oral cavity and throat */}
      <path className="h-cavity" d="M212 120 C206 160 204 220 208 360 L238 360 L240 300 C236 290 234 276 236 262 C232 236 232 214 240 198 C252 180 276 174 300 176 C316 178 326 186 330 196 L334 198 L332 176 C312 166 276 166 256 172 C240 170 224 164 216 154 L222 128 Z" />
      {/* hard palate (bone) with the gum ridge */}
      <path className="h-bone" d="M256 160 C280 154 306 156 324 164 C330 167 334 172 332 178 C328 176 322 172 316 170 C300 164 278 164 256 170 Z" />
      {/* soft palate and uvula */}
      <path className="h-velum" d={velum} />
      <path className="h-velum h-uvula" d={uvula} />
      {/* pharynx back wall, epiglottis, larynx */}
      <path className="h-wall" d="M212 120 C206 160 204 220 208 360" />
      <path className="h-epi" d="M238 262 C230 252 224 240 226 232 C230 236 236 246 242 256 Z" />
      <path className="h-larynx" d="M228 290 L246 286 L250 360 L232 360 Z" />
      <path className="h-fold" d="M222 300 L242 296" />
      {/* jaw bone hint */}
      <path className="h-jaw" d="M332 230 C330 246 320 256 300 262 C282 266 262 266 250 262" />
      {/* tongue */}
      <path fill={`url(#tg${id})`} className="h-tongue" d={tongue} />
      <path className="h-tongue-line" d={pose === 'tipUp' ? 'M246 214 C266 200 292 196 310 190' : 'M246 216 C268 204 296 198 318 198'} />
      {/* teeth */}
      <path className="h-tooth" d="M326 170 C330 168 336 170 338 174 L342 194 C342 198 336 199 334 196 L326 176 Z" />
      <path className="h-tooth" d="M330 202 C332 200 338 200 340 203 L336 222 C334 226 328 225 328 221 Z" />
      <path className="h-gum" d="M322 168 C328 164 336 166 338 172 L332 176 Z M326 222 C328 228 334 230 338 226 L336 220 Z" />
      {/* lips */}
      <path className="h-lip" d={UL[lips] || UL.open} />
      <path className="h-lip" d={LL[lips] || LL.open} />
      {/* airflow */}
      {(air === 'nasal' || nasal) && <path className="h-air" markerEnd={`url(#ar${id})`} d="M222 296 C214 240 214 170 236 146 C262 132 320 134 362 156" />}
      {air === 'oral' && <path className="h-air" markerEnd={`url(#ar${id})`} d="M224 296 C216 250 222 214 248 194 C270 184 310 186 368 198" />}
      </g>
  );
  return (
    <svg viewBox="100 30 310 330" className="head" style={{ maxHeight: small ? 240 : 360 }} role="img" aria-label={label || 'جهاز النطق'}>
      <defs>
        <linearGradient id={`sk${id}`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="var(--h-skin1)" /><stop offset="1" stopColor="var(--h-skin2)" /></linearGradient>
        <radialGradient id={`tg${id}`} cx=".6" cy=".3" r=".9"><stop offset="0" stopColor="#f3a7a0" /><stop offset="1" stopColor="#d86a63" /></radialGradient>
        <radialGradient id={`gl${id}`}><stop offset="0" stopColor="#ffd24a" stopOpacity=".95" /><stop offset="1" stopColor="#ffd24a" stopOpacity="0" /></radialGradient>
        <marker id={`ar${id}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" className="h-air-head" /></marker>
      </defs>
      {art}
      {/* highlighted zones */}
      {!point && on.map((z) => <path key={z} d={HEAD_ZONES[z].d} className="h-hl" />)}
      {sel && HEAD_ZONES[sel] && <path d={HEAD_ZONES[sel].d} className="h-hl h-sel" />}
      {onPick && Object.entries(HEAD_ZONES).map(([k, z]) => (
        <path key={`h${k}`} d={z.d} className="h-hit" role="button" tabIndex={0} aria-label={z.name}
          onClick={() => onPick(k)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(k)} />
      ))}
      {/* magnified view of the articulation point */}
      {point && !small && (
        <g className="h-mag">
          <clipPath id={`cl${id}`}><circle cx="150" cy="82" r="44" /></clipPath>
          <path className="h-mag-lead" d={`M${150 + 44 * Math.cos(Math.atan2(point[1] - 82, point[0] - 150))} ${82 + 44 * Math.sin(Math.atan2(point[1] - 82, point[0] - 150))} L${point[0]} ${point[1]}`} />
          <circle cx="150" cy="82" r="46" className="h-mag-ring" />
          <g clipPath={`url(#cl${id})`}>
            <rect x="104" y="36" width="92" height="92" className="h-mag-bg" />
            <g transform={`translate(150 82) scale(2.6) translate(${-point[0]} ${-point[1]})`}>{art}</g>
            <circle cx="150" cy="82" r="5" className="h-dot" />
          </g>
          <text x="150" y="142" textAnchor="middle" className="h-mag-t">تكبير المخرج</text>
        </g>
      )}
      {/* articulation point */}
      {point && (
        <g className="h-point">
          <circle cx={point[0]} cy={point[1]} r="13" fill={`url(#gl${id})`} className="h-pulse" />
          <circle cx={point[0]} cy={point[1]} r="3.6" className="h-dot" />
          {label && (
            <g>
              <path className="h-lead" d={`M${point[0]} ${point[1]} L${labelPos[0]} ${labelPos[1] + 9}`} />
              <rect className="h-pill" x={labelPos[0] - (label.length * 8 + 18) / 2} y={labelPos[1] - 4} width={label.length * 8 + 18} height="24" rx="12" />
              <text className="h-lbl big" x={labelPos[0]} y={labelPos[1] + 14} textAnchor="middle">{label}</text>
            </g>
          )}
        </g>
      )}
      {/* zone labels, stacked so they never overlap (nor the letter label) */}
      {zoneLabels.map(({ z, t, x, y, w, left }) => {
        const Z = HEAD_ZONES[z];
        return (
          <g key={`l${z}`} className={z === sel ? 'h-picked' : ''}>
            <path className="h-lead" d={`M${Z.at[0]} ${Z.at[1]} L${left ? x + w / 2 - 4 : x - w / 2 + 4} ${y}`} />
            <circle className="h-zdot" cx={Z.at[0]} cy={Z.at[1]} r="2.4" />
            <rect className="h-pill soft" x={x - w / 2} y={y - 12} width={w} height="24" rx="12" />
            <text className="h-lbl" x={x} y={y + 5} textAnchor="middle">{t}</text>
          </g>
        );
      })}
    </svg>
  );
}
