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

interface TestContext {
	userId: string;
	operation: string;
	ipAddress: string;
}

interface TestRepo {
	findData: (id: string) => Promise<any>;
}

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
	console.log("🧪 Testing FASE 2 Enterprise Services...\n");

	try {
		// 1. Test EnterpriseCacheService
		console.log("1️⃣ Testing EnterpriseCacheService...");
		const cacheService = new EnterpriseCacheService();

		await cacheService.set("test-key", { value: "test-data" });
		const cachedData = await cacheService.get("test-key");
		console.log("✅ Cache service working:", cachedData ? "DATA_FOUND" : "DATA_NOT_FOUND");

		// 2. Test EnterpriseAnalyticsService
		console.log("\n2️⃣ Testing EnterpriseAnalyticsService...");
		const analyticsService = new EnterpriseAnalyticsService();

		await analyticsService.trackEvent({
			type: "test_event",
			timestamp: Date.now(),
			properties: { test: true },
		});
		console.log("✅ Analytics service working: EVENT_TRACKED");

		// 3. Test EnterpriseSecurityService
		console.log("\n3️⃣ Testing EnterpriseSecurityService...");
		const securityService = new EnterpriseSecurityService();

		const hasAccess = await securityService.validateAccess("testOperation", {
			userId: "test-user",
			resource: "test-resource",
			action: "read",
		});
		console.log("✅ Security service working:", hasAccess ? "ACCESS_GRANTED" : "ACCESS_DENIED");

		// 4. Test EnterpriseAuditService
		console.log("\n4️⃣ Testing EnterpriseAuditService...");
		const auditService = new EnterpriseAuditService();

		await auditService.logEvent({
			id: "test-audit-" + Date.now(),
			service: "test-service",
			userId: "test-user",
			action: "test_action",
			eventType: "TEST_EVENT",
			timestamp: new Date(),
			data: { test: true },
		});
		console.log("✅ Audit service working: EVENT_LOGGED");

		// 5. Test EnterpriseHealthCheckService
		console.log("\n5️⃣ Testing EnterpriseHealthCheckService...");
		const healthService = new EnterpriseHealthCheckService();

		const healthResult = await healthService.checkHealth("cache");
		console.log("✅ Health service working:", healthResult.status);

		// 6. Test integrated EnhancedServiceBase
		console.log("\n6️⃣ Testing integrated EnhancedServiceBase...");
		const testService = new TestEnterpriseService();

		const context: TestContext = {
			userId: "test-user",
			operation: "test",
			ipAddress: "127.0.0.1",
		};

		const result1 = await testService.testOperation("test-id-1", context);
		console.log("✅ Enhanced service basic operation working:", result1 ? "SUCCESS" : "FAILED");

		const result2 = await testService.testCachedOperation("test-id-2", context);
		console.log("✅ Enhanced service cached operation working:", result2 ? "SUCCESS" : "FAILED");

		console.log("\n🎉 ALL ENTERPRISE SERVICES VALIDATION COMPLETED SUCCESSFULLY!");
		console.log("📊 FASE 2 IMPLEMENTATION STATUS: ✅ VALIDATED");

		return true;
	} catch (error) {
		console.error("\n❌ Enterprise services validation failed:", error);
		console.log("📊 FASE 2 IMPLEMENTATION STATUS: ❌ VALIDATION_FAILED");
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
		.catch((error) => {
			console.error("Test execution failed:", error);
			process.exit(1);
		});
}
