export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall through to system.
  }
  // Dark, unless somebody has chosen otherwise on this machine.
  //
  // This used to be because there was no light palette at all -- the tokens
  // were defined under `.dark` only, so a machine set to light rendered white
  // inputs on the dark horizon and an unreadable heading. There is one now,
  // and the toggle leads somewhere.
  //
  // It stays dark rather than following the system preference for a smaller
  // reason: this is an instrument, the severity ramp was picked against a
  // near-black ground, and a red that means "critical" is louder there. The
  // light palette exists so that somebody who wants it is not punished for
  // asking, not because it is the better way to read this data.
  return "dark";
}

export function setTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Preference is not persisted, but the current page still applies it.
  }
}

/**
 * Applies the stored (or system) theme. Called once at app start so the login
 * screen is themed too, not only the pages behind the navigation bar.
 */
export function applyStoredTheme(): Theme {
  const theme = getStoredTheme();
  document.documentElement.classList.toggle("dark", theme === "dark");
  return theme;
}
