export interface ReviewItem {
  key: string; file: string; path?: string[]; obj?: Record<string, unknown>;
  batch: { n: number; slug: string; title: string }; area: string; kind: string;
  cs: string; en: string; context: string; check: string; autoFix: boolean;
  md?: boolean; flagged?: boolean; reviewed?: boolean;
}
export const ROOT: string;
export const CONTENT: string;
export const BATCHES: { n: number; slug: string; title: string; match: (file: string, obj: unknown) => boolean }[];
export function plain(s: string): string;
export function jsonItems(): ReviewItem[];
export function mdItems(): ReviewItem[];
export function locate(raw: unknown, path: string[]): Record<string, unknown> | undefined;
export function autoFixable(o: Record<string, unknown>): boolean;
