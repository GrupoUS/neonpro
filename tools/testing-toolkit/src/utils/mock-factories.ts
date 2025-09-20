/**
 * Mock Factories
 *
 * Factory functions for creating mock data for testing.
 */

import { randomDate, randomEmail, randomString } from "./index";

/**
 * Factory for creating mock API responses
 */
export class MockAPIResponseFactory {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message: message || "Operation successful",
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, code?: string, statusCode: number = 400) {
    return {
      success: false,
      error: {
        message,
        code: code || "GENERIC_ERROR",
        statusCode,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    items: T[],
    page: number = 1,
    limit: number = 10,
    total?: number,
  ) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalItems = total || items.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Factory for creating mock user data
 */
export class MockUserFactory {
  static create(overrides: Record<string, any> = {}) {
    return {
      id: randomString(12),
      email: randomEmail(),
      name: `User ${randomString(6)}`,
      role: "user",
      active: true,
      createdAt: randomDate(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createBatch(count: number, overrides: Record<string, any> = {}) {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides: Record<string, any> = {}) {
    return this.create({
      role: "admin",
      permissions: ["read", "write", "delete"],
      ...overrides,
    });
  }

  static createPatient(overrides: Record<string, any> = {}) {
    return this.create({
      role: "patient",
      patientId: randomString(10),
      ...overrides,
    });
  }

  static createProfessional(overrides: Record<string, any> = {}) {
    return this.create({
      role: "professional",
      crm: `CRM/SP ${Math.floor(Math.random() * 999999)}`,
      specialty: "General Medicine",
      ...overrides,
    });
  }
}

/**
 * Factory for creating mock healthcare data
 */
export class MockHealthcareFactory {
  static createPatient(overrides: Record<string, any> = {}) {
    return {
      id: randomString(12),
      name: `Patient ${randomString(6)}`,
      email: randomEmail(),
      cpf: this.generateCPF(),
      birthDate: randomDate(new Date("1950-01-01"), new Date("2010-01-01")),
      phone: this.generatePhone(),
      address: {
        street: `Rua ${randomString(8)}`,
        number: Math.floor(Math.random() * 9999) + 1,
        city: "São Paulo",
        state: "SP",
        zipCode: this.generateZipCode(),
      },
      medicalHistory: [],
      allergies: [],
      medications: [],
      emergencyContact: {
        name: `Contact ${randomString(6)}`,
        phone: this.generatePhone(),
        relationship: "Family",
      },
      consentGiven: true,
      dataProcessingPurpose: "Prestação de serviços de saúde",
      createdAt: randomDate(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createClinic(overrides: Record<string, any> = {}) {
    return {
      id: randomString(12),
      name: `Clínica ${randomString(8)}`,
      cnpj: this.generateCNPJ(),
      phone: this.generatePhone(),
      email: randomEmail(),
      address: {
        street: `Rua ${randomString(10)}`,
        number: Math.floor(Math.random() * 9999) + 1,
        city: "São Paulo",
        state: "SP",
        zipCode: this.generateZipCode(),
      },
      specialties: ["General Medicine", "Cardiology"],
      operatingHours: {
        monday: "08:00-18:00",
        tuesday: "08:00-18:00",
        wednesday: "08:00-18:00",
        thursday: "08:00-18:00",
        friday: "08:00-18:00",
        saturday: "08:00-12:00",
        sunday: "Closed",
      },
      createdAt: randomDate(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createAppointment(overrides: Record<string, any> = {}) {
    const appointmentDate = randomDate(
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    return {
      id: randomString(12),
      patientId: randomString(12),
      professionalId: randomString(12),
      clinicId: randomString(12),
      date: appointmentDate,
      duration: 30, // minutes
      type: "consultation",
      status: "scheduled",
      notes: "",
      symptoms: [],
      diagnosis: "",
      prescription: [],
      followUp: null,
      createdAt: randomDate(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  private static generateCPF(): string {
    const digits = Array.from({ length: 9 }, () =>
      Math.floor(Math.random() * 10),
    );

    // Calculate first check digit
    let sum = digits.reduce(
      (acc, digit, index) => acc + digit * (10 - index),
      0,
    );
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;

    // Calculate second check digit
    sum =
      digits.reduce((acc, digit, index) => acc + digit * (11 - index), 0) +
      checkDigit1 * 2;
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;

    const allDigits = [...digits, checkDigit1, checkDigit2];
    return `${allDigits.slice(0, 3).join("")}.${allDigits.slice(3, 6).join("")}.${allDigits
      .slice(6, 9)
      .join("")}-${allDigits.slice(9).join("")}`;
  }

  private static generateCNPJ(): string {
    const digits = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 10),
    );

    // Calculate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = digits.reduce(
      (acc, digit, index) => acc + digit * (weights1[index] || 0),
      0,
    );
    let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    // Calculate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = [...digits, checkDigit1].reduce(
      (acc, digit, index) => acc + digit * (weights2[index] || 0),
      0,
    );
    let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    const allDigits = [...digits, checkDigit1, checkDigit2];
    return `${allDigits.slice(0, 2).join("")}.${allDigits.slice(2, 5).join("")}.${allDigits
      .slice(5, 8)
      .join(
        "",
      )}/${allDigits.slice(8, 12).join("")}-${allDigits.slice(12).join("")}`;
  }

  private static generatePhone(): string {
    const areaCode = Math.floor(Math.random() * 89) + 11; // 11-99
    const firstPart = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    const secondPart = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }

  private static generateZipCode(): string {
    const firstPart = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
    const secondPart = Math.floor(Math.random() * 900) + 100; // 100-999
    return `${firstPart}-${secondPart}`;
  }
}
