import { Link } from 'react-router-dom';
import { CASES, CASE_INFO, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

export function GrammarIndex() {
  return (
    <>
      <PageHeader title="Grammar reference" subtitle="The seven cases, explained for English speakers, plus full declension tables." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {CASES.map((c) => {
          const page = course.grammarBySkill.get(`case:${c}`);
          const info = CASE_INFO[c];
          const inner = (
            <>
              <div className="text-sm text-stone-500">{info.number}. pád · {info.czech} · <i>{info.question}</i></div>
              <div className="mt-1 font-semibold capitalize">{c}</div>
            </>
          );
          return (
            <li key={c}>
              {page ? (
                <Link to={`/grammar/${page.id}`} className="block rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400">{inner}</Link>
              ) : (
                <div className="rounded-lg border border-dashed border-stone-300 p-4 text-stone-400">{inner}<div className="text-xs">Coming in milestone (b)</div></div>
              )}
            </li>
          );
        })}
      </ul>
      <Link to="/grammar/tables" className="mt-6 inline-block text-sky-700 underline">All declension tables →</Link>
    </>
  );
}
