import { useState } from 'react';
import { course } from '@/content';
import { IconSpeaker } from '@/components/icons';

/** URL of a real-speaker recording listed in content/audio/manifest.json. */
export function recordingUrl(id: string): string | undefined {
  const r = course.audio.get(id);
  return r ? `${import.meta.env.BASE_URL}audio/${r.file}` : undefined;
}

/** Plays a real recording (never text-to-speech: these exercises are about real sounds). */
export function RecordingButton({ id, label = 'Play the recording' }: { id: string; label?: string }) {
  const url = recordingUrl(id);
  const [playing, setPlaying] = useState(false);
  if (!url) return null;
  return (
    <button
      type="button"
      className="btn btn-secondary"
      aria-label={label}
      onClick={() => {
        const a = new Audio(url);
        setPlaying(true);
        a.onended = a.onerror = () => setPlaying(false);
        void a.play().catch(() => setPlaying(false));
      }}
    >
      <IconSpeaker size={18} /> {playing ? 'Playing…' : 'Play'}
    </button>
  );
}
