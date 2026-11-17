import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { migrateLegacyDatabase } from './db/migrate';
import { ensureProfile } from './db/profile';
import { course } from './content';
import { getTheme } from './lib/theme';
import './index.css';

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

// Move the theme preference to its namespaced key (reading it migrates it).
getTheme();

// Bring progress over from the pre-Pražák database before anything reads it.
// If the copy fails, the app still starts; the old data is untouched and the
// copy is retried on the next load.
// Then make sure existing learners have a profile and their wallet stamps
// (inferred from progress), so nobody is sent through onboarding twice.
migrateLegacyDatabase()
  .catch((e: unknown) => console.error('Could not copy progress from the previous version:', e))
  .then(() => ensureProfile(course.units.map((u) => ({ id: u.id, goalIds: u.canDo.map((g) => g.id) }))))
  .catch((e: unknown) => console.error('Could not set up the learner profile:', e))
  .finally(render);
