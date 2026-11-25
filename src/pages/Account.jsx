import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MyAccessCard } from '../components/Lock';
import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import { Page, TopBar } from '../components/ui';
import { isNative, signOut, useAuth } from '../lib/auth';
import { syncStatus } from '../lib/sync';
import { contentStatus, refreshContent } from '../lib/content';
import { ref, set } from 'firebase/database';
import { db } from '../firebase';
import { applyLiveUpdate, checkForUpdates, updateStatus } from '../lib/updates';
import { useExternal } from '../lib/useExternal';
import { openExternal } from '../lib/openUrl';
import { APK_URL, APP_VERSION } from '../config';
import { arN } from '../lib/util';

const C = '#0b5d4f';
const when = (ms) => (ms ? new Date(ms).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

function Profile({ user }) {
  const s = useExternal(syncStatus);
  const label = { idle: '', saving: 'جارٍ الحفظ…', saved: `آخر حفظ: ${when(s.at)}`, error: 'تعذّر الحفظ، سيُعاد عند الاتصال.' }[s.state];
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>حسابي</h3>
      <p className="font-ui font-bold">{user.displayName || user.email}</p>
      {user.displayName && <p className="stat" dir="ltr" style={{ textAlign: 'right' }}>{user.email}</p>}
      <p className="stat mt-1">تقدمك يُحفظ في حسابك تلقائيًا. {label}</p>
      <button className="btn mt-3" onClick={signOut}><LogOut size={16} className="inline ml-1" />تسجيل الخروج</button>
    </div>
  );
}

function Updates() {
  const u = useExternal(updateStatus);
  const c = useExternal(contentStatus);
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>التطبيق والتحديثات</h3>
      <ul className="stat space-y-1">
        <li>إصدار التطبيق: <b dir="ltr">{u.bundle || APP_VERSION}</b>{isNative && u.nativeBuild ? <> · APK رقم {arN(u.nativeBuild)}</> : null}</li>
        <li>الدروس: من قاعدة البيانات، نسخة {when(c.version)} · آخر تحديث على هذا الهاتف {when(c.at)}</li>
      </ul>
      <button className="btn mt-2" onClick={refreshContent}><RefreshCw size={16} className="inline ml-1" />حدّثي الدروس الآن</button>
      {isNative ? (
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="btn" disabled={u.checking} onClick={checkForUpdates}>
            <RefreshCw size={16} className={`inline ml-1 ${u.checking ? 'animate-spin' : ''}`} />تحقق من التحديثات
          </button>
          {u.liveReady && <button className="btn pri" onClick={applyLiveUpdate}>ثبّتي التحديث {u.liveReady.version} الآن</button>}
          {u.apk && <button className="btn pri" onClick={() => openExternal(u.apk.url || APK_URL)}>حمّلي APK الجديد {u.apk.version}</button>}
        </div>
      ) : (
        <button className="btn mt-3" onClick={() => openExternal(APK_URL)}>تحميل تطبيق أندرويد</button>
      )}
      {u.checkedAt && !u.liveReady && !u.apk && <p className="stat mt-2">التطبيق محدّث ({when(u.checkedAt)}).</p>}
      {u.error && <p className="stat mt-2" style={{ color: 'var(--bad)' }}>{u.error}</p>}
    </div>
  );
}

function Admin({ user, admin }) {
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  if (admin) {
    return (
      <div className="card" style={{ '--c': C }}>
        <h3><ShieldCheck size={18} className="inline ml-1" />الإشراف</h3>
        <Link to="/admin" className="btn pri w-full block text-center">المستخدمون والاشتراكات والطلبات</Link>
        <p className="stat mt-2">الدروس تُنشر في قاعدة البيانات تلقائيًا مع كل تحديث للتطبيق.</p>
      </div>
    );
  }
  const claim = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await set(ref(db, `admins/${user.uid}`), true);
      setMsg({ ok: true, t: 'أصبحتِ مشرفة.' });
    } catch {
      setMsg({ ok: false, t: 'غير مسموح: يوجد مشرف بالفعل.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="card" style={{ '--c': C }}>
      <h3><ShieldCheck size={18} className="inline ml-1" />الإشراف</h3>
      <p className="stat">أول حساب يضغط هنا يصبح المشرف. بعد ذلك يُغلق هذا الزر، ولا يضيف مشرفًا إلا مشرف.</p>
      <button className="btn mt-2" disabled={busy} onClick={claim}>اجعل هذا الحساب مشرفًا</button>
      {msg && <p className="note mt-2" style={{ color: msg.ok ? 'var(--ok)' : 'var(--bad)' }}>{msg.t}</p>}
    </div>
  );
}

export default function Account() {
  const { user, ready, admin } = useAuth();
  return (
    <>
      <TopBar title="الحساب والتحديثات" sub="تسجيل الدخول، حفظ التقدم، وتحديثات التطبيق والمحتوى" />
      <Page>
        {ready && user && <Profile user={user} />}
        {user && <MyAccessCard />}
        <Updates />
        {user && <Admin user={user} admin={admin} />}
      </Page>
    </>
  );
}
