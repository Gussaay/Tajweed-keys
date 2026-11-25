import { useMemo } from 'react';
import { DIAGRAMS, LESSONS, MODES } from '../data';
import { Page, TopBar } from '../components/ui';
import { FigureGrid } from '../components/Figures';
import Diagram from '../components/Diagram';
import { useStored } from '../lib/store';
import { arN } from '../lib/util';

const WITH_FIGS = LESSONS.filter((s) => s.figs?.length);
const drawnOf = (s) => s.figs.filter(([n]) => DIAGRAMS[n]);

// Two views of the same illustrations: the redrawn diagrams, and the original
// scans from the course material.
export default function Gallery() {
  const [view, setView] = useStored('gview', 'drawn');
  const [sel, setSel] = useStored('gsel', WITH_FIGS[0]?.id);
  const cur = WITH_FIGS.find((s) => s.id === sel) || WITH_FIGS[0];
  const drawn = useMemo(() => drawnOf(cur), [cur]);
  const count = (s) => (view === 'drawn' ? drawnOf(s).length : s.figs.length);
  return (
    <>
      <TopBar title={MODES.gallery.title} sub={MODES.gallery.sub} />
      <Page>
        <div className="seg mt-2" role="tablist">
          <button role="tab" aria-pressed={view === 'drawn'} onClick={() => setView('drawn')}>المخططات</button>
          <button role="tab" aria-pressed={view === 'orig'} onClick={() => setView('orig')}>الصور الأصلية</button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
          {WITH_FIGS.map((s) => (
            <button key={s.id} className="chip" style={{ '--c': s.color }} aria-pressed={s.id === cur.id} onClick={() => setSel(s.id)}>
              {s.title} ({arN(count(s))})
            </button>
          ))}
        </div>
        {view === 'orig' ? (
          <FigureGrid key={cur.id} items={cur.figs} />
        ) : drawn.length ? (
          <div className="dg-stack">{drawn.map(([n]) => <Diagram key={n} d={DIAGRAMS[n]} />)}</div>
        ) : (
          <p className="text-center opacity-70 py-8 font-ui">مخططات هذا الدرس قيد الإعداد، وتظهر صوره الأصلية في التبويب الثاني.</p>
        )}
      </Page>
    </>
  );
}
