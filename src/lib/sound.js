// Sounds for the interactive diagrams.
//  speak(text): Arabic text-to-speech. In the Android app it uses the native
//    TTS engine (plugin @capacitor-community/text-to-speech, APK 14 and later);
//    in a browser it uses speechSynthesis. canSpeak() says whether either works.
//  meter(n, ...): a sustained vowel-like tone held for n harakat, with a soft
//    tick at the start of each haraka, for counting the length of a madd.
import { Capacitor, registerPlugin } from '@capacitor/core';

const TTS = registerPlugin('TextToSpeech');
const native = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('TextToSpeech');
const web = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export const canSpeak = () => native() || web();

let arVoice;
function pickVoice() {
  if (arVoice !== undefined) return arVoice;
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null; // not loaded yet: try again next time
  arVoice = vs.find((v) => /^ar(-|_|$)/i.test(v.lang)) || null;
  return arVoice;
}

export async function speak(text, rate = 0.7) {
  if (!text) return;
  try {
    if (native()) {
      await TTS.stop().catch(() => {});
      await TTS.speak({ text, lang: 'ar-SA', rate, pitch: 1, volume: 1, category: 'playback' });
      return;
    }
    if (web()) {
      const s = window.speechSynthesis;
      s.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = rate;
      const v = pickVoice();
      if (v) u.voice = v;
      s.speak(u);
    }
  } catch { /* no voice for Arabic: stay silent */ }
}

// The usual way to hear a letter's makhraj: a hamza with fatha before the
// letter, and the letter itself with sukun (أَبْ، أَتْ...).
const BARE = /^[ء-ي]$/;
export function letterSound(chip) {
  const c = chip.replace(/[ـً-ٰٟ]/g, '').replace('هـ', 'ه');
  if (c === 'ا' || c === 'ى') return 'آ';
  if (c === 'ء' || c === 'أ') return 'أَأْ';
  if (BARE.test(c)) return `أَ${c}ْ`;
  return /[ء-ي]/.test(chip) ? chip : null; // words as written; symbols are silent
}

// ---- haraka meter ---------------------------------------------------------
let ctx;
function audio() {
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export const canMeter = () => !!(typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext));

let current = null;
export function stopMeter() {
  if (current) { current(); current = null; }
}

// Plays n harakat of `beat` ms each. onBeat(i) is called at the start of each
// haraka (1..n) and onEnd() when it finishes or is stopped.
export function meter(n, { beat = 550, onBeat, onEnd } = {}) {
  stopMeter();
  const ac = audio();
  const timers = [];
  let done = false;
  const finish = () => { if (done) return; done = true; timers.forEach(clearTimeout); onEnd?.(); };
  let nodes = [];
  if (ac) {
    const t0 = ac.currentTime + 0.05, len = (n * beat) / 1000;
    // A voice-like "aa": a buzz shaped by two formant filters.
    const out = ac.createGain();
    out.gain.setValueAtTime(0, t0);
    out.gain.linearRampToValueAtTime(0.22, t0 + 0.06);
    out.gain.setValueAtTime(0.22, t0 + len - 0.12);
    out.gain.linearRampToValueAtTime(0, t0 + len);
    out.connect(ac.destination);
    const src = ac.createOscillator();
    src.type = 'sawtooth';
    src.frequency.setValueAtTime(165, t0);
    const vib = ac.createOscillator(), vg = ac.createGain();
    vib.frequency.value = 5; vg.gain.value = 2.5;
    vib.connect(vg).connect(src.frequency);
    for (const [f, q, g] of [[800, 6, 1], [1250, 8, 0.6], [2600, 10, 0.2]]) {
      const bp = ac.createBiquadFilter(), gg = ac.createGain();
      bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; gg.gain.value = g;
      src.connect(bp).connect(gg).connect(out);
    }
    src.start(t0); vib.start(t0); src.stop(t0 + len + 0.05); vib.stop(t0 + len + 0.05);
    nodes = [src, vib, out];
    // ticks
    for (let i = 0; i < n; i++) {
      const tt = t0 + (i * beat) / 1000, o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = i === 0 ? 1320 : 990;
      g.gain.setValueAtTime(0.0001, tt);
      g.gain.exponentialRampToValueAtTime(0.25, tt + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.07);
      o.connect(g).connect(ac.destination);
      o.start(tt); o.stop(tt + 0.08);
      nodes.push(o);
    }
  }
  for (let i = 0; i < n; i++) timers.push(setTimeout(() => onBeat?.(i + 1), 50 + i * beat));
  timers.push(setTimeout(() => { current = null; finish(); }, 50 + n * beat));
  current = () => {
    if (ac) { const now = ac.currentTime; nodes.forEach((x) => { try { x.stop?.(now); x.disconnect?.(); } catch { /* already stopped */ } }); }
    finish();
  };
  return current;
}
