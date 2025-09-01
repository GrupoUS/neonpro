/**
 * Consolidated AI Management API
 * Handles all AI operations: no-show prediction, model management, drift detection, universal chat
 * Consolidates: no-show-prediction/*, model-management, drift-detection, universal-chat
 *
 * For aesthetic clinic AI-powered features and automation
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface AIRequest {
  action?: "no-show-prediction" | "model-management" | "drift-detection" | "universal-chat";
  subAction?: "predict" | "feedback" | "stats" | "predictions" | "deploy" | "monitor" | "chat";
  data?: {
    patientId?: string;
    appointmentId?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    modelId?: string;
    message?: string;
    feedback?: {
      predictionId: string;
      actualOutcome: boolean;
      confidence: number;
    };
    modelConfig?: {
      name: string;
      version: string;
      parameters: Record<string, unknown>;
    };
  };
}

interface NoShowPrediction {
  predictionId: string;
  patientId: string;
  appointmentId: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  confidence: number;
  recommendations: string[];
  createdAt: string;
}

interface ModelInfo {
  modelId: string;
  name: string;
  version: string;
  status: "training" | "deployed" | "deprecated";
  accuracy: number;
  lastUpdated: string;
  deploymentDate: string;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface DriftAlert {
  alertId: string;
  modelId: string;
  driftType: "data" | "concept" | "prediction";
  severity: "low" | "medium" | "high" | "critical";
  detectedAt: string;
  description: string;
  metrics: {
    driftScore: number;
    threshold: number;
    affectedFeatures: string[];
  };
}

interface ChatResponse {
  messageId: string;
  response: string;
  confidence: number;
  sources: string[];
  suggestedActions: string[];
  timestamp: string;
}

interface AIOverview {
  noShowPredictions: {
    totalPredictions: number;
    accuracy: number;
    activeModels: number;
  };
  modelManagement: {
    deployedModels: number;
    trainingModels: number;
    averageAccuracy: number;
  };
  driftDetection: {
    activeAlerts: number;
    modelsMonitored: number;
    lastCheck: string;
  };
  universalChat: {
    totalConversations: number;
    averageResponseTime: number;
    satisfactionScore: number;
  };
}

interface AIResponse {
  success: boolean;
  action?: string;
  data?: {
    prediction?: NoShowPrediction;
    predictions?: NoShowPrediction[];
    models?: ModelInfo[];
    model?: ModelInfo;
    driftAlerts?: DriftAlert[];
    chatResponse?: ChatResponse;
    overview?: AIOverview;
    stats?: {
      totalPredictions: number;
      accuracy: number;
      falsePositives: number;
      falseNegatives: number;
      averageRiskScore: number;
    };
  };
  message?: string;
}

// GET /api/ai - Get AI system overview
// GET /api/ai?action=no-show-prediction&subAction=predict - Predict no-show risk
// GET /api/ai?action=no-show-prediction&subAction=stats - Get prediction statistics
// GET /api/ai?action=model-management - Get model information
// GET /api/ai?action=drift-detection - Get drift alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const subAction = searchParams.get("subAction");
    const patientId = searchParams.get("patientId");
    const appointmentId = searchParams.get("appointmentId");

    const requestData: AIRequest = {
      action: action as AIRequest["action"],
      subAction: subAction as AIRequest["subAction"],
      data: {
        patientId: patientId || undefined,
        appointmentId: appointmentId || undefined,
      },
    };

    switch (action) {
      case "no-show-prediction":
        return handleNoShowPrediction(requestData);

      case "model-management":
        return handleModelManagement(requestData);

      case "drift-detection":
        return handleDriftDetection(requestData);

      case "universal-chat":
        return handleUniversalChat(requestData);

      default:
        return handleAIOverview(requestData);
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/ai - Create AI predictions, train models, send chat messages
export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { success: false, message: "Action required" },
        { status: 400 },
      );
    }

    switch (body.action) {
      case "no-show-prediction":
        return handleNoShowPredictionPost(body);

      case "model-management":
        return handleModelManagementPost(body);

      case "universal-chat":
        return handleUniversalChatPost(body);

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("AI API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler functions
async function handleAIOverview(request: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock AI system overview
  const overview = {
    noShowPredictions: {
      totalPredictions: 1250,
      accuracy: 87.5,
      activeModels: 3,
    },
    modelManagement: {
      deployedModels: 5,
      trainingModels: 2,
      averageAccuracy: 89.2,
    },
    driftDetection: {
      activeAlerts: 1,
      modelsMonitored: 5,
      lastCheck: new Date().toISOString(),
    },
    universalChat: {
      totalConversations: 450,
      averageResponseTime: 1.2,
      satisfactionScore: 9.1,
    },
  };

  return NextResponse.json({
    success: true,
    data: { overview },
  });
}

async function handleNoShowPrediction(request: AIRequest): Promise<NextResponse<AIResponse>> {
  const { subAction, data } = request;

  switch (subAction) {
    case "predict":
      // Mock prediction
      const prediction: NoShowPrediction = {
        predictionId: `pred-${Date.now()}`,
        patientId: data?.patientId || "patient-123",
        appointmentId: data?.appointmentId || "apt-456",
        riskScore: 0.75,
        riskLevel: "high",
        factors: [
          "Historical no-show pattern",
          "Short notice appointment",
          "Weather conditions",
        ],
        confidence: 0.87,
        recommendations: [
          "Send reminder 24h before",
          "Confirm via WhatsApp",
          "Offer rescheduling options",
        ],
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        action: "no-show-prediction",
        data: { prediction },
      });

    case "stats":
      // Mock statistics
      const stats = {
        totalPredictions: 1250,
        accuracy: 87.5,
        falsePositives: 45,
        falseNegatives: 32,
        averageRiskScore: 0.42,
      };

      return NextResponse.json({
        success: true,
        action: "no-show-prediction",
        data: { stats },
      });

    case "predictions":
      // Mock predictions list
      const predictions: NoShowPrediction[] = [
        {
          predictionId: "pred-1",
          patientId: "patient-123",
          appointmentId: "apt-456",
          riskScore: 0.75,
          riskLevel: "high",
          factors: ["Historical pattern", "Short notice"],
          confidence: 0.87,
          recommendations: ["Send reminder", "Confirm via WhatsApp"],
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        action: "no-show-prediction",
        data: { predictions },
      });

    default:
      return NextResponse.json({
        success: false,
        message: "Invalid sub-action for no-show prediction",
      }, { status: 400 });
  }
}

async function handleModelManagement(request: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock model management
  const models: ModelInfo[] = [
    {
      modelId: "model-noshow-v2",
      name: "No-Show Prediction Model",
      version: "2.1.0",
      status: "deployed",
      accuracy: 87.5,
      lastUpdated: "2024-01-20T10:00:00Z",
      deploymentDate: "2024-01-15T09:00:00Z",
      performance: {
        precision: 0.89,
        recall: 0.85,
        f1Score: 0.87,
      },
    },
    {
      modelId: "model-sentiment-v1",
      name: "Patient Sentiment Analysis",
      version: "1.0.0",
      status: "deployed",
      accuracy: 92.3,
      lastUpdated: "2024-01-18T14:30:00Z",
      deploymentDate: "2024-01-10T11:00:00Z",
      performance: {
        precision: 0.94,
        recall: 0.91,
        f1Score: 0.92,
      },
    },
  ];

  return NextResponse.json({
    success: true,
    action: "model-management",
    data: { models },
  });
}

async function handleDriftDetection(request: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock drift detection alerts
  const driftAlerts: DriftAlert[] = [
    {
      alertId: "drift-001",
      modelId: "model-noshow-v2",
      driftType: "data",
      severity: "medium",
      detectedAt: new Date().toISOString(),
      description: "Input data distribution has shifted significantly",
      metrics: {
        driftScore: 0.65,
        threshold: 0.5,
        affectedFeatures: ["appointment_time", "patient_age", "weather_conditions"],
      },
    },
  ];

  return NextResponse.json({
    success: true,
    action: "drift-detection",
    data: { driftAlerts },
  });
}

async function handleUniversalChat(request: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock universal chat response
  const chatResponse: ChatResponse = {
    messageId: `msg-${Date.now()}`,
    response:
      "I can help you with appointment scheduling, patient information, and clinic operations. What would you like to know?",
    confidence: 0.95,
    sources: ["Knowledge Base", "Clinic Procedures", "Patient Guidelines"],
    suggestedActions: [
      "Schedule appointment",
      "View patient history",
      "Check availability",
    ],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    action: "universal-chat",
    data: { chatResponse },
  });
}

async function handleNoShowPredictionPost(body: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock feedback submission
  if (body.subAction === "feedback" && body.data?.feedback) {
    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  }

  // Mock prediction creation
  const prediction: NoShowPrediction = {
    predictionId: `pred-${Date.now()}`,
    patientId: body.data?.patientId || "unknown",
    appointmentId: body.data?.appointmentId || "unknown",
    riskScore: Math.random() * 0.8 + 0.1, // Random score between 0.1-0.9
    riskLevel: Math.random() > 0.5 ? "high" : "medium",
    factors: ["Historical data", "Appointment timing", "Patient behavior"],
    confidence: Math.random() * 0.3 + 0.7, // Random confidence 0.7-1.0
    recommendations: ["Send reminder", "Confirm appointment"],
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: { prediction },
    message: "Prediction created successfully",
  });
}

async function handleModelManagementPost(body: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock model deployment
  if (body.subAction === "deploy" && body.data?.modelConfig) {
    const model: ModelInfo = {
      modelId: `model-${Date.now()}`,
      name: body.data.modelConfig.name,
      version: body.data.modelConfig.version,
      status: "training",
      accuracy: 0,
      lastUpdated: new Date().toISOString(),
      deploymentDate: new Date().toISOString(),
      performance: {
        precision: 0,
        recall: 0,
        f1Score: 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: { model },
      message: "Model deployment initiated",
    });
  }

  return NextResponse.json({
    success: false,
    message: "Invalid model management operation",
  }, { status: 400 });
}

async function handleUniversalChatPost(body: AIRequest): Promise<NextResponse<AIResponse>> {
  // Mock chat message processing
  const chatResponse: ChatResponse = {
    messageId: `msg-${Date.now()}`,
    response:
      `I understand you're asking about: "${body.data?.message}". Here's what I can help you with...`,
    confidence: 0.92,
    sources: ["Clinic Knowledge Base", "Best Practices"],
    suggestedActions: ["View details", "Take action", "Get more help"],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: { chatResponse },
    message: "Chat response generated",
  });
}

export const dynamic = "force-dynamic";
