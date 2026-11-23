import { useEffect, useState } from 'react';

const KEY = 'tj-theme';
const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function applyTheme(choice) {
  const dark = choice === 'dark' || (choice !== 'light' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  return dark;
}

export function useTheme() {
  const [choice, setChoice] = useState(() => {
    try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
  });
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    try { localStorage.setItem(KEY, choice); } catch {}
    setDark(applyTheme(choice));
  }, [choice]);
  const toggle = () => setChoice(dark ? 'light' : 'dark');
  return { dark, toggle };
}
