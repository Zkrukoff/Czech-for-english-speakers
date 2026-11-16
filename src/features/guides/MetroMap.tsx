import { useMemo, useState } from 'react';
import type { MetroData } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';

/**
 * Schematic map of the Prague metro. Station order and names come from the
 * content (guide.json → metro); this file only holds the drawing: where each
 * station sits on the diagram and which way its label points. A test checks
 * that every station in the content has a position here.
 */

type Pt = [number, number];
type LabelSide = 'left' | 'right' | 'up' | 'down';

export const POSITIONS: Record<string, Pt> = {};
const SIDES: Record<string, LabelSide> = {};

function run(names: string[], start: Pt, step: Pt, side: LabelSide) {
  names.forEach((n, i) => {
    POSITIONS[n] ??= [start[0] + step[0] * i, start[1] + step[1] * i];
    SIDES[n] ??= side;
  });
}

// The central triangle: Můstek (A/B), Muzeum (A/C), Florenc (B/C).
SIDES['Můstek'] = 'left';
SIDES['Muzeum'] = 'right';
SIDES['Florenc'] = 'right';
SIDES['Náměstí Republiky'] = 'left';
SIDES['Hlavní nádraží'] = 'right';
POSITIONS['Náměstí Republiky'] = [600, 400];
POSITIONS['Hlavní nádraží'] = [640, 440];
// Line A
run(['Nemocnice Motol', 'Petřiny', 'Nádraží Veleslavín', 'Bořislavka', 'Dejvická'], [200, 280], [50, 0], 'up');
run(['Hradčanská', 'Malostranská', 'Staroměstská', 'Můstek'], [440, 320], [40, 40], 'left');
run(['Muzeum', 'Náměstí Míru', 'Jiřího z Poděbrad', 'Flora', 'Želivského', 'Strašnická', 'Skalka', 'Depo Hostivař'], [640, 520], [60, 0], 'up');
// Line B
run(['Zličín', 'Stodůlky', 'Luka', 'Lužiny', 'Hůrka', 'Nové Butovice', 'Jinonice', 'Radlická', 'Smíchovské nádraží'], [40, 600], [45, 0], 'down');
run(['Anděl', 'Karlovo náměstí', 'Národní třída'], [440, 560], [40, -40], 'left');
run(['Florenc', 'Křižíkova', 'Invalidovna'], [640, 360], [40, -40], 'right');
run(['Palmovka', 'Českomoravská', 'Vysočanská', 'Kolbenova', 'Hloubětín', 'Rajská zahrada', 'Černý Most'], [760, 240], [60, 0], 'up');
// Line C
run(['Letňany', 'Prosek', 'Střížkov', 'Ládví', 'Kobylisy', 'Nádraží Holešovice', 'Vltavská'], [640, 80], [0, 40], 'left');
run(['I. P. Pavlova', 'Vyšehrad', 'Pražského povstání', 'Pankrác', 'Budějovická', 'Kačerov', 'Roztyly', 'Chodov', 'Opatov', 'Háje'], [640, 560], [0, 40], 'right');

function labelProps(name: string): { x: number; y: number; anchor: 'start' | 'end'; rotate?: number } {
  const [x, y] = POSITIONS[name]!;
  switch (SIDES[name]) {
    case 'left':
      return { x: x - 12, y: y + (name === 'Náměstí Republiky' ? -10 : name === 'Staroměstská' ? 12 : 4), anchor: 'end' };
    case 'right':
      return { x: x + 12, y: y + (name === 'Muzeum' ? 24 : 5), anchor: 'start' };
    case 'up':
      return { x: x + 4, y: y - 12, anchor: 'start', rotate: -35 };
    case 'down':
      return { x: x + 4, y: y + 16, anchor: 'start', rotate: 35 };
    default:
      return { x: x + 12, y: y + 4, anchor: 'start' };
  }
}

const TEXT_ON: Record<string, string> = { A: '#ffffff', B: '#1c1917', C: '#ffffff' };

export function MetroMap({ metro }: { metro: MetroData }) {
  const [selected, setSelected] = useState<string>('Můstek');

  const linesAt = useMemo(() => {
    const m = new Map<string, ('A' | 'B' | 'C')[]>();
    for (const l of metro.lines) for (const s of l.stations) m.set(s, [...(m.get(s) ?? []), l.id]);
    return m;
  }, [metro]);

  const stations = [...linesAt.keys()];
  const sel = linesAt.has(selected) ? selected : stations[0]!;
  const selLines = linesAt.get(sel) ?? [];
  const lineById = new Map(metro.lines.map((l) => [l.id, l]));

  return (
    <div className="not-prose my-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="card overflow-x-auto p-2">
          <svg
            viewBox="0 30 1270 940"
            className="h-auto w-full min-w-[720px]"
            role="group"
            aria-label="Map of the Prague metro: lines A (green), B (yellow) and C (red)"
          >
            {/* Lines */}
            {metro.lines.map((l) => (
              <polyline
                key={l.id}
                points={l.stations.map((s) => POSITIONS[s]!.join(',')).join(' ')}
                fill="none"
                stroke={l.colour}
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {/* Line badges at each end */}
            {metro.lines.flatMap((l) =>
              [l.stations[0]!, l.stations[l.stations.length - 1]!].map((end, i) => {
                const [x, y] = POSITIONS[end]!;
                const [nx, ny] = POSITIONS[l.stations[i === 0 ? 1 : l.stations.length - 2]!]!;
                const len = Math.hypot(x - nx, y - ny);
                const bx = x + ((x - nx) / len) * 30;
                const by = y + ((y - ny) / len) * 30;
                return (
                  <g key={`${l.id}-${i}`} aria-hidden>
                    <circle cx={bx} cy={by} r={15} fill={l.colour} />
                    <text x={bx} y={by + 6} textAnchor="middle" fontSize={17} fontWeight={800} fill={TEXT_ON[l.id]} className="font-display">
                      {l.id}
                    </text>
                  </g>
                );
              }),
            )}
            {/* Stations */}
            {stations.map((name) => {
              const [x, y] = POSITIONS[name]!;
              const ls = linesAt.get(name)!;
              const transfer = ls.length > 1;
              const isSel = name === sel;
              const label = labelProps(name);
              return (
                <g
                  key={name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${name}, line${transfer ? 's' : ''} ${ls.join(' and ')}`}
                  aria-pressed={isSel}
                  onClick={() => setSelected(name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(name);
                    }
                  }}
                  className="group cursor-pointer outline-none"
                >
                  <circle cx={x} cy={y} r={18} fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={transfer ? 10 : 6.5}
                    className={`transition-all ${isSel ? 'fill-stone-900 stroke-stone-900' : 'fill-white stroke-stone-900 group-hover:fill-stone-300 group-focus-visible:fill-sky-300'}`}
                    strokeWidth={transfer ? 4 : 3}
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.anchor}
                    transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
                    fontSize={transfer ? 17 : 14.5}
                    fontWeight={transfer || isSel ? 700 : 500}
                    lang="cs"
                    className={`fill-stone-800 stroke-stone-50 [paint-order:stroke] ${isSel ? 'fill-stone-950' : ''}`}
                    strokeWidth={4}
                    strokeLinejoin="round"
                  >
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside aria-live="polite" className="card self-start p-5 lg:sticky lg:top-24">
          <p className="eyebrow">Station</p>
          <div className="mt-1 flex items-center gap-1">
            <h3 lang="cs" className="font-serif text-2xl font-semibold text-stone-900">{sel}</h3>
            <SpeakButton text={sel} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selLines.map((id) => {
              const l = lineById.get(id)!;
              return (
                <span key={id} className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold" style={{ background: l.colour, color: TEXT_ON[id] }}>
                  Line {id} <span className="font-normal opacity-80" lang="cs">{l.nickname}</span>
                </span>
              );
            })}
          </div>
          {selLines.length > 1 && <p className="mt-3 text-sm text-stone-700">Change here between lines {selLines.join(' and ')}.</p>}
          {selLines.map((id) => {
            const l = lineById.get(id)!;
            const first = l.stations[0]!;
            const last = l.stations[l.stations.length - 1]!;
            return (
              <p key={id} className="mt-2 text-sm text-stone-600">
                Line {id} runs <span lang="cs">směr {first}</span> or <span lang="cs">směr {last}</span>.
              </p>
            );
          })}
          {metro.notes[sel] && <p className="mt-3 rounded-lg bg-cream p-3 text-stone-800">{metro.notes[sel]}</p>}
          <p className="mt-3 text-sm text-stone-500">
            "Get off at {sel}": <span lang="cs" className="text-stone-800">Vystupte na stanici {sel}.</span>
          </p>
        </aside>
      </div>

      {metro.underConstruction && <p className="mt-3 text-sm text-stone-600">{metro.underConstruction}</p>}

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-stone-700">All stations, line by line</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {metro.lines.map((l) => (
            <div key={l.id}>
              <p className="mb-1 font-bold" style={{ color: l.id === 'B' ? undefined : l.colour }}>
                Line {l.id} ({l.nickname})
              </p>
              <ol className="list-decimal pl-5 text-stone-700" lang="cs">
                {l.stations.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => setSelected(s)} className="text-left hover:underline">
                      {s}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
