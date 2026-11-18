import { lensPlain } from '@/lib/lens';
import { speech } from '@/lib/audio/speech';
import { useHasCzechVoice } from '@/lib/audio/useCzechVoice';
import { useSettings } from '@/db/settings';


export function SpeakButton({ text: raw, audioId, label = 'Listen' }: { text: string; audioId?: string; label?: string }) {
  const text = lensPlain(raw);
  const settings = useSettings();
  const hasVoice = useHasCzechVoice();
  if (!hasVoice && !audioId) return null;
  return (
    <button
      type="button"
      onClick={() => speech.speak(text, { audioId, rate: settings.speechRate, voiceURI: settings.voiceURI })}
      className="-my-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-sans text-ink-3 hover:bg-paper-2 hover:text-ink"
      aria-label={`${label}: ${text}`}
      title={label}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M9.5 3.5 5.6 7H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.6l3.9 3.5a.6.6 0 0 0 1-.45V3.95a.6.6 0 0 0-1-.45ZM13.5 6.5a5 5 0 0 1 0 7l-1-1a3.6 3.6 0 0 0 0-5l1-1Zm2.1-2.1a8 8 0 0 1 0 11.2l-1-1a6.6 6.6 0 0 0 0-9.2l1-1Z" />
      </svg>
    </button>
  );
}
