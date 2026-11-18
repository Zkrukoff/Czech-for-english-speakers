import { Link } from 'react-router-dom';
import { course } from '@/content';
import { NotFound } from '@/components/NotFound';
import { GoalList } from '@/components/GoalList';
import { useLessonProgress, useMissions, useStamps } from '@/db/hooks';
import { completeMission, undoMission } from '@/db/wallet';
import { IconArrowRight, IconDone, IconTerminus } from '@/components/icons';
import { Card, EnamelPlate, Stamp } from '@/components/ui';
import { StationHeader } from '@/features/line/StationHeader';
import { useRouteUnit } from './useRouteUnit';
import { unitCheckPath } from '@/lib/paths';
import { usePerStop } from '@/features/ride/buildRide';

const LINE_BG = { A: 'bg-line-a', B: 'bg-line-b', C: 'bg-line-c' } as const;

/** A unit station: its lessons as stops along the line, the check as the terminus, and its missions. */
export function UnitPage() {
  const unit = useRouteUnit();
  const lessons = useLessonProgress();
  const missions = useMissions();
  const stamps = useStamps();
  const perStop = usePerStop();
  if (!unit) return <NotFound what="unit" />;
  const stop = course.stopByUnit.get(unit.id)!;
  const stamped = stamps?.find((s) => s.id === `unit:${unit.id}`);
  const lineBg = LINE_BG[stop.line];

  return (
    <>
      <StationHeader stop={stop} kicker={`Unit ${unit.number}`} />
      <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight">{unit.title}</h2>
          {unit.titleCs && <p lang="cs" className="text-lg text-ink-3">{unit.titleCs}</p>}
          <p className="mt-3 text-ink-2">{unit.situation}</p>
        </div>
        {stamped && <Stamp main={`U${String(unit.number).padStart(2, '0')}`} bottom={new Date(stamped.at).toLocaleDateString('cs-CZ')} size={104} animate={false} />}
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_20rem]">
        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="label-board mb-4 text-ink-3">Zastávky · lessons</h2>
          <ol className="relative">
            <span aria-hidden className={`absolute bottom-8 left-[19px] top-8 w-2 ${lineBg}`} />
            {unit.lessonList.map((l) => {
              const done = !!lessons.get(l.id)?.completedAt;
              return (
                <li key={l.id} className="relative mb-3">
                  <Link to={`/lessons/${l.id}`} className="group flex items-center gap-4">
                    <span className={`relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-mono text-sm font-bold ${done ? 'bg-ink text-paper' : 'bg-surface text-ink'}`}>
                      {done ? <IconDone size={22} /> : String(l.number).padStart(2, '0')}
                    </span>
                    <span className="card card-link flex flex-1 items-center justify-between gap-3 px-4 py-3">
                      <span>
                        <span className="text-lg font-semibold text-ink">{l.title}</span>
                        <span className="block text-sm text-ink-3">
                          {done ? 'Hotovo · practised · ' : ''}≈ {Math.max(1, Math.round(l.exercises.length / perStop))} stops
                        </span>
                      </span>
                      <IconArrowRight size={18} className="shrink-0 text-ink-3 group-hover:text-ink" />
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className="relative">
              <Link to={unitCheckPath(unit.id)} className="group flex items-center gap-4">
                <span className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-board text-line-b">
                  <IconTerminus size={22} />
                </span>
                <span className="board flex flex-1 items-center justify-between gap-3 rounded-md border-2 border-ink px-4 py-3">
                  <span>
                    <span className="label-board block text-line-b" lang="cs">Kontrola</span>
                    <span className="text-lg font-semibold">What can you do now?</span>
                  </span>
                  <IconArrowRight size={18} />
                </span>
              </Link>
            </li>
          </ol>
        </section>

        <aside className="space-y-6 self-start">
          <Card corner="tr">
            <div className="p-5">
              <h2 className="label-board mb-3 text-ink-3">By the end of this station</h2>
              <GoalList goals={unit.canDo} />
            </div>
          </Card>
          {unit.missions.map((m) => {
            const done = missions.get(m.id);
            return (
              <section key={m.id} aria-labelledby={`${m.id}-h`} className="border-2 border-dashed border-ink bg-champagne-tint p-5">
                <EnamelPlate tone="red" size="sm">Mise</EnamelPlate>
                <h3 id={`${m.id}-h`} className="mt-3 text-xl font-bold">{m.title}</h3>
                <p className="mt-1 text-ink-2">{m.task}</p>
                {m.phrases.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {m.phrases.map((p) => (
                      <li key={p.cs}>
                        <b lang="cs">{p.cs}</b> <span className="text-ink-2">{p.en}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {m.ifStuck && <p className="mt-3 text-sm text-ink-2"><span className="font-semibold">If you get stuck:</span> {m.ifStuck}</p>}
                <div className="mt-4 flex items-center gap-3">
                  {done ? (
                    <>
                      <Stamp main="MISE" bottom={new Date(done.doneAt).toLocaleDateString('cs-CZ')} size={64} colour="var(--stamp-blue)" />
                      <button type="button" className="btn btn-quiet text-sm" onClick={() => undoMission(m.id)}>Undo</button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={() => completeMission(m.id, unit.id)}>
                      <span lang="cs">Zvládnuto</span> · I did it
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </aside>
      </div>
    </>
  );
}
