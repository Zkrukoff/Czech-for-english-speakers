import { useEffect, useRef, useState } from 'react';

export type RecState = 'idle' | 'recording' | 'unsupported' | 'denied';

/**
 * Records from the microphone into memory. Recordings are object URLs that
 * live only in this page: never uploaded, never stored. Whoever keeps a
 * recording revokes it (URL.revokeObjectURL) when it's no longer shown.
 */
export function useRecorder() {
  const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices;
  const [state, setState] = useState<RecState>(supported ? 'idle' : 'unsupported');
  const rec = useRef<MediaRecorder | null>(null);
  const resolveStop = useRef<((url: string | undefined) => void) | null>(null);
  // Leaving mid-recording releases the microphone.
  useEffect(() => () => { rec.current?.stream.getTracks().forEach((t) => t.stop()); }, []);

  async function start(): Promise<boolean> {
    if (!supported || state === 'recording') return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const url = URL.createObjectURL(new Blob(chunks, { type: r.mimeType }));
        setState('idle');
        resolveStop.current?.(url);
        resolveStop.current = null;
      };
      rec.current = r;
      r.start();
      setState('recording');
      return true;
    } catch {
      setState('denied');
      return false;
    }
  }

  /** Stops and resolves with the recording's URL (undefined if nothing was recording). */
  function stop(): Promise<string | undefined> {
    const r = rec.current;
    if (!r || r.state !== 'recording') return Promise.resolve(undefined);
    return new Promise((resolve) => { resolveStop.current = resolve; r.stop(); });
  }

  return { state, supported, start, stop };
}
