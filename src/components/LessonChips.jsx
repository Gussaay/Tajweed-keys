// Lesson filter used by the practice modes ("كل الدروس" or one lesson).
// Locked lessons show a lock and open the unlock sheet instead.
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { LESSONS } from '../data';
import { useStored } from '../lib/store';
import { useAccess } from '../lib/accessStore';
import { UnlockSheet } from './Lock';

export function useLessonSel() {
  const [sel, setSel] = useStored('sel', 'all');
  const { isOpen } = useAccess();
  return [LESSONS.some((s) => s.id === sel) && isOpen(sel) ? sel : 'all', setSel];
}

export default function LessonChips({ sel, onChange }) {
  const { isOpen, acc } = useAccess();
  const [ask, setAsk] = useState(null);
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
      <button className="chip" style={{ '--c': '#0b5d4f' }} aria-pressed={sel === 'all'} onClick={() => onChange('all')}>
        {acc.full ? 'كل الدروس' : 'كل الدروس المفتوحة'}
      </button>
      {LESSONS.map((s) => {
        const open = isOpen(s.id);
        return (
          <button key={s.id} className={`chip ${open ? '' : 'locked'}`} style={{ '--c': s.color }} aria-pressed={sel === s.id}
            onClick={() => (open ? onChange(s.id) : setAsk(s))}>
            {!open && <Lock size={12} className="inline ml-1" />}{s.num}. {s.title}
          </button>
        );
      })}
      <UnlockSheet open={!!ask} lesson={ask} onClose={() => setAsk(null)} />
    </div>
  );
}
