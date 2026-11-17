/** Remove Czech diacritics: "Příliš žluťoučký" → "Prilis zlutoucky". */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** Lowercase, trim, collapse whitespace, strip diacritics: for search. */
export function searchKey(s: string): string {
  return stripDiacritics(s.toLowerCase()).replace(/\s+/g, ' ').trim();
}

const czechCollator = new Intl.Collator('cs', { sensitivity: 'base', numeric: true });

/**
 * Compare two strings in Czech alphabetical order: č after c, ch after h,
 * ř after r, š after s, ž after z; vowel length (á, ů…) only breaks ties.
 * Use this for every sort a learner can see.
 */
export function compareCs(a: string, b: string): number {
  return czechCollator.compare(a, b) || a.localeCompare(b, 'cs');
}
