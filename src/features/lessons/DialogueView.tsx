import { CzechText } from '@/components/CzechText';
import { useState } from 'react';
import type { Dialogue } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';
import { speech } from '@/lib/audio/speech';
import { useSettings } from '@/db/settings';

export function DialogueView({ dialogue }: { dialogue: Dialogue }) {
  const [showEn, setShowEn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const settings = useSettings();
  const speakers = [...new Set(dialogue.lines.map((l) => l.speaker))];

  async function playAll() {
    setPlaying(true);
    for (const l of dialogue.lines) {
      await speech.speak(l.cs, { audioId: l.audio, rate: settings.speechRate, voiceURI: settings.voiceURI });
    }
    setPlaying(false);
  }

  return (
    <div>
      {dialogue.setting && <p className="mb-4 italic text-ink-2">{dialogue.setting}</p>}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} />
          Show English
        </label>
        <button type="button" onClick={playing ? () => { speech.stop(); setPlaying(false); } : playAll} className="btn btn-secondary">
          {playing ? 'Stop' : 'Play whole dialogue'}
        </button>
      </div>
      <ol className="space-y-3">
        {dialogue.lines.map((l, i) => {
          const right = speakers.indexOf(l.speaker) % 2 === 1;
          return (
            <li key={i} className={`flex ${right ? 'justify-end' : ''}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${right ? 'rounded-tr-sm bg-vltava-tint' : 'rounded-tl-sm bg-surface border border-rule'}`}>
                <div className="text-xs font-medium text-ink-3">{l.speaker}</div>
                <div className="flex items-start gap-1 text-lg" lang="cs">
                  <span><CzechText text={l.cs} /></span>
                  <SpeakButton text={l.cs} audioId={l.audio} />
                </div>
                {showEn && <div className="text-sm text-ink-2">{l.en}</div>}
                {l.spoken && <div className="mt-2"><SpokenFormNote spoken={l.spoken} /></div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
