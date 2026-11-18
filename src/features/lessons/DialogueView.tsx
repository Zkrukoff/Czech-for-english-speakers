import { lensPlain } from '@/lib/lens';
import { CzechText } from '@/components/CzechText';
import { useRef, useState } from 'react';
import type { Dialogue } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';
import { czechVoices, speech } from '@/lib/audio/speech';
import { useHasCzechVoice } from '@/lib/audio/useCzechVoice';
import { recordingUrl } from '@/features/exercises/types/RecordingButton';
import { ComputerVoice } from '@/components/ListenButton';
import { IconSpeaker } from '@/components/icons';
import { useSettings } from '@/db/settings';

/**
 * The lesson dialogue, listen first (P1): play it with the text hidden, then
 * show the text. Recordings are used where they exist; otherwise the device's
 * Czech voice, labelled, with a second voice or pitch for the other speaker.
 * With no Czech voice and no recordings, the text is shown straight away.
 */
export function DialogueView({ dialogue }: { dialogue: Dialogue }) {
  const [showEn, setShowEn] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const settings = useSettings();
  const hasVoice = useHasCzechVoice();
  const recorded = dialogue.lines.every((l) => l.audio && recordingUrl(l.audio));
  const canListen = hasVoice || recorded;
  const [textShown, setTextShown] = useState(false);
  const showText = textShown || !canListen;
  const speakers = [...new Set(dialogue.lines.map((l) => l.speaker))];
  const stopRef = useRef(false);

  async function playAll() {
    stopRef.current = false;
    setPlaying(true);
    const voices = czechVoices();
    for (const l of dialogue.lines) {
      if (stopRef.current) break;
      const who = speakers.indexOf(l.speaker);
      // Two Czech voices: one per speaker. One voice: a different pitch for the second speaker.
      const voiceURI = voices.length > 1 ? voices[who % voices.length]!.voiceURI : settings.voiceURI;
      await speech.speak(lensPlain(l.cs), { audioId: l.audio, rate: settings.speechRate, voiceURI, pitch: voices.length > 1 ? undefined : who % 2 ? 1.3 : 1 });
    }
    setPlaying(false);
    setPlayed(true);
  }

  return (
    <div>
      {dialogue.setting && <p className="mb-4 italic text-ink-2">{dialogue.setting}</p>}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        {canListen && (
          <button type="button" onClick={playing ? () => { stopRef.current = true; speech.stop(); setPlaying(false); } : playAll} className={showText ? 'btn btn-secondary' : 'btn btn-primary'}>
            <IconSpeaker size={18} /> {playing ? 'Stop' : played ? 'Play again' : <><span lang="cs">Poslechněte si</span> · listen</>}
          </button>
        )}
        {canListen && !recorded && <ComputerVoice />}
        {showText && (
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5 accent-ink" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} />
            Show English
          </label>
        )}
      </div>
      {!showText && (
        <div className="border-2 border-dashed border-rule-strong p-5">
          <p className="text-ink-2">
            Listen first: {dialogue.lines.length} lines, {speakers.length} people. Catch what you can: names, numbers, what they want. Then read along.
          </p>
          <button type="button" onClick={() => setTextShown(true)} className="btn btn-secondary mt-4">
            <span lang="cs">Ukázat text</span> · show the text
          </button>
        </div>
      )}
      {showText && <ol className="space-y-3">
        {dialogue.lines.map((l, i) => {
          const right = speakers.indexOf(l.speaker) % 2 === 1;
          return (
            <li key={i} className={`flex ${right ? 'justify-end' : ''}`}>
              <div className={`max-w-[85%] rounded-md border-2 border-ink px-4 py-2.5 shadow-offset-sm ${right ? 'rounded-tr-none bg-vltava-tint' : 'rounded-tl-none bg-surface'}`}>
                <div className="label-board text-ink-3">{l.speaker}</div>
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
      </ol>}
    </div>
  );
}
