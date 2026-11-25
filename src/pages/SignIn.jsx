// The first screen: the app opens only after signing in (email or Google).
import { useState } from 'react';
import {
  authMessage, googleAvailable, resetPassword, signInEmail, signInWithGoogle, signUpEmail,
} from '../lib/auth';

const C = '#0b5d4f';

export function SignIn() {
  const [mode, setMode] = useState('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const run = async (fn, ok) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      if (ok) setMsg({ ok: true, t: ok });
    } catch (e) {
      setMsg({ ok: false, t: authMessage(e) });
    } finally {
      setBusy(false);
    }
  };
  const submit = (e) => {
    e.preventDefault();
    run(() => (mode === 'in' ? signInEmail(email, pw) : signUpEmail(name, email, pw)));
  };
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>{mode === 'in' ? 'تسجيل الدخول' : 'إنشاء حساب'}</h3>
      <p className="stat mb-3">سجلي الدخول لتبدئي. يُحفظ تقدمك (البطاقات، النتائج، إجاباتك المقالية) في حسابك وتجدينه على أي جهاز.</p>
      {googleAvailable && (
        <button className="btn w-full mb-3" disabled={busy} onClick={() => run(signInWithGoogle)}>الدخول بحساب Google</button>
      )}
      <form onSubmit={submit} className="space-y-2 font-ui">
        {mode === 'up' && <input className="field" placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="field" type="email" dir="ltr" placeholder="البريد الإلكتروني" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" type="password" dir="ltr" placeholder="كلمة المرور" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={(e) => setPw(e.target.value)} />
        <button className="btn pri w-full" disabled={busy} type="submit">{mode === 'in' ? 'دخول' : 'إنشاء الحساب'}</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        <button className="btn" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }}>
          {mode === 'in' ? 'ليس لدي حساب' : 'لدي حساب'}
        </button>
        {mode === 'in' && (
          <button className="btn" disabled={busy || !email} onClick={() => run(() => resetPassword(email), 'أرسلنا رابط تغيير كلمة المرور إلى بريدك.')}>نسيت كلمة المرور</button>
        )}
      </div>
      {msg && <p className="note mt-3" style={{ color: msg.ok ? 'var(--ok)' : 'var(--bad)' }}>{msg.t}</p>}
    </div>
  );
}


export function SignInGate({ ready }) {
  return (
    <div className="gate">
      <div className="gate-top">
        <img src="icon-192.png" alt="" width="84" height="84" />
        <h1>مفاتيح التجويد</h1>
        <p>الدروس، البطاقات، مفاتيح الحفظ، الاختبارات، والتدريب المقالي</p>
      </div>
      <div className="gate-body">{ready ? <SignIn /> : <p className="stat text-center">…</p>}</div>
    </div>
  );
}
