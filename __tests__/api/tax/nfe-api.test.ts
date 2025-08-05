// NFE API Tests - Story 5.5
// Testing NFE generation, emission, and management functionality
// Author: VoidBeast V6.0 Master Orchestrator

import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";

// Mock Supabase client for NFE operations
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: "test-nfe-id",
                  clinic_id: "test-clinic-id",
                  invoice_id: "test-invoice-id",
                  numero_nfe: "000000001",
                  serie_nfe: 1,
                  chave_nfe: "test-chave-nfe",
                  valor_total: 1000.0,
                  status: "generated",
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          ),
        })),
        single: jest.fn(() =>
          Promise.resolve({
            data: {
              id: "test-nfe-id",
              clinic_id: "test-clinic-id",
              invoice_id: "test-invoice-id",
              numero_nfe: "000000001",
              serie_nfe: 1,
              chave_nfe: "test-chave-nfe",
              valor_total: 1000.0,
              status: "generated",
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
        ),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({
            data: { id: "test-nfe-insert-id" },
            error: null,
          }),
        ),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { id: "test-nfe-update-id", status: "emitted" },
              error: null,
            }),
          ),
        })),
      })),
    })),
  })),
};

// Mock NFE Integration Service
jest.mock("@/lib/services/tax/nfe-service", () => ({
  NFEIntegrationService: jest.fn().mockImplementation(() => ({
    generateNFE: jest.fn().mockResolvedValue({
      clinic_id: "test-clinic-id",
      invoice_id: "test-invoice-id",
      numero_nfe: "000000001",
      serie_nfe: 1,
      chave_nfe: "test-chave-nfe-12345",
      valor_total: 1000.0,
      status: "generated",
      xml_content: "<xml>NFE XML content</xml>",
      emission_date: new Date().toISOString(),
    }),
    emitNFE: jest.fn().mockResolvedValue({
      status: "emitted",
      chave_nfe: "test-chave-nfe-12345",
      protocolo: "test-protocol-67890",
      data_emissao: new Date().toISOString(),
      codigo_verificacao: "VER123456",
      link_visualizacao: "https://nfe.prefeitura.sp.gov.br/nfe/12345",
    }),
    cancelNFE: jest.fn().mockResolvedValue({
      status: "cancelled",
      chave_nfe: "test-chave-nfe-12345",
      protocolo_cancelamento: "cancel-protocol-123",
      motivo_cancelamento: "Erro na emissão",
      data_cancelamento: new Date().toISOString(),
    }),
    consultarStatusNFE: jest.fn().mockResolvedValue({
      status: "authorized",
      situacao: "Normal",
      protocolo: "test-protocol-67890",
      data_autorizacao: new Date().toISOString(),
      municipio: "São Paulo",
      codigo_municipio: "3550308",
    }),
    retransmitirNFE: jest.fn().mockResolvedValue({
      status: "retransmitted",
      chave_nfe: "test-chave-nfe-12345",
      novo_protocolo: "retrans-protocol-999",
      data_retransmissao: new Date().toISOString(),
    }),
  })),
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: () => mockSupabase,
}));

// Import NFE API handlers
import {
  DELETE as nfeDELETE,
  GET as nfeGET,
  POST as nfePOST,
  PUT as nfePUT,
} from "@/app/api/tax/nfe/route";

describe("NFE API - Story 5.5 AC1: Automated NFSe Generation and Submission", () => {
  const testClinicId = "test-clinic-id";
  const testInvoiceId = "test-invoice-id";
  const testNFEId = "test-nfe-id";

  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tax/nfe - NFE Listing and Status", () => {
    it("should list NFEs for a clinic", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?clinic_id=${testClinicId}&action=list`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty("numero_nfe");
      expect(result.data[0]).toHaveProperty("chave_nfe");
      expect(result.pagination).toHaveProperty("total");
    });

    it("should get specific NFE details", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?nfe_id=${testNFEId}&action=details`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveProperty("id");
      expect(result.data).toHaveProperty("numero_nfe");
      expect(result.data).toHaveProperty("chave_nfe");
      expect(result.data.clinic_id).toBe(testClinicId);
    });

    it("should check NFE status with municipal authority", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?nfe_id=${testNFEId}&action=status`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveProperty("status");
      expect(result.data).toHaveProperty("situacao");
      expect(result.data).toHaveProperty("protocolo");
      expect(result.data.status).toBe("authorized");
    });

    it("should download NFE XML", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?nfe_id=${testNFEId}&action=download&format=xml`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveProperty("download_url");
      expect(result.data).toHaveProperty("filename");
      expect(result.data.format).toBe("xml");
    });

    it("should filter NFEs by date range", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-12-31";
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?clinic_id=${testClinicId}&action=list&start_date=${startDate}&end_date=${endDate}`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.filters).toEqual({
        start_date: startDate,
        end_date: endDate,
      });
    });

    it("should filter NFEs by status", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/nfe?clinic_id=${testClinicId}&action=list&status=emitted`,
      );

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.filters).toEqual({ status: "emitted" });
    });
  });

  describe("POST /api/tax/nfe - NFE Generation and Operations", () => {
    it("should generate new NFE", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          clinic_id: testClinicId,
          invoice_id: testInvoiceId,
          customer: {
            cnpj: "12345678000190",
            razao_social: "EMPRESA TESTE LTDA",
            endereco: {
              logradouro: "Rua Teste",
              numero: "123",
              bairro: "Centro",
              municipio: "São Paulo",
              uf: "SP",
              cep: "01000-000",
            },
          },
          services: [
            {
              codigo_servico: "1.01",
              descricao: "Consulta médica",
              valor_unitario: 200.0,
              quantidade: 1,
              valor_total: 200.0,
              iss_retido: false,
            },
          ],
          emit_immediately: false,
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.data).toHaveProperty("nfe_id");
      expect(result.data).toHaveProperty("numero_nfe");
      expect(result.data).toHaveProperty("chave_nfe");
      expect(result.data.status).toBe("generated");
    });

    it("should emit NFE to municipal authority", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "emit",
          nfe_id: testNFEId,
          force_emission: false,
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.status).toBe("emitted");
      expect(result.data).toHaveProperty("chave_nfe");
      expect(result.data).toHaveProperty("protocolo");
      expect(result.data).toHaveProperty("link_visualizacao");
    });

    it("should generate and emit NFE immediately", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          clinic_id: testClinicId,
          invoice_id: testInvoiceId,
          customer: {
            cpf: "12345678901",
            nome: "PACIENTE TESTE",
            endereco: {
              logradouro: "Rua Teste",
              numero: "456",
              bairro: "Vila Nova",
              municipio: "São Paulo",
              uf: "SP",
              cep: "02000-000",
            },
          },
          services: [
            {
              codigo_servico: "4.01",
              descricao: "Cirurgia estética",
              valor_unitario: 5000.0,
              quantidade: 1,
              valor_total: 5000.0,
            },
          ],
          emit_immediately: true,
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.data.status).toBe("emitted");
      expect(result.data).toHaveProperty("protocolo");
    });

    it("should cancel NFE", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "cancel",
          nfe_id: testNFEId,
          motivo_cancelamento: "Erro na emissão do documento fiscal",
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.status).toBe("cancelled");
      expect(result.data).toHaveProperty("protocolo_cancelamento");
      expect(result.data).toHaveProperty("motivo_cancelamento");
    });

    it("should retransmit NFE", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "retransmit",
          nfe_id: testNFEId,
          motivo_retransmissao: "Problemas na transmissão original",
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.status).toBe("retransmitted");
      expect(result.data).toHaveProperty("novo_protocolo");
      expect(result.data).toHaveProperty("data_retransmissao");
    });

    it("should validate NFE data before generation", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "validate",
          clinic_id: testClinicId,
          customer: {
            cnpj: "12345678000190",
            razao_social: "EMPRESA TESTE LTDA",
          },
          services: [
            {
              codigo_servico: "1.01",
              descricao: "Consulta médica",
              valor_unitario: 200.0,
              quantidade: 1,
              valor_total: 200.0,
            },
          ],
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data).toHaveProperty("validation_details");
    });

    it("should handle batch NFE generation", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "batch-generate",
          clinic_id: testClinicId,
          invoices: [
            {
              invoice_id: "invoice-001",
              customer: {
                cnpj: "12345678000190",
                razao_social: "EMPRESA TESTE 1 LTDA",
              },
              services: [
                {
                  codigo_servico: "1.01",
                  descricao: "Consulta 1",
                  valor_total: 200.0,
                },
              ],
            },
            {
              invoice_id: "invoice-002",
              customer: {
                cpf: "98765432109",
                nome: "PACIENTE TESTE 2",
              },
              services: [
                {
                  codigo_servico: "4.01",
                  descricao: "Procedimento 2",
                  valor_total: 1500.0,
                },
              ],
            },
          ],
          emit_immediately: false,
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.batch_id).toBeDefined();
      expect(result.data.total_processed).toBe(2);
      expect(result.data.results).toHaveLength(2);
    });
  });

  describe("PUT /api/tax/nfe - NFE Updates", () => {
    it("should update NFE metadata", async () => {
      const request = new NextRequest(`http://localhost/api/tax/nfe`, {
        method: "PUT",
        body: JSON.stringify({
          nfe_id: testNFEId,
          updates: {
            observacoes: "NFE atualizada para inclusão de observações",
            informacoes_adicionais: "Informações complementares do procedimento",
          },
        }),
      });

      const response = await nfePUT(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveProperty("id");
      expect(result.data.status).toBeDefined();
    });
  });

  describe("DELETE /api/tax/nfe - NFE Removal", () => {
    it("should delete NFE (logical deletion)", async () => {
      const request = new NextRequest(`http://localhost/api/tax/nfe?nfe_id=${testNFEId}`);

      const response = await nfeDELETE(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe("NFE deleted successfully");
      expect(result.data.deleted_at).toBeDefined();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle missing clinic_id parameter", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe?action=list");

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("clinic_id parameter is required");
    });

    it("should handle invalid NFE ID", async () => {
      const request = new NextRequest(
        "http://localhost/api/tax/nfe?nfe_id=invalid-id&action=details",
      );

      // Mock database error for invalid ID
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: "NFE not found" },
              }),
            ),
          })),
        })),
      });

      const response = await nfeGET(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe("NFE not found");
    });

    it("should handle missing required fields for NFE generation", async () => {
      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          clinic_id: testClinicId,
          // Missing required fields: invoice_id, customer, services
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Missing required fields: invoice_id, customer, services");
    });

    it("should handle NFE emission failures", async () => {
      // Mock emission failure
      jest
        .mocked(require("@/lib/services/tax/nfe-service").NFEIntegrationService)
        .mockImplementationOnce(() => ({
          emitNFE: jest.fn().mockRejectedValue(new Error("Municipal service unavailable")),
        }));

      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "emit",
          nfe_id: testNFEId,
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Failed to emit NFE");
      expect(result.details).toContain("Municipal service unavailable");
    });

    it("should handle database transaction failures", async () => {
      // Mock database transaction failure
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: "Database transaction failed" },
              }),
            ),
          })),
        })),
      });

      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          clinic_id: testClinicId,
          invoice_id: testInvoiceId,
          customer: {
            cpf: "12345678901",
            nome: "TESTE",
          },
          services: [
            {
              codigo_servico: "1.01",
              descricao: "Teste",
              valor_total: 100.0,
            },
          ],
        }),
      });

      const response = await nfePOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Failed to save NFE to database");
    });
  });

  describe("Performance Requirements - AC1", () => {
    it("should generate NFE within 3 seconds", async () => {
      const startTime = Date.now();

      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "generate",
          clinic_id: testClinicId,
          invoice_id: testInvoiceId,
          customer: {
            cpf: "12345678901",
            nome: "PERFORMANCE TEST",
          },
          services: [
            {
              codigo_servico: "1.01",
              descricao: "Performance test service",
              valor_total: 100.0,
            },
          ],
          emit_immediately: false,
        }),
      });

      const response = await nfePOST(request);
      const endTime = Date.now();

      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds
    });

    it("should emit NFE within 5 seconds", async () => {
      const startTime = Date.now();

      const request = new NextRequest("http://localhost/api/tax/nfe", {
        method: "POST",
        body: JSON.stringify({
          action: "emit",
          nfe_id: testNFEId,
        }),
      });

      const response = await nfePOST(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it("should handle concurrent NFE generations efficiently", async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, index) => {
        return new NextRequest("http://localhost/api/tax/nfe", {
          method: "POST",
          body: JSON.stringify({
            action: "generate",
            clinic_id: testClinicId,
            invoice_id: `concurrent-invoice-${index}`,
            customer: {
              cpf: `1234567890${index}`,
              nome: `CONCURRENT TEST ${index}`,
            },
            services: [
              {
                codigo_servico: "1.01",
                descricao: `Concurrent service ${index}`,
                valor_total: 100.0 + index * 10,
              },
            ],
          }),
        });
      });

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests.map((request) => nfePOST(request)));
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Total time should be reasonable for concurrent processing
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds for 5 concurrent requests
    });
  });
});
