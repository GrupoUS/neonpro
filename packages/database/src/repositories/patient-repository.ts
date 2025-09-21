import { SupabaseClient } from "@supabase/supabase-js";
import { 
  Patient, 
  PatientRepository as IPatientRepository,
  PatientFilter,
  PatientQueryOptions,
  PatientSearchResult,
  CreatePatientRequest,
  UpdatePatientRequest 
} from "@neonpro/domain";
import { DatabasePatient } from "../types/supabase.js";

/**
 * Supabase implementation of PatientRepository
 * Handles all patient data access operations with proper error handling and validation
 */
export class PatientRepository implements IPatientRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from("patients")
        .select(`
          *,
          clinic:clinics(id, name),
          appointments(count)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("PatientRepository.findById error:", error);
        return null;
      }

      if (!data) return null;

      return this.mapDatabasePatientToDomain(data);
    } catch (error) {
      console.error("PatientRepository.findById error:", error);
      return null;
    }
  }

  async findByMedicalRecordNumber(medicalRecordNumber: string): Promise<Patient | null> {
    try {
      const { data, error } = await this.supabase
        .from("patients")
        .select("*")
        .eq("medical_record_number", medicalRecordNumber)
        .single();

      if (error || !data) return null;

      return this.mapDatabasePatientToDomain(data);
    } catch (error) {
      console.error("PatientRepository.findByMedicalRecordNumber error:", error);
      return null;
    }
  }

  async findByClinicId(clinicId: string, options?: PatientQueryOptions): Promise<PatientSearchResult> {
    try {
      let query = this.supabase
        .from("patients")
        .select("*", { count: "exact" })
        .eq("clinic_id", clinicId);

      // Apply filters
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.search) {
        query = query.or(
          `full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,cpf.ilike.%${options.search}%`
        );
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("PatientRepository.findByClinicId error:", error);
        return { patients: [], total: 0 };
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : [];

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("PatientRepository.findByClinicId error:", error);
      return { patients: [], total: 0 };
    }
  }

  async findWithFilter(filter: PatientFilter, options?: PatientQueryOptions): Promise<PatientSearchResult> {
    try {
      let query = this.supabase
        .from("patients")
        .select("*", { count: "exact" });

      // Apply filters
      if (filter.clinicId) {
        query = query.eq("clinic_id", filter.clinicId);
      }

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      if (filter.gender) {
        query = query.eq("gender", filter.gender);
      }

      if (filter.birthDateRange) {
        query = query
          .gte("birth_date", filter.birthDateRange.start.toISOString())
          .lte("birth_date", filter.birthDateRange.end.toISOString());
      }

      if (filter.search) {
        query = query.or(
          `full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,cpf.ilike.%${filter.search}%`
        );
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        query = query.order(options.sortBy, { ascending: sortOrder });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("PatientRepository.findWithFilter error:", error);
        return { patients: [], total: 0 };
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : [];

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("PatientRepository.findWithFilter error:", error);
      return { patients: [], total: 0 };
    }
  }

  async create(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const dbPatient = this.mapCreateRequestToDatabase(patientData);

      const { data, error } = await this.supabase
        .from("patients")
        .insert(dbPatient)
        .select()
        .single();

      if (error) {
        console.error("PatientRepository.create error:", error);
        throw new Error(`Failed to create patient: ${error.message}`);
      }

      return this.mapDatabasePatientToDomain(data);
    } catch (error) {
      console.error("PatientRepository.create error:", error);
      throw error;
    }
  }

  async update(id: string, patientData: UpdatePatientRequest): Promise<Patient> {
    try {
      const updateData = this.mapUpdateRequestToDatabase(patientData);

      const { data, error } = await this.supabase
        .from("patients")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("PatientRepository.update error:", error);
        throw new Error(`Failed to update patient: ${error.message}`);
      }

      return this.mapDatabasePatientToDomain(data);
    } catch (error) {
      console.error("PatientRepository.update error:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("PatientRepository.delete error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("PatientRepository.delete error:", error);
      return false;
    }
  }

  async search(query: string, clinicId?: string, options?: PatientQueryOptions): Promise<PatientSearchResult> {
    try {
      let dbQuery = this.supabase
        .from("patients")
        .select("*", { count: "exact" });

      // Build search query
      const searchCondition = `full_name.ilike.%${query}%,email.ilike.%${query}%,cpf.ilike.%${query}%,medical_record_number.ilike.%${query}%`;
      
      if (clinicId) {
        dbQuery = dbQuery.eq("clinic_id", clinicId);
      }

      dbQuery = dbQuery.or(searchCondition);

      // Apply pagination
      if (options?.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }

      if (options?.offset) {
        dbQuery = dbQuery.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply sorting
      if (options?.sortBy) {
        const sortOrder = options.sortOrder === "desc" ? false : true;
        dbQuery = dbQuery.order(options.sortBy, { ascending: sortOrder });
      } else {
        dbQuery = dbQuery.order("created_at", { ascending: false });
      }

      const { data, error, count } = await dbQuery;

      if (error) {
        console.error("PatientRepository.search error:", error);
        return { patients: [], total: 0 };
      }

      const patients = data ? data.map(this.mapDatabasePatientToDomain) : [];

      return {
        patients,
        total: count || 0,
        limit: options?.limit || 10,
        offset: options?.offset || 0
      };
    } catch (error) {
      console.error("PatientRepository.search error:", error);
      return { patients: [], total: 0 };
    }
  }

  async count(filter: PatientFilter): Promise<number> {
    try {
      let query = this.supabase
        .from("patients")
        .select("*", { count: "exact", head: true });

      if (filter.clinicId) {
        query = query.eq("clinic_id", filter.clinicId);
      }

      if (filter.status) {
        query = query.eq("status", filter.status);
      }

      if (filter.gender) {
        query = query.eq("gender", filter.gender);
      }

      if (filter.birthDateRange) {
        query = query
          .gte("birth_date", filter.birthDateRange.start.toISOString())
          .lte("birth_date", filter.birthDateRange.end.toISOString());
      }

      const { count, error } = await query;

      if (error) {
        console.error("PatientRepository.count error:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("PatientRepository.count error:", error);
      return 0;
    }
  }

  /**
   * Maps database patient to domain patient
   */
  private mapDatabasePatientToDomain(dbPatient: DatabasePatient): Patient {
    return {
      id: dbPatient.id,
      clinicId: dbPatient.clinic_id,
      medicalRecordNumber: dbPatient.medical_record_number,
      externalIds: dbPatient.external_ids || {},
      givenNames: dbPatient.given_names || [],
      familyName: dbPatient.family_name || "",
      fullName: dbPatient.full_name || "",
      preferredName: dbPatient.preferred_name || undefined,
      phonePrimary: dbPatient.phone_primary || undefined,
      phoneSecondary: dbPatient.phone_secondary || undefined,
      email: dbPatient.email || undefined,
      addressLine1: dbPatient.address_line1 || undefined,
      addressLine2: dbPatient.address_line2 || undefined,
      city: dbPatient.city || undefined,
      state: dbPatient.state || undefined,
      postalCode: dbPatient.postal_code || undefined,
      country: dbPatient.country || undefined,
      birthDate: dbPatient.birth_date || undefined,
      gender: dbPatient.gender || undefined,
      maritalStatus: dbPatient.marital_status || undefined,
      isActive: dbPatient.is_active !== false,
      deceasedIndicator: dbPatient.deceased_indicator || false,
      deceasedDate: dbPatient.deceased_date || undefined,
      dataConsentStatus: dbPatient.data_consent_status || undefined,
      dataConsentDate: dbPatient.data_consent_date || undefined,
      dataRetentionUntil: dbPatient.data_retention_until || undefined,
      dataSource: dbPatient.data_source || undefined,
      createdAt: dbPatient.created_at,
      updatedAt: dbPatient.updated_at,
      createdBy: dbPatient.created_by || undefined,
      updatedBy: dbPatient.updated_by || undefined,
      photoUrl: dbPatient.photo_url || undefined,
      cpf: dbPatient.cpf || undefined,
      rg: dbPatient.rg || undefined,
      passportNumber: dbPatient.passport_number || undefined,
      preferredContactMethod: dbPatient.preferred_contact_method || undefined,
      bloodType: dbPatient.blood_type || undefined,
      allergies: dbPatient.allergies || [],
      chronicConditions: dbPatient.chronic_conditions || [],
      currentMedications: dbPatient.current_medications || [],
      insuranceProvider: dbPatient.insurance_provider || undefined,
      insuranceNumber: dbPatient.insurance_number || undefined,
      insurancePlan: dbPatient.insurance_plan || undefined,
      emergencyContactName: dbPatient.emergency_contact_name || undefined,
      emergencyContactPhone: dbPatient.emergency_contact_phone || undefined,
      emergencyContactRelationship: dbPatient.emergency_contact_relationship || undefined,
      lgpdConsentGiven: dbPatient.lgpd_consent_given || false
    };
  }

  /**
   * Maps create request to database format
   */
  private mapCreateRequestToDatabase(request: CreatePatientRequest): Partial<DatabasePatient> {
    return {
      clinic_id: request.clinicId,
      medical_record_number: request.medicalRecordNumber,
      external_ids: request.externalIds,
      given_names: request.givenNames,
      family_name: request.familyName,
      full_name: request.fullName,
      preferred_name: request.preferredName,
      phone_primary: request.phonePrimary,
      phone_secondary: request.phoneSecondary,
      email: request.email,
      address_line1: request.addressLine1,
      address_line2: request.addressLine2,
      city: request.city,
      state: request.state,
      postal_code: request.postalCode,
      country: request.country,
      birth_date: request.birthDate,
      gender: request.gender,
      marital_status: request.maritalStatus,
      is_active: request.isActive !== false,
      deceased_indicator: request.deceasedIndicator,
      deceased_date: request.deceasedDate,
      data_consent_status: request.dataConsentStatus,
      data_consent_date: request.dataConsentDate,
      data_retention_until: request.dataRetentionUntil,
      data_source: request.dataSource,
      created_by: request.createdBy,
      photo_url: request.photoUrl,
      cpf: request.cpf,
      rg: request.rg,
      passport_number: request.passportNumber,
      preferred_contact_method: request.preferredContactMethod,
      blood_type: request.bloodType,
      allergies: request.allergies,
      chronic_conditions: request.chronicConditions,
      current_medications: request.currentMedications,
      insurance_provider: request.insuranceProvider,
      insurance_number: request.insuranceNumber,
      insurance_plan: request.insurancePlan,
      emergency_contact_name: request.emergencyContactName,
      emergency_contact_phone: request.emergencyContactPhone,
      emergency_contact_relationship: request.emergencyContactRelationship,
      lgpd_consent_given: request.lgpdConsentGiven || false
    };
  }

  /**
   * Maps update request to database format
   */
  private mapUpdateRequestToDatabase(request: UpdatePatientRequest): Partial<DatabasePatient> {
    const updateData: Partial<DatabasePatient> = {};

    if (request.familyName !== undefined) updateData.family_name = request.familyName;
    if (request.fullName !== undefined) updateData.full_name = request.fullName;
    if (request.preferredName !== undefined) updateData.preferred_name = request.preferredName;
    if (request.phonePrimary !== undefined) updateData.phone_primary = request.phonePrimary;
    if (request.phoneSecondary !== undefined) updateData.phone_secondary = request.phoneSecondary;
    if (request.email !== undefined) updateData.email = request.email;
    if (request.addressLine1 !== undefined) updateData.address_line1 = request.addressLine1;
    if (request.addressLine2 !== undefined) updateData.address_line2 = request.addressLine2;
    if (request.city !== undefined) updateData.city = request.city;
    if (request.state !== undefined) updateData.state = request.state;
    if (request.postalCode !== undefined) updateData.postal_code = request.postalCode;
    if (request.country !== undefined) updateData.country = request.country;
    if (request.gender !== undefined) updateData.gender = request.gender;
    if (request.maritalStatus !== undefined) updateData.marital_status = request.maritalStatus;
    if (request.isActive !== undefined) updateData.is_active = request.isActive;
    if (request.deceasedIndicator !== undefined) updateData.deceased_indicator = request.deceasedIndicator;
    if (request.deceasedDate !== undefined) updateData.deceased_date = request.deceasedDate;
    if (request.dataConsentStatus !== undefined) updateData.data_consent_status = request.dataConsentStatus;
    if (request.dataConsentDate !== undefined) updateData.data_consent_date = request.dataConsentDate;
    if (request.dataRetentionUntil !== undefined) updateData.data_retention_until = request.dataRetentionUntil;
    if (request.photoUrl !== undefined) updateData.photo_url = request.photoUrl;
    if (request.rg !== undefined) updateData.rg = request.rg;
    if (request.passportNumber !== undefined) updateData.passport_number = request.passportNumber;
    if (request.preferredContactMethod !== undefined) updateData.preferred_contact_method = request.preferredContactMethod;
    if (request.bloodType !== undefined) updateData.blood_type = request.bloodType;
    if (request.allergies !== undefined) updateData.allergies = request.allergies;
    if (request.chronicConditions !== undefined) updateData.chronic_conditions = request.chronicConditions;
    if (request.currentMedications !== undefined) updateData.current_medications = request.currentMedications;
    if (request.insuranceProvider !== undefined) updateData.insurance_provider = request.insuranceProvider;
    if (request.insuranceNumber !== undefined) updateData.insurance_number = request.insuranceNumber;
    if (request.insurancePlan !== undefined) updateData.insurance_plan = request.insurancePlan;
    if (request.emergencyContactName !== undefined) updateData.emergency_contact_name = request.emergencyContactName;
    if (request.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = request.emergencyContactPhone;
    if (request.emergencyContactRelationship !== undefined) updateData.emergency_contact_relationship = request.emergencyContactRelationship;
    if (request.lgpdConsentGiven !== undefined) updateData.lgpd_consent_given = request.lgpdConsentGiven;

    return updateData;
  }
}