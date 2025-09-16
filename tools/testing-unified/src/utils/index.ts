/**
 * Unified Testing Utilities
 * Consolidates testing helpers and utilities from multiple sources
 */

import { vi, expect } from 'vitest';
import { createLogger, LogLevel } from '@neonpro/tools-shared';

const testLogger = createLogger('TestUtils', {
  level: LogLevel.DEBUG,
  format: 'pretty',
});

// Test timing utilities
export class TestTimer {
  private startTime: number = 0;
  private endTime: number = 0;

  start(): void {
    this.startTime = Date.now();
  }

  end(): number {
    this.endTime = Date.now();
    return this.endTime - this.startTime;
  }

  getDuration(): number {
    return this.endTime - this.startTime;
  }

  assertHealthcarePerformance(threshold: number = 100): void {
    const duration = this.getDuration();
    expect(duration).toBeLessThanOrEqual(threshold);

    if (duration <= threshold) {
      testLogger.success(`⚡ Performance test passed: ${duration}ms ≤ ${threshold}ms`);
    } else {
      testLogger.error(`❌ Performance test failed: ${duration}ms > ${threshold}ms`);
    }
  }
}

// Mock utilities
export class MockHelper {
  static createMockFile(content: string = '', path: string = '/mock/file.ts') {
    return {
      path,
      content,
      size: Buffer.byteLength(content, 'utf8'),
      lastModified: new Date(),
    };
  }

  static createMockPackageJson(overrides: any = {}) {
    return {
      name: 'test-package',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      ...overrides,
    };
  }

  static createMockAuditData(overrides: any = {}) {
    return {
      fileResults: {
        totalFiles: 100,
        unusedFiles: [],
        largestFiles: [],
        ...overrides.fileResults,
      },
      dependencyResults: {
        totalDependencies: 50,
        circularDependencies: [],
        unusedDependencies: [],
        ...overrides.dependencyResults,
      },
      architectureResults: {
        violations: [],
        totalRules: 20,
        ...overrides.architectureResults,
      },
      performanceMetrics: {
        totalExecutionTime: 1000,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        peakMemoryUsage: 75 * 1024 * 1024, // 75MB
        filesProcessedPerSecond: 100,
        ...overrides.performanceMetrics,
      },
      ...overrides,
    };
  }

  static createMockLogger() {
    return {
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      constitutional: vi.fn(),
      startTimer: vi.fn(),
      endTimer: vi.fn(),
    };
  }
}

// Assertion utilities
export class HealthcareAssertions {
  static assertLGPDCompliance(data: any) {
    expect(data).toHaveProperty('privacy');
    expect(data).toHaveProperty('consent');
    expect(data).toHaveProperty('dataSubjectRights');
    testLogger.constitutional(
      LogLevel.INFO,
      'LGPD compliance assertions passed',
      {
        compliance: true,
        requirement: 'LGPD Data Protection',
        standard: 'LGPD',
      }
    );
  }

  static assertANVISACompliance(data: any) {
    expect(data).toHaveProperty('medicalDevice');
    expect(data).toHaveProperty('clinicalValidation');
    expect(data).toHaveProperty('postMarketSurveillance');
    testLogger.constitutional(
      LogLevel.INFO,
      'ANVISA compliance assertions passed',
      {
        compliance: true,
        requirement: 'ANVISA Medical Device Compliance',
        standard: 'ANVISA',
      }
    );
  }

  static assertCFMCompliance(data: any) {
    expect(data).toHaveProperty('professionalLicensing');
    expect(data).toHaveProperty('telemedicine');
    expect(data).toHaveProperty('medicalDocumentation');
    testLogger.constitutional(
      LogLevel.INFO,
      'CFM compliance assertions passed',
      {
        compliance: true,
        requirement: 'CFM Professional Standards',
        standard: 'CFM',
      }
    );
  }

  static assertPerformanceCompliance(duration: number, threshold: number = 100) {
    expect(duration).toBeLessThanOrEqual(threshold);
    testLogger.info(`⚡ Performance assertion passed: ${duration}ms ≤ ${threshold}ms`);
  }

  static assertAuditTrail(auditData: any) {
    expect(auditData).toHaveProperty('timestamp');
    expect(auditData).toHaveProperty('userId');
    expect(auditData).toHaveProperty('action');
    expect(auditData).toHaveProperty('details');
    testLogger.constitutional(
      LogLevel.INFO,
      'Audit trail assertions passed',
      {
        compliance: true,
        requirement: 'Healthcare Audit Trail',
        standard: 'LGPD',
      }
    );
  }
}

// Test data generators
export class TestDataGenerator {
  static generatePatientData(overrides: any = {}) {
    return {
      id: 'patient-123',
      personalInfo: {
        name: 'Test Patient',
        birthDate: '1990-01-01',
        cpf: '***.***.***-**', // Masked for privacy
      },
      medicalHistory: [
        {
          date: '2023-01-01',
          diagnosis: 'Test Diagnosis',
          treatment: 'Test Treatment',
        },
      ],
      ...overrides,
    };
  }

  static generateMedicalProfessionalData(overrides: any = {}) {
    return {
      id: 'professional-456',
      personalInfo: {
        name: 'Dr. Test',
        crm: '12345/SP',
        specialty: 'General Medicine',
      },
      credentials: {
        license: 'active',
        telemedicineEnabled: true,
      },
      ...overrides,
    };
  }

  static generateAuditTrailEntry(overrides: any = {}) {
    return {
      id: 'audit-789',
      timestamp: new Date().toISOString(),
      userId: 'user-123',
      action: 'data_access',
      resource: 'patient_data',
      details: {
        patientId: 'patient-123',
        dataType: 'medical_history',
        purpose: 'clinical_review',
      },
      compliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
      },
      ...overrides,
    };
  }

  static generatePerformanceTestData(size: number = 1000) {
    return Array.from({ length: size }, (_, index) => ({
      id: `item-${index}`,
      data: Math.random(),
      timestamp: new Date().toISOString(),
      metadata: {
        category: `category-${index % 10}`,
        priority: Math.floor(Math.random() * 5) + 1,
      },
    }));
  }
}

// File system test utilities
export class FileSystemTestUtils {
  static createTempDirectory(): string {
    const tempDir = `/tmp/neonpro-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // In a real implementation, we would create the directory
    return tempDir;
  }

  static createTempFile(content: string, extension: string = '.ts'): string {
    const tempFile = `/tmp/neonpro-test-${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    // In a real implementation, we would create the file
    return tempFile;
  }

  static mockFileExists(path: string): boolean {
    // Mock implementation
    return path.includes('package.json') || path.includes('tsconfig.json');
  }

  static mockReadFile(path: string): string {
    if (path.includes('package.json')) {
      return JSON.stringify(MockHelper.createMockPackageJson());
    }
    if (path.includes('tsconfig.json')) {
      return JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          strict: true,
        },
      });
    }
    return 'mock file content';
  }
}

// Async test utilities
export class AsyncTestUtils {
  static async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (!condition() && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  }

  static async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);

      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  static createPromiseWithResolvers<T>() {
    let resolve: (value: T) => void;
    let reject: (error: Error) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve: resolve!, reject: reject! };
  }
}

// Error testing utilities
export class ErrorTestUtils {
  static expectError(fn: () => void, expectedMessage?: string) {
    expect(fn).toThrow();
    if (expectedMessage) {
      expect(fn).toThrow(expectedMessage);
    }
  }

  static async expectAsyncError(fn: () => Promise<any>, expectedMessage?: string) {
    await expect(fn()).rejects.toThrow();
    if (expectedMessage) {
      await expect(fn()).rejects.toThrow(expectedMessage);
    }
  }

  static createMockError(message: string = 'Test error', code?: string) {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }
}

// Export all utilities
export {
  testLogger,
};