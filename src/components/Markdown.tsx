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
export function Markdown({ children, renderTable, renderVerb }: { children: string; renderTable?: (id: string) => ReactNode; renderVerb?: (lemma: string) => ReactNode }) {
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
        return renderTable ? <>{renderTable(id)}</> : <div className="text-sm text-stone-500">[table: {id}]</div>;
      }
      if (lang === 'verb') {
        const lemma = arg;
        return renderVerb ? <>{renderVerb(lemma)}</> : <div className="text-sm text-stone-500">[verb: {lemma}]</div>;
      }
      return <code className={className}>{c}</code>;
    },
    a: ({ href = '', children: c }) =>
      href.startsWith('/') ? <Link to={href}>{c}</Link> : <a href={href} target="_blank" rel="noreferrer">{c}</a>,
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
