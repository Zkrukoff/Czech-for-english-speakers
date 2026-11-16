import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { NotFound } from './components/NotFound';
import { HomePage } from './features/home/HomePage';

/** Lazy-load a named page component so each section is its own chunk. */
function page<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M): Pick<RouteObject, 'lazy'> {
  return { lazy: async () => ({ Component: (await load())[name] as React.ComponentType }) };
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <AppShell error />,
    hydrateFallbackElement: <></>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'alphabet', ...page(() => import('./features/alphabet/AlphabetPage'), 'AlphabetPage') },
      { path: 'units/:unitId', ...page(() => import('./features/lessons/UnitPage'), 'UnitPage') },
      { path: 'units/:unitId/check', ...page(() => import('./features/lessons/UnitCheckPage'), 'UnitCheckPage') },
      { path: 'lessons/:lessonId', ...page(() => import('./features/lessons/LessonPage'), 'LessonPage') },
      { path: 'grammar', ...page(() => import('./features/grammar/GrammarIndex'), 'GrammarIndex') },
      { path: 'grammar/tables', ...page(() => import('./features/grammar/TablesPage'), 'TablesPage') },
      { path: 'grammar/:pageId', ...page(() => import('./features/grammar/GrammarPageView'), 'GrammarPageView') },
      { path: 'verbs', ...page(() => import('./features/verbs/VerbsIndex'), 'VerbsIndex') },
      { path: 'verbs/lookup', ...page(() => import('./features/verbs/VerbLookup'), 'VerbLookup') },
      { path: 'verbs/lookup/:lemma', ...page(() => import('./features/verbs/VerbDetail'), 'VerbDetail') },
      { path: 'verbs/:pageId', ...page(() => import('./features/grammar/GrammarPageView'), 'GrammarPageView') },
      { path: 'review', ...page(() => import('./features/review/ReviewPage'), 'ReviewPage') },
      { path: 'progress', ...page(() => import('./features/progress/ProgressPage'), 'ProgressPage') },
      { path: 'settings', ...page(() => import('./features/settings/SettingsPage'), 'SettingsPage') },
      { path: '*', element: <NotFound /> },
    ],
  },
];

// basename lets the app live under a sub-path such as /Czech-for-english-speakers/.
export const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' });
