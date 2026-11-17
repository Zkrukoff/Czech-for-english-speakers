import type { ReactNode } from 'react';
import type { Exercise } from '@/content/schema';
import { CASE_INFO } from '@/content/taxonomy';
import { PERSON_LABELS } from '@/lib/verbs';
import { SpeakButton } from '@/components/SpeakButton';

/** Render "**word**" as bold and "___" as a visible blank. */
export function InlineCzech({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|___)/g);
  return (
    <>
      {parts.map((p, i): ReactNode => {
        if (p === '___') return <span key={i} className="mx-0.5 inline-block w-12 border-b-2 border-vltava align-baseline" aria-label="blank" />;
        if (p.startsWith('**')) return <strong key={i} className="rounded bg-vltava-tint px-1 text-vltava">{p.slice(2, -2)}</strong>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

const TYPE_LABEL: Record<Exercise['type'], string> = {
  translate: 'Translate',
  fillEnding: 'Fill in the ending',
  caseSelect: 'Which case?',
  conjugate: 'Conjugate',
  dialogueComplete: 'Complete the dialogue',
  question: 'Alphabet and sounds',
};

export function ExercisePrompt({ exercise }: { exercise: Exercise }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium uppercase tracking-wide text-ink-3">
        {exercise.type === 'translate' ? (exercise.direction === 'en-cs' ? 'Translate into Czech' : 'Translate into English') : TYPE_LABEL[exercise.type]}
      </div>
      {exercise.type === 'translate' && (
        <p className="flex items-center gap-2 text-2xl font-medium" lang={exercise.direction === 'en-cs' ? 'en' : 'cs'}>
          {exercise.prompt}
          {exercise.direction === 'cs-en' && <SpeakButton text={exercise.prompt} />}
        </p>
      )}
      {exercise.type === 'fillEnding' && (
        <>
          <p className="text-2xl font-medium" lang="cs"><InlineCzech text={exercise.prompt} /></p>
          <p className="text-sm text-ink-2">
            {exercise.base && <>Base form: <b lang="cs">{exercise.base}</b>. </>}
            {exercise.en && <>“{exercise.en}”</>}
          </p>
        </>
      )}
      {exercise.type === 'caseSelect' && (
        <>
          <p className="text-2xl font-medium" lang="cs"><InlineCzech text={exercise.prompt} /></p>
          {exercise.en && <p className="text-sm text-ink-2">“{exercise.en}”</p>}
          <p className="font-medium">{exercise.question}</p>
        </>
      )}
      {exercise.type === 'conjugate' && (
        <>
          <p className="text-sm text-ink-2">
            Verb: <b lang="cs">{exercise.verb}</b>
            {exercise.person && <> · person: <b lang="cs">{PERSON_LABELS[exercise.person]}</b></>}
            {exercise.tense !== 'present' && <> · {exercise.tense}</>}
          </p>
          <p className="text-2xl font-medium" lang="cs"><InlineCzech text={exercise.prompt} /></p>
          {exercise.en && <p className="text-sm text-ink-2">“{exercise.en}”</p>}
        </>
      )}
      {exercise.type === 'question' && (
        <>
          <p className="text-xl font-medium"><InlineCzech text={exercise.prompt} /></p>
          {exercise.cs && (
            <p className="flex items-center gap-2 rounded-lg bg-paper-2 px-4 py-3 text-2xl" lang="cs">
              {exercise.cs}
              <SpeakButton text={exercise.speak ?? exercise.cs} />
            </p>
          )}
        </>
      )}
      {exercise.type === 'dialogueComplete' && (
        <>
          <div className="space-y-2">
            {exercise.context.map((l, i) => (
              <div key={i} className="max-w-md rounded-2xl rounded-tl-sm bg-paper-2 px-4 py-2">
                <div className="text-xs font-medium text-ink-3">{l.speaker}</div>
                <div className="flex items-center gap-1 text-lg" lang="cs">{l.cs} <SpeakButton text={l.cs} /></div>
                {l.en && <div className="text-sm text-ink-3">{l.en}</div>}
              </div>
            ))}
          </div>
          <p className="font-medium">{exercise.prompt}</p>
        </>
      )}
    </div>
  );
}

export function caseOptionLabel(c: keyof typeof CASE_INFO): string {
  return `${CASE_INFO[c].number}. ${c}`;
}
