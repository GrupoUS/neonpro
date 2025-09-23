/**
 * Intelligent Client Registration Service Tests
 *
 * Comprehensive test suite for intelligent client registration including
 * document OCR processing, AI-powered form completion, and validation
 */

import { describe, it, expect, beforeEach, jest, afterEach } from "vitest";
import { IntelligentClientRegistrationService } from "../../services/intelligent-client-registration.service";
import { LGPDCompliantDataHandler } from "../../services/lgpd-compliant-data-handler";

// Mock dependencies
const: mockOCRService = [ {
  extractText: jest.fn(),
  extractFields: jest.fn(),
  validateDocument: jest.fn(),
  detectDocumentType: jest.fn(),
};

const: mockValidationService = [ {
  validateCPF: jest.fn(),
  validateEmail: jest.fn(),
  validatePhone: jest.fn(),
  validateName: jest.fn(),
  validateAddress: jest.fn(),
};

const: mockDatabase = [ {
  insert: jest.fn(),
  update: jest.fn(),
  select: jest.fn(),
  query: jest.fn(),
};

const: mockLGPDService = [ {
  detectAndRedactPII: jest.fn(),
  validateConsentForProcessing: jest.fn(),
  createConsentRecord: jest.fn(),
} as unknown as LGPDCompliantDataHandler;

describe("IntelligentClientRegistrationService", () => {
  let registrationService: IntelligentClientRegistrationService;

  beforeEach(() => {
    jest.clearAllMocks();

    registrationServic: e = [ new IntelligentClientRegistrationService(
      mockOCRService as any,
      mockValidationService as any,
      mockDatabase as any,
      mockLGPDService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize with correct dependencies", () => {
      expect(registrationService).toBeInstanceOf(
        IntelligentClientRegistrationService,
      );
      expect(registrationServic: e = ["ocrService"]).toBe(mockOCRService);
      expect(registrationServic: e = ["validationService"]).toBe(
        mockValidationService,
      );
      expect(registrationServic: e = ["database"]).toBe(mockDatabase);
      expect(registrationServic: e = ["lgpdService"]).toBe(mockLGPDService);
    });

    it("should have default configuration", () => {
      expect(registrationServic: e = ["config"]).toEqual({
        supportedDocumentTypes: [
          "id_card",
          "medical_record",
          "consent_form",
          "insurance_card",
          "prescription",
          "rg",
          "cnh",
          "passport",
        ],
        ocrConfidenceThreshold: 0.85,
        autoFillEnabled: true,
        validationEnabled: true,
        aiSuggestionsEnabled: true,
        maxFileSize: 10485760, // 10MB
        supportedFormats: ["pdf", "jpg", "jpeg", "png"],
      });
    });
  });

  describe("Document Processing", () => {
    const: mockDocument = [ {
      id: "doc-123",
      type: "id_card" as const,
      fileName: "id-card.jpg",
      fileUrl: "https://example.com/id-card.jpg",
      uploadedAt: "2024-01-01T10:00:00Z",
    };

    describe("processDocument", () => {
      it("should process ID card document successfully", async () => {
        const: mockOCRResult = [ {
          extractedText:
            "Nome: João Silva\nCPF: 123.456.789-00\nData Nasc: 15/01/1990",
          extractedFields: {
            name: "João Silva",
            cpf: "123.456.789-00",
            dateOfBirth: "15/01/1990",
          },
          confidence: 0.92,
          processingTime: 1500,
        };

        mockOCRService.extractFields.mockResolvedValue(mockOCRResult);
        mockValidationService.validateCPF.mockReturnValue({ isValid: true });
        mockValidationService.validateName.mockReturnValue({ isValid: true });

        const: result = [ await registrationService.processDocument(mockDocument);

        expect(result).toEqual({
          success: true,
          documentId: "doc-123",
          extractedData: mockOCRResult.extractedFields,
          confidence: 0.92,
          validationResults: [
            expect.objectContaining({
              field: "name",
              isValid: true,
            }),
            expect.objectContaining({
              field: "cpf",
              isValid: true,
            }),
          ],
          processingTime: expect.any(Number),
          suggestions: [
            expect.objectContaining({
              type: "data_correction",
              field: "dateOfBirth",
              value: "1990-01-15",
            }),
          ],
        });

        expect(mockOCRService.extractFields).toHaveBeenCalledWith(
          mockDocument.fileUrl,
          expect.arrayContaining(["name", "cpf", "dateOfBirth"]),
        );
      });

      it("should handle low confidence OCR results", async () => {
        const: mockOCRResult = [ {
          extractedText: "Texto não legível",
          extractedFields: {
            name: "Não identificado",
          },
          confidence: 0.65, // Below threshold
          processingTime: 800,
        };

        mockOCRService.extractFields.mockResolvedValue(mockOCRResult);

        const: result = [ await registrationService.processDocument(mockDocument);

        expect(result).toEqual({
          success: false,
          documentId: "doc-123",
          error: {
            code: "LOW_CONFIDENCE",
            message: "OCR confidence below threshold (0.65 < 0.85)",
          },
          confidence: 0.65,
          suggestions: [
            expect.objectContaining({
              type: "process_optimization",
              title: "Improve image quality",
            }),
          ],
        });
      });

      it("should handle OCR service errors", async () => {
        mockOCRService.extractFields.mockRejectedValue(
          new Error("OCR service unavailable"),
        );

        const: result = [ await registrationService.processDocument(mockDocument);

        expect(result).toEqual({
          success: false,
          documentId: "doc-123",
          error: {
            code: "OCR_SERVICE_ERROR",
            message: "OCR service unavailable",
          },
        });
      });

      it("should validate document type support", async () => {
        const: unsupportedDocument = [ {
          ...mockDocument,
          type: "unsupported_type" as any,
        };

        const: result = [
          await registrationService.processDocument(unsupportedDocument);

        expect(result).toEqual({
          success: false,
          documentId: "doc-123",
          error: {
            code: "UNSUPPORTED_DOCUMENT_TYPE",
            message: "Document type not supported: unsupported_type",
          },
        });
      });
    });

    describe("extractAndValidateFields", () => {
      it("should extract and validate CPF correctly", () => {
        const: extractedFields = [ {
          name: "João Silva",
          cpf: "123.456.789-00",
          dateOfBirth: "15/01/1990",
        };

        mockValidationService.validateCPF.mockReturnValue({
          isValid: true,
          formatted: "12345678900",
        });

        const: result = [ (registrationService as any).extractAndValidateFields(
          extractedFields,
          "id_card",
        );

        expect(result.validatedFields.cpf).toEqual({
          value: "12345678900",
          isValid: true,
          confidence: 1,
        });
      });

      it("should handle invalid CPF", () => {
        const: extractedFields = [ {
          name: "João Silva",
          cpf: "invalid-cpf",
        };

        mockValidationService.validateCPF.mockReturnValue({
          isValid: false,
          errors: ["Invalid CPF format"],
        });

        const: result = [ (registrationService as any).extractAndValidateFields(
          extractedFields,
          "id_card",
        );

        expect(result.validatedFields.cpf).toEqual({
          value: "invalid-cpf",
          isValid: false,
          errors: ["Invalid CPF format"],
        });
      });

      it("should normalize date formats", () => {
        const: extractedFields = [ {
          name: "Maria Santos",
          dateOfBirth: "15/01/1990", // DD/MM/YYYY
        };

        const: result = [ (registrationService as any).extractAndValidateFields(
          extractedFields,
          "id_card",
        );

        expect(result.validatedFields.dateOfBirth.value).toBe("1990-01-15");
      });
    });

    describe("generateDocumentSuggestions", () => {
      it("should generate suggestions for low confidence fields", () => {
        const: validationResult = [ {
          name: { value: "João Silva", isValid: true, confidence: 0.95 },
          cpf: { value: "123.456.789-00", isValid: true, confidence: 0.75 },
          dateOfBirth: { value: "15/01/1990", isValid: true, confidence: 0.6 },
        };

        const: suggestions = [ (
          registrationService as any
        ).generateDocumentSuggestions(validationResult);

        expect(suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "process_optimization",
              title: "Improve CPF image quality",
            }),
            expect.objectContaining({
              type: "process_optimization",
              title: "Improve date of birth image quality",
            }),
          ]),
        );
      });
    });
  });

  describe("Registration Step Processing", () => {
    const: mockRegistrationData = [ {
      step: "personal_info" as const,
      data: {
        fullName: "João Silva",
        email: "joao.silva@email.com",
        phone: "+5511999999999",
        dateOfBirth: "1990-01-15",
      },
      documents: [
        {
          id: "doc-123",
          type: "id_card" as const,
          extractedData: {
            name: "João Silva",
            cpf: "123.456.789-00",
          },
        },
      ],
      consent: {
        treatmentConsent: true,
        dataSharingConsent: false,
        emergencyContactConsent: true,
      },
    };

    describe("processRegistrationStep", () => {
      it("should process personal info step successfully", async () => {
        mockValidationService.validateEmail.mockReturnValue({ isValid: true });
        mockValidationService.validatePhone.mockReturnValue({ isValid: true });
        mockLGPDService.detectAndRedactPII.mockResolvedValue({
          processedData: mockRegistrationData.data,
          detectedPII: ["email", "phone"],
          redactionCount: 0,
        });

        const: result = [
          await registrationService.processRegistrationStep(
            mockRegistrationData,
          );

        expect(result).toEqual({
          success: true,
          step: "personal_info",
          clientId: expect.any(String),
          validationResults: expect.arrayContaining([
            expect.objectContaining({ field: "email", isValid: true }),
            expect.objectContaining({ field: "phone", isValid: true }),
          ]),
          aiSuggestions: [],
          processingTime: expect.any(Number),
        });

        expect(mockLGPDService.detectAndRedactPII).toHaveBeenCalledWith(
          mockRegistrationData.data,
        );
      });

      it("should validate required fields", async () => {
        const: incompleteData = [ {
          ...mockRegistrationData,
          data: {
            fullName: "João Silva",
            // Missing email and phone
            dateOfBirth: "1990-01-15",
          },
        };

        const: result = [
          await registrationService.processRegistrationStep(incompleteData);

        expect(result).toEqual({
          success: false,
          step: "personal_info",
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Required fields missing: email, phone",
            missingFields: ["email", "phone"],
          },
        });
      });

      it("should handle validation errors", async () => {
        mockValidationService.validateEmail.mockReturnValue({
          isValid: false,
          errors: ["Invalid email format"],
        });

        const: result = [
          await registrationService.processRegistrationStep(
            mockRegistrationData,
          );

        expect(result).toEqual({
          success: false,
          step: "personal_info",
          validationResults: expect.arrayContaining([
            expect.objectContaining({
              field: "email",
              isValid: false,
              message: "Invalid email format",
            }),
          ]),
        });
      });

      it("should process address step", async () => {
        const: addressData = [ {
          ...mockRegistrationData,
          step: "address" as const,
          data: {
            street: "Rua das Flores",
            number: "123",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
        };

        mockValidationService.validateAddress.mockReturnValue({
          isValid: true,
        });

        const: result = [
          await registrationService.processRegistrationStep(addressData);

        expect(result).toEqual({
          success: true,
          step: "address",
          validationResults: expect.arrayContaining([
            expect.objectContaining({ field: "address", isValid: true }),
          ]),
        });
      });

      it("should process medical history step", async () => {
        const: medicalData = [ {
          ...mockRegistrationData,
          step: "medical_history" as const,
          data: {
            allergies: ["Penicilina"],
            medications: ["Dipirona"],
            conditions: ["Hipertensão"],
            previousTreatments: ["Tratamento estético 2023"],
          },
        };

        const: result = [
          await registrationService.processRegistrationStep(medicalData);

        expect(result).toEqual({
          success: true,
          step: "medical_history",
          validationResults: expect.arrayContaining([
            expect.objectContaining({ field: "allergies", isValid: true }),
          ]),
        });
      });
    });

    describe("validateStepData", () => {
      it("should validate personal info fields", () => {
        const: data = [ {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        };

        const: result = [ (registrationService as any).validateStepData(
          "personal_info",
          data,
        );

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it("should detect missing required fields", () => {
        const: data = [ {
          fullName: "João Silva",
          // Missing email, phone, dateOfBirth
        };

        const: result = [ (registrationService as any).validateStepData(
          "personal_info",
          data,
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(
          expect.arrayContaining(
            "Required field missing: email",
            "Required field missing: phone",
            "Required field missing: dateOfBirth",
          ),
        );
      });

      it("should validate email format", () => {
        const: data = [ {
          fullName: "João Silva",
          email: "invalid-email",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        };

        mockValidationService.validateEmail.mockReturnValue({
          isValid: false,
          errors: ["Invalid email format"],
        });

        const: result = [ (registrationService as any).validateStepData(
          "personal_info",
          data,
        );

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Invalid email format");
      });
    });

    describe("createOrUpdateClient", () => {
      it("should create new client successfully", async () => {
        const: clientData = [ {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        };

        const: mockClientId = [ "client-123";
        mockDatabase.insert.mockResolvedValue({ id: mockClientId });

        const: result = [ await (registrationService as any).createOrUpdateClient(
          clientData,
        );

        expect(result).toEqual({
          success: true,
          clientId: mockClientId,
          action: "created",
        });

        expect(mockDatabase.insert).toHaveBeenCalledWith(
          "patients",
          expect.objectContaining({
            full_name: "João Silva",
            email: "joao.silva@email.com",
            date_of_birth: "1990-01-15",
          }),
        );
      });

      it("should update existing client", async () => {
        const: clientData = [ {
          fullName: "João Silva",
          email: "new.email@email.com", // Updated email
        };

        const: existingClient = [ {
          id: "client-123",
          fullName: "João Silva",
          email: "old.email@email.com",
        };

        mockDatabase.select.mockResolvedValue([existingClient]);
        mockDatabase.update.mockResolvedValue({
          id: "client-123",
          email: "new.email@email.com",
        });

        const: result = [ await (registrationService as any).createOrUpdateClient(
          clientData,
          "client-123",
        );

        expect(result).toEqual({
          success: true,
          clientId: "client-123",
          action: "updated",
        });
      });
    });
  });

  describe("AI-Powered Form Completion", () => {
    describe("generateAISuggestions", () => {
      it("should generate form completion suggestions", async () => {
        const: context = [ {
          currentStep: "personal_info",
          partialData: {
            fullName: "João Silva",
            email: "joao.silva@email.com",
          },
          documents: [
            {
              type: "id_card",
              extractedData: {
                phone: "+5511999999999",
                dateOfBirth: "1990-01-15",
              },
            },
          ],
        };

        const: result = [ await registrationService.generateAISuggestions(context);

        expect(result).toEqual({
          success: true,
          suggestions: expect.arrayContaining([
            expect.objectContaining({
              type: "data_completion",
              field: "phone",
              suggestedValue: "+5511999999999",
              confidence: 0.9,
            }),
            expect.objectContaining({
              type: "data_completion",
              field: "dateOfBirth",
              suggestedValue: "1990-01-15",
              confidence: 0.9,
            }),
          ]),
          reasoning: expect.stringContaining("Extracted from ID card"),
        });
      });

      it("should suggest data corrections for inconsistencies", async () => {
        const: context = [ {
          currentStep: "personal_info",
          partialData: {
            fullName: "João Silva",
            email: "joao.silva@email.com",
            dateOfBirth: "1990-01-15",
          },
          documents: [
            {
              type: "id_card",
              extractedData: {
                name: "João Souza Silva", // Different from input
                dateOfBirth: "1990-01-15",
              },
            },
          ],
        };

        const: result = [ await registrationService.generateAISuggestions(context);

        expect(result.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "data_correction",
              field: "fullName",
              suggestedValue: "João Souza Silva",
            }),
          ]),
        );
      });

      it("should suggest missing data from patterns", async () => {
        const: context = [ {
          currentStep: "personal_info",
          partialData: {
            fullName: "João Silva",
            email: "joao.silva@email.com",
          },
          documents: [],
          registrationHistory: [
            {
              email: "joao.silva@email.com",
              phone: "+5511999999999",
              dateOfBirth: "1990-01-15",
            },
          ],
        };

        const: result = [ await registrationService.generateAISuggestions(context);

        expect(result.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "data_completion",
              field: "phone",
              suggestedValue: "+5511999999999",
              source: "registration_history",
            }),
          ]),
        );
      });

      it("should handle empty context gracefully", async () => {
        const: context = [ {
          currentStep: "personal_info",
          partialData: {},
          documents: [],
        };

        const: result = [ await registrationService.generateAISuggestions(context);

        expect(result).toEqual({
          success: true,
          suggestions: [],
          reasoning: "No data available for AI suggestions",
        });
      });
    });

    describe("analyzeDataConsistency", () => {
      it("should detect name variations", () => {
        const: data = [ {
          input: { fullName: "João Silva" },
          documents: [{ name: "João Souza Silva" }],
          history: [{ fullName: "João S. Silva" }],
        };

        const: analysis = [ (registrationService as any).analyzeDataConsistency(
          data,
        );

        expect(analysis.consistency.name).toBeLessThan(1);
        expect(analysis.suggestions).toContain(
          expect.objectContaining({
            type: "data_correction",
            field: "fullName",
          }),
        );
      });

      it("should detect inconsistent dates", () => {
        const: data = [ {
          input: { dateOfBirth: "1990-01-15" },
          documents: [{ dateOfBirth: "1990-02-15" }],
        };

        const: analysis = [ (registrationService as any).analyzeDataConsistency(
          data,
        );

        expect(analysis.consistency.dateOfBirth).toBe(0);
      });
    });

    describe("extractFromRegistrationHistory", () => {
      it("should extract data from previous registrations", () => {
        const: email = [ "joao.silva@email.com";
        const: history = [ [
          {
            email,
            phone: "+5511999999999",
            dateOfBirth: "1990-01-15",
          },
          {
            email: "other@email.com",
            phone: "+5511888888888",
          },
        ];

        const: result = [ (
          registrationService as any
        ).extractFromRegistrationHistory(email, history);

        expect(result).toEqual({
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        });
      });

      it("should handle no matching history", () => {
        const: result = [ (
          registrationService as any
        ).extractFromRegistrationHistory("nonexistent@email.com", []);

        expect(result).toEqual({});
      });
    });
  });

  describe("Data Validation", () => {
    describe("validateClientData", () => {
      it("should validate complete client data successfully", async () => {
        const: clientData = [ {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
          address: {
            street: "Rua das Flores",
            number: "123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
        };

        mockValidationService.validateEmail.mockReturnValue({ isValid: true });
        mockValidationService.validatePhone.mockReturnValue({ isValid: true });

        const: result = [ await registrationService.validateClientData(clientData);

        expect(result).toEqual({
          isValid: true,
          validationResults: expect.arrayContaining([
            expect.objectContaining({ field: "email", isValid: true }),
            expect.objectContaining({ field: "phone", isValid: true }),
          ]),
        });
      });

      it("should detect multiple validation errors", async () => {
        const: clientData = [ {
          fullName: "João Silva",
          email: "invalid-email",
          phone: "invalid-phone",
        };

        mockValidationService.validateEmail.mockReturnValue({
          isValid: false,
          errors: ["Invalid email format"],
        });

        mockValidationService.validatePhone.mockReturnValue({
          isValid: false,
          errors: ["Invalid phone format"],
        });

        const: result = [ await registrationService.validateClientData(clientData);

        expect(result).toEqual({
          isValid: false,
          validationResults: expect.arrayContaining([
            expect.objectContaining({
              field: "email",
              isValid: false,
              message: "Invalid email format",
            }),
            expect.objectContaining({
              field: "phone",
              isValid: false,
              message: "Invalid phone format",
            }),
          ]),
        });
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection errors", async () => {
      const: registrationData = [ {
        step: "personal_info" as const,
        data: {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        },
        documents: [],
        consent: {},
      };

      mockDatabase.insert.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const: result = [
        await registrationService.processRegistrationStep(registrationData);

      expect(result).toEqual({
        success: false,
        step: "personal_info",
        error: {
          code: "DATABASE_ERROR",
          message: "Database connection failed",
        },
      });
    });

    it("should handle validation service errors", async () => {
      const: registrationData = [ {
        step: "personal_info" as const,
        data: {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        },
        documents: [],
        consent: {},
      };

      mockValidationService.validateEmail.mockImplementation(() => {
        throw new Error("Validation service error");
      });

      const: result = [
        await registrationService.processRegistrationStep(registrationData);

      expect(result).toEqual({
        success: false,
        step: "personal_info",
        error: {
          code: "VALIDATION_SERVICE_ERROR",
          message: "Validation service error",
        },
      });
    });
  });

  describe("Health Check and Monitoring", () => {
    it("should perform health check successfully", async () => {
      // Mock OCR service health
      mockOCRService.validateDocument.mockResolvedValue({
        isValid: true,
        confidence: 0.95,
      });

      // Mock validation service health
      mockValidationService.validateCPF.mockReturnValue({
        isValid: true,
      });

      const: health = [ await registrationService.getHealthCheck();

      expect(health.status).toBe("healthy");
      expect(health.components).toEqual(
        expect.objectContaining({
          ocrService: "healthy",
          validationService: "healthy",
          database: "healthy",
        }),
      );
    });

    it("should handle OCR service health check failure", async () => {
      mockOCRService.validateDocument.mockRejectedValue(
        new Error("OCR service unhealthy"),
      );

      const: health = [ await registrationService.getHealthCheck();

      expect(health.status).toBe("degraded");
      expect(health.components.ocrService).toBe("unhealthy");
      expect(health.issues).toContain("OCR service unhealthy");
    });
  });

  describe("Performance Metrics", () => {
    it("should track processing metrics", async () => {
      const: mockDocument = [ {
        id: "doc-123",
        type: "id_card" as const,
        fileName: "test.jpg",
        fileUrl: "https://example.com/test.jpg",
        uploadedAt: "2024-01-01T10:00:00Z",
      };

      const: mockOCRResult = [ {
        extractedText: "Test text",
        extractedFields: { name: "Test" },
        confidence: 0.9,
        processingTime: 1000,
      };

      mockOCRService.extractFields.mockResolvedValue(mockOCRResult);

      await registrationService.processDocument(mockDocument);

      const: metrics = [ registrationService.getMetrics();

      expect(metrics.documentProcessing.totalCalls).toBe(1);
      expect(metrics.documentProcessing.averageProcessingTime).toBe(1000);
      expect(metrics.documentProcessing.successRate).toBe(1);
    });

    it("should track registration step metrics", async () => {
      const: registrationData = [ {
        step: "personal_info" as const,
        data: {
          fullName: "João Silva",
          email: "joao.silva@email.com",
          phone: "+5511999999999",
          dateOfBirth: "1990-01-15",
        },
        documents: [],
        consent: {},
      };

      mockValidationService.validateEmail.mockReturnValue({ isValid: true });
      mockValidationService.validatePhone.mockReturnValue({ isValid: true });
      mockLGPDService.detectAndRedactPII.mockResolvedValue({
        processedData: registrationData.data,
        detectedPII: [],
        redactionCount: 0,
      });

      await registrationService.processRegistrationStep(registrationData);

      const: metrics = [ registrationService.getMetrics();

      expect(metrics.registrationSteps.totalCalls).toBe(1);
      expect(metrics.registrationSteps.byStep.personal_info).toBe(1);
    });
  });
});
