import { lazy, Suspense } from 'react';
import { course } from '@/content';
import { Markdown } from './Markdown';
import { FormTableView } from './FormTableView';
import { EmbeddedVerb } from './ConjugationTable';

// Interactive embeds load only on the pages that use them.
const Timeline = lazy(() => import('@/features/guides/Timeline').then((m) => ({ default: m.Timeline })));
const MetroMap = lazy(() => import('@/features/guides/MetroMap').then((m) => ({ default: m.MetroMap })));

/** Markdown with ```table id```, ```verb lemma```, ```timeline guide``` and ```metro guide``` embeds resolved from course content. */
export function CourseMarkdown({ children }: { children: string }) {
  return (
    <Markdown
      renderTable={(id) => {
        const t = course.tables.get(id);
        return t ? <FormTableView table={t} /> : null;
      }}
      renderVerb={(lemma) => {
        const v = course.verbsByLemma.get(lemma);
        return v ? <EmbeddedVerb verb={v} /> : null;
      }}
      renderEmbed={(kind, arg) => {
        const g = course.guidesById.get(arg);
        if (kind === 'timeline' && g?.timeline) {
          return (
            <Suspense fallback={null}>
              <Timeline events={g.timeline} />
            </Suspense>
          );
        }
        if (kind === 'metro' && g?.metro) {
          return (
            <Suspense fallback={null}>
              <MetroMap metro={g.metro} />
            </Suspense>
          );
        }
        return null;
      }}
    >
      {children}
    </Markdown>
  );
}
