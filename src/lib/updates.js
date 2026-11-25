// App updates inside the Android app.
//
// 1. Over-the-air (web layer): CI publishes the built site as a zip with
//    /latest/update.json { version, url, checksum, minNativeBuild }. The app
//    downloads it in the background and Capgo switches to it the next time the
//    app goes to the background or restarts. No APK download needed.
//    A bundle is only taken when its minNativeBuild <= the installed APK, so
//    web code never runs on an APK that lacks a plugin it needs.
// 2. New APK: when /native-version.json names a newer versionCode than the
//    installed APK (a native change), the app shows a download prompt.
//
// notifyAppReady() must run on every launch, or Capgo rolls the bundle back.
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { APP_VERSION, LIVE_UPDATE_URL, NATIVE_VERSION_URL } from '../config';
import { isNewer } from './util';

const isNative = Capacitor.isNativePlatform();
const subs = new Set();
let state = {
  nativeBuild: null, nativeVersion: null, bundle: APP_VERSION,
  liveReady: null, apk: null, checking: false, error: null, checkedAt: null,
};
const emit = (p) => {
  state = { ...state, ...p };
  subs.forEach((l) => l(state));
};
export const updateStatus = {
  get: () => state,
  subscribe(l) {
    subs.add(l);
    return () => subs.delete(l);
  },
};

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store', signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

let checking = false;
export async function checkForUpdates() {
  if (!isNative || checking || !navigator.onLine) return state;
  checking = true;
  emit({ checking: true, error: null });
  try {
    const info = await CapApp.getInfo().catch(() => ({}));
    const nativeBuild = Number(info.build) || 0;
    emit({ nativeBuild, nativeVersion: info.version || null });

    // A newer APK?
    const nv = await getJson(NATIVE_VERSION_URL).catch(() => null);
    if (nv && Number(nv.versionCode) > nativeBuild) emit({ apk: { version: nv.versionName, code: Number(nv.versionCode), url: nv.url } });

    // A newer web layer that this APK can run?
    const m = await getJson(LIVE_UPDATE_URL).catch(() => null);
    if (m?.version && m?.url) {
      const { bundle } = await CapacitorUpdater.current();
      const running = bundle?.version && bundle.version !== 'builtin' ? bundle.version : APP_VERSION;
      emit({ bundle: running });
      const fits = !(Number(m.minNativeBuild) > nativeBuild);
      if (fits && isNewer(m.version, running)) {
        const { bundles = [] } = await CapacitorUpdater.list();
        let b = bundles.find((x) => x.version === m.version && (x.status === 'pending' || x.status === 'success'));
        if (!b) b = await CapacitorUpdater.download({ url: m.url, version: m.version, checksum: m.checksum });
        await CapacitorUpdater.next({ id: b.id });
        emit({ liveReady: { id: b.id, version: m.version } });
      }
    }
    emit({ checkedAt: Date.now() });
  } catch (e) {
    emit({ error: e?.message || 'تعذّر التحقق من التحديثات.' });
  } finally {
    checking = false;
    emit({ checking: false });
  }
  return state;
}

/** Restart into the downloaded web layer now (it also applies by itself later). */
export async function applyLiveUpdate() {
  if (state.liveReady) await CapacitorUpdater.set({ id: state.liveReady.id });
}

let started = false;
export function startUpdates() {
  if (!isNative || started) return;
  started = true;
  CapacitorUpdater.notifyAppReady().catch(() => {});
  setTimeout(checkForUpdates, 3000);
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive && Date.now() - (state.checkedAt || 0) > 6 * 3600 * 1000) checkForUpdates();
  });
}
