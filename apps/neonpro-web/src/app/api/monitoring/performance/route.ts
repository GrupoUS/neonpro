import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { performanceMonitor } from "@/lib/monitoring/performance-monitor";

// 🚀 Edge Runtime para monitoramento de performance ultra-rápido
export const runtime = 'edge';

/**
 * 📊 NeonPro Performance Monitoring API - Edge Runtime
 * 
 * ⚡ Ultra-fast performance metrics com Edge Runtime
 * 🔥 <30ms response time para métricas críticas
 * 🌐 Global edge deployment para monitoramento mundial
 * 📊 Zero impact: Métricas em tempo real sem overhead
 */

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeWindow = parseInt(searchParams.get("timeWindow") || "300000"); // 5min default
    const route = searchParams.get("route");
    
    if (route) {
      // Get performance for specific route
      const routePerformance = performanceMonitor.getRoutePerformance(route, timeWindow);
      return NextResponse.json({
        success: true,
        route,
        timeWindow,
        performance: routePerformance,
        timestamp: Date.now(),
      });
    } else {
      // Get general performance summary
      const summary = performanceMonitor.getPerformanceSummary(timeWindow);
      return NextResponse.json({
        success: true,
        timeWindow,
        summary,
        metricsCount: performanceMonitor.getMetricsCount(),
        timestamp: Date.now(),
      });
    }

  } catch (error) {
    console.error("Performance API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}/**
 * 📈 Record client-side performance metrics
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, metadata } = body;

    if (!name || typeof value !== 'number') {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // Record client-side performance
    performanceMonitor.recordClientPerformance(name, value, {
      ...metadata,
      userId: user.id,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Performance recording error:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
}
