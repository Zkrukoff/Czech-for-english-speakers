import { NavLink, Outlet, useRouteError } from 'react-router-dom';
import { contentErrors } from '@/content';
import { ContentErrorScreen } from './ContentErrorScreen';
import { useDueSummary } from '@/db/useDue';

const NAV = [
  { to: '/', label: 'Learn', end: true },
  { to: '/grammar', label: 'Grammar' },
  { to: '/verbs', label: 'Verbs' },
  { to: '/review', label: 'Review' },
  { to: '/progress', label: 'Progress' },
  { to: '/settings', label: 'Settings' },
];

export function AppShell({ error = false }: { error?: boolean }) {
  const due = useDueSummary();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-stone-900">
            Čeština <span className="font-normal text-stone-500">for English speakers</span>
          </NavLink>
          <nav aria-label="Main" className="-mx-1 flex flex-wrap gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`
                }
              >
                {n.label}
                {n.to === '/review' && due && due.dueNow > 0 && (
                  <span className="ml-1.5 tabular-nums opacity-70" aria-label={`${due.dueNow} due`}>{due.dueNow}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {contentErrors.length > 0 ? <ContentErrorScreen errors={contentErrors} /> : error ? <RouteError /> : <Outlet />}
      </main>
      <footer className="border-t border-stone-200 py-4 text-center text-xs text-stone-500">
        Your progress is stored only in this browser.
      </footer>
    </div>
  );
}

function RouteError() {
  const err = useRouteError();
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-red-800">{err instanceof Error ? err.message : 'Unknown error'}</p>
    </div>
  );
}
