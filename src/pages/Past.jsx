import { useState } from 'react';
import { MODES, PAST } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import { useStored } from '../lib/store';
import { arN } from '../lib/util';
import { useAccess } from '../lib/accessStore';
import { LockedNotice } from '../components/Lock';

const AMBER = '#b45309';

function RevealItem({ n, q, a, src, ayah, open, onToggle, guide }) {
  return (
    <div className="card pq" style={{ '--c': AMBER }}>
      <span className="stat">{src}</span>
      <div className="font-ui font-bold text-[17px] mt-1 mb-2">
        {arN(n)}. {ayah ? <Html as="span" className="ayah" style={{ fontSize: '1.3em' }} html={q} /> : <Html as="span" html={q} />}
      </div>
      {guide ? <Html html={a} /> : (
        <>
          <button className="btn pri" onClick={onToggle}>{open ? 'أخفي الإجابة' : 'اكشفي الإجابة'}</button>
          {open && <Html className="mt-2" html={a} />}
        </>
      )}
    </div>
  );
}

function TfItem({ n, q, ok, a, src, answer, onAnswer }) {
  const shown = answer !== undefined;
  const right = shown && answer === ok;
  const ring = (v) => (shown && answer === v ? { outline: `3px solid ${right ? 'var(--ok)' : 'var(--bad)'}` } : undefined);
  return (
    <div className="card pq" style={{ '--c': AMBER }}>
      <span className="stat">{src}</span>
      <Html className="text-[17px] mt-1 mb-2" html={`${arN(n)}. ${q}`} />
      <div className="flex gap-2">
        <button className="btn ok" style={ring(true)} onClick={() => !shown && onAnswer(true)}>✔ صح</button>
        <button className="btn no" style={ring(false)} onClick={() => !shown && onAnswer(false)}>✘ خطأ</button>
      </div>
      {shown && (
        <div className="note mt-2"><b>{ok ? '✔ صح' : '✘ خطأ'}</b>{a ? <> — التصويب: <Html as="span" html={a} /></> : null}</div>
      )}
    </div>
  );
}

function Paper({ paper }) {
  const [open, setOpen] = useState({});
  const [tf, setTf] = useState({});
  const keys = paper.qs.flatMap((q, qi) => q.items.map((_, i) => `${qi}.${i}`));
  const showAll = (v) => {
    setOpen(v ? Object.fromEntries(keys.map((k) => [k, true])) : {});
    setTf(v ? Object.fromEntries(paper.qs.flatMap((q, qi) => (q.cat === 'tf' ? q.items.map(([, ok], i) => [`${qi}.${i}`, ok]) : []))) : {});
  };
  return (
    <>
      <div className="card" style={{ '--c': AMBER }}>
        <h3>{paper.title}</h3>
        <p className="stat m-0">{paper.marks} · {paper.teacher}</p>
      </div>
      <div className="flex gap-2 my-2">
        <button className="btn" onClick={() => showAll(true)}>أظهر كل الإجابات</button>
        <button className="btn" onClick={() => showAll(false)}>أخفِ الكل</button>
      </div>
      {paper.qs.map((q, qi) => (
        <section key={qi}>
          <h3 className="font-ui font-bold text-[18px] mt-5 mb-2" style={{ color: AMBER }}>{q.t} <span className="stat">({q.m})</span></h3>
          {q.items.map((it, i) => {
            const k = `${qi}.${i}`;
            return q.cat === 'tf'
              ? <TfItem key={k} n={i + 1} q={it[0]} ok={it[1]} a={it[2]} src={paper.src} answer={tf[k]} onAnswer={(v) => setTf((x) => ({ ...x, [k]: v }))} />
              : <RevealItem key={k} n={i + 1} q={it[0]} a={it[1]} src={paper.src} open={!!open[k]} onToggle={() => setOpen((x) => ({ ...x, [k]: !x[k] }))} />;
          })}
        </section>
      ))}
    </>
  );
}

function Finals({ papers }) {
  const [pid, setPid] = useStored('final', papers[0].id);
  const paper = papers.find((p) => p.id === pid) || papers[0];
  return (
    <>
      <div className="flex gap-2 my-2">
        {papers.map((p) => (
          <button key={p.id} className="chip" style={{ '--c': AMBER }} aria-pressed={p.id === paper.id} onClick={() => setPid(p.id)}>{p.src}</button>
        ))}
      </div>
      <Paper key={paper.id} paper={paper} />
    </>
  );
}

export default function Past() {
  const [ptype, setPtype] = useStored('ptype', 'finals');
  const t = PAST.find((x) => x.id === ptype) || PAST[0];
  const [open, setOpen] = useState({});
  const [tf, setTf] = useState({});
  const choose = (id) => { setPtype(id); setOpen({}); setTf({}); };
  const all = (v) => setOpen(v ? Object.fromEntries(t.items.map((_, i) => [i, true])) : {});
  const tfN = Object.keys(tf).length;
  const tfR = t.kind === 'tf' ? Object.entries(tf).filter(([i, v]) => !!t.items[i]?.[1] === v).length : 0;
  const { acc } = useAccess();
  if (!acc.full) {
    return (
      <>
        <TopBar title={MODES.past.title} sub={MODES.past.sub} back={false} />
        <Page><LockedNotice title="الاختبارات السابقة للمشتركات" /></Page>
      </>
    );
  }

  return (
    <>
      <TopBar title={MODES.past.title} sub={MODES.past.sub} back={false} />
      <Page>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
          {PAST.map((x) => (
            <button key={x.id} className="chip" style={{ '--c': AMBER }} aria-pressed={x.id === t.id} onClick={() => choose(x.id)}>
              {x.title} ({arN(x.items.length)})
            </button>
          ))}
        </div>
        <div className="card" style={{ '--c': AMBER }}>
          <h3>{t.title}</h3>
          <Html as="p" className="stat m-0" html={t.desc} />
        </div>

        {t.kind === 'paper' ? <Finals papers={t.items} /> : t.kind === 'tf' ? (
          <>
            <div className="flex items-center gap-2 my-2">
              <span className="stat">{tfN ? `صحيح ${arN(tfR)} من ${arN(tfN)}` : `${arN(t.items.length)} عبارة`}</span>
              <button className="btn" onClick={() => setTf(Object.fromEntries(t.items.map(([, ok], i) => [i, !!ok])))}>أظهر كل الإجابات</button>
              {tfN > 0 && <button className="btn" onClick={() => setTf({})}>ابدأ من جديد</button>}
            </div>
            {t.items.map(([q, ok, a, src], i) => (
              <TfItem key={`${t.id}${i}`} n={i + 1} q={q} ok={!!ok} a={a} src={src} answer={tf[i]} onAnswer={(v) => setTf((x) => ({ ...x, [i]: v }))} />
            ))}
          </>
        ) : (
          <>
            {t.kind !== 'guide' && (
              <div className="flex gap-2 my-2">
                <button className="btn" onClick={() => all(true)}>أظهر كل الإجابات</button>
                <button className="btn" onClick={() => all(false)}>أخفِ الكل</button>
              </div>
            )}
            {t.items.map(([q, a, src], i) => (
              <RevealItem key={`${t.id}${i}`} n={i + 1} q={q} a={a} src={src} guide={t.kind === 'guide'}
                ayah={t.id === 'bad' || t.id === 'awjuh'} open={!!open[i]} onToggle={() => setOpen((x) => ({ ...x, [i]: !x[i] }))} />
            ))}
          </>
        )}
      </Page>
    </>
  );
}
