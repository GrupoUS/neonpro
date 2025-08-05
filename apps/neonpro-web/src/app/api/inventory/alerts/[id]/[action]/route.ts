// API Routes for Alert Actions (Acknowledge, Resolve, Escalate)
// Story 6.2: Automated Reorder Alerts + Threshold Management

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { IntelligentThresholdService } from "@/app/lib/services/intelligent-threshold-service";

const thresholdService = new IntelligentThresholdService();

const acknowledgeSchema = z.object({
  user_id: z.string(),
  notes: z.string().optional(),
});

const resolveSchema = z.object({
  user_id: z.string(),
  notes: z.string().optional(),
});

const escalateSchema = z.object({
  escalate_to: z.string(),
  level: z.number().min(1).max(5),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } },
) {
  try {
    const body = await request.json();
    const { id, action } = params;

    let result;
    let message;

    switch (action) {
      case "acknowledge": {
        const acknowledgeData = acknowledgeSchema.parse(body);
        result = await thresholdService.acknowledgeAlert(
          id,
          acknowledgeData.user_id,
          acknowledgeData.notes,
        );
        message = "Alert acknowledged successfully";
        break;
      }

      case "resolve": {
        const resolveData = resolveSchema.parse(body);
        result = await thresholdService.resolveAlert(id, resolveData.user_id, resolveData.notes);
        message = "Alert resolved successfully";
        break;
      }

      case "escalate": {
        const escalateData = escalateSchema.parse(body);
        result = await thresholdService.escalateAlert(
          id,
          escalateData.escalate_to,
          escalateData.level,
        );
        message = "Alert escalated successfully";
        break;
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            valid_actions: ["acknowledge", "resolve", "escalate"],
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
    });
  } catch (error: any) {
    console.error(`Error performing alert action ${params.action}:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Failed to ${params.action} alert`,
        details: error.message,
      },
      { status: 500 },
    );
  }
}
