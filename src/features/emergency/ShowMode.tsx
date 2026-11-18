import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconArrowLeft, IconArrowRight, IconClose } from '@/components/icons';

type Msg = { cs: string; en: string };
type Sentinel = { release(): Promise<void> };

/**
 * "Show to a Czech": full-screen, one message per screen, big Czech on ticket
 * paper (fixed colours, so it reads the same in both themes). Keeps the
 * screen awake where the browser allows it.
 */
export function ShowMode({ messages, onClose }: { messages: Msg[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const m = messages[i]!;

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Keep focus in the dialog: everything behind it is inert while it's open.
    const root = document.getElementById('root');
    root?.setAttribute('inert', '');
    let lock: Sentinel | null = null;
    const wl = (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<Sentinel> } }).wakeLock;
    wl?.request('screen').then((s) => (lock = s)).catch(() => {});
    return () => {
      document.body.style.overflow = prevOverflow;
      root?.removeAttribute('inert');
      lock?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((x) => Math.min(x + 1, messages.length - 1));
      if (e.key === 'ArrowLeft') setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [messages.length, onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Show to a Czech" className="fixed inset-0 z-50 flex flex-col bg-ticket text-on-fill-dark">
      <div className="flex items-center justify-between gap-3 border-b-2 border-on-fill-dark px-4 py-3">
        <span className="label-board">
          {messages.length > 1 ? `${i + 1} / ${messages.length}` : 'Ukažte to'}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded border-2 border-on-fill-dark px-3 font-semibold">
          <IconClose size={18} /> Close
        </button>
      </div>
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-5 py-8 sm:px-12">
        <p lang="cs" className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{m.cs}</p>
        <p className="mt-6 text-base opacity-80">{m.en}</p>
      </div>
      {messages.length > 1 && (
        <div className="flex justify-between gap-3 border-t-2 border-on-fill-dark px-4 py-3">
          <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className="inline-flex min-h-11 items-center gap-2 rounded border-2 border-on-fill-dark px-4 font-semibold disabled:opacity-40">
            <IconArrowLeft size={18} /> Back
          </button>
          <button type="button" disabled={i === messages.length - 1} onClick={() => setI(i + 1)} className="inline-flex min-h-11 items-center gap-2 rounded border-2 border-on-fill-dark px-4 font-semibold disabled:opacity-40">
            Next <IconArrowRight size={18} />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
