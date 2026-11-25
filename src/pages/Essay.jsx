import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Timer } from 'lucide-react';
import { EXTRA, MODES, lessonsFor } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import LessonChips, { useLessonSel } from '../components/LessonChips';
import { useAccess } from '../lib/accessStore';
import { store } from '../lib/store';
import { arN, fmtTime, keyPoints, stripTags, wordCount } from '../lib/util';

const LIMIT = 600; // 10 minutes per essay, as in the exam

function useTimer() {
  const [left, setLeft] = useState(LIMIT);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return undefined;
    const t = setInterval(() => setLeft((s) => { if (s <= 1) { setOn(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [on]);
  return { left, on, start: () => { setLeft(LIMIT); setOn(true); } };
}

export default function Essay() {
  const [sel, setSel] = useLessonSel();
  const { isOpen, openKey } = useAccess();
  const eqs = useMemo(() => lessonsFor(sel, isOpen).flatMap((s) => s.essays.map(([q, a]) => ({ q, a, c: s.color, t: s.title, id: s.id }))), [sel, openKey]);
  const [ei, setEi] = useState(() => Math.min(store.get('ei_' + sel, 0), eqs.length - 1));
  const idx = Math.min(Math.max(ei, 0), eqs.length - 1);
  const e = eqs[idx];
  const draftKey = `draft_${e.id}_${idx}`;
  const [text, setText] = useState(() => store.get(draftKey, ''));
  const [reveal, setReveal] = useState(false);
  const [ticks, setTicks] = useState({});
  const modelRef = useRef(null);
  const timer = useTimer();
  const pts = useMemo(() => keyPoints(e.a), [e]);

  useEffect(() => { store.set('ei_' + sel, idx); setText(store.get(draftKey, '')); setReveal(false); setTicks({}); }, [draftKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setEi(Math.min(store.get('ei_' + sel, 0), eqs.length - 1)); }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (d) => setEi((idx + d + eqs.length) % eqs.length);
  const nTicked = Object.values(ticks).filter(Boolean).length;

  return (
    <>
      <TopBar title={MODES.essay.title} sub={MODES.essay.sub} />
      <Page>
        <LessonChips sel={sel} onChange={setSel} />
        <select className="w-full mt-2" aria-label="اختر السؤال" value={idx} onChange={(ev) => setEi(+ev.target.value)}>
            {eqs.map((x, i) => { const q = stripTags(x.q); return <option key={i} value={i}>{arN(i + 1)}. {q.slice(0, 60)}{q.length > 60 ? '…' : ''}</option>; })}
        </select>
        <div className="flex items-center gap-3 my-2">
          <span dir="ltr" className="font-ui font-extrabold text-xl tabular-nums" style={{ color: 'var(--brand)' }}>
            {timer.left === 0 ? 'انتهى الوقت' : fmtTime(timer.left)}
          </span>
          <button className="btn" onClick={timer.start}><Timer size={16} />{timer.on ? 'أعد المؤقت' : 'ابدأ المؤقت (١٠ د)'}</button>
        </div>

        <div className="card" style={{ '--c': e.c }}>
          <span className="stat">{e.t}</span>
          <Html as="h3" className="mt-1 mb-3" html={e.q} />
          <textarea value={text} placeholder="اكتب إجابتك هنا: ابدأ بالتعريف، ثم الأقسام، ثم الأمثلة والاستثناءات…"
            onChange={(ev) => { setText(ev.target.value); store.set(draftKey, ev.target.value); }} />
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <button className="btn pri w-full justify-center sm:w-auto" onClick={() => { setReveal(true); setTimeout(() => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}>
              <Eye size={16} />اكشف الإجابة النموذجية
            </button>
            <button className="btn" onClick={() => go(-1)}><ChevronRight size={16} />السابق</button>
            <button className="btn" onClick={() => go(1)}>التالي<ChevronLeft size={16} /></button>
            <span className="stat ms-auto">{arN(wordCount(text))} كلمة</span>
          </div>
          {reveal && (
            <div ref={modelRef}>
              <div className="card model soft"><h3>الإجابة النموذجية</h3><Html html={e.a} /></div>
              <div className="card">
                <h3>هل ذكرتَ هذه النقاط؟</h3>
                {pts.map((p, i) => (
                  <label key={i} className="flex gap-2 items-start py-1 cursor-pointer">
                    <input type="checkbox" className="mt-2 accent-emerald-600" checked={!!ticks[i]} onChange={(ev) => setTicks((t) => ({ ...t, [i]: ev.target.checked }))} />
                    <span>{p}</span>
                  </label>
                ))}
                <p className="stat">{arN(nTicked)} من {arN(pts.length)} نقاط</p>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ '--c': '#7c3aed' }}>
          <h3>أسئلة إضافية للتدريب الحر</h3>
          <ol className="arabic">{EXTRA.map((q, i) => <Html as="li" key={i} html={q} />)}</ol>
        </div>
      </Page>
    </>
  );
}
