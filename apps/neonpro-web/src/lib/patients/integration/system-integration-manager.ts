import { createClient } from '@/lib/supabase/client';
import { AuditLogger } from '@/lib/audit/audit-logger';
import { LGPDManager } from '@/lib/lgpd/lgpd-manager';
import { PatientInsights } from '@/lib/ai/patient-insights';
import { Database } from '@/types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type Treatment = Database['public']['Tables']['treatments']['Row'];

export interface PatientSearchFilters {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  ageRange?: { min: number; max: number };
  gender?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  lastVisit?: { from: Date; to: Date };
  treatmentType?: string;
  appointmentStatus?: string;
  hasPhotos?: boolean;
  consentStatus?: boolean;
  tags?: string[];
}

export interface PatientSegment {
  id: string;
  name: string;
  description: string;
  criteria: PatientSearchFilters;
  patientCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegratedPatientData {
  patient: Patient;
  appointments: Appointment[];
  treatments: Treatment[];
  riskAssessment: any;
  communicationHistory: any[];
  photoCount: number;
  lastActivity: Date;
  totalSpent: number;
  loyaltyScore: number;
}

export interface SearchSuggestion {
  type: 'patient' | 'appointment' | 'treatment';
  id: string;
  title: string;
  subtitle: string;
  relevanceScore: number;
  matchedFields: string[];
}

export interface QuickAccessItem {
  patientId: string;
  patientName: string;
  lastAccessed: Date;
  accessCount: number;
  context: 'search' | 'appointment' | 'treatment' | 'emergency';
}

export class SystemIntegrationManager {
  private supabase = createClient();
  private auditLogger = new AuditLogger();
  private lgpdManager = new LGPDManager();
  private patientInsights = new PatientInsights();

  /**
   * Advanced patient search with AI-powered suggestions
   */
  async searchPatients(
    query: string,
    filters: PatientSearchFilters = {},
    userId: string,
    limit: number = 50
  ): Promise<{
    patients: IntegratedPatientData[];
    suggestions: SearchSuggestion[];
    totalCount: number;
    searchTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Log search activity
      await this.auditLogger.log({
        action: 'patient_search',
        userId,
        details: { query, filters },
        timestamp: new Date()
      });

      // Build search query
      let searchQuery = this.supabase
        .from('patients')
        .select(`
          *,
          appointments!inner(*),
          treatments(*),
          patient_photos(count)
        `);

      // Apply text search
      if (query) {
        searchQuery = searchQuery.or(
          `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,cpf.ilike.%${query}%`
        );
      }

      // Apply filters
      if (filters.ageRange) {
        const currentYear = new Date().getFullYear();
        const maxBirthYear = currentYear - filters.ageRange.min;
        const minBirthYear = currentYear - filters.ageRange.max;
        searchQuery = searchQuery
          .gte('birth_date', `${minBirthYear}-01-01`)
          .lte('birth_date', `${maxBirthYear}-12-31`);
      }

      if (filters.gender) {
        searchQuery = searchQuery.eq('gender', filters.gender);
      }

      if (filters.lastVisit) {
        searchQuery = searchQuery
          .gte('appointments.appointment_date', filters.lastVisit.from.toISOString())
          .lte('appointments.appointment_date', filters.lastVisit.to.toISOString());
      }

      if (filters.appointmentStatus) {
        searchQuery = searchQuery.eq('appointments.status', filters.appointmentStatus);
      }

      if (filters.consentStatus !== undefined) {
        searchQuery = searchQuery.eq('lgpd_consent', filters.consentStatus);
      }

      // Execute search
      const { data: patients, error, count } = await searchQuery
        .limit(limit)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Enrich patient data
      const enrichedPatients = await Promise.all(
        (patients || []).map(async (patient) => {
          return await this.getIntegratedPatientData(patient.id, userId);
        })
      );

      // Generate AI suggestions
      const suggestions = await this.generateSearchSuggestions(query, filters);

      const searchTime = Date.now() - startTime;

      return {
        patients: enrichedPatients,
        suggestions,
        totalCount: count || 0,
        searchTime
      };
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get integrated patient data with all related information
   */
  async getIntegratedPatientData(
    patientId: string,
    userId: string
  ): Promise<IntegratedPatientData> {
    try {
      // Check LGPD permissions
      const hasPermission = await this.lgpdManager.checkDataAccess(
        userId,
        patientId,
        'patient_profile'
      );

      if (!hasPermission) {
        throw new Error('Acesso negado: sem permissão LGPD para visualizar dados do paciente');
      }

      // Get patient data
      const { data: patient, error: patientError } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Get appointments
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      // Get treatments
      const { data: treatments } = await this.supabase
        .from('treatments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Get photo count
      const { count: photoCount } = await this.supabase
        .from('patient_photos')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patientId);

      // Get risk assessment
      const riskAssessment = await this.patientInsights.assessPatientRisk(patientId);

      // Calculate metrics
      const totalSpent = treatments?.reduce((sum, treatment) => {
        return sum + (treatment.cost || 0);
      }, 0) || 0;

      const lastActivity = this.getLastActivity(appointments || [], treatments || []);
      const loyaltyScore = this.calculateLoyaltyScore(appointments || [], treatments || []);

      // Get communication history (placeholder)
      const communicationHistory: any[] = [];

      // Log access
      await this.auditLogger.log({
        action: 'patient_data_access',
        userId,
        details: { patientId, accessType: 'integrated_view' },
        timestamp: new Date()
      });

      return {
        patient,
        appointments: appointments || [],
        treatments: treatments || [],
        riskAssessment,
        communicationHistory,
        photoCount: photoCount || 0,
        lastActivity,
        totalSpent,
        loyaltyScore
      };
    } catch (error) {
      console.error('Error getting integrated patient data:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered search suggestions
   */
  private async generateSearchSuggestions(
    query: string,
    filters: PatientSearchFilters
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    if (!query || query.length < 2) return suggestions;

    try {
      // Patient name suggestions
      const { data: patientSuggestions } = await this.supabase
        .from('patients')
        .select('id, name, email')
        .ilike('name', `%${query}%`)
        .limit(5);

      patientSuggestions?.forEach(patient => {
        suggestions.push({
          type: 'patient',
          id: patient.id,
          title: patient.name,
          subtitle: patient.email,
          relevanceScore: this.calculateRelevanceScore(query, patient.name),
          matchedFields: ['name']
        });
      });

      // Treatment suggestions
      const { data: treatmentSuggestions } = await this.supabase
        .from('treatments')
        .select('id, name, patients(name)')
        .ilike('name', `%${query}%`)
        .limit(3);

      treatmentSuggestions?.forEach(treatment => {
        suggestions.push({
          type: 'treatment',
          id: treatment.id,
          title: treatment.name,
          subtitle: `Paciente: ${(treatment as any).patients?.name}`,
          relevanceScore: this.calculateRelevanceScore(query, treatment.name),
          matchedFields: ['treatment_name']
        });
      });

      // Sort by relevance
      suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return suggestions.slice(0, 8);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [];
    }
  }

  /**
   * Create patient segment for targeted analysis
   */
  async createPatientSegment(
    name: string,
    description: string,
    criteria: PatientSearchFilters,
    userId: string
  ): Promise<PatientSegment> {
    try {
      // Count patients matching criteria
      const { count } = await this.searchPatients('', criteria, userId, 1);

      const segment: PatientSegment = {
        id: crypto.randomUUID(),
        name,
        description,
        criteria,
        patientCount: count,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save segment (would be stored in database)
      await this.auditLogger.log({
        action: 'patient_segment_created',
        userId,
        details: { segmentId: segment.id, name, patientCount: count },
        timestamp: new Date()
      });

      return segment;
    } catch (error) {
      console.error('Error creating patient segment:', error);
      throw error;
    }
  }

  /**
   * Get quick access patients for staff
   */
  async getQuickAccessPatients(userId: string): Promise<QuickAccessItem[]> {
    try {
      // This would typically come from a user_patient_access table
      // For now, return recent appointments
      const { data: recentAppointments } = await this.supabase
        .from('appointments')
        .select(`
          patient_id,
          patients(name),
          appointment_date,
          status
        `)
        .eq('staff_id', userId)
        .gte('appointment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('appointment_date', { ascending: false })
        .limit(10);

      const quickAccess: QuickAccessItem[] = [];
      const seenPatients = new Set<string>();

      recentAppointments?.forEach(appointment => {
        if (!seenPatients.has(appointment.patient_id)) {
          seenPatients.add(appointment.patient_id);
          quickAccess.push({
            patientId: appointment.patient_id,
            patientName: (appointment as any).patients?.name || 'Nome não disponível',
            lastAccessed: new Date(appointment.appointment_date),
            accessCount: 1,
            context: 'appointment'
          });
        }
      });

      return quickAccess;
    } catch (error) {
      console.error('Error getting quick access patients:', error);
      return [];
    }
  }

  /**
   * Get patient communication history integration
   */
  async getPatientCommunicationHistory(
    patientId: string,
    userId: string
  ): Promise<any[]> {
    try {
      // Check permissions
      const hasPermission = await this.lgpdManager.checkDataAccess(
        userId,
        patientId,
        'communication_history'
      );

      if (!hasPermission) {
        throw new Error('Acesso negado: sem permissão para histórico de comunicação');
      }

      // This would integrate with communication systems
      // For now, return appointment-based communication
      const { data: appointments } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: false });

      const communicationHistory = appointments?.map(appointment => ({
        id: appointment.id,
        type: 'appointment',
        date: appointment.appointment_date,
        subject: `Consulta - ${appointment.service_type}`,
        status: appointment.status,
        notes: appointment.notes
      })) || [];

      return communicationHistory;
    } catch (error) {
      console.error('Error getting communication history:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private getLastActivity(appointments: Appointment[], treatments: Treatment[]): Date {
    const allDates = [
      ...appointments.map(a => new Date(a.appointment_date)),
      ...treatments.map(t => new Date(t.created_at))
    ];

    return allDates.length > 0 
      ? new Date(Math.max(...allDates.map(d => d.getTime())))
      : new Date();
  }

  private calculateLoyaltyScore(appointments: Appointment[], treatments: Treatment[]): number {
    const appointmentCount = appointments.length;
    const treatmentCount = treatments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    
    // Simple loyalty calculation
    const baseScore = Math.min(appointmentCount * 10, 100);
    const completionBonus = (completedAppointments / Math.max(appointmentCount, 1)) * 20;
    const treatmentBonus = Math.min(treatmentCount * 5, 30);
    
    return Math.round(baseScore + completionBonus + treatmentBonus);
  }

  private calculateRelevanceScore(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (textLower === queryLower) return 100;
    if (textLower.startsWith(queryLower)) return 90;
    if (textLower.includes(queryLower)) return 70;
    
    // Fuzzy matching could be implemented here
    return 50;
  }
}

export const systemIntegrationManager = new SystemIntegrationManager();

