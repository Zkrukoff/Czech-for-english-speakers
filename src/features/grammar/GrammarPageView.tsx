import { useParams } from 'react-router-dom';
import { course } from '@/content';
import { NotFound } from '@/components/NotFound';
import { Markdown } from '@/components/Markdown';
import { PageHeader } from '@/components/PageHeader';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';

export function GrammarPageView() {
  const { pageId = '' } = useParams();
  const page = course.grammarById.get(pageId);
  if (!page) return <NotFound what="grammar page" />;
  return (
    <>
      <PageHeader title={page.title} subtitle={page.summary}>
        <div className="mt-3"><ReviewStatusBadge reviewed={page.nativeReviewed} /></div>
      </PageHeader>
      <Markdown>{page.body}</Markdown>
    </>
  );
}
