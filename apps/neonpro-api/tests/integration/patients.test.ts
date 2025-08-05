import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createHealthcareService } from "../../src/index";

describe("Patients API Integration Tests", () => {
  let app: FastifyInstance;
  let authToken: string;

  beforeAll(async () => {
    // Criar instância do servidor para testes
    app = createHealthcareService();
    await app.ready();

    // Criar token de autenticação para testes
    authToken = global.healthcareTestUtils.createTestJWT({
      sub: global.testConfig.testUser.id,
      email: global.testConfig.testUser.email,
      role: global.testConfig.testUser.role,
      tenantId: global.testConfig.testUser.tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/patients", () => {
    it("should create a new patient with valid data", async () => {
      const patientData = {
        fullName: "Maria Santos Silva",
        cpf: global.healthcareTestUtils.generateValidCPF(),
        email: "maria.santos@example.com",
        phone: "+5511987654321",
        dateOfBirth: "1985-05-15",
        gender: "female",
        address: {
          street: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
          country: "Brasil",
        },
        emergencyContact: {
          name: "João Santos",
          phone: "+5511987654322",
          relationship: "spouse",
        },
        medicalHistory: {
          allergies: ["Penicilina"],
          chronicConditions: [],
          medications: [],
          surgeries: [],
        },
      };

      const response = await supertest(app.server)
        .post("/api/patients")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(patientData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("patientId");
      expect(response.body.data).toHaveProperty("fullName", patientData.fullName);

      // Verificar conformidade LGPD
      const lgpdCheck = global.healthcareTestUtils.validateLGPDCompliance(response.body.data);
      expect(lgpdCheck.compliant).toBe(true);
    });

    it("should reject patient creation with invalid CPF", async () => {
      const patientData = {
        fullName: "Paciente Teste",
        cpf: "12345678900", // CPF inválido
        email: "teste@example.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-01-01",
      };

      const response = await supertest(app.server)
        .post("/api/patients")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(patientData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("CPF");
    });

    it("should require authentication", async () => {
      const patientData = {
        fullName: "Paciente Sem Auth",
        cpf: global.healthcareTestUtils.generateValidCPF(),
        email: "semauth@example.com",
      };

      await supertest(app.server)
        .post("/api/patients")
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(patientData)
        .expect(401);
    });

    it("should require appropriate role permissions", async () => {
      // Token de paciente (não pode criar outros pacientes)
      const patientToken = global.healthcareTestUtils.createTestJWT({
        sub: "patient-user-id",
        email: "patient@example.com",
        role: "patient",
        tenantId: global.testConfig.testUser.tenantId,
      });

      const patientData = {
        fullName: "Tentativa Não Autorizada",
        cpf: global.healthcareTestUtils.generateValidCPF(),
        email: "naoautorizado@example.com",
      };

      await supertest(app.server)
        .post("/api/patients")
        .set("Authorization", `Bearer ${patientToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(patientData)
        .expect(403);
    });
  });

  describe("GET /api/patients", () => {
    it("should list patients with pagination", async () => {
      const response = await supertest(app.server)
        .get("/api/patients?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
      expect(response.body.pagination).toHaveProperty("totalCount");
    });

    it("should filter patients by search term", async () => {
      const response = await supertest(app.server)
        .get("/api/patients?search=Maria")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it("should respect rate limiting", async () => {
      // Simular muitas requisições rapidamente
      const requests = Array(65)
        .fill(null)
        .map(() =>
          supertest(app.server)
            .get("/api/patients")
            .set("Authorization", `Bearer ${authToken}`)
            .set("X-Tenant-ID", global.testConfig.testUser.tenantId),
        );

      const results = await Promise.allSettled(requests);

      // Verificar se pelo menos uma requisição foi bloqueada por rate limiting
      const rateLimitedRequests = results.filter(
        (result) => result.status === "fulfilled" && (result.value as any).status === 429,
      );

      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/patients/:id", () => {
    it("should return specific patient data", async () => {
      const patientId = "test-patient-id";

      const response = await supertest(app.server)
        .get(`/api/patients/${patientId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("id", patientId);

      // Verificar conformidade LGPD na resposta
      const lgpdCheck = global.healthcareTestUtils.validateLGPDCompliance(response.body.data);
      expect(lgpdCheck.compliant).toBe(true);
    });

    it("should return 404 for non-existent patient", async () => {
      const response = await supertest(app.server)
        .get("/api/patients/non-existent-id")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should enforce tenant isolation", async () => {
      // Token de outro tenant
      const otherTenantToken = global.healthcareTestUtils.createTestJWT({
        sub: "other-user-id",
        role: "doctor",
        tenantId: "other-tenant-id",
      });

      await supertest(app.server)
        .get("/api/patients/test-patient-id")
        .set("Authorization", `Bearer ${otherTenantToken}`)
        .set("X-Tenant-ID", "other-tenant-id")
        .expect(404); // Não deve encontrar paciente de outro tenant
    });
  });

  describe("PUT /api/patients/:id", () => {
    it("should update patient data", async () => {
      const patientId = "test-patient-id";
      const updateData = {
        phone: "+5511987654999",
        address: {
          street: "Nova Rua, 456",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567",
          country: "Brasil",
        },
      };

      const response = await supertest(app.server)
        .put(`/api/patients/${patientId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("phone", updateData.phone);
    });

    it("should not allow updating sensitive fields without proper audit", async () => {
      const patientId = "test-patient-id";
      const sensitiveUpdate = {
        cpf: "98765432100", // Tentativa de alterar CPF
      };

      const response = await supertest(app.server)
        .put(`/api/patients/${patientId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(sensitiveUpdate)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("LGPD Compliance Tests", () => {
    it("should provide data export for patient (LGPD Article 15)", async () => {
      const patientId = "test-patient-id";

      const response = await supertest(app.server)
        .get(`/api/patients/${patientId}/export`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("personalData");
      expect(response.body.data).toHaveProperty("medicalRecords");
      expect(response.body.data).toHaveProperty("appointments");
      expect(response.body.data).toHaveProperty("exportMetadata");

      // Verificar formato de exportação
      expect(response.body.data.exportMetadata).toHaveProperty("exportedAt");
      expect(response.body.data.exportMetadata).toHaveProperty("dataRetentionPolicy");
    });

    it("should allow data deletion request (LGPD Article 18)", async () => {
      const patientId = "test-patient-id";
      const deletionRequest = {
        reason: "Patient requested data deletion",
        confirmIdentity: true,
        dataTypes: ["personal", "medical", "appointments"],
      };

      const response = await supertest(app.server)
        .delete(`/api/patients/${patientId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(deletionRequest)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("deletionRequestId");
      expect(response.body).toHaveProperty("estimatedCompletionDate");
    });
  });

  describe("ANVISA Compliance Tests", () => {
    it("should log all data access for audit trail", async () => {
      const patientId = "test-patient-id";

      await supertest(app.server)
        .get(`/api/patients/${patientId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      // Verificar se o log de auditoria foi chamado
      expect(app.auditLog).toHaveBeenCalledWith({
        action: "patient_viewed",
        userId: global.testConfig.testUser.id,
        tenantId: global.testConfig.testUser.tenantId,
        resourceId: patientId,
        metadata: expect.any(Object),
      });
    });

    it("should maintain data integrity for medical records", async () => {
      const patientId = "test-patient-id";
      const medicalUpdate = {
        medicalHistory: {
          allergies: ["Dipirona", "Penicilina"],
          chronicConditions: ["Hipertensão"],
          lastUpdatedBy: global.testConfig.testUser.id,
          lastUpdatedAt: new Date().toISOString(),
        },
      };

      const response = await supertest(app.server)
        .put(`/api/patients/${patientId}/medical-history`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(medicalUpdate)
        .expect(200);

      expect(response.body.data.medicalHistory).toHaveProperty("lastUpdatedBy");
      expect(response.body.data.medicalHistory).toHaveProperty("lastUpdatedAt");
      expect(response.body.data.medicalHistory).toHaveProperty("version");
    });
  });

  describe("Performance Tests", () => {
    it("should handle concurrent patient lookups", async () => {
      const concurrentRequests = 10;
      const requests = Array(concurrentRequests)
        .fill(null)
        .map((_, index) =>
          supertest(app.server)
            .get(`/api/patients/test-patient-${index}`)
            .set("Authorization", `Bearer ${authToken}`)
            .set("X-Tenant-ID", global.testConfig.testUser.tenantId),
        );

      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();

      // Deve completar em menos de 5 segundos
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it("should respond within acceptable time limits", async () => {
      const startTime = Date.now();

      await supertest(app.server)
        .get("/api/patients")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      const responseTime = Date.now() - startTime;

      // API deve responder em menos de 1 segundo
      expect(responseTime).toBeLessThan(1000);
    });
  });
});
