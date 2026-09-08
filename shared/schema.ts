import { sqliteTable, text, integer, customType } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Athena data model.
 *
 * The runtime database is SQLite (better-sqlite3), so the schema is declared with
 * sqlite-core types. Booleans and timestamps are stored as INTEGER, JSON as TEXT.
 * IDs are generated in the storage layer (crypto.randomUUID) rather than by the DB.
 */

const id = () => text("id").primaryKey();
const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });
const bool = (name: string) => integer(name, { mode: "boolean" });
/**
 * A JSON column that tolerates a value it did not write.
 *
 * drizzle's own json mode calls JSON.parse on every read, so one malformed cell
 * left by an earlier version of the schema made every request that touched the
 * table answer 500, with no way back short of editing the database by hand.
 * A cell that will not parse reads as null.
 */
const jsonColumn = customType<{ data: unknown; driverData: string }>({
  dataType: () => "text",
  toDriver: (value) => JSON.stringify(value),
  fromDriver: (value) => {
    if (value === null || value === undefined) return value as unknown;
    try {
      return JSON.parse(value as string);
    } catch {
      console.warn("[schema] ignoring a JSON column that could not be parsed");
      return null;
    }
  },
});

const json = <T>(name: string) => jsonColumn(name).$type<T>();

export const USER_ROLES = ["admin", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = sqliteTable("users", {
  id: id(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  email: text("email"),
  isActive: bool("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
});

export const clients = sqliteTable("clients", {
  id: id(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
  lastTestDate: timestamp("last_test_date"),
  notes: text("notes"),
});

export const sites = sqliteTable("sites", {
  id: id(),
  clientId: text("client_id").notNull(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  environment: text("environment").notNull().default("production"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull(),
});

export const tests = sqliteTable("tests", {
  id: id(),
  clientId: text("client_id").notNull(),
  siteId: text("site_id"),
  testType: text("test_type").notNull(),
  status: text("status").notNull().default("pending"),
  severity: text("severity"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  summary: text("summary"),
  findings: json<unknown>("findings"),
  vulnerabilitiesFound: integer("vulnerabilities_found").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  highCount: integer("high_count").notNull().default(0),
  mediumCount: integer("medium_count").notNull().default(0),
  lowCount: integer("low_count").notNull().default(0),
  executedBy: text("executed_by"),
});

export const documents = sqliteTable("documents", {
  id: id(),
  clientId: text("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  documentType: text("document_type").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  createdBy: text("created_by"),
});

export const activityLogs = sqliteTable("activity_logs", {
  id: id(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  userId: text("user_id"),
  details: json<unknown>("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull(),
});

export const aiHealthMetrics = sqliteTable("ai_health_metrics", {
  id: id(),
  timestamp: timestamp("timestamp").notNull(),
  cpuUsage: integer("cpu_usage").notNull(),
  memoryUsage: integer("memory_usage").notNull(),
  activeScans: integer("active_scans").notNull().default(0),
  totalScansToday: integer("total_scans_today").notNull().default(0),
  successRate: integer("success_rate").notNull(),
  averageResponseTime: integer("average_response_time").notNull(),
  modelsLoaded: json<string[]>("models_loaded"),
  lastTrainingDate: timestamp("last_training_date"),
  detectionAccuracy: integer("detection_accuracy").notNull(),
  falsePositiveRate: integer("false_positive_rate").notNull(),
});

export const aiControlSettings = sqliteTable("ai_control_settings", {
  id: id(),
  systemStatus: text("system_status").notNull().default("active"),
  killSwitchEnabled: bool("kill_switch_enabled").notNull().default(false),
  overrideMode: bool("override_mode").notNull().default(false),
  activeSystems: json<string[]>("active_systems"),
  maxConcurrentTests: integer("max_concurrent_tests").notNull().default(5),
  autoShutdownThreshold: integer("auto_shutdown_threshold").notNull().default(90),
  lastModifiedBy: text("last_modified_by"),
  lastModifiedAt: timestamp("last_modified_at").notNull(),
});

/**
 * Where this deployment talks to, and with what.
 *
 * A singleton, like the AI control row above it. Before this the addresses
 * and keys were environment variables only, which is fine for a server and
 * useless for a desktop application: a packaged Electron build has no shell
 * to set them in, so both the engine and the assistant shipped permanently
 * disconnected with no way to connect them.
 *
 * The keys are stored as written. Encrypting them with something else on the
 * same disk would be theatre -- anything the app can decrypt unattended, so
 * can anyone holding the file -- so the honest arrangement is to say where
 * they live, keep them off the wire, and let the operating system's own file
 * permissions do the work they are for. They are never returned by the API:
 * the settings screen is told whether a key is set, never what it is.
 */
export const connectionSettings = sqliteTable("connection_settings", {
  id: id(),
  engineUrl: text("engine_url"),
  engineKey: text("engine_key"),
  assistantUrl: text("assistant_url"),
  assistantKey: text("assistant_key"),
  assistantModel: text("assistant_model"),
  updatedAt: timestamp("updated_at").notNull(),
  updatedBy: text("updated_by"),
});

export const aiChatMessages = sqliteTable("ai_chat_messages", {
  id: id(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  attachments: json<unknown>("attachments"),
  timestamp: timestamp("timestamp").notNull(),
});

export const classifiers = sqliteTable("classifiers", {
  id: id(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  accuracy: integer("accuracy").notNull(),
  status: text("status").notNull().default("active"),
  trainingDataSize: integer("training_data_size").notNull().default(0),
  lastTrainedAt: timestamp("last_trained_at"),
  createdAt: timestamp("created_at").notNull(),
  description: text("description"),
});

// ---------------------------------------------------------------------------
// Insert schemas. Dates arrive over JSON as ISO strings, so date fields that a
// client may set are coerced. Server-managed timestamps are omitted.
// ---------------------------------------------------------------------------

const optionalDate = z.coerce.date().nullable().optional();
const optionalStringArray = z.array(z.string()).nullable().optional();
const optionalJson = z.unknown().nullable().optional();

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(1).max(64),
  password: z.string().min(8).max(256),
  role: z.enum(USER_ROLES).default("user"),
  email: z.string().email().max(254).nullable().optional(),
}).omit({ id: true, createdAt: true });

export const insertClientSchema = createInsertSchema(clients, {
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  email: z.string().email().max(254),
  lastTestDate: optionalDate,
}).omit({ id: true, createdAt: true });

export const insertSiteSchema = createInsertSchema(sites, {
  url: z.string().min(1).max(2048),
  name: z.string().min(1).max(200),
}).omit({ id: true, createdAt: true });

export const insertTestSchema = createInsertSchema(tests, {
  testType: z.string().min(1).max(100),
  completedAt: optionalDate,
  findings: optionalJson,
}).omit({ id: true, startedAt: true });

export const insertDocumentSchema = createInsertSchema(documents, {
  title: z.string().min(1).max(300),
  documentType: z.string().min(1).max(100),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertActivityLogSchema = createInsertSchema(activityLogs, {
  details: optionalJson,
}).omit({ id: true, timestamp: true });

export const insertAIHealthMetricSchema = createInsertSchema(aiHealthMetrics, {
  modelsLoaded: optionalStringArray,
  lastTrainingDate: optionalDate,
}).omit({ id: true, timestamp: true });

export const insertAIControlSettingSchema = createInsertSchema(aiControlSettings, {
  activeSystems: optionalStringArray,
}).omit({ id: true, lastModifiedAt: true });

/**
 * An address this deployment will actually try to fetch.
 *
 * `z.string().url()` is not enough on its own: it is `new URL()` underneath,
 * and `new URL("engine.internal:8099")` parses -- `engine.internal:` is read
 * as a scheme. So a host and port with the scheme left off is accepted, and
 * the confusing failure arrives much later, out of fetch, in front of
 * somebody who has already closed the settings screen.
 */
const httpUrl = z
  .string()
  .max(2000)
  .refine(
    (value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: "must be an http:// or https:// address" },
  );

// Every field optional and nullable: a settings form saves what it was given
// and leaves the rest alone. Checked here rather than at the point of use, so
// a typo is refused while somebody is still looking at the field.
export const updateConnectionSettingsSchema = z.object({
  engineUrl: httpUrl.or(z.literal("")).nullish(),
  engineKey: z.string().max(500).or(z.literal("")).nullish(),
  assistantUrl: httpUrl.or(z.literal("")).nullish(),
  assistantKey: z.string().max(500).or(z.literal("")).nullish(),
  assistantModel: z.string().max(200).or(z.literal("")).nullish(),
});

export const insertAIChatMessageSchema = createInsertSchema(aiChatMessages, {
  message: z.string().min(1).max(20000),
  sender: z.enum(["user", "ai", "system"]),
  attachments: optionalJson,
}).omit({ id: true, timestamp: true });

export const insertClassifierSchema = createInsertSchema(classifiers, {
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(100),
  lastTrainedAt: optionalDate,
}).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "password">;
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
export type ConnectionSetting = typeof connectionSettings.$inferSelect;
export type UpdateConnectionSettings = z.infer<typeof updateConnectionSettingsSchema>;
export type InsertClassifier = z.infer<typeof insertClassifierSchema>;
export type Classifier = typeof classifiers.$inferSelect;
