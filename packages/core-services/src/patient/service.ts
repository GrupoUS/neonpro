import { differenceInYears } from 'date-fns';
import { PatientStatus } from '../types';
import type {
  AestheticHistory,
  ConsentForm,
  CreatePatientData,
  MedicalHistory,
  Patient,
  SkinAssessment,
  UpdatePatientData,
} from './types';

export type PatientRepository = {
  // Patient CRUD operations
  createPatient(data: CreatePatientData): Promise<Patient>;
  updatePatient(id: string, data: UpdatePatientData): Promise<Patient>;
  getPatient(id: string): Promise<Patient | null>;
  getPatientByEmail(email: string): Promise<Patient | null>;
  getPatients(filters?: PatientFilters): Promise<Patient[]>;
  deletePatient(id: string): Promise<void>;

  // Medical history operations
  updateMedicalHistory(
    patientId: string,
    history: MedicalHistory
  ): Promise<void>;
  updateAestheticHistory(
    patientId: string,
    history: AestheticHistory
  ): Promise<void>;
  updateSkinAssessment(
    patientId: string,
    assessment: SkinAssessment
  ): Promise<void>;

  // Consent form operations
  addConsentForm(patientId: string, form: ConsentForm): Promise<void>;
  getConsentForms(patientId: string): Promise<ConsentForm[]>;

  // Search and analytics
  searchPatients(query: string): Promise<Patient[]>;
  getPatientStats(): Promise<PatientStats>;
};

export type PatientFilters = {
  status?: PatientStatus;
  ageRange?: { min: number; max: number };
  gender?: string;
  tags?: string[];
  city?: string;
  limit?: number;
  offset?: number;
};
export type PatientStats = {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  averageAge: number;
  genderDistribution: { male: number; female: number; other: number };
  topReferralSources: { source: string; count: number }[];
  patientsByStatus: { status: PatientStatus; count: number }[];
};

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  // Patient management
  async createPatient(data: CreatePatientData): Promise<Patient> {
    // Check if patient already exists
    const existingPatient = await this.repository.getPatientByEmail(data.email);
    if (existingPatient) {
      throw new Error('Patient with this email already exists');
    }

    // Validate age (must be 18+ for aesthetic treatments)
    const age = differenceInYears(new Date(), data.dateOfBirth);
    if (age < 18) {
      throw new Error(
        'Patient must be 18 years or older for aesthetic treatments'
      );
    }

    const patient = await this.repository.createPatient(data);
    return patient;
  }

  async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    const existingPatient = await this.repository.getPatient(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email !== existingPatient.email) {
      const emailExists = await this.repository.getPatientByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new Error('Another patient with this email already exists');
      }
    }

    const patient = await this.repository.updatePatient(id, data);
    return patient;
  }
  async getPatient(id: string): Promise<Patient | null> {
    return this.repository.getPatient(id);
  }

  async getPatientByEmail(email: string): Promise<Patient | null> {
    return this.repository.getPatientByEmail(email);
  }

  async getPatients(filters?: PatientFilters): Promise<Patient[]> {
    return this.repository.getPatients(filters);
  }

  async deactivatePatient(id: string, reason?: string): Promise<void> {
    await this.repository.updatePatient(id, {
      id,
      status: PatientStatus.INACTIVE,
      notes: reason ? `Deactivated: ${reason}` : 'Patient deactivated',
    });
  }

  async blockPatient(id: string, reason: string): Promise<void> {
    await this.repository.updatePatient(id, {
      id,
      status: PatientStatus.BLOCKED,
      notes: `Blocked: ${reason}`,
    });
  }

  // Medical history management
  async updateMedicalHistory(
    patientId: string,
    history: MedicalHistory
  ): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.repository.updateMedicalHistory(patientId, history);
  }

  async updateAestheticHistory(
    patientId: string,
    history: AestheticHistory
  ): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.repository.updateAestheticHistory(patientId, history);
  }

  async updateSkinAssessment(
    patientId: string,
    assessment: SkinAssessment
  ): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.repository.updateSkinAssessment(patientId, assessment);
  } // Consent form management
  async addConsentForm(patientId: string, form: ConsentForm): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    await this.repository.addConsentForm(patientId, form);
  }

  async getConsentForms(patientId: string): Promise<ConsentForm[]> {
    return this.repository.getConsentForms(patientId);
  }

  async hasValidConsent(
    patientId: string,
    treatmentType: string
  ): Promise<boolean> {
    const consentForms = await this.repository.getConsentForms(patientId);
    return consentForms.some(
      (form) =>
        form.treatmentType === treatmentType && form.isActive && form.signedDate
    );
  }

  // Search and analytics
  async searchPatients(query: string): Promise<Patient[]> {
    return this.repository.searchPatients(query);
  }

  async getPatientStats(): Promise<PatientStats> {
    return this.repository.getPatientStats();
  }

  async getPatientAge(patientId: string): Promise<number | null> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      return null;
    }

    return differenceInYears(new Date(), patient.dateOfBirth);
  }

  async getPatientsByAge(minAge: number, maxAge: number): Promise<Patient[]> {
    const patients = await this.repository.getPatients();
    return patients.filter((patient) => {
      const age = differenceInYears(new Date(), patient.dateOfBirth);
      return age >= minAge && age <= maxAge;
    });
  }

  async getPatientsByTags(tags: string[]): Promise<Patient[]> {
    return this.repository.getPatients({ tags });
  }

  async addPatientTag(patientId: string, tag: string): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    if (!patient.tags.includes(tag)) {
      const updatedTags = [...patient.tags, tag];
      await this.repository.updatePatient(patientId, {
        id: patientId,
        tags: updatedTags,
      });
    }
  }

  async removePatientTag(patientId: string, tag: string): Promise<void> {
    const patient = await this.repository.getPatient(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const updatedTags = patient.tags.filter((t) => t !== tag);
    await this.repository.updatePatient(patientId, {
      id: patientId,
      tags: updatedTags,
    });
  }
}
