import { useState } from 'react';
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
  const [group, setGroup] = useState(GROUPS[0]!.id);
  const active = GROUPS.find((g) => g.id === group)!;
  const tables = [...course.tables.values()].filter((t) => active.match(t.id));
  return (
    <>
      <PageHeader
        title="Declension tables"
        subtitle="Every noun follows one of these model words. Endings are coloured by case, using the same colour for a case everywhere in the app."
      />
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 rounded-lg border border-rule bg-surface px-4 py-3 text-sm" aria-label="Case colours">
        {CASE_KEYS.map((k) => <CaseLabel key={k} caseKey={k} />)}
      </div>
      <div role="tablist" className="mb-2 flex flex-wrap gap-1">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === group}
            onClick={() => setGroup(g.id)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${g.id === group ? 'bg-ink text-on-fill-light' : 'text-ink-2 hover:bg-paper-2'}`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid gap-x-6 lg:grid-cols-2">
        {tables.map((t) => <FormTableView key={t.id} table={t} />)}
      </div>
    </>
  );
}
