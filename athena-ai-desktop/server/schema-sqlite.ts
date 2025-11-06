import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { randomUUID } from 'crypto';

// SQLite helper for generating UUIDs
export const uuid = () => sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`;

// Tables
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  email: text("email"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  lastTestDate: integer("last_test_date", { mode: 'timestamp' }),
  notes: text("notes"),
});

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  clientId: text("client_id").notNull(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  environment: text("environment").notNull().default("production"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const tests = sqliteTable("tests", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  clientId: text("client_id").notNull(),
  siteId: text("site_id"),
  testType: text("test_type").notNull(),
  status: text("status").notNull().default("pending"),
  severity: text("severity"),
  startedAt: integer("started_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  summary: text("summary"),
  findings: text("findings"), // JSON stored as text
  vulnerabilitiesFound: integer("vulnerabilities_found").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  highCount: integer("high_count").notNull().default(0),
  mediumCount: integer("medium_count").notNull().default(0),
  lowCount: integer("low_count").notNull().default(0),
  executedBy: text("executed_by"),
});

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  clientId: text("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  documentType: text("document_type").notNull(),
  fileUrl: text("file_url"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdBy: text("created_by"),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  userId: text("user_id"),
  details: text("details"), // JSON stored as text
  ipAddress: text("ip_address"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const aiHealthMetrics = sqliteTable("ai_health_metrics", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  activeScans: integer("active_scans").notNull().default(0),
  totalScansToday: integer("total_scans_today").notNull().default(0),
  successRate: integer("success_rate").notNull(),
  averageResponseTime: integer("average_response_time").notNull(),
  modelsLoaded: text("models_loaded"), // JSON array stored as text
  lastTrainingDate: integer("last_training_date", { mode: 'timestamp' }),
  detectionAccuracy: integer("detection_accuracy").notNull(),
  falsePositiveRate: integer("false_positive_rate").notNull(),
});

export const aiControlSettings = sqliteTable("ai_control_settings", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  systemStatus: text("system_status").notNull().default("active"),
  killSwitchEnabled: integer("kill_switch_enabled", { mode: 'boolean' }).notNull().default(false),
  overrideMode: integer("override_mode", { mode: 'boolean' }).notNull().default(false),
  activeSystems: text("active_systems"), // JSON array stored as text
  maxConcurrentTests: integer("max_concurrent_tests").notNull().default(5),
  autoShutdownThreshold: integer("auto_shutdown_threshold").notNull().default(90),
  lastModifiedBy: text("last_modified_by"),
  lastModifiedAt: integer("last_modified_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const aiChatMessages = sqliteTable("ai_chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  attachments: text("attachments"), // JSON stored as text
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const classifiers = sqliteTable("classifiers", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  accuracy: integer("accuracy").notNull(),
  status: text("status").notNull().default("active"),
  trainingDataSize: integer("training_data_size").notNull().default(0),
  lastTrainedAt: integer("last_trained_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  description: text("description"),
});

// These remain the same
export const scanResults = sqliteTable("scan_results", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  url: text("url").notNull(),
  status: text("status").notNull(),
  findings: text("findings"), // JSON stored as text
  startTime: integer("start_time", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  endTime: integer("end_time", { mode: 'timestamp' }),
  userId: text("user_id"),
});

export const cveResults = sqliteTable("cve_results", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  cveId: text("cve_id").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  classification: text("classification").notNull(),
  publishedDate: text("published_date"),
  lastModified: text("last_modified"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  userId: text("user_id"),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  resource: text("resource"),
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertSiteSchema = createInsertSchema(sites).omit({ id: true, createdAt: true });
export const insertTestSchema = createInsertSchema(tests).omit({ id: true, startedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, timestamp: true });
export const insertAIHealthMetricSchema = createInsertSchema(aiHealthMetrics).omit({ id: true, timestamp: true });
export const insertAIControlSettingSchema = createInsertSchema(aiControlSettings).omit({ id: true, lastModifiedAt: true });
export const insertAIChatMessageSchema = createInsertSchema(aiChatMessages).omit({ id: true, timestamp: true });
export const insertClassifierSchema = createInsertSchema(classifiers).omit({ id: true, createdAt: true });
export const insertScanResultSchema = createInsertSchema(scanResults).omit({ id: true, startTime: true });
export const insertCveResultSchema = createInsertSchema(cveResults).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });

// Types remain the same
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;
export type Site = typeof sites.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertAIHealthMetric = z.infer<typeof insertAIHealthMetricSchema>;
export type AIHealthMetric = typeof aiHealthMetrics.$inferSelect;
export type InsertAIControlSetting = z.infer<typeof insertAIControlSettingSchema>;
export type AIControlSetting = typeof aiControlSettings.$inferSelect;
export type InsertAIChatMessage = z.infer<typeof insertAIChatMessageSchema>;
export type AIChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertClassifier = z.infer<typeof insertClassifierSchema>;
export type Classifier = typeof classifiers.$inferSelect;
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;
export type InsertCveResult = z.infer<typeof insertCveResultSchema>;
export type CveResult = typeof cveResults.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;