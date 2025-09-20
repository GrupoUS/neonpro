/**
 * CONTRACT TEST: POST /api/v2/patients (T012)
 *
 * Tests patient creation endpoint contract:
 * - Request/response schema validation
 * - Brazilian data validation (CPF, phone, CEP)
 * - LGPD consent requirements
 * - Duplicate prevention
 * - Performance requirements (<500ms)
 */

import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { app } from "../../src/app";

// Request schema validation
const CreatePatientRequestSchema = z.object({
  name: z.string().min(2).max(100),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  email: z.string().email(),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["male", "female", "other"]),
  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    complement: z.string().optional(),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2), // Brazilian state code
    zipCode: z.string().regex(/^\d{5}-\d{3}$/), // Brazilian CEP format
  }),
  emergencyContact: z.object({
    name: z.string().min(2),
    relationship: z.string().min(1),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  }),
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    marketingCommunications: z.boolean().optional(),
    thirdPartySharing: z.boolean().optional(),
    consentDate: z.string().datetime(),
    ipAddress: z.string().ip(),
  }),
});

// Response schema validation
const CreatePatientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cpf: z.string(),
  phone: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["male", "female", "other"]),
  status: z.literal("active"),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }),
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    marketingCommunications: z.boolean().optional(),
    thirdPartySharing: z.boolean().optional(),
    consentDate: z.string().datetime(),
    consentId: z.string().uuid(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  performanceMetrics: z.object({
    duration: z.number().max(500), // Performance requirement: <500ms
    validationTime: z.number(),
  }),
});

describe("POST /api/v2/patients - Contract Tests", () => {
  const testAuthHeaders = {
    Authorization: "Bearer test-token",
    "Content-Type": "application/json",
  };

  const validPatientData = {
    name: "Maria Silva Santos",
    cpf: "123.456.789-01",
    phone: "(11) 99999-9999",
    email: "maria.silva@example.com",
    dateOfBirth: "1990-05-15T00:00:00.000Z",
    gender: "female" as const,
    address: {
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    emergencyContact: {
      name: "João Silva Santos",
      relationship: "Spouse",
      phone: "(11) 88888-8888",
    },
    lgpdConsent: {
      dataProcessing: true,
      marketingCommunications: false,
      thirdPartySharing: false,
      consentDate: new Date().toISOString(),
      ipAddress: "127.0.0.1",
    },
  };

  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe("Successful Creation", () => {
    it("should create patient with valid data and correct schema", async () => {
      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(validPatientData)
        .expect(201);

      // Validate response schema
      const validatedData = CreatePatientResponseSchema.parse(response.body);
      expect(validatedData).toBeDefined();

      // Validate specific fields
      expect(response.body.name).toBe(validPatientData.name);
      expect(response.body.cpf).toBe(validPatientData.cpf);
      expect(response.body.email).toBe(validPatientData.email);
      expect(response.body.status).toBe("active");
      expect(response.body.lgpdConsent.consentId).toBeDefined();
    });

    it("should handle minimal required data", async () => {
      const minimalData = {
        ...validPatientData,
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Friend",
          phone: "(11) 77777-7777",
        },
        address: {
          ...validPatientData.address,
          complement: undefined,
        },
        lgpdConsent: {
          dataProcessing: true,
          consentDate: new Date().toISOString(),
          ipAddress: "127.0.0.1",
        },
      };

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(minimalData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.lgpdConsent.dataProcessing).toBe(true);
    });
  });

  describe("Brazilian Data Validation", () => {
    it("should validate CPF format", async () => {
      const invalidCpfData = {
        ...validPatientData,
        cpf: "123456789-01", // Missing dots
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidCpfData)
        .expect(400);
    });

    it("should validate CPF checksum", async () => {
      const invalidChecksumData = {
        ...validPatientData,
        cpf: "123.456.789-00", // Invalid checksum
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidChecksumData)
        .expect(400);
    });

    it("should validate Brazilian phone format", async () => {
      const invalidPhoneData = {
        ...validPatientData,
        phone: "11999999999", // Missing formatting
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidPhoneData)
        .expect(400);
    });

    it("should validate Brazilian CEP format", async () => {
      const invalidCepData = {
        ...validPatientData,
        address: {
          ...validPatientData.address,
          zipCode: "01234567", // Missing dash
        },
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidCepData)
        .expect(400);
    });

    it("should validate Brazilian state code", async () => {
      const invalidStateData = {
        ...validPatientData,
        address: {
          ...validPatientData.address,
          state: "SAO", // Invalid state code
        },
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidStateData)
        .expect(400);
    });
  });

  describe("LGPD Consent Requirements", () => {
    it("should require LGPD data processing consent", async () => {
      const noConsentData = {
        ...validPatientData,
        lgpdConsent: {
          ...validPatientData.lgpdConsent,
          dataProcessing: false,
        },
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(noConsentData)
        .expect(400);
    });

    it("should require consent date and IP address", async () => {
      const incompleteConsentData = {
        ...validPatientData,
        lgpdConsent: {
          dataProcessing: true,
        },
      };

      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(incompleteConsentData)
        .expect(400);
    });

    it("should generate consent ID in response", async () => {
      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(validPatientData)
        .expect(201);

      expect(response.body.lgpdConsent.consentId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe("Duplicate Prevention", () => {
    it("should prevent duplicate CPF registration", async () => {
      // First creation should succeed
      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(validPatientData)
        .expect(201);

      // Second creation with same CPF should fail
      const duplicateData = {
        ...validPatientData,
        email: "different.email@example.com",
      };

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(duplicateData)
        .expect(409);

      expect(response.body.error).toContain("CPF");
    });

    it("should prevent duplicate email registration", async () => {
      const uniqueData = {
        ...validPatientData,
        cpf: "987.654.321-09",
      };

      // First creation should succeed
      await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(uniqueData)
        .expect(201);

      // Second creation with same email should fail
      const duplicateEmailData = {
        ...validPatientData,
        cpf: "111.222.333-44",
      };

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(duplicateEmailData)
        .expect(409);

      expect(response.body.error).toContain("email");
    });
  });

  describe("Performance Requirements", () => {
    it("should create patient within 500ms", async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send({
          ...validPatientData,
          cpf: "555.666.777-88",
          email: "performance.test@example.com",
        })
        .expect(201);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(500);
    });
  });

  describe("Error Handling", () => {
    it("should return 401 for missing authentication", async () => {
      await request(app)
        .post("/api/v2/patients")
        .send(validPatientData)
        .expect(401);
    });

    it("should return 400 for missing required fields", async () => {
      const incompleteData = {
        name: "Test Patient",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
    });

    it("should return detailed validation errors", async () => {
      const invalidData = {
        name: "", // Invalid: empty name
        cpf: "invalid-cpf",
        phone: "invalid-phone",
        email: "not-an-email",
        dateOfBirth: "invalid-date",
        gender: "invalid-gender",
      };

      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send(invalidData)
        .expect(400);

      expect(response.body.details).toBeInstanceOf(Array);
      expect(response.body.details.length).toBeGreaterThan(1);
    });
  });

  describe("Audit Trail", () => {
    it("should create audit log entry for patient creation", async () => {
      const response = await request(app)
        .post("/api/v2/patients")
        .set(testAuthHeaders)
        .send({
          ...validPatientData,
          cpf: "999.888.777-66",
          email: "audit.test@example.com",
        })
        .expect(201);

      expect(response.headers["x-audit-id"]).toBeDefined();
      expect(response.headers["x-lgpd-processed"]).toBeDefined();
    });
  });
});
