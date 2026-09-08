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
  // Not the system preference, which is the usual answer and is the wrong one
  // here: the house palette in client/src/styles/athena.css is defined under
  // `.dark` only -- the severity ramp, the gold, the surfaces -- so a first
  // run on a machine set to light rendered the login screen with white inputs
  // on the dark horizon and a heading nobody could read. Offering a theme the
  // product has not been drawn for is worse than not offering it.
  //
  // The toggle still works and its choice is still remembered. What changed
  // is the default for somebody who has never expressed one.
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
