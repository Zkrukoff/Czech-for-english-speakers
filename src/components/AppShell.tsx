import { NavLink, Outlet, useRouteError } from 'react-router-dom';
import { contentErrors } from '@/content';
import { ContentErrorScreen } from './ContentErrorScreen';
import { useDueSummary } from '@/db/useDue';

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

/** Wordmark: "Čeština" in the Czech typeface, with the Č as the one coloured mark. */
function Wordmark() {
  return (
    <NavLink to="/" className="flex items-baseline gap-2">
      <span lang="cs" className="text-2xl font-semibold tracking-tight text-stone-900">
        <span className="text-rose-700">Č</span>eština
      </span>
      <span className="hidden text-sm text-stone-500 sm:inline">for English speakers at work</span>
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
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
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
                      `inline-flex min-h-10 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium ${
                        isActive ? 'bg-stone-200 text-stone-900' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`
                    }
                  >
                    {n.label}
                    {n.to === '/review' && due && due.dueNow > 0 && (
                      <span className="ml-1.5 rounded-full bg-stone-300 px-1.5 text-xs tabular-nums text-stone-800" aria-label={`${due.dueNow} due`}>
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
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:py-10">
        {contentErrors.length > 0 ? <ContentErrorScreen errors={contentErrors} /> : error ? <RouteError /> : <Outlet />}
      </main>
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        Your progress is stored only in this browser · Czech content is awaiting review by a native speaker
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
