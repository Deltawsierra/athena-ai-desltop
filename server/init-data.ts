import { storage } from './storage-unified';
import type { InsertUser, InsertClient, InsertTest, InsertDocument } from '@shared/schema';

const INIT_FLAG_KEY = 'athena_initialized';

export async function initializeDefaultData() {
  // Check if data has already been initialized
  try {
    const users = await storage.getAllUsers();
    if (users && users.length > 0) {
      console.log('Data already initialized, skipping...');
      return;
    }
  } catch (error) {
    console.log('Checking for existing data...');
  }

  console.log('Initializing default data for first-time setup...');

  try {
    // Create default admin user (password will be hashed by storage layer)
    const adminUser: InsertUser = {
      username: 'admin',
      password: 'admin123',
      email: 'admin@athena.ai',
      role: 'admin',
      isActive: true
    };
    
    const admin = await storage.createUser(adminUser);
    console.log('✓ Created default admin user (username: admin, password: admin123)');

    // Create test user (password will be hashed by storage layer)
    const testUser: InsertUser = {
      username: 'testadmin',
      password: 'testpass123',
      email: 'test@athena.ai',
      role: 'admin',
      isActive: true
    };
    
    await storage.createUser(testUser);
    console.log('✓ Created test admin user (username: testadmin, password: testpass123)');

    // Create sample clients
    const sampleClients: InsertClient[] = [
      {
        name: 'Acme Corporation',
        company: 'Acme Corp',
        email: 'security@acme.com',
        phone: '555-0100',
        notes: 'Primary enterprise client - Monthly security assessments'
      },
      {
        name: 'TechStart Inc',
        company: 'TechStart',
        email: 'ciso@techstart.io',
        phone: '555-0200',
        notes: 'Startup client - Quarterly penetration testing'
      },
      {
        name: 'Global Finance Ltd',
        company: 'Global Finance',
        email: 'compliance@globalfinance.com',
        phone: '555-0300',
        notes: 'Financial sector client - Compliance-focused security'
      }
    ];

    const clients = [];
    for (const clientData of sampleClients) {
      const client = await storage.createClient(clientData);
      clients.push(client);
    }
    console.log('✓ Created sample clients');

    // Create sample tests
    const sampleTests: InsertTest[] = [
      {
        clientId: clients[0].id,
        siteId: null,
        testType: 'Penetration Test',
        status: 'completed',
        severity: 'high',
        summary: 'Quarterly penetration testing revealed 3 critical vulnerabilities',
        findings: {
          details: 'SQL injection vulnerability in login form, XSS in user profile, Weak password policy'
        },
        vulnerabilitiesFound: 15,
        criticalCount: 3,
        highCount: 5,
        mediumCount: 4,
        lowCount: 3,
        executedBy: admin.id,
        completedAt: new Date()
      },
      {
        clientId: clients[1].id,
        siteId: null,
        testType: 'Vulnerability Assessment',
        status: 'in_progress',
        severity: 'medium',
        summary: 'Ongoing vulnerability assessment of cloud infrastructure',
        findings: null,
        vulnerabilitiesFound: 8,
        criticalCount: 0,
        highCount: 2,
        mediumCount: 4,
        lowCount: 2,
        executedBy: admin.id,
        completedAt: null
      },
      {
        clientId: clients[2].id,
        siteId: null,
        testType: 'Compliance Audit',
        status: 'scheduled',
        severity: 'low',
        summary: 'Scheduled PCI-DSS compliance audit',
        findings: null,
        vulnerabilitiesFound: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        executedBy: admin.id,
        completedAt: null
      }
    ];

    for (const testData of sampleTests) {
      await storage.createTest(testData);
    }
    console.log('✓ Created sample tests');

    // Create sample documents
    const sampleDocuments: InsertDocument[] = [
      {
        clientId: clients[0].id,
        title: 'Security Assessment Report Q1 2024',
        description: 'Comprehensive security assessment findings and recommendations',
        documentType: 'Report',
        fileUrl: '/documents/acme-q1-2024.pdf',
        createdBy: admin.id
      },
      {
        clientId: clients[1].id,
        title: 'Penetration Test Results',
        description: 'Full penetration test results with remediation guidelines',
        documentType: 'Test Results',
        fileUrl: '/documents/techstart-pentest.pdf',
        createdBy: admin.id
      },
      {
        clientId: clients[2].id,
        title: 'Compliance Checklist',
        description: 'PCI-DSS compliance checklist and requirements',
        documentType: 'Compliance',
        fileUrl: '/documents/globalfinance-compliance.pdf',
        createdBy: admin.id
      }
    ];

    for (const docData of sampleDocuments) {
      await storage.createDocument(docData);
    }
    console.log('✓ Created sample documents');

    // Create sample CVE results using existing storage methods
    const sampleCVEs = [
      {
        cveId: 'CVE-2024-0001',
        description: 'Critical remote code execution vulnerability in web server',
        severity: 'critical',
        cvss: 9.8,
        affected: 'Apache HTTP Server 2.4.x',
        status: 'unpatched',
        published: new Date(),
        classification: 'Network'
      },
      {
        cveId: 'CVE-2024-0002',
        description: 'SQL injection vulnerability in database management system',
        severity: 'high',
        cvss: 8.5,
        affected: 'MySQL 8.0.x',
        status: 'patch_available',
        published: new Date(),
        classification: 'Application'
      }
    ];

    for (const cveData of sampleCVEs) {
      await storage.createCve(cveData);
    }
    console.log('✓ Created sample CVE results');

    // Create sample audit logs using existing storage methods
    const sampleAuditLogs = [
      {
        action: 'user_login',
        userId: admin.id,
        entityType: 'user',
        entityId: admin.id,
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Electron App' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Electron/Desktop'
      }
    ];

    for (const logData of sampleAuditLogs) {
      await storage.createActivityLog(logData);
    }
    console.log('✓ Created sample audit logs');

    // Initialize AI Control Settings
    const aiControlSettings = {
      systemStatus: 'operational',
      killSwitchEnabled: false,
      overrideMode: false,
      activeSystems: ['threat_detection', 'vulnerability_scanner', 'log_analyzer'],
      maxConcurrentTests: 5,
      autoShutdownThreshold: 90,
      lastModifiedBy: admin.id
    };

    await storage.updateAIControlSettings(aiControlSettings);
    console.log('✓ Initialized AI Control settings');

    console.log('\n========================================');
    console.log('✅ Initial data setup complete!');
    console.log('========================================');
    console.log('\nDefault Login Credentials:');
    console.log('  Admin User: admin / admin123');
    console.log('  Test User: testadmin / testpass123');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error initializing default data:', error);
    // Don't throw - allow app to continue even if init fails
  }
}