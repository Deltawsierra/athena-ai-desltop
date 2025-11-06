// Unified storage that switches between SQLite (for desktop) and in-memory (for web)
import { storage as sqliteStorage } from './storage-sqlite';
import { storage as memStorage } from './storage';
import type { IStorage } from './storage';
import type { 
  User, InsertUser,
  Client, InsertClient,
  Test, InsertTest,
  Document, InsertDocument,
  AIControlSetting, InsertAIControlSetting,
  AIChatMessage, InsertAIChatMessage,
  Classifier, InsertClassifier,
  AIHealthMetric, InsertAIHealthMetric
} from '@shared/schema';

// Check if we're running in Electron (desktop mode)
const isElectron = process.env.ELECTRON_RUN_AS_NODE === '1' || process.versions?.electron;
const useDesktopStorage = isElectron || process.env.USE_SQLITE === 'true';

console.log(`Using ${useDesktopStorage ? 'SQLite' : 'in-memory'} storage`);

// Create a unified interface that matches the existing storage.ts interface
class UnifiedStorage implements IStorage {
  private backend: any;
  
  constructor() {
    // Use SQLite for desktop, in-memory for web/dev
    this.backend = useDesktopStorage ? sqliteStorage : memStorage;
  }
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.getUserById(id);
    }
    return memStorage.getUser(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.backend.getUserByUsername(username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return this.backend.createUser(user);
  }
  
  async getAllUsers(): Promise<User[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getUsers();
    }
    return memStorage.getAllUsers();
  }
  
  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    return this.backend.updateUser(id, user);
  }
  
  async deleteUser(id: string): Promise<boolean> {
    return this.backend.deleteUser(id);
  }
  
  // Client operations
  async getClient(id: string): Promise<Client | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.getClientById(id);
    }
    return memStorage.getClient(id);
  }
  
  async getAllClients(): Promise<Client[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getClients();
    }
    return memStorage.getAllClients();
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    return this.backend.createClient(client);
  }
  
  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    return this.backend.updateClient(id, client);
  }
  
  async deleteClient(id: string): Promise<boolean> {
    return this.backend.deleteClient(id);
  }
  
  // Site operations
  async getSite(id: string): Promise<any> {
    return this.backend.getSite?.(id);
  }
  
  async getAllSites(): Promise<any[]> {
    return this.backend.getAllSites?.() || [];
  }
  
  async getSitesByClientId(clientId: string): Promise<any[]> {
    return this.backend.getSitesByClientId?.(clientId) || [];
  }
  
  async createSite(site: any): Promise<any> {
    return this.backend.createSite?.(site);
  }
  
  async updateSite(id: string, site: any): Promise<any> {
    return this.backend.updateSite?.(id, site);
  }
  
  async deleteSite(id: string): Promise<boolean> {
    return this.backend.deleteSite?.(id) || false;
  }
  
  // Test operations
  async getTest(id: string): Promise<Test | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.getTestById(id);
    }
    return memStorage.getTest(id);
  }
  
  async getAllTests(): Promise<Test[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getTests();
    }
    return memStorage.getAllTests();
  }
  
  async getTestsByClientId(clientId: string): Promise<Test[]> {
    return this.backend.getTestsByClientId(clientId);
  }
  
  async createTest(test: InsertTest): Promise<Test> {
    return this.backend.createTest(test);
  }
  
  async updateTest(id: string, test: Partial<InsertTest>): Promise<Test | undefined> {
    return this.backend.updateTest(id, test);
  }
  
  async deleteTest(id: string): Promise<boolean> {
    return this.backend.deleteTest(id);
  }
  
  // Document operations
  async getDocument(id: string): Promise<Document | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.getDocumentById(id);
    }
    return memStorage.getDocument(id);
  }
  
  async getAllDocuments(): Promise<Document[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getDocuments();
    }
    return memStorage.getAllDocuments();
  }
  
  async getDocumentsByClientId(clientId: string): Promise<Document[]> {
    return this.backend.getDocumentsByClientId(clientId);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    return this.backend.createDocument(document);
  }
  
  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined> {
    return this.backend.updateDocument(id, document);
  }
  
  async deleteDocument(id: string): Promise<boolean> {
    return this.backend.deleteDocument(id);
  }
  
  // Activity log operations
  async createActivityLog(log: any): Promise<any> {
    if (useDesktopStorage) {
      return sqliteStorage.createAuditLog(log);
    }
    return memStorage.createActivityLog(log);
  }
  
  async getAllActivityLogs(): Promise<any[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getAuditLogs();
    }
    return memStorage.getAllActivityLogs();
  }
  
  // AI Health operations
  async getLatestAIHealthMetrics(): Promise<AIHealthMetric | undefined> {
    return this.backend.getLatestAIHealthMetrics();
  }
  
  async getLatestAIHealthMetric(): Promise<AIHealthMetric | undefined> {
    return this.getLatestAIHealthMetrics();
  }
  
  async createAIHealthMetric(metric: InsertAIHealthMetric): Promise<AIHealthMetric> {
    return this.backend.createAIHealthMetric(metric);
  }
  
  async getAllAIHealthMetrics(): Promise<AIHealthMetric[]> {
    return this.backend.getAllAIHealthMetrics?.() || [];
  }
  
  async getAIHealthMetrics(limit?: number): Promise<AIHealthMetric[]> {
    return this.getAllAIHealthMetrics();
  }
  
  // AI Control operations
  async getAIControlSettings(): Promise<AIControlSetting | undefined> {
    return this.backend.getAIControlSettings();
  }
  
  async updateAIControlSettings(id: string, settings: Partial<InsertAIControlSetting>): Promise<AIControlSetting | undefined> {
    return this.backend.updateAIControlSettings(id, settings);
  }
  
  // AI Chat operations
  async getAllAIChatMessages(): Promise<AIChatMessage[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getAIChatMessages();
    }
    return memStorage.getAllChatMessages();
  }
  
  async getAllChatMessages(): Promise<AIChatMessage[]> {
    return this.getAllAIChatMessages();
  }
  
  async createAIChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    if (useDesktopStorage) {
      return sqliteStorage.createAIChatMessage(message);
    }
    return memStorage.createChatMessage(message);
  }
  
  async createChatMessage(message: InsertAIChatMessage): Promise<AIChatMessage> {
    return this.createAIChatMessage(message);
  }
  
  async getChatMessagesByUser(userId: string): Promise<AIChatMessage[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getAIChatMessagesByUser(userId);
    }
    return memStorage.getChatMessagesByUser(userId);
  }
  
  async deleteChatMessage(id: string): Promise<boolean> {
    if (useDesktopStorage) {
      return sqliteStorage.deleteAIChatMessage(id);
    }
    return memStorage.deleteChatMessage(id);
  }
  
  // Classifier operations
  async getClassifier(id: string): Promise<Classifier | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.getClassifierById(id);
    }
    return memStorage.getClassifier(id);
  }
  
  async getAllClassifiers(): Promise<Classifier[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getClassifiers();
    }
    return memStorage.getAllClassifiers();
  }
  
  async createClassifier(classifier: InsertClassifier): Promise<Classifier> {
    return this.backend.createClassifier(classifier);
  }
  
  async updateClassifier(id: string, classifier: Partial<InsertClassifier>): Promise<Classifier | undefined> {
    return this.backend.updateClassifier(id, classifier);
  }
  
  async deleteClassifier(id: string): Promise<boolean> {
    return this.backend.deleteClassifier(id);
  }
  
  // Scan results operations
  async getAllScans(): Promise<any[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getScanResults();
    }
    return memStorage.getAllScans();
  }
  
  async createScan(scan: any): Promise<any> {
    if (useDesktopStorage) {
      return sqliteStorage.createScanResult(scan);
    }
    return memStorage.createScan(scan);
  }
  
  // CVE operations
  async getAllCves(): Promise<any[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getCveResults();
    }
    return memStorage.getAllCves();
  }
  
  async createCve(cve: any): Promise<any> {
    if (useDesktopStorage) {
      return sqliteStorage.createCveResult(cve);
    }
    return memStorage.createCve(cve);
  }
  
  // Audit logs
  async getAuditLogs(): Promise<any[]> {
    if (useDesktopStorage) {
      return sqliteStorage.getAuditLogs();
    }
    return memStorage.getAuditLogs();
  }
  
  // Authentication
  async validateUser(username: string, password: string): Promise<User | undefined> {
    if (useDesktopStorage) {
      return sqliteStorage.validateUser(username, password);
    }
    return memStorage.validateUser(username, password);
  }
}

// Export singleton instance
export const storage = new UnifiedStorage();