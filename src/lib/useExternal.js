import { useEffect, useState } from 'react';
// Subscribe to one of the small { get, subscribe } stores in lib/.
export function useExternal(src) {
  const [v, setV] = useState(src.get());
  useEffect(() => src.subscribe(setV), [src]);
  return v;
}
