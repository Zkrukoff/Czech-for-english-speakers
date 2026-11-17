import { useEffect, useId, useRef, useState } from 'react';
import { CASE_DECOR, CASE_TEXT } from '@/components/caseColors';
import { IconClose } from '@/components/icons';
import { lensInfo, type LensToken } from './lensInfo';
import { LensExplanation } from './LensExplanation';

/**
 * A lens-annotated word. Its ending is underlined in its case colour; tap or
 * press Enter to see the case, why, and the pattern. On phones the
 * explanation opens as a bottom sheet (easy to reach, never off-screen);
 * from 640px it is a popover under the word.
 */
export function LensWord({ token }: { token: LensToken }) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const info = lensInfo(token);
  const id = useId();
  const wrap = useRef<HTMLSpanElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <span ref={wrap} className="relative inline">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`${token.form}: ${info.caseNumber}. pád, ${info.caseEn}. Show why`}
        onClick={() => {
          // Keep the popover on screen: open it leftwards when the word is near the right edge.
          const r = button.current?.getBoundingClientRect();
          setAlignRight(!!r && r.left + 352 > window.innerWidth - 16);
          setOpen((o) => !o);
        }}
        className="rounded-sm text-inherit hover:bg-paper-2 focus-visible:bg-paper-2"
        data-lens=""
        data-case={token.case}
      >
        {info.split[0]}
        <span className={`${open ? CASE_TEXT[token.case] : ''} underline decoration-2 underline-offset-[5px] ${CASE_DECOR[token.case]}`}>{info.split[1]}</span>
      </button>
      {open && (
        <>
          <span aria-hidden className="fixed inset-0 z-30 bg-ink/30 sm:hidden" />
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={`Case lens: ${token.form}`}
            tabIndex={-1}
            className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-lg border-t-2 border-ink bg-surface p-5 pb-8 font-ui text-base font-normal shadow-offset outline-none sm:absolute sm:inset-x-auto sm:bottom-auto ${alignRight ? 'sm:right-0' : 'sm:left-0'} sm:top-full sm:mt-2 sm:w-[22rem] sm:rounded-md sm:border-2 sm:pb-5`}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                button.current?.focus();
              }}
              className="float-right -mr-2 -mt-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
              aria-label="Close"
            >
              <IconClose size={18} />
            </button>
            <LensExplanation info={info} />
          </div>
        </>
      )}
    </span>
  );
}
