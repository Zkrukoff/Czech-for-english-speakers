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
      <nav aria-label="Alphabet sections" className="mb-8 flex gap-1 overflow-x-auto border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setParams(t.id === 'letters' ? {} : { tab: t.id }, { replace: true })}
            aria-current={t.id === tab ? 'page' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${t.id === tab ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
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

function LetterExplorer({ letters }: { letters: Letter[] }) {
  const [selected, setSelected] = useState<Letter>(letters.find((l) => l.letter === 'ř') ?? letters[0]!);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="mb-3 text-sm text-stone-600">
          Select a letter to hear it and see how it's pronounced. <span className="font-medium text-stone-800">Bold</span> letters are vowels; faded ones appear only in foreign words.
        </p>
        <ul className="grid grid-cols-6 gap-1.5 sm:grid-cols-7 md:grid-cols-9" aria-label="Letters">
          {letters.map((l) => {
            const active = l.letter === selected.letter;
            return (
              <li key={l.letter}>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  aria-pressed={active}
                  lang="cs"
                  className={`flex aspect-square w-full flex-col items-center justify-center rounded-lg border text-xl transition ${
                    active
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : `border-stone-200 bg-white hover:border-stone-500 ${l.loanOnly ? 'text-stone-400' : 'text-stone-900'}`
                  } ${l.group === 'vowel' ? 'font-semibold' : ''}`}
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
    <section aria-live="polite" className="self-start rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-24">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-6xl leading-none" lang="cs">{l.letter.length > 1 ? `${l.upper} ${l.letter}` : `${l.upper}${l.letter}`}</span>
        <span className="text-sm text-stone-500">{l.group}{l.loanOnly ? ' · foreign words only' : ''}</span>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-stone-500">Sounds</dt>
          <dd className="text-base text-stone-900">{l.sound} <span className="text-stone-500">[{l.ipa}]</span></dd>
        </div>
        <div>
          <dt className="text-stone-500">Example</dt>
          <dd className="flex items-center gap-1 text-base">
            <span lang="cs" className="text-lg">{l.example.cs}</span>
            <SpeakButton text={l.example.cs} />
            <span className="text-stone-600">({l.example.en})</span>
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">When spelling, say</dt>
          <dd className="flex items-center gap-1 text-base">
            <span lang="cs" className="text-lg">{l.name}</span>
            <SpeakButton text={l.name} />
            {l.spellingWord && <span className="text-stone-600">· <span lang="cs">{l.upper} jako {l.spellingWord}</span></span>}
          </dd>
        </div>
        {l.tip && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-stone-800">
            {l.tip}
          </div>
        )}
      </dl>
    </section>
  );
}
