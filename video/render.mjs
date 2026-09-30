// Renders video/intro.html to video/ville-saarela-intro.mp4 (1080×1920, 30 fps, H.264).
// Needs: playwright-core + Chromium, and ffmpeg (set FFMPEG=/path/to/ffmpeg if not on PATH).
// Usage: node video/render.mjs [--frames 0,3.2,10]   (--frames = only save stills for checking)
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const stillsArg = process.argv.indexOf('--frames');
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(',').map(Number) : null;

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(here, 'intro.html')).href + '?render', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {})));
});
const stage = await page.$('#stage');
const duration = await page.evaluate(() => window.DURATION);

if (stills) {
  fs.mkdirSync(path.join(here, 'stills'), { recursive: true });
  for (const t of stills) {
    await page.evaluate(t => window.render(t), t);
    await stage.screenshot({ path: path.join(here, 'stills', `t${String(t).padStart(5, '0')}.png`) });
  }
} else {
  const out = path.join(here, 'ville-saarela-intro.mp4');
  const enc = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duration * FPS);
  for (let f = 0; f <= total; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    const buf = await stage.screenshot({ type: 'jpeg', quality: 98 });
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${total}`);
  }
  enc.stdin.end();
  await new Promise((res, rej) => enc.on('close', c => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  console.log('wrote', out);
}
await browser.close();
