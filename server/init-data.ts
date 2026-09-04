import { storage } from "./storage-unified";
import type { InsertUser, InsertClient, InsertTest, InsertDocument } from "@shared/schema";

/**
 * First-run seeding. Runs only when the users table is empty.
 *
 * Default credentials (change them after first login):
 *   admin      / admin123     (admin)
 *   testadmin  / testpass123  (admin)
 * Set ATHENA_SKIP_SAMPLE_DATA=true to seed users only, without sample clients.
 */
export async function initializeDefaultData(): Promise<void> {
  const existing = await storage.getAllUsers();
  if (existing.length > 0) {
    return;
  }

  console.log("[init] First run: creating default users");

  const adminUser: InsertUser = {
    username: "admin",
    password: "admin123",
    email: "admin@athena.ai",
    role: "admin",
    isActive: true,
  };
  const admin = await storage.createUser(adminUser);

  const testUser: InsertUser = {
    username: "testadmin",
    password: "testpass123",
    email: "test@athena.ai",
    role: "admin",
    isActive: true,
  };
  await storage.createUser(testUser);

  await storage.updateAIControlSettings({
    systemStatus: "operational",
    killSwitchEnabled: false,
    overrideMode: false,
    activeSystems: ["threat_detection", "vulnerability_scanner", "log_analyzer"],
    maxConcurrentTests: 5,
    autoShutdownThreshold: 90,
    lastModifiedBy: admin.id,
  });

  if (process.env.ATHENA_SKIP_SAMPLE_DATA === "true") {
    console.log("[init] Default users created. Sample data skipped.");
    return;
  }

  const sampleClients: InsertClient[] = [
    { name: "Acme Corporation", company: "Acme Corp", email: "security@acme.com", phone: "555-0100", notes: "Primary enterprise client - Monthly security assessments" },
    { name: "TechStart Inc", company: "TechStart", email: "ciso@techstart.io", phone: "555-0200", notes: "Startup client - Quarterly penetration testing" },
    { name: "Global Finance Ltd", company: "Global Finance", email: "compliance@globalfinance.com", phone: "555-0300", notes: "Financial sector client - Compliance-focused security" },
  ];
  const clients = [];
  for (const clientData of sampleClients) {
    clients.push(await storage.createClient(clientData));
  }

  const sampleTests: InsertTest[] = [
    {
      clientId: clients[0].id, siteId: null, testType: "penetration-test", status: "completed", severity: "high",
      summary: "Quarterly penetration testing revealed 3 critical vulnerabilities",
      findings: { details: "SQL injection vulnerability in login form, XSS in user profile, Weak password policy" },
      vulnerabilitiesFound: 15, criticalCount: 3, highCount: 5, mediumCount: 4, lowCount: 3,
      executedBy: admin.id, completedAt: new Date(),
    },
    {
      clientId: clients[1].id, siteId: null, testType: "vulnerability-scan", status: "in-progress", severity: "medium",
      summary: "Ongoing vulnerability assessment of cloud infrastructure", findings: null,
      vulnerabilitiesFound: 8, criticalCount: 0, highCount: 2, mediumCount: 4, lowCount: 2,
      executedBy: admin.id, completedAt: null,
    },
    {
      clientId: clients[2].id, siteId: null, testType: "compliance-audit", status: "pending", severity: "low",
      summary: "Scheduled PCI-DSS compliance audit", findings: null,
      vulnerabilitiesFound: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0,
      executedBy: admin.id, completedAt: null,
    },
  ];
  for (const testData of sampleTests) {
    await storage.createTest(testData);
  }

  const sampleDocuments: InsertDocument[] = [
    { clientId: clients[0].id, title: "Security Assessment Report Q1 2024", description: "Comprehensive security assessment findings and recommendations", documentType: "Report", fileUrl: "/documents/acme-q1-2024.pdf", createdBy: admin.id },
    { clientId: clients[1].id, title: "Penetration Test Results", description: "Full penetration test results with remediation guidelines", documentType: "Test Results", fileUrl: "/documents/techstart-pentest.pdf", createdBy: admin.id },
    { clientId: clients[2].id, title: "Compliance Checklist", description: "PCI-DSS compliance checklist and requirements", documentType: "Compliance", fileUrl: "/documents/globalfinance-compliance.pdf", createdBy: admin.id },
  ];
  for (const docData of sampleDocuments) {
    await storage.createDocument(docData);
  }

  await storage.createActivityLog({
    action: "seeded",
    entityType: "system",
    entityId: null,
    userId: admin.id,
    details: { clients: clients.length, tests: sampleTests.length, documents: sampleDocuments.length },
    ipAddress: null,
  });

  console.log("[init] Default users and sample data created. Default login: admin / admin123");
}
