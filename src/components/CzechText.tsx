import { Fragment, type ReactNode } from 'react';
import { parseLens } from '@/lib/lens';
import { LensWord } from '@/features/lens/LensWord';

/**
 * Renders a Czech string that may contain case-lens markup
 * ([[form|lemma|case|function]]). Annotated words become lens buttons:
 * the ending underlined in its case colour, tap for the why.
 *
 * `renderText` handles the plain parts (e.g. **bold** and ___ blanks in
 * exercise prompts). A word containing a blank ("káv___") is never tappable,
 * so the lens can't give the answer away; the feedback explains it instead.
 */
export function CzechText({
  text,
  renderText = (t) => t,
  lens = true,
}: {
  text: string;
  renderText?: (t: string) => ReactNode;
  lens?: boolean;
}) {
  if (!text.includes('[[')) return <>{renderText(text)}</>;
  return (
    <>
      {parseLens(text).segments.map((s, i) => {
        if (s.type === 'text') return <Fragment key={i}>{renderText(s.text)}</Fragment>;
        if (s.form.includes('___')) {
          return <Fragment key={i}>{renderText(s.form)}</Fragment>;
        }
        if (!lens) return <Fragment key={i}>{s.form}</Fragment>;
        return <LensWord key={i} token={s} />;
      })}
    </>
  );
}
