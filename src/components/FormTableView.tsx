import { CASE_INFO, CASE_KEY_TO_NAME, type CaseKey } from '@/content/taxonomy';
import type { FormTable } from '@/content/schema';
import { CASE_BG, CASE_TEXT } from './caseColors';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { IconHacek } from '@/components/icons';

/**
 * Renders one "stem|ending" cell. Alternatives are separated by " / ".
 * Endings are coloured by the row's case; zero endings show a faint "∅"
 * marker so the absence of an ending is visible too.
 */
export function FormCell({ value, caseKey }: { value: string; caseKey?: CaseKey }) {
  const color = caseKey ? CASE_TEXT[caseKey] : 'text-vltava';
  const alts = value.split(' / ');
  return (
    <>
      {alts.map((alt, i) => {
        const pipe = alt.indexOf('|');
        return (
          <span key={i}>
            {i > 0 && <span className="text-ink-3"> / </span>}
            {pipe === -1 ? (
              <span>{alt}</span>
            ) : (
              <>
                <span>{alt.slice(0, pipe)}</span>
                {alt.slice(pipe + 1) ? (
                  <span className={`font-semibold ${color}`}>{alt.slice(pipe + 1)}</span>
                ) : (
                  <span className="text-xs text-ink-3" title="no ending">∅</span>
                )}
              </>
            )}
          </span>
        );
      })}
    </>
  );
}

export function CaseLabel({ caseKey }: { caseKey: CaseKey }) {
  const name = CASE_KEY_TO_NAME[caseKey];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${CASE_BG[caseKey]}`} aria-hidden />
      <span className="capitalize">{name}</span>
      <span className="text-xs font-normal text-ink-3">{CASE_INFO[name].number}.</span>
    </span>
  );
}

export function FormTableView({ table, compact = false }: { table: FormTable; compact?: boolean }) {
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-rule bg-surface not-prose">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule bg-paper px-4 py-2">
        <span>
          <span className="font-semibold text-ink">{table.title}</span>
          {table.subtitle && <span className="ml-2 text-sm text-ink-3">{table.subtitle}</span>}
        </span>
        <ReviewStatusBadge reviewed={table.nativeReviewed} />
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 px-4 py-2 text-left font-medium text-ink-3">Case</th>
              {table.columns.map((c) => (
                <th key={c} className="px-4 py-2 text-left font-medium text-ink-3">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className="border-t border-rule">
                <th scope="row" className="px-4 py-2 text-left font-medium text-ink-2">
                  {row.case ? <CaseLabel caseKey={row.case} /> : row.label}
                </th>
                {row.forms.map((f, j) => (
                  <td key={j} lang="cs" className="px-4 py-2 text-base text-ink">
                    <FormCell value={f} caseKey={row.case} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && table.notes.length > 0 && (
        <ul className="space-y-1 border-t border-rule bg-paper px-4 py-3 text-sm text-ink-2">
          {table.notes.map((n) => (
            <li key={n} className="flex gap-2"><IconHacek size={14} className="mt-1 shrink-0 text-ink-3" /><span>{n}</span></li>
          ))}
        </ul>
      )}
    </figure>
  );
}
