import type { FormTable } from '@/content/schema';
import { CASE_KEYS, type CaseKey } from '@/content/taxonomy';

/**
 * Generates the expected forms of a lexicon noun from its vzor (model noun)
 * table, so case-lens annotations can be checked against real grammar rather
 * than trusted blindly.
 *
 * It applies the regular spelling changes and nothing more:
 *  - an ending in -ě after k/h/g/ch/r becomes -ce/-ze/-ze/-še/-ře (banka → bance,
 *    Praha → Praze, sestra → sestře), and is written -e after letters that
 *    can't take ě (autobus → autobuse);
 *  - masculine animate nominative plural -i softens k/h/g/ch/r (Čech → Češi);
 *  - vocative -e becomes -u after k/h/g/ch (Čech → Čechu), and -ře after a
 *    consonant + r (bratr → bratře);
 *  - in the růže and moře patterns, -e after d/t/n/b/p/v/f/m is written -ě
 *    (kolegyně, nástupiště).
 * Everything else (mobile e in the genitive plural, -é plurals, irregular
 * nouns) must be written as an override in content/lexicon/nouns.json. When
 * the generator is wrong, the fix is an override, never a looser check.
 */

export type NumberKey = 'sg' | 'pl';
export type CellKey = `${CaseKey}.${NumberKey}`;
export type Paradigm = Partial<Record<CellKey, string[]>>;

export interface LexemeInput {
  lemma: string;
  gender: 'm-anim' | 'm-inan' | 'f' | 'n';
  /** A table id from content/grammar/tables/nouns.json, or "irregular". */
  vzor: string;
  /** Oblique stem when it differs from lemma minus the vzor ending (lístek → lístk-). */
  stem?: string;
  /** Plural-only or singular-only nouns. */
  number?: NumberKey;
  /** Cells that replace the generated ones: { "gen.pl": "zastávek" }; alternatives separated by " / ". */
  forms?: Partial<Record<CellKey, string>>;
}

const CAN_TAKE_HACEK_E = new Set([...'dtnbpvfm']);

/** Attach an ending to a stem, applying the regular spelling changes. */
export function attach(stem: string, ending: string): string {
  if (ending.startsWith('ě')) {
    const rest = ending.slice(1);
    if (stem.endsWith('ch')) return stem.slice(0, -2) + 'še' + rest;
    const last = stem.at(-1) ?? '';
    const soft: Record<string, string> = { k: 'c', h: 'z', g: 'z', r: 'ř' };
    if (soft[last]) return stem.slice(0, -1) + soft[last] + 'e' + rest;
    if (CAN_TAKE_HACEK_E.has(last)) return stem + ending;
    return stem + 'e' + rest;
  }
  return stem + ending;
}

function softenForI(stem: string): string {
  if (stem.endsWith('ch')) return stem.slice(0, -2) + 'š';
  const last = stem.at(-1) ?? '';
  const soft: Record<string, string> = { k: 'c', h: 'z', g: 'z', r: 'ř' };
  return soft[last] ? stem.slice(0, -1) + soft[last] : stem;
}

const splitCell = (cell: string) =>
  cell
    .split(' / ')
    .map((c) => c.trim())
    .filter((c) => c && c !== '—')
    .map((c) => {
      const i = c.indexOf('|');
      return i < 0 ? { stem: c, ending: '' } : { stem: c.slice(0, i), ending: c.slice(i + 1) };
    });

const vowelEnd = /[aeiouyáéíóúůýě]$/;

export function decline(lex: LexemeInput, tables: Map<string, FormTable>): { paradigm: Paradigm; error?: string } {
  const paradigm: Paradigm = {};
  const numbers: NumberKey[] = lex.number ? [lex.number] : ['sg', 'pl'];

  if (lex.vzor !== 'irregular') {
    const table = tables.get(lex.vzor);
    if (!table) return { paradigm, error: `unknown vzor table "${lex.vzor}"` };
    const nomEnding = splitCell(table.rows.find((r) => r.case === 'nom')!.forms[0]!)[0]!.ending;
    // -e patterns also cover nouns written with -ě (kolegyně, nástupiště).
    const nomEndings = nomEnding === 'e' ? ['e', 'ě'] : [nomEnding];
    const hit = nomEnding ? nomEndings.find((e) => lex.lemma.endsWith(e)) : undefined;
    const derived = hit ? lex.lemma.slice(0, -hit.length) : lex.lemma;
    // For plural-only nouns the lemma is a plural form, so the stem must be given.
    const stem = lex.stem ?? (lex.number === 'pl' ? undefined : derived);
    if (stem === undefined) return { paradigm, error: 'plural-only nouns need a "stem"' };
    const consonantFinal = !vowelEnd.test(lex.lemma);

    for (const row of table.rows) {
      const rowCase = row.case;
      if (!rowCase) continue;
      numbers.forEach((num) => {
        const col = num === 'sg' ? 0 : 1;
        const parts = splitCell(row.forms[col] ?? '');
        const forms = new Set<string>();
        for (const { ending } of parts) {
          // Zero ending in the singular: the dictionary form itself (keeps mobile e: lístek).
          if (ending === '' && num === 'sg' && consonantFinal) {
            forms.add(lex.lemma);
            continue;
          }
          if (row.case === 'voc' && num === 'sg' && ending === 'e' && (lex.vzor === 'noun-pan' || lex.vzor === 'noun-hrad')) {
            if (/(k|h|g|ch)$/.test(stem)) {
              forms.add(stem + 'u');
              continue;
            }
            if (/[^aeiouyáéíóúůý]r$/.test(stem)) {
              forms.add(stem.slice(0, -1) + 'ře');
              continue;
            }
          }
          if (row.case === 'loc' && num === 'sg' && ending === 'ě' && lex.vzor === 'noun-hrad' && /(k|h|g|ch)$/.test(stem)) continue;
          if (lex.gender === 'm-anim' && (rowCase === 'nom' || rowCase === 'voc') && num === 'pl' && ending === 'i') {
            forms.add(softenForI(stem) + 'i');
            continue;
          }
          if ((lex.vzor === 'noun-ruze' || lex.vzor === 'noun-more') && ending.startsWith('e') && CAN_TAKE_HACEK_E.has(stem.at(-1) ?? '')) {
            forms.add(stem + 'ě' + ending.slice(1));
            continue;
          }
          forms.add(attach(stem, ending));
        }
        paradigm[`${rowCase}.${num}`] = [...forms];
      });
    }
  }

  for (const [cell, value] of Object.entries(lex.forms ?? {})) {
    paradigm[cell as CellKey] = value.split(' / ').map((f) => f.trim());
  }

  if (lex.vzor === 'irregular') {
    const missing = CASE_KEYS.flatMap((c) => numbers.map((n) => `${c}.${n}` as CellKey)).filter((k) => !paradigm[k]);
    if (missing.length) return { paradigm, error: `irregular noun needs every form; missing ${missing.join(', ')}` };
  }
  return { paradigm };
}

/** Every case/number cell in which this exact form occurs. */
export function cellsOf(paradigm: Paradigm, form: string): CellKey[] {
  const f = form.toLocaleLowerCase('cs');
  return (Object.entries(paradigm) as [CellKey, string[]][]).filter(([, fs]) => fs.some((x) => x.toLocaleLowerCase('cs') === f)).map(([k]) => k);
}
