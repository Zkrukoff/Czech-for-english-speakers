import { Link } from 'react-router-dom';
import type { CheckResult } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';
import { course } from '@/content';
import { SpeakButton } from '@/components/SpeakButton';

function DiffText({ result }: { result: CheckResult }) {
  if (!result.diff) return <>{result.expected}</>;
  return (
    <>
      {result.diff.map((d, i) =>
        d.wrong ? (
          <mark key={i} className="rounded-sm bg-amber-200 px-0.5 font-semibold text-amber-950 underline decoration-2">{d.ch}</mark>
        ) : (
          <span key={i}>{d.ch}</span>
        ),
      )}
    </>
  );
}

/** Answers to Czech prompts are in Czech; cs→en translations and case choices aren't. */
export function answerIsCzech(ex: Exercise): boolean {
  if (ex.type === 'translate') return ex.direction === 'en-cs';
  return ex.type !== 'caseSelect';
}

export function FeedbackPanel({ exercise, result, answer }: { exercise: Exercise; result: CheckResult; answer: string }) {
  const grammarSkill = exercise.skills.find((s) => !s.startsWith('vocab:'));
  const page = grammarSkill ? course.grammarBySkill.get(grammarSkill) : undefined;
  const pageHref = page ? (page.section === 'verbs' ? `/verbs/${page.id}` : `/grammar/${page.id}`) : undefined;
  const czech = answerIsCzech(exercise);
  // For fill-in-the-ending, read out the whole sentence with the right word in place.
  const speakText = exercise.type === 'fillEnding' ? exercise.prompt.replace(/\p{L}*___/u, result.expected) : result.expected;

  const tone =
    result.status === 'correct'
      ? 'border-emerald-300 bg-emerald-50'
      : result.status === 'diacritics'
        ? 'border-amber-300 bg-amber-50'
        : 'border-rose-300 bg-rose-50';

  return (
    <div role="status" aria-live="polite" className={`rounded-xl border p-4 ${tone}`}>
      {result.status === 'correct' && <p className="font-semibold text-emerald-900">Correct.</p>}
      {result.status === 'diacritics' && (
        <>
          <p className="font-semibold text-amber-900">Accepted, but check the diacritics.</p>
          <p className="mt-2 text-lg">
            <DiffText result={result} />
          </p>
          <p className="mt-1 text-sm text-amber-900">The highlighted letters were missing or wrong in your answer.</p>
        </>
      )}
      {result.status === 'incorrect' && (
        <>
          <p className="font-semibold text-rose-900">{result.diacriticsOnly ? 'Not quite: the diacritics are different.' : 'Not quite.'}</p>
          {answer.trim() && (
            <p className="mt-2 text-sm text-stone-600">
              You wrote: <span className="text-stone-900 line-through decoration-rose-400">{answer}</span>
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 text-lg">
            <span className="text-sm text-stone-600">Answer:</span>{' '}
            <span className="font-medium">{exercise.type === 'caseSelect' ? <span className="capitalize">{result.expected}</span> : <DiffText result={result} />}</span>
            {czech && <SpeakButton text={speakText} />}
          </p>
        </>
      )}
      {result.explanation && result.status !== 'correct' && (
        <p className="mt-3 border-t border-black/10 pt-3 text-stone-800">
          <span className="font-medium">Why: </span>
          {result.explanation}
        </p>
      )}
      {result.status !== 'correct' && pageHref && (
        <Link to={pageHref} target="_blank" className="mt-2 inline-block text-sm text-sky-700 underline">
          Open the {page!.title.split(':')[0]!.split('(')[0]!.trim()} page ↗
        </Link>
      )}
    </div>
  );
}
