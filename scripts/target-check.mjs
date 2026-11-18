// Touch-target check (I5): every control on key screens is at least 44 × 44 px
// at 375 px wide. Exempt, per WCAG 2.5.8: links inside a sentence, the
// screen-reader skip link, and the metro map's SVG stations (the station list
// next to the map is their equivalent). Needs a build: npm run build && npm run check:targets
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = 4181;
const base = `http://localhost:${PORT}`;
const PAGES = ['/', '/review', '/sounds', '/grammar', '/guides', '/guides/prague-transport', '/wallet', '/settings', '/lessons/u01-l01', '/emergency', '/exam', '/exam/practice/r1-practice1', '/exam/practice/w2-practice1'];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* gone */ } };
let failed = false;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    if (i > 50) throw new Error('preview server did not start');
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await page.goto(`${base}/styleguide`);
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const r = indexedDB.open('prazak');
    await new Promise((res) => (r.onsuccess = res));
    const d = r.result;
    await new Promise((res) => { const tx = d.transaction('profile', 'readwrite'); tx.objectStore('profile').put({ id: 'me', vykaniIntroSeen: true, onboardedAt: 1, inferred: false, homeStation: 'A/flora', level: 'A1', who: 'work' }); tx.oncomplete = res; });
  });
  for (const path of PAGES) {
    await page.goto(base + path);
    await page.waitForTimeout(900);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, select, input:not([type=hidden]), [role=button]')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          if (el.closest('.sr-only') || el.classList.contains('sr-only')) return false;
          if (el.closest('svg')) return false; // metro map stations: the list is the equivalent
          const cs = getComputedStyle(el);
          if (el.tagName === 'A' && cs.display === 'inline') return false; // a link inside a sentence
          if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) return !el.closest('label');
          return r.height < 44 || r.width < 44;
        })
        .map((el) => `${el.tagName.toLowerCase()} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)} "${(el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`),
    );
    if (small.length) { failed = true; console.log(`${path}: ${small.length} under 44 px`, small.slice(0, 8)); }
  }
  await browser.close();
  console.log(failed ? 'FAIL: small touch targets' : 'OK: every control on the key screens is at least 44 × 44 px');
} finally { stop(); }
process.exit(failed ? 1 : 0);
