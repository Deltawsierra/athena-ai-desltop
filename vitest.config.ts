import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Runs before any test module is imported, so the storage backend is
    // chosen before a hoisted `import ... from "../server/..."` can open the
    // real database file. See tests/setup.ts.
    setupFiles: ["tests/setup.ts"],
    // Each suite opens its own in-memory database, so they must not share a process.
    pool: "forks",
    poolOptions: { forks: { singleFork: false } },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
});
