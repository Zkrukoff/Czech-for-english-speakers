import { useState } from 'react';
import { IconSpeaker } from '@/components/icons';
import { recordingUrl } from '@/lib/audio/recordings';

export { recordingUrl };

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
