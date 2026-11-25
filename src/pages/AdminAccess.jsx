// Admins: answer unlock and subscription requests, give or take access, and
// set what is free, the trial length, the price and the payment details.
import { useEffect, useMemo, useState } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { db } from '../firebase';
import { Page, TopBar } from '../components/ui';
import { useAuth } from '../lib/auth';
import { LESSONS } from '../data';
import { accessOf, describe, grantFor, readConfig } from '../lib/access';
import { arN } from '../lib/util';

const C = '#0b5d4f';
const when = (ms) => (ms ? new Date(ms).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const TYPE = { trial: 'تجربة مجانية', pro: 'اشتراك كامل', lesson: 'فتح درس' };

function useNode(path) {
  const [v, setV] = useState(undefined);
  useEffect(() => onValue(ref(db, path), (s) => setV(s.val() || {}), () => setV({})), [path]);
  return v;
}

function Requests({ reqs, people, config, run }) {
  const list = useMemo(() => Object.entries(reqs || {}).flatMap(([uid, rs]) =>
    Object.entries(rs || {}).map(([key, r]) => ({ uid, key, ...r }))).sort((a, b) => (b.at || 0) - (a.at || 0)), [reqs]);
  const pending = list.filter((r) => r.status === 'pending');
  const done = list.filter((r) => r.status !== 'pending').slice(0, 20);
  const approve = (r) => run(async () => {
    const g = grantFor(r, config);
    const patch = { [`unlock_requests/${r.uid}/${r.key}/status`]: 'approved', [`unlock_requests/${r.uid}/${r.key}/done`]: Date.now() };
    for (const [k, v] of Object.entries(g)) patch[`access/${r.uid}/${k}`] = v;
    await update(ref(db), patch);
    return `تمت الموافقة: ${TYPE[r.type]} لـ ${r.name || r.email}`;
  });
  const deny = (r) => run(async () => {
    const reply = window.prompt('سبب الرفض (اختياري)', '') ?? null;
    if (reply === null) return null;
    await update(ref(db, `unlock_requests/${r.uid}/${r.key}`), { status: 'denied', reply, done: Date.now() });
    return 'رُفض الطلب.';
  });
  const Row = ({ r, actions }) => (
    <li className="adm-row">
      <div className="flex-1 min-w-0">
        <p className="font-ui font-bold">{TYPE[r.type] || r.type}{r.type === 'lesson' ? `: ${r.title}` : ''}</p>
        <p className="stat">{r.name || people?.[r.uid]?.name || '—'} · <span dir="ltr">{r.email || people?.[r.uid]?.email}</span></p>
        {r.ref && <p className="stat">مرجع الدفع: <b>{r.ref}</b></p>}
        <p className="stat">{when(r.at)}{r.status !== 'pending' ? ` · ${r.status === 'approved' ? 'مقبول' : 'مرفوض'}` : ''}</p>
      </div>
      {actions && (
        <div className="flex flex-col gap-1">
          <button className="btn pri" onClick={() => approve(r)}>موافقة</button>
          <button className="btn" onClick={() => deny(r)}>رفض</button>
        </div>
      )}
    </li>
  );
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>الطلبات ({arN(pending.length)})</h3>
      {pending.length ? <ul className="space-y-2">{pending.map((r) => <Row key={r.uid + r.key} r={r} actions />)}</ul> : <p className="stat">لا توجد طلبات جديدة.</p>}
      {done.length > 0 && (
        <details className="mt-3"><summary className="font-ui font-bold cursor-pointer">آخر الطلبات المجاب عنها</summary>
          <ul className="space-y-2 mt-2">{done.map((r) => <Row key={r.uid + r.key} r={r} />)}</ul>
        </details>
      )}
    </div>
  );
}

function Users({ people, records, config, admins, run }) {
  const [q, setQ] = useState('');
  const rows = useMemo(() => Object.entries(people || {}).map(([uid, p]) => ({ uid, ...p, acc: accessOf({ record: records?.[uid], config, admin: !!admins?.[uid] }) }))
    .filter((p) => !q || `${p.name} ${p.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.at || 0) - (a.at || 0)), [people, records, config, admins, q]);
  const grant = (u, type) => run(async () => {
    const g = grantFor({ type }, config);
    await update(ref(db), Object.fromEntries(Object.entries(g).map(([k, v]) => [`access/${u.uid}/${k}`, v])));
    return `${TYPE[type]}: ${u.name || u.email}`;
  });
  const revoke = (u) => run(async () => {
    if (!window.confirm(`إلغاء الاشتراك والتجربة والدروس المفتوحة لـ ${u.name || u.email}؟`)) return null;
    const r = records?.[u.uid] || {};
    await update(ref(db, `access/${u.uid}`), { role: null, pro_until: null, unlocks: null, ...(r.trial ? { 'trial/end': Date.now() } : {}) });
    return 'أُلغي الوصول.';
  });
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>المستخدمون ({arN(Object.keys(people || {}).length)})</h3>
      <input className="field mb-2" placeholder="ابحثي بالاسم أو البريد" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="space-y-2">
        {rows.slice(0, 100).map((u) => (
          <li key={u.uid} className="adm-row">
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold">{u.name || '—'}</p>
              <p className="stat truncate" dir="ltr" style={{ textAlign: 'right' }}>{u.email}</p>
              <p className="stat">{describe(u.acc)}</p>
            </div>
            {u.acc.kind !== 'admin' && (
              <div className="flex flex-col gap-1">
                <button className="btn pri" onClick={() => grant(u, 'pro')}>اشتراك</button>
                {u.acc.full ? <button className="btn" onClick={() => revoke(u)}>إلغاء</button> : !u.acc.trialUsed && <button className="btn" onClick={() => grant(u, 'trial')}>تجربة</button>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings({ raw, run }) {
  const c = readConfig(raw);
  const [f, setF] = useState(c);
  useEffect(() => setF(readConfig(raw)), [raw]);
  const put = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const toggleFree = (id) => put('free')(f.free.includes(id) ? f.free.filter((x) => x !== id) : [...f.free, id]);
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>إعدادات القفل والاشتراك</h3>
      <label className="adm-check"><input type="checkbox" checked={f.enabled} onChange={(e) => put('enabled')(e.target.checked)} /> تفعيل القفل (عند الإيقاف يُفتح كل المحتوى للجميع)</label>
      <p className="font-ui font-bold mt-3 mb-1">الدروس المجانية</p>
      <div className="flex flex-wrap gap-1.5">
        {LESSONS.map((s) => (
          <button key={s.id} className="chip" style={{ '--c': s.color }} aria-pressed={f.free.includes(s.id)} onClick={() => toggleFree(s.id)}>{s.num}. {s.title}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <label className="stat">أيام التجربة<input className="field" type="number" min="1" value={f.trial_days} onChange={(e) => put('trial_days')(e.target.value)} /></label>
        <label className="stat">مدة الاشتراك (أيام)<input className="field" type="number" min="1" value={f.pro_days} onChange={(e) => put('pro_days')(e.target.value)} /></label>
      </div>
      <label className="adm-check mt-3"><input type="checkbox" checked={f.subscriptions} onChange={(e) => put('subscriptions')(e.target.checked)} /> فتح الاشتراك (عند الإيقاف يظهر «قريبًا»)</label>
      <label className="stat block mt-2">السعر (يظهر بجانب الاشتراك)<input className="field" placeholder="مثال: ١٠٠٠٠ جنيه" value={f.price} onChange={(e) => put('price')(e.target.value)} /></label>
      <label className="stat block mt-2">طريقة الدفع (رقم الحساب، اسم المستفيد، التعليمات)
        <textarea className="field" rows={4} value={f.pay_info} onChange={(e) => put('pay_info')(e.target.value)} />
      </label>
      <button className="btn pri w-full mt-3" onClick={() => run(async () => {
        await set(ref(db, 'access_config'), { ...f, trial_days: Number(f.trial_days) || 3, pro_days: Number(f.pro_days) || 365 });
        return 'حُفظت الإعدادات.';
      })}>احفظي الإعدادات</button>
    </div>
  );
}

export default function AdminAccess() {
  const { admin } = useAuth();
  const reqs = useNode(admin ? 'unlock_requests' : 'none/x');
  const people = useNode(admin ? 'people' : 'none/x');
  const records = useNode(admin ? 'access' : 'none/x');
  const admins = useNode(admin ? 'admins' : 'none/x');
  const raw = useNode('access_config');
  const [msg, setMsg] = useState(null);
  const config = readConfig(raw);
  const run = async (fn) => {
    setMsg(null);
    try {
      const t = await fn();
      if (t) setMsg({ ok: true, t });
    } catch (e) {
      setMsg({ ok: false, t: /permission/i.test(e?.message || '') ? 'غير مسموح: هذا الحساب ليس مشرفًا.' : e?.message || 'تعذّر الحفظ' });
    }
  };
  return (
    <>
      <TopBar title="المستخدمون والاشتراكات" sub="الطلبات، المستخدمون، وإعدادات القفل والدفع" />
      <Page>
        {!admin ? <p className="card stat">هذه الصفحة للمشرفين فقط.</p> : (
          <>
            {msg && <p className="note" style={{ color: msg.ok ? 'var(--ok)' : 'var(--bad)' }}>{msg.t}</p>}
            <Requests reqs={reqs} people={people} config={config} run={run} />
            <Users people={people} records={records} config={config} admins={admins} run={run} />
            <Settings raw={raw} run={run} />
          </>
        )}
      </Page>
    </>
  );
}
