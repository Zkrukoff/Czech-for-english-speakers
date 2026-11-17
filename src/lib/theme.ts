/**
 * Light / dark / follow-the-system. Stored per browser in localStorage (it's a
 * display preference, not learning data). index.html applies it before the
 * first paint so there's no flash of the wrong theme.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

export const THEME_KEY = 'prazak:theme';
/** The un-namespaced key used before the rename to Pražák. */
const LEGACY_THEME_KEY = 'theme';

export function getTheme(): ThemeChoice {
  try {
    let t = localStorage.getItem(THEME_KEY);
    if (t === null) {
      // Carry over a choice made before the rename.
      t = localStorage.getItem(LEGACY_THEME_KEY);
      if (t === 'light' || t === 'dark') localStorage.setItem(THEME_KEY, t);
      localStorage.removeItem(LEGACY_THEME_KEY);
    }
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(choice: ThemeChoice): void {
  try {
    if (choice === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Storage unavailable (private mode): the choice still applies for this visit.
  }
  if (choice === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}
