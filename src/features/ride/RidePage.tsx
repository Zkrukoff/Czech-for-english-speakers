import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { LineBadge, Stamp } from '@/components/ui';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { useLessonAnswerHandler } from '@/features/lessons/useLessonAnswerHandler';
import { scheduleAnswer } from '@/db/srs';
import { updateSettings, useSettings } from '@/db/settings';
import { useProfile } from '@/db/hooks';
import { routeBetween, SECONDS_PER_STOP } from '@/lib/ride';
import { compareCs } from '@/lib/text';
import { buildRide, usePerStop, type RideItem } from './buildRide';

/** All stations, once each, alphabetically, with their lines. */
function useStations() {
  return useMemo(() => {
    const m = new Map<string, { slug: string; name: string; lines: string[] }>();
    for (const l of course.lines) for (const s of l.stops) {
      const e = m.get(s.slug) ?? { slug: s.slug, name: s.stationInfo.name, lines: [] };
      e.lines.push(l.id);
      m.set(s.slug, e);
    }
    return [...m.values()].sort((a, b) => compareCs(a.name, b.name));
  }, []);
}

type Phase = { kind: 'plan' } | { kind: 'riding'; items: RideItem[]; run: number } | { kind: 'done'; right: number; total: number };

/** Today's ride: a practice session as long as your commute, measured in stops. */
export function RidePage() {
  const settings = useSettings();
  const profile = useProfile();
  const stations = useStations();
  const perStop = usePerStop();
  const onLessonAnswer = useLessonAnswerHandler();
  const [phase, setPhase] = useState<Phase>({ kind: 'plan' });
  const homeSlug = profile?.homeStation?.split('/')[1];
  const from = settings.rideFrom ?? homeSlug ?? '';
  const to = settings.rideTo ?? '';
  const route = from && to ? routeBetween(course.lines, from, to) : null;
  const total = route ? Math.max(1, route.stops) * perStop : 0;
  const notes = new Map(course.lines.flatMap((l) => l.stops).filter((x) => x.stationInfo.status).map((x) => [x.stationInfo.name, `${x.stationInfo.status!.note} (checked ${x.stationInfo.status!.checked})`]));
  const select = 'mt-1 block min-h-11 w-full rounded-sm border-2 border-ink bg-surface px-3';

  async function start() {
    const items = await buildRide(total);
    setPhase({ kind: 'riding', items, run: Date.now() });
  }

  if (phase.kind === 'riding' && route) {
    const keyOf = new Map(phase.items.map((i) => [i.exercise, i.reviewKey]));
    return (
      <>
        <PageHeader title="Today's ride" cs="Dnešní jízda" subtitle={`${route.stations[0]} → ${route.stations.at(-1)} · ${route.stops} stops`} />
        <ExerciseRunner
          key={phase.run}
          exercises={phase.items.map((i) => i.exercise)}
          context="review"
          retryMissed={false}
          route={route.stations}
          itemKeyOf={(ex) => keyOf.get(ex) ?? `ex:${ex.id}`}
          onAnswer={async (o: ExerciseOutcome) => {
            const key = keyOf.get(o.exercise);
            if (key) await scheduleAnswer(key, o.exercise.skills, o.result.status);
            else await onLessonAnswer(o);
          }}
          onFinish={(o) => setPhase({ kind: 'done', right: o.filter((x) => x.result.accepted).length, total: o.length })}
        />
      </>
    );
  }

  if (phase.kind === 'done' && route) {
    return (
      <>
        <PageHeader title="You've arrived" cs={`Konečná: ${route.stations.at(-1)}. Vystupujte, prosím.`} />
        <div className="flex flex-wrap items-center gap-6 border-2 border-ink bg-surface p-6 shadow-offset">
          <Stamp main={`${route.stops}`} top="JÍZDA" bottom="ZASTÁVEK" size={104} />
          <div>
            <p className="text-lg"><b>{phase.right} of {phase.total}</b> right on the way.</p>
            <p className="mt-1 text-ink-2">Same time tomorrow?</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/" className="btn btn-primary">Home</Link>
              <button type="button" className="btn btn-secondary" onClick={() => setPhase({ kind: 'plan' })}>Ride again</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Today's ride"
        cs="Dnešní jízda"
        subtitle="Practise for as long as your commute: pick where you get on and off, and the session is that many stops long. One stop is about two minutes."
      />
      <div className="grid gap-8 md:grid-cols-[22rem_1fr]">
        <form className="space-y-4 self-start border-2 border-ink bg-surface p-5 shadow-offset" onSubmit={(e) => { e.preventDefault(); if (route?.stops) void start(); }}>
          <label className="block">
            <span className="font-semibold">From</span> <span lang="cs" className="text-ink-3">· nástup</span>
            <select lang="cs" className={select} value={from} onChange={(e) => updateSettings({ rideFrom: e.target.value || undefined })}>
              <option value="">Choose a station</option>
              {stations.map((s) => <option key={s.slug} value={s.slug}>{s.name} ({s.lines.join(', ')})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-semibold">To</span> <span lang="cs" className="text-ink-3">· výstup</span>
            <select lang="cs" className={select} value={to} onChange={(e) => updateSettings({ rideTo: e.target.value || undefined })}>
              <option value="">Choose a station</option>
              {stations.map((s) => <option key={s.slug} value={s.slug}>{s.name} ({s.lines.join(', ')})</option>)}
            </select>
          </label>
          {from && to && (
            <button type="button" className="btn btn-quiet text-sm" onClick={() => updateSettings({ rideFrom: to, rideTo: from })}>
              ⇅ Swap (the way home)
            </button>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={!route || route.stops === 0}>
            <span lang="cs">Jedeme</span> · start the ride
          </button>
          <p className="text-xs text-ink-3">
            {perStop} exercises per stop, from your own pace. The metro map comes from PID open data.
          </p>
        </form>

        <div aria-live="polite">
          {!route ? (
            <p className="border-2 border-dashed border-rule-strong p-5 text-ink-2">Pick two stations to plan your ride. Your home station is filled in if you set one.</p>
          ) : route.stops === 0 ? (
            <p className="border-2 border-dashed border-rule-strong p-5 text-ink-2"><span lang="cs">To není žádná jízda.</span> Same station twice: pick somewhere to go.</p>
          ) : (
            <section aria-labelledby="route-h" className="border-2 border-ink bg-surface p-5">
              <h2 id="route-h" className="flex flex-wrap items-center gap-2 text-2xl font-extrabold">
                {route.lines.map((l) => <LineBadge key={l} line={l as 'A'} size={30} />)} {route.stops} stops
              </h2>
              <p className="mt-1 text-ink-2">
                ≈ {total} exercises · about {Math.round((route.stops * SECONDS_PER_STOP) / 60)} minutes
                {route.changes.length > 0 && <> · change at <span lang="cs">{route.changes.join(', ')}</span></>}
              </p>
              {route.stations.some((n) => notes.has(n)) && (
                <p className="mt-3 border-l-4 border-champagne bg-champagne-tint px-3 py-2 text-sm text-ink">
                  Service note for {route.stations.filter((n) => notes.has(n)).join(', ')}: {route.stations.map((n) => notes.get(n)).find(Boolean)}
                </p>
              )}
              <ol className="mt-4 space-y-1" lang="cs">
                {route.stations.map((s, i) => (
                  <li key={`${s}-${i}`} className="flex items-center gap-3">
                    <span aria-hidden className={`h-3 w-3 rounded-full border-2 border-ink ${i === 0 || i === route.stations.length - 1 ? 'bg-ink' : 'bg-surface'}`} />
                    <span className={i === 0 || i === route.stations.length - 1 ? 'font-semibold' : 'text-ink-2'}>{s}</span>
                    {route.changes.includes(s) && i > 0 && <span className="label-board text-2xs text-ink-3">přestup</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
