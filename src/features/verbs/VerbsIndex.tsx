import { Link } from 'react-router-dom';
import { VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

export function VerbsIndex() {
  return (
    <>
      <PageHeader title="Verbs" subtitle="Verbs are a core track. Work through these topics in order; each builds on the one before.">
        <Link to="/verbs/lookup" className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Verb lookup ({course.verbs.length} verbs)
        </Link>
      </PageHeader>
      <ol className="space-y-2">
        {VERB_TOPICS.map((t, i) => {
          const page = course.grammarBySkill.get(`verb:${t}`);
          if (!page) return null;
          return (
            <li key={t}>
              <Link to={`/verbs/${page.id}`} className="flex gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400">
                <span className="w-5 text-sm font-medium text-stone-400">{i + 1}</span>
                <span>
                  <span className="block font-medium">{page.title}</span>
                  {page.summary && <span className="block text-sm text-stone-600">{page.summary}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
