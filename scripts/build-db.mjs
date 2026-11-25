// Builds the study content for the Firebase database from content/*.json.
// CI uploads the result with `firebase database:update /` on every push to
// main, so the repository stays the one place content is edited.
//
//   catalog            JSON string: { version, lessons: [lesson summaries], extra }
//                      read by anyone signed in
//   lesson/<id>        JSON string: { lesson, diagrams } (diagrams of that lesson)
//                      read only by those allowed to open the lesson
//   exams              JSON string: { past, finals }, full access only
//
// Usage: node scripts/build-db.mjs [out.json]
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(new URL(`../content/${f}.json`, import.meta.url)));
const lessons = read('lessons'), diagrams = read('diagrams');
const version = Date.now();

const summary = (s) => ({
  id: s.id, num: s.num, title: s.title, en: s.en, color: s.color, intro: s.intro,
  counts: {
    blocks: s.blocks.length, mnemonics: s.mnemonics.length, essays: s.essays.length,
    flash: s.flash.length, quiz: s.quiz.length, figs: (s.figs || []).length,
  },
});

const out = {
  catalog: JSON.stringify({ version, lessons: lessons.map(summary), extra: read('extra') }),
  lesson: Object.fromEntries(lessons.map((s) => [s.id, JSON.stringify({
    lesson: s,
    diagrams: Object.fromEntries((s.figs || []).filter(([n]) => diagrams[n]).map(([n]) => [n, diagrams[n]])),
  })])),
  exams: JSON.stringify({ past: read('past'), finals: read('finals') }),
};
const file = process.argv[2] || 'dbcontent.json';
writeFileSync(file, JSON.stringify(out));
console.log(`${file}: ${lessons.length} lessons, version ${version}, ${Math.round(JSON.stringify(out).length / 1024)} KB`);
