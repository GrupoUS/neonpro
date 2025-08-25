// Temporarily disabled until @neonpro/ai package is properly built
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	return NextResponse.json(
		{
			success: false,
			error: "AI Predictions API temporarily unavailable - package under development",
		},
		{ status: 503 }
	);
}

export async function POST(_request: NextRequest) {
	return NextResponse.json(
		{
			success: false,
			error: "AI Predictions API temporarily unavailable - package under development",
		},
		{ status: 503 }
	);
}

// =============================================================================
// 🎯 CLIENT CONTEXT API & LIBRARY - Healthcare Data Integration
// =============================================================================
// API endpoint e biblioteca para obter contexto específico do cliente
// Integra Supabase com dados em tempo real para o agente AI
// Inclui métricas, compliance, ML pipeline status e dados operacionais
// =============================================================================
// FILE: apps/web/app/api/ai/client-context/route.ts
// FILE: apps/web/lib/ai/client-context.ts
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import type { ClientContext } from '@/types/common';

// =============================================================================
// CLIENT CONTEXT LIBRARY - lib/ai/client-context.ts
// =============================================================================

export class ClientContextService {
  private supabase = createClient();

  // =============================================================================
  // MAIN CONTEXT RETRIEVAL
  // =============================================================================

  async getClientContext(userId?: string, clinicId?: string): Promise<ClientContext> {
    try {
      // Get basic user info
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use provided IDs or fallback to authenticated user
      const contextUserId = userId || user.id;
      const contextClinicId = clinicId || await this.getUserClinicId(contextUserId);

      // Fetch all context data in parallel
      const [
        userProfile,
        clinicData,
        patientStats,
        appointmentStats,
        complianceStatus,
        mlMetrics,
        recentActivities,
        systemNotifications
      ] = await Promise.all([
        this.getUserProfile(contextUserId),
        this.getClinicData(contextClinicId),
        this.getPatientStats(contextClinicId),
        this.getTodayAppointmentStats(contextClinicId),
        this.getComplianceStatus(contextClinicId),
        this.getMLPipelineMetrics(contextClinicId),
        this.getRecentActivities(contextUserId),
        this.getSystemNotifications(contextClinicId)
      ]);

      // Build comprehensive context
      const context: ClientContext = {
        clinicId: contextClinicId,
        userId: contextUserId,
        userRole: userProfile.role || 'user',
        userName: userProfile.name || 'Usuário',
        currentPage: '/', // Will be set by frontend
        sessionId: this.generateSessionId(),
        
        // Activity tracking
        recentActivities: recentActivities || [],
        
        // Healthcare metrics
        patientCount: patientStats.total || 0,
        todayAppointments: appointmentStats.today || 0,
        pendingTasks: appointmentStats.pending || 0,
        
        // Compliance status
        complianceStatus: {
          lgpd: complianceStatus?.lgpd || 'unknown',
          anvisa: complianceStatus?.anvisa || 'unknown', 
          cfm: complianceStatus?.cfm || 'unknown',
          lastAudit: complianceStatus?.lastAudit || new Date()
        },
        
        // ML Pipeline integration
        mlPipelineMetrics: mlMetrics ? {
          noShowAccuracy: mlMetrics.noShowAccuracy || 0,
          driftStatus: mlMetrics.driftStatus || 'unknown',
          lastModelUpdate: mlMetrics.lastModelUpdate || new Date(),
          predictionsToday: mlMetrics.predictionsToday || 0,
          systemHealth: mlMetrics.systemHealth || 'unknown'
        } : undefined,
        
        // Context arrays
        recentPatients: patientStats.recent || [],
        recentAlerts: complianceStatus?.recentAlerts || [],
        systemNotifications: systemNotifications || []
      };

      return context;
      
    } catch (error) {
      console.error('Error getting client context:', error);
      
      // Return minimal context in case of error
      return this.getDefaultContext();
    }
  }

  // =============================================================================
  // DATA RETRIEVAL METHODS
  // =============================================================================

  private async getUserClinicId(userId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('clinic_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.warn('Could not get user clinic ID:', error);
      return 'default_clinic';
    }

    return data.clinic_id;
  }

  private async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select(`
        name,
        role,
        clinic_id,
        avatar_url,
        last_active
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('Error fetching user profile:', error);
      return { name: 'Usuário', role: 'user' };
    }

    return data;
  }

  private async getClinicData(clinicId: string) {
    const { data, error } = await this.supabase
      .from('clinics')
      .select(`
        name,
        specialty,
        active_since,
        settings
      `)
      .eq('id', clinicId)
      .single();

    if (error) {
      console.warn('Error fetching clinic data:', error);
      return { name: 'Clínica', specialty: 'geral' };
    }

    return data;
  }

  private async getPatientStats(clinicId: string) {
    const { data, error } = await this.supabase
      .from('patients')
      .select('id, name, created_at')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching patient stats:', error);
      return { total: 0, recent: [] };
    }

    return {
      total: data?.length || 0,
      recent: data?.slice(0, 5).map(p => p.name) || []
    };
  }

  private async getTodayAppointmentStats(clinicId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('appointments')
      .select('id, status, patient_id')
      .eq('clinic_id', clinicId)
      .gte('appointment_date', today)
      .lt('appointment_date', `${today}T23:59:59`);

    if (error) {
      console.warn('Error fetching appointment stats:', error);
      return { today: 0, pending: 0 };
    }

    const pending = data?.filter(a => a.status === 'scheduled')?.length || 0;
    
    return {
      today: data?.length || 0,
      pending
    };
  }

  private async getComplianceStatus(clinicId: string) {
    const { data, error } = await this.supabase
      .from('compliance_monitoring')
      .select(`
        lgpd_status,
        anvisa_status,
        cfm_status,
        last_audit,
        recent_alerts
      `)
      .eq('clinic_id', clinicId)
      .single();

    if (error) {
      console.warn('Error fetching compliance status:', error);
      return null;
    }

    return {
      lgpd: data?.lgpd_status || 'unknown',
      anvisa: data?.anvisa_status || 'unknown',
      cfm: data?.cfm_status || 'unknown',
      lastAudit: data?.last_audit ? new Date(data.last_audit) : new Date(),
      recentAlerts: data?.recent_alerts || []
    };
  }

  private async getMLPipelineMetrics(clinicId: string) {
    try {
      // Get latest model performance
      const { data: modelData, error: modelError } = await this.supabase
        .from('ai_models')
        .select(`
          accuracy,
          drift_status,
          updated_at,
          predictions_count
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'deployed')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (modelError) {
        console.warn('Error fetching ML metrics:', modelError);
        return null;
      }

      // Get today's predictions count
      const today = new Date().toISOString().split('T')[0];
      const { count: predictionsToday } = await this.supabase
        .from('ml_predictions')
        .select('id', { count: 'exact' })
        .eq('clinic_id', clinicId)
        .gte('created_at', today);

      return {
        noShowAccuracy: modelData?.accuracy || 0,
        driftStatus: modelData?.drift_status || 'unknown',
        lastModelUpdate: modelData?.updated_at ? new Date(modelData.updated_at) : new Date(),
        predictionsToday: predictionsToday || 0,
        systemHealth: this.calculateSystemHealth(modelData)
      };

    } catch (error) {
      console.warn('Error calculating ML metrics:', error);
      return null;
    }
  }

  private async getRecentActivities(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('user_activities')
      .select('action, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('Error fetching recent activities:', error);
      return [];
    }

    return data?.map(activity => activity.action) || [];
  }

  private async getSystemNotifications(clinicId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('system_notifications')
      .select('message, severity')
      .eq('clinic_id', clinicId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.warn('Error fetching system notifications:', error);
      return [];
    }

    return data?.map(notification => notification.message) || [];
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateSystemHealth(modelData: any): string {
    if (!modelData) return 'unknown';
    
    const accuracy = modelData.accuracy || 0;
    const driftStatus = modelData.drift_status || 'unknown';
    
    if (accuracy >= 0.9 && driftStatus === 'stable') return 'optimal';
    if (accuracy >= 0.8 && driftStatus !== 'critical') return 'good';
    if (accuracy >= 0.7) return 'degraded';
    return 'critical';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultContext(): ClientContext {
    return {
      clinicId: 'unknown',
      userId: 'unknown',
      userRole: 'user',
      userName: 'Usuário',
      currentPage: '/',
      sessionId: this.generateSessionId(),
      recentActivities: [],
      patientCount: 0,
      todayAppointments: 0,
      pendingTasks: 0,
      complianceStatus: {
        lgpd: 'unknown',
        anvisa: 'unknown',
        cfm: 'unknown',
        lastAudit: new Date()
      },
      recentPatients: [],
      recentAlerts: [],
      systemNotifications: []
    };
  }
}

// =============================================================================
// CLIENT CONTEXT API ENDPOINT
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clinicId = searchParams.get('clinicId');
    
    // Initialize service
    const contextService = new ClientContextService();
    
    // Get comprehensive client context
    const context = await contextService.getClientContext(userId || undefined, clinicId || undefined);
    
    return NextResponse.json(context, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Context-Generated': new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Client Context API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve client context',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST ENDPOINT - Update Context or Trigger Refresh
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, currentPage, userId, clinicId } = body;

    if (action === 'update_page') {
      // Update current page context
      return NextResponse.json({ 
        success: true, 
        currentPage,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'refresh') {
      // Force refresh context
      const contextService = new ClientContextService();
      const context = await contextService.getClientContext(userId, clinicId);
      
      return NextResponse.json({
        success: true,
        context,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Client Context POST error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update client context' },
      { status: 500 }
    );
  }
}

// Export the service for use in other parts of the application
export { ClientContextService };

// Runtime configuration
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
