import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import { CASE_KEYS } from '@/content/taxonomy';
import { PageHeader } from '@/components/PageHeader';
import { CaseLabel, FormTableView } from '@/components/FormTableView';

const GROUPS = [
  { id: 'nouns-m', label: 'Masculine nouns', match: (id: string) => ['noun-pan', 'noun-hrad', 'noun-muz', 'noun-stroj', 'noun-predseda', 'noun-soudce'].includes(id) },
  { id: 'nouns-f', label: 'Feminine nouns', match: (id: string) => ['noun-zena', 'noun-ruze', 'noun-pisen', 'noun-kost'].includes(id) },
  { id: 'nouns-n', label: 'Neuter nouns', match: (id: string) => ['noun-mesto', 'noun-more', 'noun-kure', 'noun-staveni'].includes(id) },
  { id: 'adjectives', label: 'Adjectives', match: (id: string) => id.startsWith('adj-') },
  { id: 'pronouns', label: 'Pronouns', match: (id: string) => id.startsWith('pron-') },
];

export function TablesPage() {
  const [params] = useSearchParams();
  const want = params.get('vzor') ?? '';
  const [group, setGroup] = useState((GROUPS.find((g) => g.match(want)) ?? GROUPS[0]!).id);
  useEffect(() => {
    if (want) document.getElementById(want)?.scrollIntoView({ block: 'start' });
  }, [want]);
  const active = GROUPS.find((g) => g.id === group)!;
  const tables = [...course.tables.values()].filter((t) => active.match(t.id));
  return (
    <>
      <PageHeader
        title="Declension tables"
        subtitle="Every noun follows one of these model words. Endings are coloured by case, using the same colour for a case everywhere in the app."
      />
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 border-2 border-ink bg-surface px-4 py-3 text-sm" aria-label="Case colours">
        {CASE_KEYS.map((k) => <CaseLabel key={k} caseKey={k} />)}
      </div>
      <div role="tablist" className="mb-2 flex flex-wrap gap-1">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === group}
            onClick={() => setGroup(g.id)}
            className={`min-h-11 rounded-sm border-2 px-3 text-sm font-semibold ${g.id === group ? 'border-ink bg-ink text-paper' : 'border-rule-strong text-ink-2 hover:border-ink'}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid gap-x-6 lg:grid-cols-2">
        {tables.map((t) => (
          <div key={t.id} className="min-w-0">
            <FormTableView table={t} />
            {t.id.startsWith('noun-') && (
              <Link to={`/grammar/vzory/${t.id}`} className="-mt-2 mb-4 inline-block text-sm text-vltava underline">Nouns like {t.title} · drill</Link>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
