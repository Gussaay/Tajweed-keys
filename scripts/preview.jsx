// Dev only (npx vite, then /preview.html?f=a,b or ?lesson=id): draws diagrams
// straight from content/ without signing in. Not part of the build.
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/amiri-quran/400.css';
import '../src/index.css';
import D from '../content/diagrams.json';
import L from '../content/lessons.json';
import Diagram from '../src/components/Diagram';
import Head from '../src/components/Head';

const q = new URLSearchParams(location.search);
let keys = q.get('f') ? q.get('f').split(',') : Object.keys(D);
if (q.get('lesson')) keys = L.find((s) => s.id === q.get('lesson')).figs.map((f) => f[0]);
if (q.get('type')) keys = keys.filter((k) => (D[k].parts || [D[k]]).some((p) => p.t === q.get('type')));
const POSES = [['rest','open'],['tipUp','open','ن'],['interdental','open','ث ذ ظ'],['sibilant','open','ص س ز'],['midUp','open','ج ش ي'],['backUp','open','ك'],['uvular','open','ق'],['low','open','ا'],['rest','closed','ب م'],['rest','labiodental','ف'],['rest','round','و'],['tipUp','open','ن',true],['glottal','open','ء ه'],['pharynx','open','ع ح']];
if (q.get('head')) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 8, background: '#fff' }}>
      {POSES.map(([p, l, t, n], i) => <div key={i} style={{ border: '1px solid #ddd' }}><code>{p}/{l}</code><Head pose={p} lips={l} label={t} nasal={!!n} air={n ? 'nasal' : p === 'sibilant' ? 'oral' : null} /></div>)}
    </div>,
  );
} else if (q.get('dark')) document.documentElement.classList.add('dark');
ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{ maxWidth: 440, margin: '0 auto', padding: 12 }}>
    {keys.map((k) => <div key={k} data-k={k}><code style={{ fontSize: 10 }}>{k}</code><Diagram d={D[k]} /></div>)}
  </div>,
);
