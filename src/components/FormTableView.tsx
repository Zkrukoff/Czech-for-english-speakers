import { CASE_INFO, CASE_KEY_TO_NAME, type CaseKey } from '@/content/taxonomy';
import type { FormTable } from '@/content/schema';
import { CASE_BG, CASE_TEXT } from './caseColors';
import { ReviewStatusBadge } from './ReviewStatusBadge';

/**
 * Renders one "stem|ending" cell. Alternatives are separated by " / ".
 * Endings are coloured by the row's case; zero endings show a faint "∅"
 * marker so the absence of an ending is visible too.
 */
export function FormCell({ value, caseKey }: { value: string; caseKey?: CaseKey }) {
  const color = caseKey ? CASE_TEXT[caseKey] : 'text-sky-700';
  const alts = value.split(' / ');
  return (
    <>
      {alts.map((alt, i) => {
        const pipe = alt.indexOf('|');
        return (
          <span key={i}>
            {i > 0 && <span className="text-stone-400"> / </span>}
            {pipe === -1 ? (
              <span>{alt}</span>
            ) : (
              <>
                <span>{alt.slice(0, pipe)}</span>
                {alt.slice(pipe + 1) ? (
                  <span className={`font-semibold ${color}`}>{alt.slice(pipe + 1)}</span>
                ) : (
                  <span className="text-xs text-stone-400" title="no ending">∅</span>
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
      <span className="text-xs font-normal text-stone-400">{CASE_INFO[name].number}.</span>
    </span>
  );
}

export function FormTableView({ table, compact = false }: { table: FormTable; compact?: boolean }) {
  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-stone-200 bg-white not-prose">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 bg-stone-50 px-4 py-2">
        <span>
          <span className="font-semibold text-stone-900">{table.title}</span>
          {table.subtitle && <span className="ml-2 text-sm text-stone-500">{table.subtitle}</span>}
        </span>
        <ReviewStatusBadge reviewed={table.nativeReviewed} />
      </figcaption>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 px-4 py-2 text-left font-medium text-stone-500">Case</th>
              {table.columns.map((c) => (
                <th key={c} className="px-4 py-2 text-left font-medium text-stone-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className="border-t border-stone-100">
                <th scope="row" className="px-4 py-2 text-left font-medium text-stone-700">
                  {row.case ? <CaseLabel caseKey={row.case} /> : row.label}
                </th>
                {row.forms.map((f, j) => (
                  <td key={j} lang="cs" className="px-4 py-2 text-base text-stone-900">
                    <FormCell value={f} caseKey={row.case} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && table.notes.length > 0 && (
        <ul className="space-y-1 border-t border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {table.notes.map((n) => (
            <li key={n} className="flex gap-2"><span aria-hidden className="text-stone-400">•</span><span>{n}</span></li>
          ))}
        </ul>
      )}
    </figure>
  );
}
