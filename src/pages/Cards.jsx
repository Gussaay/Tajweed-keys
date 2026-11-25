import { useEffect, useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { MODES, lessonsFor } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import LessonChips, { useLessonSel } from '../components/LessonChips';
import { useAccess } from '../lib/accessStore';
import { store } from '../lib/store';
import { arN, buildDeck, shuffle } from '../lib/util';

export default function Cards() {
  const [sel, setSel] = useLessonSel();
  const { isOpen, openKey } = useAccess();
  const [known, setKnown] = useState(() => store.get('known', {}));
  const [deck, setDeck] = useState(() => buildDeck(lessonsFor(sel, isOpen), known));
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const rebuild = (kn = store.get('known', {}), s = sel) => { setDeck(buildDeck(lessonsFor(s, isOpen), kn)); setI(0); setFlip(false); };
  useEffect(() => { rebuild(); }, [sel, openKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = deck.length;
  const ids = new Set(deck.map((c) => c.k));
  const k = Object.keys(known).filter((x) => ids.has(x)).length;
  const c = total ? deck[i % deck.length] : null;

  const save = (kn) => { setKnown(kn); store.set('known', kn); };
  const next = (ok) => {
    const kn = { ...known };
    let d = deck;
    if (ok) kn[c.k] = 1;
    else { delete kn[c.k]; d = [...deck, c]; }
    save(kn);
    setFlip(false);
    setDeck(d);
    setI(i + 1);
  };

  return (
    <>
      <TopBar title={MODES.cards.title} sub={MODES.cards.sub} back={false} />
      <Page>
        <LessonChips sel={sel} onChange={setSel} />
        <div className="flex items-center gap-2 mt-2">
          <span className="stat shrink-0">{arN(k)} / {arN(ids.size)} محفوظة</span>
          <div className="bar"><i style={{ width: `${ids.size ? (k / ids.size) * 100 : 0}%` }} /></div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button className="btn" onClick={() => { setFlip(false); setDeck(shuffle(deck)); setI(0); }}><Shuffle size={16} />خلط</button>
          <button className="btn" onClick={() => { save({}); rebuild({}); }}><RotateCcw size={16} />تصفير التقدّم</button>
        </div>
        {c && (
          <>
            <div className="flash">
              <div className={`fc ${flip ? 'flip' : ''}`} style={{ '--c': c.c }} tabIndex={0} role="button" aria-label="اقلب البطاقة"
                onClick={() => setFlip((f) => !f)}
                onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlip((f) => !f); } }}>
                <div className="front"><span className="tag">{c.t}</span><Html html={c.f} /><span className="hint">اضغط للقلب</span></div>
                <div className="back"><Html html={c.b} /></div>
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <button className="btn no px-6" onClick={() => next(false)}>لم أعرفها</button>
              <button className="btn ok px-6" onClick={() => next(true)}>عرفتها</button>
            </div>
            <p className="text-center stat mt-3">البطاقة {arN((i % deck.length) + 1)} من {arN(deck.length)}</p>
          </>
        )}
      </Page>
    </>
  );
}
