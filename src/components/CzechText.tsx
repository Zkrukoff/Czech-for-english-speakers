import { Fragment } from 'react';
import { parseLens } from '@/lib/lens';

/**
 * Renders a Czech string that may contain case-lens markup
 * ([[form|lemma|case|function]]). Annotated words are wrapped in a span
 * carrying their case and function, which the interactive lens (phase 4)
 * builds on; until then they read as plain text.
 */
export function CzechText({ text }: { text: string }) {
  if (!text.includes('[[')) return <>{text}</>;
  return (
    <>
      {parseLens(text).segments.map((s, i) =>
        s.type === 'text' ? (
          <Fragment key={i}>{s.text}</Fragment>
        ) : (
          <span key={i} data-lens="" data-case={s.case} data-number={s.number} data-fn={s.fn} data-lemma={s.lemma}>
            {s.form}
          </span>
        ),
      )}
    </>
  );
}
