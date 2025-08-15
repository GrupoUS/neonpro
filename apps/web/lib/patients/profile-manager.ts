import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Types for patient profile management
export interface PatientProfile {
  id: string;
  patient_id: string;

  // Biometric data
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  blood_type?: string;
  allergies: string[];
  chronic_conditions: string[];
  medications: string[];
  emergency_contact: EmergencyContact;

  // AI insights
  ai_insights: AIInsights;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: string[];
  treatment_recommendations: TreatmentRecommendation[];
  last_assessment_date?: string;

  // Profile metadata
  profile_completeness_score: number;
  data_quality_score: number;
  preferences: PatientPreferences;
  consent_status: ConsentStatus;
  privacy_settings: PrivacySettings;

  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface AIInsights {
  health_score?: number;
  predicted_risks?: string[];
  treatment_success_probability?: number;
  recommended_frequency?: string;
  behavioral_patterns?: any[];
  last_analysis?: string;
}

export interface TreatmentRecommendation {
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration?: string;
  success_probability?: number;
  contraindications?: string[];
}

export interface PatientPreferences {
  communication_method?: 'email' | 'sms' | 'phone' | 'app';
  appointment_reminders?: boolean;
  marketing_communications?: boolean;
  preferred_staff?: string[];
  preferred_times?: string[];
  accessibility_needs?: string[];
}

export interface ConsentStatus {
  data_processing?: boolean;
  marketing?: boolean;
  research?: boolean;
  photo_usage?: boolean;
  data_sharing?: boolean;
  last_updated?: string;
}

export interface PrivacySettings {
  profile_visibility?: 'private' | 'staff_only' | 'limited';
  photo_access?: 'none' | 'medical_only' | 'full';
  data_retention_period?: number;
  anonymize_data?: boolean;
}

export interface PatientPhoto {
  id: string;
  patient_id: string;
  photo_url: string;
  photo_type:
    | 'profile'
    | 'identification'
    | 'medical'
    | 'before'
    | 'after'
    | 'progress';
  file_size?: number;
  mime_type?: string;
  dimensions?: { width: number; height: number };
  recognition_data?: any;
  face_encoding?: string;
  quality_score?: number;
  verification_status: 'pending' | 'verified' | 'failed' | 'manual_review';
  title?: string;
  description?: string;
  tags: string[];
  is_primary: boolean;
  is_visible: boolean;
  access_level: string;
  uploaded_at: string;
  uploaded_by?: string;
  approved_at?: string;
  approved_by?: string;
}

export interface MedicalTimelineEvent {
  id: string;
  patient_id: string;
  event_type:
    | 'appointment'
    | 'treatment'
    | 'procedure'
    | 'diagnosis'
    | 'medication'
    | 'test_result'
    | 'follow_up';
  event_date: string;
  title: string;
  description?: string;
  notes?: string;
  photos: string[];
  documents: any[];
  metadata: any;
  outcome_score?: number;
  outcome_notes?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  treatment_id?: string;
  appointment_id?: string;
  staff_id?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface DuplicateCandidate {
  id: string;
  patient_id_1: string;
  patient_id_2: string;
  confidence_score: number;
  matching_factors: any;
  similarity_analysis: any;
  review_status: 'pending' | 'approved' | 'rejected' | 'merged';
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  resolved_date?: string;
  merge_result?: any;
  kept_patient_id?: string;
  detection_algorithm?: string;
  detection_version?: string;
  created_at: string;
}

export interface PatientSearchResult {
  patient_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  risk_level?: string;
  last_visit?: string;
  profile_completeness: number;
  photo_url?: string;
  search_score?: number;
}

/**
 * Patient Profile Manager
 * Handles comprehensive patient profile management with AI insights
 */
export class PatientProfileManager {
  private readonly supabase;

  constructor() {
    this.supabase = createClientComponentClient<Database>();
  }

  /**
   * Get comprehensive patient profile
   */
  async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('patient_profiles_extended')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error) {
        throw error;
      }
      return data as PatientProfile;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return null;
    }
  }

  /**
   * Create or update patient profile
   */
  async upsertPatientProfile(
    patientId: string,
    profileData: Partial<PatientProfile>
  ): Promise<PatientProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('patient_profiles_extended')
        .upsert({
          patient_id: patientId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update search index
      await this.updateSearchIndex(patientId);

      return data as PatientProfile;
    } catch (error) {
      console.error('Error upserting patient profile:', error);
      return null;
    }
  }

  /**
   * Calculate and update profile completeness score
   */
  async updateProfileCompleteness(patientId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc(
        'calculate_profile_completeness',
        { patient_uuid: patientId }
      );

      if (error) {
        throw error;
      }

      // Update the profile with the new score
      await this.supabase
        .from('patient_profiles_extended')
        .update({ profile_completeness_score: data })
        .eq('patient_id', patientId);

      return data;
    } catch (error) {
      console.error('Error updating profile completeness:', error);
      return 0;
    }
  }

  /**
   * Get patient photos
   */
  async getPatientPhotos(
    patientId: string,
    photoType?: string
  ): Promise<PatientPhoto[]> {
    try {
      let query = this.supabase
        .from('patient_photos')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_visible', true)
        .order('uploaded_at', { ascending: false });

      if (photoType) {
        query = query.eq('photo_type', photoType);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data as PatientPhoto[];
    } catch (error) {
      console.error('Error fetching patient photos:', error);
      return [];
    }
  }

  /**
   * Upload patient photo
   */
  async uploadPatientPhoto(
    patientId: string,
    file: File,
    photoType: PatientPhoto['photo_type'],
    metadata?: Partial<PatientPhoto>
  ): Promise<PatientPhoto | null> {
    try {
      // Upload file to Supabase storage
      const fileName = `${patientId}/${photoType}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } =
        await this.supabase.storage
          .from('patient-photos')
          .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('patient-photos')
        .getPublicUrl(fileName);

      // Create photo record
      const photoData = {
        patient_id: patientId,
        photo_url: urlData.publicUrl,
        photo_type: photoType,
        file_size: file.size,
        mime_type: file.type,
        dimensions: await this.getImageDimensions(file),
        is_primary: photoType === 'profile' && metadata?.is_primary !== false,
        ...metadata,
      };

      const { data, error } = await this.supabase
        .from('patient_photos')
        .insert(photoData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as PatientPhoto;
    } catch (error) {
      console.error('Error uploading patient photo:', error);
      return null;
    }
  }

  /**
   * Get medical timeline for patient
   */
  async getMedicalTimeline(
    patientId: string,
    limit?: number
  ): Promise<MedicalTimelineEvent[]> {
    try {
      let query = this.supabase
        .from('medical_timeline')
        .select('*')
        .eq('patient_id', patientId)
        .order('event_date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }

      return data as MedicalTimelineEvent[];
    } catch (error) {
      console.error('Error fetching medical timeline:', error);
      return [];
    }
  }

  /**
   * Add medical timeline event
   */
  async addTimelineEvent(
    patientId: string,
    eventData: Omit<
      MedicalTimelineEvent,
      'id' | 'patient_id' | 'created_at' | 'updated_at'
    >
  ): Promise<MedicalTimelineEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('medical_timeline')
        .insert({
          patient_id: patientId,
          ...eventData,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as MedicalTimelineEvent;
    } catch (error) {
      console.error('Error adding timeline event:', error);
      return null;
    }
  }

  /**
   * Search patients with advanced filters
   */
  async searchPatients(
    query: string,
    filters?: {
      risk_level?: string;
      age_range?: [number, number];
      last_visit_days?: number;
      has_photo?: boolean;
      completion_threshold?: number;
    },
    limit = 50
  ): Promise<PatientSearchResult[]> {
    try {
      let searchQuery = this.supabase
        .from('patient_search_index')
        .select(`
          patient_id,
          full_name_normalized,
          email_normalized,
          phone_normalized
        `)
        .limit(limit);

      // Apply text search
      if (query.trim()) {
        searchQuery = searchQuery.textSearch('search_vector', query, {
          type: 'websearch',
          config: 'portuguese',
        });
      }

      const { data: searchData, error: searchError } = await searchQuery;
      if (searchError) {
        throw searchError;
      }

      if (!searchData || searchData.length === 0) {
        return [];
      }

      // Get additional patient data
      const patientIds = searchData.map((p) => p.patient_id);
      const { data: profilesData, error: profilesError } = await this.supabase
        .from('patient_profiles_extended')
        .select(
          'patient_id, risk_level, profile_completeness_score, updated_at'
        )
        .in('patient_id', patientIds);

      if (profilesError) {
        throw profilesError;
      }

      // Combine search and profile data
      const results = searchData.map((search) => {
        const profile = profilesData?.find(
          (p) => p.patient_id === search.patient_id
        );
        return {
          patient_id: search.patient_id,
          full_name: search.full_name_normalized,
          email: search.email_normalized,
          phone: search.phone_normalized,
          risk_level: profile?.risk_level,
          last_visit: profile?.updated_at,
          profile_completeness: profile?.profile_completeness_score || 0,
          search_score: 1.0, // Could be enhanced with proper scoring
        };
      });

      return this.applySearchFilters(results, filters);
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  }

  /**
   * Detect duplicate patients
   */
  async detectDuplicates(patientId: string): Promise<DuplicateCandidate[]> {
    try {
      // Get patient data for comparison
      const profile = await this.getPatientProfile(patientId);
      if (!profile) {
        return [];
      }

      // Simple duplicate detection based on name similarity
      // In production, this would be more sophisticated
      const { data, error } = await this.supabase
        .from('duplicate_candidates')
        .select('*')
        .or(`patient_id_1.eq.${patientId},patient_id_2.eq.${patientId}`)
        .eq('review_status', 'pending');

      if (error) {
        throw error;
      }
      return data as DuplicateCandidate[];
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return [];
    }
  }

  /**
   * Update patient search index
   */
  private async updateSearchIndex(patientId: string): Promise<void> {
    try {
      await this.supabase.rpc('update_patient_search_index', {
        patient_uuid: patientId,
      });
    } catch (error) {
      console.error('Error updating search index:', error);
    }
  }

  /**
   * Get image dimensions from file
   */
  private async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Apply search filters to results
   */
  private applySearchFilters(
    results: PatientSearchResult[],
    filters?: {
      risk_level?: string;
      age_range?: [number, number];
      last_visit_days?: number;
      has_photo?: boolean;
      completion_threshold?: number;
    }
  ): PatientSearchResult[] {
    if (!filters) {
      return results;
    }

    return results.filter((result) => {
      // Risk level filter
      if (filters.risk_level && result.risk_level !== filters.risk_level) {
        return false;
      }

      // Completion threshold filter
      if (
        filters.completion_threshold &&
        result.profile_completeness < filters.completion_threshold
      ) {
        return false;
      }

      // Last visit filter
      if (filters.last_visit_days && result.last_visit) {
        const daysSinceVisit = Math.floor(
          (Date.now() - new Date(result.last_visit).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSinceVisit > filters.last_visit_days) {
          return false;
        }
      }

      return true;
    });
  }
}

export default PatientProfileManager;
