import { Link } from 'react-router-dom';
import { CASE_TEXT } from '@/components/caseColors';
import { GenderMark } from '@/components/GenderMark';
import { IconArrowRight } from '@/components/icons';
import type { LensInfo } from './lensInfo';

/**
 * What the lens says about one word: the case (number, name, colour), why
 * it's used here (the function), and the pattern it follows (its vzor).
 * Always words plus colour, never colour alone.
 */
export function LensExplanation({ info, compact = false }: { info: LensInfo; compact?: boolean }) {
  const { token, fn, noun } = info;
  return (
    <div className="space-y-3 text-left">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span lang="cs" className="font-display text-2xl font-extrabold">
          {info.split[0]}
          <span className={`${CASE_TEXT[info.caseKey]} underline decoration-2 underline-offset-4`}>{info.split[1]}</span>
        </span>
        <span className={`label-board ${CASE_TEXT[info.caseKey]}`}>
          {info.caseNumber}. pád · <span lang="cs">{info.caseCs}</span>
        </span>
      </div>
      {fn && (
        <p className="text-ink">
          <span className="font-semibold">Why: {fn.label}.</span> {fn.explain}
        </p>
      )}
      {!compact && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-ink-3">Dictionary form</dt>
          <dd lang="cs" className="flex items-center gap-2 font-semibold">
            {token.lemma} {noun && <GenderMark gender={noun.gender} />}
          </dd>
          {info.vzorWord && (
            <>
              <dt className="text-ink-3">Pattern</dt>
              <dd>
                like <b lang="cs">{info.vzorWord}</b>{' '}
                <Link to={`/grammar/tables?vzor=${info.vzorTable}`} className="text-vltava underline underline-offset-2">
                  see the table
                </Link>
              </dd>
            </>
          )}
          <dt className="text-ink-3">Question</dt>
          <dd lang="cs">{info.question}</dd>
        </dl>
      )}
      {info.casePage && !compact && (
        <Link to={info.casePage} className="inline-flex items-center gap-1 text-sm font-semibold text-vltava underline underline-offset-2">
          All about the {info.caseEn} <IconArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
