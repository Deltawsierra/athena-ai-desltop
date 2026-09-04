import {
  type User, type InsertUser,
  type Client, type InsertClient,
  type Site, type InsertSite,
  type Test, type InsertTest,
  type Document, type InsertDocument,
  type ActivityLog, type InsertActivityLog,
  type AIHealthMetric, type InsertAIHealthMetric,
  type AIControlSetting, type InsertAIControlSetting,
  type AIChatMessage, type InsertAIChatMessage,
  type Classifier, type InsertClassifier,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword, verifyPassword, dummyVerify } from "./password";

/**
 * The single storage contract. Both the SQLite backend (production) and the
 * in-memory backend (tests) implement exactly this interface, so routes never
 * need to know which one is active.
 */
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  /** Returns the user when the credentials match; re-hashes legacy passwords. */
  validateUser(username: string, password: string): Promise<User | undefined>;

  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Sites
  getSite(id: string): Promise<Site | undefined>;
  getAllSites(): Promise<Site[]>;
  getSitesByClient(clientId: string): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, site: Partial<InsertSite>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;

  // Tests
  getTest(id: string): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  getTestsByClient(clientId: string): Promise<Test[]>;
  getTestsBySite(siteId: string): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentsByClient(clientId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Activity logs
  getAllActivityLogs(): Promise<ActivityLog[]>;
  getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // AI health
  getLatestAIHealthMetric(): Promise<AIHealthMetric | undefined>;
  getAIHealthMetrics(limit: number): Promise<AIHealthMetric[]>;
  createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric>;

  // AI control (single row)
  getAIControlSettings(): Promise<AIControlSetting | undefined>;
  updateAIControlSettings(settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting>;

  // Chat
  getChatMessage(id: string): Promise<AIChatMessage | undefined>;
  getAllChatMessages(): Promise<AIChatMessage[]>;
  getChatMessagesByUser(userId: string): Promise<AIChatMessage[]>;
  createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage>;
  deleteChatMessage(id: string): Promise<boolean>;

  // Classifiers
  getAllClassifiers(): Promise<Classifier[]>;
  getClassifier(id: string): Promise<Classifier | undefined>;
  createClassifier(classifier: InsertClassifier): Promise<Classifier>;
  updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined>;
  deleteClassifier(id: string): Promise<boolean>;
}

function defaultControlSettings(): AIControlSetting {
  return {
    id: randomUUID(),
    systemStatus: "active",
    killSwitchEnabled: false,
    overrideMode: false,
    activeSystems: [],
    maxConcurrentTests: 5,
    autoShutdownThreshold: 90,
    lastModifiedBy: null,
    lastModifiedAt: new Date(),
  };
}

/** In-memory backend. Used by tests and by ATHENA_STORAGE=memory. */

/**
 * Return a copy, never the stored object.
 *
 * The in-memory backend used to hand out live references, so a caller that
 * mutated a returned record rewrote the store behind everyone's back. The
 * SQLite backend cannot do that, and the two must behave alike.
 */
function copy<T>(value: T | undefined): T | undefined {
  return value === undefined ? undefined : ({ ...(value as object) } as T);
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private clients = new Map<string, Client>();
  private sites = new Map<string, Site>();
  private tests = new Map<string, Test>();
  private documents = new Map<string, Document>();
  private activityLogs = new Map<string, ActivityLog>();
  private aiHealthMetrics = new Map<string, AIHealthMetric>();
  private aiControlSettings: AIControlSetting | undefined = defaultControlSettings();
  private chatMessages = new Map<string, AIChatMessage>();
  private classifiers = new Map<string, Classifier>();

  // Users
  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }
  async getAllUsers() { return Array.from(this.users.values()); }
  async createUser(insertUser: InsertUser): Promise<User> {
    // SQLite enforces users.username UNIQUE and this backend did not, so the
    // two disagreed about a duplicate: here the second row was accepted and
    // could then never sign in, because the lookup returns the first.
    const clash = Array.from(this.users.values()).some(
      (existing) => existing.username === insertUser.username,
    );
    if (clash) {
      const error = new Error("UNIQUE constraint failed: users.username") as Error & { code?: string };
      error.code = "SQLITE_CONSTRAINT_UNIQUE";
      throw error;
    }

    const user: User = {
      email: null,
      isActive: true,
      ...insertUser,
      password: hashPassword(insertUser.password),
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id: string, updates: Partial<InsertUser>) {
    const user = this.users.get(id);
    if (!user) return undefined;
    const next = { ...updates };
    if (next.password) next.password = hashPassword(next.password);
    const updated: User = { ...user, ...next };
    this.users.set(id, updated);
    return updated;
  }
  async deleteUser(id: string) { return this.users.delete(id); }
  async validateUser(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) {
      // Spend the same work as a real check. Returning immediately made login
      // timing a username oracle: an unknown name answered in about a
      // twentieth of the time a real one took.
      dummyVerify(password);
      return undefined;
    }
    const result = verifyPassword(password, user.password);
    if (!result.ok) return undefined;
    if (result.needsRehash) {
      user.password = hashPassword(password);
      this.users.set(user.id, user);
    }
    return user;
  }

  // Clients
  async getClient(id: string) { return this.clients.get(id); }
  async getAllClients() { return Array.from(this.clients.values()); }
  async createClient(insertClient: InsertClient): Promise<Client> {
    const client: Client = {
      status: "active",
      phone: null,
      notes: null,
      lastTestDate: null,
      ...insertClient,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.clients.set(client.id, client);
    return client;
  }
  async updateClient(id: string, updates: Partial<InsertClient>) {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updated: Client = { ...client, ...updates };
    this.clients.set(id, updated);
    return updated;
  }
  async deleteClient(id: string) {
    // Match the SQLite backend, which removes the client's children with it.
    for (const [testId, test] of Array.from(this.tests.entries())) {
      if (test.clientId === id) this.tests.delete(testId);
    }
    for (const [siteId, site] of Array.from(this.sites.entries())) {
      if (site.clientId === id) this.sites.delete(siteId);
    }
    for (const [docId, doc] of Array.from(this.documents.entries())) {
      if (doc.clientId === id) this.documents.delete(docId);
    }
    return this.clients.delete(id);
  }

  // Sites
  async getSite(id: string) { return this.sites.get(id); }
  async getAllSites() { return Array.from(this.sites.values()); }
  async getSitesByClient(clientId: string) {
    return Array.from(this.sites.values()).filter((s) => s.clientId === clientId);
  }
  async createSite(insertSite: InsertSite): Promise<Site> {
    const site: Site = {
      environment: "production",
      status: "active",
      ...insertSite,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.sites.set(site.id, site);
    return site;
  }
  async updateSite(id: string, updates: Partial<InsertSite>) {
    const site = this.sites.get(id);
    if (!site) return undefined;
    const updated: Site = { ...site, ...updates };
    this.sites.set(id, updated);
    return updated;
  }
  async deleteSite(id: string) { return this.sites.delete(id); }

  // Tests
  async getTest(id: string) { return this.tests.get(id); }
  async getAllTests() { return Array.from(this.tests.values()); }
  async getTestsByClient(clientId: string) {
    return Array.from(this.tests.values()).filter((t) => t.clientId === clientId);
  }
  async getTestsBySite(siteId: string) {
    return Array.from(this.tests.values()).filter((t) => t.siteId === siteId);
  }
  async createTest(insertTest: InsertTest): Promise<Test> {
    const test: Test = {
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
      ...insertTest,
      id: randomUUID(),
      startedAt: new Date(),
    };
    this.tests.set(test.id, test);
    return test;
  }
  async updateTest(id: string, updates: Partial<InsertTest>) {
    const test = this.tests.get(id);
    if (!test) return undefined;
    const updated: Test = { ...test, ...updates };
    this.tests.set(id, updated);
    return updated;
  }
  async deleteTest(id: string) { return this.tests.delete(id); }

  // Documents
  async getDocument(id: string) { return this.documents.get(id); }
  async getAllDocuments() { return Array.from(this.documents.values()); }
  async getDocumentsByClient(clientId: string) {
    return Array.from(this.documents.values()).filter((d) => d.clientId === clientId);
  }
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const now = new Date();
    const document: Document = {
      description: null,
      fileUrl: null,
      createdBy: null,
      ...insertDocument,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(document.id, document);
    return document;
  }
  async updateDocument(id: string, updates: Partial<InsertDocument>) {
    const document = this.documents.get(id);
    if (!document) return undefined;
    const updated: Document = { ...document, ...updates, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }
  async deleteDocument(id: string) { return this.documents.delete(id); }

  // Activity logs
  async getAllActivityLogs() {
    // Reverse before sorting so that entries written in the same millisecond
    // come back newest first, matching SQLite's rowid tiebreak. Sorting the
    // insertion order directly returned same-millisecond ties oldest first, so
    // "newest first" meant the opposite thing in tests and in production.
    return Array.from(this.activityLogs.values())
      .reverse()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .map((log) => ({ ...log }));
  }
  async getActivityLogsByEntity(entityType: string, entityId: string) {
    return (await this.getAllActivityLogs()).filter(
      (l) => l.entityType === entityType && l.entityId === entityId,
    );
  }
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      entityId: null,
      userId: null,
      details: null,
      ipAddress: null,
      ...insertLog,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.activityLogs.set(log.id, log);
    return log;
  }

  // AI health
  async getLatestAIHealthMetric() {
    return (await this.getAIHealthMetrics(1))[0];
  }
  async getAIHealthMetrics(limit: number) {
    // Same clamp as the SQLite backend, which bounded it to 1..1000.
    const bounded = Math.min(Math.max(Number.isFinite(limit) ? limit : 50, 1), 1000);
    return Array.from(this.aiHealthMetrics.values())
      .reverse()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, bounded)
      .map((metric) => ({ ...metric }));
  }
  async createAIHealthMetric(insertMetric: InsertAIHealthMetric): Promise<AIHealthMetric> {
    const metric: AIHealthMetric = {
      activeScans: 0,
      totalScansToday: 0,
      modelsLoaded: null,
      lastTrainingDate: null,
      ...insertMetric,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.aiHealthMetrics.set(metric.id, metric);
    return metric;
  }

  // AI control
  async getAIControlSettings() { return this.aiControlSettings; }
  async updateAIControlSettings(updates: Partial<InsertAIControlSetting>) {
    const base = this.aiControlSettings ?? defaultControlSettings();
    this.aiControlSettings = { ...base, ...updates, lastModifiedAt: new Date() };
    return this.aiControlSettings;
  }

  // Chat
  async getChatMessage(id: string) { return copy(this.chatMessages.get(id)); }
  async getAllChatMessages() {
    return Array.from(this.chatMessages.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }
  async getChatMessagesByUser(userId: string) {
    return (await this.getAllChatMessages()).filter((m) => m.userId === userId);
  }
  async createChatMessage(insertMessage: InsertAIChatMessage): Promise<AIChatMessage> {
    const message: AIChatMessage = {
      attachments: null,
      ...insertMessage,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.chatMessages.set(message.id, message);
    return message;
  }
  async deleteChatMessage(id: string) { return this.chatMessages.delete(id); }

  // Classifiers
  async getAllClassifiers() { return Array.from(this.classifiers.values()); }
  async getClassifier(id: string) { return this.classifiers.get(id); }
  async createClassifier(insertClassifier: InsertClassifier): Promise<Classifier> {
    const classifier: Classifier = {
      status: "active",
      trainingDataSize: 0,
      lastTrainedAt: null,
      description: null,
      ...insertClassifier,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.classifiers.set(classifier.id, classifier);
    return classifier;
  }
  async updateClassifier(id: string, updates: Partial<InsertClassifier>) {
    const classifier = this.classifiers.get(id);
    if (!classifier) return undefined;
    const updated: Classifier = { ...classifier, ...updates };
    this.classifiers.set(id, updated);
    return updated;
  }
  async deleteClassifier(id: string) { return this.classifiers.delete(id); }
}

export const storage = new MemStorage();
