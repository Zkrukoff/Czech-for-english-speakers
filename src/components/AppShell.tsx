import { NavLink, Outlet, useRouteError } from 'react-router-dom';
import { contentErrors } from '@/content';
import { ContentErrorScreen } from './ContentErrorScreen';
import { useDueSummary } from '@/db/useDue';
import { MetroLineStripe, MetroMark } from './BubbleWall';

const NAV = [
  { to: '/', label: 'Learn', end: true },
  { to: '/alphabet', label: 'Alphabet' },
  { to: '/guides', label: 'Guides' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/verbs', label: 'Verbs' },
  { to: '/review', label: 'Review' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
];

/** Wordmark: the metro mark and "Čeština" in the display face, with a red Č. */
function Wordmark() {
  return (
    <NavLink to="/" className="group flex items-center gap-2.5">
      <MetroMark className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12" />
      <span className="flex flex-col leading-none">
        <span lang="cs" className="font-display text-2xl font-extrabold tracking-tight text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-metro-c">Č</span>eština
        </span>
        <span className="mt-0.5 hidden text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500 sm:block">for English speakers at work</span>
      </span>
    </NavLink>
  );
}

export function AppShell({ error = false }: { error?: boolean }) {
  const due = useDueSummary();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-paper/85 backdrop-blur-md">
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
                      `inline-flex min-h-10 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors ${
                        isActive ? 'bg-ink text-paper' : 'text-stone-600 hover:bg-cream hover:text-ink'
                      }`
                    }
                  >
                    {n.label}
                    {n.to === '/review' && due && due.dueNow > 0 && (
                      <span className="ml-1.5 rounded-full bg-metro-b px-1.5 text-xs font-bold tabular-nums text-ink" aria-label={`${due.dueNow} due`}>
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
      <footer className="mt-16">
        <MetroLineStripe className="h-1" />
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <MetroMark className="h-5 w-5" />
            <span>Made for people who moved to Czechia and want to <span lang="cs" className="text-stone-700">mluvit česky</span>.</span>
          </span>
          <span className="text-xs">Progress stays in this browser · Czech content awaiting native review</span>
        </div>
      </footer>
    </div>
  );
}

function RouteError() {
  const err = useRouteError();
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6">
      <h1 className="text-lg font-semibold text-rose-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-rose-800">{err instanceof Error ? err.message : 'Unknown error'}</p>
    </div>
  );
}
