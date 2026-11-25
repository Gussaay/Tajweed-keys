// localStorage with a prefix; never throws (private mode, blocked storage).
// Writes are announced to listeners so progress can be synced to the account.
import { useEffect, useState } from 'react';

export const PREFIX = 'tj_';
const listeners = new Set();

export const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(PREFIX + k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set(k, v, { silent = false } = {}) {
    try {
      const json = JSON.stringify(v);
      if (localStorage.getItem(PREFIX + k) === json) return;
      localStorage.setItem(PREFIX + k, json);
    } catch {
      return;
    }
    if (!silent) listeners.forEach((l) => l(k));
  },
  keys() {
    try {
      return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));
    } catch {
      return [];
    }
  },
  onChange(l) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStored(key, initial) {
  const [v, setV] = useState(() => store.get(key, initial));
  useEffect(() => { store.set(key, v); }, [key, v]);
  return [v, setV];
}
