import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as appIds from '@/lib/audio/ids';
import { AudioManifestSchema } from '@/content/schema';
import { RecordedAudioProvider, type SpeechProvider } from '@/lib/audio/speech';

const root = mkdtempSync(join(tmpdir(), 'prazak-audio-'));
let audio: typeof import('../scripts/audio.mjs');
let scriptIds: typeof import('../scripts/lib/audio-ids.mjs');

beforeAll(async () => {
  cpSync('content', join(root, 'content'), { recursive: true });
  process.env.PRAZAK_ROOT = root;
  audio = await import('../scripts/audio.mjs');
  scriptIds = await import('../scripts/lib/audio-ids.mjs');
});
afterAll(() => { rmSync(root, { recursive: true, force: true }); delete process.env.PRAZAK_ROOT; });

describe('recording ids', () => {
  it('are the same in the app and in the recording scripts', () => {
    expect(scriptIds.dialogueLineId('u01-l01', 0)).toBe(appIds.dialogueLineId('u01-l01', 0));
    expect(scriptIds.vocabAudioId('v-ahoj')).toBe(appIds.vocabAudioId('v-ahoj'));
    expect(scriptIds.chunkAudioId('kartou')).toBe(appIds.chunkAudioId('kartou'));
    expect(scriptIds.examLineId(scriptIds.examAudioBase('l1-mock1', 2), 1)).toBe(appIds.examLineId(appIds.examAudioBase('l1-mock1', 2), 1));
  });

  it('cover every spoken line once, with valid manifest ids', () => {
    const clips = audio.clipList();
    const ids = clips.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9][a-z0-9-]*$/.test(id))).toBe(true);
    expect(clips.every((c) => c.say.trim() && !c.say.includes('[['))).toBe(true);
    expect(clips.length).toBeGreaterThan(500);
    for (const n of [1, 2, 3, 4, 5, 6]) expect(clips.some((c) => c.batch === n), `batch ${n}`).toBe(true);
    const lesson = JSON.parse(readFileSync('content/units/01-greetings/lessons/01-hello-and-goodbye/lesson.json', 'utf8'));
    for (let i = 0; i < lesson.dialogue.lines.length; i++) expect(ids).toContain(appIds.dialogueLineId(lesson.id, i));
  });
});

describe('audio import', () => {
  it('refuses a speaker without written consent', () => {
    writeFileSync(join(root, 'content/audio/speakers.json'), JSON.stringify({ speakers: { jn: { name: 'J. N.', licence: 'CC BY 4.0' } } }));
    expect(() => audio.importFolder(join(root, 'none'), 'jn')).toThrow(/consent/);
    expect(() => audio.importFolder(join(root, 'none'), 'nobody')).toThrow(/Unknown speaker/);
  });

  it('copies clips named by id, lists them in a valid manifest, and reports strays', () => {
    writeFileSync(join(root, 'content/audio/speakers.json'), JSON.stringify({ speakers: { jn: { name: 'J. N.', licence: 'CC BY 4.0, recorded for Pražák', consent: '2026-11-20' } } }));
    const dir = join(root, 'incoming');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'dlg-u01-l01-1.m4a'), 'fake');
    writeFileSync(join(dir, 'rec-tri.mp3'), 'fake');
    writeFileSync(join(dir, 'not-a-clip.mp3'), 'fake');
    writeFileSync(join(dir, 'notes.txt'), 'x');
    const r = audio.importFolder(dir, 'jn');
    expect(r.added.sort()).toEqual(['dlg-u01-l01-1', 'rec-tri']);
    expect(r.unknown).toEqual(['not-a-clip.mp3']);
    expect(r.skipped).toEqual(['notes.txt']);
    const m = AudioManifestSchema.parse(JSON.parse(readFileSync(join(root, 'content/audio/manifest.json'), 'utf8')));
    expect(m.recordings.find((x) => x.id === 'dlg-u01-l01-1')).toMatchObject({ file: 'dlg-u01-l01-1.m4a', cs: 'Ahoj, Jano!', speaker: 'J. N.' });
    expect(readFileSync(join(root, 'public/audio/rec-tri.mp3'), 'utf8')).toBe('fake');
    // Importing again replaces rather than duplicates.
    expect(audio.importFolder(dir, 'jn').replaced.sort()).toEqual(['dlg-u01-l01-1', 'rec-tri']);
  });
});

describe('the audio player', () => {
  it('uses the computer voice for anything not listed, without requesting a file', async () => {
    const fallback: SpeechProvider = { isAvailable: () => true, speak: vi.fn(async () => {}), stop: vi.fn() };
    const AudioSpy = vi.fn();
    vi.stubGlobal('Audio', AudioSpy);
    const p = new RecordedAudioProvider(fallback, () => undefined);
    await p.speak('Ahoj', { audioId: 'dlg-u01-l01-1' });
    expect(AudioSpy).not.toHaveBeenCalled();
    expect(fallback.speak).toHaveBeenCalledWith('Ahoj', { audioId: 'dlg-u01-l01-1' });
    vi.unstubAllGlobals();
  });

  it('plays a listed recording to the end before resolving', async () => {
    const fallback: SpeechProvider = { isAvailable: () => true, speak: vi.fn(async () => {}), stop: vi.fn() };
    let el: { onended?: () => void; play: () => Promise<void>; pause: () => void; playbackRate: number } | undefined;
    vi.stubGlobal('Audio', vi.fn(function (this: typeof el) { el = this; this!.play = async () => {}; this!.pause = () => {}; }));
    const p = new RecordedAudioProvider(fallback, (id) => `/audio/${id}.m4a`);
    let done = false;
    const speaking = p.speak('Ahoj', { audioId: 'x' }).then(() => { done = true; });
    await new Promise((r) => setTimeout(r, 10));
    expect(done).toBe(false);
    el!.onended!();
    await speaking;
    expect(done).toBe(true);
    expect(fallback.speak).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
