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
  type Classifier, type InsertClassifier
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getSite(id: string): Promise<Site | undefined>;
  getSitesByClient(clientId: string): Promise<Site[]>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: string, site: Partial<InsertSite>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;

  getTest(id: string): Promise<Test | undefined>;
  getAllTests(): Promise<Test[]>;
  getTestsByClient(clientId: string): Promise<Test[]>;
  getTestsBySite(siteId: string): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;

  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByClient(clientId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  getAllActivityLogs(): Promise<ActivityLog[]>;
  getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  getLatestAIHealthMetric(): Promise<AIHealthMetric | undefined>;
  getAIHealthMetrics(limit: number): Promise<AIHealthMetric[]>;
  createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric>;

  getAIControlSettings(): Promise<AIControlSetting | undefined>;
  updateAIControlSettings(settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting>;
  
  getAllChatMessages(): Promise<AIChatMessage[]>;
  getChatMessagesByUser(userId: string): Promise<AIChatMessage[]>;
  createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage>;
  deleteChatMessage(id: string): Promise<boolean>;

  getAllClassifiers(): Promise<Classifier[]>;
  getClassifier(id: string): Promise<Classifier | undefined>;
  createClassifier(classifier: InsertClassifier): Promise<Classifier>;
  updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined>;
  deleteClassifier(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private clients: Map<string, Client>;
  private sites: Map<string, Site>;
  private tests: Map<string, Test>;
  private documents: Map<string, Document>;
  private activityLogs: Map<string, ActivityLog>;
  private aiHealthMetrics: Map<string, AIHealthMetric>;
  private aiControlSettings: AIControlSetting | undefined;
  private chatMessages: Map<string, AIChatMessage>;
  private classifiers: Map<string, Classifier>;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.sites = new Map();
    this.tests = new Map();
    this.documents = new Map();
    this.activityLogs = new Map();
    this.aiHealthMetrics = new Map();
    this.chatMessages = new Map();
    this.classifiers = new Map();
    this.aiControlSettings = {
      id: randomUUID(),
      systemStatus: "active",
      killSwitchEnabled: false,
      overrideMode: false,
      activeSystems: ["penetration-testing", "vulnerability-scanner", "threat-detection"],
      maxConcurrentTests: 5,
      autoShutdownThreshold: 90,
      lastModifiedBy: null,
      lastModifiedAt: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      role: "user",
      email: null,
      isActive: true,
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { 
      status: "active",
      phone: null,
      notes: null,
      ...insertClient, 
      id, 
      createdAt: new Date(), 
      lastTestDate: null 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    const updated = { ...client, ...updates };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getSite(id: string): Promise<Site | undefined> {
    return this.sites.get(id);
  }

  async getSitesByClient(clientId: string): Promise<Site[]> {
    return Array.from(this.sites.values()).filter(site => site.clientId === clientId);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = randomUUID();
    const site: Site = { 
      environment: "production",
      status: "active",
      ...insertSite, 
      id, 
      createdAt: new Date() 
    };
    this.sites.set(id, site);
    return site;
  }

  async updateSite(id: string, updates: Partial<InsertSite>): Promise<Site | undefined> {
    const site = this.sites.get(id);
    if (!site) return undefined;
    const updated = { ...site, ...updates };
    this.sites.set(id, updated);
    return updated;
  }

  async deleteSite(id: string): Promise<boolean> {
    return this.sites.delete(id);
  }

  async getTest(id: string): Promise<Test | undefined> {
    return this.tests.get(id);
  }

  async getAllTests(): Promise<Test[]> {
    return Array.from(this.tests.values());
  }

  async getTestsByClient(clientId: string): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(test => test.clientId === clientId);
  }

  async getTestsBySite(siteId: string): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(test => test.siteId === siteId);
  }

  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = randomUUID();
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
      id, 
      startedAt: new Date() 
    };
    this.tests.set(id, test);
    return test;
  }

  async updateTest(id: string, updates: Partial<InsertTest>): Promise<Test | undefined> {
    const test = this.tests.get(id);
    if (!test) return undefined;
    const updated = { ...test, ...updates };
    this.tests.set(id, updated);
    return updated;
  }

  async deleteTest(id: string): Promise<boolean> {
    return this.tests.delete(id);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByClient(clientId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.clientId === clientId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = { 
      description: null,
      fileUrl: null,
      createdBy: null,
      ...insertDocument, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    const updated = { ...document, ...updates, updatedAt: new Date() };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.entityType === entityType && log.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const log: ActivityLog = { 
      entityId: null,
      userId: null,
      details: null,
      ipAddress: null,
      ...insertLog, 
      id, 
      timestamp: new Date() 
    };
    this.activityLogs.set(id, log);
    return log;
  }

  async getLatestAIHealthMetric(): Promise<AIHealthMetric | undefined> {
    const metrics = Array.from(this.aiHealthMetrics.values());
    if (metrics.length === 0) return undefined;
    return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async getAIHealthMetrics(limit: number): Promise<AIHealthMetric[]> {
    return Array.from(this.aiHealthMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createAIHealthMetric(insertMetric: InsertAIHealthMetric): Promise<AIHealthMetric> {
    const id = randomUUID();
    const metric: AIHealthMetric = { 
      activeScans: 0,
      totalScansToday: 0,
      modelsLoaded: null,
      lastTrainingDate: null,
      ...insertMetric, 
      id, 
      timestamp: new Date() 
    };
    this.aiHealthMetrics.set(id, metric);
    return metric;
  }

  async getLatestAIHealthMetrics(): Promise<AIHealthMetric | undefined> {
    return this.getLatestAIHealthMetric();
  }

  async getAllAIHealthMetrics(): Promise<AIHealthMetric[]> {
    return Array.from(this.aiHealthMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAIControlSettings(): Promise<AIControlSetting | undefined> {
    return this.aiControlSettings;
  }

  async updateAIControlSettings(updates: Partial<InsertAIControlSetting>): Promise<AIControlSetting> {
    if (!this.aiControlSettings) {
      this.aiControlSettings = {
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
    this.aiControlSettings = {
      ...this.aiControlSettings,
      ...updates,
      lastModifiedAt: new Date(),
    };
    return this.aiControlSettings;
  }

  async getAllChatMessages(): Promise<AIChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getChatMessagesByUser(userId: string): Promise<AIChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertAIChatMessage): Promise<AIChatMessage> {
    const id = randomUUID();
    const message: AIChatMessage = {
      attachments: null,
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async deleteChatMessage(id: string): Promise<boolean> {
    return this.chatMessages.delete(id);
  }

  async getAllClassifiers(): Promise<Classifier[]> {
    return Array.from(this.classifiers.values());
  }

  async getClassifier(id: string): Promise<Classifier | undefined> {
    return this.classifiers.get(id);
  }

  async createClassifier(insertClassifier: InsertClassifier): Promise<Classifier> {
    const id = randomUUID();
    const classifier: Classifier = {
      status: "active",
      trainingDataSize: 0,
      lastTrainedAt: null,
      description: null,
      ...insertClassifier,
      id,
      createdAt: new Date(),
    };
    this.classifiers.set(id, classifier);
    return classifier;
  }

  async updateClassifier(id: string, updates: Partial<InsertClassifier>): Promise<Classifier | undefined> {
    const classifier = this.classifiers.get(id);
    if (!classifier) return undefined;
    const updated = { ...classifier, ...updates };
    this.classifiers.set(id, updated);
    return updated;
  }

  async deleteClassifier(id: string): Promise<boolean> {
    return this.classifiers.delete(id);
  }

  // Additional methods for compatibility
  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return undefined;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getAllScans(): Promise<any[]> {
    // Mock implementation for scans
    return [];
  }

  async createScan(scan: any): Promise<any> {
    // Mock implementation for scans
    return { id: randomUUID(), ...scan, startTime: new Date() };
  }

  async getAllCves(): Promise<any[]> {
    // Mock implementation for CVEs
    return [];
  }

  async createCve(cve: any): Promise<any> {
    // Mock implementation for CVEs
    return { id: randomUUID(), ...cve, createdAt: new Date() };
  }

  async getAuditLogs(): Promise<any[]> {
    // Mock implementation for audit logs
    return [];
  }

  async createAuditLog(log: any): Promise<any> {
    // Mock implementation for audit logs
    return { id: randomUUID(), ...log, timestamp: new Date() };
  }
}

export const storage = new MemStorage();
