import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FIREBASE_CONFIG } from './config';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);
// Inside the Android WebView there are no popups/redirects, and IndexedDB is
// the persistence that survives restarts reliably.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  ...(Capacitor.isNativePlatform() ? {} : { popupRedirectResolver: browserPopupRedirectResolver }),
});
