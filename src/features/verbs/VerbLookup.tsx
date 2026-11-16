import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import { searchVerbs } from '@/lib/verbs';
import { PageHeader } from '@/components/PageHeader';
import { AspectBadge } from '@/components/AspectBadge';

export function VerbLookup() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const results = useMemo(() => searchVerbs(course.verbs, q), [q]);
  return (
    <>
      <PageHeader title="Verb lookup" subtitle="Search by infinitive, any conjugated form, or English meaning. Diacritics are optional: 'pisu' finds psát." />
      <input
        type="search"
        autoFocus
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
        placeholder="e.g. jít, píšu, to buy"
        aria-label="Search verbs"
        lang="cs"
        className="mb-4 w-full max-w-lg rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-lg shadow-sm focus:border-sky-500 focus:outline-none"
      />
      <p className="mb-3 text-sm text-stone-500">{results.length} verb{results.length === 1 ? '' : 's'}</p>
      <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {results.map((v) => (
          <li key={v.lemma}>
            <Link to={`/verbs/lookup/${encodeURIComponent(v.lemma)}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 hover:bg-stone-50">
              <span className="font-semibold">{v.lemma}</span>
              <AspectBadge aspect={v.aspect} />
              <span className="text-sm text-stone-600">{v.en}</span>
              {v.partner.length > 0 && <span className="ml-auto text-sm text-stone-400">↔ {v.partner.join(', ')}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
