import { course } from '@/content';
import { Markdown } from './Markdown';
import { FormTableView } from './FormTableView';
import { EmbeddedVerb } from './ConjugationTable';

/** Markdown with ```table id``` and ```verb lemma``` embeds resolved from course content. */
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
    >
      {children}
    </Markdown>
  );
}
