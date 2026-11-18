import type { Gender } from '@/content/schema';

const LABEL: Record<Gender, { short: string; long: string }> = {
  'm-anim': { short: 'm·živ', long: 'masculine animate (mužský životný)' },
  'm-inan': { short: 'm·neživ', long: 'masculine inanimate (mužský neživotný)' },
  f: { short: 'ž', long: 'feminine (ženský)' },
  n: { short: 's', long: 'neuter (střední)' },
};

/**
 * The same small marker for a noun's gender everywhere (brief 2.2 #3):
 * Czech grammar abbreviations in mono, never colour alone. Animacy is part of
 * the masculine marker because it changes endings.
 */
export function GenderMark({ gender, className = '' }: { gender: Gender; className?: string }) {
  const l = LABEL[gender];
  return (
    <abbr
      title={l.long}
      aria-label={l.long}
      lang="cs"
      className={`inline-flex items-center rounded-sm border border-rule-strong px-1 font-mono text-2xs font-semibold uppercase leading-4 tracking-wider text-ink-2 no-underline ${className}`}
    >
      {l.short}
    </abbr>
  );
}

export const GENDER_LONG = (g: Gender) => LABEL[g].long;
