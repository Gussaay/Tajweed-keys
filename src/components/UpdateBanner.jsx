// Small banners above the bottom bar: new content downloaded, new APK out.
import { useState } from 'react';
import { contentStatus } from '../lib/remoteContent';
import { updateStatus } from '../lib/updates';
import { useExternal } from '../lib/useExternal';
import { openExternal } from '../lib/openUrl';
import { APK_URL } from '../config';

function Bar({ children, onClose }) {
  return (
    <div className="fixed inset-x-0 z-30 px-3" style={{ bottom: 'calc(70px + env(safe-area-inset-bottom))' }}>
      <div className="max-w-3xl mx-auto surface rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 font-ui text-sm">
        <div className="flex-1 min-w-0">{children}</div>
        <button className="btn" onClick={onClose} aria-label="إغلاق">✕</button>
      </div>
    </div>
  );
}

export default function UpdateBanner() {
  const c = useExternal(contentStatus);
  const u = useExternal(updateStatus);
  const [hide, setHide] = useState({});
  if (c.fresh && !hide.content) {
    return (
      <Bar onClose={() => setHide((h) => ({ ...h, content: true }))}>
        <span className="font-bold">وصل محتوى جديد.</span>{' '}
        <button className="btn pri mr-1" onClick={() => window.location.reload()}>اعرضيه الآن</button>
      </Bar>
    );
  }
  if (u.apk && !hide.apk) {
    return (
      <Bar onClose={() => setHide((h) => ({ ...h, apk: true }))}>
        <span className="font-bold">إصدار جديد من التطبيق {u.apk.version || ''}.</span>{' '}
        <button className="btn pri mr-1" onClick={() => openExternal(u.apk.url || APK_URL)}>تحميل</button>
      </Bar>
    );
  }
  return null;
}
