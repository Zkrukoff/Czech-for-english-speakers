import { lensPlain } from '@/lib/lens';
import { Link } from 'react-router-dom';
import type { CheckResult } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';
import { course } from '@/content';
import { SpeakButton } from '@/components/SpeakButton';
import { IconExternal } from '@/components/icons';

function DiffText({ result }: { result: CheckResult }) {
  if (!result.diff) return <>{result.expected}</>;
  return (
    <>
      {result.diff.map((d, i) =>
        d.wrong ? (
          <mark key={i} className="rounded-sm bg-champagne px-0.5 font-semibold text-ink underline decoration-2">{d.ch}</mark>
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
  if (ex.type === 'question' || ex.type === 'readReal') return ex.answerLang === 'cs';
  return ex.type !== 'caseSelect';
}

export function FeedbackPanel({ exercise, result, answer }: { exercise: Exercise; result: CheckResult; answer: string }) {
  // Link to the most relevant page: a grammar topic first, otherwise the alphabet or guide.
  const grammarSkill =
    exercise.skills.find((s) => s.startsWith('case:') || s.startsWith('verb:')) ?? exercise.skills.find((s) => !s.startsWith('vocab:'));
  const page = grammarSkill ? course.grammarBySkill.get(grammarSkill) : undefined;
  const guide = grammarSkill?.startsWith('guide:') ? course.guidesById.get(grammarSkill.slice(6)) : undefined;
  const pageHref =
    grammarSkill === 'alphabet'
      ? '/alphabet'
      : guide
        ? `/guides/${guide.id}`
        : page
          ? page.section === 'verbs'
            ? `/verbs/${page.id}`
            : `/grammar/${page.id}`
          : undefined;
  const pageTitle = grammarSkill === 'alphabet' ? 'Alphabet' : guide ? guide.title : page?.title.split(':')[0]!.split('(')[0]!.trim();
  const czech = answerIsCzech(exercise);
  // For fill-in-the-ending, read out the whole sentence with the right word in place.
  const speakText =
    exercise.type === 'fillEnding' || exercise.type === 'chooseEnding' || exercise.type === 'aspectChoice'
      ? lensPlain(exercise.prompt).replace(/\p{L}*___/u, result.expected)
      : result.expected;

  const tone =
    result.status === 'correct'
      ? 'border-ink bg-paper-2'
      : result.status === 'diacritics'
        ? 'border-champagne bg-champagne-tint'
        : 'border-ink bg-paper-2';

  return (
    <div role="status" aria-live="polite" className={`rounded-xl border p-4 ${tone}`}>
      {result.status === 'correct' && <p className="font-semibold text-ink">Correct.</p>}
      {result.status === 'diacritics' && (
        <>
          <p className="font-semibold text-ink">Accepted, but check the diacritics.</p>
          <p className="mt-2 text-lg">
            <DiffText result={result} />
          </p>
          <p className="mt-1 text-sm text-ink">The highlighted letters were missing or wrong in your answer.</p>
        </>
      )}
      {result.status === 'incorrect' && (
        <>
          <p className="font-semibold text-ink">{result.diacriticsOnly ? 'Not quite: the diacritics are different.' : 'Not quite.'}</p>
          {answer.trim() && (
            <p className="mt-2 text-sm text-ink-2">
              You wrote: <span className="text-ink line-through decoration-ink">{answer}</span>
            </p>
          )}
          <p className="mt-1 flex items-center gap-1 text-lg">
            <span className="text-sm text-ink-2">Answer:</span>{' '}
            <span className="font-medium">{exercise.type === 'caseSelect' ? <span className="capitalize">{result.expected}</span> : <DiffText result={result} />}</span>
            {czech && <SpeakButton text={speakText} />}
          </p>
        </>
      )}
      {result.explanation && result.status !== 'correct' && (
        <p className="mt-3 border-t border-rule pt-3 text-ink">
          <span className="font-medium">Why: </span>
          {result.explanation}
        </p>
      )}
      {result.status !== 'correct' && pageHref && (
        <Link to={pageHref} target="_blank" className="mt-2 inline-block text-sm text-vltava underline">
          Open the {pageTitle} page <IconExternal size={14} className="inline-block align-[-2px]" />
        </Link>
      )}
    </div>
  );
}
