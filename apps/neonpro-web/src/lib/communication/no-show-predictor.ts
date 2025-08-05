/**
 * No Show Predictor - Mock implementation for testing
 * Story 5.3: Automated Communication for Scheduling
 */

export interface NoShowPrediction {
  probability: number;
  factors: string[];
  riskLevel: "low" | "medium" | "high";
  interventionRecommended: boolean;
}

export class NoShowPredictor {
  constructor() {
    // Mock implementation
  }

  async predict(appointmentId: string): Promise<NoShowPrediction> {
    // Mock implementation for testing
    return {
      probability: 0.3,
      factors: ["historical_attendance", "appointment_distance"],
      riskLevel: "low",
      interventionRecommended: false,
    };
  }

  async updatePrediction(
    appointmentId: string,
    actualOutcome: "attended" | "no_show",
  ): Promise<void> {
    // Mock implementation for learning
  }
}
