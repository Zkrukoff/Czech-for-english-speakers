// Recordings, made routine.
//   npm run audio:script               writes review/audio/R*-*.csv and a printable .html per batch,
//                                      listing every clip not yet recorded: id, what to say, who says it
//   npm run audio:import -- <folder> --speaker <key>
//                                      copies files named <id>.mp3|m4a|ogg into public/audio/ and lists them
//                                      in content/audio/manifest.json, with the speaker from content/audio/speakers.json
// See docs/AUDIO.md.
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { CONTENT, ROOT, files, plain } from './lib/review-items.mjs';
import { chunkAudioId, dialogueLineId, examAudioBase, examLineId, vocabAudioId } from './lib/audio-ids.mjs';

const OUT = join(ROOT, 'review/audio');
const MANIFEST = join(CONTENT, 'audio/manifest.json');
const SPEAKERS = join(CONTENT, 'audio/speakers.json');
const read = (f) => JSON.parse(readFileSync(join(CONTENT, f), 'utf8'));

export const AUDIO_BATCHES = [
  { n: 1, slug: 'sounds', title: 'Sounds, minimal pairs and the door announcement' },
  { n: 2, slug: 'dialogues', title: 'Line A dialogues' },
  { n: 3, slug: 'vocabulary', title: 'Line A vocabulary' },
  { n: 4, slug: 'overheard', title: 'Overheard in Prague' },
  { n: 5, slug: 'phrases', title: 'The phrase deck' },
  { n: 6, slug: 'exam-listening', title: 'Exam listening' },
];

/** Every clip the course can use: { id, say, who, note, batch, where }. One entry per id. */
export function clipList() {
  const clips = new Map();
  const add = (c) => { if (!clips.has(c.id)) clips.set(c.id, c); };
  for (const f of files()) {
    if (!f.endsWith('.json') || f.startsWith('audio/')) continue;
    const raw = read(f);
    // Batch 1: exercises that name a recording (alphabet, guides).
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      if (o.type && typeof o.audio === 'string') {
        const say = o.type === 'minimalPair' ? o.answers?.[0] : o.cs ?? o.listen;
        if (say) add({ id: o.audio, say: plain(say), who: 'one voice', note: o.type === 'minimalPair' ? `one word of the pair ${o.pair?.join(' / ') ?? ''}`.trim() : o.id.startsWith('tr-') ? 'station announcement: the official wording, calm and clear' : '', batch: 1, where: `${o.type} ${o.id}` });
      }
      Object.values(o).forEach(walk);
    };
    if (f.startsWith('alphabet/') || f.startsWith('guides/')) walk(raw);
    // Batches 2–3: Line A dialogues and vocabulary.
    if (/^units\/.*\/lesson\.json$/.test(f)) {
      raw.dialogue?.lines?.forEach((l, i) => add({ id: l.audio ?? dialogueLineId(raw.id, i), say: plain(l.cs), who: l.speaker, note: l.spoken ? `spoken form: ${plain(l.spoken)}` : '', batch: 2, where: `${raw.id} dialogue, line ${i + 1}` }));
      raw.vocab?.forEach((v) => add({ id: v.audio ?? vocabAudioId(v.id), say: plain(v.cs), who: 'one voice', note: v.cs.includes('/') ? 'say each form, with a short pause between' : '', batch: 3, where: `${raw.id} vocabulary` }));
    }
    // Batch 4: Overheard scenes (record the spoken version where there is one).
    if (f.startsWith('overheard/')) raw.lines?.forEach((l, i) => l.audio && add({ id: l.audio, say: plain(l.spoken ?? l.cs), who: l.speaker ?? 'one voice', note: l.spoken ? `standard form: ${plain(l.cs)}` : '', batch: 4, where: `${raw.id}, line ${i + 1}` }));
    // Batch 5: phrases.
    if (f === 'phrases/phrases.json') raw.situations?.forEach((s) => s.phrases.forEach((p) => add({ id: chunkAudioId(p.id), say: plain(p.cs).replace(/…/g, ''), who: 'one voice', note: '', batch: 5, where: s.title ?? s.id })));
    // Batch 6: exam listening, one clip per line.
    if (f === 'exam/listening.json') {
      for (const t of raw.tasks) {
        const lines = (base, ls) => ls.forEach((l, i) => add({ id: examLineId(base, i), say: plain(l.cs), who: ls.some((x) => x.speaker === 'b') ? (l.speaker === 'a' ? 'speaker A' : 'speaker B') : 'one voice', note: t.task === 2 ? 'announcement' : t.task === 5 ? 'voicemail' : '', batch: 6, where: `${t.id}` }));
        t.questions?.forEach((q, i) => q.audio && lines(examAudioBase(t.id, i + 1), q.audio));
        t.items?.forEach((it) => it.audio && lines(examAudioBase(t.id, it.id), it.audio));
        if (t.audio) lines(examAudioBase(t.id, 'msg'), t.audio);
      }
    }
  }
  return [...clips.values()];
}

const manifest = () => JSON.parse(readFileSync(MANIFEST, 'utf8'));
const cell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function writeScripts() {
  const done = new Set(manifest().recordings.map((r) => r.id));
  mkdirSync(OUT, { recursive: true });
  const all = clipList();
  const index = [];
  for (const b of AUDIO_BATCHES) {
    const base = `R${b.n}-${b.slug}`;
    for (const ext of ['csv', 'html']) rmSync(join(OUT, `${base}.${ext}`), { force: true });
    const clips = all.filter((c) => c.batch === b.n && !done.has(c.id));
    if (!clips.length) continue;
    writeFileSync(join(OUT, `${base}.csv`), '﻿' + [['file name', 'say exactly', 'who', 'note', 'where it is used'], ...clips.map((c) => [`${c.id}.mp3`, c.say, c.who, c.note, c.where])].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n');
    writeFileSync(join(OUT, `${base}.html`), `<!doctype html><meta charset="utf-8"><title>Pražák recording script: ${esc(b.title)}</title>
<style>body{font:18px/1.5 system-ui,sans-serif;max-width:52rem;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #ccc;padding:.6rem .4rem;text-align:left;vertical-align:top}td.say{font-size:1.4rem;font-weight:600}code{font-size:.85rem}@media print{body{margin:0}}</style>
<h1>Recording script ${b.n}: ${esc(b.title)}</h1>
<p>${clips.length} clips. One file per row, named exactly as in the first column. Leave about half a second of silence before and after. Normal, natural speed. See docs/AUDIO.md.</p>
<table><thead><tr><th>File</th><th>Say exactly</th><th>Who</th><th>Note</th></tr></thead><tbody>
${clips.map((c) => `<tr><td><code>${esc(c.id)}</code></td><td class="say" lang="cs">${esc(c.say)}</td><td>${esc(c.who)}</td><td>${esc(c.note)}</td></tr>`).join('\n')}
</tbody></table>`);
    index.push(`| R${b.n} | ${b.title} | ${clips.length} | [${base}.html](${base}.html) · [csv](${base}.csv) |`);
  }
  writeFileSync(join(OUT, 'README.md'), ['# Recording scripts', '', 'Generated by `npm run audio:script`; only clips not yet recorded are listed. Import recorded files with `npm run audio:import -- <folder> --speaker <key>` (speakers are listed in content/audio/speakers.json). Guide: [docs/AUDIO.md](../../docs/AUDIO.md).', '', '| Batch | What | Clips | Script |', '|---|---|---|---|', ...index, ''].join('\n'));
  console.log(`${all.length - done.size} clips still to record, in ${index.length} scripts in review/audio/. ${done.size} recorded.`);
}

function importFolder(folder, speakerKey) {
  const speakers = existsSync(SPEAKERS) ? JSON.parse(readFileSync(SPEAKERS, 'utf8')).speakers : {};
  const sp = speakers[speakerKey];
  if (!sp) throw new Error(`Unknown speaker "${speakerKey}". Add them to content/audio/speakers.json first (name, licence, consent date).`);
  if (!sp.consent) throw new Error(`Speaker "${speakerKey}" has no consent date in content/audio/speakers.json. Get their written consent first.`);
  const clips = new Map(clipList().map((c) => [c.id, c]));
  const m = manifest();
  const report = { added: [], replaced: [], unknown: [], skipped: [] };
  for (const f of readdirSync(folder).sort()) {
    const ext = extname(f).toLowerCase();
    if (!['.mp3', '.m4a', '.ogg'].includes(ext)) { report.skipped.push(f); continue; }
    const id = basename(f, extname(f)).toLowerCase();
    const clip = clips.get(id);
    if (!clip) { report.unknown.push(f); continue; }
    const file = `${id}${ext}`;
    mkdirSync(join(ROOT, 'public/audio'), { recursive: true });
    copyFileSync(join(folder, f), join(ROOT, 'public/audio', file));
    const entry = { id, file, cs: clip.say, speaker: sp.name, licence: sp.licence };
    const at = m.recordings.findIndex((r) => r.id === id);
    if (at >= 0) { m.recordings[at] = entry; report.replaced.push(id); } else { m.recordings.push(entry); report.added.push(id); }
  }
  m.recordings.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + '\n');
  console.log(`Added ${report.added.length}, replaced ${report.replaced.length}. Now run npm test.`);
  if (report.unknown.length) console.log(`  ! Not in any script (check the file names): ${report.unknown.join(', ')}`);
  if (report.skipped.length) console.log(`  ! Not audio files, skipped: ${report.skipped.join(', ')}`);
  return report;
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'script') writeScripts();
else if (cmd === 'import') {
  const folder = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--speaker');
  const speaker = args[args.indexOf('--speaker') + 1];
  if (!folder || !args.includes('--speaker')) { console.error('Usage: npm run audio:import -- <folder> --speaker <key>'); process.exit(1); }
  try { importFolder(folder, speaker); } catch (e) { console.error(e.message); process.exit(1); }
} else if (cmd) { console.error(`Unknown command "${cmd}". Use script or import.`); process.exit(1); }
export { importFolder, writeScripts };
