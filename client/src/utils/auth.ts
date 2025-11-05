type TokenPair = { access: string; refresh?: string | null };

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

export function decodeJwtPayload(token?: string): any | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4) payload += "=";
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

export function getTokenExpiry(token?: string): number | null {
  const p = decodeJwtPayload(token);
  if (!p) return null;
  if (typeof p.exp === "number") return p.exp;
  return null;
}

export function isTokenValid(token?: string): boolean {
  if (!token) return false;
  const exp = getTokenExpiry(token);
  if (!exp) return true;
  return exp > nowSec();
}

function pickStorage(remember = true): Storage {
  return remember ? window.localStorage : window.sessionStorage;
}

export function setTokens(tokens: TokenPair, remember = true) {
  const storage = pickStorage(remember);
  if (tokens.access) storage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) storage.setItem(REFRESH_KEY, tokens.refresh);
}

export function setTokensPersistent(tokens: TokenPair) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function getAccess(): string | null {
  return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
}

export function getRefresh(): string | null {
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // ignore
  }
}

export async function refreshAccessIfNeeded(verbose = false): Promise<TokenPair> {
  const refresh = getRefresh();
  if (!refresh) throw new Error("No refresh token available");

  const res = await fetch("/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.detail || body.error || `Refresh failed (status ${res.status})`;
    throw new Error(String(msg));
  }

  const data = await res.json();
  const access = data.access ?? data.token ?? null;
  const newRefresh = data.refresh ?? null;

  if (!access) throw new Error("Refresh endpoint did not return an access token");

  const remember = !!localStorage.getItem(REFRESH_KEY);
  setTokens({ access, refresh: newRefresh ?? refresh }, remember);

  if (verbose) console.debug("[auth] token refreshed");
  return { access, refresh: newRefresh ?? refresh };
}
