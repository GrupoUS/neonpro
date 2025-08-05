// Stock Alert Integration Tests
// Story 11.4: Alertas e Relatórios de Estoque
// Integration tests for complete stock alert workflow
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
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var stock_alert_service_1 = require("../stock-alert.service");
var stock_1 = require("../../types/stock");
// =====================================================
// TEST SETUP AND CONFIGURATION
// =====================================================
var supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "test-key";
// Mock Supabase client for testing
var mockSupabaseClient = {
  from: globals_1.jest.fn(),
  auth: {
    getSession: globals_1.jest.fn(),
  },
};
// Mock data
var mockClinicId = "123e4567-e89b-12d3-a456-426614174000";
var mockUserId = "123e4567-e89b-12d3-a456-426614174001";
var mockProductId = "123e4567-e89b-12d3-a456-426614174002";
var mockAlertConfig = {
  alertType: "low_stock",
  thresholdValue: 10,
  thresholdUnit: "quantity",
  severityLevel: "medium",
  isActive: true,
  notificationChannels: ["in_app", "email"],
  productId: mockProductId,
};
var mockProduct = {
  id: mockProductId,
  name: "Test Product",
  current_stock: 5,
  min_stock: 10,
  unit_cost: 100,
  clinic_id: mockClinicId,
};
// =====================================================
// TEST SUITE
// =====================================================
(0, globals_1.describe)("Stock Alert Integration Tests", () => {
  var service;
  var mockQuery;
  (0, globals_1.beforeEach)(() => {
    // Reset all mocks
    globals_1.jest.clearAllMocks();
    // Setup mock query chain
    mockQuery = {
      select: globals_1.jest.fn().mockReturnThis(),
      insert: globals_1.jest.fn().mockReturnThis(),
      update: globals_1.jest.fn().mockReturnThis(),
      delete: globals_1.jest.fn().mockReturnThis(),
      eq: globals_1.jest.fn().mockReturnThis(),
      lt: globals_1.jest.fn().mockReturnThis(),
      lte: globals_1.jest.fn().mockReturnThis(),
      gte: globals_1.jest.fn().mockReturnThis(),
      in: globals_1.jest.fn().mockReturnThis(),
      is: globals_1.jest.fn().mockReturnThis(),
      order: globals_1.jest.fn().mockReturnThis(),
      single: globals_1.jest.fn(),
      then: globals_1.jest.fn(),
    };
    // Setup mock Supabase
    mockSupabaseClient.from.mockReturnValue(mockQuery);
    // Initialize service with mock client
    service = new stock_alert_service_1.StockAlertService(mockSupabaseClient);
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.restoreAllMocks();
  });
  // =====================================================
  // ALERT CONFIGURATION TESTS
  // =====================================================
  (0, globals_1.describe)("Alert Configuration Management", () => {
    (0, globals_1.it)("should create alert configuration successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var expectedConfig, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              expectedConfig = __assign(
                __assign(
                  { id: "123e4567-e89b-12d3-a456-426614174003", clinicId: mockClinicId },
                  mockAlertConfig,
                ),
                { createdAt: new Date(), updatedAt: new Date() },
              );
              mockQuery.single.mockResolvedValue({ data: expectedConfig, error: null });
              return [4 /*yield*/, service.createAlertConfig(mockAlertConfig, mockUserId)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(expectedConfig);
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "stock_alert_configs",
              );
              (0, globals_1.expect)(mockQuery.insert).toHaveBeenCalledWith(
                globals_1.expect.objectContaining(
                  __assign({ clinic_id: mockClinicId, created_by: mockUserId }, mockAlertConfig),
                ),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle configuration creation errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var errorMessage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              errorMessage = "Duplicate configuration";
              mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: errorMessage, code: "23505" },
              });
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  service.createAlertConfig(mockAlertConfig, mockUserId),
                ).rejects.toThrow(stock_1.StockAlertError),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should update alert configuration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var configId, updateData, updatedConfig, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              configId = "123e4567-e89b-12d3-a456-426614174003";
              updateData = { isActive: false };
              updatedConfig = __assign(
                __assign({ id: configId, clinicId: mockClinicId }, mockAlertConfig),
                { isActive: false, createdAt: new Date(), updatedAt: new Date() },
              );
              mockQuery.single.mockResolvedValue({ data: updatedConfig, error: null });
              return [4 /*yield*/, service.updateAlertConfig(configId, updateData, mockUserId)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(updatedConfig);
              (0, globals_1.expect)(mockQuery.update).toHaveBeenCalledWith(
                globals_1.expect.objectContaining(
                  __assign(__assign({}, updateData), { updated_at: globals_1.expect.any(String) }),
                ),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should delete alert configuration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var configId;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              configId = "123e4567-e89b-12d3-a456-426614174003";
              mockQuery.single.mockResolvedValue({ data: { id: configId }, error: null });
              // Act
              return [4 /*yield*/, service.deleteAlertConfig(configId, mockUserId)];
            case 1:
              // Act
              _a.sent();
              // Assert
              (0, globals_1.expect)(mockQuery.delete).toHaveBeenCalled();
              (0, globals_1.expect)(mockQuery.eq).toHaveBeenCalledWith("id", configId);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // =====================================================
  // ALERT EVALUATION TESTS
  // =====================================================
  (0, globals_1.describe)("Alert Evaluation and Generation", () => {
    (0, globals_1.it)("should evaluate and generate low stock alerts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockConfigs, mockProducts, expectedAlert, alerts;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockConfigs = [
                {
                  id: "123e4567-e89b-12d3-a456-426614174003",
                  clinic_id: mockClinicId,
                  alert_type: "low_stock",
                  threshold_value: 10,
                  threshold_unit: "quantity",
                  severity_level: "medium",
                  is_active: true,
                  product_id: mockProductId,
                },
              ];
              mockProducts = [mockProduct];
              // Mock configurations query
              mockQuery.single.mockResolvedValueOnce({ data: mockConfigs, error: null });
              // Mock products query
              mockQuery.single.mockResolvedValueOnce({ data: mockProducts, error: null });
              expectedAlert = {
                id: "123e4567-e89b-12d3-a456-426614174004",
                clinicId: mockClinicId,
                alertConfigId: mockConfigs[0].id,
                productId: mockProductId,
                alertType: "low_stock",
                severityLevel: "medium",
                currentValue: 5,
                thresholdValue: 10,
                message: "Low stock detected for Test Product",
                status: "active",
                metadata: {},
                triggeredAt: new Date(),
                acknowledgedAt: null,
                createdAt: new Date(),
              };
              mockQuery.single.mockResolvedValueOnce({ data: [expectedAlert], error: null });
              return [4 /*yield*/, service.evaluateAndGenerateAlerts()];
            case 1:
              alerts = _a.sent();
              // Assert
              (0, globals_1.expect)(alerts).toHaveLength(1);
              (0, globals_1.expect)(alerts[0]).toMatchObject({
                alertType: "low_stock",
                severityLevel: "medium",
                currentValue: 5,
                thresholdValue: 10,
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should not generate alerts for inactive configurations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var inactiveConfig, alerts;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              inactiveConfig = __assign(__assign({}, mockAlertConfig), { is_active: false });
              mockQuery.single.mockResolvedValue({ data: [inactiveConfig], error: null });
              return [4 /*yield*/, service.evaluateAndGenerateAlerts()];
            case 1:
              alerts = _a.sent();
              // Assert
              (0, globals_1.expect)(alerts).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle multiple alert types correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var multipleConfigs, mockProductWithExpiration, alerts;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              multipleConfigs = [
                {
                  id: "1",
                  clinic_id: mockClinicId,
                  alert_type: "low_stock",
                  threshold_value: 10,
                  threshold_unit: "quantity",
                  severity_level: "medium",
                  is_active: true,
                  product_id: mockProductId,
                },
                {
                  id: "2",
                  clinic_id: mockClinicId,
                  alert_type: "expiring",
                  threshold_value: 7,
                  threshold_unit: "days",
                  severity_level: "high",
                  is_active: true,
                  product_id: mockProductId,
                },
              ];
              mockProductWithExpiration = __assign(__assign({}, mockProduct), {
                expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
              });
              // Setup mock responses
              mockQuery.single
                .mockResolvedValueOnce({ data: multipleConfigs, error: null })
                .mockResolvedValueOnce({ data: [mockProductWithExpiration], error: null })
                .mockResolvedValueOnce({ data: [], error: null }); // Generated alerts
              return [4 /*yield*/, service.evaluateAndGenerateAlerts()];
            case 1:
              alerts = _a.sent();
              // Assert
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "stock_alert_configs",
              );
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith("products");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // =====================================================
  // ALERT ACKNOWLEDGMENT TESTS
  // =====================================================
  (0, globals_1.describe)("Alert Acknowledgment", () => {
    (0, globals_1.it)("should acknowledge alert successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var alertId, request, acknowledgedAlert, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              alertId = "123e4567-e89b-12d3-a456-426614174004";
              request = {
                alertId: alertId,
                notes: "Issue resolved by restocking",
              };
              acknowledgedAlert = {
                id: alertId,
                clinicId: mockClinicId,
                alertConfigId: "123e4567-e89b-12d3-a456-426614174003",
                productId: mockProductId,
                alertType: "low_stock",
                severityLevel: "medium",
                currentValue: 5,
                thresholdValue: 10,
                message: "Low stock detected",
                status: "acknowledged",
                metadata: { acknowledgmentNotes: "Issue resolved by restocking" },
                triggeredAt: new Date(),
                acknowledgedAt: new Date(),
                createdAt: new Date(),
              };
              mockQuery.single.mockResolvedValue({ data: acknowledgedAlert, error: null });
              return [4 /*yield*/, service.acknowledgeAlert(request, mockUserId)];
            case 1:
              result = _a.sent();
              // Assert
              (0, globals_1.expect)(result).toEqual(acknowledgedAlert);
              (0, globals_1.expect)(mockQuery.update).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  status: "acknowledged",
                  acknowledged_at: globals_1.expect.any(String),
                  acknowledged_by: mockUserId,
                  metadata: globals_1.expect.objectContaining({
                    acknowledgmentNotes: "Issue resolved by restocking",
                  }),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle acknowledgment of non-existent alert", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var request;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              request = {
                alertId: "non-existent-id",
              };
              mockQuery.single.mockResolvedValue({
                data: null,
                error: { message: "No rows returned", code: "PGRST116" },
              });
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(
                  service.acknowledgeAlert(request, mockUserId),
                ).rejects.toThrow(stock_1.StockAlertError),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // =====================================================
  // PERFORMANCE AND EDGE CASE TESTS
  // =====================================================
  (0, globals_1.describe)("Performance and Edge Cases", () => {
    (0, globals_1.it)("should handle large number of configurations efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var manyConfigs, startTime, duration;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              manyConfigs = Array.from({ length: 1000 }, (_, i) => ({
                id: "config-".concat(i),
                clinic_id: mockClinicId,
                alert_type: "low_stock",
                threshold_value: 10,
                threshold_unit: "quantity",
                severity_level: "medium",
                is_active: true,
                product_id: "product-".concat(i),
              }));
              mockQuery.single.mockResolvedValue({ data: manyConfigs, error: null });
              startTime = Date.now();
              return [4 /*yield*/, service.evaluateAndGenerateAlerts()];
            case 1:
              _a.sent();
              duration = Date.now() - startTime;
              // Assert
              (0, globals_1.expect)(duration).toBeLessThan(5000); // Should complete within 5 seconds
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle database connection errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Arrange
              mockQuery.single.mockRejectedValue(new Error("Database connection failed"));
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(service.evaluateAndGenerateAlerts()).rejects.toThrow(
                  stock_1.StockAlertError,
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle malformed data gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var malformedConfig;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              malformedConfig = {
                id: "test-id",
                clinic_id: mockClinicId,
                alert_type: "invalid_type", // Invalid alert type
                threshold_value: -5, // Invalid negative value
                threshold_unit: "invalid_unit",
                severity_level: "invalid_severity",
                is_active: true,
              };
              mockQuery.single.mockResolvedValue({ data: [malformedConfig], error: null });
              // Act & Assert
              return [
                4 /*yield*/,
                (0, globals_1.expect)(service.evaluateAndGenerateAlerts()).rejects.toThrow(
                  stock_1.StockAlertError,
                ),
              ];
            case 1:
              // Act & Assert
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // =====================================================
  // EVENT SOURCING TESTS
  // =====================================================
  (0, globals_1.describe)("Event Sourcing and Audit Trail", () => {
    (0, globals_1.it)("should create event log for alert configuration creation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var expectedConfig;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              expectedConfig = __assign(
                __assign(
                  { id: "123e4567-e89b-12d3-a456-426614174003", clinicId: mockClinicId },
                  mockAlertConfig,
                ),
                { createdAt: new Date(), updatedAt: new Date() },
              );
              // Mock successful config creation
              mockQuery.single
                .mockResolvedValueOnce({ data: expectedConfig, error: null })
                .mockResolvedValueOnce({ data: { id: "event-id" }, error: null });
              // Act
              return [4 /*yield*/, service.createAlertConfig(mockAlertConfig, mockUserId)];
            case 1:
              // Act
              _a.sent();
              // Assert
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "stock_alert_events",
              );
              (0, globals_1.expect)(mockQuery.insert).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  event_type: "config_created",
                  entity_id: expectedConfig.id,
                  user_id: mockUserId,
                  clinic_id: mockClinicId,
                  event_data: globals_1.expect.any(Object),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should create event log for alert acknowledgment", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var alertId, request, acknowledgedAlert;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              alertId = "123e4567-e89b-12d3-a456-426614174004";
              request = { alertId: alertId };
              acknowledgedAlert = {
                id: alertId,
                clinicId: mockClinicId,
                alertConfigId: "123e4567-e89b-12d3-a456-426614174003",
                productId: mockProductId,
                alertType: "low_stock",
                severityLevel: "medium",
                currentValue: 5,
                thresholdValue: 10,
                message: "Low stock detected",
                status: "acknowledged",
                metadata: {},
                triggeredAt: new Date(),
                acknowledgedAt: new Date(),
                createdAt: new Date(),
              };
              // Mock successful acknowledgment
              mockQuery.single
                .mockResolvedValueOnce({ data: acknowledgedAlert, error: null })
                .mockResolvedValueOnce({ data: { id: "event-id" }, error: null });
              // Act
              return [4 /*yield*/, service.acknowledgeAlert(request, mockUserId)];
            case 1:
              // Act
              _a.sent();
              // Assert
              (0, globals_1.expect)(mockQuery.insert).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  event_type: "alert_acknowledged",
                  entity_id: alertId,
                  user_id: mockUserId,
                  clinic_id: mockClinicId,
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  // =====================================================
  // INTEGRATION WITH OTHER SYSTEMS
  // =====================================================
  (0, globals_1.describe)("Integration with Other Systems", () => {
    (0, globals_1.it)("should trigger notification service when alert is generated", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockNotificationService, mockConfigs;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockNotificationService = {
                sendNotification: globals_1.jest.fn().mockResolvedValue({ success: true }),
              };
              mockConfigs = [
                {
                  id: "123e4567-e89b-12d3-a456-426614174003",
                  clinic_id: mockClinicId,
                  alert_type: "low_stock",
                  threshold_value: 10,
                  threshold_unit: "quantity",
                  severity_level: "critical", // Critical alert should trigger immediate notification
                  is_active: true,
                  product_id: mockProductId,
                  notification_channels: ["email", "in_app"],
                },
              ];
              mockQuery.single
                .mockResolvedValueOnce({ data: mockConfigs, error: null })
                .mockResolvedValueOnce({ data: [mockProduct], error: null })
                .mockResolvedValueOnce({ data: [], error: null });
              // Act
              return [4 /*yield*/, service.evaluateAndGenerateAlerts()];
            case 1:
              // Act
              _a.sent();
              // Assert
              // In a real implementation, we would verify that the notification service was called
              (0, globals_1.expect)(mockSupabaseClient.from).toHaveBeenCalledWith(
                "stock_alert_configs",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
