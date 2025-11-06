import { db, sqlite } from './db-sqlite';
import * as schema from './schema-sqlite';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Types imported from schema-sqlite
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
  ScanResult, InsertScanResult,
  CveResult, InsertCveResult,
  AuditLog, InsertAuditLog
} from './schema-sqlite';

// Helper function to hash passwords
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Storage interface implementation using SQLite
export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  validateUser(username: string, password: string): Promise<User | undefined>;

  // Client operations
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Test operations
  getTests(): Promise<Test[]>;
  getTestById(id: string): Promise<Test | undefined>;
  getTestsByClientId(clientId: string): Promise<Test[]>;
  createTest(test: InsertTest): Promise<Test>;
  updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined>;
  deleteTest(id: string): Promise<boolean>;

  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentById(id: string): Promise<Document | undefined>;
  getDocumentsByClientId(clientId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // AI Health operations
  getLatestAIHealthMetrics(): Promise<AIHealthMetric | undefined>;
  createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric>;

  // AI Control operations
  getAIControlSettings(): Promise<AIControlSetting | undefined>;
  updateAIControlSettings(id: string, settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting | undefined>;

  // AI Chat operations
  getAIChatMessages(): Promise<AIChatMessage[]>;
  createAIChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage>;

  // Classifier operations
  getClassifiers(): Promise<Classifier[]>;
  getClassifierById(id: string): Promise<Classifier | undefined>;
  createClassifier(classifier: InsertClassifier): Promise<Classifier>;
  updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined>;
  deleteClassifier(id: string): Promise<boolean>;

  // Scan operations
  getScanResults(): Promise<ScanResult[]>;
  getScanResultById(id: string): Promise<ScanResult | undefined>;
  createScanResult(scan: InsertScanResult): Promise<ScanResult>;

  // CVE operations
  getCveResults(): Promise<CveResult[]>;
  createCveResult(cve: InsertCveResult): Promise<CveResult>;

  // Audit log operations
  getAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

class SqliteStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return db.select().from(schema.users).all();
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedUser = { ...user, password: hashPassword(user.password) };
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const newUser = { id, ...hashedUser, createdAt };
    
    await db.insert(schema.users).values(newUser);
    return newUser as User;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const updateData = { ...user };
    if (updateData.password) {
      updateData.password = hashPassword(updateData.password);
    }
    
    await db.update(schema.users).set(updateData).where(eq(schema.users.id, id));
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = db.delete(schema.users).where(eq(schema.users.id, id)).run();
    return result.changes > 0;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (user && verifyPassword(password, user.password)) {
      return user;
    }
    return undefined;
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return db.select().from(schema.clients).all();
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const clients = await db.select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
    return clients[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const newClient = { id, ...client, createdAt };
    
    await db.insert(schema.clients).values(newClient);
    return newClient as Client;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    await db.update(schema.clients).set(client).where(eq(schema.clients.id, id));
    return this.getClientById(id);
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = db.delete(schema.clients).where(eq(schema.clients.id, id)).run();
    return result.changes > 0;
  }

  // Test operations
  async getTests(): Promise<Test[]> {
    return db.select().from(schema.tests).all();
  }

  async getTestById(id: string): Promise<Test | undefined> {
    const tests = await db.select().from(schema.tests).where(eq(schema.tests.id, id)).limit(1);
    return tests[0];
  }

  async getTestsByClientId(clientId: string): Promise<Test[]> {
    return db.select().from(schema.tests).where(eq(schema.tests.clientId, clientId)).all();
  }

  async createTest(test: InsertTest): Promise<Test> {
    const id = crypto.randomUUID();
    const startedAt = new Date();
    const newTest = { id, ...test, startedAt };
    
    // Convert findings to JSON string if it's an object
    if (newTest.findings && typeof newTest.findings === 'object') {
      newTest.findings = JSON.stringify(newTest.findings);
    }
    
    await db.insert(schema.tests).values(newTest);
    return newTest as Test;
  }

  async updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined> {
    const updateData = { ...test };
    if (updateData.findings && typeof updateData.findings === 'object') {
      updateData.findings = JSON.stringify(updateData.findings);
    }
    
    await db.update(schema.tests).set(updateData).where(eq(schema.tests.id, id));
    return this.getTestById(id);
  }

  async deleteTest(id: string): Promise<boolean> {
    const result = db.delete(schema.tests).where(eq(schema.tests.id, id)).run();
    return result.changes > 0;
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return db.select().from(schema.documents).all();
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const documents = await db.select().from(schema.documents).where(eq(schema.documents.id, id)).limit(1);
    return documents[0];
  }

  async getDocumentsByClientId(clientId: string): Promise<Document[]> {
    return db.select().from(schema.documents).where(eq(schema.documents.clientId, clientId)).all();
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const newDocument = { id, ...document, createdAt, updatedAt };
    
    await db.insert(schema.documents).values(newDocument);
    return newDocument as Document;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const updatedAt = new Date();
    await db.update(schema.documents).set({ ...document, updatedAt }).where(eq(schema.documents.id, id));
    return this.getDocumentById(id);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = db.delete(schema.documents).where(eq(schema.documents.id, id)).run();
    return result.changes > 0;
  }

  // AI Health operations
  async getLatestAIHealthMetrics(): Promise<AIHealthMetric | undefined> {
    const metrics = await db.select().from(schema.aiHealthMetrics)
      .orderBy(schema.aiHealthMetrics.timestamp)
      .limit(1);
    return metrics[0];
  }

  async createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newMetric = { id, ...metric, timestamp };
    
    // Convert modelsLoaded to JSON string if it's an array
    if (newMetric.modelsLoaded && Array.isArray(newMetric.modelsLoaded)) {
      newMetric.modelsLoaded = JSON.stringify(newMetric.modelsLoaded);
    }
    
    await db.insert(schema.aiHealthMetrics).values(newMetric);
    return newMetric as AIHealthMetric;
  }

  // AI Control operations
  async getAIControlSettings(): Promise<AIControlSetting | undefined> {
    const settings = await db.select().from(schema.aiControlSettings).limit(1);
    const setting = settings[0];
    if (setting) {
      // Parse JSON arrays
      if (setting.activeSystems && typeof setting.activeSystems === 'string') {
        try {
          setting.activeSystems = JSON.parse(setting.activeSystems);
        } catch {}
      }
    }
    return setting;
  }

  async updateAIControlSettings(id: string, settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting | undefined> {
    const updateData = { ...settings };
    const lastModifiedAt = new Date();
    
    // Convert activeSystems to JSON string if it's an array
    if (updateData.activeSystems && Array.isArray(updateData.activeSystems)) {
      updateData.activeSystems = JSON.stringify(updateData.activeSystems);
    }
    
    await db.update(schema.aiControlSettings)
      .set({ ...updateData, lastModifiedAt })
      .where(eq(schema.aiControlSettings.id, id));
    
    return this.getAIControlSettings();
  }

  // AI Chat operations
  async getAIChatMessages(): Promise<AIChatMessage[]> {
    const messages = await db.select().from(schema.aiChatMessages)
      .orderBy(schema.aiChatMessages.timestamp)
      .all();
    
    // Parse attachments JSON
    return messages.map(msg => {
      if (msg.attachments && typeof msg.attachments === 'string') {
        try {
          msg.attachments = JSON.parse(msg.attachments);
        } catch {}
      }
      return msg;
    });
  }

  async createAIChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newMessage = { id, ...message, timestamp };
    
    // Convert attachments to JSON string if it's an object
    if (newMessage.attachments && typeof newMessage.attachments === 'object') {
      newMessage.attachments = JSON.stringify(newMessage.attachments);
    }
    
    await db.insert(schema.aiChatMessages).values(newMessage);
    return newMessage as AIChatMessage;
  }

  // Classifier operations
  async getClassifiers(): Promise<Classifier[]> {
    return db.select().from(schema.classifiers).all();
  }

  async getClassifierById(id: string): Promise<Classifier | undefined> {
    const classifiers = await db.select().from(schema.classifiers).where(eq(schema.classifiers.id, id)).limit(1);
    return classifiers[0];
  }

  async createClassifier(classifier: InsertClassifier): Promise<Classifier> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const newClassifier = { id, ...classifier, createdAt };
    
    await db.insert(schema.classifiers).values(newClassifier);
    return newClassifier as Classifier;
  }

  async updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined> {
    await db.update(schema.classifiers).set(classifier).where(eq(schema.classifiers.id, id));
    return this.getClassifierById(id);
  }

  async deleteClassifier(id: string): Promise<boolean> {
    const result = db.delete(schema.classifiers).where(eq(schema.classifiers.id, id)).run();
    return result.changes > 0;
  }

  // Scan operations
  async getScanResults(): Promise<ScanResult[]> {
    const results = await db.select().from(schema.scanResults).all();
    
    // Parse findings JSON
    return results.map(result => {
      if (result.findings && typeof result.findings === 'string') {
        try {
          result.findings = JSON.parse(result.findings);
        } catch {}
      }
      return result;
    });
  }

  async getScanResultById(id: string): Promise<ScanResult | undefined> {
    const results = await db.select().from(schema.scanResults).where(eq(schema.scanResults.id, id)).limit(1);
    const result = results[0];
    
    if (result && result.findings && typeof result.findings === 'string') {
      try {
        result.findings = JSON.parse(result.findings);
      } catch {}
    }
    
    return result;
  }

  async createScanResult(scan: InsertScanResult): Promise<ScanResult> {
    const id = crypto.randomUUID();
    const startTime = new Date();
    const newScan = { id, ...scan, startTime };
    
    // Convert findings to JSON string if it's an object
    if (newScan.findings && typeof newScan.findings === 'object') {
      newScan.findings = JSON.stringify(newScan.findings);
    }
    
    await db.insert(schema.scanResults).values(newScan);
    return newScan as ScanResult;
  }

  // CVE operations
  async getCveResults(): Promise<CveResult[]> {
    return db.select().from(schema.cveResults).all();
  }

  async createCveResult(cve: InsertCveResult): Promise<CveResult> {
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const newCve = { id, ...cve, createdAt };
    
    await db.insert(schema.cveResults).values(newCve);
    return newCve as CveResult;
  }

  // Audit log operations
  async getAuditLogs(): Promise<AuditLog[]> {
    return db.select().from(schema.auditLogs).orderBy(schema.auditLogs.timestamp).all();
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = crypto.randomUUID();
    const timestamp = new Date();
    const newLog = { id, ...log, timestamp };
    
    await db.insert(schema.auditLogs).values(newLog);
    return newLog as AuditLog;
  }
}

// Export singleton instance
export const storage = new SqliteStorage();