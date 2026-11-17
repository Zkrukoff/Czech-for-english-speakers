import { useParams } from 'react-router-dom';
import { course } from '@/content';
import { CASE_KEYS, CASE_KEY_TO_NAME } from '@/content/taxonomy';
import { CASE_TEXT } from '@/components/caseColors';
import { NotFound } from '@/components/NotFound';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { PageHeader } from '@/components/PageHeader';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';

export function GrammarPageView() {
  const { pageId = '' } = useParams();
  const page = course.grammarById.get(pageId);
  if (!page) return <NotFound what="grammar page" />;
  const caseName = page.skill?.startsWith('case:') ? page.skill.slice(5) : undefined;
  const caseKey = CASE_KEYS.find((k) => CASE_KEY_TO_NAME[k] === caseName);
  const fns = caseKey ? [...course.functions.values()].filter((f) => f.case === caseKey && f.id !== 'chunk') : [];
  return (
    <>
      <PageHeader title={page.title} subtitle={page.summary}>
        <div className="mt-3"><ReviewStatusBadge reviewed={page.nativeReviewed} /></div>
      </PageHeader>
      {caseKey && fns.length > 0 && (
        <section aria-labelledby="fns-h" className="mb-10 border-2 border-ink bg-surface p-5 shadow-offset">
          <h2 id="fns-h" className={`label-board ${CASE_TEXT[caseKey]}`}>What it's for</h2>
          <ul className="mt-3 divide-y divide-rule">
            {fns.map((f) => (
              <li key={f.id} className="py-3">
                <p className="font-semibold">{f.label}</p>
                <p className="text-sm text-ink-2">{f.explain}</p>
                <p className="mt-1 text-sm"><b lang="cs">{f.example.cs}</b> <span className="text-ink-3">{f.example.en}</span></p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CourseMarkdown>{page.body}</CourseMarkdown>
    </>
  );
}
