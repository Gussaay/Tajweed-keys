import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LESSONS, lessonById } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import { FigureGrid } from '../components/Figures';

export default function Lesson() {
  const { id } = useParams();
  const s = lessonById(id);
  if (!s) return <Navigate to="/learn" replace />;
  const i = LESSONS.indexOf(s);
  const prev = LESSONS[i - 1], next = LESSONS[i + 1];

  return (
    <>
      <TopBar title={`${s.num}. ${s.title}`} />
      <Page>
        <section className="lesson" style={{ '--c': s.color }}>
          <div className="sec-head">
            <div className="n">{s.num}</div>
            <div><h2>{s.title}</h2><div className="en">{s.en}</div></div>
          </div>
          <Html className="intro" html={s.intro} />
          <div className="card"><h3>خريطة الدرس</h3><Html className="figure" html={s.diagram} /></div>
          {s.figs?.length > 0 && (
            <div className="card"><h3>الرسوم التوضيحية ({s.figs.length.toLocaleString('ar-EG')})</h3><FigureGrid items={s.figs} /></div>
          )}
          {s.blocks.map(([t, b], k) => (
            <div className="card" key={k}><Html as="h3" html={t} /><Html className="scroll" html={b} /></div>
          ))}
          {s.ladder && <div className="card"><h3>سُلَّم الوقف الاختياري</h3><Html html={s.ladder} /></div>}
          {s.table && (
            <div className="card">
              <Html as="h3" html={s.table[0]} />
              <div className="scroll">
                <table><tbody>
                  <tr>{s.table[1].map((x, k) => <Html as="th" key={k} html={x} />)}</tr>
                  {s.table[2].map((r, k) => <tr key={k}>{r.map((x, j) => <Html as="td" key={j} html={x} />)}</tr>)}
                </tbody></table>
              </div>
            </div>
          )}
          <div className="card">
            <h3 style={{ color: 'var(--gold)' }}>مفاتيح الحفظ</h3>
            <div className="mn">
              {s.mnemonics.map(([t, m, e], k) => (
                <div className="m" key={k}><Html className="t" html={t} /><Html className="s" html={m} /><Html className="e" html={e} /></div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>أسئلة مقالية وإجاباتها النموذجية</h3>
            {s.essays.map(([q, a], k) => (
              <details className="ess" key={k}><Html as="summary" html={q} /><Html className="a" html={a} /></details>
            ))}
          </div>
        </section>
        <div className="flex justify-between gap-2 mt-4">
          {prev ? <Link className="btn" to={`/learn/${prev.id}`}><ChevronRight size={18} />{prev.title}</Link> : <span />}
          {next ? <Link className="btn pri" to={`/learn/${next.id}`}>{next.title}<ChevronLeft size={18} /></Link> : <span />}
        </div>
      </Page>
    </>
  );
}
