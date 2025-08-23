// Temporarily disabled until @neonpro/core-services scheduling is properly built
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	return NextResponse.json(
		{
			success: false,
			error:
				"AI Scheduling API temporarily unavailable - package under development",
		},
		{ status: 503 },
	);
}

export async function POST(_request: NextRequest) {
	return NextResponse.json(
		{
			success: false,
			error:
				"AI Scheduling API temporarily unavailable - package under development",
		},
		{ status: 503 },
	);
}
