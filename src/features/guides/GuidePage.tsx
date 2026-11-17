import { Link, useParams, useSearchParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { CourseMarkdown } from '@/components/CourseMarkdown';
import { ReviewStatusBadge } from '@/components/ReviewStatusBadge';
import { PracticeSets } from '@/features/practice/PracticeSets';
import { PhraseList } from './PhraseList';
import { IconArrowLeft } from '@/components/icons';

export function GuidePage() {
  const { guideId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const guide = course.guidesById.get(guideId);
  if (!guide) return <NotFound what="guide" />;

  const tabs = [
    ...guide.sections.map((s) => ({ id: s.id, label: s.title })),
    ...(guide.phrasebook.length ? [{ id: 'phrases', label: 'Phrases' }] : []),
    ...(guide.practice.length ? [{ id: 'practice', label: 'Practice' }] : []),
  ];
  const tab = tabs.find((t) => t.id === params.get('tab'))?.id ?? tabs[0]!.id;
  const section = guide.sections.find((s) => s.id === tab);

  return (
    <>
      <Link to="/guides" className="text-sm text-vltava hover:underline"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> Guides</Link>
      <PageHeader title={guide.title} subtitle={guide.summary}>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {guide.titleCs && <span lang="cs" className="text-ink-3">{guide.titleCs}</span>}
          <ReviewStatusBadge reviewed={guide.nativeReviewed} />
        </div>
      </PageHeader>

      <nav aria-label="Guide sections" className="-mx-4 mb-8 overflow-x-auto border-b border-rule px-4 md:mx-0 md:px-0">
        <ul className="flex gap-1">
          {tabs.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setParams(t.id === tabs[0]!.id ? {} : { tab: t.id }, { replace: true });
                  window.scrollTo(0, 0);
                }}
                aria-current={t.id === tab ? 'page' : undefined}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${t.id === tab ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {section && <CourseMarkdown>{guide.sectionMd[section.id] ?? ''}</CourseMarkdown>}

      {tab === 'phrases' && (
        <div className="max-w-3xl space-y-10">
          {guide.phrasebook.map((b) => (
            <section key={b.id} aria-labelledby={`pb-${b.id}`}>
              <h2 id={`pb-${b.id}`} className="mb-1 text-xl font-semibold tracking-tight">{b.title}</h2>
              {b.intro && <p className="mb-3 text-ink-2">{b.intro}</p>}
              <PhraseList phrases={b.phrases} />
            </section>
          ))}
        </div>
      )}

      {tab === 'practice' && <PracticeSets sets={guide.practice} context="guide" />}

      {(guide.sources.length > 0 || guide.lastChecked) && (
        <aside className="mt-12 max-w-3xl border-t border-rule pt-4 text-sm text-ink-3">
          {guide.lastChecked && <p>Practical details last checked: {guide.lastChecked}. Prices, lines and timetables change, so check the official sources before you rely on them.</p>}
          {guide.sources.length > 0 && (
            <ul className="mt-2 space-y-1">
              {guide.sources.map((s) => (
                <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer" className="text-vltava underline">{s.title}</a></li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </>
  );
}
