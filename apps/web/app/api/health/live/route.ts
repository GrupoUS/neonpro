/**
 * Liveness Probe Endpoint
 * Simple check to verify application is alive and responsive
 */

import { NextResponse } from "next/server";

async function GET() {
  // Very lightweight check - just verify the process is responsive
  const timestamp = new Date().toISOString();
  const uptime = process.uptime ? process.uptime() : 0;

  // Basic memory check to ensure process isn't completely broken
  let memoryStatus = "unknown";
  try {
    if (process.memoryUsage) {
      const mem = process.memoryUsage();
      const rssGB = mem.rss / 1024 / 1024 / 1024;

      // Only fail liveness if memory usage is extremely high (>2GB)
      if (rssGB > 2) {
        return NextResponse.json({
          alive: false,
          timestamp,
          uptime,
          reason: "Critical memory usage detected",
          memory: Math.round(rssGB * 1000) / 1000 + "GB",
        }, { status: 503 });
      }

      memoryStatus = Math.round(rssGB * 1000) / 1000 + "GB";
    }
  } catch {
    // If memory check fails, still consider alive
    memoryStatus = "check_failed";
  }

  return NextResponse.json({
    alive: true,
    timestamp,
    uptime,
    memory: memoryStatus,
    pid: process.pid || "unknown",
  });
}

export { GET };
export const dynamic = "force-dynamic";
