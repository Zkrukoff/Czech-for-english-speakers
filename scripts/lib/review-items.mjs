// Every reviewable piece of Czech in /content, with a stable key, its batch,
// and the text a reviewer needs. Shared by review:export, review:import and
// review:status. Plain Node, no dependencies.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/** The repo root (PRAZAK_ROOT lets tests work on a copy). */
export const ROOT = process.env.PRAZAK_ROOT ?? '.';
export const CONTENT = join(ROOT, 'content');

/** "[[Jano|Jana|voc|addressing]]" → "Jano": the lens markup, removed for reading. */
export const plain = (s) => String(s).replace(/\[\[([^|\]]+)(?:\|[^\]]*)?\]\]/g, '$1');

export function* files(dir = CONTENT) {
  for (const f of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = join(dir, f.name);
    if (f.isDirectory()) yield* files(p);
    else yield relative(CONTENT, p).split('\\').join('/');
  }
}

/** Batches in priority order. Each item goes to the first that matches. */
export const BATCHES = [
  { n: 1, slug: 'emergency', title: 'Emergency cards and phrases', match: (f) => f.startsWith('emergency/') },
  { n: 2, slug: 'line-a-units-1-2', title: 'Line A, units 1–2', match: (f) => /^units\/0[12]-/.test(f) },
  { n: 3, slug: 'sounds', title: 'Pronunciation and the alphabet', match: (f) => f.startsWith('alphabet/') },
  { n: 4, slug: 'core-words', title: 'Deck 1 and the example sentences', match: (f, o) => f.startsWith('words/01-') || (f.startsWith('words/') && !!o?.example) },
  { n: 5, slug: 'exam-mock-1', title: 'Mock exam 1, the speaking models and the warm-up', match: (f, o) => f.startsWith('exam/') && (o?.use === 'mock1' || f === 'exam/speaking.json' || f === 'exam/warmup.json') },
  { n: 6, slug: 'phrases', title: 'The phrase deck', match: (f) => f.startsWith('phrases/') },
  { n: 7, slug: 'line-a-units-3-5', title: 'Line A, units 3–5', match: (f) => f.startsWith('units/') },
  { n: 8, slug: 'words', title: 'The other word decks', match: (f) => f.startsWith('words/') },
  { n: 9, slug: 'exam', title: 'The other exam tasks', match: (f) => f.startsWith('exam/') },
  { n: 10, slug: 'guides', title: 'Guides', match: (f) => f.startsWith('guides/') },
  { n: 11, slug: 'holidays', title: 'Holidays and name days', match: (f) => f.startsWith('calendar/') },
  { n: 12, slug: 'grammar-and-verbs', title: 'Grammar, verb tables and the noun lexicon', match: (f) => /^(grammar|verbs|lexicon)\//.test(f) },
  { n: 13, slug: 'other', title: 'Overheard, idioms and station notes', match: () => true },
];

const AREA = (f) => f.split('/')[0];
const TECH = new Set(['id', 'type', 'kind', 'skills', 'nativeReviewed', '$comment', 'order', 'source', 'rank', 'audio', 'goalId', 'use', 'part', 'task', 'diacriticsMatter', 'verify', 'picture', 'pictures', 'panels']);
const EN_KEYS = new Set(['en', 'meaning', 'title', 'situationEn', 'instructionEn', 'topicEn', 'summary', 'setting', 'significance', 'literal', 'label', 'panelsAlt', 'context']);
const CS_KEYS = new Set(['listen', 'lines', 'heading', 'body', 'cs', 'lemma', 'titleCs', 'text', 'instruction', 'model', 'situation', 'heading', 'question', 'q', 'friend', 'topic', 'subject', 'definitionCs', 'spoken', 'letter', 'example', 'tiles', 'cues', 'base', 'verb']);

/** Labelled text of an object's own fields (not of nested items that are reviewed on their own). */
function dump(o, want, depth = 0) {
  const out = [];
  for (const [k, v] of Object.entries(o)) {
    if (TECH.has(k) || v == null) continue;
    if (Array.isArray(v) && v.some((x) => x && typeof x === 'object' && 'nativeReviewed' in x)) continue;
    if (typeof v === 'object' && !Array.isArray(v) && 'nativeReviewed' in v) continue;
    // Multiple-choice options and answers are English unless optionsLang says Czech.
    const enAnswers = o.answerLang === 'en' || o.direction === 'cs-en' || (o.type === 'multipleChoice' && o.optionsLang !== 'cs') || (o.type === 'readReal' && o.answerLang !== 'cs');
    const isCs = CS_KEYS.has(k) || (k === 'answers' && !enAnswers) || (k === 'options' && o.optionsLang === 'cs') || (k === 'prompt' && o.direction === 'cs-en');
    const isEn = EN_KEYS.has(k) || (k === 'prompt' && !isCs) || (k === 'options' && o.optionsLang !== 'cs') || (k === 'answers' && !isCs);
    if (typeof v === 'string' || typeof v === 'number') {
      if ((want === 'cs' && isCs) || (want === 'en' && isEn)) out.push(`${k}: ${plain(v)}`);
    } else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      if ((want === 'cs' && isCs) || (want === 'en' && isEn)) out.push(`${k}: ${v.map(plain).join(' | ')}`);
    } else if (depth < 3 && ['realia', 'questions', 'cards', 'phrases', 'show', 'items', 'options', 'audio', 'lines', 'topics', 'cards', 'turns', 'prompts', 'model', 'example', 'hints'].includes(k)) {
      const list = Array.isArray(v) ? v : [v];
      list.forEach((x, i) => {
        if (x && typeof x === 'object') {
          const inner = dump(x, want, depth + 1);
          if (inner.length) out.push(`${k} ${i + 1}: ${inner.join(' · ')}`);
        } else if (typeof x === 'string' && want === 'cs') out.push(`${k} ${i + 1}: ${plain(x)}`);
      });
    }
  }
  return out;
}

/** A single plain value reads better without its field label. */
const tidy = (lines) => (lines.length === 1 && /^(cs|en): /.test(lines[0]) ? lines[0].slice(4) : lines.join('\n'));

const CHECK = {
  word: 'Natural, common Czech? Is the English the meaning a learner needs first? Are gender, aspect and the note right?',
  line: 'Natural for this speaker and situation? Does the English match?',
  phrase: 'Would a Czech person say exactly this here? Right register (vy or ty)?',
  exercise: 'Is every accepted answer correct Czech? Is a natural, correct answer missing? Are the explanations (why, hints) right?',
  exam: 'Natural, like real Czech notices and speech? Exactly one right answer where there is a choice? Model answers at A2 level?',
  page: 'Accurate, natural examples? Please comment with the line or example you mean.',
  other: 'Natural and correct?',
};
function kindOf(f, o, parentKey) {
  if (f.startsWith('exam/') && o.kind) return 'exam';
  if (o.type) return 'exercise';
  if (parentKey === 'lines') return 'line';
  if (parentKey === 'words' || parentKey === 'vocab' || parentKey === 'nouns' || parentKey === 'verbs') return 'word';
  if (parentKey === 'phrases' || parentKey === 'show') return 'phrase';
  return 'other';
}

/**
 * Auto-fixable: a single plain Czech field ("cs") on an item that isn't an
 * exercise, has no accepted answers and no lens markup. Anything else that a
 * reviewer corrects is held back for a person to apply.
 */
export const autoFixable = (o) => typeof o.cs === 'string' && !o.type && !o.kind && !('answers' in o) && !o.cs.includes('[[');

function segment(arrKey, el, i) {
  const id = el?.id ?? el?.lemma ?? el?.letter;
  return `${arrKey}/${id ?? i}`;
}

/** All JSON items: { key, file, path, obj, batch, area, kind, cs, en, context, check }. */
export function jsonItems() {
  const items = [];
  for (const f of files()) {
    if (!f.endsWith('.json')) continue;
    const raw = JSON.parse(readFileSync(join(CONTENT, f), 'utf8'));
    // Path segments: "key" for an object field, "key/<id or index>" for an array element.
    const walk = (o, path, parentKey, ctx) => {
      if (Array.isArray(o)) { o.forEach((el, i) => walk(el, [...path, segment(parentKey, el, i)], parentKey, ctx)); return; }
      if (!o || typeof o !== 'object') return;
      const here = { ...ctx };
      if (typeof o.setting === 'string') here.setting = o.setting;
      if (typeof o.title === 'string') here.title = o.title;
      if ('nativeReviewed' in o) {
        const kind = kindOf(f, o, parentKey);
        const batch = BATCHES.find((b) => b.match(f, o));
        const context = [here.title && `in: ${here.title}`, o.speaker && `speaker: ${o.speaker}`, kind === 'line' && here.setting && `scene: ${here.setting}`, o.gender && `gender: ${o.gender}`, o.aspect && `aspect: ${o.aspect}`, o.pos && `part of speech: ${o.pos}`, o.type && `exercise type: ${o.type}`, o.use && `set: ${o.use}`].filter(Boolean).join(' · ');
        items.push({ key: `${f}#${path.join('/')}`, file: f, path: [...path], obj: o, batch, area: AREA(f), kind, cs: tidy(dump(o, 'cs')), en: tidy(dump(o, 'en')), context, check: CHECK[kind], autoFix: autoFixable(o) });
      }
      for (const [k, v] of Object.entries(o)) {
        if (Array.isArray(v)) walk(v, path, k, here);
        else if (v && typeof v === 'object') walk(v, [...path, k], k, here);
      }
    };
    walk(raw, [], '(root)', {});
  }
  return items;
}

/** Markdown pages with Czech: grammar pages (frontmatter flag) and lesson explanations (tracked in review/log.json). */
export function mdItems() {
  const items = [];
  for (const f of files()) {
    if (!f.endsWith('.md') || f === 'SCHEMA.md' || f === 'REVIEW_NEEDED.md') continue;
    const text = readFileSync(join(CONTENT, f), 'utf8');
    const flagged = /^nativeReviewed:\s*(true|false)\s*$/m.test(text);
    if (!flagged && !f.endsWith('explanation.md')) continue;
    const body = text.replace(/^---[\s\S]*?---\s*/, '');
    const czech = [...new Set(body.match(/\*[^*\n]*[ěščřžýáíéúůťďňó][^*\n]*\*/gi) ?? [])].slice(0, 40).map((s) => s.replace(/\*/g, ''));
    items.push({
      key: `md:${f}`, file: f, md: true, flagged,
      reviewed: flagged ? /^nativeReviewed:\s*true\s*$/m.test(text) : undefined,
      batch: BATCHES.find((b) => b.match(f, null)), area: AREA(f), kind: 'page',
      cs: `Examples on the page: ${czech.join(' | ')}`, en: (text.match(/^title:\s*(.+)$/m) ?? [])[1] ?? f,
      context: `The whole page (${body.split(/\s+/).length} words). Open content/${f}.`, check: CHECK.page, autoFix: false,
    });
  }
  return items;
}

/** Read and write the item at a key's path in a parsed JSON file. */
export function locate(raw, path) {
  let o = raw;
  for (const seg of path) {
    const cut = seg.indexOf('/');
    const [k, sel] = cut < 0 ? [seg, undefined] : [seg.slice(0, cut), seg.slice(cut + 1)];
    o = o?.[k];
    if (sel !== undefined && Array.isArray(o)) {
      o = o.find((el, i) => String(el?.id ?? el?.lemma ?? el?.letter ?? i) === sel);
    }
  }
  return o;
}
