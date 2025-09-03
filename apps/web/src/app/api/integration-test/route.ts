import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Frontend-Backend Integration Test
export async function GET(_request: NextRequest) {
  try {
    // Test connection to our backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";

    console.log("Testing connection to API:", apiUrl);

    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Frontend-Backend integration working",
      apiUrl,
      backendHealth: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Integration test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Frontend-Backend integration failed",
        error: error instanceof Error ? error.message : "Unknown error",
        apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
