import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { compareCs, stripDiacritics, searchKey } from '@/lib/text';
import { contentFiles } from '@/content/files';
import { PrazakDB } from '@/db/db';

const PANGRAM = 'Příliš žluťoučký kůň úpěl ďábelské ódy';

describe('Czech text handling', () => {
  it('sorts in Czech alphabetical order', () => {
    const words = ['chata', 'hrad', 'ihned', 'cena', 'čaj', 'dům', 'řeka', 'rok', 'sýr', 'škola', 'žena', 'zima'];
    expect([...words].sort(compareCs)).toEqual(['cena', 'čaj', 'dům', 'hrad', 'chata', 'ihned', 'rok', 'řeka', 'sýr', 'škola', 'zima', 'žena']);
  });

  it('treats vowel length as a tie-breaker only', () => {
    expect(['pás', 'pas', 'pát'].sort(compareCs)).toEqual(['pas', 'pás', 'pát']);
  });

  it('strips and searches diacritics in the pangram', () => {
    expect(stripDiacritics(PANGRAM)).toBe('Prilis zlutoucky kun upel dabelske ody');
    expect(searchKey('  ŘEŘICHA ')).toBe('rericha');
  });

  it('stores every Czech letter in the database unchanged', async () => {
    const db = new PrazakDB('unicode-roundtrip');
    const text = `${PANGRAM} Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň`;
    await db.attempts.add({ itemKey: 'x', skills: [], correct: true, diacriticSlip: false, answer: text, context: 'lesson', timestamp: 1 });
    expect((await db.attempts.toArray())[0]!.answer).toBe(text);
  });

  it('keeps all course content in composed (NFC) form, so answers compare correctly', () => {
    const bad: string[] = [];
    const visit = (v: unknown, where: string) => {
      if (typeof v === 'string') {
        if (v !== v.normalize('NFC')) bad.push(`${where}: ${v.slice(0, 40)}`);
      } else if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${where}[${i}]`));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, `${where}.${k}`);
    };
    for (const [path, data] of Object.entries(contentFiles.json)) visit(data, path);
    for (const [path, md] of Object.entries(contentFiles.markdown)) visit(md, path);
    expect(bad).toEqual([]);
  });
});
