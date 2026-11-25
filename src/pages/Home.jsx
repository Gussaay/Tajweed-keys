import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, CircleUserRound, ClipboardList, Image, KeyRound, Layers, ListChecks, PenLine } from 'lucide-react';
import { LESSONS, MODES, PAST } from '../data';
import { store } from '../lib/store';
import { arN } from '../lib/util';
import { ThemeButton } from '../components/ui';
import { useAccess } from '../lib/accessStore';
import { LockMark } from '../components/Lock';

const tiles = () => [
  { mode: 'learn', icon: BookOpen, tint: 'bg-brand-50 text-brand-600', tag: 'خريطة ذهنية وشرح لكل درس' },
  { mode: 'cards', icon: Layers, tint: 'bg-sky-50 text-sky-700', tag: 'اقلب وقيّم نفسك' },
  { mode: 'mnem', icon: KeyRound, tint: 'bg-amber-50 text-amber-700', tag: 'جمل تحفظ بها القواعد' },
  { mode: 'quiz', icon: ListChecks, tint: 'bg-emerald-50 text-emerald-700', tag: 'اختيار من متعدد' },
  { mode: 'essay', icon: PenLine, tint: 'bg-violet-50 text-violet-700', tag: 'اكتب مع المؤقت' },
  { mode: 'gallery', icon: Image, tint: 'bg-rose-50 text-rose-700', tag: `${arN(LESSONS.reduce((n, s) => n + (s.counts?.figs || 0), 0))} رسمًا تفاعليًا: مخارج، صفات، مدود` },
  { mode: 'past', icon: ClipboardList, tint: 'bg-orange-50 text-orange-700', tag: (PAST.length ? `${arN(PAST.reduce((n, t) => n + t.items.length, 0))} سؤالًا مرتبة حسب النوع` : 'للمشتركات: الاختبارات النهائية والسابقة') },
];

function Ring({ pct }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isOpen } = useAccess();
  const known = store.get('known', {});
  const total = LESSONS.reduce((n, s) => n + (s.counts?.flash || 0), 0);
  const k = Object.keys(known).length;
  const pct = total ? Math.min(1, k / total) : 0;
  const best = store.get('best_all', 0);

  return (
    <div className="min-h-screen">
      <header className="bg-brand-700 text-white pt-safe">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-3 py-2">
          <span className="font-display text-2xl font-bold px-1">مفاتيح التجويد</span>
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-white/10" aria-label="الحساب والتحديثات" onClick={() => navigate('/account')}>
              <CircleUserRound size={22} />
            </button>
            <ThemeButton />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 pt-3 pb-28 space-y-4">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-teal-500 text-white p-4 shadow-lg shadow-brand-700/20">
          <span className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <span className="absolute left-16 -bottom-12 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            <img src="icon-192.png" alt="" className="h-12 w-12 rounded-xl shrink-0 shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold text-base leading-tight">رواية حفص عن عاصم</p>
              <p className="text-white/85 text-sm leading-snug">سبعة عشر درسًا، رسوم توضيحية، بطاقات، اختبارات، وأسئلة سابقة</p>
              <p className="text-white/90 text-xs mt-1 font-ui">
                {arN(k)} من {arN(total)} بطاقة محفوظة{best ? ` · أفضل نتيجة في الاختبار ${arN(best)}` : ''}
              </p>
            </div>
            <div className="relative shrink-0">
              <Ring pct={pct} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-ui">{arN(Math.round(pct * 100))}%</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-ui font-bold text-lg mb-2">ماذا تريد أن تذاكر؟</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tiles().map(({ mode, icon: Icon, tint, tag }) => (
              <button key={mode} onClick={() => navigate(MODES[mode].path)}
                className="surface text-right rounded-2xl p-4 transition active:scale-[0.98] hover:shadow-md">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${tint}`}><Icon size={24} /></div>
                <p className="font-ui font-bold text-base mt-3 leading-snug">{MODES[mode].short}</p>
                <p className="text-xs text-muted mt-0.5 leading-snug font-ui">{tag}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-ui font-bold text-lg mb-2">الدروس</h2>
          <div className="space-y-2">
            {LESSONS.map((s) => {
              const kn = s.flash.filter((_, i) => known[`${s.id}:${i}`]).length;
              return (
                <button key={s.id} onClick={() => navigate(`/learn/${s.id}`)}
                  className="surface w-full flex items-center gap-3 rounded-2xl p-3 text-right transition hover:shadow-md active:scale-[0.99]">
                  <span className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-white font-display text-xl font-bold" style={{ background: s.color }}>{s.num}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-ui font-bold">{s.title}</span>
                    <span className="block text-xs text-muted truncate font-ui">{s.en} · {arN(kn)}/{arN(s.counts?.flash || 0)} بطاقة</span>
                  </span>
                  {isOpen(s.id) ? <ChevronLeft size={20} className="text-muted shrink-0" /> : <LockMark />}
                </button>
              );
            })}
          </div>
        </section>

        <p className="text-center stat pt-2">الإصدار {arN(import.meta.env.VITE_APP_VERSION)}</p>
      </main>
    </div>
  );
}
