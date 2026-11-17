import { Link, Navigate, useParams } from 'react-router-dom';
import { course } from '@/content';
import { NotFound } from '@/components/NotFound';
import { EnamelPlate } from '@/components/ui';
import { StationHeader } from './StationHeader';
import { UnitPage } from '@/features/lessons/UnitPage';
import { stationPath } from '@/lib/paths';

/**
 * A station on the course map. Unit stations show the unit; the others get a
 * simple station screen. (Phase 4 redesigns all of these.)
 */
export function StationPage() {
  const { line = '', station = '' } = useParams();
  const stop = course.stopsByKey.get(`${line.toUpperCase()}/${station}`);
  if (!stop) return <NotFound what="station" />;
  if (line !== stop.line) return <Navigate to={stationPath(stop)} replace />;
  if (stop.kind === 'unit') return <UnitPage />;

  const lineData = course.lines.find((l) => l.id === stop.line)!;
  const milestone = stop.kind === 'milestone' ? course.milestones.find((m) => m.id === stop.milestone.id) : undefined;
  const info = stop.stationInfo;
  return (
    <>
      <StationHeader stop={stop} />
      {stop.kind === 'pronunciation' && (
        <section className="card p-6">
          <EnamelPlate tone="blue">Výslovnost · pronunciation</EnamelPlate>
          <p className="mt-4 max-w-2xl text-ink-2">
            The first stop: the sounds English doesn't have (<b lang="cs">ř, ch, ů</b>, the long vowels), stress on the first syllable, and
            words with no vowels at all (<i lang="cs">strč prst skrz krk</i>). Then everything after it reads the way it's written.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-ink-2">
            <li>· The alphabet: every letter, its name and its sound</li>
            <li>· <i>Hard sounds, out loud</i>: record yourself and compare</li>
            <li>· <i>Hear the difference</i>: minimal pairs like <span lang="cs">rada / řada</span>, <span lang="cs">pas / pás</span></li>
          </ul>
          {course.hiddenExercises.length > 0 && (
            <p className="mt-4 text-sm text-ink-3">
              {course.hiddenExercises.length} listening exercises are waiting for native-speaker recordings and appear as soon as they're added. Core sounds never use a synthetic voice.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/alphabet" className="btn btn-primary">The alphabet</Link>
            <Link to="/alphabet?tab=practice" className="btn btn-secondary">Practise the sounds</Link>
          </div>
        </section>
      )}
      {milestone && stop.kind === 'milestone' && (
        <section className="card p-6">
          <EnamelPlate tone="red">{milestone.name} · {milestone.en}</EnamelPlate>
          <p className="mt-4 text-ink-2">{milestone.summary}</p>
          <p className="mt-2 text-sm text-ink-3">
            Here: {stop.milestone.part === 'review' ? 'a review of everything so far' : `the ${stop.milestone.level} can-do check`}. This screen arrives with the redesign.
          </p>
        </section>
      )}
      {stop.kind === 'planned' && (
        <section className="card p-6">
          <EnamelPlate tone="paper">Výluka · closed for works</EnamelPlate>
          <p className="mt-4 text-ink-2">
            {lineData.service === 'in-service'
              ? "This station's lessons are still being written. The train runs straight through for now."
              : `Line ${stop.line} (${lineData.levels.join('–')}) isn't in service yet.`}
          </p>
        </section>
      )}
      {info.status && <p className="mt-6 text-sm text-ink-3">Service note ({info.status.checked}): {info.status.note}</p>}
    </>
  );
}
