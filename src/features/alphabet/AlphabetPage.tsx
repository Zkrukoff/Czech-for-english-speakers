import { CzechText } from '@/components/CzechText';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import type { Letter } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { SpeakButton } from '@/components/SpeakButton';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { NotFound } from '@/components/NotFound';
import { PracticeSets } from '@/features/practice/PracticeSets';

const TABS = [
  { id: 'letters', label: 'Letters' },
  { id: 'guide', label: 'Pronunciation guide' },
  { id: 'practice', label: 'Practice' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function AlphabetPage() {
  const alphabet = course.alphabet;
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'letters') as Tab;
  if (!alphabet) return <NotFound what="page" />;
  return (
    <>
      <PageHeader
        title="The Czech alphabet"
        subtitle="42 letters. Learn them once and you can read any Czech word aloud, and spell your name and e-mail at the bank, the doctor's or the foreign police."
      >
        <div className="mt-3"><ReviewStatusBadge reviewed={alphabet.nativeReviewed} /></div>
      </PageHeader>
      <nav aria-label="Alphabet sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-rule">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setParams(t.id === 'letters' ? {} : { tab: t.id }, { replace: true })}
            aria-current={t.id === tab ? 'page' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${t.id === tab ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'letters' && <LetterExplorer letters={alphabet.letters} />}
      {tab === 'guide' && <CourseMarkdown>{alphabet.introMd}</CourseMarkdown>}
      {tab === 'practice' && <PracticeSets sets={alphabet.practice} context="alphabet" />}
    </>
  );
}

/** Selected letters light up like the coloured bubble panels in the metro. */
const BUBBLE = ['bg-line-a text-on-fill-light', 'bg-line-b text-ink', 'bg-line-c text-on-fill-light', 'bg-vltava text-on-fill-light'];

function LetterExplorer({ letters }: { letters: Letter[] }) {
  const [selected, setSelected] = useState<Letter>(letters.find((l) => l.letter === 'ř') ?? letters[0]!);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="mb-3 text-sm text-ink-2">
          Select a letter to hear it and see how it's pronounced. <span className="font-medium text-ink">Bold</span> letters are vowels; faded ones appear only in foreign words.
        </p>
        <ul className="grid grid-cols-6 gap-2.5 sm:grid-cols-7 md:grid-cols-9" aria-label="Letters">
          {letters.map((l) => {
            const active = l.letter === selected.letter;
            return (
              <li key={l.letter}>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  aria-pressed={active}
                  lang="cs"
                  className={`relative flex aspect-square w-full items-center justify-center rounded-full text-xl transition-all duration-200 hover:scale-110 ${
                    active
                      ? `scale-110 ${BUBBLE[l.letter.charCodeAt(0) % BUBBLE.length]} shadow-offset`
                      : `bg-surface shadow-[inset_-3px_-4px_0_0_rgb(0_0_0/0.06)] ring-1 ring-rule hover:ring-rule-strong ${l.loanOnly ? 'text-ink-3' : 'text-ink'}`
                  } ${l.group === 'vowel' ? 'font-bold' : ''}`}
                >
                  <span>{l.letter.length > 1 ? l.upper : `${l.upper}${l.letter}`}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <LetterDetail letter={selected} />
    </div>
  );
}

function LetterDetail({ letter: l }: { letter: Letter }) {
  return (
    <section aria-live="polite" className="self-start rounded-md border-2 border-ink bg-surface p-5 lg:sticky lg:top-24">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-6xl leading-none" lang="cs">{l.letter.length > 1 ? `${l.upper} ${l.letter}` : `${l.upper}${l.letter}`}</span>
        <span className="text-sm text-ink-3">{l.group}{l.loanOnly ? ' · foreign words only' : ''}</span>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-ink-3">Sounds</dt>
          <dd className="text-base text-ink">{l.sound} <span className="text-ink-3">[{l.ipa}]</span></dd>
        </div>
        <div>
          <dt className="text-ink-3">Example</dt>
          <dd className="flex items-center gap-1 text-base">
            <span lang="cs" className="text-lg"><CzechText text={l.example.cs} /></span>
            <SpeakButton text={l.example.cs} />
            <span className="text-ink-2">({l.example.en})</span>
          </dd>
        </div>
        <div>
          <dt className="text-ink-3">When spelling, say</dt>
          <dd className="flex items-center gap-1 text-base">
            <span lang="cs" className="text-lg">{l.name}</span>
            <SpeakButton text={l.name} />
            {l.spellingWord && <span className="text-ink-2">· <span lang="cs">{l.upper} jako {l.spellingWord}</span></span>}
          </dd>
        </div>
      </dl>
      {l.tip && <p className="mt-3 border-l-4 border-champagne bg-champagne-tint px-3 py-2 text-sm text-ink">{l.tip}</p>}
    </section>
  );
}
