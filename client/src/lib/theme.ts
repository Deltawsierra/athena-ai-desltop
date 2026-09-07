export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall through to system.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
