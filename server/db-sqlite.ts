import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";
import os from "os";

/**
 * Database location, in priority order:
 *   1. ATHENA_DB_PATH         explicit file path, or ":memory:" for tests
 *   2. ATHENA_USER_DATA       directory supplied by the Electron main process
 *   3. ~/.athena-ai/athena.db when running inside Electron without (2)
 *   4. ./athena.db            project root for local development
 */
export function resolveDbPath(): string {
  if (process.env.ATHENA_DB_PATH) return process.env.ATHENA_DB_PATH;

  const userData = process.env.ATHENA_USER_DATA;
  if (userData) {
    fs.mkdirSync(userData, { recursive: true });
    return path.join(userData, "athena.db");
  }

  if (process.versions?.electron) {
    const dir = path.join(os.homedir(), ".athena-ai");
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, "athena.db");
  }

  return path.resolve(process.cwd(), "athena.db");
}

/**
 * The connection is opened on first use, not on import.
 *
 * Opening it at module load meant that importing this file for any reason
 * created and locked a database: ATHENA_STORAGE=memory still wrote ./athena.db,
 * and every forked test worker contended on the developer's real database file.
 */
type Connection = { sqlite: DatabaseType; db: ReturnType<typeof drizzle> };

let connection: Connection | null = null;

function connect(): Connection {
  if (connection) return connection;

  const dbPath = resolveDbPath();
  if (dbPath !== ":memory:") {
    console.log(`[db] SQLite database: ${dbPath}`);
  }

  const handle = new Database(dbPath);
  handle.pragma("journal_mode = WAL");
  handle.pragma("busy_timeout = 5000");

  createSchema(handle);
  connection = { sqlite: handle, db: drizzle(handle, { schema }) };
  return connection;
}

/** Open the database now, rather than on the first query. */
export function openDatabase(): void {
  connect();
}

function lazy<T extends object>(pick: (c: Connection) => T): T {
  return new Proxy({} as T, {
    get(_target, property, receiver) {
      const value = Reflect.get(pick(connect()) as object, property, receiver);
      return typeof value === "function" ? value.bind(pick(connect())) : value;
    },
    has: (_target, property) => property in (pick(connect()) as object),
  });
}

export const sqlite: DatabaseType = lazy((c) => c.sqlite);
export const db = lazy((c) => c.db) as ReturnType<typeof drizzle>;

/** Create tables and indexes if they do not exist. Idempotent. */
function createSchema(handle: DatabaseType): void {
  handle.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      email TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL,
      last_test_date INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      environment TEXT NOT NULL DEFAULT 'production',
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sites_client_id ON sites(client_id);

    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      site_id TEXT,
      test_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      severity TEXT,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      summary TEXT,
      findings TEXT,
      vulnerabilities_found INTEGER NOT NULL DEFAULT 0,
      critical_count INTEGER NOT NULL DEFAULT 0,
      high_count INTEGER NOT NULL DEFAULT 0,
      medium_count INTEGER NOT NULL DEFAULT 0,
      low_count INTEGER NOT NULL DEFAULT 0,
      executed_by TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tests_client_id ON tests(client_id);
    CREATE INDEX IF NOT EXISTS idx_tests_site_id ON tests(site_id);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      document_type TEXT NOT NULL,
      file_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      created_by TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      user_id TEXT,
      details TEXT,
      ip_address TEXT,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

    CREATE TABLE IF NOT EXISTS ai_health_metrics (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      cpu_usage INTEGER NOT NULL,
      memory_usage INTEGER NOT NULL,
      active_scans INTEGER NOT NULL DEFAULT 0,
      total_scans_today INTEGER NOT NULL DEFAULT 0,
      success_rate INTEGER NOT NULL,
      average_response_time INTEGER NOT NULL,
      models_loaded TEXT,
      last_training_date INTEGER,
      detection_accuracy INTEGER NOT NULL,
      false_positive_rate INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_timestamp ON ai_health_metrics(timestamp);

    CREATE TABLE IF NOT EXISTS ai_control_settings (
      id TEXT PRIMARY KEY,
      system_status TEXT NOT NULL DEFAULT 'active',
      kill_switch_enabled INTEGER NOT NULL DEFAULT 0,
      override_mode INTEGER NOT NULL DEFAULT 0,
      active_systems TEXT,
      max_concurrent_tests INTEGER NOT NULL DEFAULT 5,
      auto_shutdown_threshold INTEGER NOT NULL DEFAULT 90,
      last_modified_by TEXT,
      last_modified_at INTEGER NOT NULL
    );

    -- Where this deployment talks to, and with what. One row.
    --
    -- The keys are stored as written: encrypting them with something else on
    -- the same disk would be theatre, since anything the app can decrypt
    -- unattended so can anyone holding the file. The file's own permissions
    -- are what protect them, and the API never sends one back.
    CREATE TABLE IF NOT EXISTS connection_settings (
      id TEXT PRIMARY KEY,
      engine_url TEXT,
      engine_key TEXT,
      assistant_url TEXT,
      assistant_key TEXT,
      assistant_model TEXT,
      updated_at INTEGER NOT NULL,
      updated_by TEXT
    );

    CREATE TABLE IF NOT EXISTS ai_chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      sender TEXT NOT NULL,
      attachments TEXT,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);

    CREATE TABLE IF NOT EXISTS classifiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      accuracy INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      training_data_size INTEGER NOT NULL DEFAULT 0,
      last_trained_at INTEGER,
      created_at INTEGER NOT NULL,
      description TEXT
    );
  `);
}

/** Open the connection and create the schema if it is not there yet. */
export function initDatabase(): void {
  connect();
}
