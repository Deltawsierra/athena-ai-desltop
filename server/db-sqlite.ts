import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@shared/schema';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Determine database location based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isElectron = process.env.ELECTRON_RUN_AS_NODE === '1' || process.versions?.electron;
const useDesktopStorage = isElectron || process.env.USE_SQLITE === 'true';

// Database path for desktop app
let dbPath: string;
if (isElectron && process.versions?.electron) {
  // In Electron, store in user data directory (handled by Electron main process)
  const userDataPath = path.join(process.env.HOME || '', '.athena-ai');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  dbPath = path.join(userDataPath, 'athena.db');
} else if (useDesktopStorage) {
  // For development/testing with SQLite
  dbPath = path.join(__dirname, '..', 'athena.db');
} else {
  // For regular development
  dbPath = path.join(__dirname, '..', 'athena.db');
}

console.log(`Database path: ${dbPath}`);

// Create SQLite database connection
export const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL'); // Better performance
sqlite.pragma('foreign_keys = ON'); // Enable foreign key constraints

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with tables
export function initDatabase() {
  try {
    console.log('Initializing SQLite database...');
    
    // Create tables using raw SQL (simple approach for now)
    sqlite.exec(`
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

      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        sender TEXT NOT NULL,
        attachments TEXT,
        timestamp INTEGER NOT NULL
      );

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

      CREATE TABLE IF NOT EXISTS scan_results (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        status TEXT NOT NULL,
        findings TEXT,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        user_id TEXT
      );

      CREATE TABLE IF NOT EXISTS cve_results (
        id TEXT PRIMARY KEY,
        cve_id TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        classification TEXT NOT NULL,
        published_date TEXT,
        last_modified TEXT,
        created_at INTEGER NOT NULL,
        user_id TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT,
        details TEXT,
        ip_address TEXT,
        timestamp INTEGER NOT NULL
      );
    `);

    // Check if we need to seed default users
    const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (userCount.count === 0) {
      console.log('Seeding default users...');
      
      // Hash password (simple example - in production use bcrypt)
      const hashPassword = (password: string): string => {
        return crypto.createHash('sha256').update(password).digest('hex');
      };
      
      const adminId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const now = Date.now();
      
      sqlite.prepare(`
        INSERT INTO users (id, username, password, role, email, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(adminId, 'admin', hashPassword('admin123'), 'admin', 'admin@athenaai.com', 1, now);
      
      sqlite.prepare(`
        INSERT INTO users (id, username, password, role, email, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, 'testuser', hashPassword('password123'), 'user', 'user@athenaai.com', 1, now);
      
      console.log('Default users created');
    }

    // Initialize AI Control Settings if not exists
    const aiSettingsCount = sqlite.prepare('SELECT COUNT(*) as count FROM ai_control_settings').get() as { count: number };
    
    if (aiSettingsCount.count === 0) {
      const settingsId = crypto.randomUUID();
      const now = Date.now();
      
      sqlite.prepare(`
        INSERT INTO ai_control_settings (id, system_status, kill_switch_enabled, override_mode, active_systems, max_concurrent_tests, auto_shutdown_threshold, last_modified_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(settingsId, 'active', 0, 0, '["scanner","classifier","monitor"]', 5, 90, now);
      
      console.log('AI Control Settings initialized');
    }

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Initialize on import
initDatabase();