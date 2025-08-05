// Analytics Controller Layer - STORY-SUB-002 Task 2
// API route handlers for analytics endpoints
// Created: 2025-01-22

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { AnalyticsService } from "./service";
import type { AnalyticsQuerySchema, MetricPeriodSchema } from "./types";

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  // ========================================================================
  // REVENUE ANALYTICS ENDPOINT
  // ========================================================================

  async handleRevenueAnalytics(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);

      // Parse and validate query parameters
      const queryParams = {
        period: searchParams.get("period") || "month",
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
        tier: searchParams.get("tier"),
        currency: searchParams.get("currency") || "USD",
      };

      // Validation
      const period = MetricPeriodSchema.parse(queryParams.period);
      const startDate = queryParams.startDate
        ? new Date(queryParams.startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = queryParams.endDate ? new Date(queryParams.endDate) : new Date();

      // Build filters
      const filters: Record<string, any> = { currency: queryParams.currency };
      if (queryParams.tier) filters.tier = queryParams.tier;

      // Execute analytics query
      const analytics = await this.service.getRevenueAnalytics(period, startDate, endDate, filters);

      return NextResponse.json(analytics, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  } // ========================================================================
  // CONVERSION ANALYTICS ENDPOINT
  // ========================================================================

  async handleConversionAnalytics(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);

      const queryParams = {
        period: searchParams.get("period") || "month",
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
        source: searchParams.get("source"),
        stage: searchParams.get("stage"),
      };

      const period = MetricPeriodSchema.parse(queryParams.period);
      const startDate = queryParams.startDate
        ? new Date(queryParams.startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = queryParams.endDate ? new Date(queryParams.endDate) : new Date();

      const filters: Record<string, any> = {};
      if (queryParams.source) filters.source = queryParams.source;
      if (queryParams.stage) filters.stage = queryParams.stage;

      const analytics = await this.service.getConversionAnalytics(
        period,
        startDate,
        endDate,
        filters,
      );

      return NextResponse.json(analytics, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========================================================================
  // REAL-TIME METRICS ENDPOINT
  // ========================================================================

  async handleRealTimeMetrics(request: NextRequest) {
    try {
      const metrics = await this.service.getRealTimeMetrics();

      return NextResponse.json(
        {
          data: metrics,
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      return this.handleError(error);
    }
  } // ========================================================================
  // TRIAL PREDICTION ENDPOINT
  // ========================================================================

  async handleTrialPrediction(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const trialId = searchParams.get("trialId");

      if (!userId || !trialId) {
        return NextResponse.json({ error: "userId and trialId are required" }, { status: 400 });
      }

      const prediction = await this.service.predictTrialConversion(userId, trialId);

      return NextResponse.json(
        {
          data: prediction,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: "engagement-based-v1",
            version: "1.0.0",
          },
        },
        {
          status: 200,
          headers: {
            "Cache-Control": "private, max-age=3600", // 1 hour cache for predictions
          },
        },
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========================================================================
  // BULK ANALYTICS ENDPOINT (POST)
  // ========================================================================

  async handleBulkAnalytics(request: NextRequest) {
    try {
      const body = await request.json();
      const queries = z.array(AnalyticsQuerySchema).parse(body.queries);

      const results = await Promise.all(
        queries.map(async (query) => {
          if (query.metrics.includes("revenue")) {
            return await this.service.getRevenueAnalytics(
              query.period,
              query.startDate,
              query.endDate,
              query.filters,
            );
          } else if (query.metrics.includes("conversion")) {
            return await this.service.getConversionAnalytics(
              query.period,
              query.startDate,
              query.endDate,
              query.filters,
            );
          }
          throw new Error(`Unsupported metrics: ${query.metrics.join(", ")}`);
        }),
      );

      return NextResponse.json({
        data: results,
        metadata: {
          totalQueries: queries.length,
          executedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  } // ========================================================================
  // ERROR HANDLING & UTILITIES
  // ========================================================================

  private handleError(error: unknown) {
    console.error("Analytics API Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  // Health check endpoint
  async handleHealthCheck(request: NextRequest) {
    try {
      const metrics = await this.service.getRealTimeMetrics();

      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        metrics: {
          available: metrics.length > 0,
          count: metrics.length,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 503 },
      );
    }
  }
}

// Export singleton instance
export const analyticsController = new AnalyticsController();
