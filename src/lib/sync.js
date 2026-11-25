// Saves each user's progress (known cards, best scores, essay drafts, chosen
// tabs - everything the app keeps in localStorage) under users/<uid>/progress,
// and brings it back on another phone or after reinstalling.
//
// Values are stored as JSON strings, so the database returns them exactly as
// written. Merge rule on sign-in: the account's copy fills in what this phone
// is missing; for "known" cards and best scores the two are combined.
import { ref, get, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { store } from './store';
import { mergeValue } from './util';

// Not progress: the content cache is large and comes from the database anyway.
const SKIP = new Set(['content', 'sync_at']);
const enc = (k) => k.replace(/[.#$/[\]]/g, '_');

let uid = null;
let pending = new Set();
let timer = null;
const subs = new Set();
let status = { state: 'idle', at: store.get('sync_at', 0) };

function setStatus(s) {
  status = { ...status, ...s };
  subs.forEach((l) => l(status));
}
export const syncStatus = {
  get: () => status,
  subscribe(l) {
    subs.add(l);
    return () => subs.delete(l);
  },
};

async function flush() {
  timer = null;
  if (!uid || !pending.size) return;
  const keys = [...pending];
  pending = new Set();
  const patch = {};
  for (const k of keys) patch[enc(k)] = JSON.stringify({ k, v: store.get(k, null) });
  try {
    setStatus({ state: 'saving' });
    await update(ref(db, `users/${uid}/progress`), patch);
    const at = Date.now();
    store.set('sync_at', at, { silent: true });
    setStatus({ state: 'saved', at });
  } catch {
    keys.forEach((k) => pending.add(k));
    setStatus({ state: 'error' });
  }
}

function queue(k) {
  if (!uid || SKIP.has(k)) return;
  pending.add(k);
  if (!timer) timer = setTimeout(flush, 2000);
}

async function pullAndMerge() {
  setStatus({ state: 'saving' });
  const snap = await get(ref(db, `users/${uid}/progress`));
  const remote = {};
  snap.forEach((c) => {
    try {
      const { k, v } = JSON.parse(c.val());
      if (k) remote[k] = v;
    } catch { /* ignore a bad row */ }
  });
  const keys = new Set([...store.keys(), ...Object.keys(remote)]);
  for (const k of keys) {
    if (SKIP.has(k)) continue;
    const local = store.get(k, undefined);
    const merged = mergeValue(k, local, remote[k]);
    if (JSON.stringify(merged) !== JSON.stringify(local)) store.set(k, merged, { silent: true });
    if (JSON.stringify(merged) !== JSON.stringify(remote[k])) pending.add(k);
  }
  await flush();
  setStatus({ state: 'saved', at: Date.now() });
}

let started = false;
export function startSync() {
  if (started) return;
  started = true;
  store.onChange(queue);
  window.addEventListener('online', () => { if (pending.size) flush(); });
  onAuthStateChanged(auth, (user) => {
    uid = user?.uid || null;
    if (!uid) {
      setStatus({ state: 'idle' });
      return;
    }
    pullAndMerge().catch(() => setStatus({ state: 'error' }));
  });
}
