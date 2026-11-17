import type { Line, LineId } from '@/content/loader';

/**
 * "Today's ride": session length measured in metro stops on the learner's own
 * commute. Stations and order come from content/lines/lines.json (checked
 * against PID data). 1 stop ≈ 2 minutes of practice; how many exercises that is
 * comes from the learner's own pace.
 */

export interface Route {
  /** Station names in riding order, start to end. */
  stations: string[];
  /** Number of stops travelled (stations − 1). */
  stops: number;
  /** Lines used, in order, e.g. ['A', 'B']. */
  lines: LineId[];
  /** Where you change, if anywhere. */
  changes: string[];
}

/** Shortest route in stops between two stations (by slug), changing lines at transfer stations at no cost. */
export function routeBetween(lines: Line[], from: string, to: string): Route | null {
  type Node = { line: LineId; i: number };
  const key = (n: Node) => `${n.line}:${n.i}`;
  const starts: Node[] = [];
  for (const l of lines) l.stops.forEach((s, i) => s.slug === from && starts.push({ line: l.id, i }));
  if (!starts.length || !lines.some((l) => l.stops.some((s) => s.slug === to))) return null;
  // 0-1 BFS: moving along a line costs 1 stop, changing line at the same station costs 0.
  const dist = new Map<string, number>();
  const prev = new Map<string, Node | null>();
  const deque: Node[] = [];
  for (const s of starts) {
    dist.set(key(s), 0);
    prev.set(key(s), null);
    deque.push(s);
  }
  const lineOf = (id: LineId) => lines.find((l) => l.id === id)!;
  while (deque.length) {
    const n = deque.shift()!;
    const d = dist.get(key(n))!;
    const line = lineOf(n.line);
    const slug = line.stops[n.i]!.slug;
    const neighbours: [Node, number][] = [];
    for (const di of [-1, 1]) if (line.stops[n.i + di]) neighbours.push([{ line: n.line, i: n.i + di }, 1]);
    for (const other of lines) {
      if (other.id === n.line) continue;
      const j = other.stops.findIndex((s) => s.slug === slug);
      if (j >= 0) neighbours.push([{ line: other.id, i: j }, 0]);
    }
    for (const [m, w] of neighbours) {
      const nd = d + w;
      if (nd < (dist.get(key(m)) ?? Infinity)) {
        dist.set(key(m), nd);
        prev.set(key(m), n);
        if (w === 0) deque.unshift(m);
        else deque.push(m);
      }
    }
  }
  let best: Node | null = null;
  for (const l of lines) l.stops.forEach((s, i) => {
    const n = { line: l.id, i };
    if (s.slug === to && dist.has(key(n)) && (!best || dist.get(key(n))! < dist.get(key(best))!)) best = n;
  });
  if (!best) return null;
  const path: Node[] = [];
  for (let n: Node | null = best; n; n = prev.get(key(n)) ?? null) path.unshift(n);
  const stations: string[] = [];
  const usedLines: LineId[] = [];
  const changes: string[] = [];
  for (const n of path) {
    const name = lineOf(n.line).stops[n.i]!.stationInfo.name;
    if (usedLines.at(-1) !== n.line) {
      if (usedLines.length) changes.push(name);
      usedLines.push(n.line);
    }
    if (stations.at(-1) !== name) stations.push(name);
  }
  return { stations, stops: stations.length - 1, lines: usedLines, changes };
}

export const DEFAULT_PER_STOP = 3;
/** One stop ≈ two minutes of practice. */
export const SECONDS_PER_STOP = 120;

/**
 * Exercises per stop from the learner's own pace: the median gap between
 * consecutive answers in the same sitting (gaps over 5 minutes are breaks).
 * Needs at least 15 gaps; otherwise the default of 3.
 */
export function exercisesPerStop(timestamps: number[]): number {
  const t = [...timestamps].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < t.length; i++) {
    const g = (t[i]! - t[i - 1]!) / 1000;
    if (g > 2 && g < 300) gaps.push(g);
  }
  if (gaps.length < 15) return DEFAULT_PER_STOP;
  gaps.sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)]!;
  return Math.min(6, Math.max(2, Math.round(SECONDS_PER_STOP / median)));
}
