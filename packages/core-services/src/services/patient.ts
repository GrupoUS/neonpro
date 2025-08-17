// ================================================
// PATIENT SERVICE
// Centralized patient management microservice
// ================================================

import { createClient } from '@supabase/supabase-js';
import { authService } from './auth';
import { config } from './configuration';
import { monitoring } from './monitoring';

// ================================================
// TYPES AND INTERFACES
// ================================================

interface Patient {
  id: string;
  tenantId: string;
  clinicId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
  preferences: PatientPreferences;
  status: PatientStatus;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'M' | 'F' | 'O' | 'N'; // Male, Female, Other, Not specified
  cpf?: string;
  rg?: string;
  nationality?: string;
  maritalStatus?: string;
  profession?: string;
  photoUrl?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  whatsapp?: string;
  address: Address;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp' | 'sms';
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface MedicalInfo {
  bloodType?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  familyHistory: string[];
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'occasional' | 'regular' | 'heavy';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'intense';
  notes?: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface PatientPreferences {
  language: string;
  timezone: string;
  communicationPreferences: {
    appointmentReminders: boolean;
    promotionalEmails: boolean;
    treatmentUpdates: boolean;
    healthTips: boolean;
  };
  privacySettings: {
    shareDataForResearch: boolean;
    allowMarketing: boolean;
    dataRetentionYears: number;
  };
}

interface PatientStatus {
  isActive: boolean;
  registrationStatus: 'pending' | 'active' | 'inactive' | 'blocked';
  lastVisit?: Date;
  totalVisits: number;
  totalSpent: number;
  loyaltyLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  riskLevel: 'low' | 'medium' | 'high';
}

interface PatientSearchFilters {
  tenantId?: string;
  clinicId?: string;
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  status?: string;
  tags?: string[];
  dateOfBirthFrom?: Date;
  dateOfBirthTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
  loyaltyLevel?: string;
  riskLevel?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PatientCreateRequest {
  tenantId: string;
  clinicId: string;
  personalInfo: Omit<PersonalInfo, 'fullName'>;
  contactInfo: ContactInfo;
  medicalInfo?: Partial<MedicalInfo>;
  emergencyContact?: EmergencyContact;
  preferences?: Partial<PatientPreferences>;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface PatientUpdateRequest {
  personalInfo?: Partial<PersonalInfo>;
  contactInfo?: Partial<ContactInfo>;
  medicalInfo?: Partial<MedicalInfo>;
  emergencyContact?: Partial<EmergencyContact>;
  preferences?: Partial<PatientPreferences>;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface PatientHistory {
  id: string;
  patientId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: any;
  newValue?: any;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

interface PatientConsent {
  id: string;
  patientId: string;
  consentType: string;
  consentGiven: boolean;
  consentDate: Date;
  consentText: string;
  version: string;
  ipAddress?: string;
  userAgent?: string;
  witnessId?: string;
  expiresAt?: Date;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
}

// ================================================
// PATIENT SERVICE
// ================================================

export class PatientService {
  private static instance: PatientService;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  private constructor() {}

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  // ================================================
  // PATIENT CRUD OPERATIONS
  // ================================================

  async createPatient(request: PatientCreateRequest, userId: string): Promise<Patient> {
    try {
      monitoring.info('Creating patient', 'patient-service', {
        tenantId: request.tenantId,
        clinicId: request.clinicId,
        email: request.contactInfo.email,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Check for duplicate patients
      const duplicate = await this.findDuplicatePatient(request);
      if (duplicate) {
        throw new Error('Patient already exists with this email or CPF');
      }

      // Generate full name
      const fullName = `${request.personalInfo.firstName} ${request.personalInfo.lastName}`.trim();

      // Prepare patient data
      const patientData = {
        tenant_id: request.tenantId,
        clinic_id: request.clinicId,
        // Personal info
        first_name: request.personalInfo.firstName,
        last_name: request.personalInfo.lastName,
        full_name: fullName,
        date_of_birth: request.personalInfo.dateOfBirth.toISOString(),
        gender: request.personalInfo.gender,
        cpf: request.personalInfo.cpf,
        rg: request.personalInfo.rg,
        nationality: request.personalInfo.nationality,
        marital_status: request.personalInfo.maritalStatus,
        profession: request.personalInfo.profession,
        photo_url: request.personalInfo.photoUrl,
        // Contact info
        email: request.contactInfo.email,
        phone: request.contactInfo.phone,
        whatsapp: request.contactInfo.whatsapp,
        preferred_contact_method: request.contactInfo.preferredContactMethod,
        // Address
        street: request.contactInfo.address.street,
        street_number: request.contactInfo.address.number,
        complement: request.contactInfo.address.complement,
        neighborhood: request.contactInfo.address.neighborhood,
        city: request.contactInfo.address.city,
        state: request.contactInfo.address.state,
        zip_code: request.contactInfo.address.zipCode,
        country: request.contactInfo.address.country,
        // Medical info
        blood_type: request.medicalInfo?.bloodType,
        allergies: request.medicalInfo?.allergies || [],
        medications: request.medicalInfo?.medications || [],
        medical_conditions: request.medicalInfo?.medicalConditions || [],
        family_history: request.medicalInfo?.familyHistory || [],
        smoking_status: request.medicalInfo?.smokingStatus || 'never',
        alcohol_consumption: request.medicalInfo?.alcoholConsumption || 'none',
        exercise_frequency: request.medicalInfo?.exerciseFrequency || 'none',
        medical_notes: request.medicalInfo?.notes,
        // Emergency contact
        emergency_contact_name: request.emergencyContact?.name,
        emergency_contact_relationship: request.emergencyContact?.relationship,
        emergency_contact_phone: request.emergencyContact?.phone,
        emergency_contact_email: request.emergencyContact?.email,
        // Preferences
        language: request.preferences?.language || 'pt-BR',
        timezone: request.preferences?.timezone || 'America/Sao_Paulo',
        communication_preferences: request.preferences?.communicationPreferences || {
          appointmentReminders: true,
          promotionalEmails: false,
          treatmentUpdates: true,
          healthTips: false,
        },
        privacy_settings: request.preferences?.privacySettings || {
          shareDataForResearch: false,
          allowMarketing: false,
          dataRetentionYears: 5,
        },
        // Status
        is_active: true,
        registration_status: 'active',
        total_visits: 0,
        total_spent: 0,
        loyalty_level: 'bronze',
        risk_level: 'low',
        // Metadata
        tags: request.tags || [],
        metadata: request.metadata || {},
        created_by: userId,
        updated_by: userId,
      };

      // Insert patient
      const { data, error } = await this.supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        monitoring.error('Patient creation failed', 'patient-service', new Error(error.message), {
          tenantId: request.tenantId,
          email: request.contactInfo.email,
        });
        throw new Error(error.message);
      }

      const patient = this.mapPatientFromDb(data);

      // Log patient creation
      await this.logPatientHistory(patient.id, 'created', undefined, undefined, undefined, userId);

      monitoring.info('Patient created successfully', 'patient-service', {
        patientId: patient.id,
        tenantId: patient.tenantId,
        email: patient.contactInfo.email,
      });

      return patient;
    } catch (error) {
      monitoring.error('Patient creation error', 'patient-service', error as Error, {
        tenantId: request.tenantId,
        email: request.contactInfo.email,
      });
      throw error;
    }
  }

  async getPatient(patientId: string, userId: string): Promise<Patient | null> {
    try {
      monitoring.debug('Getting patient', 'patient-service', { patientId });

      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error || !data) {
        return null;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapPatientFromDb(data);
    } catch (error) {
      monitoring.error('Get patient error', 'patient-service', error as Error, { patientId });
      return null;
    }
  }

  async updatePatient(
    patientId: string,
    updates: PatientUpdateRequest,
    userId: string
  ): Promise<Patient | null> {
    try {
      monitoring.info('Updating patient', 'patient-service', { patientId });

      // Get current patient
      const currentPatient = await this.getPatient(patientId, userId);
      if (!currentPatient) {
        throw new Error('Patient not found');
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, currentPatient.tenantId);

      // Prepare update data
      const updateData: any = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      // Personal info updates
      if (updates.personalInfo) {
        if (updates.personalInfo.firstName) updateData.first_name = updates.personalInfo.firstName;
        if (updates.personalInfo.lastName) updateData.last_name = updates.personalInfo.lastName;
        if (updates.personalInfo.firstName || updates.personalInfo.lastName) {
          const firstName = updates.personalInfo.firstName || currentPatient.personalInfo.firstName;
          const lastName = updates.personalInfo.lastName || currentPatient.personalInfo.lastName;
          updateData.full_name = `${firstName} ${lastName}`.trim();
        }
        if (updates.personalInfo.dateOfBirth)
          updateData.date_of_birth = updates.personalInfo.dateOfBirth.toISOString();
        if (updates.personalInfo.gender) updateData.gender = updates.personalInfo.gender;
        if (updates.personalInfo.cpf !== undefined) updateData.cpf = updates.personalInfo.cpf;
        if (updates.personalInfo.rg !== undefined) updateData.rg = updates.personalInfo.rg;
        if (updates.personalInfo.nationality !== undefined)
          updateData.nationality = updates.personalInfo.nationality;
        if (updates.personalInfo.maritalStatus !== undefined)
          updateData.marital_status = updates.personalInfo.maritalStatus;
        if (updates.personalInfo.profession !== undefined)
          updateData.profession = updates.personalInfo.profession;
        if (updates.personalInfo.photoUrl !== undefined)
          updateData.photo_url = updates.personalInfo.photoUrl;
      }

      // Contact info updates
      if (updates.contactInfo) {
        if (updates.contactInfo.email) updateData.email = updates.contactInfo.email;
        if (updates.contactInfo.phone) updateData.phone = updates.contactInfo.phone;
        if (updates.contactInfo.whatsapp !== undefined)
          updateData.whatsapp = updates.contactInfo.whatsapp;
        if (updates.contactInfo.preferredContactMethod)
          updateData.preferred_contact_method = updates.contactInfo.preferredContactMethod;

        if (updates.contactInfo.address) {
          if (updates.contactInfo.address.street)
            updateData.street = updates.contactInfo.address.street;
          if (updates.contactInfo.address.number)
            updateData.street_number = updates.contactInfo.address.number;
          if (updates.contactInfo.address.complement !== undefined)
            updateData.complement = updates.contactInfo.address.complement;
          if (updates.contactInfo.address.neighborhood)
            updateData.neighborhood = updates.contactInfo.address.neighborhood;
          if (updates.contactInfo.address.city) updateData.city = updates.contactInfo.address.city;
          if (updates.contactInfo.address.state)
            updateData.state = updates.contactInfo.address.state;
          if (updates.contactInfo.address.zipCode)
            updateData.zip_code = updates.contactInfo.address.zipCode;
          if (updates.contactInfo.address.country)
            updateData.country = updates.contactInfo.address.country;
        }
      }

      // Medical info updates
      if (updates.medicalInfo) {
        if (updates.medicalInfo.bloodType !== undefined)
          updateData.blood_type = updates.medicalInfo.bloodType;
        if (updates.medicalInfo.allergies) updateData.allergies = updates.medicalInfo.allergies;
        if (updates.medicalInfo.medications)
          updateData.medications = updates.medicalInfo.medications;
        if (updates.medicalInfo.medicalConditions)
          updateData.medical_conditions = updates.medicalInfo.medicalConditions;
        if (updates.medicalInfo.familyHistory)
          updateData.family_history = updates.medicalInfo.familyHistory;
        if (updates.medicalInfo.smokingStatus)
          updateData.smoking_status = updates.medicalInfo.smokingStatus;
        if (updates.medicalInfo.alcoholConsumption)
          updateData.alcohol_consumption = updates.medicalInfo.alcoholConsumption;
        if (updates.medicalInfo.exerciseFrequency)
          updateData.exercise_frequency = updates.medicalInfo.exerciseFrequency;
        if (updates.medicalInfo.notes !== undefined)
          updateData.medical_notes = updates.medicalInfo.notes;
      }

      // Emergency contact updates
      if (updates.emergencyContact) {
        if (updates.emergencyContact.name !== undefined)
          updateData.emergency_contact_name = updates.emergencyContact.name;
        if (updates.emergencyContact.relationship !== undefined)
          updateData.emergency_contact_relationship = updates.emergencyContact.relationship;
        if (updates.emergencyContact.phone !== undefined)
          updateData.emergency_contact_phone = updates.emergencyContact.phone;
        if (updates.emergencyContact.email !== undefined)
          updateData.emergency_contact_email = updates.emergencyContact.email;
      }

      // Preferences updates
      if (updates.preferences) {
        if (updates.preferences.language) updateData.language = updates.preferences.language;
        if (updates.preferences.timezone) updateData.timezone = updates.preferences.timezone;
        if (updates.preferences.communicationPreferences) {
          updateData.communication_preferences = {
            ...currentPatient.preferences.communicationPreferences,
            ...updates.preferences.communicationPreferences,
          };
        }
        if (updates.preferences.privacySettings) {
          updateData.privacy_settings = {
            ...currentPatient.preferences.privacySettings,
            ...updates.preferences.privacySettings,
          };
        }
      }

      // Tags and metadata updates
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.metadata) {
        updateData.metadata = {
          ...currentPatient.metadata,
          ...updates.metadata,
        };
      }

      // Update patient
      const { data, error } = await this.supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        monitoring.error('Patient update failed', 'patient-service', new Error(error.message), {
          patientId,
        });
        throw new Error(error.message);
      }

      const updatedPatient = this.mapPatientFromDb(data);

      // Log patient update
      await this.logPatientHistory(
        patientId,
        'updated',
        undefined,
        currentPatient,
        updatedPatient,
        userId
      );

      monitoring.info('Patient updated successfully', 'patient-service', { patientId });

      return updatedPatient;
    } catch (error) {
      monitoring.error('Patient update error', 'patient-service', error as Error, { patientId });
      throw error;
    }
  }

  async deletePatient(patientId: string, userId: string): Promise<boolean> {
    try {
      monitoring.info('Deleting patient', 'patient-service', { patientId });

      // Get current patient
      const currentPatient = await this.getPatient(patientId, userId);
      if (!currentPatient) {
        throw new Error('Patient not found');
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, currentPatient.tenantId);

      // Soft delete (deactivate)
      const { error } = await this.supabase
        .from('patients')
        .update({
          is_active: false,
          registration_status: 'inactive',
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patientId);

      if (error) {
        monitoring.error('Patient deletion failed', 'patient-service', new Error(error.message), {
          patientId,
        });
        throw new Error(error.message);
      }

      // Log patient deletion
      await this.logPatientHistory(patientId, 'deleted', undefined, undefined, undefined, userId);

      monitoring.info('Patient deleted successfully', 'patient-service', { patientId });

      return true;
    } catch (error) {
      monitoring.error('Patient deletion error', 'patient-service', error as Error, { patientId });
      throw error;
    }
  }

  // ================================================
  // PATIENT SEARCH AND FILTERING
  // ================================================

  async searchPatients(
    filters: PatientSearchFilters,
    userId: string
  ): Promise<{ patients: Patient[]; total: number }> {
    try {
      monitoring.debug('Searching patients', 'patient-service', { filters });

      // Validate tenant access if specified
      if (filters.tenantId) {
        await this.validateTenantAccess(userId, filters.tenantId);
      }

      let query = this.supabase.from('patients').select('*', { count: 'exact' });

      // Apply filters
      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.clinicId) {
        query = query.eq('clinic_id', filters.clinicId);
      }

      if (filters.name) {
        query = query.ilike('full_name', `%${filters.name}%`);
      }

      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters.phone) {
        query = query.or(`phone.ilike.%${filters.phone}%,whatsapp.ilike.%${filters.phone}%`);
      }

      if (filters.cpf) {
        query = query.eq('cpf', filters.cpf);
      }

      if (filters.status) {
        query = query.eq('registration_status', filters.status);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.dateOfBirthFrom) {
        query = query.gte('date_of_birth', filters.dateOfBirthFrom.toISOString());
      }

      if (filters.dateOfBirthTo) {
        query = query.lte('date_of_birth', filters.dateOfBirthTo.toISOString());
      }

      if (filters.createdFrom) {
        query = query.gte('created_at', filters.createdFrom.toISOString());
      }

      if (filters.createdTo) {
        query = query.lte('created_at', filters.createdTo.toISOString());
      }

      if (filters.loyaltyLevel) {
        query = query.eq('loyalty_level', filters.loyaltyLevel);
      }

      if (filters.riskLevel) {
        query = query.eq('risk_level', filters.riskLevel);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        monitoring.error('Patient search failed', 'patient-service', new Error(error.message), {
          filters,
        });
        throw new Error(error.message);
      }

      const patients = data.map(this.mapPatientFromDb);

      monitoring.debug('Patient search completed', 'patient-service', {
        resultCount: patients.length,
        totalCount: count,
      });

      return { patients, total: count || 0 };
    } catch (error) {
      monitoring.error('Patient search error', 'patient-service', error as Error, { filters });
      throw error;
    }
  }

  async getPatientsByClinic(clinicId: string, userId: string): Promise<Patient[]> {
    const { patients } = await this.searchPatients({ clinicId, limit: 1000 }, userId);
    return patients;
  }

  async getPatientsByTenant(tenantId: string, userId: string): Promise<Patient[]> {
    const { patients } = await this.searchPatients({ tenantId, limit: 1000 }, userId);
    return patients;
  }

  // ================================================
  // PATIENT HISTORY AND AUDIT
  // ================================================

  async getPatientHistory(patientId: string, userId: string): Promise<PatientHistory[]> {
    try {
      monitoring.debug('Getting patient history', 'patient-service', { patientId });

      // Validate access to patient
      const patient = await this.getPatient(patientId, userId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const { data, error } = await this.supabase
        .from('patient_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(this.mapPatientHistoryFromDb);
    } catch (error) {
      monitoring.error('Get patient history error', 'patient-service', error as Error, {
        patientId,
      });
      throw error;
    }
  }

  // ================================================
  // CONSENT MANAGEMENT
  // ================================================

  async recordConsent(
    patientId: string,
    consentType: string,
    consentGiven: boolean,
    consentText: string,
    version: string,
    userId: string,
    clientInfo?: { ipAddress?: string; userAgent?: string }
  ): Promise<PatientConsent> {
    try {
      monitoring.info('Recording patient consent', 'patient-service', {
        patientId,
        consentType,
        consentGiven,
      });

      // Validate access to patient
      const patient = await this.getPatient(patientId, userId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const { data, error } = await this.supabase
        .from('patient_consents')
        .insert({
          patient_id: patientId,
          consent_type: consentType,
          consent_given: consentGiven,
          consent_text: consentText,
          version,
          ip_address: clientInfo?.ipAddress,
          user_agent: clientInfo?.userAgent,
          recorded_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const consent = this.mapPatientConsentFromDb(data);

      // Log consent recording
      await this.logPatientHistory(
        patientId,
        'consent_recorded',
        `consent_${consentType}`,
        undefined,
        { consentGiven, version },
        userId
      );

      monitoring.info('Patient consent recorded', 'patient-service', {
        patientId,
        consentId: consent.id,
        consentType,
      });

      return consent;
    } catch (error) {
      monitoring.error('Record consent error', 'patient-service', error as Error, {
        patientId,
        consentType,
      });
      throw error;
    }
  }

  async getPatientConsents(patientId: string, userId: string): Promise<PatientConsent[]> {
    try {
      // Validate access to patient
      const patient = await this.getPatient(patientId, userId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const { data, error } = await this.supabase
        .from('patient_consents')
        .select('*')
        .eq('patient_id', patientId)
        .order('consent_date', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data.map(this.mapPatientConsentFromDb);
    } catch (error) {
      monitoring.error('Get patient consents error', 'patient-service', error as Error, {
        patientId,
      });
      throw error;
    }
  }

  // ================================================
  // ANALYTICS AND STATISTICS
  // ================================================

  async getPatientStats(
    tenantId: string,
    userId: string
  ): Promise<{
    totalPatients: number;
    activePatients: number;
    newPatientsThisMonth: number;
    patientsByLoyaltyLevel: Record<string, number>;
    patientsByRiskLevel: Record<string, number>;
    averageAge: number;
    genderDistribution: Record<string, number>;
  }> {
    try {
      monitoring.debug('Getting patient statistics', 'patient-service', { tenantId });

      // Validate tenant access
      await this.validateTenantAccess(userId, tenantId);

      // Get total and active patients
      const { count: totalPatients } = await this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      const { count: activePatients } = await this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Get new patients this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newPatientsThisMonth } = await this.supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startOfMonth.toISOString());

      // Get patients for detailed analysis
      const { data: patients } = await this.supabase
        .from('patients')
        .select('loyalty_level, risk_level, date_of_birth, gender')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      // Analyze loyalty levels
      const patientsByLoyaltyLevel =
        patients?.reduce(
          (acc, patient) => {
            acc[patient.loyalty_level] = (acc[patient.loyalty_level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      // Analyze risk levels
      const patientsByRiskLevel =
        patients?.reduce(
          (acc, patient) => {
            acc[patient.risk_level] = (acc[patient.risk_level] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      // Calculate average age
      const currentYear = new Date().getFullYear();
      const ages =
        patients?.map((patient) => currentYear - new Date(patient.date_of_birth).getFullYear()) ||
        [];
      const averageAge =
        ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;

      // Analyze gender distribution
      const genderDistribution =
        patients?.reduce(
          (acc, patient) => {
            acc[patient.gender] = (acc[patient.gender] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      return {
        totalPatients: totalPatients || 0,
        activePatients: activePatients || 0,
        newPatientsThisMonth: newPatientsThisMonth || 0,
        patientsByLoyaltyLevel,
        patientsByRiskLevel,
        averageAge,
        genderDistribution,
      };
    } catch (error) {
      monitoring.error('Get patient stats error', 'patient-service', error as Error, { tenantId });
      throw error;
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private async validateTenantAccess(userId: string, tenantId: string): Promise<void> {
    // Implementation would validate user has access to tenant
    // For now, we'll assume the auth service handles this
  }

  private async findDuplicatePatient(request: PatientCreateRequest): Promise<Patient | null> {
    try {
      let query = this.supabase
        .from('patients')
        .select('*')
        .eq('tenant_id', request.tenantId)
        .eq('is_active', true);

      // Check by email or CPF
      if (request.personalInfo.cpf) {
        query = query.or(
          `email.eq.${request.contactInfo.email},cpf.eq.${request.personalInfo.cpf}`
        );
      } else {
        query = query.eq('email', request.contactInfo.email);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return null;
      }

      return this.mapPatientFromDb(data);
    } catch (error) {
      return null;
    }
  }

  private async logPatientHistory(
    patientId: string,
    action: string,
    fieldChanged?: string,
    oldValue?: any,
    newValue?: any,
    userId?: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.supabase.from('patient_history').insert({
        patient_id: patientId,
        action,
        field_changed: fieldChanged,
        old_value: oldValue,
        new_value: newValue,
        changed_by: userId,
        reason,
      });
    } catch (error) {
      monitoring.error('Log patient history error', 'patient-service', error as Error, {
        patientId,
        action,
      });
    }
  }

  private mapPatientFromDb(data: any): Patient {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      clinicId: data.clinic_id,
      personalInfo: {
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.full_name,
        dateOfBirth: new Date(data.date_of_birth),
        gender: data.gender,
        cpf: data.cpf,
        rg: data.rg,
        nationality: data.nationality,
        maritalStatus: data.marital_status,
        profession: data.profession,
        photoUrl: data.photo_url,
      },
      contactInfo: {
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: {
          street: data.street,
          number: data.street_number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zip_code,
          country: data.country,
        },
        preferredContactMethod: data.preferred_contact_method,
      },
      medicalInfo: {
        bloodType: data.blood_type,
        allergies: data.allergies || [],
        medications: data.medications || [],
        medicalConditions: data.medical_conditions || [],
        familyHistory: data.family_history || [],
        smokingStatus: data.smoking_status,
        alcoholConsumption: data.alcohol_consumption,
        exerciseFrequency: data.exercise_frequency,
        notes: data.medical_notes,
      },
      emergencyContact: {
        name: data.emergency_contact_name,
        relationship: data.emergency_contact_relationship,
        phone: data.emergency_contact_phone,
        email: data.emergency_contact_email,
      },
      preferences: {
        language: data.language,
        timezone: data.timezone,
        communicationPreferences: data.communication_preferences,
        privacySettings: data.privacy_settings,
      },
      status: {
        isActive: data.is_active,
        registrationStatus: data.registration_status,
        lastVisit: data.last_visit ? new Date(data.last_visit) : undefined,
        totalVisits: data.total_visits,
        totalSpent: data.total_spent,
        loyaltyLevel: data.loyalty_level,
        riskLevel: data.risk_level,
      },
      tags: data.tags || [],
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapPatientHistoryFromDb(data: any): PatientHistory {
    return {
      id: data.id,
      patientId: data.patient_id,
      action: data.action,
      fieldChanged: data.field_changed,
      oldValue: data.old_value,
      newValue: data.new_value,
      changedBy: data.changed_by,
      changedAt: new Date(data.changed_at),
      reason: data.reason,
    };
  }

  private mapPatientConsentFromDb(data: any): PatientConsent {
    return {
      id: data.id,
      patientId: data.patient_id,
      consentType: data.consent_type,
      consentGiven: data.consent_given,
      consentDate: new Date(data.consent_date),
      consentText: data.consent_text,
      version: data.version,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      witnessId: data.witness_id,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      revokedAt: data.revoked_at ? new Date(data.revoked_at) : undefined,
      revokedBy: data.revoked_by,
      revokedReason: data.revoked_reason,
    };
  }
}

// ================================================
// PATIENT SERVICE INSTANCE
// ================================================

export const patientService = PatientService.getInstance();
