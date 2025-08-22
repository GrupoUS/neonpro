/**
 * 🔧 Simple Authentication Test - Mock Validation
 */

import { ApiHelpers, apiClient } from '@neonpro/shared/api-client';
import { describe, expect, it } from 'vitest';

describe('Mock Validation', () => {
  it('should have properly mocked ApiHelpers.formatError', () => {
    expect(ApiHelpers.formatError).toBeDefined();
    expect(typeof ApiHelpers.formatError).toBe('function');

    const result = ApiHelpers.formatError('test error');
    expect(result).toBe('test error');
  });

  it('should have properly mocked apiClient structure', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.auth).toBeDefined();
    expect(apiClient.api).toBeDefined();
    expect(apiClient.api.v1).toBeDefined();
    expect(apiClient.api.v1.auth).toBeDefined();
    expect(apiClient.api.v1.auth.login).toBeDefined();
    expect(apiClient.api.v1.auth.login.$post).toBeDefined();
    expect(typeof apiClient.api.v1.auth.login.$post).toBe('function');
  });

  it('should have auth methods working', () => {
    expect(apiClient.auth.isAuthenticated).toBeDefined();
    expect(typeof apiClient.auth.isAuthenticated).toBe('function');
    expect(apiClient.auth.isAuthenticated()).toBe(true);
  });
});
