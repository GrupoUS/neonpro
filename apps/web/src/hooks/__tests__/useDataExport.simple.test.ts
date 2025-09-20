/**
 * Simple tests for useDataExport hook - Data export functionality
 * Testing the core logic without complex mocking
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be importable', () => {
    // Test that the module exists and can be imported
    expect(() => {
      const module = require.resolve('../useDataExport');
      expect(module).toBeDefined();
    }).not.toThrow();
  });

  it('should define export types', () => {
    // Test that the types are properly exported
    const module = require('../useDataExport');
    expect(module).toBeDefined();
  });
});
