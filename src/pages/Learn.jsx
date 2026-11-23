import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LESSONS, MODES } from '../data';
import { Html, Page, TopBar } from '../components/ui';
import { arN } from '../lib/util';

export default function Learn() {
  return (
    <>
      <TopBar title={MODES.learn.title} sub={MODES.learn.sub} back={false} />
      <Page className="space-y-3">
        {LESSONS.map((s) => (
          <Link key={s.id} to={`/learn/${s.id}`} className="block surface rounded-2xl overflow-hidden transition hover:shadow-md active:scale-[0.99]" style={{ '--c': s.color }}>
            <div className="flex items-center gap-3 p-3 text-white" style={{ background: s.color }}>
              <span className="h-11 w-11 rounded-full bg-white/20 grid place-items-center font-display text-2xl font-bold shrink-0">{s.num}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-ui font-bold text-lg leading-tight">{s.title}</span>
                <span className="block text-xs opacity-85 font-ui" dir="ltr" style={{ textAlign: 'right' }}>{s.en}</span>
              </span>
              <ChevronLeft size={22} />
            </div>
            <Html className="px-4 py-3 text-[15px] line-clamp-3" html={s.intro} />
            <p className="px-4 pb-3 stat">
              {arN(s.blocks.length + 2)} أقسام · {arN(s.mnemonics.length)} مفاتيح حفظ · {arN(s.essays.length)} أسئلة مقالية · {arN(s.flash.length)} بطاقة
            </p>
          </Link>
        ))}
      </Page>
    </>
  );
}
