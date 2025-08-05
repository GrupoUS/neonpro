import type { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createHealthcareService } from "../../src/index";

describe("Billing API Integration Tests", () => {
  let app: FastifyInstance;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = createHealthcareService();
    await app.ready();

    // Token de recepcionista (pode criar faturas)
    authToken = global.healthcareTestUtils.createTestJWT({
      sub: "receptionist-user-id",
      email: "receptionist@neonpro.com",
      role: "receptionist",
      tenantId: global.testConfig.testUser.tenantId,
    });

    // Token de admin (todas as permissões)
    adminToken = global.healthcareTestUtils.createTestJWT({
      sub: "admin-user-id",
      email: "admin@neonpro.com",
      role: "admin",
      tenantId: global.testConfig.testUser.tenantId,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/billing/invoices", () => {
    it("should create invoice with Brazilian tax calculations", async () => {
      const invoiceData = {
        patientId: "test-patient-id",
        services: [
          {
            serviceId: "botox-service",
            serviceName: "Aplicação de Botox",
            description: "Aplicação de toxina botulínica para rugas",
            quantity: 1,
            unitPrice: 800.0,
            discount: 10, // 10% desconto
            taxable: true,
          },
          {
            serviceId: "consultation-service",
            serviceName: "Consulta Dermatológica",
            description: "Consulta de acompanhamento",
            quantity: 1,
            unitPrice: 200.0,
            discount: 0,
            taxable: true,
          },
        ],
        paymentMethod: "credit_card",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        taxes: {
          includeISS: true,
          includeIR: false,
          municipality: "São Paulo",
        },
        discounts: [
          {
            type: "promotional",
            value: 50.0,
            description: "Desconto promocional",
          },
        ],
        notes: "Pagamento à vista com desconto promocional",
      };

      const response = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("invoiceId");
      expect(response.body).toHaveProperty("totalAmount");
      expect(response.body).toHaveProperty("taxAmount");
      expect(response.body.totalAmount).toBeGreaterThan(0);
      expect(response.body.taxAmount).toBeGreaterThan(0);

      // Verificar cálculo correto dos impostos brasileiros
      const expectedSubtotal = 800 * 0.9 + 200; // 720 + 200 = 920
      const discount = 50;
      const netAmount = expectedSubtotal - discount; // 870
      const expectedISS = netAmount * 0.05; // 5% ISS padrão para serviços de saúde

      expect(response.body.taxAmount).toBeCloseTo(expectedISS, 2);
    });

    it("should handle installment payments", async () => {
      const invoiceData = {
        patientId: "test-patient-id",
        services: [
          {
            serviceId: "treatment-package",
            serviceName: "Pacote Tratamento Completo",
            quantity: 1,
            unitPrice: 2400.0,
            discount: 0,
            taxable: true,
          },
        ],
        paymentMethod: "installments",
        installments: 6,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        taxes: {
          includeISS: true,
          municipality: "São Paulo",
        },
      };

      const response = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("invoiceId");

      // Verificar se as parcelas foram criadas
      const invoiceId = response.body.invoiceId;

      // Buscar detalhes da fatura para verificar parcelas
      const invoiceDetails = await supertest(app.server)
        .get(`/api/billing/invoices/${invoiceId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(invoiceDetails.body.data).toHaveProperty("installments", 6);
    });

    it("should handle insurance coverage calculations", async () => {
      const invoiceData = {
        patientId: "test-patient-id",
        services: [
          {
            serviceId: "medical-procedure",
            serviceName: "Procedimento Médico Coberto",
            quantity: 1,
            unitPrice: 1000.0,
            discount: 0,
            taxable: true,
          },
        ],
        paymentMethod: "insurance",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        taxes: {
          includeISS: true,
          municipality: "São Paulo",
        },
        insuranceInfo: {
          hasInsurance: true,
          insuranceProvider: "Unimed",
          policyNumber: "UNI123456789",
          coveragePercentage: 70,
          preAuthorizationCode: "AUTH789456",
        },
      };

      const response = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(invoiceData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);

      // O valor final deve ser reduzido em 70% devido à cobertura do plano
      const totalWithTax = 1000 * 1.05; // Com ISS
      const expectedFinalAmount = totalWithTax * 0.3; // 30% que o paciente paga

      expect(response.body.totalAmount).toBeCloseTo(expectedFinalAmount, 2);
    });

    it("should require valid CPF for billing", async () => {
      const invalidInvoiceData = {
        patientId: "invalid-patient-id",
        services: [
          {
            serviceId: "service",
            serviceName: "Serviço Teste",
            quantity: 1,
            unitPrice: 100.0,
            taxable: true,
          },
        ],
        paymentMethod: "cash",
        dueDate: new Date().toISOString(),
        taxes: {
          includeISS: true,
          municipality: "São Paulo",
        },
      };

      const response = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(invalidInvoiceData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/billing/payments", () => {
    let testInvoiceId: string;

    beforeAll(async () => {
      // Criar fatura de teste para pagamentos
      const invoiceResponse = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send({
          patientId: "test-patient-id",
          services: [
            {
              serviceId: "test-service",
              serviceName: "Serviço de Teste",
              quantity: 1,
              unitPrice: 500.0,
              taxable: true,
            },
          ],
          paymentMethod: "credit_card",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          taxes: {
            includeISS: true,
            municipality: "São Paulo",
          },
        });

      testInvoiceId = invoiceResponse.body.invoiceId;
    });

    it("should process credit card payment", async () => {
      const paymentData = {
        invoiceId: testInvoiceId,
        amount: 525.0, // Valor com impostos
        paymentMethod: "credit_card",
        cardInfo: {
          holderName: "João Silva",
          holderDocument: global.healthcareTestUtils.generateValidCPF(),
          lastFourDigits: "1234",
          brand: "visa",
          installments: 1,
        },
        notes: "Pagamento via cartão de crédito Visa",
      };

      const response = await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("paymentId");
      expect(response.body).toHaveProperty("transactionId");
      expect(response.body.message).toContain("sucesso");
    });

    it("should process PIX payment", async () => {
      const pixPaymentData = {
        invoiceId: testInvoiceId,
        amount: 525.0,
        paymentMethod: "pix",
        pixInfo: {
          pixKey: "joao.silva@email.com",
          qrCode: "PIX_QR_CODE_DATA_HERE",
        },
        notes: "Pagamento via PIX",
      };

      const response = await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(pixPaymentData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("transactionId");
      expect(response.body.transactionId).toContain("PIX_");
    });

    it("should process cash payment", async () => {
      const cashPaymentData = {
        invoiceId: testInvoiceId,
        amount: 525.0,
        paymentMethod: "cash",
        notes: "Pagamento em dinheiro na recepção",
      };

      const response = await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(cashPaymentData)
        .expect(201);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.transactionId).toContain("CASH_");
    });

    it("should reject payment for non-existent invoice", async () => {
      const invalidPaymentData = {
        invoiceId: "non-existent-invoice-id",
        amount: 100.0,
        paymentMethod: "cash",
      };

      const response = await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(invalidPaymentData)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("não encontrada");
    });

    it("should reject payment for already paid invoice", async () => {
      // Primeiro, pagar a fatura completamente
      await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send({
          invoiceId: testInvoiceId,
          amount: 525.0,
          paymentMethod: "cash",
        });

      // Tentar pagar novamente
      const duplicatePaymentData = {
        invoiceId: testInvoiceId,
        amount: 100.0,
        paymentMethod: "cash",
      };

      const response = await supertest(app.server)
        .post("/api/billing/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(duplicatePaymentData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("já foi paga");
    });
  });

  describe("POST /api/billing/pix/generate", () => {
    let testInvoiceId: string;

    beforeAll(async () => {
      // Criar fatura para gerar PIX
      const invoiceResponse = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send({
          patientId: "test-patient-id",
          services: [
            {
              serviceId: "pix-service",
              serviceName: "Serviço para PIX",
              quantity: 1,
              unitPrice: 300.0,
              taxable: true,
            },
          ],
          paymentMethod: "pix",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          taxes: {
            includeISS: true,
            municipality: "São Paulo",
          },
        });

      testInvoiceId = invoiceResponse.body.invoiceId;
    });

    it("should generate PIX payment code", async () => {
      const pixData = {
        invoiceId: testInvoiceId,
        amount: 315.0, // Valor com impostos
        expirationMinutes: 60,
      };

      const response = await supertest(app.server)
        .post("/api/billing/pix/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(pixData)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("pixKey");
      expect(response.body).toHaveProperty("qrCode");
      expect(response.body).toHaveProperty("expiresAt");
      expect(response.body).toHaveProperty("amount");
      expect(response.body.amount).toContain("R$");
    });

    it("should set proper expiration time for PIX", async () => {
      const pixData = {
        invoiceId: testInvoiceId,
        amount: 315.0,
        expirationMinutes: 30,
      };

      const beforeRequest = new Date();
      const response = await supertest(app.server)
        .post("/api/billing/pix/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(pixData)
        .expect(200);

      const expirationTime = new Date(response.body.expiresAt);
      const expectedExpiration = new Date(beforeRequest.getTime() + 30 * 60 * 1000);

      // Verificar se a expiração está próxima do esperado (tolerância de 1 minuto)
      const timeDifference = Math.abs(expirationTime.getTime() - expectedExpiration.getTime());
      expect(timeDifference).toBeLessThan(60000); // Menos de 1 minuto de diferença
    });
  });

  describe("GET /api/billing/reports/financial", () => {
    it("should generate financial report for admin", async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await supertest(app.server)
        .get("/api/billing/reports/financial")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: "month",
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("summary");
      expect(response.body.data).toHaveProperty("timeline");
      expect(response.body.data).toHaveProperty("paymentMethods");
      expect(response.body.data).toHaveProperty("topServices");

      // Verificar estrutura do resumo financeiro
      expect(response.body.data.summary).toHaveProperty("totalInvoiced");
      expect(response.body.data.summary).toHaveProperty("totalPaid");
      expect(response.body.data.summary).toHaveProperty("collectionRate");

      // Verificar se valores estão formatados em reais
      expect(response.body.data.summary.totalInvoiced).toMatch(/R\$\s?[\d.,]+/);
    });

    it("should deny financial report access to non-admin users", async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      const response = await supertest(app.server)
        .get("/api/billing/reports/financial")
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set("Authorization", `Bearer ${authToken}`) // Token não-admin
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .expect(403);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Brazilian Tax Compliance Tests", () => {
    it("should calculate ISS correctly for different municipalities", async () => {
      const testCases = [
        { municipality: "São Paulo", expectedRate: 0.05 },
        { municipality: "Rio de Janeiro", expectedRate: 0.05 },
        { municipality: "Belo Horizonte", expectedRate: 0.05 },
      ];

      for (const testCase of testCases) {
        const invoiceData = {
          patientId: "test-patient-id",
          services: [
            {
              serviceId: "tax-test-service",
              serviceName: "Serviço Teste Imposto",
              quantity: 1,
              unitPrice: 1000.0,
              taxable: true,
            },
          ],
          paymentMethod: "cash",
          dueDate: new Date().toISOString(),
          taxes: {
            includeISS: true,
            municipality: testCase.municipality,
          },
        };

        const response = await supertest(app.server)
          .post("/api/billing/invoices")
          .set("Authorization", `Bearer ${authToken}`)
          .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
          .send(invoiceData)
          .expect(201);

        const expectedTax = 1000 * testCase.expectedRate;
        const expectedTotal = 1000 + expectedTax;

        expect(response.body.taxAmount).toBeCloseTo(expectedTax, 2);
        expect(response.body.totalAmount).toBeCloseTo(expectedTotal, 2);
      }
    });

    it("should apply IR (Income Tax) for high-value procedures", async () => {
      const highValueInvoiceData = {
        patientId: "test-patient-id",
        services: [
          {
            serviceId: "high-value-service",
            serviceName: "Procedimento de Alto Valor",
            quantity: 1,
            unitPrice: 15000.0, // Valor alto que pode incidir IR
            taxable: true,
          },
        ],
        paymentMethod: "bank_transfer",
        dueDate: new Date().toISOString(),
        taxes: {
          includeISS: true,
          includeIR: true,
          municipality: "São Paulo",
        },
      };

      const response = await supertest(app.server)
        .post("/api/billing/invoices")
        .set("Authorization", `Bearer ${authToken}`)
        .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
        .send(highValueInvoiceData)
        .expect(201);

      // Verificar se IR foi aplicado (além do ISS)
      expect(response.body.taxAmount).toBeGreaterThan(15000 * 0.05); // Mais que apenas ISS
    });
  });

  describe("Performance and Load Tests", () => {
    it("should handle concurrent invoice creation", async () => {
      const concurrentInvoices = 5;
      const invoicePromises = Array(concurrentInvoices)
        .fill(null)
        .map((_, index) =>
          supertest(app.server)
            .post("/api/billing/invoices")
            .set("Authorization", `Bearer ${authToken}`)
            .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
            .send({
              patientId: `test-patient-${index}`,
              services: [
                {
                  serviceId: `concurrent-service-${index}`,
                  serviceName: `Serviço Concorrente ${index}`,
                  quantity: 1,
                  unitPrice: 100.0,
                  taxable: true,
                },
              ],
              paymentMethod: "cash",
              dueDate: new Date().toISOString(),
              taxes: {
                includeISS: true,
                municipality: "São Paulo",
              },
            }),
        );

      const startTime = Date.now();
      const responses = await Promise.all(invoicePromises);
      const endTime = Date.now();

      // Todas as requisições devem ter sucesso
      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("success", true);
      });

      // Deve completar em tempo razoável (menos de 3 segundos)
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it("should maintain accuracy under load", async () => {
      const loadTestInvoices = 10;
      const baseAmount = 500.0;

      const invoicePromises = Array(loadTestInvoices)
        .fill(null)
        .map((_, index) =>
          supertest(app.server)
            .post("/api/billing/invoices")
            .set("Authorization", `Bearer ${authToken}`)
            .set("X-Tenant-ID", global.testConfig.testUser.tenantId)
            .send({
              patientId: `load-test-patient-${index}`,
              services: [
                {
                  serviceId: `load-test-service-${index}`,
                  serviceName: `Serviço Load Test ${index}`,
                  quantity: 1,
                  unitPrice: baseAmount,
                  taxable: true,
                },
              ],
              paymentMethod: "cash",
              dueDate: new Date().toISOString(),
              taxes: {
                includeISS: true,
                municipality: "São Paulo",
              },
            }),
        );

      const responses = await Promise.all(invoicePromises);

      // Verificar se todos os cálculos estão corretos
      const expectedTotal = baseAmount * 1.05; // Com ISS de 5%

      responses.forEach((response) => {
        expect(response.body.totalAmount).toBeCloseTo(expectedTotal, 2);
        expect(response.body.taxAmount).toBeCloseTo(baseAmount * 0.05, 2);
      });
    });
  });
});
