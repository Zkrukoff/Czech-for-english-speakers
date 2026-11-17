import { Link, Navigate, useParams } from 'react-router-dom';
import { course } from '@/content';
import { NotFound } from '@/components/NotFound';
import { PageHeader } from '@/components/PageHeader';
import { EnamelPlate, LineBadge, TileGrid } from '@/components/ui';
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
      <PageHeader
        eyebrow={`Linka ${stop.line} · ${lineData.levels.join('–')} · station ${stop.position} of ${lineData.stops.length}`}
        title={info.name}
        subtitle={info.aboveGround}
      />
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <LineBadge line={stop.line} />
        {stop.transfers.map((t) => (
          <span key={t} className="chip">
            Přestup · change to <LineBadge line={t} size={24} />
          </span>
        ))}
      </div>
      <TileGrid tone={`var(--tile-${info.tile})`} cols={8} rows={2} size={32} className="mb-8 w-full border-2 border-ink" />
      {stop.kind === 'pronunciation' && (
        <section className="card p-6">
          <EnamelPlate tone="blue">Výslovnost · pronunciation</EnamelPlate>
          <p className="mt-4 text-ink-2">The first stop: Czech sounds and letters, so everything after it reads the way it's written.</p>
          <Link to="/alphabet" className="btn btn-primary mt-5">Start with the alphabet</Link>
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
