export interface Clip { id: string; say: string; who: string; note: string; batch: number; where: string }
export const AUDIO_BATCHES: { n: number; slug: string; title: string }[];
export function clipList(): Clip[];
export function importFolder(folder: string, speakerKey: string): { added: string[]; replaced: string[]; unknown: string[]; skipped: string[] };
export function writeScripts(): void;
