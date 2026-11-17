import { useEffect, useRef, useState } from 'react';
import { IconMic } from '@/components/icons';
import { RecordingButton, recordingUrl } from './RecordingButton';
import { SpeakButton } from '@/components/SpeakButton';

import { SELF_ASSESSED } from '@/lib/answers/check';

interface Props {
  cs: string;
  audio?: string;
  disabled: boolean;
  onAssess: (value: string) => void;
}

/**
 * Record yourself, play it back next to the reference, and judge for
 * yourself (D8). The recording stays in this page's memory: it is never
 * uploaded or stored.
 */
export function SpeakInput({ cs, audio, disabled, onAssess }: Props) {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'unsupported' | 'denied'>(
    typeof MediaRecorder === 'undefined' || !navigator.mediaDevices ? 'unsupported' : 'idle',
  );
  const [url, setUrl] = useState<string>();
  const rec = useRef<MediaRecorder | null>(null);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
        setState('recorded');
      };
      rec.current = r;
      r.start();
      setState('recording');
    } catch {
      setState('denied');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-2">Reference:</span>
        {audio && recordingUrl(audio) ? (
          <RecordingButton id={audio} />
        ) : audio ? (
          // A core sound: real speakers only (D6), never a synthetic voice.
          <span className="text-sm text-ink-2">A native-speaker recording is on its way. Go by the description for now.</span>
        ) : (
          <SpeakButton text={cs} label="Listen (synthetic voice)" />
        )}
      </div>
      {state === 'unsupported' && <p className="text-sm text-ink-2">This browser can't record. Say it out loud anyway, then judge yourself.</p>}
      {state === 'denied' && <p className="text-sm text-ink-2">No microphone access. Say it out loud anyway, then judge yourself.</p>}
      <div className="flex flex-wrap items-center gap-3">
        {(state === 'idle' || state === 'recorded') && (
          <button type="button" className="btn btn-secondary" disabled={disabled} onClick={start}>
            <IconMic size={18} /> {state === 'recorded' ? 'Record again' : 'Record yourself'}
          </button>
        )}
        {state === 'recording' && (
          <button type="button" className="btn btn-primary" onClick={() => rec.current?.stop()}>
            Stop
          </button>
        )}
        {url && <audio controls src={url} className="h-10" aria-label="Your recording" />}
      </div>
      <p className="text-xs text-ink-3">Your recording stays on this page and is never uploaded or saved.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={disabled} onClick={() => onAssess(SELF_ASSESSED.good)}>
          <span lang="cs">Zvládl/a jsem to</span> · sounds right
        </button>
        <button type="button" className="btn btn-quiet" disabled={disabled} onClick={() => onAssess(SELF_ASSESSED.again)}>
          <span lang="cs">Ještě ne</span> · not yet
        </button>
      </div>
    </div>
  );
}
