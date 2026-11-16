import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import type { Letter, PracticeSet } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { SpeakButton } from '@/components/SpeakButton';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { NotFound } from '@/components/NotFound';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { useLessonAnswerHandler } from '@/features/lessons/useLessonAnswerHandler';

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
      {tab === 'practice' && <PracticeSets sets={alphabet.practice} />}
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

function PracticeSets({ sets }: { sets: PracticeSet[] }) {
  const [active, setActive] = useState<{ set: PracticeSet; run: number } | null>(null);
  const [done, setDone] = useState<{ set: PracticeSet; outcomes: ExerciseOutcome[] } | null>(null);
  const onAnswer = useLessonAnswerHandler();

  if (active) {
    return (
      <>
        <button type="button" onClick={() => setActive(null)} className="mb-4 text-sm text-sky-700 hover:underline">← All practice sets</button>
        <h2 className="mb-1 text-xl font-semibold">{active.set.title}</h2>
        <p className="mb-5 text-stone-600">{active.set.description}</p>
        <ExerciseRunner
          key={active.run}
          exercises={active.set.exercises}
          context="alphabet"
          retryMissed
          onAnswer={onAnswer}
          onFinish={(outcomes) => {
            setDone({ set: active.set, outcomes });
            setActive(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      {done && (
        <div role="status" className="mb-6 rounded-xl border border-stone-200 bg-white p-5">
          <p className="font-semibold">{done.set.title}: done</p>
          <p className="mt-1 text-stone-700">
            {done.outcomes.filter((o) => o.firstTry && o.result.accepted).length} of {done.outcomes.filter((o) => o.firstTry).length} right on the first try. Anything you missed will come back in your reviews.
          </p>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {sets.map((s) => (
          <li key={s.id} className="flex flex-col rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 flex-1 text-sm text-stone-600">{s.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-stone-500">{s.exercises.length} questions</span>
              <button type="button" onClick={() => { setDone(null); setActive({ set: s, run: Date.now() }); }} className="btn btn-primary">
                Start
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
