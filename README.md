# مفاتيح التجويد — Tajweed Keys

A tajweed study app (Hafs ʿan ʿĀṣim) as a **React web app** that also ships as a
**native Android app** through Capacitor. It uses the same stack and conventions as
[Easy Pedia](https://github.com/Gussaay/eaay-pedia-app): Vite + React 18 + Tailwind 3 +
Capacitor 7 + PWA (vite-plugin-pwa), with a bottom tab bar, a coloured app bar, and
light/dark mode. All content is bundled, so the app works fully offline.

- **Download the APK:** https://github.com/Gussaay/Tajweed-keys/releases/latest/download/tajweed-keys.apk
- **Web app:** https://tajweed-24716.web.app (Firebase Hosting, project `tajweed-24716`)

## Study modes

| Mode | Route | What it does |
|---|---|---|
| الرئيسية | `/` | Progress ring, the six modes, the eight lessons, the printable PDF summary |
| الشرح المبسّط | `/learn`, `/learn/:id` | Each lesson: mind map, explanation blocks, tables, the waqf ladder, memory keys, model essay answers |
| البطاقات | `/cards` | Flip cards, "عرفتها / لم أعرفها", unknown cards come back first, progress saved |
| مفاتيح الحفظ | `/mnemonics` | Memory sentences hidden; tap to reveal |
| اختبر نفسك | `/quiz` | Multiple choice with explanations, best score saved per lesson |
| تدريب المقالي | `/essay` | Write with a 10-minute timer, drafts saved, model answer + key-point checklist, extra practice questions |
| الاختبارات السابقة | `/past` | Questions from 5 past exams by type: عرّفي، أكملي، صح/خطأ مع التصويب، البدء بهمزة الوصل، أوجه الوقف، تطبيقات، الاستخراج من المصحف |

Lessons: همزتا القطع والوصل، اجتماع الهمزتين في كلمة، التقاء الساكنين، هاء الكناية،
الوقف على أواخر الكلم، الوقف والابتداء، القطع والسكت، النبر.

Practice modes share a lesson filter ("كل الدروس" or one lesson). Progress (known
cards, best scores, essay drafts, last filter) is kept on the device in localStorage.

## Content

All text lives in `src/data/` as JSON (HTML strings inside):

- `lessons.json` — the 8 lessons: `intro`, `diagram`, `blocks`, `table`, `ladder`, `mnemonics`, `essays`, `flash`, `quiz`
- `past.json` — past-exam questions grouped by type (`kind`: `reveal`, `tf`, `guide`)
- `extra.json` — extra free-practice essay questions

`public/tajweed-keys-summary.pdf` is the printable summary linked from the home page.
`npm test` checks the content is complete (8 lessons, 7 past-exam types, valid quiz answers).

## Commands

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # unit tests (helpers + content checks)
npm run build            # production web build -> dist/
npm run icons            # regenerate PWA icons + Android icon sources from assets/brand/icon.svg
npx @capacitor/assets generate --android   # regenerate native icons/splash from assets/
npm run mobile:sync      # build + copy web assets into android/
npm run mobile:open      # open android/ in Android Studio
npm run mobile:build:apk # debug APK (android/app/build/outputs/apk/debug/)
npm run deploy:web       # build + firebase deploy --only hosting (tajweed-24716.web.app)
```

Android builds need JDK 21 (Android Studio's bundled JBR works).

## Releases (GitHub Actions)

`.github/workflows/build.yml` runs on every push to `main`:

1. builds the APK and publishes it as a GitHub Release (`releases/latest/download/tajweed-keys.apk`);
2. builds the web app and deploys it to Firebase Hosting (`tajweed-24716`). This needs the
   repository secret `FIREBASE_SERVICE_ACCOUNT_TAJWEED` (a service-account JSON key of the
   project); without it the job only prints a warning. Manual deploy: `npx firebase-tools deploy --only hosting`.

## Firebase

Project `tajweed-24716` (Realtime Database in europe-west1). `android/app/google-services.json`
is the Android app's config (package `com.tajweed.keys`); Capacitor applies the
google-services Gradle plugin automatically when that file is present.

The CI APK is debug-signed with a fresh key on each runner, so installing a newer
build over an older one may need an uninstall first. For Play Store / in-place
updates, add a release keystore as repository secrets and switch the job to
`assembleRelease` (same approach as Easy Pedia's `deploy.yml`).

The router uses `HashRouter` so the same build works on any static host and inside the
Android WebView without server rewrites.
