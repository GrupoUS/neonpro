// API Routes for Demand Forecasting
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { IntelligentThresholdService } from '@/app/lib/services/intelligent-threshold-service';

const thresholdService = new IntelligentThresholdService();

const forecastRequestSchema = z.object({
  item_id: z.string(),
  clinic_id: z.string(),
  forecast_period: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  forecast_date: z.string().transform((str) => new Date(str)),
});

const bulkForecastRequestSchema = z.object({
  items: z.array(
    z.object({
      item_id: z.string(),
      forecast_period: z
        .enum(['daily', 'weekly', 'monthly', 'quarterly'])
        .optional()
        .default('weekly'),
    }),
  ),
  clinic_id: z.string(),
  forecast_date: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : new Date())),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a bulk forecast request
    if (body.items && Array.isArray(body.items)) {
      return await handleBulkForecast(body);
    }

    // Single forecast request
    const validatedData = forecastRequestSchema.parse(body);

    const forecast = await thresholdService.generateDemandForecast(
      validatedData.item_id,
      validatedData.clinic_id,
      validatedData.forecast_period,
      validatedData.forecast_date,
    );

    return NextResponse.json({
      success: true,
      data: forecast,
      message: 'Demand forecast generated successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate demand forecast',
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function handleBulkForecast(body: any) {
  try {
    const validatedData = bulkForecastRequestSchema.parse(body);

    const forecasts = await Promise.all(
      validatedData.items.map(async (item) => {
        try {
          const forecast = await thresholdService.generateDemandForecast(
            item.item_id,
            validatedData.clinic_id,
            item.forecast_period,
            validatedData.forecast_date,
          );
          return { success: true, item_id: item.item_id, data: forecast };
        } catch (error: any) {
          return {
            success: false,
            item_id: item.item_id,
            error: error.message,
          };
        }
      }),
    );

    const successful = forecasts.filter((f) => f.success);
    const failed = forecasts.filter((f) => !f.success);

    return NextResponse.json({
      success: true,
      data: successful.map((f) => f.data),
      summary: {
        total_requested: validatedData.items.length,
        successful: successful.length,
        failed: failed.length,
        failures: failed.map((f) => ({ item_id: f.item_id, error: f.error })),
      },
      message: `Bulk forecast completed: ${successful.length}/${validatedData.items.length} successful`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk forecast validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process bulk forecast',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
