import { useState } from 'react';
import { IconSpeaker } from '@/components/icons';
import { ComputerVoice } from '@/components/ListenButton';
import { speech, czechVoices } from '@/lib/audio/speech';
import { useHasCzechVoice } from '@/lib/audio/useCzechVoice';
import { useSettings } from '@/db/settings';
import type { ExamAudio as Lines } from './schema';
import { examLineId } from '@/lib/audio/ids';
import { recordingUrl } from '@/lib/audio/recordings';

/** How many times each recording plays in the exam [Official]. */
export const EXAM_PLAYS = 2;

export function Transcript({ lines }: { lines: Lines }) {
  const twoSpeakers = new Set(lines.map((l) => l.speaker)).size > 1;
  return (
    <div lang="cs" className="mt-2 space-y-1 border-l-4 border-rule pl-3 text-ink-2">
      {lines.map((l, i) => (
        <p key={i}>{twoSpeakers && <span className="font-semibold" aria-hidden>{l.speaker === 'a' ? 'A' : 'B'}: </span>}{l.cs}</p>
      ))}
    </div>
  );
}

/**
 * Plays an exam recording with the computer voice (two speakers: two voices,
 * or one voice at two pitches). In the exam each one plays twice; `limit`
 * enforces that in exam mode. With no Czech voice on the device, it says so
 * and offers the transcript, marked as reading rather than listening.
 */
export function ExamAudio({ lines, idBase, limit, label = 'Poslechnout · Listen', onPlayed }: { lines: Lines; idBase?: string; limit?: number; label?: string; onPlayed?: (n: number) => void }) {
  const settings = useSettings();
  const hasVoice = useHasCzechVoice();
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);

  const ids = lines.map((_, i) => (idBase ? examLineId(idBase, i) : undefined));
  const recorded = ids.every((id) => recordingUrl(id));
  if (!hasVoice && !recorded) {
    return (
      <div className="text-sm text-ink-2">
        <p>This device has no Czech voice, so this can't be played here. You can read it instead, but that's reading practice, not listening.</p>
        <button type="button" className="btn btn-quiet mt-1 min-h-11 px-0 underline" aria-expanded={showText} onClick={() => setShowText((s) => !s)}>
          {showText ? 'Hide the text' : 'Show the text'}
        </button>
        {showText && <Transcript lines={lines} />}
      </div>
    );
  }

  const left = limit === undefined ? undefined : limit - plays;
  async function play() {
    setPlaying(true);
    const voices = czechVoices();
    for (const [i, l] of lines.entries()) {
      const second = l.speaker === 'b';
      const voiceURI = voices.length > 1 && second ? voices[1]!.voiceURI : settings.voiceURI;
      await speech.speak(l.cs, { audioId: ids[i], rate: settings.speechRate, voiceURI, pitch: voices.length > 1 ? undefined : second ? 1.3 : 1 });
    }
    setPlaying(false);
    setPlays((n) => { onPlayed?.(n + 1); return n + 1; });
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={play} disabled={playing || left === 0} className="btn btn-secondary">
        <IconSpeaker size={18} /> {playing ? 'Přehrávám…' : plays ? 'Play again' : label}
      </button>
      <span className="text-sm text-ink-2" aria-live="polite">
        {left === undefined ? (plays ? `Played ${plays}× (the exam plays it twice)` : 'The exam plays it twice') : left === 0 ? 'Played twice' : `${left} of ${limit} plays left`}
      </span>
      {!recorded && <ComputerVoice />}
    </div>
  );
}
