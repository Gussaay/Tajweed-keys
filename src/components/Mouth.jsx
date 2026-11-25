// A simplified side view of the speech organs (lips on the right, as in the
// course slides). `hl` lists the zones to highlight; `marks` adds letters at
// a zone. Zones: khayshum, jawf, shafatan, aqsa-halq, wasat-halq, adna-halq,
// aqsa-lisan, wasat-lisan, hafa-lisan, taraf-lisan, asnan, hanak.
const ZONES = {
  khayshum: { d: 'M300 88 C250 62 160 58 110 74 L112 100 C170 92 250 96 300 112 Z', at: [205, 80], name: 'الخيشوم' },
  hanak: { d: 'M292 140 C250 112 180 108 110 120 L112 128 C180 118 250 122 290 150 Z', at: [200, 116], name: 'الحنك الأعلى' },
  jawf: { d: 'M286 156 C240 128 180 126 118 136 L110 150 C150 146 200 144 250 150 C210 165 140 175 112 176 L110 190 C160 186 215 172 250 158 Z', at: [180, 150], name: 'الجوف' },
  shafatan: { d: 'M300 140 C318 146 322 162 312 170 L298 168 Z M298 188 C320 190 322 206 306 216 L296 200 Z', at: [322, 180], name: 'الشفتان' },
  asnan: { d: 'M288 150 L298 150 L296 168 L289 168 Z M288 186 L297 186 L295 200 L289 200 Z', at: [293, 176], name: 'الأسنان' },
  'taraf-lisan': { d: 'M286 172 C276 160 252 158 238 164 L240 188 C258 190 276 186 286 180 Z', at: [262, 174], name: 'طرف اللسان' },
  'wasat-lisan': { d: 'M238 164 C210 150 175 148 150 156 L152 190 C180 194 214 192 240 188 Z', at: [195, 172], name: 'وسط اللسان' },
  'aqsa-lisan': { d: 'M150 156 C130 160 116 172 110 190 L116 214 C130 206 142 198 152 190 Z', at: [132, 184], name: 'أقصى اللسان' },
  'hafa-lisan': { d: 'M246 182 C215 196 175 200 150 196 L150 204 C178 208 218 204 248 190 Z', at: [200, 206], name: 'حافتا اللسان' },
  'adna-halq': { d: 'M108 150 L94 150 L92 192 L106 192 Z', at: [72, 170], name: 'أدنى الحلق' },
  'wasat-halq': { d: 'M106 192 L92 192 L90 232 L104 232 Z', at: [70, 212], name: 'وسط الحلق' },
  'aqsa-halq': { d: 'M104 232 L90 232 L90 272 L104 272 Z', at: [70, 252], name: 'أقصى الحلق' },
};

export default function Mouth({ hl = [], marks = {}, small = false }) {
  const on = new Set(hl);
  return (
    <svg viewBox="40 50 300 240" className="mouth" style={{ maxHeight: small ? 180 : 260 }} role="img"
      aria-label={hl.map((z) => ZONES[z]?.name).filter(Boolean).join('، ') || 'جهاز النطق'}>
      {/* head outline */}
      <path className="m-skin" d="M300 60 C330 70 340 110 326 140 C334 150 330 160 318 166 C330 176 330 186 318 192 C334 204 324 222 300 226 C290 250 250 262 200 262 L120 262 L120 290 L60 290 L60 120 C60 80 110 56 180 52 C230 50 280 52 300 60 Z" />
      {/* throat tube */}
      <path className="m-air" d="M110 120 L110 280 L86 280 L86 140 C86 126 96 118 110 120 Z" />
      {/* nasal cavity, palate, mouth cavity */}
      <path className="m-air" d="M300 88 C250 62 160 58 110 74 L112 100 C170 92 250 96 300 112 Z" />
      <path className="m-palate" d="M292 140 C250 112 180 108 110 120 L110 132 C180 122 250 126 288 150 Z" />
      <path className="m-air" d="M288 152 C240 130 180 128 116 138 L110 190 C160 186 220 176 286 172 Z" />
      {/* tongue */}
      <path className="m-tongue" d="M286 174 C278 160 250 156 232 162 C200 150 160 148 140 158 C120 168 108 186 112 214 C118 236 150 240 190 236 C230 232 262 214 276 196 C288 188 292 180 286 174 Z" />
      {/* teeth and lips */}
      <path className="m-tooth" d="M288 150 L298 150 L296 168 L289 168 Z M288 186 L297 186 L295 200 L289 200 Z" />
      <path className="m-lip" d="M300 140 C318 146 322 162 312 170 L298 168 Z M298 188 C320 190 322 206 306 216 L296 200 Z" />
      {/* uvula */}
      <path className="m-palate" d="M112 128 C104 134 102 146 108 152 C112 146 114 138 112 128 Z" />
      {Object.entries(ZONES).map(([k, z]) => on.has(k) && <path key={k} d={z.d} className="m-hl" />)}
      {Object.entries(ZONES).map(([k, z]) => on.has(k) && (
        <text key={`t${k}`} x={z.at[0]} y={z.at[1]} className="m-lbl" textAnchor="middle">{marks[k] || z.name}</text>
      ))}
    </svg>
  );
}
export const ZONE_NAMES = Object.fromEntries(Object.entries(ZONES).map(([k, z]) => [k, z.name]));
