import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Renders course markdown. A fenced block ```table <id>``` embeds a
 * declension/conjugation table from content/grammar/tables; `renderTable`
 * supplies the component (wired up in the grammar reference).
 */
export function Markdown({ children, renderTable }: { children: string; renderTable?: (id: string) => ReactNode }) {
  const components: Components = {
    pre: ({ children: c }) => <>{c}</>,
    code: ({ className, children: c }) => {
      const lang = /language-(\w+)/.exec(className ?? '')?.[1];
      if (lang === 'table') {
        const id = String(c).trim();
        return renderTable ? <>{renderTable(id)}</> : <div className="text-sm text-stone-500">[table: {id}]</div>;
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
