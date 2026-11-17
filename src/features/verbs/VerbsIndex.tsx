import { Link } from 'react-router-dom';
import { VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

export function VerbsIndex() {
  return (
    <>
      <PageHeader title="Verbs" subtitle="Verbs are a core track. Work through these topics in order; each builds on the one before.">
        <Link to="/verbs/lookup" className="btn btn-primary mt-4">
          Verb lookup ({course.verbs.length} verbs)
        </Link>
      </PageHeader>
      <ol className="space-y-2">
        {VERB_TOPICS.map((t, i) => {
          const page = course.grammarBySkill.get(`verb:${t}`);
          if (!page) return null;
          return (
            <li key={t}>
              <Link to={`/verbs/${page.id}`} className="flex gap-4 rounded-lg border border-rule bg-surface px-4 py-3 hover:border-rule-strong">
                <span className="w-5 text-sm font-medium text-ink-3">{i + 1}</span>
                <span>
                  <span className="block font-medium">{page.title}</span>
                  {page.summary && <span className="block text-sm text-ink-2">{page.summary}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
