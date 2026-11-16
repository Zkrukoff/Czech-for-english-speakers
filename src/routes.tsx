import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { NotFound } from './components/NotFound';
import { HomePage } from './features/home/HomePage';
import { UnitPage } from './features/lessons/UnitPage';
import { LessonPage } from './features/lessons/LessonPage';
import { UnitCheckPage } from './features/lessons/UnitCheckPage';
import { GrammarIndex } from './features/grammar/GrammarIndex';
import { GrammarPageView } from './features/grammar/GrammarPageView';
import { TablesPage } from './features/grammar/TablesPage';
import { VerbsIndex } from './features/verbs/VerbsIndex';
import { VerbLookup } from './features/verbs/VerbLookup';
import { VerbDetail } from './features/verbs/VerbDetail';
import { ReviewPage } from './features/review/ReviewPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { SettingsPage } from './features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <AppShell error />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'units/:unitId', element: <UnitPage /> },
      { path: 'units/:unitId/check', element: <UnitCheckPage /> },
      { path: 'lessons/:lessonId', element: <LessonPage /> },
      { path: 'grammar', element: <GrammarIndex /> },
      { path: 'grammar/tables', element: <TablesPage /> },
      { path: 'grammar/:pageId', element: <GrammarPageView /> },
      { path: 'verbs', element: <VerbsIndex /> },
      { path: 'verbs/lookup', element: <VerbLookup /> },
      { path: 'verbs/lookup/:lemma', element: <VerbDetail /> },
      { path: 'verbs/:pageId', element: <GrammarPageView /> },
      { path: 'review', element: <ReviewPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
