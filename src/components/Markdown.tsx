import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Renders course markdown. A fenced block ```table <id>``` embeds a
 * declension table from content/grammar/tables, and ```verb <lemma>``` embeds
 * a present-tense table from content/verbs/verbs.json. Use CourseMarkdown to
 * get both wired up.
 */
export function Markdown({
  children,
  renderTable,
  renderVerb,
  renderEmbed,
}: {
  children: string;
  renderTable?: (id: string) => ReactNode;
  renderVerb?: (lemma: string) => ReactNode;
  /** Other embeds: ```timeline <guide>```, ```metro <guide>```. */
  renderEmbed?: (kind: string, arg: string) => ReactNode;
}) {
  const components: Components = {
    pre: ({ children: c }) => <>{c}</>,
    code: ({ className, children: c, node }) => {
      const lang = /language-(\w+)/.exec(className ?? '')?.[1];
      // For ```table noun-zena``` the id is in the fence's info string (meta);
      // also accept it on the first line of the block.
      const meta = String((node?.data as { meta?: string } | undefined)?.meta ?? '').trim();
      const arg = meta || String(c).trim();
      if (lang === 'table') {
        const id = arg;
        return renderTable ? <>{renderTable(id)}</> : <div className="text-sm text-ink-3">[table: {id}]</div>;
      }
      if ((lang === 'timeline' || lang === 'metro') && renderEmbed) {
        return <>{renderEmbed(lang, arg)}</>;
      }
      if (lang === 'verb') {
        const lemma = arg;
        return renderVerb ? <>{renderVerb(lemma)}</> : <div className="text-sm text-ink-3">[verb: {lemma}]</div>;
      }
      return <code className={className}>{c}</code>;
    },
    a: ({ href = '', children: c }) =>
      href.startsWith('/') ? <Link to={href}>{c}</Link> : <a href={href} target="_blank" rel="noreferrer">{c}</a>,
    // Accessibility: a header row with no text is a layout table: drop it. A single
    // empty corner cell gets a screen-reader label so every cell has a header.
    thead: ({ node, children: c }) => {
      const text = (n: unknown): string =>
        typeof n === 'object' && n !== null
          ? 'value' in n && typeof (n as { value: unknown }).value === 'string'
            ? (n as { value: string }).value
            : ((n as { children?: unknown[] }).children ?? []).map(text).join('')
          : '';
      return text(node).trim() ? <thead>{c}</thead> : null;
    },
    th: ({ children: c, node: _node, ...rest }) => (
      <th {...rest}>{(Array.isArray(c) ? c.length > 0 : c != null && c !== '') ? c : <span className="sr-only">Row</span>}</th>
    ),
    table: ({ children: c }) => (
      <div className="overflow-x-auto">
        <table>{c}</table>
      </div>
    ),
  };
  return (
    <div className="prose-cz">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
