import type { PublicUser } from "@shared/schema";

/**
 * Session-based authentication.
 *
 * The server owns the session and the browser holds an httpOnly cookie it
 * cannot read, so there is no token in localStorage for a caller to forge.
 * Every question about identity goes to the server.
 */

// The page and the API are served from the same origin, in development
// and in the packaged app alike, so requests are relative.
const API_BASE = "";

function apiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export interface AuthState {
  authenticated: boolean;
  user: PublicUser | null;
}

export async function checkAuth(): Promise<AuthState> {
  try {
    const res = await fetch(apiUrl("/api/auth/check"), { credentials: "include" });
    if (!res.ok) return { authenticated: false, user: null };
    const data = (await res.json()) as { authenticated?: boolean; user?: PublicUser };
    return { authenticated: Boolean(data.authenticated), user: data.user ?? null };
  } catch {
    // Server unreachable is treated as signed out rather than a crash.
    return { authenticated: false, user: null };
  }
}

export async function login(username: string, password: string): Promise<PublicUser> {
  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Incorrect username or password.");
    const body = await res.json().catch(() => null);
    throw new Error(
      body && typeof body.message === "string" ? body.message : "Sign in failed. Please try again.",
    );
  }

  const data = (await res.json()) as { user: PublicUser };
  return data.user;
}

export async function logout(): Promise<void> {
  // Clearing local state matters more than the network result, so failures here
  // are deliberately ignored.
  await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include" }).catch(() => undefined);
}

export function isAdmin(user: PublicUser | null): boolean {
  return user?.role === "admin";
}
