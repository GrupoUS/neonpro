import type { demandForecastingService } from "@/app/lib/services/demand-forecasting-service";
import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

// Validation schemas
const forecastRequestSchema = z.object({
  itemId: z.string().uuid(),
  clinicId: z.string().uuid(),
  forecastPeriod: z.number().min(1).max(365),
  confidenceLevel: z.number().min(0.5).max(0.99).default(0.95),
});

const bulkForecastRequestSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().uuid(),
      forecastPeriod: z.number().min(1).max(365).default(30),
    }),
  ),
  clinicId: z.string().uuid(),
  confidenceLevel: z.number().min(0.5).max(0.99).default(0.95),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a bulk request
    if (body.items && Array.isArray(body.items)) {
      return handleBulkForecast(body);
    } else {
      return handleSingleForecast(body);
    }
  } catch (error) {
    console.error("Demand forecasting error:", error);
    return NextResponse.json({ error: "Failed to generate demand forecast" }, { status: 500 });
  }
}

async function handleSingleForecast(body: any) {
  const validation = forecastRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid request data", details: validation.error.errors },
      { status: 400 },
    );
  }

  const forecast = await demandForecastingService.generateDemandForecast(validation.data);

  return NextResponse.json({
    success: true,
    data: forecast,
  });
}

async function handleBulkForecast(body: any) {
  const validation = bulkForecastRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid bulk request data", details: validation.error.errors },
      { status: 400 },
    );
  }

  const { items, clinicId, confidenceLevel } = validation.data;

  // Process forecasts in parallel
  const forecastPromises = items.map((item) =>
    demandForecastingService
      .generateDemandForecast({
        itemId: item.itemId,
        clinicId,
        forecastPeriod: item.forecastPeriod,
        confidenceLevel,
      })
      .catch((error) => ({
        itemId: item.itemId,
        error: error.message,
      })),
  );

  const forecasts = await Promise.all(forecastPromises);

  // Separate successful forecasts from errors
  const successful = forecasts.filter((f) => !("error" in f));
  const errors = forecasts.filter((f) => "error" in f);

  return NextResponse.json({
    success: true,
    data: {
      forecasts: successful,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: items.length,
        successful: successful.length,
        failed: errors.length,
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    // Get forecasting capabilities and supported algorithms
    const capabilities = {
      algorithms: [
        {
          name: "exponential_smoothing",
          description: "Exponential smoothing for trend-based forecasting",
          bestFor: "Short to medium-term forecasts with clear trends",
        },
        {
          name: "seasonal_decomposition",
          description: "Seasonal decomposition for cyclical patterns",
          bestFor: "Data with strong seasonal patterns",
        },
        {
          name: "linear_regression",
          description: "Linear regression for trend analysis",
          bestFor: "Linear trend identification",
        },
        {
          name: "moving_average",
          description: "Moving average for stable demand",
          bestFor: "Stable demand with minimal seasonality",
        },
      ],
      supportedPeriods: {
        min: 1,
        max: 365,
        recommended: [7, 14, 30, 60, 90],
      },
      confidenceLevels: [0.8, 0.9, 0.95, 0.99],
      minimumDataPoints: 30,
      maximumItemsPerBulkRequest: 50,
    };

    return NextResponse.json({
      success: true,
      data: capabilities,
    });
  } catch (error) {
    console.error("Failed to get forecasting capabilities:", error);
    return NextResponse.json(
      { error: "Failed to retrieve forecasting information" },
      { status: 500 },
    );
  }
}
