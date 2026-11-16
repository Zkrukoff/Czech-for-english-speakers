import { describe, expect, it } from 'vitest';
import { checkAnswer, diacriticDiff, normalize } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';

const tolerant = { strictDiacritics: false };
const strict = { strictDiacritics: true };

function translate(over: Partial<Exercise> = {}): Exercise {
  return {
    id: 't1',
    type: 'translate',
    direction: 'en-cs',
    prompt: "I'll have a coffee, please.",
    answers: ['Dám si {kávu|kafe}[, prosím].'],
    why: 'The thing you order takes the accusative: káva → kávu.',
    hints: [{ wrong: 'Dám si káva[, prosím].', explain: 'káva is the nominative; after dát si use kávu.' }],
    skills: ['case:accusative'],
    nativeReviewed: false,
    ...over,
  } as Exercise;
}

function fillEnding(over: Partial<Exercise> = {}): Exercise {
  return {
    id: 'f1',
    type: 'fillEnding',
    prompt: 'Dám si káv___, prosím.',
    answers: ['u'],
    why: 'Feminine -a → -u in the accusative.',
    hints: [{ wrong: 'a', explain: 'káva is the nominative form.' }],
    skills: ['case:accusative'],
    nativeReviewed: false,
    ...over,
  } as Exercise;
}

describe('normalize', () => {
  it('ignores case, punctuation and extra spaces', () => {
    expect(normalize('  Dám si  KÁVU, prosím! ')).toBe('dám si kávu prosím');
  });

  it('composes decomposed characters (NFD input from some keyboards)', () => {
    expect(normalize('kávu')).toBe('kávu');
  });

  it('unifies typographic apostrophes', () => {
    expect(normalize('I’ll')).toBe("i'll");
  });
});

describe('checkAnswer: exact answers', () => {
  it('accepts any expansion of the answer pattern', () => {
    for (const a of ['Dám si kávu, prosím.', 'dám si kávu', 'Dám si kafe prosím', 'DÁM SI KAFE.']) {
      expect(checkAnswer(translate(), a, tolerant).status, a).toBe('correct');
    }
  });

  it('shows the accepted answer closest to what was typed', () => {
    expect(checkAnswer(translate(), 'Dám si kafe', tolerant).expected).toBe('Dám si kafe.');
  });
});

describe('checkAnswer: diacritic tolerance', () => {
  it('accepts a missing háček/čárka in tolerant mode but flags it', () => {
    const r = checkAnswer(translate(), 'Dam si kavu, prosim.', tolerant);
    expect(r.status).toBe('diacritics');
    expect(r.accepted).toBe(true);
    expect(r.diacriticsOnly).toBe(true);
    expect(r.expected).toBe('Dám si kávu, prosím.');
  });

  it('marks exactly the characters that were wrong', () => {
    const r = checkAnswer(translate(), 'Dam si kávu, prosim.', tolerant);
    const wrong = r.diff!.filter((d) => d.wrong).map((d) => d.ch);
    expect(wrong).toEqual(['á', 'í']);
  });

  it('also flags a wrong (not just missing) diacritic', () => {
    const r = checkAnswer(translate(), 'Dám si kávú', tolerant);
    expect(r.status).toBe('diacritics');
    expect(r.diff!.filter((d) => d.wrong).map((d) => d.ch)).toEqual(['u']);
  });

  it('rejects diacritic slips when the strict setting is on', () => {
    const r = checkAnswer(translate(), 'Dam si kavu', strict);
    expect(r.status).toBe('incorrect');
    expect(r.accepted).toBe(false);
    expect(r.diacriticsOnly).toBe(true);
    expect(r.explanation).toMatch(/diacritics/);
  });

  it('rejects diacritic slips when the exercise says they change the meaning', () => {
    const ex = translate({ prompt: 'to be', answers: ['být'], why: 'byt means "flat"; být means "to be".', hints: [], diacriticsMatter: true });
    const r = checkAnswer(ex, 'byt', tolerant);
    expect(r.status).toBe('incorrect');
    expect(r.diacriticsOnly).toBe(true);
    expect(r.explanation).toMatch(/flat/);
  });

  it('still accepts exact answers in strict mode', () => {
    expect(checkAnswer(translate(), 'Dám si kávu', strict).status).toBe('correct');
  });
});

describe('checkAnswer: explaining wrong answers', () => {
  it('uses the specific hint for a known mistake', () => {
    const r = checkAnswer(translate(), 'Dám si káva, prosím.', tolerant);
    expect(r.status).toBe('incorrect');
    expect(r.hintMatched).toBe(true);
    expect(r.explanation).toMatch(/nominative/);
    expect(r.expected).toBe('Dám si kávu, prosím.');
  });

  it('matches a hint even when the wrong answer also lacks diacritics', () => {
    const r = checkAnswer(translate(), 'Dam si kava', tolerant);
    expect(r.hintMatched).toBe(true);
  });

  it('falls back to the general "why" for other wrong answers', () => {
    const r = checkAnswer(translate(), 'Chci čaj', tolerant);
    expect(r.status).toBe('incorrect');
    expect(r.hintMatched).toBe(false);
    expect(r.explanation).toMatch(/accusative/);
  });

  it('treats an empty answer as wrong and shows the answer', () => {
    const r = checkAnswer(translate(), '   ', tolerant);
    expect(r.status).toBe('incorrect');
    expect(r.expected).toBe('Dám si kávu, prosím.');
  });
});

describe('checkAnswer: fill in the ending', () => {
  it('accepts the ending alone, and shows the whole word', () => {
    const r = checkAnswer(fillEnding(), 'u', tolerant);
    expect(r.status).toBe('correct');
    expect(r.expected).toBe('kávu');
  });

  it('shows the whole word when the ending is wrong', () => {
    expect(checkAnswer(fillEnding(), 'a', tolerant).expected).toBe('kávu');
  });

  it('accepts the whole word too', () => {
    expect(checkAnswer(fillEnding(), 'kávu', tolerant).status).toBe('correct');
  });

  it('flags the whole word typed without diacritics and shows it in full', () => {
    const r = checkAnswer(fillEnding(), 'kavu', tolerant);
    expect(r.status).toBe('diacritics');
    expect(r.expected).toBe('kávu');
  });

  it('explains the classic nominative mistake', () => {
    const r = checkAnswer(fillEnding(), 'a', tolerant);
    expect(r.hintMatched).toBe(true);
  });

  it('treats a diacritic on the ending as a diacritics slip', () => {
    const ex = fillEnding({ prompt: 'Čekám v kavárn___.', answers: ['ě'], hints: [] });
    const r = checkAnswer(ex, 'e', tolerant);
    expect(r.status).toBe('diacritics');
    expect(r.expected).toBe('kavárně');
    expect(r.diff!.filter((d) => d.wrong).map((d) => d.ch)).toEqual(['ě']);
    expect(checkAnswer(ex, 'e', strict).status).toBe('incorrect');
  });
});

describe('diacriticDiff', () => {
  it('keeps punctuation and marks only letters', () => {
    const d = diacriticDiff('Ahoj, Petře!', 'ahoj petre');
    expect(d.map((x) => x.ch).join('')).toBe('Ahoj, Petře!');
    expect(d.filter((x) => x.wrong).map((x) => x.ch)).toEqual(['ř']);
  });
});
