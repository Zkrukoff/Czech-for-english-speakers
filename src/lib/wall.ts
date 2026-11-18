import type { Course } from '@/content/loader';

/** One circle on the wall: a lesson (or a milestone part, or the pronunciation stop). */
export type Cell = 'done' | 'started' | 'empty';

export interface WallBlock {
  slug: string;
  name: string;
  /** Station tile token number, "01"…"24". */
  tile: string;
  kind: 'pronunciation' | 'unit' | 'milestone';
  cells: Cell[];
  /** The station's stamp is in the wallet. */
  stamped: boolean;
}

export interface WallInput {
  /** lessonId → progress. */
  lessons: Map<string, { completedAt?: number; stepsDone: string[] }>;
  /** Stamp ids, e.g. "unit:u01", "milestone:vaclavak:check". */
  stamps: Set<string>;
  /** Any pronunciation practice answered. */
  alphabetPractised: boolean;
}

/**
 * Line A as a wall: a block per built station, one circle per lesson. Circles
 * fill as you practise, so the wall grows every session, not once a station.
 */
export function buildWall(course: Pick<Course, 'lines' | 'lessonsById'>, input: WallInput, lineId = 'A'): WallBlock[] {
  const line = course.lines.find((l) => l.id === lineId);
  if (!line) return [];
  const lessonsOf = new Map<string, string[]>();
  for (const l of course.lessonsById.values()) lessonsOf.set(l.unitId, [...(lessonsOf.get(l.unitId) ?? []), l.id]);
  const blocks: WallBlock[] = [];
  for (const s of line.stops) {
    const base = { slug: s.slug, name: s.stationInfo.name, tile: s.stationInfo.tile };
    if (s.kind === 'unit') {
      const cells = (lessonsOf.get(s.unit) ?? []).map((id): Cell => {
        const p = input.lessons.get(id);
        return p?.completedAt ? 'done' : p && p.stepsDone.length ? 'started' : 'empty';
      });
      blocks.push({ ...base, kind: 'unit', cells, stamped: input.stamps.has(`unit:${s.unit}`) });
    } else if (s.kind === 'milestone') {
      const stamped = input.stamps.has(`milestone:${s.milestone.id}:${s.milestone.part}`);
      blocks.push({ ...base, kind: 'milestone', cells: [stamped ? 'done' : 'empty'], stamped });
    } else if (s.kind === 'pronunciation') {
      blocks.push({ ...base, kind: 'pronunciation', cells: [input.alphabetPractised ? 'done' : 'empty'], stamped: false });
    }
  }
  return blocks;
}

export function wallCounts(blocks: WallBlock[]) {
  const cells = blocks.flatMap((b) => b.cells);
  return {
    filled: cells.filter((c) => c === 'done').length,
    total: cells.length,
    stations: blocks.filter((b) => b.stamped).length,
  };
}
