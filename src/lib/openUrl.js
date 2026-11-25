import { Capacitor } from '@capacitor/core';
// Opens a link outside the app (the APK download goes to the phone's browser).
export async function openExternal(url) {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener');
  }
}
