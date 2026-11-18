import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { SectionNumber } from '@/components/ui';
import { SpeakButton } from '@/components/SpeakButton';
import { IconArrowLeft } from '@/components/icons';
import { VocabList } from '@/features/lessons/VocabList';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { useLessonAnswerHandler } from '@/features/lessons/useLessonAnswerHandler';
import { completeLesson } from '@/db/progress';
import { ensureVocabCards } from '@/db/srs';
import { inDaysCs, nextDateFor } from '@/lib/holidays';
import { pragueNow } from '@/lib/pragueTime';

/** A holiday prep mini-lesson: words, customs, greetings, etiquette, a few exercises. */
export function HolidayLessonPage() {
  const { lessonId = '' } = useParams();
  const l = course.holidayLessons.find((x) => x.id === lessonId);
  const [run, setRun] = useState<'idle' | 'running' | 'done'>('idle');
  const [score, setScore] = useState('');
  const onAnswer = useLessonAnswerHandler();
  if (!l) return <NotFound what="holiday lesson" />;
  const now = pragueNow();
  const date = nextDateFor(l.holidays, now, course.holidays);
  const days = date ? Math.round((date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000) : null;
  const shops = course.holidays?.holidays.filter((h) => l.holidays.includes(h.id)) ?? [];

  return (
    <>
      <Link to="/holidays" className="inline-flex items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Czech holidays</Link>
      <PageHeader title={l.title} cs={l.titleCs} subtitle={l.intro}>
        {date && (
          <p className="label-board mt-3 text-ink-3">
            {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · <span lang="cs">{days === 0 ? 'dnes' : inDaysCs(days!)}</span>
          </p>
        )}
      </PageHeader>

      <div className="grid gap-10 md:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="do-h">
            <SectionNumber n={1} id="do-h">What people actually do</SectionNumber>
            <div className="prose-cz mt-4">
              <ul>
                {l.whatPeopleDo.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </section>
          <section aria-labelledby="words-h">
            <SectionNumber n={2} id="words-h">Words</SectionNumber>
            <div className="mt-4"><VocabList items={l.vocab} /></div>
          </section>
          <section aria-labelledby="ex-h">
            <SectionNumber n={3} id="ex-h">Practise</SectionNumber>
            {run === 'running' ? (
              <div className="mt-4">
                <ExerciseRunner
                  exercises={l.exercises}
                  context="guide"
                  retryMissed
                  onAnswer={onAnswer}
                  onFinish={async (o) => {
                    await completeLesson(l.id);
                    await ensureVocabCards(l.vocab.map((v) => v.id));
                    setScore(`${o.filter((x) => x.firstTry && x.result.accepted).length} of ${l.exercises.length}`);
                    setRun('done');
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {run === 'done' && <p className="font-semibold">{score} right first time. The words are in your reviews now.</p>}
                <button type="button" className="btn btn-primary" onClick={() => setRun('running')}>{run === 'done' ? 'Again' : `${l.exercises.length} questions`}</button>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 self-start">
          {l.greetings.length > 0 && (
            <div className="border-2 border-ink bg-ticket p-4 text-on-fill-dark shadow-offset-sm">
              <h2 className="label-board">Co říct · what to say</h2>
              <ul className="mt-3 space-y-3">
                {l.greetings.map((g) => (
                  <li key={g.cs}>
                    <span className="flex items-center gap-1 text-lg font-semibold" lang="cs">{g.cs} <SpeakButton text={g.cs} /></span>
                    <span className="block text-sm">{g.en}{g.note && <> · {g.note}</>}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="border-2 border-ink bg-surface p-4">
            <h2 className="label-board text-ink-3">Good to know</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              {l.etiquette.map((t) => <li key={t}>{t}</li>)}
            </ul>
            {shops.some((h) => h.shops !== 'open') && course.holidays?.shopsNote && <p className="mt-3 text-xs text-ink-3">{course.holidays.shopsNote}</p>}
          </div>
          <Link to="/guides/culture?tab=holidays" className="text-sm text-vltava underline">All the holidays, in the culture guide</Link>
        </aside>
      </div>
    </>
  );
}
