/**
 * Consolidated Financial Management API
 * Handles all financial operations: reports, analytics, predictions, cash flow
 * Consolidates: reports, reporting, analytics, metrics, predictions, predictive-cash-flow, dashboard, alerts
 *
 * For aesthetic clinic financial management and business intelligence
 */

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

interface FinancialRequest {
  action?: "reports" | "analytics" | "predictions" | "cash-flow" | "dashboard" | "alerts";
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: {
    clinicId?: string;
    professionalId?: string;
    serviceType?: string;
    paymentMethod?: string;
  };
  reportType?: "revenue" | "expenses" | "profit" | "tax" | "compliance";
  predictionType?: "revenue" | "cash-flow" | "patient-volume" | "seasonal";
  timeframe?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
}

interface FinancialMetrics {
  revenue: {
    total: number;
    growth: number;
    byService: Record<string, number>;
    byProfessional: Record<string, number>;
  };
  expenses: {
    total: number;
    operational: number;
    marketing: number;
    equipment: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    balance: number;
    projectedBalance: number;
  };
  kpis: {
    averageTicket: number;
    patientLifetimeValue: number;
    conversionRate: number;
    retentionRate: number;
  };
}

interface FinancialResponse {
  success: boolean;
  action?: string;
  data?: {
    metrics?: FinancialMetrics;
    reports?: {
      id: string;
      type: string;
      period: string;
      data: Record<string, unknown>;
      generatedAt: string;
    }[];
    predictions?: {
      type: string;
      period: string;
      confidence: number;
      value: number;
      factors: string[];
    }[];
    alerts?: {
      id: string;
      type: "warning" | "critical" | "info";
      message: string;
      value: number;
      threshold: number;
      date: string;
    }[];
    dashboard?: {
      summary: FinancialMetrics;
      trends: Record<string, number[]>;
      alerts: number;
      lastUpdate: string;
    };
  };
  message?: string;
}

// GET /api/financial - Get financial overview
// GET /api/financial?action=reports - Get financial reports
// GET /api/financial?action=analytics - Get financial analytics
// GET /api/financial?action=predictions - Get financial predictions
// GET /api/financial?action=cash-flow - Get cash flow analysis
// GET /api/financial?action=dashboard - Get financial dashboard
// GET /api/financial?action=alerts - Get financial alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const dateRange = {
      startDate: searchParams.get("startDate")
        || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: searchParams.get("endDate") || new Date().toISOString(),
    };

    const requestData: FinancialRequest = {
      action: action as FinancialRequest["action"],
      dateRange,
      timeframe: (searchParams.get("timeframe") as FinancialRequest["timeframe"]) || "monthly",
    };

    switch (action) {
      case "reports":
        return handleFinancialReports(requestData);

      case "analytics":
        return handleFinancialAnalytics(requestData);

      case "predictions":
        return handleFinancialPredictions(requestData);

      case "cash-flow":
        return handleCashFlowAnalysis(requestData);

      case "dashboard":
        return handleFinancialDashboard(requestData);

      case "alerts":
        return handleFinancialAlerts(requestData);

      default:
        return handleFinancialOverview(requestData);
    }
  } catch (error) {
    console.error("Financial API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/financial - Generate custom financial report
export async function POST(request: NextRequest) {
  try {
    const body: FinancialRequest = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { success: false, message: "Action required" },
        { status: 400 },
      );
    }

    return handleCustomFinancialReport(body);
  } catch (error) {
    console.error("Financial API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler functions
async function handleFinancialOverview(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock financial overview - in production would query database
  const mockMetrics: FinancialMetrics = {
    revenue: {
      total: 125_000,
      growth: 12.5,
      byService: {
        "Consultas": 75_000,
        "Exames": 35_000,
        "Procedimentos": 15_000,
      },
      byProfessional: {
        "Dr. Silva": 45_000,
        "Dr. Santos": 38_000,
        "Dr. Costa": 42_000,
      },
    },
    expenses: {
      total: 85_000,
      operational: 45_000,
      marketing: 15_000,
      equipment: 25_000,
    },
    profit: {
      gross: 40_000,
      net: 32_000,
      margin: 25.6,
    },
    cashFlow: {
      inflow: 125_000,
      outflow: 85_000,
      balance: 40_000,
      projectedBalance: 52_000,
    },
    kpis: {
      averageTicket: 285.5,
      patientLifetimeValue: 2850,
      conversionRate: 68.5,
      retentionRate: 85.2,
    },
  };

  return NextResponse.json({
    success: true,
    data: { metrics: mockMetrics },
  });
}

async function handleFinancialReports(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock reports data
  const mockReports = [
    {
      id: "report-1",
      type: "revenue",
      period: `${request.dateRange?.startDate} - ${request.dateRange?.endDate}`,
      data: {
        totalRevenue: 125_000,
        breakdown: {
          "Consultas": 75_000,
          "Exames": 35_000,
          "Procedimentos": 15_000,
        },
        growth: 12.5,
      },
      generatedAt: new Date().toISOString(),
    },
    {
      id: "report-2",
      type: "expenses",
      period: `${request.dateRange?.startDate} - ${request.dateRange?.endDate}`,
      data: {
        totalExpenses: 85_000,
        categories: {
          "Operacional": 45_000,
          "Marketing": 15_000,
          "Equipamentos": 25_000,
        },
      },
      generatedAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    action: "reports",
    data: { reports: mockReports },
  });
}

async function handleFinancialAnalytics(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock analytics data
  const mockMetrics: FinancialMetrics = {
    revenue: {
      total: 125_000,
      growth: 12.5,
      byService: {
        "Consultas": 75_000,
        "Exames": 35_000,
        "Procedimentos": 15_000,
      },
      byProfessional: {
        "Dr. Silva": 45_000,
        "Dr. Santos": 38_000,
        "Dr. Costa": 42_000,
      },
    },
    expenses: {
      total: 85_000,
      operational: 45_000,
      marketing: 15_000,
      equipment: 25_000,
    },
    profit: {
      gross: 40_000,
      net: 32_000,
      margin: 25.6,
    },
    cashFlow: {
      inflow: 125_000,
      outflow: 85_000,
      balance: 40_000,
      projectedBalance: 52_000,
    },
    kpis: {
      averageTicket: 285.5,
      patientLifetimeValue: 2850,
      conversionRate: 68.5,
      retentionRate: 85.2,
    },
  };

  return NextResponse.json({
    success: true,
    action: "analytics",
    data: { metrics: mockMetrics },
  });
}

async function handleFinancialPredictions(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock predictions data
  const mockPredictions = [
    {
      type: "revenue",
      period: "next_month",
      confidence: 85,
      value: 135_000,
      factors: ["Seasonal growth", "New service launch", "Marketing campaign"],
    },
    {
      type: "cash-flow",
      period: "next_quarter",
      confidence: 78,
      value: 165_000,
      factors: ["Patient retention", "Equipment investment", "Operational efficiency"],
    },
    {
      type: "patient-volume",
      period: "next_month",
      confidence: 92,
      value: 485,
      factors: ["Historical patterns", "Appointment bookings", "Referral trends"],
    },
  ];

  return NextResponse.json({
    success: true,
    action: "predictions",
    data: { predictions: mockPredictions },
  });
}

async function handleCashFlowAnalysis(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock cash flow analysis
  const mockCashFlow = {
    current: {
      inflow: 125_000,
      outflow: 85_000,
      balance: 40_000,
    },
    projected: {
      nextMonth: 52_000,
      nextQuarter: 165_000,
      nextYear: 680_000,
    },
    scenarios: [
      {
        name: "Conservative",
        probability: 70,
        projectedBalance: 45_000,
      },
      {
        name: "Optimistic",
        probability: 20,
        projectedBalance: 65_000,
      },
      {
        name: "Pessimistic",
        probability: 10,
        projectedBalance: 25_000,
      },
    ],
  };

  return NextResponse.json({
    success: true,
    action: "cash-flow",
    data: { cashFlow: mockCashFlow },
  });
}

async function handleFinancialDashboard(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock dashboard data
  const mockDashboard = {
    summary: {
      revenue: { total: 125_000, growth: 12.5, byService: {}, byProfessional: {} },
      expenses: { total: 85_000, operational: 45_000, marketing: 15_000, equipment: 25_000 },
      profit: { gross: 40_000, net: 32_000, margin: 25.6 },
      cashFlow: { inflow: 125_000, outflow: 85_000, balance: 40_000, projectedBalance: 52_000 },
      kpis: {
        averageTicket: 285.5,
        patientLifetimeValue: 2850,
        conversionRate: 68.5,
        retentionRate: 85.2,
      },
    },
    trends: {
      revenue: [110_000, 115_000, 120_000, 125_000],
      expenses: [80_000, 82_000, 83_000, 85_000],
      profit: [30_000, 33_000, 37_000, 40_000],
    },
    alerts: 2,
    lastUpdate: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    action: "dashboard",
    data: { dashboard: mockDashboard },
  });
}

async function handleFinancialAlerts(
  request: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock alerts data
  const mockAlerts = [
    {
      id: "alert-1",
      type: "warning" as const,
      message: "Receita abaixo da meta mensal",
      value: 125_000,
      threshold: 130_000,
      date: new Date().toISOString(),
    },
    {
      id: "alert-2",
      type: "info" as const,
      message: "Novo recorde de ticket médio",
      value: 285.5,
      threshold: 280,
      date: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    action: "alerts",
    data: { alerts: mockAlerts },
  });
}

async function handleCustomFinancialReport(
  body: FinancialRequest,
): Promise<NextResponse<FinancialResponse>> {
  // Mock custom report generation
  const customReport = {
    id: `custom-report-${Date.now()}`,
    type: body.reportType || "custom",
    period: `${body.dateRange?.startDate} - ${body.dateRange?.endDate}`,
    data: {
      generated: true,
      filters: body.filters,
      timeframe: body.timeframe,
    },
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: { reports: [customReport] },
    message: "Custom report generated successfully",
  });
}

export const dynamic = "force-dynamic";
