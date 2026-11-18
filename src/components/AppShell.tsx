import { UpdateNotice } from './UpdateNotice';
import { PageHeader } from './PageHeader';
import { NavLink, Outlet, useLocation, useRouteError } from 'react-router-dom';
import { contentErrors } from '@/content';
import { useHashScroll } from '@/lib/useHashScroll';
import { ContentErrorScreen } from './ContentErrorScreen';
import { useDueSummary } from '@/db/useDue';
import { MetroLineStripe } from './brand/Metro';
import { MarkKubismus, WordmarkKubismus } from './brand/Wordmarks';

/** English labels for easy navigation; each page shows its Czech name under the title (and in the tooltip here). */
const NAV: { to: string; label: string; cs: string; end?: boolean; also?: string[] }[] = [
  { to: '/', label: 'Home', cs: 'Linka', end: true },
  { to: '/review', label: 'Review', cs: 'Opakování' },
  { to: '/sounds', label: 'Sounds', cs: 'Výslovnost' },
  { to: '/grammar', label: 'Grammar & verbs', cs: 'Mluvnice a slovesa', also: ['/verbs'] },
  { to: '/guides', label: 'Guides', cs: 'Průvodce' },
  { to: '/wallet', label: 'Ticket wallet', cs: 'Jízdenky' },
  { to: '/settings', label: 'Settings', cs: 'Nastavení' },
];

/** Wordmark B (Kubismus, chosen in D11) with the tagline. */
function Wordmark() {
  return (
    <NavLink to="/" className="group flex items-center gap-3" aria-label="Pražák, home">
      <WordmarkKubismus className="h-9 w-auto text-ink" title="Pražák" />
      <span lang="cs" className="label-board hidden text-2xs text-ink-3 sm:block">Mluv jako Pražák.</span>
    </NavLink>
  );
}

export function AppShell({ error = false }: { error?: boolean }) {
  useHashScroll();
  const { pathname } = useLocation();
  const due = useDueSummary();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b-2 border-ink bg-paper">
        <MetroLineStripe className="h-1" />
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 pt-3 md:flex-row md:items-center md:justify-between md:gap-6 md:py-3">
          <Wordmark />
          <nav aria-label="Main" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-1 pb-2 md:pb-0">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `relative inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors ${
                        isActive || n.also?.some((p) => pathname.startsWith(p)) ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                      }`
                    }
                  >
                    <span title={n.cs}>{n.label}</span>
                    {n.to === '/review' && due && due.dueNow > 0 && (
                      <span className="ml-1.5 rounded-full bg-line-b px-1.5 text-xs font-bold tabular-nums text-ink" aria-label={`${due.dueNow} due`}>
                        {due.dueNow}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:py-14">
        {contentErrors.length > 0 ? <ContentErrorScreen errors={contentErrors} /> : error ? <RouteError /> : <Outlet />}
      </main>
      <UpdateNotice />
      <footer className="mt-16">
        <MetroLineStripe className="h-1" />
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <MarkKubismus className="h-5 w-5" />
            <span><span lang="cs" className="font-semibold text-ink-2">Pražák</span>: Czech for people who actually live here.</span>
          </span>
          <span className="text-xs">
            <NavLink to="/emergency" className="font-semibold text-ink-2 underline decoration-2 underline-offset-2 hover:text-ink">Emergency: 112</NavLink> ·{' '}
            Progress stays in this browser · Czech content awaiting native review ·{' '}
            <NavLink to="/styleguide" className="underline decoration-2 underline-offset-2 hover:text-ink">Style guide</NavLink>
          </span>
        </div>
      </footer>
    </div>
  );
}

function RouteError() {
  const err = useRouteError();
  return (
    <>
      <PageHeader
        title="Something broke"
        cs="Výluka"
        subtitle="This screen hit an error. Your progress is safe: it's stored in this browser and nothing was lost."
      />
      <p className="mb-6 rounded-sm border-l-4 border-ink bg-paper-2 px-4 py-3 font-mono text-sm text-ink-2">{err instanceof Error ? err.message : 'Unknown error'}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">Reload</button>
        <NavLink to="/" className="btn btn-secondary">Back to the line</NavLink>
      </div>
    </>
  );
}
