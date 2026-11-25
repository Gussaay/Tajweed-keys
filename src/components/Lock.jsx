// Everything a person sees about locked content: the lock mark, the "فتح"
// sheet (free trial, full subscription with payment details, or one lesson),
// the notice in place of a locked page, and "اشتراكي" on the account page.
import { useState } from 'react';
import { Check, Clock, Crown, Gift, Lock, LockOpen, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useAccess, requestUnlock, cancelRequest } from '../lib/accessStore';
import { describe, PRO, TRIAL } from '../lib/access';
import { arN } from '../lib/util';

const C = '#0b5d4f';

export const LockMark = ({ size = 15 }) => (
  <span className="lock-mark" title="مقفل"><Lock size={size} /></span>
);

function Status({ req, onCancel }) {
  if (req?.status === 'pending') {
    return (
      <p className="lk-status">
        <Clock size={13} /> أُرسل الطلب، في انتظار الموافقة
        <button onClick={onCancel} aria-label="إلغاء الطلب"><X size={13} /></button>
      </p>
    );
  }
  if (req?.status === 'denied') return <p className="lk-status bad">لم تتم الموافقة على الطلب السابق{req.reply ? `: ${req.reply}` : ''}</p>;
  return null;
}

export function UnlockSheet({ open, onClose, lesson = null }) {
  const { user } = useAuth();
  const { acc, config, requests } = useAccess();
  const [busy, setBusy] = useState('');
  const [payRef, setPayRef] = useState('');
  const [msg, setMsg] = useState(null);
  if (!open || !user) return null;
  const ask = async (r) => {
    setBusy(r.key);
    setMsg(null);
    try {
      await requestUnlock(user, r);
      setMsg({ ok: true, t: 'أُرسل الطلب. يُفتح المحتوى تلقائيًا عند الموافقة.' });
    } catch {
      setMsg({ ok: false, t: 'تعذّر إرسال الطلب. تأكدي من الاتصال بالإنترنت.' });
    } finally {
      setBusy('');
    }
  };
  const cancel = (key) => cancelRequest(user.uid, key).catch(() => {});
  const pending = (k) => requests[k]?.status === 'pending';
  const lessonKey = lesson && `lesson~${lesson.id}`;

  return (
    <div className="lk-back" onClick={onClose}>
      <div className="lk-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="lk-head">
          <span className="lk-ic"><Lock size={18} /></span>
          <div className="flex-1 min-w-0">
            <p className="font-ui font-bold">{lesson ? `فتح درس «${lesson.title}»` : 'فتح كل المحتوى'}</p>
            <p className="stat">{describe(acc)}</p>
          </div>
          <button className="lk-x" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        </div>

        {!acc.trialUsed && (
          <div className="lk-opt">
            <span className="lk-ic amber"><Gift size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold">تجربة مجانية · {arN(config.trial_days)} أيام</p>
              <p className="stat">كل الدروس والاختبارات، مرة واحدة لكل حساب</p>
              <Status req={requests[TRIAL]} onCancel={() => cancel(TRIAL)} />
            </div>
            {!pending(TRIAL) && <button className="btn pri" disabled={busy === TRIAL} onClick={() => ask({ key: TRIAL, type: TRIAL, title: 'تجربة مجانية' })}>اطلبي</button>}
          </div>
        )}

        <div className="lk-opt col">
          <div className="flex items-center gap-3">
            <span className="lk-ic violet"><Crown size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold">الاشتراك الكامل{config.price ? ` · ${config.price}` : ''}</p>
              <p className="stat">{config.subscriptions ? `كل الدروس والاختبارات لمدة ${arN(config.pro_days)} يومًا` : 'قريبًا'}</p>
            </div>
          </div>
          {config.subscriptions && (
            pending(PRO) ? <Status req={requests[PRO]} onCancel={() => cancel(PRO)} /> : (
              <>
                {config.pay_info && (
                  <div className="lk-pay">
                    <p className="font-ui font-bold mb-1">طريقة الدفع</p>
                    <p className="whitespace-pre-line">{config.pay_info}</p>
                  </div>
                )}
                <Status req={requests[PRO]} />
                <input className="field" placeholder="رقم العملية أو اسم المحوِّل (بعد الدفع)" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                <button className="btn pri w-full" disabled={busy === PRO || (!!config.pay_info && !payRef.trim())}
                  onClick={() => ask({ key: PRO, type: PRO, title: 'الاشتراك الكامل', ref: payRef.trim() })}>
                  أرسلي طلب الاشتراك
                </button>
              </>
            )
          )}
        </div>

        {lesson && (
          <div className="lk-opt">
            <span className="lk-ic"><LockOpen size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="font-ui font-bold">هذا الدرس فقط</p>
              <p className="stat">اطلبي من المشرفة فتح «{lesson.title}»</p>
              <Status req={requests[lessonKey]} onCancel={() => cancel(lessonKey)} />
            </div>
            {!pending(lessonKey) && <button className="btn" disabled={busy === lessonKey} onClick={() => ask({ key: lessonKey, type: 'lesson', id: lesson.id, title: lesson.title })}>اطلبي</button>}
          </div>
        )}
        {msg && <p className="note mt-2" style={{ color: msg.ok ? 'var(--ok)' : 'var(--bad)' }}>{msg.t}</p>}
      </div>
    </div>
  );
}

/** Shown in place of a locked lesson or page. */
export function LockedNotice({ title, lesson = null }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card text-center" style={{ '--c': C }}>
      <span className="lk-big"><Lock size={28} /></span>
      <h3 className="mt-3">{title || 'هذا المحتوى مقفل'}</h3>
      <p className="stat max-w-sm mx-auto">ابدئي تجربة مجانية أو اشتركي لفتح كل الدروس والاختبارات.</p>
      <button className="btn pri mt-3 px-6" onClick={() => setOpen(true)}><LockOpen size={16} className="inline ml-1" />فتح</button>
      <UnlockSheet open={open} onClose={() => setOpen(false)} lesson={lesson} />
    </div>
  );
}

/** "اشتراكي" on the account page. */
export function MyAccessCard() {
  const { acc, requests } = useAccess();
  const [open, setOpen] = useState(false);
  const waiting = Object.values(requests).filter((r) => r?.status === 'pending').length;
  return (
    <div className="card" style={{ '--c': C }}>
      <h3>اشتراكي</h3>
      <div className="flex items-center gap-3">
        <span className={`lk-ic ${acc.full ? 'ok' : ''}`}>{acc.full ? <Check size={18} /> : <Lock size={18} />}</span>
        <div className="flex-1 min-w-0">
          <p className="font-ui font-bold">{describe(acc)}</p>
          {waiting > 0 && <p className="stat" style={{ color: 'var(--gold)' }}>{arN(waiting)} طلب في انتظار الموافقة</p>}
        </div>
        {!acc.full && <button className="btn pri" onClick={() => setOpen(true)}>فتح</button>}
      </div>
      <UnlockSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
