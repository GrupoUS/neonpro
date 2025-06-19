// NEONPRO 2FA Authentication API Route
// Placeholder for future 2FA implementation

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "2FA endpoint not implemented yet" },
    { status: 501 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "2FA status endpoint not implemented yet" },
    { status: 501 }
  );
}