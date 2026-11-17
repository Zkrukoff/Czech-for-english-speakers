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
import { useLessonAnswerHandler } from './useLessonAnswerHandler';
import { IconArrowLeft, IconArrowRight } from '@/components/icons';

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
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const unit = course.unitsById.get(lesson.unitId)!;
  const [step, setStep] = useState<Step>('explanation');
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[] | null>(null);
  const [run, setRun] = useState(0);
  const onAnswer = useLessonAnswerHandler();
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const nextLesson = unit.lessonList[lesson.number];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (step !== 'practice') void markLessonStep(lesson.id, step);
  }, [step, lesson.id]);

  const grammarLinks = lesson.grammarRefs
    .map((r) => course.grammarBySkill.get(r))
    .filter((p) => p !== undefined);

  return (
    <>
      <Link to={unitPath(unit.id)} className="text-sm text-vltava hover:underline"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> Unit {unit.number}: {unit.title}</Link>
      <PageHeader eyebrow={`Lesson ${lesson.number}`} title={lesson.title}>
        <div className="mt-3"><ReviewStatusBadge reviewed={lesson.nativeReviewed} /></div>
      </PageHeader>

      <nav aria-label="Lesson steps" className="mb-8 flex gap-1 overflow-x-auto border-b border-rule">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            aria-current={s.id === step ? 'step' : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${s.id === step ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
          >
            <span className="mr-1.5 text-ink-3">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </nav>

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
          <ExerciseRunner
            key={run}
            exercises={lesson.exercises}
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
