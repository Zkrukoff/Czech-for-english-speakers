import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import { searchVerbs } from '@/lib/verbs';
import { PageHeader } from '@/components/PageHeader';
import { AspectBadge } from '@/components/AspectBadge';
import {  } from '@/components/icons';

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
        className="mb-4 w-full max-w-lg rounded-lg border border-rule-strong bg-surface px-4 py-2.5 text-lg shadow-offset-sm focus:border-vltava focus:outline-none"
      />
      <p className="mb-3 text-sm text-ink-3">{results.length} verb{results.length === 1 ? '' : 's'}</p>
      <ul className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-surface">
        {results.map((v) => (
          <li key={v.lemma}>
            <Link to={`/verbs/lookup/${encodeURIComponent(v.lemma)}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 hover:bg-paper">
              <span className="font-semibold">{v.lemma}</span>
              <AspectBadge aspect={v.aspect} />
              <span className="text-sm text-ink-2">{v.en}</span>
              {v.partner.length > 0 && <span className="ml-auto text-sm text-ink-3"><span className="label-board mr-1">pair</span><span lang="cs">{v.partner.join(', ')}</span></span>}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
