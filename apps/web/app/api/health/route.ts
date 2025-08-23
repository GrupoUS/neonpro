/**
 * Health Check API Endpoint
 * Used by Playwright to verify server readiness before E2E tests
 */

import { NextResponse } from "next/server";

export function GET() {
	return NextResponse.json(
		{
			status: "healthy",
			timestamp: new Date().toISOString(),
			service: "NeonPro Healthcare",
			environment: process.env.NODE_ENV || "development",
		},
		{ status: 200 }
	);
}

export const dynamic = "force-dynamic";