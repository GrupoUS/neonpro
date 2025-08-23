/**
 * NeonPro API Endpoint Testing Script
 * Comprehensive validation of all API endpoints with the new database service
 */

import { logger } from "../../utils/logger";

const API_BASE = "http://localhost:3003";

async function testEndpoint(path, options = {}) {
	const url = `${API_BASE}${path}`;
	const defaultOptions = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	try {
		const response = await fetch(url, { ...defaultOptions, ...options });
		const data = await response.json();

		return { status: response.status, data, success: response.ok };
	} catch (error) {
		return { status: 500, error: error.message, success: false };
	}
}

async function runAllTests() {
	// Basic endpoints
	await testEndpoint("/");
	await testEndpoint("/health");

	// Authentication endpoints (should return validation errors for missing data)
	await testEndpoint("/api/v1/auth/register", {
		method: "POST",
		body: JSON.stringify({}),
	});

	await testEndpoint("/api/v1/auth/login", {
		method: "POST",
		body: JSON.stringify({}),
	});

	// Protected endpoints (should return unauthorized)
	await testEndpoint("/api/v1/clinics");
	await testEndpoint("/api/v1/patients");
	await testEndpoint("/api/v1/appointments");

	// Non-existent endpoints (should return 404)
	await testEndpoint("/api/v1/nonexistent");
	await testEndpoint("/docs");
}

// Run tests if this file is executed directly
runAllTests().catch(logger.error);
