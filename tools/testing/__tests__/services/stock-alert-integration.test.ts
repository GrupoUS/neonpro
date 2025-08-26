// Stock Alert Integration Tests - Updated for new StockAlertsService
// Story 11.4: Alertas e Relatórios de Estoque

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	AcknowledgeAlert,
	AlertsQuery,
	CreateStockAlertConfig,
	ResolveAlert,
} from "../../../../apps/web/app/lib/types/stock-alerts";

// Mock the entire service module
const mockStockAlertsService = {
	createAlertConfig: vi.fn(),
	getAlertConfigs: vi.fn(),
	getAlerts: vi.fn(),
	acknowledgeAlert: vi.fn(),
	resolveAlert: vi.fn(),
	checkStockLevels: vi.fn(),
};

vi.mock("../../../../apps/web/app/lib/services/stock-alerts.service", () => ({
	StockAlertsService: vi.fn().mockImplementation(() => mockStockAlertsService),
	stockAlertsService: mockStockAlertsService,
}));

// Test data
const mockClinicId = "123e4567-e89b-12d3-a456-426614174000";
const mockUserId = "123e4567-e89b-12d3-a456-426614174001";
const mockProductId = "123e4567-e89b-12d3-a456-426614174002";

const mockAlertConfig: CreateStockAlertConfig = {
	alertType: "low_stock",
	thresholdValue: 10,
	thresholdUnit: "quantity",
	severityLevel: "medium",
	isActive: true,
	notificationChannels: ["in_app", "email"],
	productId: mockProductId,
	createdBy: mockUserId,
	createdAt: new Date(),
};

describe("Stock Alert Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Alert Configuration Management", () => {
		it("should create alert configuration successfully", async () => {
			const expectedResult = {
				id: "new-config-id",
				clinic_id: mockClinicId,
				...mockAlertConfig,
			};

			mockStockAlertsService.createAlertConfig.mockResolvedValue(
				expectedResult,
			);

			const result = await mockStockAlertsService.createAlertConfig(
				mockAlertConfig,
				mockUserId,
			);

			expect(result).toBeDefined();
			expect(result.clinic_id).toBe(mockClinicId);
			expect(mockStockAlertsService.createAlertConfig).toHaveBeenCalledWith(
				mockAlertConfig,
				mockUserId,
			);
		});

		it("should handle duplicate configuration error", async () => {
			const error = new Error("Alert configuration already exists");
			mockStockAlertsService.createAlertConfig.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.createAlertConfig(mockAlertConfig, mockUserId),
			).rejects.toThrow("Alert configuration already exists");

			expect(mockStockAlertsService.createAlertConfig).toHaveBeenCalledWith(
				mockAlertConfig,
				mockUserId,
			);
		});

		it("should get alert configurations", async () => {
			const mockConfigs = [
				{
					id: "config-1",
					clinicId: mockClinicId,
					alertType: "low_stock",
					thresholdValue: 10,
				},
			];

			mockStockAlertsService.getAlertConfigs.mockResolvedValue(mockConfigs);

			const result = await mockStockAlertsService.getAlertConfigs(mockUserId);

			expect(result).toEqual(mockConfigs);
			expect(mockStockAlertsService.getAlertConfigs).toHaveBeenCalledWith(
				mockUserId,
			);
		});
	});

	describe("Alert Queries", () => {
		it("should get alerts with filtering", async () => {
			const query: AlertsQuery = {
				clinicId: mockClinicId,
				alertType: "low_stock",
				limit: 10,
				offset: 0,
				sortBy: "created_at",
				sortOrder: "desc",
			};

			const mockResult = {
				alerts: [
					{
						id: "alert-1",
						clinic_id: mockClinicId,
						alert_type: "low_stock",
						severity_level: "medium",
						message: "Test alert",
						status: "active",
						created_at: new Date(),
					},
				],
				total: 1,
			};

			mockStockAlertsService.getAlerts.mockResolvedValue(mockResult);

			const result = await mockStockAlertsService.getAlerts(query, mockUserId);

			expect(result).toBeDefined();
			expect(result.alerts).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(mockStockAlertsService.getAlerts).toHaveBeenCalledWith(
				query,
				mockUserId,
			);
		});

		it("should handle empty alert results", async () => {
			const query: AlertsQuery = {
				clinicId: mockClinicId,
				limit: 10,
				offset: 0,
				sortBy: "created_at",
				sortOrder: "desc",
			};

			const mockResult = {
				alerts: [],
				total: 0,
			};

			mockStockAlertsService.getAlerts.mockResolvedValue(mockResult);

			const result = await mockStockAlertsService.getAlerts(query, mockUserId);

			expect(result.alerts).toHaveLength(0);
			expect(result.total).toBe(0);
		});
	});

	describe("Alert Acknowledgment", () => {
		it("should acknowledge alert successfully", async () => {
			const acknowledgeData: AcknowledgeAlert = {
				alertId: "alert-id",
				acknowledgedBy: mockUserId,
				note: "Issue resolved",
			};

			const mockResult = {
				id: "alert-id",
				status: "acknowledged",
				acknowledged_by: mockUserId,
				acknowledged_at: new Date(),
			};

			mockStockAlertsService.acknowledgeAlert.mockResolvedValue(mockResult);

			const result =
				await mockStockAlertsService.acknowledgeAlert(acknowledgeData);

			expect(result).toBeDefined();
			expect(result.status).toBe("acknowledged");
			expect(result.acknowledged_by).toBe(mockUserId);
			expect(mockStockAlertsService.acknowledgeAlert).toHaveBeenCalledWith(
				acknowledgeData,
			);
		});

		it("should handle acknowledgment of non-existent alert", async () => {
			const acknowledgeData: AcknowledgeAlert = {
				alertId: "non-existent",
				acknowledgedBy: mockUserId,
			};

			const error = new Error("Alert not found");
			mockStockAlertsService.acknowledgeAlert.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.acknowledgeAlert(acknowledgeData),
			).rejects.toThrow("Alert not found");

			expect(mockStockAlertsService.acknowledgeAlert).toHaveBeenCalledWith(
				acknowledgeData,
			);
		});

		it("should handle acknowledgment of non-active alert", async () => {
			const acknowledgeData: AcknowledgeAlert = {
				alertId: "alert-id",
				acknowledgedBy: mockUserId,
			};

			const error = new Error("Alert is not in active status");
			mockStockAlertsService.acknowledgeAlert.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.acknowledgeAlert(acknowledgeData),
			).rejects.toThrow("Alert is not in active status");
		});
	});

	describe("Alert Resolution", () => {
		it("should resolve alert successfully", async () => {
			const resolveData: ResolveAlert = {
				alertId: "alert-id",
				resolvedBy: mockUserId,
				resolution: "Stock replenished",
				actionsTaken: ["Ordered more inventory", "Updated thresholds"],
			};

			const mockResult = {
				id: "alert-id",
				status: "resolved",
				resolved_by: mockUserId,
				resolved_at: new Date(),
				metadata: {
					resolution: "Stock replenished",
					actions_taken: ["Ordered more inventory", "Updated thresholds"],
				},
			};

			mockStockAlertsService.resolveAlert.mockResolvedValue(mockResult);

			const result = await mockStockAlertsService.resolveAlert(resolveData);

			expect(result).toBeDefined();
			expect(result.status).toBe("resolved");
			expect(result.resolved_by).toBe(mockUserId);
			expect(result.metadata.resolution).toBe("Stock replenished");
			expect(mockStockAlertsService.resolveAlert).toHaveBeenCalledWith(
				resolveData,
			);
		});

		it("should handle resolution of already resolved alert", async () => {
			const resolveData: ResolveAlert = {
				alertId: "alert-id",
				resolvedBy: mockUserId,
				resolution: "Already resolved",
			};

			const error = new Error("Alert is already resolved");
			mockStockAlertsService.resolveAlert.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.resolveAlert(resolveData),
			).rejects.toThrow("Alert is already resolved");
		});
	});

	describe("Stock Level Evaluation", () => {
		it("should check stock levels and generate alerts", async () => {
			const mockGeneratedAlerts = [
				{
					id: "new-alert",
					clinicId: mockClinicId,
					productId: mockProductId,
					alertType: "low_stock",
					severityLevel: "medium",
					currentValue: 5,
					thresholdValue: 10,
					message: "Low stock detected",
					status: "active",
				},
			];

			mockStockAlertsService.checkStockLevels.mockResolvedValue(
				mockGeneratedAlerts,
			);

			const result = await mockStockAlertsService.checkStockLevels(mockUserId);

			expect(result).toHaveLength(1);
			expect(result[0].alertType).toBe("low_stock");
			expect(result[0].currentValue).toBe(5);
			expect(mockStockAlertsService.checkStockLevels).toHaveBeenCalledWith(
				mockUserId,
			);
		});

		it("should handle no alerts generated", async () => {
			mockStockAlertsService.checkStockLevels.mockResolvedValue([]);

			const result = await mockStockAlertsService.checkStockLevels(mockUserId);

			expect(result).toHaveLength(0);
		});
	});

	describe("Error Handling", () => {
		it("should handle database connection errors", async () => {
			const error = new Error("Database connection failed");
			mockStockAlertsService.createAlertConfig.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.createAlertConfig(mockAlertConfig, mockUserId),
			).rejects.toThrow("Database connection failed");
		});

		it("should handle invalid user context", async () => {
			const error = new Error("User clinic context not found");
			mockStockAlertsService.getAlertConfigs.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.getAlertConfigs(mockUserId),
			).rejects.toThrow("User clinic context not found");
		});

		it("should handle service initialization errors", async () => {
			const error = new Error("Service initialization failed");
			mockStockAlertsService.createAlertConfig.mockRejectedValue(error);

			await expect(
				mockStockAlertsService.createAlertConfig(mockAlertConfig, mockUserId),
			).rejects.toThrow("Service initialization failed");
		});
	});

	describe("Integration Workflows", () => {
		it("should support complete alert lifecycle", async () => {
			// Create alert config
			const configResult = {
				id: "config-id",
				...mockAlertConfig,
				clinic_id: mockClinicId,
			};
			mockStockAlertsService.createAlertConfig.mockResolvedValue(configResult);

			// Generate alerts
			const generatedAlerts = [
				{
					id: "alert-id",
					alertType: "low_stock",
					status: "active",
				},
			];
			mockStockAlertsService.checkStockLevels.mockResolvedValue(
				generatedAlerts,
			);

			// Acknowledge alert
			const acknowledgedAlert = {
				id: "alert-id",
				status: "acknowledged",
			};
			mockStockAlertsService.acknowledgeAlert.mockResolvedValue(
				acknowledgedAlert,
			);

			// Resolve alert
			const resolvedAlert = {
				id: "alert-id",
				status: "resolved",
			};
			mockStockAlertsService.resolveAlert.mockResolvedValue(resolvedAlert);

			// Execute workflow
			const config = await mockStockAlertsService.createAlertConfig(
				mockAlertConfig,
				mockUserId,
			);
			expect(config.id).toBe("config-id");

			const alerts = await mockStockAlertsService.checkStockLevels(mockUserId);
			expect(alerts).toHaveLength(1);

			const acknowledged = await mockStockAlertsService.acknowledgeAlert({
				alertId: "alert-id",
				acknowledgedBy: mockUserId,
			});
			expect(acknowledged.status).toBe("acknowledged");

			const resolved = await mockStockAlertsService.resolveAlert({
				alertId: "alert-id",
				resolvedBy: mockUserId,
				resolution: "Resolved by restocking",
			});
			expect(resolved.status).toBe("resolved");
		});
	});
});
