import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "NeonPro Healthcare",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      compliance: {
        lgpd: true,
        anvisa: true,
      },
    },
    { status: 200 },
  );
}
