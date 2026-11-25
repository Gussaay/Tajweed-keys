import { DIAGRAMS, LESSONS, MODES } from '../data';
import { Page, TopBar } from '../components/ui';
import Diagram from '../components/Diagram';
import { useStored } from '../lib/store';
import { arN } from '../lib/util';
import { useAccess } from '../lib/accessStore';
import { LockedNotice } from '../components/Lock';
import { Lock } from 'lucide-react';

export default function Gallery() {
  const WITH_FIGS = LESSONS.filter((s) => s.counts?.figs > 0);
  const [sel, setSel] = useStored('gsel', WITH_FIGS[0]?.id);
  const cur = WITH_FIGS.find((s) => s.id === sel) || WITH_FIGS[0];
  const { isOpen } = useAccess();
  return (
    <>
      <TopBar title={MODES.gallery.title} sub={MODES.gallery.sub} />
      <Page>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
          {WITH_FIGS.map((s) => (
            <button key={s.id} className={`chip ${isOpen(s.id) ? '' : 'locked'}`} style={{ '--c': s.color }} aria-pressed={s.id === cur.id} onClick={() => setSel(s.id)}>
              {!isOpen(s.id) && <Lock size={12} className="inline ml-1" />}{s.title} ({arN(s.counts.figs)})
            </button>
          ))}
        </div>
        {isOpen(cur.id) && !cur.locked ? <div className="dg-stack">{cur.figs.map(([n]) => <Diagram key={n} d={DIAGRAMS[n]} />)}</div> : isOpen(cur.id) ? <div className="spinner" /> : <LockedNotice title={`رسوم درس «${cur.title}» مقفلة`} lesson={cur} />}
      </Page>
    </>
  );
}
