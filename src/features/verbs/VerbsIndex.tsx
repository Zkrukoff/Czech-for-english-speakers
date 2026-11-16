import { Link } from 'react-router-dom';
import { VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

const LABELS: Record<string, string> = {
  'present-classes': 'Present tense: conjugation classes',
  irregulars: 'Být, mít and common irregulars',
  past: 'Past tense',
  aspect: 'Verbal aspect',
  future: 'Future tense',
  motion: 'Verbs of motion',
  reflexive: 'Reflexive verbs (se / si)',
  modals: 'Modal verbs',
  imperative: 'Imperative',
  conditional: 'Conditional',
};

export function VerbsIndex() {
  return (
    <>
      <PageHeader title="Verbs" subtitle="Verbs are a core track here, studied in this order." />
      <Link to="/verbs/lookup" className="mb-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">Verb lookup</Link>
      <ol className="space-y-2">
        {VERB_TOPICS.map((t, i) => {
          const page = course.grammarBySkill.get(`verb:${t}`);
          return (
            <li key={t} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3">
              <span className="text-sm text-stone-400">{i + 1}</span>
              {page ? <Link to={`/verbs/${page.id}`} className="font-medium hover:underline">{LABELS[t]}</Link> : <span className="text-stone-400">{LABELS[t]} (milestone b)</span>}
            </li>
          );
        })}
      </ol>
    </>
  );
}
