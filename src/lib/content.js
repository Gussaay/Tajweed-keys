// Loads the study content from the Firebase database after sign-in.
//
//   catalog       every lesson's summary (anyone signed in)
//   lesson/<id>   a whole lesson and its diagrams; the database rules send it
//                 only to people allowed to open that lesson
//   exams         past exams and the final papers (full access only)
//
// What arrives is saved on the phone for this account, so the app opens and
// works offline after the first time; it is refreshed on every start, when
// the published content changes, and when this person's access changes.
import { ref, get, onValue } from 'firebase/database';
import { db } from '../firebase';
import { store } from './store';
import { setContent } from '../data';

const KEY = 'content_v2';
const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v || null);

let state = { status: 'idle', version: 0, at: 0, error: '' }; // status: idle | loading | ready | error
const subs = new Set();
const emit = (p) => {
  state = { ...state, ...p };
  subs.forEach((l) => l(state));
};
export const contentStatus = {
  get: () => state,
  subscribe(l) {
    subs.add(l);
    return () => subs.delete(l);
  },
};

let uid = null;
let run = 0;
let stopWatch = null;

function loadCache(forUid) {
  const c = store.get(KEY, null);
  if (!c || c.uid !== forUid || !c.catalog) return false;
  setContent(c);
  emit({ status: 'ready', version: c.catalog.version || 0, at: c.at || 0 });
  return true;
}

const denied = (e) => /permission/i.test(e?.code || '') || /permission/i.test(e?.message || '');

/** Downloads the catalog and every lesson this person may open. */
export async function refreshContent() {
  if (!uid) return;
  const me = ++run, forUid = uid;
  if (state.status !== 'ready') emit({ status: 'loading', error: '' });
  try {
    const catalog = parse((await get(ref(db, 'catalog'))).val());
    if (!catalog?.lessons?.length) throw new Error('لم يُنشر المحتوى بعد.');
    const old = store.get(KEY, null);
    const cached = old?.uid === forUid ? old : null;
    const lessons = {};
    await Promise.all(catalog.lessons.map(async ({ id }) => {
      try {
        const v = parse((await get(ref(db, `lesson/${id}`))).val());
        if (v?.lesson) lessons[id] = v;
      } catch (e) {
        // Locked for this person: leave it out. Any other failure: keep the copy we had.
        if (!denied(e) && cached?.lessons?.[id]) lessons[id] = cached.lessons[id];
      }
    }));
    let exams = null;
    try {
      exams = parse((await get(ref(db, 'exams'))).val());
    } catch (e) {
      if (!denied(e)) exams = cached?.exams || null;
    }
    if (me !== run || forUid !== uid) return; // a newer load or another account took over
    const c = { uid: forUid, at: Date.now(), catalog, lessons, exams };
    setContent(c);
    store.set(KEY, c, { silent: true });
    emit({ status: 'ready', version: catalog.version || 0, at: c.at, error: '' });
  } catch (e) {
    if (me !== run) return;
    if (state.status === 'ready') return; // offline: keep showing the saved copy
    emit({ status: 'error', error: e?.message || 'تعذّر تحميل الدروس.' });
  }
}

/** Called when the signed-in account changes (null when signed out). */
export function startContent(nextUid) {
  if (nextUid === uid) return;
  uid = nextUid;
  run++;
  stopWatch?.();
  stopWatch = null;
  setContent({ catalog: null });
  emit({ status: 'idle', version: 0, at: 0, error: '' });
  if (!uid) return;
  loadCache(uid);
  // Newly published content: the catalog's version changes.
  stopWatch = onValue(ref(db, 'catalog'), (snap) => {
    try {
      const v = parse(snap.val())?.version || 0;
      if (v && v !== state.version) refreshContent();
    } catch { /* bad catalog: ignore */ }
  }, () => {});
}
