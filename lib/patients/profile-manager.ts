/**
 * Patient Profile Manager
 * 
 * Comprehensive patient profile management system for the NeonPro clinic management platform.
 * Handles patient demographics, medical history, care preferences, emergency contacts,
 * and provides 360-degree patient view with profile completeness scoring.
 */

// Enhanced patient profile types with comprehensive data structure
export interface PatientDemographics {
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone: string;
  email: string;
  address: string;
  insurance_provider?: string;
  insurance_id?: string;
  preferred_language?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
  occupation?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface MedicalInformation {
  medical_history: string[];
  chronic_conditions: string[];
  current_medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prescribing_doctor?: string;
    start_date?: string;
  }>;
  allergies: string[];
  immunizations?: Array<{
    vaccine: string;
    date_administered: string;
    lot_number?: string;
  }>;
  family_medical_history?: Array<{
    relationship: string;
    condition: string;
    age_of_onset?: number;
  }>;
}

export interface VitalSigns {
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature_celsius?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  blood_type?: string;
  last_updated?: string;
}

export interface CarePreferences {
  communication_method: 'phone' | 'email' | 'sms' | 'portal';
  appointment_preferences: {
    preferred_time_of_day?: 'morning' | 'afternoon' | 'evening';
    preferred_days?: string[];
    advance_notice_days?: number;
  };
  language: string;
  cultural_considerations?: string[];
  accessibility_needs?: string[];
  dietary_restrictions?: string[];
  religious_considerations?: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  can_make_medical_decisions: boolean;
}

export interface PatientProfileExtended {
  patient_id: string;
  demographics: PatientDemographics;
  medical_information: MedicalInformation;
  vital_signs: VitalSigns;
  care_preferences: CarePreferences;
  emergency_contacts: EmergencyContact[];
  profile_completeness_score: number;
  risk_assessment?: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  ai_insights?: any;
  created_at: string;
  updated_at: string;
  last_accessed?: string;
  is_active: boolean;
}

export interface ProfileUpdateData {
  demographics?: Partial<PatientDemographics>;
  medical_information?: Partial<MedicalInformation>;
  vital_signs?: Partial<VitalSigns>;
  care_preferences?: Partial<CarePreferences>;
  emergency_contacts?: EmergencyContact[];
}

export class ProfileManager {
  private mockProfiles: Map<string, PatientProfileExtended> = new Map();

  /**
   * Create a new comprehensive patient profile
   */
  async createPatientProfile(profileData: Partial<PatientProfileExtended>): Promise<PatientProfileExtended | null> {
    try {
      // Calculate initial profile completeness
      const completenessScore = await this.calculateProfileCompleteness(profileData);

      // Create profile with system fields
      const profile: PatientProfileExtended = {
        patient_id: profileData.patient_id || `patient_${Date.now()}`,
        demographics: profileData.demographics || {
          name: '',
          date_of_birth: '',
          gender: 'prefer_not_to_say',
          phone: '',
          email: '',
          address: ''
        },
        medical_information: profileData.medical_information || {
          medical_history: [],
          chronic_conditions: [],
          current_medications: [],
          allergies: []
        },
        vital_signs: profileData.vital_signs || {},
        care_preferences: profileData.care_preferences || {
          communication_method: 'email',
          appointment_preferences: {},
          language: 'en'
        },
        emergency_contacts: profileData.emergency_contacts || [],
        profile_completeness_score: completenessScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      };

      // Store in mock database
      this.mockProfiles.set(profile.patient_id, profile);

      console.log(`Created patient profile for ${profile.patient_id} with completeness: ${completenessScore}`);
      return profile;

    } catch (error) {
      console.error('Error in createPatientProfile:', error);
      return null;
    }
  }

  /**
   * Retrieve complete patient profile with all related data
   */
  async getPatientProfile(patientId: string): Promise<PatientProfileExtended | null> {
    try {
      const profile = this.mockProfiles.get(patientId);
      
      if (!profile || !profile.is_active) {
        return null;
      }

      // Update last accessed timestamp
      profile.last_accessed = new Date().toISOString();
      this.mockProfiles.set(patientId, profile);

      console.log(`Retrieved patient profile for ${patientId}`);
      return profile;

    } catch (error) {
      console.error('Error in getPatientProfile:', error);
      return null;
    }
  }

  /**
   * Update patient profile with selective updates
   */
  async updatePatientProfile(
    patientId: string, 
    updateData: ProfileUpdateData
  ): Promise<PatientProfileExtended | null> {
    try {
      const currentProfile = this.mockProfiles.get(patientId);
      if (!currentProfile) {
        throw new Error('Patient profile not found');
      }

      // Merge update data with current profile
      const mergedData = this.mergeProfileData(currentProfile, updateData);

      // Recalculate profile completeness
      const newCompleteness = await this.calculateProfileCompleteness(mergedData);

      // Update profile
      const updatedProfile: PatientProfileExtended = {
        ...mergedData,
        profile_completeness_score: newCompleteness,
        updated_at: new Date().toISOString()
      };

      this.mockProfiles.set(patientId, updatedProfile);

      console.log(`Updated patient profile for ${patientId}, new completeness: ${newCompleteness}`);
      return updatedProfile;

    } catch (error) {
      console.error('Error in updatePatientProfile:', error);
      return null;
    }
  }

  /**
   * Calculate comprehensive profile completeness score
   */
  async calculateProfileCompleteness(profileData: Partial<PatientProfileExtended>): Promise<number> {
    const weights = {
      demographics: 0.3,
      medical_information: 0.25,
      vital_signs: 0.2,
      care_preferences: 0.15,
      emergency_contacts: 0.1
    };

    let totalScore = 0;

    // Demographics completeness
    if (profileData.demographics) {
      const demoFields = [
        'name', 'date_of_birth', 'gender', 'phone', 'email', 'address'
      ];
      const requiredFields = ['insurance_provider', 'preferred_language', 'emergency_contact_name'];
      
      const demoScore = this.calculateSectionCompleteness(
        profileData.demographics,
        demoFields,
        requiredFields
      );
      totalScore += demoScore * weights.demographics;
    }

    // Medical information completeness
    if (profileData.medical_information) {
      const medFields = ['medical_history', 'chronic_conditions', 'current_medications', 'allergies'];
      const medOptional = ['immunizations', 'family_medical_history'];
      
      const medScore = this.calculateSectionCompleteness(
        profileData.medical_information,
        medFields,
        medOptional
      );
      totalScore += medScore * weights.medical_information;
    }

    // Vital signs completeness
    if (profileData.vital_signs) {
      const vitalFields = ['height_cm', 'weight_kg', 'blood_type'];
      const vitalOptional = ['blood_pressure_systolic', 'heart_rate', 'temperature_celsius'];
      
      const vitalScore = this.calculateSectionCompleteness(
        profileData.vital_signs,
        vitalFields,
        vitalOptional
      );
      totalScore += vitalScore * weights.vital_signs;
    }

    // Care preferences completeness
    if (profileData.care_preferences) {
      const careFields = ['communication_method', 'language'];
      const careOptional = ['appointment_preferences', 'accessibility_needs'];
      
      const careScore = this.calculateSectionCompleteness(
        profileData.care_preferences,
        careFields,
        careOptional
      );
      totalScore += careScore * weights.care_preferences;
    }

    // Emergency contacts completeness
    if (profileData.emergency_contacts && profileData.emergency_contacts.length > 0) {
      const primaryContact = profileData.emergency_contacts.find(contact => contact.is_primary);
      if (primaryContact) {
        const contactFields = ['name', 'relationship', 'phone'];
        const contactScore = this.calculateSectionCompleteness(
          primaryContact,
          contactFields,
          ['email', 'address']
        );
        totalScore += contactScore * weights.emergency_contacts;
      }
    }

    return Math.min(1.0, totalScore);
  }

  /**
   * Search patients by various criteria
   */
  async searchPatients(searchCriteria: {
    name?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
    insuranceId?: string;
    limit?: number;
  }): Promise<PatientProfileExtended[]> {
    try {
      const allPatients = Array.from(this.mockProfiles.values())
        .filter(patient => patient.is_active);

      let results = allPatients;

      // Apply search filters
      if (searchCriteria.name) {
        results = results.filter(patient => 
          patient.demographics.name.toLowerCase().includes(searchCriteria.name!.toLowerCase())
        );
      }

      if (searchCriteria.phone) {
        results = results.filter(patient => 
          patient.demographics.phone === searchCriteria.phone
        );
      }

      if (searchCriteria.email) {
        results = results.filter(patient => 
          patient.demographics.email.toLowerCase().includes(searchCriteria.email!.toLowerCase())
        );
      }

      if (searchCriteria.dateOfBirth) {
        results = results.filter(patient => 
          patient.demographics.date_of_birth === searchCriteria.dateOfBirth
        );
      }

      if (searchCriteria.insuranceId) {
        results = results.filter(patient => 
          patient.demographics.insurance_id === searchCriteria.insuranceId
        );
      }

      // Apply limit
      if (searchCriteria.limit) {
        results = results.slice(0, searchCriteria.limit);
      }

      return results.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    } catch (error) {
      console.error('Error in searchPatients:', error);
      return [];
    }
  }

  /**
   * Get patients with incomplete profiles
   */
  async getIncompleteProfiles(threshold: number = 0.8): Promise<PatientProfileExtended[]> {
    try {
      return Array.from(this.mockProfiles.values())
        .filter(patient => 
          patient.is_active && patient.profile_completeness_score < threshold
        )
        .sort((a, b) => a.profile_completeness_score - b.profile_completeness_score);

    } catch (error) {
      console.error('Error in getIncompleteProfiles:', error);
      return [];
    }
  }

  /**
   * Archive patient profile (soft delete)
   */
  async archivePatientProfile(patientId: string): Promise<boolean> {
    try {
      const profile = this.mockProfiles.get(patientId);
      if (!profile) {
        return false;
      }

      profile.is_active = false;
      profile.updated_at = new Date().toISOString();
      this.mockProfiles.set(patientId, profile);

      console.log(`Archived patient profile for ${patientId}`);
      return true;

    } catch (error) {
      console.error('Error in archivePatientProfile:', error);
      return false;
    }
  }

  /**
   * Get patient statistics and analytics
   */
  async getPatientAnalytics(): Promise<{
    totalPatients: number;
    activePatients: number;
    averageCompleteness: number;
    profilesNeedingAttention: number;
    recentlyUpdated: number;
  }> {
    try {
      const allPatients = Array.from(this.mockProfiles.values());
      const activePatients = allPatients.filter(patient => patient.is_active);

      const avgCompleteness = activePatients.length > 0
        ? activePatients.reduce((sum, patient) => sum + patient.profile_completeness_score, 0) / activePatients.length
        : 0;

      const needingAttention = activePatients.filter(patient => 
        patient.profile_completeness_score < 0.7
      );

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentlyUpdated = activePatients.filter(patient => 
        new Date(patient.updated_at) >= sevenDaysAgo
      );

      return {
        totalPatients: allPatients.length,
        activePatients: activePatients.length,
        averageCompleteness: Math.round(avgCompleteness * 100) / 100,
        profilesNeedingAttention: needingAttention.length,
        recentlyUpdated: recentlyUpdated.length
      };

    } catch (error) {
      console.error('Error in getPatientAnalytics:', error);
      return {
        totalPatients: 0,
        activePatients: 0,
        averageCompleteness: 0,
        profilesNeedingAttention: 0,
        recentlyUpdated: 0
      };
    }
  }

  // Private helper methods

  private calculateSectionCompleteness(
    sectionData: any,
    requiredFields: string[],
    optionalFields: string[] = []
  ): number {
    if (!sectionData) return 0;

    let score = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    // Check required fields (weighted more heavily)
    for (const field of requiredFields) {
      if (this.hasValidValue(sectionData[field])) {
        score += 2; // Required fields worth 2 points
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      if (this.hasValidValue(sectionData[field])) {
        score += 1; // Optional fields worth 1 point
      }
    }

    // Calculate percentage (required fields count double)
    const maxScore = (requiredFields.length * 2) + optionalFields.length;
    return maxScore > 0 ? score / maxScore : 0;
  }

  private hasValidValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  private mergeProfileData(
    currentProfile: PatientProfileExtended,
    updateData: ProfileUpdateData
  ): PatientProfileExtended {
    return {
      ...currentProfile,
      demographics: updateData.demographics 
        ? { ...currentProfile.demographics, ...updateData.demographics }
        : currentProfile.demographics,
      medical_information: updateData.medical_information
        ? { ...currentProfile.medical_information, ...updateData.medical_information }
        : currentProfile.medical_information,
      vital_signs: updateData.vital_signs
        ? { ...currentProfile.vital_signs, ...updateData.vital_signs }
        : currentProfile.vital_signs,
      care_preferences: updateData.care_preferences
        ? { ...currentProfile.care_preferences, ...updateData.care_preferences }
        : currentProfile.care_preferences,
      emergency_contacts: updateData.emergency_contacts || currentProfile.emergency_contacts
    };
  }

  /**
   * Archive patient profile (soft delete)
   */
  async archivePatient(patientId: string): Promise<boolean> {
    try {
      const profile = this.mockProfiles.get(patientId);
      
      if (!profile) {
        console.error(`Patient ${patientId} not found for archiving`);
        return false;
      }

      // Mark as inactive (soft delete)
      profile.is_active = false;
      profile.updated_at = new Date().toISOString();
      
      // Update the profile in the mock database
      this.mockProfiles.set(patientId, profile);
      
      console.log(`Archived patient profile for ${patientId}`);
      return true;

    } catch (error) {
      console.error('Error in archivePatient:', error);
      return false;
    }
  }
}

export default ProfileManager;