import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CASES, CASE_INFO, CASE_KEYS, VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { GoalList } from '@/components/GoalList';
import { CASE_BG } from '@/components/caseColors';
import { db } from '@/db/db';
import { useGoalProgress, useLessonProgress } from '@/db/hooks';
import { useDueSummary } from '@/db/useDue';
import { computeAllMastery, MASTERY_ACCURACY, MASTERY_MIN_ATTEMPTS, MASTERY_WINDOW, type SkillMastery } from '@/lib/progress/mastery';
import { relativeTime } from '@/lib/time';

const STATUS_LABEL = { 'not-started': 'not started', learning: 'practising', mastered: 'mastered' } as const;
const STATUS_STYLE = {
  'not-started': 'bg-stone-100 text-stone-500',
  learning: 'bg-amber-50 text-amber-800',
  mastered: 'bg-emerald-50 text-emerald-800',
} as const;

function MasteryRow({ label, href, m, dot }: { label: string; href?: string; m: SkillMastery; dot?: string }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[14rem_1fr_auto]">
      <span className="flex items-center gap-2 font-medium">
        {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />}
        {href ? <Link to={href} className="hover:underline">{label}</Link> : label}
      </span>
      <span className={`justify-self-end rounded-full px-2 py-0.5 text-xs font-medium sm:order-last ${STATUS_STYLE[m.status]}`}>{STATUS_LABEL[m.status]}</span>
      <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100" role="img" aria-label={`${Math.round(m.accuracy * 100)}% of recent answers right`}>
          <span className={`block h-full ${m.status === 'mastered' ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${m.accuracy * 100}%` }} />
        </span>
        <span className="w-32 text-right text-xs text-stone-500">
          {m.recent ? `${Math.round(m.accuracy * 100)}% of last ${m.recent}` : 'no answers yet'}
        </span>
      </span>
    </li>
  );
}

export function ProgressPage() {
  const attempts = useLiveQuery(() => db.attempts.toArray(), []);
  const goals = useGoalProgress();
  const lessons = useLessonProgress();
  const due = useDueSummary();

  const skills = ['alphabet', ...course.guides.map((g) => `guide:${g.id}`), ...CASES.map((c) => `case:${c}`), ...VERB_TOPICS.map((t) => `verb:${t}`)];
  const mastery = computeAllMastery(skills, attempts ?? []);
  const allGoals = course.units.flatMap((u) => u.canDo);
  const goalsDone = allGoals.filter((g) => goals.get(g.id)?.completedAt).length;
  const allLessons = course.units.flatMap((u) => u.lessonList);
  const lessonsDone = allLessons.filter((l) => lessons.get(l.id)?.completedAt).length;

  return (
    <>
      <PageHeader title="What you can do" subtitle="Progress here is measured by what you can actually do and how accurately you answer, not by time spent." />

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Can-do goals</h2>
        <p className="mb-4 text-sm text-stone-600">
          {goalsDone} of {allGoals.length} goals completed in unit checks · {lessonsDone} of {allLessons.length} lessons practised
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {course.units.map((u) => (
            <div key={u.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <Link to={`/units/${u.id}`} className="font-semibold hover:underline">{u.number}. {u.title}</Link>
                <Link to={`/units/${u.id}/check`} className="shrink-0 text-xs text-vltava underline">unit check</Link>
              </div>
              <div className="text-sm"><GoalList goals={u.canDo} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Reviews</h2>
        {due && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-stone-200 bg-white p-4">
            <Stat n={due.dueNow} label="due now" />
            <Stat n={due.dueToday} label="due today" />
            <Stat n={due.dueThisWeek} label="due this week" />
            <Stat n={due.total} label="items in total" />
            <div className="ml-auto text-sm">
              {due.dueNow > 0 ? (
                <Link to="/review" className="btn btn-primary">Review now</Link>
              ) : due.nextDue ? (
                <span className="text-stone-600">Next item due {relativeTime(due.nextDue)}</span>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">Alphabet and pronunciation</h2>
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
          <MasteryRow label="Letters, sounds and spelling" href="/alphabet?tab=practice" m={mastery.get('alphabet')!} />
        </ul>
      </section>

      {course.guides.some((g) => g.practice.length > 0) && (
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Guides</h2>
          <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
            {course.guides.filter((g) => g.practice.length > 0).map((g) => (
              <MasteryRow key={g.id} label={g.title} href={`/guides/${g.id}?tab=practice`} m={mastery.get(`guide:${g.id}`)!} />
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-1 text-lg font-semibold">The seven cases</h2>
        <MasteryNote />
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {CASES.map((c, i) => (
            <MasteryRow key={c} label={`${CASE_INFO[c].number}. ${c[0]!.toUpperCase()}${c.slice(1)}`} href={`/grammar/${c}`} m={mastery.get(`case:${c}`)!} dot={CASE_BG[CASE_KEYS[i]!]} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Verb topics</h2>
        <MasteryNote />
        <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {VERB_TOPICS.map((t) => {
            const page = course.grammarBySkill.get(`verb:${t}`);
            return <MasteryRow key={t} label={page?.title.split(':')[0] ?? t} href={page ? `/verbs/${page.id}` : undefined} m={mastery.get(`verb:${t}`)!} />;
          })}
        </ul>
      </section>
    </>
  );
}

function MasteryNote() {
  return (
    <p className="mb-3 text-sm text-stone-600">
      Based on your last {MASTERY_WINDOW} answers that use each topic. "Mastered" means at least {MASTERY_MIN_ATTEMPTS} answers with {Math.round(MASTERY_ACCURACY * 100)}% or more right.
    </p>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums">{n}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}
