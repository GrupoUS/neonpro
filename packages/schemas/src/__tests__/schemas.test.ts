import { describe, it, expect } from 'bun:test';
import { z } from 'zod';

// Test basic schema functionality and exports
describe('Schemas Package', () => {
  it('should export schemas from main index', () => {
    // Import should work without errors
    expect(() => {
      require('../index');
    }).not.toThrow();
  });

  it('should have zod dependency available', () => {
    // Verify zod is working
    expect(z).toBeDefined();
    expect(typeof z.string).toBe('function');
    expect(typeof z.object).toBe('function');
    expect(typeof z.number).toBe('function');
  });

  it('should validate basic schema operations', () => {
    // Test basic schema creation and validation
    const testSchema = z.object({
      name: z.string(),
      age: z.number().positive(),
    });

    const validData = { name: 'John Doe', age: 30 };
    const invalidData = { name: 'John Doe', age: -5 };

    expect(() => testSchema.parse(validData)).not.toThrow();
    expect(() => testSchema.parse(invalidData)).toThrow();
  });

  it('should handle schema composition', () => {
    // Test that schemas can be composed
    const baseSchema = z.object({
      id: z.string().uuid(),
      createdAt: z.date(),
    });

    const extendedSchema = baseSchema.extend({
      name: z.string(),
      email: z.string().email(),
    });

    const testData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      name: 'Test User',
      email: 'test@example.com',
    };

    expect(() => extendedSchema.parse(testData)).not.toThrow();
  });

  it('should support healthcare-related schema patterns', () => {
    // Test healthcare-specific schema patterns
    const patientSchema = z.object({
      id: z.string(),
      name: z.string().min(2),
      birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      contact: z.object({
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }).optional(),
    });

    const validPatient = {
      id: 'patient-123',
      name: 'João Silva',
      birthDate: '1990-01-15',
      contact: {
        email: 'joao.silva@example.com',
        phone: '+5511999999999',
      },
    };

    expect(() => patientSchema.parse(validPatient)).not.toThrow();
  });

  it('should handle schema error handling', () => {
    // Test error handling and validation
    const strictSchema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });

    try {
      strictSchema.parse({ required: 123 }); // Should fail - wrong type
      fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      expect(error.issues).toHaveLength(1);
      expect(error.issues[0].path).toContain('required');
    }
  });
});

// Helper function for error testing
function fail(message: string): never {
  throw new Error(message);
}