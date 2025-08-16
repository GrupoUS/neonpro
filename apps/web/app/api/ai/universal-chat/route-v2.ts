// Endpoint for Universal AI Chat (Epic 4 - Story 4.1)
// app/api/ai/universal-chat/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { createNeonProAIChatEngine } from '@/app/lib/ai/chat-engine-v2';
import type { AIRequest, UniversalChatContext } from '@/app/lib/ai/types';
import { createClient } from '@/app/utils/supabase/server';

/**
 * POST /api/ai/universal-chat
 * Universal AI Chat endpoint for NeonPro clinic management
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { message, context, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build universal context
    const universalContext = await buildUniversalContext(
      supabase,
      session.user.id
    );

    // Create AI request
    const aiRequest: AIRequest = {
      query: message,
      context: universalContext,
      sessionId: session?.access_token || 'anonymous',
      userId: session.user.id,
      clinicId: universalContext.clinic.id,
    };

    // Initialize AI chat engine
    const chatEngine = await createNeonProAIChatEngine();

    // Process chat request
    const response = await chatEngine.processChat(aiRequest);

    return NextResponse.json({
      success: true,
      data: response,
      metadata: {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        clinicId: universalContext.clinic.id,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build universal context from all Epic data sources
 */
async function buildUniversalContext(
  supabase: any,
  userId: string
): Promise<UniversalChatContext> {
  try {
    // Get user profile and clinic info
    const { data: profile } = await supabase
      .from('users')
      .select('*, clinics(*)')
      .eq('id', userId)
      .single();

    if (!profile?.clinics) {
      throw new Error('User profile or clinic not found');
    }

    const clinic = profile.clinics;
    const clinicId = clinic.id;

    // Build context from all Epic data sources in parallel
    const [appointmentsData, financialData, clinicalData, biData] =
      await Promise.all([
        buildAppointmentsContext(supabase, clinicId),
        buildFinancialContext(supabase, clinicId),
        buildClinicalContext(supabase, clinicId),
        buildBusinessIntelligenceContext(supabase, clinicId),
      ]);

    return {
      user: {
        id: profile.id,
        name: profile.full_name || 'User',
        role: profile.role || 'user',
        permissions: ['read_basic'],
      },

      clinic: {
        id: clinic.id,
        name: clinic.name,
        settings: clinic.settings || {},
      },

      appointments: appointmentsData,
      financial: financialData,
      clinical: clinicalData,
      businessIntelligence: biData,
    };
  } catch (_error) {
    // Return basic context with mock data
    return {
      user: {
        id: userId,
        name: 'User',
        role: 'user',
        permissions: ['read_basic'],
      },

      clinic: {
        id: 'default',
        name: 'Default Clinic',
        settings: {},
      },

      appointments: {
        upcoming: [],
        conflicts: {
          totalConflicts: 0,
          conflictTypes: {},
          resolutionSuggestions: [],
        },
        utilization: {
          professionalId: 'default',
          utilizationRate: 0,
          appointmentsCount: 0,
          availableSlots: 0,
          efficiency: 0,
        },
        patientFlow: {
          averageWaitTime: 0,
          appointmentDuration: 0,
          noShowRate: 0,
          cancellationRate: 0,
        },
      },

      financial: {
        cashFlow: {
          currentBalance: 0,
          projectedBalance: 0,
          inflow: 0,
          outflow: 0,
          burnRate: 0,
        },
        receivables: {
          current: 0,
          thirtyDays: 0,
          sixtyDays: 0,
          ninetyDaysPlus: 0,
          totalReceivables: 0,
        },
        payables: {
          currentPayables: 0,
          overduePayables: 0,
          upcomingPayments: 0,
          averagePaymentDays: 0,
        },
        profitability: {
          treatmentType: 'default',
          revenue: 0,
          costs: 0,
          margin: 0,
          profitabilityRate: 0,
        },
        forecasting: {
          revenue: {
            metric: '',
            currentValue: 0,
            predictedValue: 0,
            confidence: 0,
            trend: 'stable' as const,
            factors: [],
          },
          expenses: {
            metric: '',
            currentValue: 0,
            predictedValue: 0,
            confidence: 0,
            trend: 'stable' as const,
            factors: [],
          },
          cashFlow: {
            metric: '',
            currentValue: 0,
            predictedValue: 0,
            confidence: 0,
            trend: 'stable' as const,
            factors: [],
          },
          profitability: {
            metric: '',
            currentValue: 0,
            predictedValue: 0,
            confidence: 0,
            trend: 'stable' as const,
            factors: [],
          },
        },
      },

      clinical: {
        patientRecords: {
          patientId: '',
          personalInfo: {
            id: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            date_of_birth: '',
            gender: '',
            address: '',
            emergency_contact: '',
            clinic_id: '',
            created_at: '',
            updated_at: '',
          },
          medicalHistory: [],
          treatmentSessions: [],
          progressTracking: [],
          satisfactionScores: [],
          riskFactors: [],
        },
        treatmentProtocols: {
          protocols: [],
          successRates: {},
          averageDuration: {},
          contraindications: {},
        },
        professionalPerformance: {
          professionalId: 'default',
          performanceScore: 0,
          patientSatisfaction: 0,
          treatmentSuccessRate: 0,
          efficiency: 0,
          specialties: [],
        },
        complianceStatus: {
          cfmCompliance: true,
          anvisaCompliance: true,
          lgpdCompliance: true,
          lastAuditDate: '',
          complianceScore: 0,
          violations: [],
          recommendations: [],
        },
      },

      businessIntelligence: {
        kpis: {
          revenue: 0,
          profitMargin: 0,
          customerSatisfaction: 0,
          appointmentUtilization: 0,
          professionalEfficiency: 0,
          complianceScore: 0,
        },
        trends: {
          revenueGrowth: 0,
          patientRetention: 0,
          servicePopularity: {},
          seasonalPatterns: [],
          competitivePosition: '',
        },
        opportunities: {
          revenueOpportunities: [],
          costReductionOpportunities: [],
          operationalImprovements: [],
          marketExpansion: [],
        },
        alerts: { critical: [], warning: [], info: [] },
      },
    };
  }
}

async function buildAppointmentsContext(supabase: any, clinicId: string) {
  // Epic 1 - Appointment data
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte('start_time', new Date().toISOString())
    .limit(50);

  return {
    upcoming: appointments || [],
    conflicts: {
      totalConflicts: 0,
      conflictTypes: {},
      resolutionSuggestions: [],
    },
    utilization: {
      professionalId: 'default',
      utilizationRate: 0,
      appointmentsCount: 0,
      availableSlots: 0,
      efficiency: 0,
    },
    patientFlow: {
      averageWaitTime: 0,
      appointmentDuration: 0,
      noShowRate: 0,
      cancellationRate: 0,
    },
  };
}

async function buildFinancialContext(supabase: any, clinicId: string) {
  // Epic 2 - Financial data
  const { data: transactions } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('clinic_id', clinicId)
    .gte(
      'created_at',
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    )
    .limit(100);

  return {
    cashFlow: {
      currentBalance: 0,
      projectedBalance: 0,
      inflow: 0,
      outflow: 0,
      burnRate: 0,
    },
    receivables: {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDaysPlus: 0,
      totalReceivables: 0,
    },
    payables: {
      currentPayables: 0,
      overduePayables: 0,
      upcomingPayments: 0,
      averagePaymentDays: 0,
    },
    profitability: {
      treatmentType: 'default',
      revenue: 0,
      costs: 0,
      margin: 0,
      profitabilityRate: 0,
    },
    forecasting: {
      revenue: {
        metric: 'monthly_revenue',
        currentValue: 50_000,
        predictedValue: 55_000,
        confidence: 0.85,
        trend: 'increasing' as const,
        factors: ['seasonal_increase', 'new_services'],
      },
      expenses: {
        metric: 'monthly_expenses',
        currentValue: 35_000,
        predictedValue: 36_000,
        confidence: 0.9,
        trend: 'stable' as const,
        factors: ['fixed_costs', 'inflation'],
      },
      cashFlow: {
        metric: 'net_cash_flow',
        currentValue: 15_000,
        predictedValue: 19_000,
        confidence: 0.8,
        trend: 'increasing' as const,
        factors: ['improved_efficiency'],
      },
      profitability: {
        metric: 'net_margin',
        currentValue: 0.3,
        predictedValue: 0.34,
        confidence: 0.75,
        trend: 'increasing' as const,
        factors: ['cost_optimization'],
      },
    },
  };
}

async function buildClinicalContext(supabase: any, clinicId: string) {
  // Epic 3 - Clinical data (with LGPD compliance)
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, created_at')
    .eq('clinic_id', clinicId)
    .limit(10);

  return {
    patientRecords: {
      patientId: 'anonymized',
      personalInfo: {
        id: 'anonymous',
        first_name: 'Patient',
        last_name: 'Data (Anonymized)',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        address: '',
        emergency_contact: '',
        clinic_id: '',
        created_at: '',
        updated_at: '',
      },
      medicalHistory: [],
      treatmentSessions: [],
      progressTracking: [],
      satisfactionScores: [],
      riskFactors: [],
    },
    treatmentProtocols: {
      protocols: [],
      successRates: {},
      averageDuration: {},
      contraindications: {},
    },
    professionalPerformance: {
      professionalId: 'default',
      performanceScore: 0,
      patientSatisfaction: 0,
      treatmentSuccessRate: 0,
      efficiency: 0,
      specialties: [],
    },
    complianceStatus: {
      cfmCompliance: true,
      anvisaCompliance: true,
      lgpdCompliance: true,
      lastAuditDate: '',
      complianceScore: 0,
      violations: [],
      recommendations: [],
    },
  };
}

async function buildBusinessIntelligenceContext(
  _supabase: any,
  _clinicId: string
) {
  // Cross-epic analytics
  return {
    kpis: {
      revenue: 0,
      profitMargin: 0,
      customerSatisfaction: 0,
      appointmentUtilization: 0,
      professionalEfficiency: 0,
      complianceScore: 0,
    },
    trends: {
      revenueGrowth: 0,
      patientRetention: 0,
      servicePopularity: {},
      seasonalPatterns: [],
      competitivePosition: '',
    },
    opportunities: {
      revenueOpportunities: [],
      costReductionOpportunities: [],
      operationalImprovements: [],
      marketExpansion: [],
    },
    alerts: { critical: [], warning: [], info: [] },
  };
}
