import { test } from 'node:test';
import assert from 'node:assert/strict';
import { arN, shuffle, keyPoints, wordCount, fmtTime, buildDeck } from './util.js';
import fs from 'node:fs';

const lessons = JSON.parse(fs.readFileSync(new URL('../../content/lessons.json', import.meta.url)));
const past = JSON.parse(fs.readFileSync(new URL('../../content/past.json', import.meta.url)));

test('arabic digits', () => assert.equal(arN(2026), '٢٠٢٦'));
test('shuffle keeps every item', () => {
  const a = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(shuffle(a).sort(), a);
});
test('key points come from bold terms, unique', () => {
  assert.deepEqual(keyPoints('<p><b>أ</b> و <b>ب</b> ثم <b>أ</b></p>'), ['أ', 'ب']);
});
test('word count and timer', () => {
  assert.equal(wordCount('  همزة   القطع '), 2);
  assert.equal(wordCount(''), 0);
  assert.equal(fmtTime(600), '١٠:٠٠');
});
test('deck puts unknown cards first', () => {
  const known = { 'hamz:0': 1 };
  const deck = buildDeck(lessons, known);
  assert.equal(deck.length, lessons.reduce((n, s) => n + s.flash.length, 0));
  assert.equal(deck[deck.length - 1].k, 'hamz:0');
});
test('content is complete: 17 lessons, 7 base past-exam types', () => {
  assert.equal(lessons.length, 17);
  assert.equal(new Set(lessons.map((s) => s.id)).size, lessons.length);
  assert.ok(lessons.some((s) => s.id === 'nabr'));
  assert.equal(past.length, 7);
  for (const s of lessons) {
    assert.ok(s.flash.length && s.quiz.length && s.essays.length && s.mnemonics.length, s.id);
    for (const [q, opts, ans] of s.quiz) assert.ok(ans >= 0 && ans < opts.length, q);
  }
});
test('final exams: two papers of 7 questions, valid categories', () => {
  const finals = JSON.parse(fs.readFileSync(new URL('../../content/finals.json', import.meta.url)));
  assert.deepEqual(finals.map((f) => f.id), ['f14', 'f13']);
  const cats = new Set(['def', 'fill', 'tf', 'harf', 'alaqa', 'extract']);
  for (const f of finals) {
    assert.equal(f.qs.length, 7, f.id);
    for (const q of f.qs) {
      assert.ok(cats.has(q.cat), q.t);
      for (const it of q.items) {
        if (q.cat === 'tf') assert.equal(typeof it[1], 'boolean', it[0]);
        else assert.ok(it[0] && it[1], it[0]);
      }
    }
  }
});
