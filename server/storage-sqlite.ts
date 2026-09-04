import { db } from "./db-sqlite";
import * as schema from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";
import crypto from "crypto";
import type { IStorage } from "./storage";
import { hashPassword, verifyPassword } from "./password";
import type {
  User, InsertUser,
  Client, InsertClient,
  Site, InsertSite,
  Test, InsertTest,
  Document, InsertDocument,
  ActivityLog, InsertActivityLog,
  AIHealthMetric, InsertAIHealthMetric,
  AIControlSetting, InsertAIControlSetting,
  AIChatMessage, InsertAIChatMessage,
  Classifier, InsertClassifier,
} from "@shared/schema";

/**
 * SQLite backend. All methods are synchronous under the hood (better-sqlite3)
 * but exposed as async to satisfy IStorage.
 */
export class SqliteStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    return db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  }
  async getAllUsers(): Promise<User[]> {
    return db.select().from(schema.users).all();
  }
  async createUser(user: InsertUser): Promise<User> {
    const row: User = {
      email: null,
      isActive: true,
      ...user,
      password: hashPassword(user.password),
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    db.insert(schema.users).values(row).run();
    return row;
  }
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const updates = { ...user };
    if (updates.password) updates.password = hashPassword(updates.password);
    if (Object.keys(updates).length > 0) {
      db.update(schema.users).set(updates).where(eq(schema.users.id, id)).run();
    }
    return this.getUser(id);
  }
  async deleteUser(id: string): Promise<boolean> {
    return db.delete(schema.users).where(eq(schema.users.id, id)).run().changes > 0;
  }
  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    const result = verifyPassword(password, user.password);
    if (!result.ok) return undefined;
    if (result.needsRehash) {
      const rehashed = hashPassword(password);
      db.update(schema.users).set({ password: rehashed }).where(eq(schema.users.id, user.id)).run();
      user.password = rehashed;
    }
    return user;
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    return db.select().from(schema.clients).where(eq(schema.clients.id, id)).get();
  }
  async getAllClients(): Promise<Client[]> {
    return db.select().from(schema.clients).all();
  }
  async createClient(client: InsertClient): Promise<Client> {
    const row: Client = {
      status: "active",
      phone: null,
      notes: null,
      lastTestDate: null,
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    db.insert(schema.clients).values(row).run();
    return row;
  }
  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    if (Object.keys(client).length > 0) {
      db.update(schema.clients).set(client).where(eq(schema.clients.id, id)).run();
    }
    return this.getClient(id);
  }
  async deleteClient(id: string): Promise<boolean> {
    return db.delete(schema.clients).where(eq(schema.clients.id, id)).run().changes > 0;
  }

  // Sites
  async getSite(id: string): Promise<Site | undefined> {
    return db.select().from(schema.sites).where(eq(schema.sites.id, id)).get();
  }
  async getAllSites(): Promise<Site[]> {
    return db.select().from(schema.sites).all();
  }
  async getSitesByClient(clientId: string): Promise<Site[]> {
    return db.select().from(schema.sites).where(eq(schema.sites.clientId, clientId)).all();
  }
  async createSite(site: InsertSite): Promise<Site> {
    const row: Site = {
      environment: "production",
      status: "active",
      ...site,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    db.insert(schema.sites).values(row).run();
    return row;
  }
  async updateSite(id: string, site: Partial<InsertSite>): Promise<Site | undefined> {
    if (Object.keys(site).length > 0) {
      db.update(schema.sites).set(site).where(eq(schema.sites.id, id)).run();
    }
    return this.getSite(id);
  }
  async deleteSite(id: string): Promise<boolean> {
    return db.delete(schema.sites).where(eq(schema.sites.id, id)).run().changes > 0;
  }

  // Tests
  async getTest(id: string): Promise<Test | undefined> {
    return db.select().from(schema.tests).where(eq(schema.tests.id, id)).get();
  }
  async getAllTests(): Promise<Test[]> {
    return db.select().from(schema.tests).all();
  }
  async getTestsByClient(clientId: string): Promise<Test[]> {
    return db.select().from(schema.tests).where(eq(schema.tests.clientId, clientId)).all();
  }
  async getTestsBySite(siteId: string): Promise<Test[]> {
    return db.select().from(schema.tests).where(eq(schema.tests.siteId, siteId)).all();
  }
  async createTest(test: InsertTest): Promise<Test> {
    const row: Test = {
      status: "pending",
      siteId: null,
      severity: null,
      completedAt: null,
      summary: null,
      findings: null,
      vulnerabilitiesFound: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      executedBy: null,
      ...test,
      id: crypto.randomUUID(),
      startedAt: new Date(),
    };
    db.insert(schema.tests).values(row).run();
    return row;
  }
  async updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined> {
    if (Object.keys(test).length > 0) {
      db.update(schema.tests).set(test).where(eq(schema.tests.id, id)).run();
    }
    return this.getTest(id);
  }
  async deleteTest(id: string): Promise<boolean> {
    return db.delete(schema.tests).where(eq(schema.tests.id, id)).run().changes > 0;
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    return db.select().from(schema.documents).where(eq(schema.documents.id, id)).get();
  }
  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(schema.documents).all();
  }
  async getDocumentsByClient(clientId: string): Promise<Document[]> {
    return db.select().from(schema.documents).where(eq(schema.documents.clientId, clientId)).all();
  }
  async createDocument(document: InsertDocument): Promise<Document> {
    const now = new Date();
    const row: Document = {
      description: null,
      fileUrl: null,
      createdBy: null,
      ...document,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    db.insert(schema.documents).values(row).run();
    return row;
  }
  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined> {
    db.update(schema.documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(schema.documents.id, id))
      .run();
    return this.getDocument(id);
  }
  async deleteDocument(id: string): Promise<boolean> {
    return db.delete(schema.documents).where(eq(schema.documents.id, id)).run().changes > 0;
  }

  // Activity logs
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.timestamp)).all();
  }
  async getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    return db
      .select()
      .from(schema.activityLogs)
      .where(and(eq(schema.activityLogs.entityType, entityType), eq(schema.activityLogs.entityId, entityId)))
      .orderBy(desc(schema.activityLogs.timestamp))
      .all();
  }
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const row: ActivityLog = {
      entityId: null,
      userId: null,
      details: null,
      ipAddress: null,
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    db.insert(schema.activityLogs).values(row).run();
    return row;
  }

  // AI health
  async getLatestAIHealthMetric(): Promise<AIHealthMetric | undefined> {
    return db.select().from(schema.aiHealthMetrics).orderBy(desc(schema.aiHealthMetrics.timestamp)).limit(1).get();
  }
  async getAIHealthMetrics(limit: number): Promise<AIHealthMetric[]> {
    return db
      .select()
      .from(schema.aiHealthMetrics)
      .orderBy(desc(schema.aiHealthMetrics.timestamp))
      .limit(Math.max(1, Math.min(limit, 1000)))
      .all();
  }
  async createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric> {
    const row: AIHealthMetric = {
      activeScans: 0,
      totalScansToday: 0,
      modelsLoaded: null,
      lastTrainingDate: null,
      ...metric,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    db.insert(schema.aiHealthMetrics).values(row).run();
    return row;
  }

  // AI control (single row, created on first update)
  async getAIControlSettings(): Promise<AIControlSetting | undefined> {
    return db.select().from(schema.aiControlSettings).limit(1).get();
  }
  async updateAIControlSettings(settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting> {
    const existing = await this.getAIControlSettings();
    const now = new Date();
    if (!existing) {
      const row: AIControlSetting = {
        systemStatus: "active",
        killSwitchEnabled: false,
        overrideMode: false,
        activeSystems: [],
        maxConcurrentTests: 5,
        autoShutdownThreshold: 90,
        lastModifiedBy: null,
        ...settings,
        id: crypto.randomUUID(),
        lastModifiedAt: now,
      };
      db.insert(schema.aiControlSettings).values(row).run();
      return row;
    }
    db.update(schema.aiControlSettings)
      .set({ ...settings, lastModifiedAt: now })
      .where(eq(schema.aiControlSettings.id, existing.id))
      .run();
    return (await this.getAIControlSettings())!;
  }

  // Chat
  async getAllChatMessages(): Promise<AIChatMessage[]> {
    return db.select().from(schema.aiChatMessages).orderBy(schema.aiChatMessages.timestamp).all();
  }
  async getChatMessagesByUser(userId: string): Promise<AIChatMessage[]> {
    return db
      .select()
      .from(schema.aiChatMessages)
      .where(eq(schema.aiChatMessages.userId, userId))
      .orderBy(schema.aiChatMessages.timestamp)
      .all();
  }
  async createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    const row: AIChatMessage = {
      attachments: null,
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    db.insert(schema.aiChatMessages).values(row).run();
    return row;
  }
  async deleteChatMessage(id: string): Promise<boolean> {
    return db.delete(schema.aiChatMessages).where(eq(schema.aiChatMessages.id, id)).run().changes > 0;
  }

  // Classifiers
  async getAllClassifiers(): Promise<Classifier[]> {
    return db.select().from(schema.classifiers).all();
  }
  async getClassifier(id: string): Promise<Classifier | undefined> {
    return db.select().from(schema.classifiers).where(eq(schema.classifiers.id, id)).get();
  }
  async createClassifier(classifier: InsertClassifier): Promise<Classifier> {
    const row: Classifier = {
      status: "active",
      trainingDataSize: 0,
      lastTrainedAt: null,
      description: null,
      ...classifier,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    db.insert(schema.classifiers).values(row).run();
    return row;
  }
  async updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined> {
    if (Object.keys(classifier).length > 0) {
      db.update(schema.classifiers).set(classifier).where(eq(schema.classifiers.id, id)).run();
    }
    return this.getClassifier(id);
  }
  async deleteClassifier(id: string): Promise<boolean> {
    return db.delete(schema.classifiers).where(eq(schema.classifiers.id, id)).run().changes > 0;
  }
}

export const storage = new SqliteStorage();
