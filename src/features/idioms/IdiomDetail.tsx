import { useState } from 'react';
import type { Idiom } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { shareOrDownload } from '@/lib/exportImage';
import { IdiomPlate } from './IdiomPlate';
import { renderIdiomPng } from './exportIdiom';

const DICT_NAME = { SSČ: 'Slovník spisovné češtiny', SSJČ: 'Slovník spisovného jazyka českého' } as const;

/** The full idiom: plate, meaning, example, source, and sharing. */
export function IdiomDetail({ idiom, week }: { idiom: Idiom; week: number }) {
  const [state, setState] = useState<'idle' | 'busy' | 'shared' | 'downloaded' | 'copied' | 'error'>('idle');
  const link = `${window.location.origin}${import.meta.env.BASE_URL}idioms/${idiom.id}`;

  async function share() {
    setState('busy');
    try {
      const png = await renderIdiomPng(idiom, week);
      const r = await shareOrDownload(png, `idiom-${idiom.id}.png`, `${idiom.cs} (“${idiom.literal}”) ${link}`);
      setState(r === 'cancelled' ? 'idle' : r);
    } catch {
      setState('error');
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setState('copied');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div>
        <IdiomPlate idiom={idiom} week={week} large />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={share} disabled={state === 'busy'} className="btn btn-secondary">{state === 'busy' ? 'Drawing…' : 'Share as image'}</button>
          <button type="button" onClick={copy} className="btn btn-quiet">Copy link</button>
          <SpeakButton text={idiom.cs} />
        </div>
        <p className="mt-2 min-h-5 text-sm text-ink-3" role="status">
          {state === 'downloaded' && `Saved as idiom-${idiom.id}.png.`}
          {state === 'shared' && <span lang="cs">Odesláno.</span>}
          {state === 'copied' && 'Link copied.'}
          {state === 'error' && 'That didn’t work. Try again?'}
        </p>
      </div>
      <dl className="space-y-5">
        <div>
          <dt className="label-board text-ink-3">Meaning</dt>
          <dd className="mt-1 text-lg">{idiom.meaning}{idiom.label && <span className="ml-2 font-mono text-xs text-ink-3" lang="cs">{idiom.label}</span>}</dd>
        </div>
        {idiom.english && (
          <div>
            <dt className="label-board text-ink-3">In English</dt>
            <dd className="mt-1 text-lg">{idiom.english}</dd>
          </div>
        )}
        <div>
          <dt className="label-board text-ink-3">Example</dt>
          <dd className="mt-1">
            <span lang="cs" className="block text-lg font-semibold">{idiom.example.cs}</span>
            <span className="block text-ink-2">{idiom.example.en}</span>
          </dd>
        </div>
        <div>
          <dt className="label-board text-ink-3">Source</dt>
          <dd className="mt-1 text-sm text-ink-2">
            <span lang="cs">„{idiom.definitionCs}“</span>, from {idiom.source.dictionaries.map((d) => DICT_NAME[d]).join(' and ')}, via the{' '}
            <a href={idiom.source.url} className="underline" target="_blank" rel="noreferrer">Internetová jazyková příručka</a> (ÚJČ AV ČR), checked {idiom.source.date}.
            {' '}The example sentence is ours and is awaiting native review.
          </dd>
        </div>
      </dl>
    </div>
  );
}
