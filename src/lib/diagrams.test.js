import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const D = JSON.parse(readFileSync(new URL('../data/diagrams.json', import.meta.url)));
const L = JSON.parse(readFileSync(new URL('../data/lessons.json', import.meta.url)));
const TYPES = { def: 'rows', list: 'items', table: 'rows', compare: 'cols', tree: 'root', radial: 'items', steps: 'items', letters: 'groups', words: 'items', mouth: 'hl' };
const ZONES = ['khayshum', 'hanak', 'jawf', 'shafatan', 'asnan', 'taraf-lisan', 'wasat-lisan', 'aqsa-lisan', 'hafa-lisan', 'adna-halq', 'wasat-halq', 'aqsa-halq'];
const figs = new Set(L.flatMap((s) => (s.figs || []).map((f) => f[0])));

test('every figure has been redrawn', () => {
  for (const f of figs) assert.ok(D[f], `${f}: no diagram`);
});

test('every diagram redraws a real figure and is well formed', () => {
  for (const [k, d] of Object.entries(D)) {
    assert.ok(figs.has(k) && existsSync(new URL(`../../public/figs/${k}`, import.meta.url)), `${k}: no such figure`);
    assert.ok(d.title, `${k}: title`);
    for (const p of d.parts || [d]) {
      assert.ok(TYPES[p.t], `${k}: type ${p.t}`);
      assert.ok(p[TYPES[p.t]], `${k}: ${p.t} needs ${TYPES[p.t]}`);
      if (p.t === 'mouth') for (const z of p.hl) assert.ok(ZONES.includes(z), `${k}: zone ${z}`);
    }
  }
});
