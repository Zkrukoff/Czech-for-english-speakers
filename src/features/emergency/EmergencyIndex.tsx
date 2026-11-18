import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { SectionNumber } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { EmergencyNumbers, VerifiedLine } from './Numbers';
import { OfflineStatus } from './OfflineStatus';

/** Emergency numbers and phrase cards. Everything here is bundled, so it works offline. */
export function EmergencyIndex() {
  return (
    <>
      <PageHeader title="Emergency" cs="V nouzi" subtitle="The numbers to call and the sentences to say, for the days things go wrong. Each card has a big-text mode you can hold up to someone.">
        <OfflineStatus />
      </PageHeader>

      <section aria-labelledby="em-numbers">
        <SectionNumber n={1} id="em-numbers">Numbers</SectionNumber>
        <EmergencyNumbers />
        <VerifiedLine />
      </section>

      <section aria-labelledby="em-cards" className="mt-12">
        <SectionNumber n={2} id="em-cards">Phrase cards</SectionNumber>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {course.emergency.cards.map((c) => (
            <li key={c.id}>
              <Link to={`/emergency/${c.id}`} className="card card-link group flex h-full flex-col p-5">
                <span lang="cs" className="font-display text-2xl font-extrabold">{c.titleCs}</span>
                <span className="font-semibold">{c.title}</span>
                <span className="mt-2 flex-1 text-sm text-ink-2">{c.intro}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">Open <IconArrowRight size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="mt-10 text-xs text-ink-3">The Czech on these cards is awaiting review by a native speaker.</p>
    </>
  );
}
