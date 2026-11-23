// Bottom tab bar (same pattern as Easy Pedia), right-to-left.
import { NavLink } from 'react-router-dom';
import { BookOpen, ClipboardList, Home, Layers, ListChecks } from 'lucide-react';

const TABS = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/learn', label: 'الدروس', icon: BookOpen },
  { to: '/cards', label: 'البطاقات', icon: Layers },
  { to: '/quiz', label: 'اختبر نفسك', icon: ListChecks },
  { to: '/past', label: 'السابقة', icon: ClipboardList },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t pb-safe backdrop-blur" style={{ background: 'color-mix(in srgb, var(--surface) 94%, transparent)', borderColor: 'var(--line)' }}>
      <div className="max-w-3xl mx-auto grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-ui font-bold transition ${isActive ? 'text-brand-600 dark:text-brand-300' : 'text-muted'}`}>
            {({ isActive }) => (
              <>
                <span className={`flex items-center justify-center h-8 w-14 rounded-full transition ${isActive ? 'bg-brand-50 dark:bg-brand-900/60' : ''}`}>
                  <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
