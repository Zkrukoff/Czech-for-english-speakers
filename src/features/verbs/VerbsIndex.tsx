import { IconArrowLeft } from '@/components/icons';
import { Link } from 'react-router-dom';
import { VERB_TOPICS, course } from '@/content';
import { PageHeader } from '@/components/PageHeader';

export function VerbsIndex() {
  return (
    <>
      <Link to="/grammar" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Grammar &amp; verbs</Link>
      <PageHeader title="Verbs" cs="Slovesa" subtitle="Verbs are a core track. Work through these topics in order; each builds on the one before.">
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
              <Link to={`/verbs/${page.id}`} className="flex gap-4 rounded-md border-2 border-ink bg-surface px-4 py-3 hover:-translate-y-0.5">
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
