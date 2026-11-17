import type { CaseKey } from '@/content/taxonomy';

/** Tailwind classes per case; the same colour is used for a case everywhere. */
export const CASE_TEXT: Record<CaseKey, string> = {
  nom: 'text-case-1',
  gen: 'text-case-2',
  dat: 'text-case-3',
  acc: 'text-case-4',
  voc: 'text-case-5',
  loc: 'text-case-6',
  ins: 'text-case-7',
};

export const CASE_BG: Record<CaseKey, string> = {
  nom: 'bg-case-1',
  gen: 'bg-case-2',
  dat: 'bg-case-3',
  acc: 'bg-case-4',
  voc: 'bg-case-5',
  loc: 'bg-case-6',
  ins: 'bg-case-7',
};

/** Underline colour per case, for lens-annotated endings. */
export const CASE_DECOR: Record<CaseKey, string> = {
  nom: 'decoration-case-1',
  gen: 'decoration-case-2',
  dat: 'decoration-case-3',
  acc: 'decoration-case-4',
  voc: 'decoration-case-5',
  loc: 'decoration-case-6',
  ins: 'decoration-case-7',
};
