import { describe, expect, it } from 'vitest';
import { expandPattern, expandPatterns, validatePattern } from '@/lib/answers/patterns';

describe('expandPattern', () => {
  it('returns plain text unchanged', () => {
    expect(expandPattern('Dám si čaj.')).toEqual(['Dám si čaj.']);
  });

  it('expands optional groups and tidies leftover punctuation', () => {
    expect(expandPattern('Dám si čaj[, prosím].').sort()).toEqual(['Dám si čaj, prosím.', 'Dám si čaj.'].sort());
  });

  it('expands alternatives', () => {
    expect(expandPattern('Dám si {kávu|kafe}.')).toEqual(['Dám si kávu.', 'Dám si kafe.']);
  });

  it('combines groups', () => {
    expect(expandPattern('Dám si {kávu|kafe}[, prosím].')).toHaveLength(4);
  });

  it('supports nesting', () => {
    expect(expandPattern('{Dám si|Chtěl[a] bych} kávu.').sort()).toEqual(
      ['Chtěl bych kávu.', 'Chtěla bych kávu.', 'Dám si kávu.'].sort(),
    );
  });

  it('collapses double spaces from an empty optional word', () => {
    expect(expandPattern('Já [jsem] tady.')).toContain('Já tady.');
  });

  it('deduplicates', () => {
    expect(expandPatterns(['Ahoj.', '{Ahoj|Ahoj}.'])).toEqual(['Ahoj.']);
  });

  it('reports malformed patterns', () => {
    expect(validatePattern('Dám si {kávu|kafe.')).toMatch(/Unclosed/);
    expect(validatePattern('Dám si kávu].')).toMatch(/Unexpected/);
    expect(validatePattern('Dám si kávu.')).toBeNull();
  });

  it('refuses patterns that explode', () => {
    expect(validatePattern('{a|b|c|d}{a|b|c|d}{a|b|c|d}{a|b|c|d}{a|b|c|d}')).toMatch(/more than/);
  });
});
