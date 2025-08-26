/**
 * Enhanced Service Base Tests
 *
 * Testes unitários para validar o Enhanced Service Layer Pattern
 */

import type { ServiceContext } from '../../types';
import { EnhancedServiceBase } from '../EnhancedServiceBase';
import type { ServiceConfig } from '../EnhancedServiceBase';

// Mock implementation for testing
class TestEnhancedService extends EnhancedServiceBase {
  constructor() {
    const config: ServiceConfig = {
      serviceName: 'test-service',
      version: '1.0.0',
      enableCache: true,
      enableAnalytics: true,
      enableSecurity: true,
      cacheOptions: {
        defaultTTL: 60_000,
        maxItems: 100,
      },
    };
    super(config);
  }

  getServiceName(): string {
    return 'test-service';
  }

  getServiceVersion(): string {
    return '1.0.0';
  }

  // Public wrapper for testing protected method
  async testExecuteOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    context?: ServiceContext,
  ): Promise<T> {
    return this.executeOperation(operationName, operation, context);
  }
}
