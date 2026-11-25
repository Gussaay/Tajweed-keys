import { useSyncExternalStore } from 'react';
import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithCredential,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail,
  signOut as fbSignOut, updateProfile,
} from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { Capacitor } from '@capacitor/core';
import { auth, db } from '../firebase';
import { GOOGLE_WEB_CLIENT_ID } from '../config';

export const isNative = Capacitor.isNativePlatform();
// Google inside the APK needs the OAuth web client ID and the APK's SHA-1 in Firebase.
export const googleAvailable = !isNative || !!GOOGLE_WEB_CLIENT_ID;

// ---- current user + admin flag, as a tiny external store -------------------
let state = { user: auth.currentUser, ready: false, admin: false };
const subs = new Set();
const emit = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((l) => l());
};
let stopAdmin = null;
onAuthStateChanged(auth, (user) => {
  emit({ user, ready: true, admin: false });
  stopAdmin?.();
  stopAdmin = null;
  if (user) {
    stopAdmin = onValue(ref(db, `admins/${user.uid}`), (s) => emit({ admin: s.val() === true }), () => {});
  }
});
export function useAuth() {
  return useSyncExternalStore((l) => {
    subs.add(l);
    return () => subs.delete(l);
  }, () => state);
}

// ---- actions ---------------------------------------------------------------
let socialReady = false;
async function nativeGoogleIdToken() {
  const { SocialLogin } = await import('@capgo/capacitor-social-login');
  if (!socialReady) {
    await SocialLogin.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID } });
    socialReady = true;
  }
  const res = await SocialLogin.login({ provider: 'google', options: {} });
  const idToken = res?.result?.idToken || res?.idToken;
  if (!idToken) throw new Error('لم يكتمل الدخول بحساب Google.');
  return idToken;
}

export async function signInWithGoogle() {
  if (isNative) {
    const idToken = await nativeGoogleIdToken();
    return (await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))).user;
  }
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}
export const signInEmail = (email, pw) => signInWithEmailAndPassword(auth, email.trim(), pw);
export async function signUpEmail(name, email, pw) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), pw);
  if (name) await updateProfile(user, { displayName: name.trim() }).catch(() => {});
  return user;
}
export const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());
export const signOut = () => fbSignOut(auth);

export function authMessage(err) {
  const map = {
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح.',
    'auth/missing-password': 'اكتبي كلمة المرور.',
    'auth/weak-password': 'كلمة المرور ٦ أحرف على الأقل.',
    'auth/email-already-in-use': 'هذا البريد مسجل من قبل، ادخلي بدلًا من إنشاء حساب.',
    'auth/too-many-requests': 'محاولات كثيرة، انتظري قليلًا ثم أعيدي المحاولة.',
    'auth/network-request-failed': 'لا يوجد اتصال بالإنترنت.',
    'auth/popup-closed-by-user': 'أُلغي الدخول بحساب Google.',
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة.',
    'auth/wrong-password': 'البريد أو كلمة المرور غير صحيحة.',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد.',
    'auth/operation-not-allowed': 'طريقة الدخول هذه غير مفعّلة بعد في Firebase.',
    'auth/configuration-not-found': 'تسجيل الدخول غير مفعّل بعد في Firebase.',
  };
  return map[err?.code] || err?.message || 'حدث خطأ، أعيدي المحاولة.';
}
