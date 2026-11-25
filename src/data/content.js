// Where the study content comes from.
//
// The app ships with a copy of every lesson and exam (the JSON files here), so
// it works offline from the first launch. An admin can publish newer content to
// the Firebase database (Account > Admin); the app then saves it on the phone
// (localStorage) and uses it from the next start, online or offline.
// Whichever is newer wins: the bundled copy carries the build time, the
// published copy the time it was published.
import LESSONS_B from './lessons.json';
import PAST_B from './past.json';
import EXTRA_B from './extra.json';
import FINALS_B from './finals.json';
import { store } from '../lib/store';
import { BUILD_TIME } from '../config';

export const SECTIONS = ['lessons', 'past', 'extra', 'finals'];

export const BUNDLED = { version: BUILD_TIME, lessons: LESSONS_B, past: PAST_B, extra: EXTRA_B, finals: FINALS_B };

export function validContent(c) {
  return !!c && Number(c.version) > 0 && SECTIONS.every((k) => Array.isArray(c[k])) && c.lessons.length > 0;
}

const cached = store.get('content', null);
export const CONTENT = validContent(cached) && Number(cached.version) > BUNDLED.version ? cached : BUNDLED;
export const CONTENT_SOURCE = CONTENT === BUNDLED ? 'bundled' : 'online';
