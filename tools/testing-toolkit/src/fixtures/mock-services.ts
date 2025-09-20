/**
 * Mock Services
 *
 * Provides mock implementations of services for testing.
 */

import type { MockClinic, MockPatient } from './healthcare-data';
import type { MockSession, MockUser } from './user-data';

export class MockAuthService {
  private users: Map<string, MockUser> = new Map();
  private sessions: Map<string, MockSession> = new Map();

  addUser(user: MockUser): void {
    this.users.set(user.email, user);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: MockUser; token: string } | null> {
    const user = this.users.get(email);

    if (!user || !user.active) {
      return null;
    }

    // Simple password validation for testing
    if (password === 'password' || password === 'test123') {
      const token = `mock-token-${Date.now()}`;
      const session: MockSession = {
        id: `session-${Date.now()}`,
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdAt: new Date(),
      };

      this.sessions.set(token, session);
      return { user, token };
    }

    return null;
  }

  async validateToken(token: string): Promise<MockUser | null> {
    const session = this.sessions.get(token);

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return (
      Array.from(this.users.values()).find(
        user => user.id === session.userId,
      ) || null
    );
  }

  async logout(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  reset(): void {
    this.users.clear();
    this.sessions.clear();
  }
}

export class MockPatientService {
  private patients: Map<string, MockPatient> = new Map();

  addPatient(patient: MockPatient): void {
    this.patients.set(patient.id, patient);
  }

  async getPatient(id: string): Promise<MockPatient | null> {
    return this.patients.get(id) || null;
  }

  async getPatientsByClinic(clinicId: string): Promise<MockPatient[]> {
    return Array.from(this.patients.values()).filter(
      p => p.clinicId === clinicId,
    );
  }

  async createPatient(patientData: Partial<MockPatient>): Promise<MockPatient> {
    const patient: MockPatient = {
      id: `patient-${Date.now()}`,
      name: '',
      email: '',
      cpf: '',
      birthDate: new Date(),
      clinicId: '',
      consentGiven: false,
      dataProcessingPurpose: '',
      auditTrail: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...patientData,
    } as MockPatient;

    this.patients.set(patient.id, patient);
    return patient;
  }

  async updatePatient(
    id: string,
    updates: Partial<MockPatient>,
  ): Promise<MockPatient | null> {
    const patient = this.patients.get(id);

    if (!patient) {
      return null;
    }

    const updatedPatient = {
      ...patient,
      ...updates,
      updatedAt: new Date(),
    };

    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<boolean> {
    return this.patients.delete(id);
  }

  reset(): void {
    this.patients.clear();
  }
}

export class MockClinicService {
  private clinics: Map<string, MockClinic> = new Map();

  addClinic(clinic: MockClinic): void {
    this.clinics.set(clinic.id, clinic);
  }

  async getClinic(id: string): Promise<MockClinic | null> {
    return this.clinics.get(id) || null;
  }

  async getAllClinics(): Promise<MockClinic[]> {
    return Array.from(this.clinics.values());
  }

  reset(): void {
    this.clinics.clear();
  }
}

// Global mock service instances
export const mockAuthService = new MockAuthService();
export const mockPatientService = new MockPatientService();
export const mockClinicService = new MockClinicService();
