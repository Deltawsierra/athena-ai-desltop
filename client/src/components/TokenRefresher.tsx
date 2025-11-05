import { useEffect, useRef } from "react";
import { getAccess, getRefresh, getTokenExpiry, nowSec, refreshAccessIfNeeded, isTokenValid } from "../utils/auth";

export default function TokenRefresher() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function scheduleNextRefresh() {
      try {
        const access = getAccess();
        const refresh = getRefresh();

        if (!access || !refresh) return;
        const exp = getTokenExpiry(access);
        if (!exp) return;

        const refreshAt = Math.max(exp - 60, nowSec() + 5);
        const ms = Math.max((refreshAt - nowSec()) * 1000, 5000);

        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(async () => {
          try {
            await refreshAccessIfNeeded();
          } catch (err) {
            console.warn("[auth] token refresh failed:", err);
          } finally {
            if (!cancelled) scheduleNextRefresh();
          }
        }, ms);
      } catch (err) {
        console.warn("[auth] schedule error", err);
      }
    }

    (async () => {
      try {
        const access = getAccess();
        const refresh = getRefresh();
        if ((!access || !isTokenValid(access)) && refresh) {
          await refreshAccessIfNeeded();
        }
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) scheduleNextRefresh();
      }
    })();

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
