import { describe, expect, it } from 'vitest';
import { emailMeetsMinimum, fillAccepted, neededSentence, wordCount, writingNeeded } from '@/lib/exam/score';

describe('exam scoring', () => {
  it('counts words as the exam does', () => {
    expect(wordCount('Dobrý den, chtěla bych objednat stůl.')).toBe(6);
    expect(wordCount('  80. narozeniny – 10 hostů  ')).toBe(4);
    expect(wordCount('')).toBe(0);
  });

  it('scores an e-mail under 35 words as zero', () => {
    expect(emailMeetsMinimum(Array(34).fill('slovo').join(' '))).toBe(false);
    expect(emailMeetsMinimum(Array(35).fill('slovo').join(' '))).toBe(true);
  });

  it('marks short answers for the information, not the spelling', () => {
    expect(fillAccepted('Kobylisy', ['Kobylisy'])).toBe(true);
    expect(fillAccepted('kobylisy.', ['Kobylisy'])).toBe(true);
    expect(fillAccepted('v utery', ['v úterý'])).toBe(true);
    expect(fillAccepted('1200 Kč', ['1 200'])).toBe(true);
    expect(fillAccepted('1 200,-', ['1200'])).toBe(true);
    expect(fillAccepted('731524890', ['731 524 890'])).toBe(true);
    expect(fillAccepted('', ['8'])).toBe(false);
    expect(fillAccepted('9', ['8'])).toBe(false);
  });

  it('works out what writing still has to bring', () => {
    expect(writingNeeded(38)).toEqual({ need: 4, possible: true });
    expect(writingNeeded(50)).toEqual({ need: 0, possible: true });
    expect(writingNeeded(21)).toEqual({ need: 21, possible: false });
    expect(writingNeeded(22)).toEqual({ need: 20, possible: true });
    expect(neededSentence(38)).toBe("38 of 50. You'd need at least 4 of 20 in writing to reach 42 of 70.");
    expect(neededSentence(10)).toMatch(/Even full marks/);
  });
});
