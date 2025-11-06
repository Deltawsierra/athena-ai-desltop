import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, insertSiteSchema, insertTestSchema, 
  insertDocumentSchema, insertActivityLogSchema, insertAIHealthMetricSchema,
  insertUserSchema, insertAIControlSettingSchema, insertAIChatMessageSchema,
  insertClassifierSchema
} from "@shared/schema";

const updateClientSchema = insertClientSchema.partial();
const updateSiteSchema = insertSiteSchema.partial();
const updateTestSchema = insertTestSchema.partial();
const updateDocumentSchema = insertDocumentSchema.partial();
const updateUserSchema = insertUserSchema.partial();
const updateAIControlSettingSchema = insertAIControlSettingSchema.partial();
const updateClassifierSchema = insertClassifierSchema.partial();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ==== CLIENTS API ====
  app.get("/api/clients", async (req, res) => {
    const clients = await storage.getAllClients();
    res.json(clients);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "client",
        entityId: client.id,
        details: { name: client.name, company: client.company }
      });
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const data = updateClientSchema.parse(req.body);
      const client = await storage.updateClient(req.params.id, data);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "client",
        entityId: client.id
      });
      res.json(client);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const success = await storage.deleteClient(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Client not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "client",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  // ==== SITES API ====
  app.get("/api/sites", async (req, res) => {
    const { clientId } = req.query;
    if (clientId) {
      const sites = await storage.getSitesByClient(clientId as string);
      return res.json(sites);
    }
    res.status(400).json({ message: "clientId query parameter required" });
  });

  app.post("/api/sites", async (req, res) => {
    try {
      const data = insertSiteSchema.parse(req.body);
      const site = await storage.createSite(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "site",
        entityId: site.id,
        details: { url: site.url, clientId: site.clientId }
      });
      res.json(site);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/sites/:id", async (req, res) => {
    try {
      const data = updateSiteSchema.parse(req.body);
      const site = await storage.updateSite(req.params.id, data);
      if (!site) {
        return res.status(404).json({ message: "Site not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "site",
        entityId: site.id
      });
      res.json(site);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/sites/:id", async (req, res) => {
    const success = await storage.deleteSite(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Site not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "site",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  // ==== TESTS API ====
  app.get("/api/tests", async (req, res) => {
    const { clientId, siteId } = req.query;
    if (clientId) {
      const tests = await storage.getTestsByClient(clientId as string);
      return res.json(tests);
    }
    if (siteId) {
      const tests = await storage.getTestsBySite(siteId as string);
      return res.json(tests);
    }
    const tests = await storage.getAllTests();
    res.json(tests);
  });

  app.get("/api/tests/:id", async (req, res) => {
    const test = await storage.getTest(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.json(test);
  });

  app.post("/api/tests", async (req, res) => {
    try {
      const data = insertTestSchema.parse(req.body);
      const test = await storage.createTest(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "test",
        entityId: test.id,
        details: { testType: test.testType, clientId: test.clientId }
      });
      res.json(test);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/tests/:id", async (req, res) => {
    try {
      const data = updateTestSchema.parse(req.body);
      const test = await storage.updateTest(req.params.id, data);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "test",
        entityId: test.id
      });
      res.json(test);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/tests/:id", async (req, res) => {
    const success = await storage.deleteTest(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Test not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "test",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  // ==== DOCUMENTS API ====
  app.get("/api/documents", async (req, res) => {
    const { clientId } = req.query;
    if (clientId) {
      const documents = await storage.getDocumentsByClient(clientId as string);
      return res.json(documents);
    }
    res.status(400).json({ message: "clientId query parameter required" });
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "document",
        entityId: document.id,
        details: { title: document.title, clientId: document.clientId }
      });
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const data = updateDocumentSchema.parse(req.body);
      const document = await storage.updateDocument(req.params.id, data);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "document",
        entityId: document.id
      });
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    const success = await storage.deleteDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "document",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  // ==== ACTIVITY LOGS API ====
  app.get("/api/logs", async (req, res) => {
    const { entityType, entityId } = req.query;
    if (entityType && entityId) {
      const logs = await storage.getActivityLogsByEntity(entityType as string, entityId as string);
      return res.json(logs);
    }
    const logs = await storage.getAllActivityLogs();
    res.json(logs);
  });

  app.post("/api/logs", async (req, res) => {
    try {
      const data = insertActivityLogSchema.parse(req.body);
      const log = await storage.createActivityLog(data);
      res.json(log);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==== AI HEALTH METRICS API ====
  app.get("/api/ai-health/latest", async (req, res) => {
    const metric = await storage.getLatestAIHealthMetric();
    if (!metric) {
      return res.status(404).json({ message: "No health metrics found" });
    }
    res.json(metric);
  });

  app.get("/api/ai-health", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const metrics = await storage.getAIHealthMetrics(limit);
    res.json(metrics);
  });

  app.post("/api/ai-health", async (req, res) => {
    try {
      const data = insertAIHealthMetricSchema.parse(req.body);
      const metric = await storage.createAIHealthMetric(data);
      res.json(metric);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==== USERS API (Admin) ====
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, password: undefined })));
  });

  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "user",
        entityId: user.id,
        details: { username: user.username }
      });
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(req.params.id, data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "user",
        entityId: user.id
      });
      res.json({ ...user, password: undefined });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    const success = await storage.deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "User not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "user",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  // ==== AI CONTROL API ====
  app.get("/api/ai-control", async (req, res) => {
    const settings = await storage.getAIControlSettings();
    res.json(settings);
  });

  app.patch("/api/ai-control", async (req, res) => {
    try {
      const data = updateAIControlSettingSchema.parse(req.body);
      const settings = await storage.updateAIControlSettings(data);
      await storage.createActivityLog({
        action: "updated",
        entityType: "ai_control",
        entityId: settings.id,
        details: data
      });
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ==== AI CHAT API ====
  app.get("/api/chat", async (req, res) => {
    const messages = await storage.getAllChatMessages();
    res.json(messages);
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const data = insertAIChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(data);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/chat/:id", async (req, res) => {
    const success = await storage.deleteChatMessage(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.json({ success: true });
  });

  // ==== CLASSIFIERS API ====
  app.get("/api/classifiers", async (req, res) => {
    const classifiers = await storage.getAllClassifiers();
    res.json(classifiers);
  });

  app.get("/api/classifiers/:id", async (req, res) => {
    const classifier = await storage.getClassifier(req.params.id);
    if (!classifier) {
      return res.status(404).json({ message: "Classifier not found" });
    }
    res.json(classifier);
  });

  app.post("/api/classifiers", async (req, res) => {
    try {
      const data = insertClassifierSchema.parse(req.body);
      const classifier = await storage.createClassifier(data);
      await storage.createActivityLog({
        action: "created",
        entityType: "classifier",
        entityId: classifier.id,
        details: { name: classifier.name, type: classifier.type }
      });
      res.json(classifier);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/classifiers/:id", async (req, res) => {
    try {
      const data = updateClassifierSchema.parse(req.body);
      const classifier = await storage.updateClassifier(req.params.id, data);
      if (!classifier) {
        return res.status(404).json({ message: "Classifier not found" });
      }
      await storage.createActivityLog({
        action: "updated",
        entityType: "classifier",
        entityId: classifier.id
      });
      res.json(classifier);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/classifiers/:id", async (req, res) => {
    const success = await storage.deleteClassifier(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Classifier not found" });
    }
    await storage.createActivityLog({
      action: "deleted",
      entityType: "classifier",
      entityId: req.params.id
    });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
