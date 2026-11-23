import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

// Lesson content is trusted HTML written for this app (src/data/*.json).
export const Html = ({ html, as: Tag = 'div', ...rest }) => <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;

export function ThemeButton({ className = '' }) {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} className={`p-2 rounded-full hover:bg-white/10 ${className}`} aria-label={dark ? 'الوضع الفاتح' : 'الوضع الداكن'}>
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

// Coloured app bar used by every inner page (Easy Pedia style).
export function TopBar({ title, sub, back = true }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-brand-700 text-white pt-safe shadow-md shadow-brand-900/10">
      <div className="max-w-3xl mx-auto flex items-center gap-2 px-3 py-2.5">
        {back && (
          <button className="p-2 rounded-full hover:bg-white/10" aria-label="رجوع" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
            <ArrowRight size={22} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-ui font-bold text-lg truncate">{title}</h1>
          {sub && <p className="text-white/75 text-xs leading-snug font-ui line-clamp-2">{sub}</p>}
        </div>
        <ThemeButton />
      </div>
    </header>
  );
}

export const Page = ({ children, className = '' }) => (
  <main className={`max-w-3xl mx-auto px-4 pt-3 pb-28 ${className}`}>{children}</main>
);
