import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { demandForecastingService } from "@/app/lib/services/demand-forecasting-service";

const seasonalAnalysisSchema = z.object({
  itemId: z.string().uuid(),
  clinicId: z.string().uuid(),
  analysisPeriod: z.number().min(90).max(730).default(365), // 90 days to 2 years
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = seasonalAnalysisSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 },
      );
    }

    const { itemId, clinicId, analysisPeriod } = validation.data;

    // Get historical consumption data
    const historicalData = await demandForecastingService.getHistoricalConsumption(
      itemId,
      clinicId,
      analysisPeriod,
    );

    if (historicalData.length < 30) {
      return NextResponse.json(
        { error: "Insufficient data for seasonal analysis (minimum 30 data points required)" },
        { status: 400 },
      );
    }

    // Analyze seasonal patterns
    const seasonalPatterns = demandForecastingService.analyzeSeasonalPatterns(historicalData);

    // Get appointment-based demand patterns
    const appointmentDemand = await demandForecastingService.getAppointmentBasedDemand(
      itemId,
      clinicId,
      analysisPeriod,
    );

    // Calculate consumption statistics
    const totalConsumption = historicalData.reduce((sum, item) => sum + item.quantity, 0);
    const averageDailyConsumption = totalConsumption / analysisPeriod;
    const consumptionByType = historicalData.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.quantity;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate variability metrics
    const dailyConsumption = new Map<string, number>();
    historicalData.forEach((item) => {
      const dateKey = item.date.toISOString().split("T")[0];
      dailyConsumption.set(dateKey, (dailyConsumption.get(dateKey) || 0) + item.quantity);
    });

    const consumptionValues = Array.from(dailyConsumption.values());
    const variance =
      consumptionValues.reduce((sum, val) => {
        return sum + (val - averageDailyConsumption) ** 2;
      }, 0) / consumptionValues.length;

    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation =
      averageDailyConsumption > 0 ? standardDeviation / averageDailyConsumption : 0;

    // Identify demand drivers
    const demandDrivers = {
      appointmentBased: appointmentDemand.length > 0,
      seasonalInfluenced: seasonalPatterns.some((p) => p.strength > 0.3),
      highVariability: coefficientOfVariation > 0.5,
      steadyDemand: coefficientOfVariation < 0.2,
    };

    const analysis = {
      itemId,
      analysisPeriod,
      dataPoints: historicalData.length,
      seasonalPatterns,
      statistics: {
        totalConsumption,
        averageDailyConsumption: Math.round(averageDailyConsumption * 100) / 100,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
        consumptionByType,
      },
      demandDrivers,
      recommendations: generateSeasonalRecommendations(
        seasonalPatterns,
        demandDrivers,
        coefficientOfVariation,
      ),
      appointmentCorrelation: {
        hasAppointmentData: appointmentDemand.length > 0,
        appointmentBasedConsumption: appointmentDemand.length,
        averageConsumptionPerAppointment:
          appointmentDemand.length > 0
            ? appointmentDemand.reduce(
                (sum, apt) => sum + (apt.actualConsumption || apt.expectedConsumption),
                0,
              ) / appointmentDemand.length
            : 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Seasonal analysis error:", error);
    return NextResponse.json({ error: "Failed to perform seasonal analysis" }, { status: 500 });
  }
}

function generateSeasonalRecommendations(
  patterns: any[],
  drivers: any,
  variability: number,
): string[] {
  const recommendations: string[] = [];

  // Seasonal pattern recommendations
  patterns.forEach((pattern) => {
    if (pattern.strength > 0.5) {
      recommendations.push(
        `Strong ${pattern.pattern} seasonality detected (strength: ${Math.round(pattern.strength * 100)}%) - adjust inventory levels accordingly`,
      );

      if (pattern.peaks.length > 0) {
        recommendations.push(
          `Peak demand periods identified - consider increasing stock before these periods`,
        );
      }

      if (pattern.valleys.length > 0) {
        recommendations.push(
          `Low demand periods identified - reduce ordering during these periods to avoid excess inventory`,
        );
      }
    }
  });

  // Variability recommendations
  if (variability > 0.7) {
    recommendations.push(
      "High demand variability detected - implement safety stock strategies and frequent monitoring",
    );
  } else if (variability < 0.2) {
    recommendations.push("Stable demand pattern - suitable for just-in-time inventory management");
  }

  // Demand driver recommendations
  if (drivers.appointmentBased) {
    recommendations.push(
      "Demand is appointment-driven - consider linking inventory planning to appointment schedules",
    );
  }

  if (!drivers.seasonalInfluenced && !drivers.appointmentBased) {
    recommendations.push(
      "Demand appears independent of seasonal or appointment patterns - focus on trend-based forecasting",
    );
  }

  return recommendations;
}
