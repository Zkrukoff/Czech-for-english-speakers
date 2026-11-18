import { useState, type ReactNode } from 'react';
import { IconSpeaker } from '@/components/icons';
import { recordingUrl } from '@/features/exercises/types/RecordingButton';
import { speech } from '@/lib/audio/speech';
import { useHasCzechVoice } from '@/lib/audio/useCzechVoice';
import { lensPlain } from '@/lib/lens';
import { useSettings } from '@/db/settings';

/**
 * Plays Czech for listening practice: the real recording when there is one,
 * otherwise the device's Czech voice, clearly labelled. With neither, shows
 * `fallback` (usually the text) so nothing is ever unanswerable.
 */
export function ListenButton({ text, audioId, label = 'Poslechnout · Listen', fallback }: { text: string; audioId?: string; label?: string; fallback?: ReactNode }) {
  const settings = useSettings();
  const hasVoice = useHasCzechVoice();
  const [playing, setPlaying] = useState(false);
  const url = audioId ? recordingUrl(audioId) : undefined;
  if (!url && !hasVoice) {
    return (
      <div className="text-sm text-ink-2">
        <p>This device has no Czech voice yet, so here's the text instead.</p>
        {fallback}
      </div>
    );
  }
  async function play() {
    setPlaying(true);
    if (url) {
      const a = new Audio(url);
      a.onended = a.onerror = () => setPlaying(false);
      await a.play().catch(() => setPlaying(false));
      return;
    }
    await speech.speak(lensPlain(text), { rate: settings.speechRate, voiceURI: settings.voiceURI });
    setPlaying(false);
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={play} disabled={playing} className="btn btn-secondary">
        <IconSpeaker size={18} /> {playing ? 'Přehrávám…' : label}
      </button>
      {!url && <ComputerVoice />}
    </div>
  );
}

/** The label wherever synthetic speech stands in for a recording. */
export function ComputerVoice() {
  return (
    <span className="label-board text-ink-3">
      Computer voice · <span lang="cs">hlas počítače</span>
    </span>
  );
}
