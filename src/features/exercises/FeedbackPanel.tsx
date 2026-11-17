import { lensPlain } from '@/lib/lens';
import { Link } from 'react-router-dom';
import type { CheckResult } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';
import { course } from '@/content';
import { SpeakButton } from '@/components/SpeakButton';
import { IconExternal } from '@/components/icons';
import { Stamp } from '@/components/ui';
import { parseLens } from '@/lib/lens';
import { lensInfo, type LensToken } from '@/features/lens/lensInfo';
import { LensExplanation } from '@/features/lens/LensExplanation';

/** Types whose answer is one word, where the wrong part can be pinpointed. */
const ONE_WORD = new Set<Exercise['type']>(['fillEnding', 'chooseEnding', 'conjugate', 'aspectChoice']);

/** The common start of two words and where they part, e.g. kávu / káva → ["káv", "a", "u"]. */
export function wordDiff(given: string, expected: string): [string, string, string] {
  let i = 0;
  const g = given.toLocaleLowerCase('cs');
  const e = expected.toLocaleLowerCase('cs');
  while (i < g.length && i < e.length && g[i] === e[i]) i++;
  return [expected.slice(0, i), given.slice(i), expected.slice(i)];
}

/** The lens word that contains the blank, if the prompt is annotated. */
function blankToken(exercise: Exercise): LensToken | undefined {
  if (!('prompt' in exercise)) return undefined;
  return parseLens(exercise.prompt).segments.find((s): s is LensToken => s.type === 'lens' && s.form.includes('___'));
}

/** Where the answer goes in a fill-in prompt: the letters before the blank. */
function stemOf(exercise: Exercise): string {
  if (exercise.type !== 'fillEnding' && exercise.type !== 'chooseEnding') return '';
  return /(\p{L}+)___/u.exec(lensPlain(exercise.prompt))?.[1] ?? '';
}

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

  const token = blankToken(exercise);
  const lens = token ? lensInfo({ ...token, form: token.form.replace('___', result.expected.slice(stemOf(exercise).length)) }) : undefined;
  const stem = stemOf(exercise);
  const givenWord = stem && !answer.toLocaleLowerCase('cs').startsWith(stem.toLocaleLowerCase('cs')) ? stem + answer : answer;
  const [same, wrongPart, rightPart] = wordDiff(givenWord.trim(), result.expected);
  const pinpoint = ONE_WORD.has(exercise.type) && !result.diacriticsOnly && givenWord.trim() !== '';

  return (
    <div role="status" aria-live="polite" className={`relative rounded-md border-2 border-ink p-4 shadow-offset-sm ${result.status === 'diacritics' ? 'bg-champagne-tint' : 'bg-surface'}`}>
      {result.status === 'correct' && (
        <div className="flex items-center gap-4">
          <Stamp top="PRAŽÁK" main="OK" bottom="SPRÁVNĚ" size={72} className="-my-2 shrink-0" />
          <div>
            <p className="font-display text-xl font-extrabold" lang="cs">Správně.</p>
            {czech && exercise.type !== 'speak' && (
              <p className="flex items-center gap-1 text-lg" lang="cs">{result.expected} <SpeakButton text={speakText} /></p>
            )}
          </div>
        </div>
      )}
      {result.status === 'diacritics' && (
        <>
          <p className="font-semibold text-ink">Accepted, but check the diacritics.</p>
          <p className="mt-2 text-lg" lang="cs">
            <DiffText result={result} />
          </p>
          <p className="mt-1 text-sm text-ink">The highlighted letters were missing or wrong in your answer.</p>
        </>
      )}
      {result.status === 'incorrect' && (
        <>
          <p className="font-display text-xl font-extrabold">
            {exercise.type === 'speak' ? <span lang="cs">Ještě jednou.</span> : result.diacriticsOnly ? 'Close: only the diacritics differ.' : 'Not quite.'}
          </p>
          {exercise.type !== 'speak' && (
            <dl className="mt-2 grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-1">
              {answer.trim() && (
                <>
                  <dt className="label-board text-ink-3">You</dt>
                  <dd className="text-lg" lang={czech ? 'cs' : 'en'}>
                    {pinpoint ? (
                      <>
                        {same}
                        <span className="underline decoration-ink decoration-wavy decoration-2 underline-offset-4">{wrongPart || '∅'}</span>
                        <span className="sr-only"> (this part is wrong)</span>
                      </>
                    ) : (
                      <span className="line-through decoration-ink decoration-2">{answer}</span>
                    )}
                  </dd>
                </>
              )}
              <dt className="label-board text-ink-3">Right</dt>
              <dd className="flex items-center gap-1 text-lg font-semibold" lang={czech ? 'cs' : 'en'}>
                {exercise.type === 'caseSelect' ? (
                  <span className="capitalize">{result.expected}</span>
                ) : pinpoint ? (
                  <span>
                    {same}
                    <span className="text-vltava underline decoration-2 underline-offset-4">{rightPart}</span>
                  </span>
                ) : (
                  <DiffText result={result} />
                )}
                {czech && <SpeakButton text={speakText} />}
              </dd>
            </dl>
          )}
        </>
      )}
      {lens && result.status !== 'correct' && (
        <div className="mt-4 border-t-2 border-dashed border-rule pt-3">
          <LensExplanation info={lens} compact />
        </div>
      )}
      {result.explanation && result.status !== 'correct' && (
        <p className="mt-3 border-t border-rule pt-3 text-ink">
          <span className="font-semibold">{lens ? 'In short: ' : 'Why: '}</span>
          {result.explanation}
        </p>
      )}
      {result.status !== 'correct' && pageHref && (
        <Link to={pageHref} target="_blank" className="mt-2 inline-flex items-center gap-1 text-sm text-vltava underline">
          Open the {pageTitle} page <IconExternal size={14} />
        </Link>
      )}
    </div>
  );
}
