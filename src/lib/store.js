// localStorage with a prefix; never throws (private mode, blocked storage).
import { useEffect, useState } from 'react';

const PREFIX = 'tj_';
export const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(PREFIX + k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(PREFIX + k, JSON.stringify(v));
    } catch {}
  },
};

export function useStored(key, initial) {
  const [v, setV] = useState(() => store.get(key, initial));
  useEffect(() => { store.set(key, v); }, [key, v]);
  return [v, setV];
}
