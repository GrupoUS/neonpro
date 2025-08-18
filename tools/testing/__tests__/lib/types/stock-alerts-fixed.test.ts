// Stock Alerts Types Validation Tests - Fixed UUIDs
// Story 11.4: Alertas e Relatórios de Estoque
// Unit tests for Zod schemas and validation functions

import { describe, expect, it } from 'vitest';
import {
  acknowledgeAlertSchema,
  createStockAlertConfigSchema,
  resolveAlertSchema,
  stockAlertConfigSchema,
  stockAlertSchema,
  updateStockAlertConfigSchema,
  validateAcknowledgeAlert,
  validateCreateStockAlertConfig,
  validateResolveAlert,
  validateStockAlertConfig,
} from '@/app/lib/types/stock-alerts';

// =====================================================
// TEST DATA FIXTURES - With Valid UUIDs
// =====================================================

const validAlertConfig = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  clinicId: '223e4567-e89b-12d3-a456-426614174001',
  productId: '323e4567-e89b-12d3-a456-426614174002',
  alertType: 'low_stock' as const,
  thresholdValue: 10,
  thresholdUnit: 'quantity' as const,
  severityLevel: 'medium' as const,
  isActive: true,
  notificationChannels: ['in_app', 'email'] as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '423e4567-e89b-12d3-a456-426614174003',
  updatedBy: '523e4567-e89b-12d3-a456-426614174004',
};

const validCreateAlertConfig = {
  clinicId: '223e4567-e89b-12d3-a456-426614174001',
  productId: '323e4567-e89b-12d3-a456-426614174002',
  alertType: 'low_stock' as const,
  thresholdValue: 15,
  thresholdUnit: 'quantity' as const,
  severityLevel: 'high' as const,
  isActive: true,
  notificationChannels: ['in_app', 'whatsapp'] as const,
  createdBy: '423e4567-e89b-12d3-a456-426614174003',
};

const validAlert = {
  id: '623e4567-e89b-12d3-a456-426614174005',
  clinicId: '223e4567-e89b-12d3-a456-426614174001',
  productId: '323e4567-e89b-12d3-a456-426614174002',
  alertType: 'low_stock' as const,
  severityLevel: 'critical' as const,
  currentValue: 5,
  thresholdValue: 10,
  message: 'Stock critically low for Product ABC',
  isAcknowledged: false,
  isResolved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validAcknowledgeAlert = {
  alertId: '623e4567-e89b-12d3-a456-426614174005',
  acknowledgedBy: '423e4567-e89b-12d3-a456-426614174003',
  note: 'Acknowledged - will restock next week',
};

const validResolveAlert = {
  alertId: '623e4567-e89b-12d3-a456-426614174005',
  resolvedBy: '423e4567-e89b-12d3-a456-426614174003',
  resolution: 'Stock replenished - 50 units added',
};

// =====================================================
// STOCK ALERT CONFIG SCHEMA VALIDATION
// =====================================================

describe('Stock Alert Config Schema Validation', () => {
  describe('stockAlertConfigSchema', () => {
    it('should validate a complete valid alert config', () => {
      const result = stockAlertConfigSchema.safeParse(validAlertConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alertType).toBe('low_stock');
        expect(result.data.thresholdValue).toBe(10);
        expect(result.data.severityLevel).toBe('medium');
      }
    });

    it('should reject invalid UUID formats', () => {
      const invalidConfig = { ...validAlertConfig, id: 'invalid-uuid' };
      const result = stockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject negative threshold values', () => {
      const invalidConfig = { ...validAlertConfig, thresholdValue: -5 };
      const result = stockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Must be a positive number'
        );
      }
    });

    it('should reject invalid alert types', () => {
      const invalidConfig = { ...validAlertConfig, alertType: 'invalid_type' };
      const result = stockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject empty notification channels array', () => {
      const invalidConfig = { ...validAlertConfig, notificationChannels: [] };
      const result = stockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'At least one notification channel required'
        );
      }
    });

    it('should validate config with category instead of product', () => {
      const categoryConfig = {
        ...validAlertConfig,
        productId: undefined,
        categoryId: '723e4567-e89b-12d3-a456-426614174006',
      };
      const result = stockAlertConfigSchema.safeParse(categoryConfig);
      expect(result.success).toBe(true);
    });

    it('should validate global config (no product or category)', () => {
      const globalConfig = {
        ...validAlertConfig,
        productId: undefined,
      };
      const result = stockAlertConfigSchema.safeParse(globalConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('createStockAlertConfigSchema', () => {
    it('should validate valid create request', () => {
      const result = createStockAlertConfigSchema.safeParse(
        validCreateAlertConfig
      );
      expect(result.success).toBe(true);
    });

    it('should reject creation with id field', () => {
      const invalidCreate = {
        ...validCreateAlertConfig,
        id: '123e4567-e89b-12d3-a456-426614174000',
      };
      const result = createStockAlertConfigSchema.safeParse(invalidCreate);
      expect(result.success).toBe(false);
    });

    it('should apply default values correctly', () => {
      const minimalConfig = {
        clinicId: '223e4567-e89b-12d3-a456-426614174001',
        productId: '323e4567-e89b-12d3-a456-426614174002',
        alertType: 'low_stock' as const,
        thresholdValue: 10,
        notificationChannels: ['email'] as const,
        createdBy: '423e4567-e89b-12d3-a456-426614174003',
      };
      const result = createStockAlertConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
        expect(result.data.thresholdUnit).toBe('quantity');
        expect(result.data.severityLevel).toBe('medium');
      }
    });
  });

  describe('updateStockAlertConfigSchema', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        thresholdValue: 20,
        severityLevel: 'critical' as const,
      };
      const result = updateStockAlertConfigSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject update with readonly fields', () => {
      const invalidUpdate = {
        thresholdValue: 20,
        id: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(),
      };
      const result = updateStockAlertConfigSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});

// =====================================================
// STOCK ALERT SCHEMA VALIDATION
// =====================================================

describe('Stock Alert Schema Validation', () => {
  describe('stockAlertSchema', () => {
    it('should validate a complete valid alert', () => {
      const result = stockAlertSchema.safeParse(validAlert);
      expect(result.success).toBe(true);
    });

    it('should reject invalid severity levels', () => {
      const invalidAlert = { ...validAlert, severityLevel: 'invalid' };
      const result = stockAlertSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
    });

    it('should reject negative current values', () => {
      const invalidAlert = { ...validAlert, currentValue: -1 };
      const result = stockAlertSchema.safeParse(invalidAlert);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Must be non-negative'
        );
      }
    });

    it('should reject empty or too long messages', () => {
      // Empty message
      const emptyMessage = { ...validAlert, message: '' };
      const result1 = stockAlertSchema.safeParse(emptyMessage);
      expect(result1.success).toBe(false);

      // Too long message
      const longMessage = { ...validAlert, message: 'a'.repeat(1001) };
      const result2 = stockAlertSchema.safeParse(longMessage);
      expect(result2.success).toBe(false);
    });

    it('should validate acknowledgment constraint', () => {
      // Valid: both acknowledgedBy and acknowledgedAt present
      const validAck = {
        ...validAlert,
        isAcknowledged: true,
        acknowledgedBy: '423e4567-e89b-12d3-a456-426614174003',
        acknowledgedAt: new Date(),
      };
      expect(stockAlertSchema.safeParse(validAck).success).toBe(true);

      // Invalid: only acknowledgedBy present
      const invalidAck = {
        ...validAlert,
        isAcknowledged: true,
        acknowledgedBy: '423e4567-e89b-12d3-a456-426614174003',
      };
      expect(stockAlertSchema.safeParse(invalidAck).success).toBe(false);
    });
  });

  describe('acknowledgeAlertSchema', () => {
    it('should validate valid acknowledgment request', () => {
      const result = acknowledgeAlertSchema.safeParse(validAcknowledgeAlert);
      expect(result.success).toBe(true);
    });

    it('should trim and validate note length', () => {
      const longNoteAlert = { ...validAcknowledgeAlert, note: 'a'.repeat(501) };
      const result = acknowledgeAlertSchema.safeParse(longNoteAlert);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Note too long');
      }
    });

    it('should allow acknowledgment without note', () => {
      const { note, ...ackWithoutNote } = validAcknowledgeAlert;
      const result = acknowledgeAlertSchema.safeParse(ackWithoutNote);
      expect(result.success).toBe(true);
    });
  });

  describe('resolveAlertSchema', () => {
    it('should validate valid resolution request', () => {
      const result = resolveAlertSchema.safeParse(validResolveAlert);
      expect(result.success).toBe(true);
    });

    it('should require resolution description', () => {
      const { resolution, ...incompleteResolve } = validResolveAlert;
      const result = resolveAlertSchema.safeParse(incompleteResolve);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required');
      }
    });

    it('should reject overly long resolution description', () => {
      const longResolution = {
        ...validResolveAlert,
        resolution: 'a'.repeat(1001),
      };
      const result = resolveAlertSchema.safeParse(longResolution);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Resolution too long');
      }
    });
  });
});

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

describe('Validation Functions', () => {
  describe('validateStockAlertConfig', () => {
    it('should validate valid config', () => {
      expect(() => validateStockAlertConfig(validAlertConfig)).not.toThrow();
    });

    it('should throw on invalid config', () => {
      const invalidConfig = { ...validAlertConfig, thresholdValue: -1 };
      expect(() => validateStockAlertConfig(invalidConfig)).toThrow();
    });
  });

  describe('validateCreateStockAlertConfig', () => {
    it('should validate valid create config', () => {
      expect(() =>
        validateCreateStockAlertConfig(validCreateAlertConfig)
      ).not.toThrow();
    });

    it('should throw on invalid create config', () => {
      const invalidConfig = { ...validCreateAlertConfig, thresholdValue: -1 };
      expect(() => validateCreateStockAlertConfig(invalidConfig)).toThrow();
    });
  });

  describe('validateAcknowledgeAlert', () => {
    it('should validate valid acknowledge request', () => {
      expect(() =>
        validateAcknowledgeAlert(validAcknowledgeAlert)
      ).not.toThrow();
    });

    it('should throw on invalid acknowledge request', () => {
      const invalidAck = { ...validAcknowledgeAlert, alertId: 'invalid-uuid' };
      expect(() => validateAcknowledgeAlert(invalidAck)).toThrow();
    });
  });

  describe('validateResolveAlert', () => {
    it('should validate valid resolve request', () => {
      expect(() => validateResolveAlert(validResolveAlert)).not.toThrow();
    });

    it('should throw on invalid resolve request', () => {
      const invalidResolve = { ...validResolveAlert, alertId: 'invalid-uuid' };
      expect(() => validateResolveAlert(invalidResolve)).toThrow();
    });
  });
});
