import { useEffect, useMemo, useRef, useState } from 'react';
import { MODES, lessonsFor } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import LessonChips, { useLessonSel } from '../components/LessonChips';
import { store } from '../lib/store';
import { arN, shuffle } from '../lib/util';

const makeQs = (sel) => shuffle(lessonsFor(sel).flatMap((s) => s.quiz.map((q) => ({ q, c: s.color, t: s.title }))));

export default function Quiz() {
  const [sel, setSel] = useLessonSel();
  const [run, setRun] = useState(0);
  const qs = useMemo(() => makeQs(sel), [sel, run]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const nextRef = useRef(null);
  useEffect(() => { setQi(0); setScore(0); setPicked(null); }, [qs]);
  useEffect(() => { if (picked !== null) nextRef.current?.focus(); }, [picked]);

  const done = qi >= qs.length;
  const best = Math.max(store.get('best_' + sel, 0), done ? score : 0);
  useEffect(() => { if (done) store.set('best_' + sel, best); }, [done, best, sel]);

  return (
    <>
      <TopBar title={MODES.quiz.title} sub={MODES.quiz.sub} back={false} />
      <Page>
        <LessonChips sel={sel} onChange={setSel} />
        <div className="max-w-2xl mx-auto">
          {done ? (
            <div className="card text-center">
              <h3 style={{ color: 'var(--brand)' }}>النتيجة: {arN(score)} من {arN(qs.length)}</h3>
              <p>{score / qs.length >= 0.8 ? 'ممتاز، أنت جاهز لهذا الجزء.' : 'راجع الدروس التي أخطأت فيها ثم أعد المحاولة.'}</p>
              <p className="stat">أفضل نتيجة لك: {arN(best)}</p>
              <button className="btn pri mt-2" onClick={() => setRun((r) => r + 1)}>أعد الاختبار</button>
            </div>
          ) : (() => {
            const { q: [text, opts, ans, why], c, t } = qs[qi];
            return (
              <>
                <div className="flex items-center gap-2 my-2">
                  <span className="stat">سؤال {arN(qi + 1)} من {arN(qs.length)} · الدرجة {arN(score)}</span>
                  <div className="bar"><i style={{ width: `${(qi / qs.length) * 100}%` }} /></div>
                </div>
                <div className="card" style={{ '--c': c }}>
                  <span className="stat">{t}</span>
                  <Html className="font-ui font-bold text-[19px] mt-1 mb-3" html={text} />
                  <div className="grid gap-2">
                    {opts.map((o, i) => (
                      <button key={i}
                        className={`opt ${picked !== null && i === ans ? 'right' : ''} ${picked === i && i !== ans ? 'wrong' : ''}`}
                        onClick={() => { if (picked !== null) return; setPicked(i); if (i === ans) setScore((s) => s + 1); }}>
                        <Html as="span" html={o} />
                      </button>
                    ))}
                  </div>
                  {picked !== null && (
                    <>
                      <p className="mt-3 text-muted">
                        {picked === ans ? '✔ صحيح. ' : <>✘ الإجابة الصحيحة: <Html as="span" html={opts[ans]} />. </>}
                        {why && <Html as="span" html={why} />}
                      </p>
                      <div className="flex justify-end mt-2">
                        <button ref={nextRef} className="btn pri" onClick={() => { setPicked(null); setQi((x) => x + 1); }}>التالي</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </Page>
    </>
  );
}
