/**
 * Enterprise Services Validation Test
 * Tests all FASE 2 enterprise services functionality
 */

import { EnhancedServiceBase } from "../base/EnhancedServiceBase";
import { EnterpriseAnalyticsService } from "../enterprise/analytics/EnterpriseAnalyticsService";
import { EnterpriseAuditService } from "../enterprise/audit/EnterpriseAuditService";
import { EnterpriseCacheService } from "../enterprise/cache/EnterpriseCacheService";
import { EnterpriseSecurityService } from "../enterprise/security/EnterpriseSecurityService";
import { EnterpriseHealthCheckService } from "../health/EnterpriseHealthCheckService";

type TestContext = {
	userId: string;
	operation: string;
	ipAddress: string;
};

type TestRepo = {
	findData: (id: string) => Promise<any>;
};

// Mock repository for testing
const mockRepo: TestRepo = {
	async findData(id: string) {
		return { id, data: `test-data-${id}`, timestamp: new Date() };
	},
};

class TestEnterpriseService extends EnhancedServiceBase<TestRepo> {
	constructor() {
		super(mockRepo, {
			serviceName: "test-enterprise-service",
			enableCache: true,
			enableAnalytics: true,
			enableSecurity: true,
			enableAudit: true,
		});
	}

	async testOperation(id: string, context: TestContext) {
		return this.executeOperation(
			"testOperation",
			async () => {
				const result = await this.repository.findData(id);
				return { ...result, processed: true };
			},
			context
		);
	}

	async testCachedOperation(id: string, context: TestContext) {
		return this.executeOperation(
			"testCachedOperation",
			async () => {
				const result = await this.repository.findData(id);
				return { ...result, cached: true };
			},
			context,
			{ useCache: true, cacheKey: `test-${id}`, cacheTTL: 300 }
		);
	}
}

// Test function
async function testEnterpriseServices() {
	try {
		const cacheService = new EnterpriseCacheService();

		await cacheService.set("test-key", { value: "test-data" });
		const _cachedData = await cacheService.get("test-key");
		const analyticsService = new EnterpriseAnalyticsService();

		await analyticsService.trackEvent({
			type: "test_event",
			timestamp: Date.now(),
			properties: { test: true },
		});
		const securityService = new EnterpriseSecurityService();

		const _hasAccess = await securityService.validateAccess("testOperation", {
			userId: "test-user",
			resource: "test-resource",
			action: "read",
		});
		const auditService = new EnterpriseAuditService();

		await auditService.logEvent({
			id: `test-audit-${Date.now()}`,
			service: "test-service",
			userId: "test-user",
			action: "test_action",
			eventType: "TEST_EVENT",
			timestamp: new Date(),
			data: { test: true },
		});
		const healthService = new EnterpriseHealthCheckService();

		const _healthResult = await healthService.checkHealth("cache");
		const testService = new TestEnterpriseService();

		const context: TestContext = {
			userId: "test-user",
			operation: "test",
			ipAddress: "127.0.0.1",
		};

		const _result1 = await testService.testOperation("test-id-1", context);

		const _result2 = await testService.testCachedOperation("test-id-2", context);

		return true;
	} catch (_error) {
		return false;
	}
}

// Export for testing
export { testEnterpriseServices, TestEnterpriseService };

// Run test if this file is executed directly
if (require.main === module) {
	testEnterpriseServices()
		.then((success) => {
			process.exit(success ? 0 : 1);
		})
		.catch((_error) => {
			process.exit(1);
		});
}
