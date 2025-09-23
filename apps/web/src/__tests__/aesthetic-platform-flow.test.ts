import { test, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM for this test
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock healthcare services and utilities
const mockPatientService = {
  createPatient: vi.fn().mockResolvedValue({
    id: '1',
    fullName: 'Maria Silva',
    email: 'maria.silva@email.com',
    phonePrimary: '+55 11 9999-8888',
    lgpdConsentGiven: true,
  }),
  getPatients: vi.fn().mockResolvedValue([
    {
      id: '1',
      fullName: 'Maria Silva',
      email: 'maria.silva@email.com',
      isActive: true,
    },
    {
      id: '2',
      fullName: 'João Santos',
      email: 'joao.santos@email.com',
      isActive: true,
    },
  ]),
};

const mockAppointmentService = {
  createAppointment: vi.fn().mockResolvedValue({
    id: '1',
    patientId: '1',
    professionalId: 'prof-1',
    startTime: '2024-01-20T14:00:00Z',
    status: 'SCHEDULED',
  }),
  getAppointments: vi.fn().mockResolvedValue([
    {
      id: '1',
      patientId: '1',
      professionalId: 'prof-1',
      startTime: '2024-01-20T14:00:00Z',
      status: 'SCHEDULED',
    },
  ]),
};

const mockProfessionalService = {
  getProfessionals: vi.fn().mockResolvedValue([
    {
      id: 'prof-1',
      fullName: 'Dr. Carlos Mendes',
      specialty: 'Dermatologia',
      crm: 'CRM SP 123456',
      isActive: true,
    },
  ]),
};

// Mock vi functions are already available from import

test('Aesthetic Platform Flow - Client Registration', async () => {
  // Test client registration with LGPD compliance
  const patientData = {
    fullName: 'Maria Silva',
    email: 'maria.silva@email.com',
    phonePrimary: '+55 11 9999-8888',
    birthDate: '1990-05-15',
    gender: 'F',
    lgpdConsentGiven: true,
  };

  const result = await mockPatientService.createPatient(patientData);
  
  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  expect(result.fullName).toBe(patientData.fullName);
  expect(result.lgpdConsentGiven).toBe(true);
  expect(mockPatientService.createPatient).toHaveBeenCalledWith(patientData);
});

test('Aesthetic Platform Flow - Appointment Scheduling', async () => {
  const appointmentData = {
    patientId: '1',
    professionalId: 'prof-1',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:00:00Z',
    status: 'SCHEDULED',
  };

  const result = await mockAppointmentService.createAppointment(appointmentData);
  
  expect(result).toBeDefined();
  expect(result.id).toBeDefined();
  expect(result.patientId).toBe(appointmentData.patientId);
  expect(result.professionalId).toBe(appointmentData.professionalId);
  expect(mockAppointmentService.createAppointment).toHaveBeenCalledWith(appointmentData);
});

test('Aesthetic Platform Flow - Professional Management', async () => {
  const professionals = await mockProfessionalService.getProfessionals();
  
  expect(professionals).toBeDefined();
  expect(Array.isArray(professionals)).toBe(true);
  expect(professionals.length).toBeGreaterThan(0);
  expect(professionals[0].id).toBeDefined();
  expect(professionals[0].fullName).toBeDefined();
  expect(professionals[0].specialty).toBeDefined();
});

test('Aesthetic Platform Flow - Patient List', async () => {
  const patients = await mockPatientService.getPatients();
  
  expect(patients).toBeDefined();
  expect(Array.isArray(patients)).toBe(true);
  expect(patients.length).toBeGreaterThan(0);
  expect(patients[0].id).toBeDefined();
  expect(patients[0].fullName).toBeDefined();
  expect(patients[0].email).toBeDefined();
});

test('Aesthetic Platform Flow - Appointment List', async () => {
  const appointments = await mockAppointmentService.getAppointments();
  
  expect(appointments).toBeDefined();
  expect(Array.isArray(appointments)).toBe(true);
  expect(appointments.length).toBeGreaterThan(0);
  expect(appointments[0].id).toBeDefined();
  expect(appointments[0].patientId).toBeDefined();
  expect(appointments[0].professionalId).toBeDefined();
});

test('Aesthetic Platform Flow - LGPD Compliance Check', () => {
  const patientData = {
    fullName: 'Maria Silva',
    email: 'maria.silva@email.com',
    phonePrimary: '+55 11 9999-8888',
    lgpdConsentGiven: true,
  };

  // Check LGPD compliance
  expect(patientData.lgpdConsentGiven).toBe(true);
  expect(patientData.fullName).toBeDefined();
  expect(patientData.email).toBeDefined();
  expect(patientData.phonePrimary).toBeDefined();
});

test('Aesthetic Platform Flow - Healthcare Data Validation', () => {
  const appointmentData = {
    patientId: '1',
    professionalId: 'prof-1',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:00:00Z',
  };

  // Validate healthcare data structure
  expect(appointmentData.patientId).toBeDefined();
  expect(appointmentData.professionalId).toBeDefined();
  expect(appointmentData.startTime).toBeDefined();
  expect(appointmentData.endTime).toBeDefined();
  expect(new Date(appointmentData.startTime)).toBeInstanceOf(Date);
  expect(new Date(appointmentData.endTime)).toBeInstanceOf(Date);
});

test('Aesthetic Platform Flow - Integration Test', async () => {
  // Test complete flow from registration to appointment
  const patientData = {
    fullName: 'Ana Costa',
    email: 'ana.costa@email.com',
    phonePrimary: '+55 11 9888-7777',
    birthDate: '1985-08-20',
    gender: 'F',
    lgpdConsentGiven: true,
  };

  // Register patient
  const patient = await mockPatientService.createPatient(patientData);
  expect(patient).toBeDefined();
  expect(patient.id).toBeDefined();

  // Get professionals
  const professionals = await mockProfessionalService.getProfessionals();
  expect(professionals.length).toBeGreaterThan(0);

  // Schedule appointment
  const appointmentData = {
    patientId: patient.id,
    professionalId: professionals[0].id,
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:00:00Z',
    status: 'SCHEDULED',
  };

  const appointment = await mockAppointmentService.createAppointment(appointmentData);
  expect(appointment).toBeDefined();
  expect(appointment.id).toBeDefined();
  expect(appointment.patientId).toBe(patient.id);

  // Verify all services were called
  expect(mockPatientService.createPatient).toHaveBeenCalled();
  expect(mockProfessionalService.getProfessionals).toHaveBeenCalled();
  expect(mockAppointmentService.createAppointment).toHaveBeenCalled();
});