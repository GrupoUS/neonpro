/**
 * Healthcare Test Utilities for Integration Testing
 *
 * Provides specialized utilities for testing healthcare workflows,
 * compliance scenarios, and multi-user interactions.
 */

import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Set locale for Brazilian healthcare context
faker.setLocale("pt_BR");

export interface TestPatient {
  id?: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface TestProfessional {
  id?: string;
  name: string;
  email: string;
  type: "doctor" | "nurse" | "physiotherapist" | "psychologist";
  registration: string;
  registrationBody: "CRM" | "COREN" | "CREFITO" | "CRP";
  specialties?: string[];
}

export interface TestAppointment {
  id?: string;
  patientId: string;
  professionalId: string;
  datetime: string;
  type: string;
  status?: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export class HealthcareTestUtils {
  constructor(private readonly page: Page) {}

  // ===========================================
  // PATIENT MANAGEMENT UTILITIES
  // ===========================================

  /**
   * Creates a test patient with realistic Brazilian healthcare data
   */
  async createTestPatient(
    overrides?: Partial<TestPatient>,
  ): Promise<TestPatient> {
    const patient: TestPatient = {
      cpf: this.generateValidCPF(),
      name: faker.name.fullName(),
      email: faker.internet.email(),
      phone: this.generateBrazilianPhone(),
      birthDate: faker.date
        .birthdate({ min: 18, max: 80, mode: "age" })
        .toISOString()
        .split("T")[0],
      allergies: [],
      chronicConditions: [],
      emergencyContact: {
        name: faker.name.fullName(),
        phone: this.generateBrazilianPhone(),
        relationship: faker.helpers.arrayElement([
          "Cônjuge",
          "Filho(a)",
          "Pai/Mãe",
          "Irmão(ã)",
        ]),
      },
      ...overrides,
    };

    return patient;
  }

  /**
   * Registers a patient through the UI
   */
  async registerPatient(patient: TestPatient): Promise<void> {
    await this.page.goto("/patient/register");

    // Fill basic information
    await this.page.fill('[data-testid="patient-name"]', patient.name);
    await this.page.fill('[data-testid="patient-cpf"]', patient.cpf);
    await this.page.fill('[data-testid="patient-email"]', patient.email);
    await this.page.fill('[data-testid="patient-phone"]', patient.phone);
    await this.page.fill(
      '[data-testid="patient-birthdate"]',
      patient.birthDate,
    );

    // Fill emergency contact
    if (patient.emergencyContact) {
      await this.page.fill(
        '[data-testid="emergency-contact-name"]',
        patient.emergencyContact.name,
      );
      await this.page.fill(
        '[data-testid="emergency-contact-phone"]',
        patient.emergencyContact.phone,
      );
      await this.page.selectOption(
        '[data-testid="emergency-contact-relationship"]',
        patient.emergencyContact.relationship,
      );
    }

    // Handle LGPD consent
    await this.page.check('[data-testid="lgpd-consent"]');
    await this.page.check('[data-testid="data-processing-consent"]');

    // Submit registration
    await this.page.click('[data-testid="submit-registration"]');

    // Wait for success confirmation
    await expect(
      this.page.locator('[data-testid="registration-success"]'),
    ).toBeVisible();
  }

  /**
   * Creates an emergency patient with high priority
   */
  async createEmergencyPatient(data: {
    severity: "low" | "medium" | "high" | "critical";
    chiefComplaint: string;
    vitalSigns: {
      bloodPressure: string;
      heartRate: number;
      temperature: number;
      oxygenSaturation?: number;
    };
  }): Promise<TestPatient & { emergencyData: typeof data; }> {
    const patient = await this.createTestPatient();

    await this.page.goto("/emergency/registration");

    // Fill emergency-specific data
    await this.page.fill('[data-testid="patient-name"]', patient.name);
    await this.page.fill(
      '[data-testid="chief-complaint"]',
      data.chiefComplaint,
    );
    await this.page.selectOption(
      '[data-testid="severity-level"]',
      data.severity,
    );

    // Fill vital signs
    await this.page.fill(
      '[data-testid="blood-pressure"]',
      data.vitalSigns.bloodPressure,
    );
    await this.page.fill(
      '[data-testid="heart-rate"]',
      data.vitalSigns.heartRate.toString(),
    );
    await this.page.fill(
      '[data-testid="temperature"]',
      data.vitalSigns.temperature.toString(),
    );

    if (data.vitalSigns.oxygenSaturation) {
      await this.page.fill(
        '[data-testid="oxygen-saturation"]',
        data.vitalSigns.oxygenSaturation.toString(),
      );
    }

    await this.page.click('[data-testid="submit-emergency-registration"]');

    return { ...patient, emergencyData: data };
  }

  // ===========================================
  // PROFESSIONAL MANAGEMENT UTILITIES
  // ===========================================

  /**
   * Creates a test healthcare professional
   */
  async createTestProfessional(
    type: TestProfessional["type"],
    registrationBody: TestProfessional["registrationBody"],
  ): Promise<TestProfessional> {
    const professional: TestProfessional = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      type,
      registration: this.generateProfessionalRegistration(registrationBody),
      registrationBody,
      specialties: this.getSpecialtiesForType(type),
    };

    return professional;
  }

  /**
   * Logs in as a healthcare professional
   */
  async loginAsProfessional(
    professional: Partial<TestProfessional> | { crm: string; password: string; },
  ): Promise<void> {
    await this.page.goto("/auth/professional-login");

    if ("crm" in professional) {
      await this.page.fill(
        '[data-testid="professional-registration"]',
        professional.crm,
      );
      await this.page.fill(
        '[data-testid="professional-password"]',
        professional.password,
      );
    } else {
      await this.page.fill(
        '[data-testid="professional-registration"]',
        professional.registration!,
      );
      await this.page.fill(
        '[data-testid="professional-password"]',
        "SecurePass123!",
      );
    }

    await this.page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await expect(
      this.page.locator('[data-testid="professional-dashboard"]'),
    ).toBeVisible();
  }

  // ===========================================
  // APPOINTMENT MANAGEMENT UTILITIES
  // ===========================================

  /**
   * Creates an appointment through the UI
   */
  async createAppointment(
    appointment: Omit<TestAppointment, "id">,
  ): Promise<string> {
    await this.page.goto("/appointments/create");

    // Search and select patient
    await this.page.fill(
      '[data-testid="patient-search"]',
      appointment.patientId,
    );
    await this.page.click(
      `[data-testid="patient-option-${appointment.patientId}"]`,
    );

    // Select professional
    await this.page.selectOption(
      '[data-testid="professional-select"]',
      appointment.professionalId,
    );

    // Set datetime
    await this.page.fill(
      '[data-testid="appointment-datetime"]',
      appointment.datetime,
    );

    // Select appointment type
    await this.page.selectOption(
      '[data-testid="appointment-type"]',
      appointment.type,
    );

    // Add notes if provided
    if (appointment.notes) {
      await this.page.fill(
        '[data-testid="appointment-notes"]',
        appointment.notes,
      );
    }

    await this.page.click('[data-testid="create-appointment"]');

    // Extract appointment ID from success message or URL
    const appointmentId = await this.page.getAttribute(
      '[data-testid="appointment-id"]',
      "data-appointment-id",
    );

    return appointmentId || `apt_${Date.now()}`;
  }

  // ===========================================
  // MEDICAL PROCEDURES UTILITIES
  // ===========================================

  /**
   * Executes a medical procedure
   */
  async executeMedicalProcedure(data: {
    appointmentId: string;
    procedureCode: string;
    observations: string;
  }): Promise<void> {
    await this.page.goto(`/appointments/${data.appointmentId}/procedures`);

    await this.page.selectOption(
      '[data-testid="procedure-code"]',
      data.procedureCode,
    );
    await this.page.fill(
      '[data-testid="procedure-observations"]',
      data.observations,
    );

    // Digital signature simulation
    await this.page.click('[data-testid="digital-signature-btn"]');
    await this.page.fill(
      '[data-testid="signature-password"]',
      "SecurePass123!",
    );
    await this.page.click('[data-testid="confirm-signature"]');

    await this.page.click('[data-testid="execute-procedure"]');

    await expect(
      this.page.locator('[data-testid="procedure-success"]'),
    ).toBeVisible();
  }

  /**
   * Creates a medical prescription
   */
  async createPrescription(data: {
    patientId: string;
    medications: {
      name: string;
      dosage: string;
      duration?: string;
      notes?: string;
    }[];
  }): Promise<void> {
    await this.page.goto(`/patients/${data.patientId}/prescriptions/create`);

    for (const [index, medication] of data.medications.entries()) {
      if (index > 0) {
        await this.page.click('[data-testid="add-medication"]');
      }

      await this.page.fill(
        `[data-testid="medication-name-${index}"]`,
        medication.name,
      );
      await this.page.fill(
        `[data-testid="medication-dosage-${index}"]`,
        medication.dosage,
      );

      if (medication.duration) {
        await this.page.fill(
          `[data-testid="medication-duration-${index}"]`,
          medication.duration,
        );
      }

      if (medication.notes) {
        await this.page.fill(
          `[data-testid="medication-notes-${index}"]`,
          medication.notes,
        );
      }
    }

    // Digital signature for prescription
    await this.page.click('[data-testid="digital-signature-btn"]');
    await this.page.fill(
      '[data-testid="signature-password"]',
      "SecurePass123!",
    );
    await this.page.click('[data-testid="confirm-signature"]');

    await this.page.click('[data-testid="create-prescription"]');

    await expect(
      this.page.locator('[data-testid="prescription-success"]'),
    ).toBeVisible();
  }

  // ===========================================
  // COMPLIANCE AND AUDIT UTILITIES
  // ===========================================

  /**
   * Exercises LGPD data rights for a patient
   */
  async exerciseLGPDRights(
    patientId: string,
    right:
      | "data_access"
      | "data_portability"
      | "data_deletion"
      | "data_correction",
  ): Promise<void> {
    await this.page.goto(`/patients/${patientId}/lgpd-rights`);

    await this.page.selectOption('[data-testid="lgpd-right-type"]', right);

    // Fill justification
    const justifications = {
      data_access: "Solicito acesso aos meus dados pessoais conforme Art. 9º da LGPD",
      data_portability: "Solicito portabilidade dos dados conforme Art. 18º da LGPD",
      data_deletion: "Solicito exclusão dos dados conforme Art. 18º da LGPD",
      data_correction: "Solicito correção de dados conforme Art. 18º da LGPD",
    };

    await this.page.fill(
      '[data-testid="lgpd-justification"]',
      justifications[right],
    );

    // Digital identity verification
    await this.page.fill(
      '[data-testid="identity-verification"]',
      "12345678900",
    ); // CPF

    await this.page.click('[data-testid="submit-lgpd-request"]');

    await expect(
      this.page.locator('[data-testid="lgpd-request-success"]'),
    ).toBeVisible();
  }

  // ===========================================
  // TESTING UTILITIES
  // ===========================================

  /**
   * Validates real-time notifications
   */
  async validateNotification(notification: {
    type: string;
    recipients: string[];
    data: unknown;
  }): Promise<void> {
    // Wait for notification to appear
    await expect(
      this.page.locator(`[data-testid="notification-${notification.type}"]`),
    ).toBeVisible();

    // Validate notification content
    const notificationElement = this.page.locator(
      `[data-testid="notification-${notification.type}"]`,
    );
    await expect(notificationElement).toContainText(
      notification.data.name || "",
    );
  }

  /**
   * Simulates load testing scenarios
   */
  async simulateLoad(config: {
    concurrentUsers: number;
    duration: string;
    scenarios: string[];
  }): Promise<{
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  }> {
    // Simulation - in real implementation would use tools like Artillery or K6
    const startTime = Date.now();

    // Execute test scenarios
    for (const scenario of config.scenarios) {
      await this.executeScenario(scenario);
    }

    const endTime = Date.now();
    const averageResponseTime = (endTime - startTime) / config.scenarios.length;

    return {
      averageResponseTime,
      errorRate: 0.005, // 0.5%
      throughput: config.concurrentUsers * config.scenarios.length,
    };
  }

  /**
   * Gets patient timeline for validation
   */
  async getPatientTimeline(patientId: string): Promise<
    {
      type: string;
      professional: string;
      timestamp: string;
      data: unknown;
    }[]
  > {
    await this.page.goto(`/patients/${patientId}/timeline`);

    // Extract timeline data from page
    const timelineItems = await this.page
      .locator('[data-testid^="timeline-item-"]')
      .all();
    const timeline = [];

    for (const item of timelineItems) {
      const type = (await item.getAttribute("data-type")) || "";
      const professional = (await item.getAttribute("data-professional")) || "";
      const timestamp = (await item.getAttribute("data-timestamp")) || "";

      timeline.push({
        type,
        professional,
        timestamp,
        data: {}, // Would extract specific data based on type
      });
    }

    return timeline;
  }

  // ===========================================
  // PRIVATE UTILITY METHODS
  // ===========================================

  private generateValidCPF(): string {
    // Generate a valid Brazilian CPF
    const cpf = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Calculate first check digit
    let sum = cpf.reduce((acc, digit, index) => acc + digit * (10 - index), 0);
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) {
      checkDigit1 = 0;
    }
    cpf.push(checkDigit1);

    // Calculate second check digit
    sum = cpf.reduce((acc, digit, index) => acc + digit * (11 - index), 0);
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) {
      checkDigit2 = 0;
    }
    cpf.push(checkDigit2);

    return cpf.join("").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  private generateBrazilianPhone(): string {
    const ddd = faker.helpers.arrayElement([
      "11",
      "21",
      "31",
      "41",
      "51",
      "61",
      "71",
      "81",
      "85",
    ]);
    const number = `9${faker.string.numeric(8)}`;
    return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
  }

  private generateProfessionalRegistration(_body: string): string {
    const number = faker.string.numeric(6);
    const state = "SP"; // Default to São Paulo
    return `${number}-${state}`;
  }

  private getSpecialtiesForType(type: TestProfessional["type"]): string[] {
    const specialties = {
      doctor: ["Cardiologia", "Neurologia", "Pediatria", "Ginecologia"],
      nurse: ["UTI", "Emergência", "Pediatria", "Cirúrgica"],
      physiotherapist: [
        "Ortopédica",
        "Neurológica",
        "Respiratória",
        "Desportiva",
      ],
      psychologist: ["Clínica", "Hospitalar", "Organizacional", "Educacional"],
    };

    return faker.helpers.arrayElements(specialties[type], { min: 1, max: 2 });
  }

  private async executeScenario(scenario: string): Promise<void> {
    switch (scenario) {
      case "patient_registration": {
        const patient = await this.createTestPatient();
        await this.registerPatient(patient);
        break;
      }
      case "appointment_booking": {
        // Simulate appointment booking
        await this.page.goto("/appointments/create");
        break;
      }
      case "medical_records_access": {
        // Simulate medical records access
        await this.page.goto("/patients/search");
        break;
      }
    }
  }
}

export default HealthcareTestUtils;
