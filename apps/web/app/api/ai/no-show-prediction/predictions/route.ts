import { createServerClient } from "@neonpro/db";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface PredictionFilters {
  riskLevel?: string;
  dateRange?: string;
  patientId?: string;
}

interface NoShowPredictionResponse {
  patientId: string;
  appointmentId: string;
  noShowProbability: number;
  riskCategory: "low" | "medium" | "high" | "very_high";
  confidenceScore: number;
  contributingFactors: {
    factorName: string;
    category: "patient" | "appointment" | "external" | "historical";
    importanceWeight: number;
    impactDirection: "increases_risk" | "decreases_risk";
    description: string;
    confidence: number;
  }[];
  recommendations: {
    actionType:
      | "reminder"
      | "scheduling"
      | "incentive"
      | "support"
      | "escalation";
    priority: "low" | "medium" | "high" | "urgent";
    description: string;
    estimatedImpact: number;
    implementationCost: "low" | "medium" | "high";
    timingRecommendation: string;
    successProbability: number;
  }[];
}

// Mock prediction data generator
function generatePredictionData(count = 10): NoShowPredictionResponse[] {
  const riskCategories: ("low" | "medium" | "high" | "very_high")[] = [
    "low",
    "medium",
    "high",
    "very_high",
  ];
  const factorNames = [
    "Histórico de Faltas",
    "Distância da Clínica",
    "Condições Climáticas",
    "Dia da Semana",
    "Tipo de Consulta",
    "Tempo de Antecedência",
    "Idade do Paciente",
  ];

  return Array.from({ length: count }, (_, i) => {
    const riskCategory =
      riskCategories[Math.floor(Math.random() * riskCategories.length)];
    const noShowProbability = {
      low: Math.random() * 0.3,
      medium: 0.3 + Math.random() * 0.3,
      high: 0.6 + Math.random() * 0.25,
      very_high: 0.75 + Math.random() * 0.25,
    }[riskCategory];

    return {
      patientId: `PAT-${String(i + 1).padStart(3, "0")}`,
      appointmentId: `APT-2025-${String(i + 1).padStart(3, "0")}`,
      noShowProbability,
      riskCategory,
      confidenceScore: 0.75 + Math.random() * 0.25,
      contributingFactors: [
        {
          factorName:
            factorNames[Math.floor(Math.random() * factorNames.length)],
          category: "historical",
          importanceWeight: Math.random() * 0.5 + 0.2,
          impactDirection:
            Math.random() > 0.7 ? "decreases_risk" : "increases_risk",
          description: "Fator baseado em histórico do paciente",
          confidence: 0.8 + Math.random() * 0.2,
        },
      ],
      recommendations: [
        {
          actionType: "reminder",
          priority: riskCategory === "very_high" ? "urgent" : "medium",
          description: "Ligação de confirmação 24h antes da consulta",
          estimatedImpact: 0.3 + Math.random() * 0.4,
          implementationCost: "low",
          timingRecommendation: "24 horas antes",
          successProbability: 0.6 + Math.random() * 0.3,
        },
      ],
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    });

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const filters: PredictionFilters = body.filters || {};

    // In production, this would call the actual ML prediction service
    // For now, return mock data based on filters
    let predictions = generatePredictionData(15);

    // Apply filters
    if (filters.riskLevel && filters.riskLevel !== "all") {
      predictions = predictions.filter(
        (p) => p.riskCategory === filters.riskLevel,
      );
    }

    // Log prediction request for analytics
    await supabase.from("no_show_prediction_logs").insert({
      user_id: session.user.id,
      filters,
      result_count: predictions.length,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching no-show predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 },
    );
  }
}
