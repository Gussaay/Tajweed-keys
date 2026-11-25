import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The database content built by scripts/build-db.mjs, read back the way the app does.
const out = join(mkdtempSync(join(tmpdir(), 'db-')), 'db.json');
execFileSync('node', [new URL('../../scripts/build-db.mjs', import.meta.url).pathname, out]);
const db = JSON.parse(readFileSync(out, 'utf8'));

test('catalog, lessons and exams are JSON strings that parse', () => {
  const catalog = JSON.parse(db.catalog);
  assert.ok(catalog.version > 0 && catalog.lessons.length >= 17);
  for (const m of catalog.lessons) {
    assert.ok(m.id && m.title && m.counts, m.id);
    const l = JSON.parse(db.lesson[m.id]);
    assert.equal(l.lesson.id, m.id);
    assert.equal(l.lesson.flash.length, m.counts.flash);
    for (const [f] of l.lesson.figs || []) assert.ok(l.diagrams[f], `${m.id}: ${f}`);
  }
  const exams = JSON.parse(db.exams);
  assert.ok(exams.past.length && exams.finals.length);
});

test('a locked lesson in the catalog carries no lesson text', () => {
  const catalog = JSON.parse(db.catalog);
  for (const m of catalog.lessons) assert.equal(m.blocks, undefined);
});

test('setContent fills the app data, with locked lessons as summaries', async () => {
  const data = await import('../data/index.js');
  const catalog = JSON.parse(db.catalog);
  const first = catalog.lessons[0].id;
  data.setContent({ catalog, lessons: { [first]: JSON.parse(db.lesson[first]) }, exams: JSON.parse(db.exams) });
  assert.equal(data.LESSONS.length, catalog.lessons.length);
  assert.equal(data.LESSONS[0].locked, false);
  assert.ok(data.LESSONS[0].blocks.length > 0);
  assert.equal(data.LESSONS[1].locked, true);
  assert.deepEqual(data.LESSONS[1].flash, []);
  assert.ok(data.LESSONS[1].counts.flash > 0);
  assert.equal(data.PAST[0].id, 'finals');
  data.setContent({ catalog });
  assert.equal(data.PAST.length, 0);
});
