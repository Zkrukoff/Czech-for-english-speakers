/** Remove Czech diacritics: "Příliš žluťoučký" → "Prilis zlutoucky". */
export function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/** Lowercase, trim, collapse whitespace, strip diacritics: for search. */
export function searchKey(s: string): string {
  return stripDiacritics(s.toLowerCase()).replace(/\s+/g, ' ').trim();
}
