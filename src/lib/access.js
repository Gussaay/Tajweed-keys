// Who may open what (the same model as Easy Pedia, made smaller).
//
// Database nodes (database.rules.json):
//   access_config        { enabled, free: [lessonId], trial_days, pro_days,
//                          subscriptions, price, pay_info }        admins write
//   access/<uid>         { role: 'pro', pro_until, trial: { start, end },
//                          unlocks: { <lessonId>: { at, until? } }, note }
//                                                                  admins write
//   unlock_requests/<uid>/<key>  { type: 'trial'|'pro'|'lesson', id, title,
//                          status, at, name, email, ref }   the person asks,
//                          admins answer (Account > الإشراف)
//   people/<uid>         { name, email, at }  so admins can find someone
//
// Everyone must sign in. Free lessons open for all; the rest (and the past
// exams) need a running trial, Pro, or an unlock of that lesson. Times are ms.
// Plain JavaScript so the tests run under node.

export const TRIAL = 'trial';
export const PRO = 'pro';

export const DEFAULT_CONFIG = {
  enabled: true,
  free: ['hamz', 'muqaddima'],
  trial_days: 3,
  pro_days: 365,
  subscriptions: true,
  price: '',
  pay_info: '',
};

const isTrue = (v) => v === true || v === 'true';
const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : d);
const list = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v).filter((k) => v[k]) : null);

export function readConfig(raw) {
  const c = raw || {};
  return {
    enabled: c.enabled === undefined ? DEFAULT_CONFIG.enabled : isTrue(c.enabled),
    free: list(c.free) || DEFAULT_CONFIG.free,
    trial_days: num(c.trial_days, DEFAULT_CONFIG.trial_days),
    pro_days: num(c.pro_days, DEFAULT_CONFIG.pro_days),
    subscriptions: c.subscriptions === undefined ? DEFAULT_CONFIG.subscriptions : isTrue(c.subscriptions),
    price: String(c.price || ''),
    pay_info: String(c.pay_info || ''),
  };
}

const live = (until, now) => !until || Number(until) > now;

/**
 * What one person has. `full` opens everything; otherwise `lessons` lists the
 * extra lessons unlocked for them. `until` is when full access ends (0 = never).
 */
export function accessOf({ record = null, config = DEFAULT_CONFIG, admin = false, now = Date.now() } = {}) {
  const r = record || {};
  const trialEnd = Number(r.trial?.end) || 0;
  const base = { trialUsed: !!r.trial, trialActive: trialEnd > now, trialEnd, lessons: [], until: 0 };
  if (admin) return { ...base, full: true, kind: 'admin' };
  if (!config.enabled) return { ...base, full: true, kind: 'open' };
  if (r.role === PRO && live(r.pro_until, now)) return { ...base, full: true, kind: PRO, until: Number(r.pro_until) || 0 };
  if (base.trialActive) return { ...base, full: true, kind: TRIAL, until: trialEnd };
  const lessons = Object.entries(r.unlocks || {}).filter(([, u]) => u && live(u.until, now)).map(([k]) => k);
  return { ...base, full: false, kind: r.role === PRO ? 'expired' : 'free', proEnded: r.role === PRO ? Number(r.pro_until) : 0, lessons };
}

export const lessonOpen = (acc, id, config = DEFAULT_CONFIG) =>
  !acc || acc.full || config.free.includes(id) || acc.lessons.includes(id);

/** What an approved request writes into access/<uid> (a multi-path update). */
export function grantFor(req, config, now = Date.now()) {
  const day = 86400000;
  if (req.type === TRIAL) return { trial: { start: now, end: now + config.trial_days * day } };
  if (req.type === PRO) return { role: PRO, pro_until: now + config.pro_days * day };
  if (req.type === 'lesson' && req.id) return { [`unlocks/${req.id}`]: { at: now } };
  return {};
}

const fmt = (ms) => new Date(ms).toLocaleDateString('ar-EG', { dateStyle: 'medium' });
export function describe(acc) {
  if (!acc) return '';
  if (acc.kind === 'admin') return 'مشرفة: كل المحتوى مفتوح';
  if (acc.kind === 'open') return 'كل المحتوى مفتوح';
  if (acc.kind === PRO) return acc.until ? `مشتركة حتى ${fmt(acc.until)}` : 'مشتركة: كل المحتوى مفتوح';
  if (acc.kind === TRIAL) return `تجربة مجانية حتى ${fmt(acc.until)}`;
  if (acc.kind === 'expired') return `انتهى الاشتراك${acc.proEnded ? ` في ${fmt(acc.proEnded)}` : ''}`;
  return acc.lessons.length ? `الدروس المجانية و${acc.lessons.length} دروس مفتوحة لك` : 'الدروس المجانية فقط';
}
