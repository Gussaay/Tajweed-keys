// Live access for the signed-in person: their access record, the settings,
// and their unlock requests, kept in a small store and cached on the phone so
// the app opens the same way without internet.
import { useMemo, useSyncExternalStore } from 'react';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { store } from './store';
import { accessOf, lessonOpen, readConfig } from './access';
import { useAuth } from './auth';

const cache = store.get('acc_cache', {});
let state = { uid: null, record: cache.record || null, rawConfig: cache.config || null, requests: {}, loaded: !!cache.uid };
const subs = new Set();
const emit = (patch) => {
  state = { ...state, ...patch };
  if (state.uid) store.set('acc_cache', { uid: state.uid, record: state.record, config: state.rawConfig }, { silent: true });
  subs.forEach((l) => l());
};

let stops = [];
onAuthStateChanged(auth, (user) => {
  stops.forEach((s) => s());
  stops = [];
  if (!user) { state = { uid: null, record: null, rawConfig: state.rawConfig, requests: {}, loaded: false }; subs.forEach((l) => l()); return; }
  if (cache.uid !== user.uid) state = { ...state, record: null };
  state = { ...state, uid: user.uid };
  const on = (path, key) => stops.push(onValue(ref(db, path), (s) => emit({ [key]: s.val(), loaded: true }), () => emit({ loaded: true })));
  on(`access/${user.uid}`, 'record');
  on('access_config', 'rawConfig');
  on(`unlock_requests/${user.uid}`, 'requests');
  // So admins can find this person on the users list.
  update(ref(db, `people/${user.uid}`), { name: user.displayName || '', email: user.email || '', at: Date.now() }).catch(() => {});
});

const sub = (l) => { subs.add(l); return () => subs.delete(l); };
const get = () => state;

export function useAccess() {
  const s = useSyncExternalStore(sub, get);
  const { admin } = useAuth();
  return useMemo(() => {
    const config = readConfig(s.rawConfig);
    const acc = accessOf({ record: s.record, config, admin });
    const openKey = acc.full ? 'all' : [...config.free, ...acc.lessons].sort().join(',');
    return { acc, config, openKey, requests: s.requests || {}, loaded: s.loaded, isOpen: (id) => lessonOpen(acc, id, config) };
  }, [s, admin]);
}

export function requestUnlock(user, { key, type, id = '', title = '', ref: payRef = '' }) {
  return set(ref(db, `unlock_requests/${user.uid}/${key}`), {
    type, id, title, ref: payRef, status: 'pending', at: Date.now(),
    name: user.displayName || '', email: user.email || '',
  });
}
export const cancelRequest = (uid, key) => remove(ref(db, `unlock_requests/${uid}/${key}`));
