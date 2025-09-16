/**
 * Unified Test Fixtures
 * Consolidates test data and mock objects for consistent testing
 */

// Sample project structures for testing
export const SAMPLE_MONOREPO_STRUCTURE = {
  'package.json': {
    name: 'test-monorepo',
    version: '1.0.0',
    workspaces: ['apps/*', 'packages/*'],
    devDependencies: {
      turbo: '^1.0.0',
      typescript: '^5.0.0',
    },
  },
  'turbo.json': {
    pipeline: {
      build: {
        dependsOn: ['^build'],
        outputs: ['dist/**'],
      },
      test: {
        dependsOn: ['^build'],
      },
    },
  },
  'apps/web/package.json': {
    name: '@test/web',
    version: '1.0.0',
    dependencies: {
      react: '^18.0.0',
      '@test/shared': 'workspace:*',
    },
  },
  'packages/shared/package.json': {
    name: '@test/shared',
    version: '1.0.0',
    main: 'dist/index.js',
  },
};

// Healthcare compliance test fixtures
export const HEALTHCARE_FIXTURES = {
  lgpd: {
    consentData: {
      userId: 'user-123',
      consentType: 'medical_data_processing',
      granted: true,
      timestamp: '2023-01-01T00:00:00Z',
      version: '1.0',
      purposes: ['medical_treatment', 'health_monitoring'],
    },
    dataSubjectRequest: {
      requestId: 'dsr-456',
      userId: 'user-123',
      requestType: 'data_portability',
      status: 'pending',
      submittedAt: '2023-01-01T00:00:00Z',
    },
    dataProcessingRecord: {
      id: 'dpr-789',
      controller: 'Test Healthcare Provider',
      processor: 'Test System',
      purposes: ['medical_treatment'],
      categories: ['health_data', 'personal_data'],
      retention: '7_years',
      securityMeasures: ['encryption', 'access_control'],
    },
  },
  anvisa: {
    medicalDevice: {
      id: 'device-123',
      name: 'Test Medical Software',
      classification: 'Class I',
      registration: 'ANVISA-12345',
      riskLevel: 'low',
      intendedUse: 'patient_data_management',
      softwareType: 'standalone',
    },
    clinicalEvaluation: {
      deviceId: 'device-123',
      evaluationId: 'eval-456',
      status: 'approved',
      evaluatedAt: '2023-01-01T00:00:00Z',
      riskAssessment: {
        clinical: 'low',
        technical: 'low',
        overall: 'acceptable',
      },
    },
    postMarketSurveillance: {
      deviceId: 'device-123',
      reportId: 'pms-789',
      period: '2023-Q1',
      incidents: 0,
      adverseEvents: 0,
      userFeedback: 'positive',
    },
  },
  cfm: {
    medicalProfessional: {
      id: 'prof-123',
      crm: '12345/SP',
      name: 'Dr. Test Professional',
      specialty: 'general_medicine',
      licenseStatus: 'active',
      telemedicineEnabled: true,
      lastValidation: '2023-01-01T00:00:00Z',
    },
    telemedicineSession: {
      sessionId: 'tele-456',
      professionalId: 'prof-123',
      patientId: 'patient-789',
      startTime: '2023-01-01T10:00:00Z',
      endTime: '2023-01-01T10:30:00Z',
      type: 'consultation',
      compliance: {
        patientConsent: true,
        professionalValidation: true,
        technicalRequirements: true,
      },
    },
    digitalPrescription: {
      prescriptionId: 'presc-789',
      professionalId: 'prof-123',
      patientId: 'patient-789',
      medications: [
        {
          name: 'Test Medication',
          dosage: '10mg',
          frequency: 'twice_daily',
          duration: '7_days',
        },
      ],
      digitalSignature: 'valid',
      timestamp: '2023-01-01T10:15:00Z',
    },
  },
};

// Performance test fixtures
export const PERFORMANCE_FIXTURES = {
  largeDataset: Array.from({ length: 10000 }, (_, index) => ({
    id: `item-${index}`,
    data: Math.random(),
    timestamp: new Date().toISOString(),
    metadata: {
      category: `category-${index % 100}`,
      priority: Math.floor(Math.random() * 5) + 1,
    },
  })),

  mediumDataset: Array.from({ length: 1000 }, (_, index) => ({
    id: `item-${index}`,
    data: Math.random(),
    timestamp: new Date().toISOString(),
  })),

  smallDataset: Array.from({ length: 100 }, (_, index) => ({
    id: `item-${index}`,
    data: Math.random(),
  })),

  performanceThresholds: {
    critical: 100, // ms
    acceptable: 200, // ms
    warning: 500, // ms
  },

  memoryLimits: {
    low: 50 * 1024 * 1024, // 50MB
    medium: 100 * 1024 * 1024, // 100MB
    high: 200 * 1024 * 1024, // 200MB
  },
};

// Audit and validation fixtures
export const AUDIT_FIXTURES = {
  fileResults: {
    totalFiles: 150,
    unusedFiles: [
      {
        path: '/src/unused-component.tsx',
        size: 1024,
        lastModified: '2023-01-01T00:00:00Z',
      },
      {
        path: '/src/old-utility.ts',
        size: 512,
        lastModified: '2022-12-01T00:00:00Z',
      },
    ],
    largestFiles: [
      {
        path: '/src/large-component.tsx',
        size: 50 * 1024,
        complexity: 'high',
      },
    ],
    duplicateFiles: [
      {
        files: ['/src/utils1.ts', '/src/utils2.ts'],
        size: 2048,
        similarity: 0.95,
      },
    ],
  },

  dependencyResults: {
    totalDependencies: 45,
    circularDependencies: [
      {
        cycle: ['ComponentA', 'ComponentB', 'ComponentA'],
        files: ['/src/ComponentA.tsx', '/src/ComponentB.tsx'],
      },
    ],
    unusedDependencies: ['unused-package', 'old-library'],
    outdatedDependencies: [
      {
        name: 'react',
        current: '17.0.0',
        latest: '18.2.0',
        severity: 'medium',
      },
    ],
  },

  architectureResults: {
    violations: [
      {
        rule: 'no-direct-database-access',
        file: '/src/components/UserProfile.tsx',
        severity: 'error',
        message: 'Components should not directly access database',
        line: 45,
      },
      {
        rule: 'prefer-functional-components',
        file: '/src/components/LegacyClass.tsx',
        severity: 'warning',
        message: 'Consider converting to functional component',
        line: 1,
      },
    ],
    totalRules: 25,
    complianceScore: 85,
  },

  securityResults: {
    vulnerabilities: [
      {
        severity: 'high',
        package: 'vulnerable-package',
        version: '1.0.0',
        description: 'Known security vulnerability',
        cve: 'CVE-2023-12345',
      },
    ],
    secretsFound: [],
    insecurePatterns: [
      {
        pattern: 'hardcoded-api-key',
        file: '/src/config.ts',
        line: 10,
      },
    ],
  },
};

// Error scenarios for testing
export const ERROR_FIXTURES = {
  fileSystemErrors: {
    permissionDenied: {
      code: 'EACCES',
      message: 'Permission denied',
      path: '/restricted/file.ts',
    },
    fileNotFound: {
      code: 'ENOENT',
      message: 'File not found',
      path: '/missing/file.ts',
    },
    diskFull: {
      code: 'ENOSPC',
      message: 'No space left on device',
    },
  },

  networkErrors: {
    timeout: {
      code: 'ETIMEDOUT',
      message: 'Operation timed out',
    },
    connectionRefused: {
      code: 'ECONNREFUSED',
      message: 'Connection refused',
    },
    dnsFailed: {
      code: 'ENOTFOUND',
      message: 'DNS lookup failed',
    },
  },

  validationErrors: {
    invalidPackageJson: {
      message: 'Invalid package.json format',
      details: 'Missing required field: name',
    },
    circularDependency: {
      message: 'Circular dependency detected',
      cycle: ['A', 'B', 'C', 'A'],
    },
    typeError: {
      message: 'Type checking failed',
      file: '/src/component.tsx',
      line: 25,
    },
  },
};

// Configuration fixtures
export const CONFIG_FIXTURES = {
  auditConfig: {
    include: ['src/**/*.{ts,tsx,js,jsx}'],
    exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
    rules: {
      'no-unused-files': 'error',
      'no-circular-dependencies': 'error',
      'prefer-typescript': 'warning',
    },
    healthcare: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
    performance: {
      thresholds: {
        critical: 100,
        acceptable: 200,
      },
    },
  },

  testConfig: {
    testMatch: ['**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      threshold: {
        global: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
    healthcare: {
      complianceTests: true,
      performanceTests: true,
    },
  },

  buildConfig: {
    target: 'ES2020',
    module: 'ESNext',
    outDir: './dist',
    strict: true,
    skipLibCheck: true,
    healthcare: {
      auditTrail: true,
      encryption: true,
    },
  },
};

// Mock API responses
export const API_FIXTURES = {
  healthcheck: {
    status: 'healthy',
    timestamp: '2023-01-01T00:00:00Z',
    version: '1.0.0',
    uptime: 3600,
  },

  auditReport: {
    id: 'audit-123',
    status: 'completed',
    score: 85,
    issues: 5,
    warnings: 12,
    generatedAt: '2023-01-01T00:00:00Z',
  },

  complianceCheck: {
    lgpd: { compliant: true, score: 95 },
    anvisa: { compliant: true, score: 90 },
    cfm: { compliant: true, score: 88 },
    overall: { compliant: true, score: 91 },
  },
};

// Utility functions for fixtures
export class FixtureUtils {
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  static mergeFixtures<T>(base: T, override: Partial<T>): T {
    return { ...base, ...override };
  }

  static generateId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  static createMockFile(path: string, content: string = '') {
    return {
      path,
      content,
      size: Buffer.byteLength(content, 'utf8'),
      lastModified: this.generateTimestamp(),
    };
  }

  static createMockDirectory(path: string, files: string[] = []) {
    return {
      path,
      files,
      createdAt: this.generateTimestamp(),
    };
  }
}