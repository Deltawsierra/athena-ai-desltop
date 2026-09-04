import { QueryClient, QueryFunction } from "@tanstack/react-query";

// In the packaged Electron app the renderer is served from app://athena, so API
// calls need an absolute URL. In the browser they are same-origin.
const API_BASE = window.location.protocol === "app:" ? "http://localhost:5000" : "";

function getApiUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}

/** Raised on 401 so the app can send the user back to the login screen. */
export class UnauthorizedError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "UnauthorizedError";
  }
}

async function throwIfResNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  if (res.status === 401) throw new UnauthorizedError();

  // Prefer the server's JSON message; fall back to text, then status.
  const body = await res.clone().json().catch(() => null);
  if (body && typeof body.message === "string") {
    const issues = Array.isArray(body.issues)
      ? body.issues.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`).join("; ")
      : "";
    throw new Error(issues ? `${body.message} (${issues})` : body.message);
  }
  const text = (await res.text().catch(() => "")) || res.statusText;
  throw new Error(text || `Request failed with status ${res.status}`);
}

export async function apiRequest(method: string, url: string, data?: unknown): Promise<Response> {
  const res = await fetch(getApiUrl(url), {
    method,
    headers: data !== undefined ? { "Content-Type": "application/json" } : {},
    body: data !== undefined ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

/**
 * Builds the request URL from the query key. The first element is the path;
 * a trailing object becomes the query string, so callers can write
 * `queryKey: ["/api/tests", { clientId }]`.
 */
function urlFromQueryKey(queryKey: readonly unknown[]): string {
  const [path, ...rest] = queryKey;
  let url = String(path);
  const params = rest.find((p) => p !== null && typeof p === "object") as Record<string, unknown> | undefined;
  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    }
    const qs = search.toString();
    if (qs) url += `?${qs}`;
  } else {
    const segments = rest.filter((s) => typeof s === "string" || typeof s === "number");
    if (segments.length > 0) url += `/${segments.join("/")}`;
  }
  return getApiUrl(url);
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const res = await fetch(urlFromQueryKey(queryKey), { credentials: "include" });
    if (res.status === 401 && on401 === "returnNull") return null as never;
    await throwIfResNotOk(res);
    return (await res.json()) as never;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      // Data is refetched when a mutation invalidates it; 30s keeps navigation
      // snappy without showing indefinitely stale rows.
      staleTime: 30_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
