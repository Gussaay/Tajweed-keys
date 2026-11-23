// Regenerates the PWA icons (public/) and the source images that
// `npx @capacitor/assets generate --android` turns into Android icons/splash.
import sharp from 'sharp';
import fs from 'node:fs';

const svg = fs.readFileSync('assets/brand/icon.svg');
const png = (size, out) => sharp(svg, { density: 300 }).resize(size, size).png().toFile(out);

await png(192, 'public/icon-192.png');
await png(512, 'public/icon-512.png');
await png(1024, 'assets/icon-only.png');
// Adaptive icon: full-bleed background + the artwork inside the safe zone.
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#0B5D4F' } }).png().toFile('assets/icon-background.png');
const inner = await sharp(svg, { density: 300 }).resize(680, 680).png().toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: inner, gravity: 'center' }]).png().toFile('assets/icon-foreground.png');
for (const [name, bg] of [['splash', '#0B5D4F'], ['splash-dark', '#0D1714']]) {
  const logo = await sharp(svg, { density: 300 }).resize(640, 640).png().toBuffer();
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: bg } })
    .composite([{ input: logo, gravity: 'center' }]).png().toFile(`assets/${name}.png`);
}
console.log('icons written');
