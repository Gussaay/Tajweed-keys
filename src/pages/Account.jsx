import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MyAccessCard } from '../components/Lock';
import { LogOut, RefreshCw, ShieldCheck, UploadCloud } from 'lucide-react';
import { Page, TopBar } from '../components/ui';
import { isNative, signOut, useAuth } from '../lib/auth';
import { syncStatus } from '../lib/sync';
import { contentStatus, claimAdmin, publishContent, publishSection } from '../lib/remoteContent';
import { applyLiveUpdate, checkForUpdates, updateStatus } from '../lib/updates';
import { useExternal } from '../lib/useExternal';
import { openExternal } from '../lib/openUrl';
import { CONTENT, CONTENT_SOURCE, SECTIONS } from '../data/content';
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
        <li>المحتوى: {CONTENT_SOURCE === 'online' ? 'من قاعدة البيانات' : 'المرفق مع التطبيق'} ({when(CONTENT.version)})</li>
        {c.online ? <li>آخر محتوى منشور: {when(c.online)}</li> : null}
      </ul>
      {c.fresh && <button className="btn pri mt-2" onClick={() => window.location.reload()}>اعرضي المحتوى الجديد</button>}
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
  const [section, setSection] = useState('lessons');
  const [text, setText] = useState('');
  const run = async (fn) => {
    setBusy(true);
    setMsg(null);
    try {
      setMsg({ ok: true, t: await fn() });
    } catch (e) {
      setMsg({ ok: false, t: e?.code === 'PERMISSION_DENIED' || /permission/i.test(e?.message) ? 'غير مسموح: هذا الحساب ليس مشرفًا.' : e?.message });
    } finally {
      setBusy(false);
    }
  };
  if (!admin) {
    return (
      <div className="card" style={{ '--c': C }}>
        <h3><ShieldCheck size={18} className="inline ml-1" />الإشراف</h3>
        <p className="stat">أول حساب يضغط هنا يصبح المشرف الذي ينشر المحتوى. بعد ذلك يُغلق هذا الزر.</p>
        <button className="btn mt-2" disabled={busy} onClick={() => run(async () => { await claimAdmin(user.uid); return 'أصبحتِ مشرفة.'; })}>اجعل هذا الحساب مشرفًا</button>
        {msg && <p className="note mt-2" style={{ color: msg.ok ? 'var(--ok)' : 'var(--bad)' }}>{msg.t}</p>}
      </div>
    );
  }
  return (
    <div className="card" style={{ '--c': C }}>
      <h3><ShieldCheck size={18} className="inline ml-1" />الإشراف</h3>
      <Link to="/admin" className="btn pri w-full mb-3 block text-center">المستخدمون والاشتراكات والطلبات</Link>
      <p className="font-ui font-bold">نشر المحتوى</p>
      <p className="stat">ما يُنشر هنا يصل لكل المستخدمين عند اتصالهم، ويبقى معهم دون إنترنت.</p>
      <button className="btn pri mt-2" disabled={busy} onClick={() => run(async () => `نُشر المحتوى (${when(await publishContent())}).`)}>
        <UploadCloud size={16} className="inline ml-1" />انشري المحتوى الحالي
      </button>
      <details className="mt-3">
        <summary className="font-ui font-bold cursor-pointer">تعديل قسم بصيغة JSON</summary>
        <div className="flex gap-2 my-2">
          {SECTIONS.map((s) => (
            <button key={s} className="chip" style={{ '--c': C }} aria-pressed={s === section} onClick={() => { setSection(s); setText(''); }}>{s}</button>
          ))}
        </div>
        <button className="btn mb-2" onClick={() => setText(JSON.stringify(CONTENT[section], null, 1))}>حمّلي النص الحالي</button>
        <textarea className="field font-mono text-xs" dir="ltr" rows={12} value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn pri mt-2" disabled={busy || !text} onClick={() => run(async () => `نُشر قسم ${section} (${when(await publishSection(section, text))}).`)}>انشري هذا القسم</button>
      </details>
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
