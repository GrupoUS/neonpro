// Stock Alerts Types Validation Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Unit tests for Zod schemas and validation functions
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __rest =
  (this && this.__rest) ||
  ((s, e) => {
    var t = {};
    for (var p in s) if (Object.hasOwn(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  });
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var stock_alerts_1 = require("@/app/lib/types/stock-alerts");
// =====================================================
// TEST DATA FIXTURES
// =====================================================
var validAlertConfig = {
  id: "ac123e45-e89b-12d3-a456-426614174000",
  clinicId: "cc123e45-e89b-12d3-a456-426614174000",
  productId: "pc123e45-e89b-12d3-a456-426614174000",
  alertType: "low_stock",
  thresholdValue: 10,
  thresholdUnit: "quantity",
  severityLevel: "medium",
  isActive: true,
  notificationChannels: ["in_app", "email"],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "user123e45-e89b-12d3-a456-426614174000",
  updatedBy: "user123e45-e89b-12d3-a456-426614174000",
};
var validCreateAlertConfig = {
  clinicId: "cc123e45-e89b-12d3-a456-426614174000",
  productId: "pc123e45-e89b-12d3-a456-426614174000",
  alertType: "low_stock",
  thresholdValue: 15,
  thresholdUnit: "quantity",
  severityLevel: "high",
  isActive: true,
  notificationChannels: ["in_app", "whatsapp"],
};
var validAlert = {
  id: "alert123-e89b-12d3-a456-426614174000",
  clinicId: "cc123e45-e89b-12d3-a456-426614174000",
  productId: "pc123e45-e89b-12d3-a456-426614174000",
  alertType: "low_stock",
  severityLevel: "critical",
  currentValue: 5,
  thresholdValue: 10,
  message: "Low stock alert for Product X",
  status: "active",
  metadata: { source: "automated" },
  createdAt: new Date(),
};
var validAcknowledgeAlert = {
  alertId: "alert123-e89b-12d3-a456-426614174000",
  acknowledgedBy: "user123e45-e89b-12d3-a456-426614174000",
  note: "Acknowledged by manager",
};
var validResolveAlert = {
  alertId: "alert123-e89b-12d3-a456-426614174000",
  resolvedBy: "user123e45-e89b-12d3-a456-426614174000",
  resolution: "Stock replenished from emergency supply",
  actionsTaken: ["emergency_purchase", "supplier_contact"],
};
// =====================================================
// STOCK ALERT CONFIG SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Stock Alert Config Schema Validation", () => {
  (0, globals_1.describe)("stockAlertConfigSchema", () => {
    (0, globals_1.it)("should validate a complete valid alert config", () => {
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(validAlertConfig);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.alertType).toBe("low_stock");
        (0, globals_1.expect)(result.data.thresholdValue).toBe(10);
        (0, globals_1.expect)(result.data.isActive).toBe(true);
      }
    });
    (0, globals_1.it)("should reject invalid UUID formats", () => {
      var invalidConfig = __assign(__assign({}, validAlertConfig), { clinicId: "invalid-uuid" });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(invalidConfig);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain("Invalid UUID format");
      }
    });
    (0, globals_1.it)("should reject negative threshold values", () => {
      var invalidConfig = __assign(__assign({}, validAlertConfig), { thresholdValue: -5 });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(invalidConfig);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain(
          "Must be a positive number",
        );
      }
    });
    (0, globals_1.it)("should reject invalid alert types", () => {
      var invalidConfig = __assign(__assign({}, validAlertConfig), { alertType: "invalid_type" });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(invalidConfig);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.it)("should reject empty notification channels array", () => {
      var invalidConfig = __assign(__assign({}, validAlertConfig), { notificationChannels: [] });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(invalidConfig);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain(
          "At least one notification channel required",
        );
      }
    });
    (0, globals_1.it)("should validate config with category instead of product", () => {
      var categoryConfig = __assign(__assign({}, validAlertConfig), {
        productId: undefined,
        categoryId: "cat123e45-e89b-12d3-a456-426614174000",
      });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(categoryConfig);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should validate global config (no product or category)", () => {
      var globalConfig = __assign(__assign({}, validAlertConfig), {
        productId: undefined,
        categoryId: undefined,
      });
      var result = stock_alerts_1.stockAlertConfigSchema.safeParse(globalConfig);
      (0, globals_1.expect)(result.success).toBe(true);
    });
  });
  (0, globals_1.describe)("createStockAlertConfigSchema", () => {
    (0, globals_1.it)("should validate valid create request", () => {
      var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(validCreateAlertConfig);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should reject creation with id field", () => {
      var invalidConfig = __assign(__assign({}, validCreateAlertConfig), { id: "some-id" });
      var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(invalidConfig);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.it)("should apply default values correctly", () => {
      var minimalConfig = {
        clinicId: "cc123e45-e89b-12d3-a456-426614174000",
        alertType: "low_stock",
        thresholdValue: 5,
        notificationChannels: ["in_app"],
      };
      var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(minimalConfig);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.thresholdUnit).toBe("quantity");
        (0, globals_1.expect)(result.data.severityLevel).toBe("medium");
        (0, globals_1.expect)(result.data.isActive).toBe(true);
      }
    });
  });
  (0, globals_1.describe)("updateStockAlertConfigSchema", () => {
    (0, globals_1.it)("should validate partial updates", () => {
      var partialUpdate = {
        thresholdValue: 20,
        severityLevel: "high",
      };
      var result = stock_alerts_1.updateStockAlertConfigSchema.safeParse(partialUpdate);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should reject update with readonly fields", () => {
      var invalidUpdate = {
        clinicId: "new-clinic-id",
        thresholdValue: 20,
      };
      var result = stock_alerts_1.updateStockAlertConfigSchema.safeParse(invalidUpdate);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
});
// =====================================================
// STOCK ALERT SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Stock Alert Schema Validation", () => {
  (0, globals_1.describe)("stockAlertSchema", () => {
    (0, globals_1.it)("should validate a complete valid alert", () => {
      var result = stock_alerts_1.stockAlertSchema.safeParse(validAlert);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should reject invalid severity levels", () => {
      var invalidAlert = __assign(__assign({}, validAlert), { severityLevel: "super_critical" });
      var result = stock_alerts_1.stockAlertSchema.safeParse(invalidAlert);
      (0, globals_1.expect)(result.success).toBe(false);
    });
    (0, globals_1.it)("should reject negative current values", () => {
      var invalidAlert = __assign(__assign({}, validAlert), { currentValue: -1 });
      var result = stock_alerts_1.stockAlertSchema.safeParse(invalidAlert);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain("Must be non-negative");
      }
    });
    (0, globals_1.it)("should reject empty or too long messages", () => {
      var emptyMessage = __assign(__assign({}, validAlert), { message: "" });
      var longMessage = __assign(__assign({}, validAlert), { message: "a".repeat(1001) });
      (0, globals_1.expect)(stock_alerts_1.stockAlertSchema.safeParse(emptyMessage).success).toBe(
        false,
      );
      (0, globals_1.expect)(stock_alerts_1.stockAlertSchema.safeParse(longMessage).success).toBe(
        false,
      );
    });
    (0, globals_1.it)("should validate acknowledgment constraint", () => {
      // Valid: both acknowledgedBy and acknowledgedAt present
      var validAck = __assign(__assign({}, validAlert), {
        acknowledgedBy: "user123",
        acknowledgedAt: new Date(),
      });
      (0, globals_1.expect)(stock_alerts_1.stockAlertSchema.safeParse(validAck).success).toBe(true);
      // Invalid: only acknowledgedBy present
      var invalidAck = __assign(__assign({}, validAlert), { acknowledgedBy: "user123" });
      var result = stock_alerts_1.stockAlertSchema.safeParse(invalidAck);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain(
          "Both acknowledgedBy and acknowledgedAt must be provided",
        );
      }
    });
  });
  (0, globals_1.describe)("acknowledgeAlertSchema", () => {
    (0, globals_1.it)("should validate valid acknowledgment request", () => {
      var result = stock_alerts_1.acknowledgeAlertSchema.safeParse(validAcknowledgeAlert);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should trim and validate note length", () => {
      var longNote = __assign(__assign({}, validAcknowledgeAlert), {
        note: ` ${"a".repeat(501)} `,
      });
      var result = stock_alerts_1.acknowledgeAlertSchema.safeParse(longNote);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain("Note too long");
      }
    });
    (0, globals_1.it)("should allow acknowledgment without note", () => {
      var _note = validAcknowledgeAlert.note,
        ackWithoutNote = __rest(validAcknowledgeAlert, ["note"]);
      var result = stock_alerts_1.acknowledgeAlertSchema.safeParse(ackWithoutNote);
      (0, globals_1.expect)(result.success).toBe(true);
    });
  });
  (0, globals_1.describe)("resolveAlertSchema", () => {
    (0, globals_1.it)("should validate valid resolution request", () => {
      var result = stock_alerts_1.resolveAlertSchema.safeParse(validResolveAlert);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should require resolution description", () => {
      var invalidResolve = __assign(__assign({}, validResolveAlert), { resolution: "" });
      var result = stock_alerts_1.resolveAlertSchema.safeParse(invalidResolve);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain(
          "Resolution description required",
        );
      }
    });
    (0, globals_1.it)("should reject overly long resolution description", () => {
      var longResolution = __assign(__assign({}, validResolveAlert), {
        resolution: "a".repeat(1001),
      });
      var result = stock_alerts_1.resolveAlertSchema.safeParse(longResolution);
      (0, globals_1.expect)(result.success).toBe(false);
      if (!result.success) {
        (0, globals_1.expect)(result.error.issues[0].message).toContain("Resolution too long");
      }
    });
  });
});
// =====================================================
// CUSTOM REPORTS SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Custom Stock Reports Schema Validation", () => {
  var validReport = {
    clinicId: "cc123e45-e89b-12d3-a456-426614174000",
    userId: "user123e45-e89b-12d3-a456-426614174000",
    reportName: "Monthly Consumption Report",
    reportType: "consumption",
    filters: {
      dateRange: {
        start: new Date("2025-01-01"),
        end: new Date("2025-01-31"),
      },
      productIds: ["pc123e45-e89b-12d3-a456-426614174000"],
    },
    isActive: true,
  };
  (0, globals_1.it)("should validate valid custom report", () => {
    var result = stock_alerts_1.customStockReportSchema.safeParse(validReport);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should reject empty report names", () => {
    var invalidReport = __assign(__assign({}, validReport), { reportName: "" });
    var result = stock_alerts_1.customStockReportSchema.safeParse(invalidReport);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should trim report names", () => {
    var reportWithSpaces = __assign(__assign({}, validReport), {
      reportName: "  Trimmed Report  ",
    });
    var result = stock_alerts_1.customStockReportSchema.safeParse(reportWithSpaces);
    (0, globals_1.expect)(result.success).toBe(true);
    if (result.success) {
      (0, globals_1.expect)(result.data.reportName).toBe("Trimmed Report");
    }
  });
  (0, globals_1.it)("should validate date range constraint", () => {
    var invalidDateRange = __assign(__assign({}, validReport), {
      filters: {
        dateRange: {
          start: new Date("2025-01-31"),
          end: new Date("2025-01-01"), // End before start
        },
      },
    });
    var result = stock_alerts_1.customStockReportSchema.safeParse(invalidDateRange);
    (0, globals_1.expect)(result.success).toBe(false);
    if (!result.success) {
      (0, globals_1.expect)(result.error.issues[0].message).toContain(
        "Start date must be before or equal to end date",
      );
    }
  });
  (0, globals_1.it)("should validate schedule config constraints", () => {
    var validSchedule = {
      frequency: "weekly",
      dayOfWeek: 1, // Monday
      time: "09:30",
      recipients: ["user@example.com"],
      enabled: true,
    };
    var reportWithSchedule = __assign(__assign({}, validReport), { scheduleConfig: validSchedule });
    var result = stock_alerts_1.customStockReportSchema.safeParse(reportWithSchedule);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should reject invalid time format in schedule", () => {
    var invalidSchedule = {
      frequency: "daily",
      time: "25:70", // Invalid time
      recipients: ["user@example.com"],
    };
    var reportWithInvalidSchedule = __assign(__assign({}, validReport), {
      scheduleConfig: invalidSchedule,
    });
    var result = stock_alerts_1.customStockReportSchema.safeParse(reportWithInvalidSchedule);
    (0, globals_1.expect)(result.success).toBe(false);
    if (!result.success) {
      (0, globals_1.expect)(result.error.issues[0].message).toContain("Invalid time format");
    }
  });
});
// =====================================================
// PERFORMANCE METRICS SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Stock Performance Metrics Schema Validation", () => {
  var validMetrics = {
    clinicId: "cc123e45-e89b-12d3-a456-426614174000",
    metricDate: new Date(),
    totalValue: 10000.5,
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
  (0, globals_1.it)("should validate valid performance metrics", () => {
    var result = stock_alerts_1.stockPerformanceMetricsSchema.safeParse(validMetrics);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should reject negative values where inappropriate", () => {
    var negativeMetrics = __assign(__assign({}, validMetrics), { totalValue: -100 });
    var result = stock_alerts_1.stockPerformanceMetricsSchema.safeParse(negativeMetrics);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should reject invalid percentage values", () => {
    var invalidPercentage = __assign(__assign({}, validMetrics), { accuracyPercentage: 150 });
    var result = stock_alerts_1.stockPerformanceMetricsSchema.safeParse(invalidPercentage);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should allow optional fields to be undefined", () => {
    var minimalMetrics = {
      clinicId: "cc123e45-e89b-12d3-a456-426614174000",
      metricDate: new Date(),
      totalValue: 10000,
      wasteValue: 0,
      wastePercentage: 0,
      activeAlertsCount: 0,
      criticalAlertsCount: 0,
      productsCount: 100,
      outOfStockCount: 0,
      lowStockCount: 0,
    };
    var result = stock_alerts_1.stockPerformanceMetricsSchema.safeParse(minimalMetrics);
    (0, globals_1.expect)(result.success).toBe(true);
  });
});
// =====================================================
// DASHBOARD DATA SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Stock Dashboard Data Schema Validation", () => {
  var validDashboardData = {
    kpis: {
      totalValue: 50000,
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
          category: "medical_supplies",
          trend: "up",
        },
      ],
      topProducts: [
        {
          productId: "pc123e45-e89b-12d3-a456-426614174000",
          name: "Product A",
          sku: "SKU001",
          consumption: 50,
          value: 500,
          changePercentage: 5.2,
        },
      ],
      alertsByType: [
        {
          type: "low_stock",
          count: 3,
          severity: "medium",
          percentage: 60,
        },
      ],
      wasteAnalysis: [
        {
          period: "Last week",
          waste: 50,
          percentage: 0.5,
          trend: "improving",
        },
      ],
    },
    alerts: [validAlert],
    recommendations: [
      {
        id: "rec1",
        type: "reorder",
        priority: "high",
        title: "Reorder Required",
        message: "Several products need reordering",
        actionable: true,
        dismissible: true,
        createdAt: new Date(),
      },
    ],
    lastUpdated: new Date(),
  };
  (0, globals_1.it)("should validate complete dashboard data", () => {
    var result = stock_alerts_1.stockDashboardDataSchema.safeParse(validDashboardData);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should apply default values for lastUpdated", () => {
    var _lastUpdated = validDashboardData.lastUpdated,
      dataWithoutLastUpdated = __rest(validDashboardData, ["lastUpdated"]);
    var result = stock_alerts_1.stockDashboardDataSchema.safeParse(dataWithoutLastUpdated);
    (0, globals_1.expect)(result.success).toBe(true);
    if (result.success) {
      (0, globals_1.expect)(result.data.lastUpdated).toBeInstanceOf(Date);
    }
  });
});
// =====================================================
// QUERY SCHEMA TESTS
// =====================================================
(0, globals_1.describe)("Query Schema Validation", () => {
  (0, globals_1.describe)("alertsQuerySchema", () => {
    (0, globals_1.it)("should validate valid query parameters", () => {
      var validQuery = {
        status: "active",
        severity: "high",
        limit: 25,
        offset: 50,
        sortBy: "severity_level",
        sortOrder: "asc",
      };
      var result = stock_alerts_1.alertsQuerySchema.safeParse(validQuery);
      (0, globals_1.expect)(result.success).toBe(true);
    });
    (0, globals_1.it)("should apply default values", () => {
      var minimalQuery = {};
      var result = stock_alerts_1.alertsQuerySchema.safeParse(minimalQuery);
      (0, globals_1.expect)(result.success).toBe(true);
      if (result.success) {
        (0, globals_1.expect)(result.data.limit).toBe(50);
        (0, globals_1.expect)(result.data.offset).toBe(0);
        (0, globals_1.expect)(result.data.sortBy).toBe("created_at");
        (0, globals_1.expect)(result.data.sortOrder).toBe("desc");
      }
    });
    (0, globals_1.it)("should enforce limit constraints", () => {
      var invalidQuery = { limit: 150 }; // Over max
      var result = stock_alerts_1.alertsQuerySchema.safeParse(invalidQuery);
      (0, globals_1.expect)(result.success).toBe(false);
    });
  });
});
// =====================================================
// VALIDATION FUNCTION TESTS
// =====================================================
(0, globals_1.describe)("Validation Functions", () => {
  (0, globals_1.describe)("validateStockAlertConfig", () => {
    (0, globals_1.it)("should validate valid config", () => {
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateStockAlertConfig)(validAlertConfig),
      ).not.toThrow();
    });
    (0, globals_1.it)("should throw on invalid config", () => {
      var invalidConfig = __assign(__assign({}, validAlertConfig), { clinicId: "invalid" });
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateStockAlertConfig)(invalidConfig),
      ).toThrow();
    });
  });
  (0, globals_1.describe)("validateCreateStockAlertConfig", () => {
    (0, globals_1.it)("should validate valid create config", () => {
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateCreateStockAlertConfig)(validCreateAlertConfig),
      ).not.toThrow();
    });
    (0, globals_1.it)("should throw on invalid create config", () => {
      var invalidConfig = __assign(__assign({}, validCreateAlertConfig), { thresholdValue: -1 });
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateCreateStockAlertConfig)(invalidConfig),
      ).toThrow();
    });
  });
  (0, globals_1.describe)("validateAcknowledgeAlert", () => {
    (0, globals_1.it)("should validate valid acknowledge request", () => {
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateAcknowledgeAlert)(validAcknowledgeAlert),
      ).not.toThrow();
    });
    (0, globals_1.it)("should throw on invalid acknowledge request", () => {
      var invalidAck = __assign(__assign({}, validAcknowledgeAlert), { alertId: "invalid" });
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateAcknowledgeAlert)(invalidAck),
      ).toThrow();
    });
  });
  (0, globals_1.describe)("validateResolveAlert", () => {
    (0, globals_1.it)("should validate valid resolve request", () => {
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateResolveAlert)(validResolveAlert),
      ).not.toThrow();
    });
    (0, globals_1.it)("should throw on invalid resolve request", () => {
      var invalidResolve = __assign(__assign({}, validResolveAlert), { resolution: "" });
      (0, globals_1.expect)(() =>
        (0, stock_alerts_1.validateResolveAlert)(invalidResolve),
      ).toThrow();
    });
  });
});
// =====================================================
// EDGE CASES AND SECURITY TESTS
// =====================================================
(0, globals_1.describe)("Edge Cases and Security", () => {
  (0, globals_1.it)("should handle extremely large numbers appropriately", () => {
    var configWithLargeNumber = __assign(__assign({}, validCreateAlertConfig), {
      thresholdValue: Number.MAX_SAFE_INTEGER,
    });
    var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(configWithLargeNumber);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should reject null/undefined values where required", () => {
    var configWithNull = __assign(__assign({}, validCreateAlertConfig), { clinicId: null });
    var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(configWithNull);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should sanitize string inputs", () => {
    var _configWithWhitespace = __assign({}, validCreateAlertConfig);
    // Additional sanitization tests can be added here
  });
  (0, globals_1.it)("should handle array validation correctly", () => {
    var configWithInvalidChannels = __assign(__assign({}, validCreateAlertConfig), {
      notificationChannels: ["invalid_channel"],
    });
    var result = stock_alerts_1.createStockAlertConfigSchema.safeParse(configWithInvalidChannels);
    (0, globals_1.expect)(result.success).toBe(false);
  });
});
// =====================================================
// PERFORMANCE TESTS
// =====================================================
(0, globals_1.describe)("Performance and Scalability", () => {
  (0, globals_1.it)("should handle large arrays efficiently", () => {
    var largeArray = Array(1000)
      .fill(0)
      .map((_, i) => ({
        date: new Date().toISOString(),
        value: i,
        trend: "stable",
      }));
    var dashboardWithLargeData = {
      kpis: {
        totalValue: 50000,
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
    var startTime = performance.now();
    var result = stock_alerts_1.stockDashboardDataSchema.safeParse(dashboardWithLargeData);
    var endTime = performance.now();
    (0, globals_1.expect)(result.success).toBe(true);
    (0, globals_1.expect)(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
  });
});
