import { Link } from 'react-router-dom';
import { CASES, CASE_INFO, CASE_KEYS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { CASE_BG } from '@/components/caseColors';

export function GrammarIndex() {
  const overview = course.grammarById.get('how-cases-work');
  return (
    <>
      <PageHeader title="Grammar reference" subtitle="The seven cases, explained for English speakers, with full declension tables." />
      {overview && (
        <Link to={`/grammar/${overview.id}`} className="mb-6 block rounded-xl border border-sky-200 bg-sky-50 p-5 hover:border-sky-400">
          <div className="text-sm font-medium text-sky-800">Start here</div>
          <div className="mt-1 text-lg font-semibold">{overview.title}</div>
          <p className="mt-1 text-sm text-stone-700">{overview.summary}</p>
        </Link>
      )}
      <h2 className="mb-3 font-semibold">The seven cases</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CASES.map((c, i) => {
          const page = course.grammarBySkill.get(`case:${c}`);
          const info = CASE_INFO[c];
          if (!page) return null;
          return (
            <li key={c}>
              <Link to={`/grammar/${page.id}`} className="flex h-full gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400">
                <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${CASE_BG[CASE_KEYS[i]!]}`} aria-hidden />
                <span>
                  <span className="block font-semibold capitalize">{info.number}. {c}</span>
                  <span className="block text-sm text-stone-500">{info.czech} · <i>{info.question}</i></span>
                  {page.summary && <span className="mt-1 block text-sm text-stone-700">{page.summary}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/grammar/tables" className="btn btn-primary">All declension tables</Link>
        <Link to="/verbs" className="btn btn-secondary">Verb track</Link>
      </div>
    </>
  );
}
