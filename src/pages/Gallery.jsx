import { DIAGRAMS, LESSONS, MODES } from '../data';
import { Page, TopBar } from '../components/ui';
import Diagram from '../components/Diagram';
import { useStored } from '../lib/store';
import { arN } from '../lib/util';

const WITH_FIGS = LESSONS.filter((s) => s.figs?.some(([n]) => DIAGRAMS[n]));

export default function Gallery() {
  const [sel, setSel] = useStored('gsel', WITH_FIGS[0]?.id);
  const cur = WITH_FIGS.find((s) => s.id === sel) || WITH_FIGS[0];
  return (
    <>
      <TopBar title={MODES.gallery.title} sub={MODES.gallery.sub} />
      <Page>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
          {WITH_FIGS.map((s) => (
            <button key={s.id} className="chip" style={{ '--c': s.color }} aria-pressed={s.id === cur.id} onClick={() => setSel(s.id)}>
              {s.title} ({arN(s.figs.length)})
            </button>
          ))}
        </div>
        <div className="dg-stack">{cur.figs.map(([n]) => <Diagram key={n} d={DIAGRAMS[n]} />)}</div>
      </Page>
    </>
  );
}
