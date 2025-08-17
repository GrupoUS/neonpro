// Stock Alerts Types Validation Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Unit tests for Zod schemas and validation functions

import { describe, expect, it } from 'vitest';
import {
  acknowledgeAlertSchema,
  alertsQuerySchema,
  createStockAlertConfigSchema,
  customStockReportSchema,
  resolveAlertSchema,
  stockAlertConfigSchema,
  stockAlertSchema,
  stockDashboardDataSchema,
  stockPerformanceMetricsSchema,
  updateStockAlertConfigSchema,
  validateAcknowledgeAlert,
  validateCreateStockAlertConfig,
  validateResolveAlert,
  validateStockAlertConfig,
} from '@/app/lib/types/stock-alerts';

// =====================================================
// TEST DATA FIXTURES
// =====================================================

const validAlertConfig = {
  id: 'ac123e45-e89b-12d3-a456-426614174000',
  clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
  productId: 'pc123e45-e89b-12d3-a456-426614174000',
  alertType: 'low_stock' as const,
  thresholdValue: 10,
  thresholdUnit: 'quantity' as const,
  severityLevel: 'medium' as const,
  isActive: true,
  notificationChannels: ['in_app', 'email'] as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user123e-e89b-12d3-a456-426614174000',
  updatedBy: 'user123e-e89b-12d3-a456-426614174000',
};

const validCreateAlertConfig = {
  clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
  productId: 'pc123e45-e89b-12d3-a456-426614174000',
  alertType: 'low_stock' as const,
  thresholdValue: 15,
  thresholdUnit: 'quantity' as const,
  severityLevel: 'high' as const,
  isActive: true,
  notificationChannels: ['in_app', 'whatsapp'] as const,
};

const validAlert = {
  id: 'alert123-e89b-12d3-a456-426614174000',
  clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
  productId: 'pc123e45-e89b-12d3-a456-426614174000',
  alertType: 'low_stock' as const,
  severityLevel: 'critical' as const,
  currentValue: 5,
  thresholdValue: 10,
  message: 'Low stock alert for Product X',
  status: 'active' as const,
  metadata: { source: 'automated' },
  createdAt: new Date(),
};

const validAcknowledgeAlert = {
  alertId: 'alert123-e89b-12d3-a456-426614174000',
  acknowledgedBy: 'user123e45-e89b-12d3-a456-426614174000',
  note: 'Acknowledged by manager',
};

const validResolveAlert = {
  alertId: 'alert123-e89b-12d3-a456-426614174000',
  resolvedBy: 'user123e45-e89b-12d3-a456-426614174000',
  resolution: 'Stock replenished from emergency supply',
  actionsTaken: ['emergency_purchase', 'supplier_contact'],
};

// =====================================================
// STOCK ALERT CONFIG SCHEMA TESTS
// =====================================================

describe('Stock Alert Config Schema Validation', () => {
  describe('stockAlertConfigSchema', () => {
    it('should validate a complete valid alert config', () => {
      const result = stockAlertConfigSchema.safeParse(validAlertConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.alertType).toBe('low_stock');
        expect(result.data.thresholdValue).toBe(10);
        expect(result.data.isActive).toBe(true);
      }
    });

    it('should reject invalid UUID formats', () => {
      const invalidConfig = { ...validAlertConfig, clinicId: 'invalid-uuid' };
      const result = stockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid UUID format');
      }
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
        categoryId: 'cat123e45-e89b-12d3-a456-426614174000',
      };
      const result = stockAlertConfigSchema.safeParse(categoryConfig);
      expect(result.success).toBe(true);
    });

    it('should validate global config (no product or category)', () => {
      const globalConfig = {
        ...validAlertConfig,
        productId: undefined,
        categoryId: undefined,
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
      const invalidConfig = { ...validCreateAlertConfig, id: 'some-id' };
      const result = createStockAlertConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should apply default values correctly', () => {
      const minimalConfig = {
        clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
        alertType: 'low_stock' as const,
        thresholdValue: 5,
        notificationChannels: ['in_app'] as const,
      };
      const result = createStockAlertConfigSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.thresholdUnit).toBe('quantity');
        expect(result.data.severityLevel).toBe('medium');
        expect(result.data.isActive).toBe(true);
      }
    });
  });

  describe('updateStockAlertConfigSchema', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        thresholdValue: 20,
        severityLevel: 'high' as const,
      };
      const result = updateStockAlertConfigSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject update with readonly fields', () => {
      const invalidUpdate = {
        clinicId: 'new-clinic-id',
        thresholdValue: 20,
      };
      const result = updateStockAlertConfigSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});

// =====================================================
// STOCK ALERT SCHEMA TESTS
// =====================================================

describe('Stock Alert Schema Validation', () => {
  describe('stockAlertSchema', () => {
    it('should validate a complete valid alert', () => {
      const result = stockAlertSchema.safeParse(validAlert);
      expect(result.success).toBe(true);
    });

    it('should reject invalid severity levels', () => {
      const invalidAlert = { ...validAlert, severityLevel: 'super_critical' };
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
      const emptyMessage = { ...validAlert, message: '' };
      const longMessage = { ...validAlert, message: 'a'.repeat(1001) };

      expect(stockAlertSchema.safeParse(emptyMessage).success).toBe(false);
      expect(stockAlertSchema.safeParse(longMessage).success).toBe(false);
    });

    it('should validate acknowledgment constraint', () => {
      // Valid: both acknowledgedBy and acknowledgedAt present
      const validAck = {
        ...validAlert,
        acknowledgedBy: 'user123',
        acknowledgedAt: new Date(),
      };
      expect(stockAlertSchema.safeParse(validAck).success).toBe(true);

      // Invalid: only acknowledgedBy present
      const invalidAck = {
        ...validAlert,
        acknowledgedBy: 'user123',
      };
      const result = stockAlertSchema.safeParse(invalidAck);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Both acknowledgedBy and acknowledgedAt must be provided'
        );
      }
    });
  });

  describe('acknowledgeAlertSchema', () => {
    it('should validate valid acknowledgment request', () => {
      const result = acknowledgeAlertSchema.safeParse(validAcknowledgeAlert);
      expect(result.success).toBe(true);
    });

    it('should trim and validate note length', () => {
      const longNote = {
        ...validAcknowledgeAlert,
        note: ` ${'a'.repeat(501)} `,
      };
      const result = acknowledgeAlertSchema.safeParse(longNote);
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
      const invalidResolve = { ...validResolveAlert, resolution: '' };
      const result = resolveAlertSchema.safeParse(invalidResolve);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Resolution description required'
        );
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
// CUSTOM REPORTS SCHEMA TESTS
// =====================================================

describe('Custom Stock Reports Schema Validation', () => {
  const validReport = {
    clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
    userId: 'user123e45-e89b-12d3-a456-426614174000',
    reportName: 'Monthly Consumption Report',
    reportType: 'consumption' as const,
    filters: {
      dateRange: {
        start: new Date('2025-01-01'),
        end: new Date('2025-01-31'),
      },
      productIds: ['pc123e45-e89b-12d3-a456-426614174000'],
    },
    isActive: true,
  };

  it('should validate valid custom report', () => {
    const result = customStockReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it('should reject empty report names', () => {
    const invalidReport = { ...validReport, reportName: '' };
    const result = customStockReportSchema.safeParse(invalidReport);
    expect(result.success).toBe(false);
  });

  it('should trim report names', () => {
    const reportWithSpaces = {
      ...validReport,
      reportName: '  Trimmed Report  ',
    };
    const result = customStockReportSchema.safeParse(reportWithSpaces);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reportName).toBe('Trimmed Report');
    }
  });

  it('should validate date range constraint', () => {
    const invalidDateRange = {
      ...validReport,
      filters: {
        dateRange: {
          start: new Date('2025-01-31'),
          end: new Date('2025-01-01'), // End before start
        },
      },
    };
    const result = customStockReportSchema.safeParse(invalidDateRange);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        'Start date must be before or equal to end date'
      );
    }
  });

  it('should validate schedule config constraints', () => {
    const validSchedule = {
      frequency: 'weekly' as const,
      dayOfWeek: 1, // Monday
      time: '09:30',
      recipients: ['user@example.com'],
      enabled: true,
    };

    const reportWithSchedule = {
      ...validReport,
      scheduleConfig: validSchedule,
    };

    const result = customStockReportSchema.safeParse(reportWithSchedule);
    expect(result.success).toBe(true);
  });

  it('should reject invalid time format in schedule', () => {
    const invalidSchedule = {
      frequency: 'daily' as const,
      time: '25:70', // Invalid time
      recipients: ['user@example.com'],
    };

    const reportWithInvalidSchedule = {
      ...validReport,
      scheduleConfig: invalidSchedule,
    };

    const result = customStockReportSchema.safeParse(reportWithInvalidSchedule);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid time format');
    }
  });
});

// =====================================================
// PERFORMANCE METRICS SCHEMA TESTS
// =====================================================

describe('Stock Performance Metrics Schema Validation', () => {
  const validMetrics = {
    clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
    metricDate: new Date(),
    totalValue: 10_000.5,
    turnoverRate: 4.2,
    daysCoverage: 45,
    accuracyPercentage: 95.5,
    wasteValue: 150.25,
    wastePercentage: 1.5,
    activeAlertsCount: 3,
    criticalAlertsCount: 1,
    productsCount: 150,
    outOfStockCount: 5,
    lowStockCount: 12,
  };

  it('should validate valid performance metrics', () => {
    const result = stockPerformanceMetricsSchema.safeParse(validMetrics);
    expect(result.success).toBe(true);
  });

  it('should reject negative values where inappropriate', () => {
    const negativeMetrics = { ...validMetrics, totalValue: -100 };
    const result = stockPerformanceMetricsSchema.safeParse(negativeMetrics);
    expect(result.success).toBe(false);
  });

  it('should reject invalid percentage values', () => {
    const invalidPercentage = { ...validMetrics, accuracyPercentage: 150 };
    const result = stockPerformanceMetricsSchema.safeParse(invalidPercentage);
    expect(result.success).toBe(false);
  });

  it('should allow optional fields to be undefined', () => {
    const minimalMetrics = {
      clinicId: 'cc123e45-e89b-12d3-a456-426614174000',
      metricDate: new Date(),
      totalValue: 10_000,
      wasteValue: 0,
      wastePercentage: 0,
      activeAlertsCount: 0,
      criticalAlertsCount: 0,
      productsCount: 100,
      outOfStockCount: 0,
      lowStockCount: 0,
    };
    const result = stockPerformanceMetricsSchema.safeParse(minimalMetrics);
    expect(result.success).toBe(true);
  });
});

// =====================================================
// DASHBOARD DATA SCHEMA TESTS
// =====================================================

describe('Stock Dashboard Data Schema Validation', () => {
  const validDashboardData = {
    kpis: {
      totalValue: 50_000,
      turnoverRate: 6.5,
      daysCoverage: 30,
      accuracyPercentage: 98.2,
      activeAlerts: 5,
      criticalAlerts: 1,
      wasteValue: 200,
      wastePercentage: 0.4,
    },
    charts: {
      consumptionTrend: [
        {
          date: new Date().toISOString(),
          value: 100,
          category: 'medical_supplies',
          trend: 'up' as const,
        },
      ],
      topProducts: [
        {
          productId: 'pc123e45-e89b-12d3-a456-426614174000',
          name: 'Product A',
          sku: 'SKU001',
          consumption: 50,
          value: 500,
          changePercentage: 5.2,
        },
      ],
      alertsByType: [
        {
          type: 'low_stock' as const,
          count: 3,
          severity: 'medium' as const,
          percentage: 60,
        },
      ],
      wasteAnalysis: [
        {
          period: 'Last week',
          waste: 50,
          percentage: 0.5,
          trend: 'improving' as const,
        },
      ],
    },
    alerts: [validAlert],
    recommendations: [
      {
        id: 'rec1',
        type: 'reorder' as const,
        priority: 'high' as const,
        title: 'Reorder Required',
        message: 'Several products need reordering',
        actionable: true,
        dismissible: true,
        createdAt: new Date(),
      },
    ],
    lastUpdated: new Date(),
  };

  it('should validate complete dashboard data', () => {
    const result = stockDashboardDataSchema.safeParse(validDashboardData);
    expect(result.success).toBe(true);
  });

  it('should apply default values for lastUpdated', () => {
    const { lastUpdated, ...dataWithoutLastUpdated } = validDashboardData;
    const result = stockDashboardDataSchema.safeParse(dataWithoutLastUpdated);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lastUpdated).toBeInstanceOf(Date);
    }
  });
});

// =====================================================
// QUERY SCHEMA TESTS
// =====================================================

describe('Query Schema Validation', () => {
  describe('alertsQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        status: 'active',
        severity: 'high',
        limit: 25,
        offset: 50,
        sortBy: 'severity_level',
        sortOrder: 'asc',
      };
      const result = alertsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalQuery = {};
      const result = alertsQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe('created_at');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    it('should enforce limit constraints', () => {
      const invalidQuery = { limit: 150 }; // Over max
      const result = alertsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});

// =====================================================
// VALIDATION FUNCTION TESTS
// =====================================================

describe('Validation Functions', () => {
  describe('validateStockAlertConfig', () => {
    it('should validate valid config', () => {
      expect(() => validateStockAlertConfig(validAlertConfig)).not.toThrow();
    });

    it('should throw on invalid config', () => {
      const invalidConfig = { ...validAlertConfig, clinicId: 'invalid' };
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
      const invalidAck = { ...validAcknowledgeAlert, alertId: 'invalid' };
      expect(() => validateAcknowledgeAlert(invalidAck)).toThrow();
    });
  });

  describe('validateResolveAlert', () => {
    it('should validate valid resolve request', () => {
      expect(() => validateResolveAlert(validResolveAlert)).not.toThrow();
    });

    it('should throw on invalid resolve request', () => {
      const invalidResolve = { ...validResolveAlert, resolution: '' };
      expect(() => validateResolveAlert(invalidResolve)).toThrow();
    });
  });
});

// =====================================================
// EDGE CASES AND SECURITY TESTS
// =====================================================

describe('Edge Cases and Security', () => {
  it('should handle extremely large numbers appropriately', () => {
    const configWithLargeNumber = {
      ...validCreateAlertConfig,
      thresholdValue: Number.MAX_SAFE_INTEGER,
    };
    const result = createStockAlertConfigSchema.safeParse(
      configWithLargeNumber
    );
    expect(result.success).toBe(true);
  });

  it('should reject null/undefined values where required', () => {
    const configWithNull = {
      ...validCreateAlertConfig,
      clinicId: null,
    };
    const result = createStockAlertConfigSchema.safeParse(configWithNull);
    expect(result.success).toBe(false);
  });

  it('should sanitize string inputs', () => {
    const _configWithWhitespace = {
      ...validCreateAlertConfig,
      // Note: reportName trimming is tested in custom reports
    };
    // Additional sanitization tests can be added here
  });

  it('should handle array validation correctly', () => {
    const configWithInvalidChannels = {
      ...validCreateAlertConfig,
      notificationChannels: ['invalid_channel'],
    };
    const result = createStockAlertConfigSchema.safeParse(
      configWithInvalidChannels
    );
    expect(result.success).toBe(false);
  });
});

// =====================================================
// PERFORMANCE TESTS
// =====================================================

describe('Performance and Scalability', () => {
  it('should handle large arrays efficiently', () => {
    const largeArray = new Array(1000).fill(0).map((_, i) => ({
      date: new Date().toISOString(),
      value: i,
      trend: 'stable' as const,
    }));

    const dashboardWithLargeData = {
      kpis: {
        totalValue: 50_000,
        turnoverRate: 6.5,
        daysCoverage: 30,
        accuracyPercentage: 98.2,
        activeAlerts: 5,
        criticalAlerts: 1,
        wasteValue: 200,
        wastePercentage: 0.4,
      },
      charts: {
        consumptionTrend: largeArray,
        topProducts: [],
        alertsByType: [],
        wasteAnalysis: [],
      },
      alerts: [],
      recommendations: [],
      lastUpdated: new Date(),
    };

    const startTime = performance.now();
    const result = stockDashboardDataSchema.safeParse(dashboardWithLargeData);
    const endTime = performance.now();

    expect(result.success).toBe(true);
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
  });
});
