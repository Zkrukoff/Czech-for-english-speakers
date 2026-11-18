import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { IconArrowLeft } from '@/components/icons';
import { isoWeek } from '@/lib/idioms';
import { IdiomDetail } from './IdiomDetail';
import { pragueNow } from '@/lib/pragueTime';

export function IdiomPage() {
  const { idiomId = '' } = useParams();
  const idiom = course.idioms.find((i) => i.id === idiomId);
  if (!idiom) return <NotFound what="idiom" />;
  return (
    <>
      <Link to="/idioms" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> All idioms</Link>
      <PageHeader title="Czech idiom" cs="Idiom" />
      <IdiomDetail idiom={idiom} week={isoWeek(pragueNow())} />
    </>
  );
}
