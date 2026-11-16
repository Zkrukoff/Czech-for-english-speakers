/**
 * Light / dark / follow-the-system. Stored per browser in localStorage (it's a
 * display preference, not learning data). index.html applies it before the
 * first paint so there's no flash of the wrong theme.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'theme';

export function getTheme(): ThemeChoice {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    // Storage unavailable (private mode): the choice still applies for this visit.
  }
  if (choice === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}
