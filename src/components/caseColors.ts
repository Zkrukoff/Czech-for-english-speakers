import type { CaseKey } from '@/content/taxonomy';

/** Tailwind classes per case; the same colour is used for a case everywhere. */
export const CASE_TEXT: Record<CaseKey, string> = {
  nom: 'text-case-nom',
  gen: 'text-case-gen',
  dat: 'text-case-dat',
  acc: 'text-case-acc',
  voc: 'text-case-voc',
  loc: 'text-case-loc',
  ins: 'text-case-ins',
};

export const CASE_BG: Record<CaseKey, string> = {
  nom: 'bg-case-nom',
  gen: 'bg-case-gen',
  dat: 'bg-case-dat',
  acc: 'bg-case-acc',
  voc: 'bg-case-voc',
  loc: 'bg-case-loc',
  ins: 'bg-case-ins',
};
