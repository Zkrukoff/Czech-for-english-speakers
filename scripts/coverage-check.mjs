// Vocabulary coverage against the official A1/A2 word inventory for the
// Czech residence exam (NPI ČR, Soupis lexikálních jednotek). The inventory is
// © NPI ČR with no open licence, so it is fetched at check time and never
// stored or shipped; only the coverage numbers are printed.
// Usage: npm run check:coverage   (needs network access to cestina-pro-cizince.cz)
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const URL_BASE = 'https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/themes/newspotrika/inc/soupis-lexikalnich-jednotek/rejstrikAjax.php';
const TARGET_A1 = 0.8;

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).trim();
async function inventory(level) {
  const url = `${URL_BASE}?action=hint&slovo=&typ_hledani=&varianta=${level}&typ=&p=1`;
  let html;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    // Node's fetch ignores HTTPS_PROXY; curl honours it.
    html = execFileSync('curl', ['-sSL', '-m', '60', url], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  }
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => decode(c[1])));
  return rows.filter((c) => c[1] === level.toUpperCase() && c[2] === 'slovo').map((c) => c[0].toLowerCase());
}

function* files(dir) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) yield* files(p);
    else if (p.endsWith('.json')) yield p;
  }
}
const ours = new Set();
const add = (s) => s.split(/\s*\/\s*|,\s*/).forEach((w) => ours.add(w.replace(/[!?.…]/g, '').trim().toLowerCase()));
for (const f of files('content/units')) if (f.endsWith('lesson.json')) for (const v of JSON.parse(readFileSync(f, 'utf8')).vocab) add(v.cs);
let deckWords = 0;
for (const f of files('content/words')) for (const w of JSON.parse(readFileSync(f, 'utf8')).words) { add(w.cs); (w.alt ?? []).forEach(add); deckWords++; }

const [a1, a2] = await Promise.all([inventory('a1'), inventory('a2')]);
const pct = (have, all) => `${have} of ${all} (${Math.round((100 * have) / all)}%)`;
// Inventory entries carry sense notes and variants ("jazyk (část těla)", "kuchyň/kuchyně"):
// an entry counts as covered when any variant, without its note, is one of ours.
const covered = (entry) => entry.replace(/\s*\([^)]*\)/g, '').split('/').some((v) => ours.has(v.trim()));
const c1 = a1.filter(covered).length;
const c2 = a2.filter(covered).length;
console.log(`Lesson vocabulary + ${deckWords} deck words`);
console.log(`A1 single words covered: ${pct(c1, a1.length)} · target ${TARGET_A1 * 100}%`);
console.log(`A2 single words covered: ${pct(c2, a2.length)}`);
process.exit(0);
