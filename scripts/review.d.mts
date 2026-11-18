export interface ImportReport { ok: number; fixed: number; held: unknown[]; unsure: unknown[]; comments: unknown[]; problems: string[] }
export function toCsv(rows: string[][]): string;
export function parseCsv(text: string): string[][];
export function status(): { total: number; reviewed: number; areas: Record<string, { total: number; reviewed: number }> };
export function importSheet(file: string, options?: { validate?: false | (() => void) }): ImportReport;
export function exportBatches(all: boolean): void;
