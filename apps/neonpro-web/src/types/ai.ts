// AI Types for NeonPro
export interface FeedbackData {
  actualDuration: number;
  predictedDuration: number;
  confidenceScore: number;
  appointmentType: string;
  professionalId: string;
}

export interface ModelPrediction {
  predicted_duration: number;
  confidence_score: number;
  model_version: string;
}
