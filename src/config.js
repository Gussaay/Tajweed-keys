// App-wide constants: Firebase project, update and download links.

export const SITE_URL = 'https://tajweed-24716.web.app';
export const APK_URL = 'https://github.com/Gussaay/Tajweed-keys/releases/latest/download/tajweed-keys.apk';
// Written by CI next to the website: the newest APK's versionCode.
export const NATIVE_VERSION_URL = `${SITE_URL}/native-version.json`;
// Over-the-air manifest: the app swaps its own web layer from here, so only a
// change to the native shell (a new plugin) needs a new APK.
export const LIVE_UPDATE_URL = `${SITE_URL}/latest/update.json`;

// Web build version (CI sets it to 1.0.<run number>).
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
// When this web bundle was built; content published to the database later
// than this replaces the copy bundled in the app.
// eslint-disable-next-line no-undef
export const BUILD_TIME = typeof __BUILD_TIME__ === 'number' ? __BUILD_TIME__ : 0;

// Firebase project tajweed-24716, web app config from the console.
const env = import.meta.env;
export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDtMHxrg_WNE1cWTxAcVnYP2ruaGJU5GkE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'tajweed-24716.firebaseapp.com',
  databaseURL: 'https://tajweed-24716-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'tajweed-24716',
  storageBucket: 'tajweed-24716.firebasestorage.app',
  messagingSenderId: '707614138744',
  appId: env.VITE_FIREBASE_APP_ID || '1:707614138744:web:00d684b01eb210d242688d',
};

// OAuth "Web client" ID (Firebase > Authentication > Google > Web SDK
// configuration). Needed only for Google sign-in inside the Android app.
export const GOOGLE_WEB_CLIENT_ID =
  env.VITE_GOOGLE_WEB_CLIENT_ID || '707614138744-nqnqdnqrtel0jnl37hol6sb0agdhigsf.apps.googleusercontent.com';
