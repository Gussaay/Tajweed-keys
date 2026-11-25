// Content published to the database: content/{version, lessons, past, extra, finals}.
// Each section is a JSON string, so arrays, empty values and booleans come back
// exactly as written (the database would otherwise drop empty arrays).
import { ref, get, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { store } from './store';
import { CONTENT, SECTIONS, validContent } from '../data/content';

const subs = new Set();
let state = { online: null, fresh: null }; // online: published version; fresh: downloaded, not yet shown
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

export function parseContent(raw) {
  if (!raw) return null;
  const c = { version: Number(raw.version) || 0 };
  for (const k of SECTIONS) {
    try {
      c[k] = typeof raw[k] === 'string' ? JSON.parse(raw[k]) : raw[k];
    } catch {
      return null;
    }
  }
  return validContent(c) ? c : null;
}

let started = false;
/** Watches the published version; downloads and saves newer content. */
export function startContentSync() {
  if (started) return;
  started = true;
  onValue(ref(db, 'content/version'), async (snap) => {
    const v = Number(snap.val()) || 0;
    emit({ online: v });
    if (v <= CONTENT.version || v <= (state.fresh || 0)) return;
    try {
      const c = parseContent((await get(ref(db, 'content'))).val());
      if (!c || c.version <= CONTENT.version) return;
      store.set('content', c, { silent: true });
      emit({ fresh: c.version });
    } catch { /* offline or not allowed: keep what we have */ }
  }, () => {});
}

/** Admin: publish the given content (defaults to what the app shows now). */
export async function publishContent(content = CONTENT) {
  const version = Date.now();
  const payload = { version };
  for (const k of SECTIONS) payload[k] = JSON.stringify(content[k]);
  await set(ref(db, 'content'), payload);
  return version;
}

/** Admin: replace one section (lessons/past/extra/finals) from edited JSON text. */
export async function publishSection(section, jsonText) {
  const value = JSON.parse(jsonText);
  if (!Array.isArray(value)) throw new Error('يجب أن يكون المحتوى مصفوفة JSON.');
  const next = { ...CONTENT, [section]: value, version: 1 };
  if (!validContent(next)) throw new Error('المحتوى ناقص.');
  return publishContent(next);
}

/**
 * The first signed-in user to press this becomes admin. Once any admin exists
 * the database rules refuse it (database.rules.json), and only an admin can add another.
 */
export async function claimAdmin(uid) {
  await set(ref(db, `admins/${uid}`), true);
}
