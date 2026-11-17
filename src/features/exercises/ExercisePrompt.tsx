import { RecordingButton } from './types/RecordingButton';
import { RealiaCard } from './types/RealiaCard';
import { CzechText } from '@/components/CzechText';
import type { ReactNode } from 'react';
import type { Exercise } from '@/content/schema';
import { CASE_INFO } from '@/content/taxonomy';
import { PERSON_LABELS } from '@/lib/verbs';
import { SpeakButton } from '@/components/SpeakButton';

/** Render "**word**" as bold and "___" as a visible blank. */
/** A Czech prompt: lens words, **bold** for the word in question, ___ for the blank. */
export function InlineCzech({ text }: { text: string }) {
  return <CzechText text={text} renderText={renderPromptText} />;
}

function renderPromptText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|___)/g).map((p, i): ReactNode => {
    if (p === '___') return <span key={i} className="mx-0.5 inline-block w-12 border-b-2 border-vltava align-baseline" aria-label="blank" />;
    if (p.startsWith('**')) return <strong key={i} className="rounded-sm bg-vltava-tint px-1 text-vltava">{p.slice(2, -2)}</strong>;
    return <span key={i}>{p}</span>;
  });
}

const TYPE_LABEL: Record<Exercise['type'], string> = {
  translate: 'Translate',
  fillEnding: 'Fill in the ending',
  caseSelect: 'Which case?',
  conjugate: 'Conjugate',
  dialogueComplete: 'Complete the dialogue',
  question: 'Alphabet and sounds',
  listenType: 'Listen and type',
  chooseEnding: 'Choose the ending',
  buildSentence: 'Build the sentence',
  aspectChoice: 'Which verb?',
  minimalPair: 'Which word do you hear?',
  speak: 'Say it',
  readReal: 'Read it',
  multipleChoice: 'Choose one',
};

export function ExercisePrompt({ exercise }: { exercise: Exercise }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium uppercase tracking-wide text-ink-3">
        {exercise.type === 'translate' ? (exercise.direction === 'en-cs' ? 'Translate into Czech' : 'Translate into English') : TYPE_LABEL[exercise.type]}
      </div>
      {exercise.type === 'translate' && (
        <p className="flex items-center gap-2 text-2xl font-medium" lang={exercise.direction === 'en-cs' ? 'en' : 'cs'}>
          <CzechText text={exercise.prompt} />
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
              <CzechText text={exercise.cs} />
              <SpeakButton text={exercise.speak ?? exercise.cs} />
            </p>
          )}
        </>
      )}
      {exercise.type === 'listenType' && (
        <div className="flex flex-wrap items-center gap-3">
          <RecordingButton id={exercise.audio} />
          <span className="text-sm text-ink-2">Type what you hear, in Czech.</span>
        </div>
      )}
      {(exercise.type === 'chooseEnding' || exercise.type === 'aspectChoice') && (
        <>
          <p className="text-2xl font-medium" lang="cs"><InlineCzech text={exercise.prompt} /></p>
          <p className="text-sm text-ink-2">
            {exercise.type === 'chooseEnding' && exercise.base && <>Base form: <b lang="cs">{exercise.base}</b>. </>}
            {exercise.type === 'aspectChoice' && <>Verbs: <b lang="cs">{exercise.verbs.join(' / ')}</b> (imperfective / perfective). </>}
            {exercise.en && <>“{exercise.en}”</>}
          </p>
        </>
      )}
      {exercise.type === 'buildSentence' && <p className="text-xl font-medium">“{exercise.prompt}”</p>}
      {exercise.type === 'minimalPair' && (
        <div className="flex flex-wrap items-center gap-3">
          <RecordingButton id={exercise.audio} />
          <span className="text-sm text-ink-2">Listen for <b lang="cs">{exercise.sound}</b>.</span>
        </div>
      )}
      {exercise.type === 'speak' && (
        <>
          <p className="text-2xl font-medium" lang="cs"><CzechText text={exercise.cs} /></p>
          <p className="text-sm text-ink-2">“{exercise.en}”{exercise.focus && <> · Listen for: {exercise.focus}</>}</p>
        </>
      )}
      {exercise.type === 'readReal' && (
        <>
          <RealiaCard realia={exercise.realia} />
          <p className="font-medium">{exercise.prompt}</p>
        </>
      )}
      {exercise.type === 'multipleChoice' && (
        <>
          {exercise.cs && (
            <p className="flex items-center gap-2 rounded-sm border-l-4 border-ink bg-paper-2 px-4 py-3 text-2xl" lang="cs">
              <CzechText text={exercise.cs} />
            </p>
          )}
          <p className="text-xl font-medium"><InlineCzech text={exercise.prompt} /></p>
        </>
      )}
      {exercise.type === 'dialogueComplete' && (
        <>
          <div className="space-y-2">
            {exercise.context.map((l, i) => (
              <div key={i} className="max-w-md rounded-md rounded-tl-none border-2 border-ink bg-surface px-4 py-2">
                <div className="text-xs font-medium text-ink-3">{l.speaker}</div>
                <div className="flex items-center gap-1 text-lg" lang="cs"><CzechText text={l.cs} /> <SpeakButton text={l.cs} /></div>
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
