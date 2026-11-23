// Lesson filter used by the practice modes ("كل الدروس" or one lesson).
import { LESSONS } from '../data';
import { useStored } from '../lib/store';

export function useLessonSel() {
  const [sel, setSel] = useStored('sel', 'all');
  return [LESSONS.some((s) => s.id === sel) ? sel : 'all', setSel];
}

export default function LessonChips({ sel, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
      <button className="chip" style={{ '--c': '#0b5d4f' }} aria-pressed={sel === 'all'} onClick={() => onChange('all')}>كل الدروس</button>
      {LESSONS.map((s) => (
        <button key={s.id} className="chip" style={{ '--c': s.color }} aria-pressed={sel === s.id} onClick={() => onChange(s.id)}>
          {s.num}. {s.title}
        </button>
      ))}
    </div>
  );
}
