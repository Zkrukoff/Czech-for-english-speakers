import { unitPath, unitCheckPath } from '@/lib/paths';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course, type Lesson } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { completeLesson, markLessonStep } from '@/db/progress';
import { ensureVocabCards } from '@/db/srs';
import { reviewableVocab } from '@/lib/srs/reviewItems';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { VocabList } from './VocabList';
import { DialogueView } from './DialogueView';
import { PracticeSummary } from './PracticeSummary';
import { useLessonPractice } from './useLessonPractice';
import { useLessonAnswerHandler } from './useLessonAnswerHandler';
import { IconArrowLeft, IconArrowRight, IconBook, IconHacek } from '@/components/icons';
import { LineBadge } from '@/components/ui';
import { LessonContext } from '@/features/lens/LessonContext';
import { hasLens as hasLensMarkup } from '@/lib/lens';

const STEPS = [
  { id: 'explanation', label: 'Grammar' },
  { id: 'vocab', label: 'Vocabulary' },
  { id: 'dialogue', label: 'Dialogue' },
  { id: 'practice', label: 'Practice' },
] as const;
type Step = (typeof STEPS)[number]['id'];

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = course.lessonsById.get(lessonId);
  if (!lesson) return <NotFound what="lesson" />;
  return (
    <LessonContext.Provider value={lesson.id}>
      <LessonView key={lesson.id} lesson={lesson} />
    </LessonContext.Provider>
  );
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const unit = course.unitsById.get(lesson.unitId)!;
  const [step, setStep] = useState<Step>('explanation');
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[] | null>(null);
  const [run, setRun] = useState(0);
  const onAnswer = useLessonAnswerHandler();
  // P4: a couple of items from earlier lessons, mixed in.
  const practice = useLessonPractice(lesson, run);
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const nextLesson = unit.lessonList[lesson.number];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (step !== 'practice') void markLessonStep(lesson.id, step);
  }, [step, lesson.id]);

  const stop = course.stopByUnit.get(unit.id);
  const guideLinks = course.guideLinksByLesson.get(lesson.id) ?? [];
  const hasLens =
    lesson.dialogue.lines.some((l) => hasLensMarkup(l.cs)) || lesson.exercises.some((e) => course.lensKeysByExercise.has(e.id));

  const grammarLinks = [...lesson.grammarRefs, ...lesson.grammarPreview]
    .map((r) => course.grammarBySkill.get(r))
    .filter((p) => p !== undefined);

  return (
    <>
      <Link to={unitPath(unit.id)} className="inline-flex min-h-11 items-center gap-2 text-sm text-vltava hover:underline">
        <IconArrowLeft size={16} />
        {stop && <LineBadge line={stop.line} size={22} />}
        <span lang="cs">{stop?.stationInfo.name}</span>
        <span className="hidden sm:inline">· {unit.title}</span>
      </Link>
      <PageHeader eyebrow={`Lekce ${lesson.number} / ${unit.lessonList.length}`} title={lesson.title}>
        <div className="mt-3"><ReviewStatusBadge reviewed={lesson.nativeReviewed} /></div>
      </PageHeader>

      <nav aria-label="Lesson steps" className="mb-8 -mx-4 overflow-x-auto px-4">
        <ol className="flex min-w-max gap-2">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id)}
                aria-current={s.id === step ? 'step' : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-sm border-2 px-3 text-sm font-semibold ${
                  s.id === step ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-surface text-ink-2 hover:border-ink hover:text-ink'
                }`}
              >
                <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {hasLens && (step === 'dialogue' || step === 'practice') && (
        <p className="mb-5 flex items-start gap-2 rounded-sm border-l-4 border-vltava bg-vltava-tint px-3 py-2 text-sm text-ink">
          <IconHacek size={18} className="mt-0.5 shrink-0" />
          <span>Underlined endings are tappable: the case, why it's used, and the pattern it follows. The colour always comes with the case number.</span>
        </p>
      )}

      {step === 'explanation' && (
        <>
          <CourseMarkdown>{lesson.explanationMd}</CourseMarkdown>
          {grammarLinks.length > 0 && (
            <p className="mt-6 text-sm text-ink-2">
              More detail:{' '}
              {grammarLinks.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ', '}
                  <Link className="text-vltava underline" to={p.section === 'verbs' ? `/verbs/${p.id}` : `/grammar/${p.id}`}>{p.title}</Link>
                </span>
              ))}
            </p>
          )}
        </>
      )}
      {step === 'vocab' && <VocabList items={lesson.vocab} />}
      {step === 'dialogue' && <DialogueView dialogue={lesson.dialogue} />}
      {step === 'practice' &&
        (outcomes ? (
          <PracticeSummary
            outcomes={outcomes}
            onAgain={() => { setOutcomes(null); setRun((r) => r + 1); }}
            next={nextLesson ? { to: `/lessons/${nextLesson.id}`, label: `Next: ${nextLesson.title}` } : { to: unitCheckPath(unit.id), label: 'Unit check: what can you do now?' }}
          />
        ) : (
          practice && <ExerciseRunner
            key={run}
            exercises={practice.exercises}
            fromBefore={practice.fromBefore}
            context="lesson"
            retryMissed
            onAnswer={onAnswer}
            onFinish={async (o) => {
              await completeLesson(lesson.id);
              // The lesson's words join the review queue from now on.
              await ensureVocabCards(reviewableVocab(lesson.vocab).map((v) => v.id));
              setOutcomes(o);
            }}
          />
        ))}

      {guideLinks.length > 0 && (step === 'explanation' || outcomes) && (
        <aside aria-labelledby="irl-heading" className="mt-10 border-t-2 border-ink pt-5">
          <h2 id="irl-heading" className="label-board text-ink-3">V reálu · where you'll use this</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {guideLinks.map((g) => (
              <li key={`${g.guideId}-${g.sectionId}`}>
                <Link to={`/guides/${g.guideId}?tab=${g.sectionId}`} className="chip min-h-11 hover:border-ink">
                  <IconBook size={16} /> {course.guidesById.get(g.guideId)?.title}: {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {step !== 'practice' && (
        <div className="mt-10 flex justify-between border-t border-rule pt-6">
          {stepIndex > 0 ? (
            <button type="button" onClick={() => setStep(STEPS[stepIndex - 1]!.id)} className="btn btn-quiet"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> {STEPS[stepIndex - 1]!.label}</button>
          ) : <span />}
          <button type="button" onClick={() => setStep(STEPS[stepIndex + 1]!.id)} className="btn btn-primary">
            {STEPS[stepIndex + 1]!.label} <IconArrowRight size={16} className="inline-block align-[-3px]" />
          </button>
        </div>
      )}
    </>
  );
}
