// The interactive parts of the diagrams: letters that can be heard, a speech
// organ diagram whose zones can be tapped, and a meter that counts harakat.
import { useEffect, useRef, useState } from 'react';
import { canSpeak, speak, letterSound, meter, stopMeter, canMeter } from '../lib/sound';
import Head, { HEAD_ZONES, ZONE_LETTERS } from './Head';
import { Html } from './ui';

const AR = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

// One letter chip: tap to hear it, if this device can speak Arabic.
export function LetterChip({ c }) {
  const [on, setOn] = useState(false);
  const say = letterSound(c);
  if (!say || !canSpeak()) return <span>{c}</span>;
  return (
    <button type="button" className={`dg-say ${on ? 'on' : ''}`} aria-label={`استمع: ${c}`}
      onClick={() => { speak(say); setOn(true); setTimeout(() => setOn(false), 700); }}>
      {c}
    </button>
  );
}

export function LetterChips({ l }) {
  return <div className="dg-lchips">{l.split(' ').filter(Boolean).map((c, j) => <LetterChip key={j} c={c} />)}</div>;
}

// The speech organs; tapping a zone shows (and lets you hear) its letters.
export function MouthPicker({ hl, marks, ...pose }) {
  const [sel, setSel] = useState(null);
  const info = sel && ZONE_LETTERS[sel];
  return (
    <>
      <Head hl={hl} marks={marks} {...pose} sel={sel} onPick={(k) => setSel(k === sel ? null : k)} />
      {info ? (
        <div className="dg-zone">
          <div className="dg-zone-h">{HEAD_ZONES[sel].name}<button type="button" className="dg-x" aria-label="إغلاق" onClick={() => setSel(null)}>×</button></div>
          <LetterChips l={info.l} />
          <Html className="dg-zone-d" html={info.d} />
          {info.madd && <MaddMeter opts={[{ l: 'المد الطبيعي', n: 2 }]} compact />}
        </div>
      ) : (
        <p className="dg-hint">اضغطي على أي جزء من جهاز النطق لتظهر حروفه{canSpeak() ? ' وتسمعيها' : ''}.</p>
      )}
    </>
  );
}

// Counts the length of a madd. opts: [{l: label, n: harakat}], w: an example.
export function MaddMeter({ opts, w, h, compact = false }) {
  const [play, setPlay] = useState(null); // {i, beat}
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; stopMeter(); }, []);
  const max = Math.max(...opts.map((o) => o.n));
  const start = (i) => {
    if (play?.i === i) { stopMeter(); return; }
    setPlay({ i, beat: 0 });
    meter(opts[i].n, {
      onBeat: (b) => alive.current && setPlay({ i, beat: b }),
      onEnd: () => alive.current && setPlay((p) => (p?.i === i ? null : p)),
    });
  };
  const cur = play ? opts[play.i] : null;
  return (
    <div className={`dg-madd ${compact ? 'compact' : ''}`}>
      {h && <Html className="dg-part-h" html={h} />}
      {w && <Html className="dg-madd-w ayah" html={w} />}
      <div className="dg-madd-opts">
        {opts.map((o, i) => (
          <button key={i} type="button" className={`dg-madd-b ${play?.i === i ? 'on' : ''}`} onClick={() => start(i)}>
            <span className="ic" aria-hidden="true">{play?.i === i ? '■' : '▶'}</span>
            <span>{o.l}</span>
            <small>{AR(o.n)} {o.n === 2 ? 'حركتان' : 'حركات'}</small>
          </button>
        ))}
      </div>
      <div className="dg-beats" aria-live="polite">
        {Array.from({ length: max }, (_, k) => {
          const inRange = cur ? k < cur.n : true;
          const lit = cur && k < play.beat;
          return <span key={k} className={`${lit ? 'lit' : ''} ${inRange ? '' : 'off'}`}>{AR(k + 1)}</span>;
        })}
      </div>
      {!compact && <p className="dg-hint">اضغطي لتسمعي المد مع عدّ الحركات{canMeter() ? '' : ' (الصوت غير متاح في هذا المتصفح)'}. الحركة بمقدار قبض الإصبع أو بسطه.</p>}
    </div>
  );
}

// A small play button that counts n harakat (used beside a letter).
export function MiniMadd({ n }) {
  const [b, setB] = useState(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  if (!canMeter()) return null;
  return (
    <button type="button" className={`dg-mini ${b ? 'on' : ''}`} aria-label={`عدّ ${AR(n)} حركات`}
      onClick={() => { setB(0); meter(n, { onBeat: (x) => alive.current && setB(x), onEnd: () => alive.current && setB(0) }); }}>
      {b ? AR(b) : `▶ ${AR(n)}`}
    </button>
  );
}
