import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { MODES, lessonsFor } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import LessonChips, { useLessonSel } from '../components/LessonChips';
import { shuffle } from '../lib/util';

export default function Mnemonics() {
  const [sel, setSel] = useLessonSel();
  const items = useMemo(
    () => shuffle(lessonsFor(sel).flatMap((s) => s.mnemonics.map((m, i) => ({ id: `${s.id}:${i}`, m, c: s.color, t: s.title })))),
    [sel],
  );
  const [shown, setShown] = useState({});
  const toggle = (id) => setShown((x) => ({ ...x, [id]: !x[id] }));

  return (
    <>
      <TopBar title={MODES.mnem.title} sub={MODES.mnem.sub} />
      <Page>
        <LessonChips sel={sel} onChange={(v) => { setSel(v); setShown({}); }} />
        <div className="flex gap-2 my-2">
          <button className="btn" onClick={() => setShown(Object.fromEntries(items.map((x) => [x.id, true])))}><Eye size={16} />أظهر الكل</button>
          <button className="btn" onClick={() => setShown({})}><EyeOff size={16} />أخفِ الكل</button>
        </div>
        <div className="mn">
          {items.map(({ id, m: [t, s, e], c, t: st }) => (
            <div key={id} className={`m ${shown[id] ? '' : 'hidden-key'}`} style={{ '--c': c }}>
              <div className="t">{st} · <Html as="span" html={t} /></div>
              <Html className="s" html={s} tabIndex={0} role="button" onClick={() => toggle(id)}
                onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(id); } }} />
              <Html className="e" html={e} />
            </div>
          ))}
        </div>
      </Page>
    </>
  );
}
