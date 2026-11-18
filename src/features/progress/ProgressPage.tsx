import { unitPath, unitCheckPath } from '@/lib/paths';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { CASES, CASE_INFO, CASE_KEYS, VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { GoalList } from '@/components/GoalList';
import { CASE_BG } from '@/components/caseColors';
import { db } from '@/db/db';
import { useGoalProgress, useLessonProgress, useStamps } from '@/db/hooks';
import { LineBadge, Stamp, Ticket } from '@/components/ui';
import { useDueSummary } from '@/db/useDue';
import { computeAllMastery, MASTERY_ACCURACY, MASTERY_MIN_ATTEMPTS, MASTERY_WINDOW, type SkillMastery } from '@/lib/progress/mastery';
import { relativeTime } from '@/lib/time';
import { StationWall } from '@/features/wall/StationWall';
import { useWall } from '@/features/wall/useWall';

function WallSection() {
  const blocks = useWall();
  return (
    <section id="wall" aria-labelledby="wall-h" className="mb-12">
      <h2 id="wall-h" className="label-board mb-1 text-ink-3"><span lang="cs">Tvoje stěna</span> · your wall</h2>
      <p className="mb-4 max-w-2xl text-ink-2">Line A as a wall of panels in each station's colour. Every lesson you finish fills a circle; a stamped station gets a red frame.</p>
      {blocks && <StationWall blocks={blocks} />}
    </section>
  );
}

const STATUS_LABEL = { 'not-started': 'not started', learning: 'practising', mastered: 'mastered' } as const;
const STATUS_STYLE = {
  'not-started': 'bg-paper-2 text-ink-3',
  learning: 'bg-champagne-tint text-ink',
  mastered: 'bg-paper-2 text-ink',
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
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2" role="img" aria-label={`${Math.round(m.accuracy * 100)}% of recent answers right`}>
          <span className={`block h-full ${m.status === 'mastered' ? 'bg-ink' : 'bg-champagne'}`} style={{ width: `${m.accuracy * 100}%` }} />
        </span>
        <span className="w-32 text-right text-xs text-ink-3">
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
  const stampsList = useStamps() ?? [];
  const missionCount = stampsList.filter((x) => x.kind === 'mission').length;

  const skills = ['alphabet', ...course.guides.map((g) => `guide:${g.id}`), ...CASES.map((c) => `case:${c}`), ...VERB_TOPICS.map((t) => `verb:${t}`)];
  const mastery = computeAllMastery(skills, attempts ?? []);
  const allGoals = course.units.flatMap((u) => u.canDo);
  const goalsDone = allGoals.filter((g) => goals.get(g.id)?.completedAt).length;
  const allLessons = course.units.flatMap((u) => u.lessonList);
  const lessonsDone = allLessons.filter((l) => lessons.get(l.id)?.completedAt).length;

  return (
    <>
      <PageHeader title="Ticket wallet" cs="Jízdenky" subtitle="Every finished station gets its ticket stamped. Progress here is what you can do, not how many days in a row you opened the app." />

      <WallSection />

      <dl className="mb-10 grid grid-cols-2 border-2 border-ink bg-surface shadow-offset sm:grid-cols-4">
        {[
          [stampsList.filter((x) => x.kind === 'unit').length, 'stations stamped', 'Stanice'],
          [lessonsDone, `of ${allLessons.length} lessons`, 'Lekce'],
          [goalsDone, `of ${allGoals.length} goals`, 'Cíle'],
          [missionCount, 'missions done', 'Mise'],
        ].map(([n, label, cs], i) => (
          <div key={i} className={`p-4 ${i % 2 ? 'border-l-2' : ''} ${i >= 2 ? 'border-t-2 sm:border-t-0' : ''} ${i === 2 ? 'sm:border-l-2' : ''} border-ink`}>
            <dt className="label-board text-ink-3" lang="cs">{cs}</dt>
            <dd className="mt-1 font-display text-4xl font-extrabold tabular-nums">
              {n} <span className="block font-ui text-sm font-normal text-ink-2">{label}</span>
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="tickets-h" className="mb-12">
        <h2 id="tickets-h" className="label-board mb-4 text-ink-3">Linka A · stations</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {course.units.map((u) => {
            const stop = course.stopByUnit.get(u.id)!;
            const st = stampsList.find((x) => x.id === `unit:${u.id}`);
            return (
              <li key={u.id}>
                <Link to={unitPath(u.id)} className="block transition-transform hover:-translate-y-0.5">
                  <Ticket
                    line={<LineBadge line={stop.line} size={22} />}
                    title={stop.stationInfo.name}
                    from={`Unit ${u.number} · ${u.title}`}
                    date={st ? new Date(st.at).toLocaleDateString('cs-CZ') : 'neoznačeno · not stamped yet'}
                    tone={st ? 'var(--ticket)' : 'var(--ticket-void)'}
                    stamp={st ? <Stamp main={`U${String(u.number).padStart(2, '0')}`} bottom={new Date(st.at).toLocaleDateString('cs-CZ')} size={84} animate={false} /> : undefined}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="missions-h" className="mb-12">
        <h2 id="missions-h" className="label-board mb-4 text-ink-3">Mise · missions</h2>
        {missionCount === 0 ? (
          <p className="border-2 border-dashed border-rule-strong p-4 text-ink-2">
            <span lang="cs">Zatím nic.</span> Each station has a real-world mission, like ordering a coffee in Czech start to finish. Tick it off on the station page and it lands here.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-4">
            {stampsList.filter((x) => x.kind === 'mission').map((m) => {
              const info = course.missionsById.get(m.refId);
              return (
                <li key={m.id} className="flex w-40 flex-col items-center text-center">
                  <Stamp main="MISE" bottom={new Date(m.at).toLocaleDateString('cs-CZ')} size={88} colour="var(--stamp-blue)" animate={false} />
                  <span className="mt-1 text-sm font-semibold">{info?.mission.title ?? m.refId}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-1 text-2xl font-extrabold">Can-do goals</h2>
        <p className="mb-4 text-sm text-ink-2">
          {goalsDone} of {allGoals.length} goals completed in unit checks · {lessonsDone} of {allLessons.length} lessons practised
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {course.units.map((u) => (
            <div key={u.id} className="rounded-md border-2 border-ink bg-surface p-4">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <Link to={unitPath(u.id)} className="font-semibold hover:underline">{u.number}. {u.title}</Link>
                <Link to={unitCheckPath(u.id)} className="shrink-0 text-xs text-vltava underline">unit check</Link>
              </div>
              <div className="text-sm"><GoalList goals={u.canDo} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-2xl font-extrabold">Reviews</h2>
        {due && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-md border-2 border-ink bg-surface p-4">
            <Stat n={due.dueNow} label="due now" />
            <Stat n={due.dueToday} label="due today" />
            <Stat n={due.dueThisWeek} label="due this week" />
            <Stat n={due.total} label="items in total" />
            <div className="ml-auto text-sm">
              {due.dueNow > 0 ? (
                <Link to="/review" className="btn btn-primary">Review now</Link>
              ) : due.nextDue ? (
                <span className="text-ink-2">Next item due {relativeTime(due.nextDue)}</span>
              ) : null}
            </div>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-2 text-2xl font-extrabold">Alphabet and pronunciation</h2>
        <ul className="divide-y divide-rule overflow-hidden rounded-md border-2 border-ink bg-surface">
          <MasteryRow label="Letters, sounds and spelling" href="/alphabet?tab=practice" m={mastery.get('alphabet')!} />
        </ul>
      </section>

      {course.guides.some((g) => g.practice.length > 0) && (
        <section className="mb-10">
          <h2 className="mb-2 text-2xl font-extrabold">Guides</h2>
          <ul className="divide-y divide-rule overflow-hidden rounded-md border-2 border-ink bg-surface">
            {course.guides.filter((g) => g.practice.length > 0).map((g) => (
              <MasteryRow key={g.id} label={g.title} href={`/guides/${g.id}?tab=practice`} m={mastery.get(`guide:${g.id}`)!} />
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-2 text-2xl font-extrabold">The seven cases</h2>
        <MasteryNote />
        <ul className="divide-y divide-rule overflow-hidden rounded-md border-2 border-ink bg-surface">
          {CASES.map((c, i) => (
            <MasteryRow key={c} label={`${CASE_INFO[c].number}. ${c[0]!.toUpperCase()}${c.slice(1)}`} href={`/grammar/${c}`} m={mastery.get(`case:${c}`)!} dot={CASE_BG[CASE_KEYS[i]!]} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-2xl font-extrabold">Verb topics</h2>
        <MasteryNote />
        <ul className="divide-y divide-rule overflow-hidden rounded-md border-2 border-ink bg-surface">
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
    <p className="mb-3 text-sm text-ink-2">
      Based on your last {MASTERY_WINDOW} answers that use each topic. "Mastered" means at least {MASTERY_MIN_ATTEMPTS} answers with {Math.round(MASTERY_ACCURACY * 100)}% or more right.
    </p>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold tabular-nums">{n}</div>
      <div className="text-xs text-ink-3">{label}</div>
    </div>
  );
}
