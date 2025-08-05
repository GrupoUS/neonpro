// CNPJ Validation API Tests - Story 5.5 AC2
// Testing real-time CNPJ validation and customer verification
// Author: VoidBeast V6.0 Master Orchestrator

import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";

// Mock Supabase client for CNPJ operations
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: "test-validation-id",
                  cnpj: "12345678000190",
                  formatted_cnpj: "12.345.678/0001-90",
                  valid: true,
                  company_data: {
                    cnpj: "12345678000190",
                    razao_social: "CLINICA TESTE LTDA",
                    nome_fantasia: "Clínica Teste",
                    situacao: "ATIVA",
                  },
                  validated_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          ),
        })),
        single: jest.fn(() =>
          Promise.resolve({
            data: {
              id: "test-validation-id",
              cnpj: "12345678000190",
              formatted_cnpj: "12.345.678/0001-90",
              valid: true,
              company_data: {
                cnpj: "12345678000190",
                razao_social: "CLINICA TESTE LTDA",
                nome_fantasia: "Clínica Teste",
                situacao: "ATIVA",
              },
              validated_at: new Date().toISOString(),
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
            data: { id: "test-insert-id" },
            error: null,
          }),
        ),
      })),
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() =>
          Promise.resolve({
            data: { id: "test-upsert-id" },
            error: null,
          }),
        ),
      })),
    })),
  })),
};

// Mock CNPJ Validator Service
jest.mock("@/lib/services/brazilian-tax/cnpj-validator", () => ({
  CNPJValidator: jest.fn().mockImplementation(() => ({
    validateCNPJ: jest.fn().mockResolvedValue({
      valid: true,
      formatted: "12.345.678/0001-90",
      cnpj_clean: "12345678000190",
      check_digit_valid: true,
      format_valid: true,
      companyData: {
        cnpj: "12345678000190",
        razao_social: "CLINICA TESTE LTDA",
        nome_fantasia: "Clínica Teste",
        situacao: "ATIVA",
        data_situacao: "2020-01-01",
        tipo: "MATRIZ",
        porte: "MICRO EMPRESA",
        natureza_juridica: "206-2 - SOCIEDADE EMPRESARIA LIMITADA",
        atividade_principal: {
          code: "8630-5/01",
          text: "Atividade médica ambulatorial com recursos para procedimentos cirúrgicos",
        },
        atividades_secundarias: [],
        capital_social: 50000.0,
        endereco: {
          logradouro: "RUA TESTE",
          numero: "123",
          complemento: "SALA 101",
          bairro: "CENTRO",
          municipio: "SAO PAULO",
          uf: "SP",
          cep: "01000-000",
        },
        telefones: ["(11) 9999-9999"],
        email: "contato@clinicateste.com.br",
        data_abertura: "2020-01-01",
        ultima_atualizacao: new Date().toISOString(),
      },
      validation_source: "receita_federal",
      cached: false,
      response_time_ms: 450,
    }),

    validateCNPJBatch: jest.fn().mockResolvedValue({
      batch_id: "batch-12345",
      total_processed: 3,
      total_valid: 2,
      total_invalid: 1,
      processing_time_ms: 1200,
      results: [
        {
          cnpj_input: "12345678000190",
          valid: true,
          formatted: "12.345.678/0001-90",
          company_data: {
            razao_social: "EMPRESA TESTE 1 LTDA",
            situacao: "ATIVA",
          },
        },
        {
          cnpj_input: "98765432000111",
          valid: true,
          formatted: "98.765.432/0001-11",
          company_data: {
            razao_social: "EMPRESA TESTE 2 LTDA",
            situacao: "ATIVA",
          },
        },
        {
          cnpj_input: "11111111111111",
          valid: false,
          errors: ["Invalid CNPJ format", "Check digit validation failed"],
        },
      ],
    }),

    formatCNPJ: jest.fn().mockImplementation((cnpj) => {
      if (cnpj === "12345678000190") return "12.345.678/0001-90";
      return cnpj;
    }),

    cleanCNPJ: jest.fn().mockImplementation((cnpj) => {
      return cnpj.replace(/[^\d]/g, "");
    }),
  })),
}));

jest.mock("@/app/utils/supabase/server", () => ({
  createClient: () => mockSupabase,
}));

// Import CNPJ API handlers
import { GET as cnpjGET, POST as cnpjPOST } from "@/app/api/tax/cnpj/route";

describe("CNPJ Validation API - Story 5.5 AC2: Real-time CNPJ Validation and Customer Verification", () => {
  const validCNPJ = "12345678000190";
  const invalidCNPJ = "11111111111111";
  const formattedCNPJ = "12.345.678/0001-90";

  beforeAll(() => {
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/tax/cnpj - CNPJ Validation and Lookup", () => {
    it("should validate CNPJ format and check digit", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data.cnpj).toBe(formattedCNPJ);
      expect(result.data.check_digit_valid).toBe(true);
      expect(result.data.format_valid).toBe(true);
    });

    it("should retrieve company data from Receita Federal", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&get_company_data=true`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data.company_data).toHaveProperty("razao_social");
      expect(result.data.company_data).toHaveProperty("situacao");
      expect(result.data.company_data).toHaveProperty("atividade_principal");
      expect(result.data.company_data.razao_social).toBe("CLINICA TESTE LTDA");
      expect(result.data.company_data.situacao).toBe("ATIVA");
    });

    it("should validate company status (active/inactive)", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&validate_status=true`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data.company_data.situacao).toBe("ATIVA");
      expect(result.data.status_valid).toBe(true);
    });

    it("should check cached validation results", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&use_cache=true`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data).toHaveProperty("cached");
    });

    it("should retrieve validation history for a CNPJ", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=history&cnpj=${validCNPJ}`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty("validated_at");
      expect(result.data[0].cnpj).toBe(validCNPJ);
    });

    it("should search companies by partial name", async () => {
      const request = new NextRequest(
        "http://localhost/api/tax/cnpj?action=search&query=CLINICA%20TESTE",
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toHaveProperty("razao_social");
      expect(result.data[0].razao_social).toContain("CLINICA TESTE");
    });

    it("should filter by business activity code", async () => {
      const request = new NextRequest(
        "http://localhost/api/tax/cnpj?action=search&activity_code=8630-5",
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.filters).toEqual({ activity_code: "8630-5" });
    });

    it("should handle invalid CNPJ gracefully", async () => {
      // Mock invalid CNPJ response
      jest
        .mocked(require("@/lib/services/brazilian-tax/cnpj-validator").CNPJValidator)
        .mockImplementationOnce(() => ({
          validateCNPJ: jest.fn().mockResolvedValue({
            valid: false,
            formatted: null,
            errors: ["Invalid CNPJ format", "Check digit validation failed"],
            validation_source: "local",
            response_time_ms: 50,
          }),
        }));

      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${invalidCNPJ}`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(false);
      expect(result.data.validation_errors).toContain("Invalid CNPJ format");
      expect(result.data.validation_errors).toContain("Check digit validation failed");
    });
  });

  describe("POST /api/tax/cnpj - Advanced CNPJ Operations", () => {
    it("should validate CNPJ with full company data retrieval", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate",
          cnpj: validCNPJ,
          validate_status: true,
          get_company_data: true,
          store_result: true,
          validate_activity: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data.company_data).toHaveProperty("razao_social");
      expect(result.data.company_data).toHaveProperty("atividade_principal");
      expect(result.data.company_data).toHaveProperty("endereco");
      expect(result.data.validation_id).toBeDefined();
    });

    it("should perform batch CNPJ validation", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "batch-validate",
          cnpjs: [validCNPJ, "98765432000111", invalidCNPJ],
          validate_status: true,
          get_company_data: false,
          store_results: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.batch_id).toBeDefined();
      expect(result.data.total_processed).toBe(3);
      expect(result.data.total_valid).toBe(2);
      expect(result.data.total_invalid).toBe(1);
      expect(result.data.results).toHaveLength(3);
    });

    it("should update company information cache", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "update-cache",
          cnpj: validCNPJ,
          force_update: true,
          validate_current_status: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.updated).toBe(true);
      expect(result.data.cache_id).toBeDefined();
      expect(result.data.company_data).toHaveProperty("ultima_atualizacao");
    });

    it("should validate CNPJ against blacklist", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate",
          cnpj: validCNPJ,
          check_blacklist: true,
          blacklist_sources: ["receita_federal", "spc", "serasa"],
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(true);
      expect(result.data.blacklist_check).toHaveProperty("clear");
      expect(result.data.blacklist_check.clear).toBe(true);
    });

    it("should validate business relationship eligibility", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate-relationship",
          cnpj: validCNPJ,
          relationship_type: "healthcare_client",
          validate_activity_compatibility: true,
          check_regulatory_compliance: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.relationship_eligible).toBe(true);
      expect(result.data.activity_compatible).toBe(true);
      expect(result.data.compliance_check).toHaveProperty("approved");
    });

    it("should format and clean CNPJ input", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "format",
          cnpj: "12.345.678/0001-90",
          output_format: "clean",
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.original).toBe("12.345.678/0001-90");
      expect(result.data.formatted).toBe(validCNPJ);
      expect(result.data.clean).toBe(validCNPJ);
    });

    it("should generate validation report", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "generate-report",
          cnpj: validCNPJ,
          report_type: "comprehensive",
          include_history: true,
          include_related_companies: false,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.report_id).toBeDefined();
      expect(result.data.report_type).toBe("comprehensive");
      expect(result.data.generation_date).toBeDefined();
      expect(result.data.sections).toContain("company_data");
      expect(result.data.sections).toContain("validation_history");
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle missing CNPJ parameter", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj?action=validate");

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("CNPJ parameter is required");
    });

    it("should handle invalid action parameter", async () => {
      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=invalid&cnpj=${validCNPJ}`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Invalid action parameter");
    });

    it("should handle Receita Federal API unavailability", async () => {
      // Mock API unavailability
      jest
        .mocked(require("@/lib/services/brazilian-tax/cnpj-validator").CNPJValidator)
        .mockImplementationOnce(() => ({
          validateCNPJ: jest.fn().mockRejectedValue(new Error("Receita Federal API unavailable")),
        }));

      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&get_company_data=true`,
      );

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(503);
      expect(result.error).toBe("External validation service unavailable");
      expect(result.details).toContain("Receita Federal API unavailable");
    });

    it("should handle database errors gracefully", async () => {
      // Mock database error
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: { message: "Database connection failed" },
              }),
            ),
          })),
        })),
      });

      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate",
          cnpj: validCNPJ,
          store_result: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Failed to store validation result");
    });

    it("should handle malformed CNPJ input", async () => {
      const malformedCNPJ = "abc123def456";

      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${malformedCNPJ}`,
      );

      // Mock malformed input response
      jest
        .mocked(require("@/lib/services/brazilian-tax/cnpj-validator").CNPJValidator)
        .mockImplementationOnce(() => ({
          validateCNPJ: jest.fn().mockResolvedValue({
            valid: false,
            errors: ["CNPJ must contain only numbers"],
            validation_source: "local",
            response_time_ms: 10,
          }),
        }));

      const response = await cnpjGET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.valid).toBe(false);
      expect(result.data.validation_errors).toContain("CNPJ must contain only numbers");
    });

    it("should handle empty batch validation request", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "batch-validate",
          cnpjs: [],
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("CNPJs array cannot be empty");
    });

    it("should handle batch validation with too many CNPJs", async () => {
      const largeBatch = Array.from(
        { length: 101 },
        (_, i) => `1234567800019${i.toString().padStart(1, "0")}`,
      );

      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "batch-validate",
          cnpjs: largeBatch,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Batch size exceeds maximum limit of 100 CNPJs");
    });
  });

  describe("Performance Requirements - AC2", () => {
    it("should complete CNPJ validation within 1 second", async () => {
      const startTime = Date.now();

      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}`,
      );

      const response = await cnpjGET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it("should complete company data retrieval within 2 seconds", async () => {
      const startTime = Date.now();

      const request = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&get_company_data=true`,
      );

      const response = await cnpjGET(request);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
    });

    it("should handle high-frequency validation requests efficiently", async () => {
      const concurrentRequests = Array.from({ length: 10 }, () => {
        return cnpjGET(
          new NextRequest(`http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}`),
        );
      });

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Total time should be reasonable for concurrent processing
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds for 10 concurrent requests
    });

    it("should maintain accuracy under load testing", async () => {
      const testCNPJs = [validCNPJ, "98765432000111", "11223344000155"];
      const validationPromises = testCNPJs.map((cnpj) =>
        cnpjGET(new NextRequest(`http://localhost/api/tax/cnpj?action=validate&cnpj=${cnpj}`)),
      );

      const responses = await Promise.all(validationPromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      // All requests should return valid results
      results.forEach((result, _index) => {
        expect(result.data).toHaveProperty("valid");
        expect(result.data.cnpj || result.data.validation_errors).toBeDefined();
      });
    });

    it("should cache validation results efficiently", async () => {
      // First request - should hit external API
      const firstRequest = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&get_company_data=true`,
      );
      const firstStartTime = Date.now();
      const firstResponse = await cnpjGET(firstRequest);
      const firstEndTime = Date.now();

      // Second request - should use cache
      const secondRequest = new NextRequest(
        `http://localhost/api/tax/cnpj?action=validate&cnpj=${validCNPJ}&use_cache=true`,
      );
      const secondStartTime = Date.now();
      const secondResponse = await cnpjGET(secondRequest);
      const secondEndTime = Date.now();

      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);

      // Cached request should be significantly faster
      const firstDuration = firstEndTime - firstStartTime;
      const secondDuration = secondEndTime - secondStartTime;
      expect(secondDuration).toBeLessThan(firstDuration * 0.5); // At least 50% faster
    });
  });

  describe("Integration with Brazilian Tax Ecosystem", () => {
    it("should validate healthcare business eligibility", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate-healthcare-eligibility",
          cnpj: validCNPJ,
          check_cnes_registration: true,
          check_cfm_compliance: true,
          check_anvisa_license: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.healthcare_eligible).toBeDefined();
      expect(result.data.regulatory_checks).toHaveProperty("cnes");
      expect(result.data.regulatory_checks).toHaveProperty("cfm");
      expect(result.data.regulatory_checks).toHaveProperty("anvisa");
    });

    it("should validate aesthetic clinic certification", async () => {
      const request = new NextRequest("http://localhost/api/tax/cnpj", {
        method: "POST",
        body: JSON.stringify({
          action: "validate-aesthetic-clinic",
          cnpj: validCNPJ,
          check_medical_licenses: true,
          check_aesthetic_procedures_permit: true,
          validate_professional_team: true,
        }),
      });

      const response = await cnpjPOST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.aesthetic_clinic_certified).toBeDefined();
      expect(result.data.certifications).toHaveProperty("medical_licenses");
      expect(result.data.certifications).toHaveProperty("aesthetic_procedures");
    });
  });
});
