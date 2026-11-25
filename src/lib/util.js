// Small helpers shared by the study modes. Pure functions (unit-tested).

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const arN = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[d]);

export function shuffle(list, rand = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const stripTags = (html) => String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

// Key-point checklist for an essay: the bold terms of the model answer,
// unique, at most 10 (same rule as the original study page).
export function keyPoints(answerHtml, max = 10) {
  const out = [];
  for (const m of String(answerHtml).matchAll(/<b>([\s\S]*?)<\/b>/g)) {
    const t = stripTags(m[1]);
    if (t && !out.includes(t)) out.push(t);
  }
  return out.slice(0, max);
}

export const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export const fmtTime = (s) =>
  arN(String(Math.floor(s / 60)).padStart(2, '0')) + ':' + arN(String(s % 60).padStart(2, '0'));

// Flashcard deck: shuffled, cards not yet known first.
export function buildDeck(lessons, known, rand = Math.random) {
  const all = [];
  lessons.forEach((s) =>
    s.flash.forEach(([f, b], i) => all.push({ k: `${s.id}:${i}`, f, b, c: s.color, t: s.title })),
  );
  return shuffle(all, rand).sort((a, b) => (known[a.k] ? 1 : 0) - (known[b.k] ? 1 : 0));
}

// "1.0.10" > "1.0.9": compares dotted versions number by number.
export function isNewer(a, b) {
  const pa = String(a || '').split('.').map(Number);
  const pb = String(b || '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y;
  }
  return false;
}

// Progress merge on sign-in: the account fills what this phone lacks;
// known cards are combined and best scores keep the higher one.
export function mergeValue(key, local, remote) {
  if (local === undefined) return remote;
  if (remote === undefined) return local;
  if (key === 'known' && local && remote && typeof local === 'object') return { ...remote, ...local };
  if (key.startsWith('best_') && typeof local === 'number' && typeof remote === 'number') return Math.max(local, remote);
  return local;
}
