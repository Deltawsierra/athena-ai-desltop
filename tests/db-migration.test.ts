import { describe, it, expect, vi } from "vitest";
import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * A database that already exists, and a column added after it did.
 *
 * The schema is created with CREATE TABLE IF NOT EXISTS, which does exactly
 * nothing to a table that is already there. So a column added to the schema
 * reaches new installs and no others: on every database anybody is actually
 * using, the first query naming it answers "no such column" and the screen
 * behind it returns 500. connection_settings got away with it by being a whole
 * new table; is_sample is a column on four existing ones and would not have.
 *
 * These run against a real file rather than :memory:, because the whole
 * failure is about a database that outlived the code that created it.
 */
describe("adding a column to a database that already exists", () => {
  function oldShapedDatabase(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "athena-migration-"));
    const file = path.join(dir, "athena.db");
    const handle = new Database(file);
    // The clients/sites/tests/documents tables exactly as they were before
    // is_sample existed. Rows in them, so this is not an empty-table shortcut.
    handle.exec(`
      CREATE TABLE clients (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT NOT NULL,
        email TEXT NOT NULL, phone TEXT, status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL, last_test_date INTEGER, notes TEXT
      );
      CREATE TABLE sites (
        id TEXT PRIMARY KEY, client_id TEXT NOT NULL, url TEXT NOT NULL,
        name TEXT NOT NULL, environment TEXT NOT NULL DEFAULT 'production',
        status TEXT NOT NULL DEFAULT 'active', created_at INTEGER NOT NULL
      );
      CREATE TABLE tests (
        id TEXT PRIMARY KEY, client_id TEXT NOT NULL, site_id TEXT,
        test_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
        severity TEXT, started_at INTEGER NOT NULL, completed_at INTEGER,
        summary TEXT, findings TEXT,
        vulnerabilities_found INTEGER NOT NULL DEFAULT 0,
        critical_count INTEGER NOT NULL DEFAULT 0,
        high_count INTEGER NOT NULL DEFAULT 0,
        medium_count INTEGER NOT NULL DEFAULT 0,
        low_count INTEGER NOT NULL DEFAULT 0, executed_by TEXT
      );
      CREATE TABLE documents (
        id TEXT PRIMARY KEY, client_id TEXT NOT NULL, title TEXT NOT NULL,
        description TEXT, document_type TEXT NOT NULL, file_url TEXT,
        created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, created_by TEXT
      );
      INSERT INTO clients (id, name, company, email, created_at)
        VALUES ('c1', 'Existing Client', 'Existing Ltd', 'e@example.test', 1000);
      INSERT INTO tests (id, client_id, test_type, started_at, critical_count)
        VALUES ('t1', 'c1', 'penetration-test', 1000, 2);
    `);
    handle.close();
    return file;
  }

  it("adds the column, keeps the rows, and defaults them to not-sample", async () => {
    process.env.ATHENA_DB_PATH = oldShapedDatabase();
    const { storage } = await import("../server/storage-sqlite");

    // Reaching the row at all is the assertion: without the ALTER TABLE this
    // is where drizzle asks for clients.is_sample and SQLite refuses.
    const client = await storage.getClient("c1");
    expect(client?.name).toBe("Existing Client");
    expect(client?.isSample).toBe(false);

    const test = await storage.getTest("t1");
    expect(test?.criticalCount).toBe(2);
    expect(test?.isSample).toBe(false);

    // A record that predates the column is a real one, so it is not swept.
    const counts = await storage.countSampleData();
    expect(counts).toEqual({ clients: 0, sites: 0, tests: 0, documents: 0, findings: 0 });

    const removed = await storage.removeSampleData();
    expect(removed.clients).toBe(0);
    expect((await storage.getClient("c1"))?.name).toBe("Existing Client");
  });

  it("relaxes the health columns that have no source, keeping the rows", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "athena-health-"));
    const file = path.join(dir, "athena.db");
    const handle = new Database(file);
    // ai_health_metrics exactly as it was: four columns NOT NULL, which is
    // what obliged the installer to invent a detection accuracy -- the column
    // would not accept the truth, which was that nobody had measured one.
    handle.exec(`
      CREATE TABLE ai_health_metrics (
        id TEXT PRIMARY KEY, timestamp INTEGER NOT NULL,
        cpu_usage INTEGER NOT NULL, memory_usage INTEGER NOT NULL,
        active_scans INTEGER NOT NULL DEFAULT 0,
        total_scans_today INTEGER NOT NULL DEFAULT 0,
        success_rate INTEGER NOT NULL,
        average_response_time INTEGER NOT NULL,
        models_loaded TEXT, last_training_date INTEGER,
        detection_accuracy INTEGER NOT NULL,
        false_positive_rate INTEGER NOT NULL
      );
      INSERT INTO ai_health_metrics
        (id, timestamp, cpu_usage, memory_usage, success_rate,
         average_response_time, detection_accuracy, false_positive_rate)
        VALUES ('m1', 1000, 24, 41, 98, 220, 94, 3);
    `);
    handle.close();

    process.env.ATHENA_DB_PATH = file;
    // The connection is a module singleton, so without this the previous case's
    // database answers this one's questions.
    vi.resetModules();
    const { storage } = await import("../server/storage-sqlite");

    // The old row survives the rebuild, fabricated figures and all. Removing
    // somebody's data at startup is not this migration's business; what it
    // does is make it possible to write the truth from now on.
    const kept = await storage.getLatestAIHealthMetric();
    expect(kept?.cpuUsage).toBe(24);
    expect(kept?.detectionAccuracy).toBe(94);

    // And a new reading can leave those columns empty, which the old shape
    // rejected outright.
    const written = await storage.createAIHealthMetric({
      cpuUsage: 7, memoryUsage: 8, detectionAccuracy: null, falsePositiveRate: null,
      successRate: null, averageResponseTime: null,
    });
    expect(written.detectionAccuracy).toBeNull();
    expect(written.successRate).toBeNull();
  });
});
