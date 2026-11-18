// Offline check: builds must already exist (npm run build).
// Serves dist/, lets the service worker install, cuts the network, then
// opens the emergency cards and the "Show to a Czech" mode.
// Usage: npm run build && npm run check:offline
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = 4179;
const base = `http://localhost:${PORT}/`;

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid); } catch { /* already gone */ } };
const fail = (msg) => { console.error('FAIL:', msg); stop(); process.exit(1); };

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    if (i > 50) fail('preview server did not start');
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
    await page.reload();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  }
  await ctx.setOffline(true);

  await page.goto(`${base}emergency`);
  await page.getByRole('heading', { name: 'Emergency' }).waitFor({ timeout: 5000 }).catch(() => fail('/emergency did not load offline'));
  if (!(await page.locator('a[href="tel:112"]').count())) fail('no tel:112 link offline');

  await page.goto(`${base}emergency/doctor`);
  await page.getByRole('button', { name: 'Show to a Czech' }).click();
  const dialog = page.getByRole('dialog', { name: 'Show to a Czech' });
  await dialog.waitFor({ timeout: 5000 }).catch(() => fail('show mode did not open offline'));
  if (!(await dialog.textContent())?.includes('Potřebuji lékaře')) fail('show mode text missing');
  const fonts = await page.evaluate(() => document.fonts.check('700 40px "Bricolage Grotesque Variable"'));
  console.log('OK: emergency pages and show mode work offline', fonts ? '(fonts cached)' : '');
  await browser.close();
} finally {
  stop();
}
process.exit(0);
