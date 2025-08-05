import type { createClient } from "@/lib/supabase/client";
import type { FHIR } from "@/lib/types/fhir";
import type {
  createPatient,
  deletePatient,
  getPatient,
  getPatientStats,
  PatientFormData,
  searchPatients,
  updatePatient,
} from "../patients";

// Mock the Supabase client
jest.mock("@/lib/supabase/client");

const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

const mockPatientData: PatientFormData = {
  name: "João Silva Santos",
  cpf: "12345678901",
  rg: "123456789",
  birthDate: "1990-01-15",
  gender: "male",
  phone: "11987654321",
  email: "joao@email.com",
  address: {
    zipCode: "01234567",
    street: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    neighborhood: "Centro",
    number: "123",
    complement: "Apt 45",
  },
  emergencyContact: {
    name: "Maria Silva",
    relationship: "spouse",
    phone: "11987654322",
  },
  medicalInfo: {
    allergies: ["Penicilina"],
    conditions: ["Hipertensão"],
    medications: ["Losartana 50mg"],
    bloodType: "O+",
    observations: "Paciente com histórico familiar de diabetes",
  },
  insuranceInfo: {
    hasInsurance: true,
    provider: "Unimed",
    planType: "particular",
    cardNumber: "123456789",
    validUntil: "2025-12-31",
  },
  consents: {
    basic: true,
    marketing: false,
    healthCommunication: true,
    analytics: false,
    surveys: true,
  },
};

const mockFHIRPatient: FHIR.Patient = {
  resourceType: "Patient",
  id: "123",
  identifier: [
    {
      type: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0203",
            code: "TAX",
            display: "Tax ID number",
          },
        ],
      },
      system: "http://rnds.saude.gov.br/fhir/r4/NamingSystem/cpf",
      value: "12345678901",
    },
  ],
  name: [
    {
      use: "official",
      text: "João Silva Santos",
      family: "Santos",
      given: ["João", "Silva"],
    },
  ],
  gender: "male",
  birthDate: "1990-01-15",
};

describe("Patient Supabase Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPatient", () => {
    it("successfully creates a patient with valid data", async () => {
      const mockInsertResult = {
        data: [{ id: 123, medical_record_number: "MR001" }],
        error: null,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockInsertResult),
        select: jest.fn().mockReturnThis(),
      });

      const result = await createPatient(mockPatientData);

      expect(mockSupabase.from).toHaveBeenCalledWith("patients");
      expect(result).toEqual({
        success: true,
        data: { id: 123, medical_record_number: "MR001" },
      });
    });

    it("handles database errors gracefully", async () => {
      const mockError = { message: "Duplicate CPF", code: "23505" };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
        select: jest.fn().mockReturnThis(),
      });

      const result = await createPatient(mockPatientData);

      expect(result).toEqual({
        success: false,
        error: "Duplicate CPF",
      });
    });

    it("transforms data to FHIR-compliant format", async () => {
      const mockInsertResult = {
        data: [{ id: 123, medical_record_number: "MR001" }],
        error: null,
      };

      const insertMock = jest.fn().mockResolvedValue(mockInsertResult);
      mockSupabase.from.mockReturnValue({
        insert: insertMock,
        select: jest.fn().mockReturnThis(),
      });

      await createPatient(mockPatientData);

      const insertedData = insertMock.mock.calls[0][0];

      // Check FHIR structure
      expect(insertedData.fhir_data.resourceType).toBe("Patient");
      expect(insertedData.fhir_data.name[0].text).toBe("João Silva Santos");
      expect(insertedData.fhir_data.gender).toBe("male");
      expect(insertedData.fhir_data.birthDate).toBe("1990-01-15");

      // Check identifiers
      expect(insertedData.fhir_data.identifier).toHaveLength(2); // CPF and RG

      // Check CPF identifier
      const cpfIdentifier = insertedData.fhir_data.identifier.find(
        (id: any) => id.system === "http://rnds.saude.gov.br/fhir/r4/NamingSystem/cpf",
      );
      expect(cpfIdentifier.value).toBe("12345678901");
    });

    it("includes LGPD consent data", async () => {
      const mockInsertResult = {
        data: [{ id: 123, medical_record_number: "MR001" }],
        error: null,
      };

      const insertMock = jest.fn().mockResolvedValue(mockInsertResult);
      mockSupabase.from.mockReturnValue({
        insert: insertMock,
        select: jest.fn().mockReturnThis(),
      });

      await createPatient(mockPatientData);

      const insertedData = insertMock.mock.calls[0][0];

      // Check LGPD consent mapping
      expect(insertedData.lgpd_consents.basic_processing).toBe(true);
      expect(insertedData.lgpd_consents.marketing_communication).toBe(false);
      expect(insertedData.lgpd_consents.health_communication).toBe(true);
      expect(insertedData.lgpd_consents.analytics_processing).toBe(false);
      expect(insertedData.lgpd_consents.surveys_research).toBe(true);
    });
  });

  describe("getPatient", () => {
    it("retrieves patient by ID successfully", async () => {
      const mockPatientRecord = {
        id: 123,
        medical_record_number: "MR001",
        fhir_data: mockFHIRPatient,
        lgpd_consents: {
          basic_processing: true,
          marketing_communication: false,
        },
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPatientRecord,
          error: null,
        }),
      });

      const result = await getPatient(123);

      expect(mockSupabase.from).toHaveBeenCalledWith("patients");
      expect(result).toEqual({
        success: true,
        data: mockPatientRecord,
      });
    });

    it("handles patient not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: "PGRST116", message: "The result contains 0 rows" },
        }),
      });

      const result = await getPatient(999);

      expect(result).toEqual({
        success: false,
        error: "Patient not found",
      });
    });
  });

  describe("updatePatient", () => {
    it("updates patient data successfully", async () => {
      const updatedData = { ...mockPatientData, name: "João Silva Santos Jr." };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id: 123, medical_record_number: "MR001" }],
          error: null,
        }),
      });

      const result = await updatePatient(123, updatedData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 123, medical_record_number: "MR001" });
    });

    it("handles update errors", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Update failed" },
        }),
      });

      const result = await updatePatient(123, mockPatientData);

      expect(result).toEqual({
        success: false,
        error: "Update failed",
      });
    });
  });

  describe("deletePatient", () => {
    it("soft deletes patient successfully", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 123 }],
          error: null,
        }),
      });

      const result = await deletePatient(123);

      expect(result.success).toBe(true);
    });

    it("handles deletion errors", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "Patient not found" },
        }),
      });

      const result = await deletePatient(999);

      expect(result).toEqual({
        success: false,
        error: "Patient not found",
      });
    });
  });

  describe("searchPatients", () => {
    it("searches patients by name successfully", async () => {
      const mockResults = [
        { id: 1, medical_record_number: "MR001", fhir_data: { name: [{ text: "João Silva" }] } },
        { id: 2, medical_record_number: "MR002", fhir_data: { name: [{ text: "João Santos" }] } },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockResults,
          error: null,
          count: 2,
        }),
      });

      const result = await searchPatients({
        query: "João",
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data?.patients).toHaveLength(2);
      expect(result.data?.total).toBe(2);
    });

    it("filters by status correctly", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      });

      await searchPatients({
        query: "João",
        status: "active",
        page: 1,
        limit: 10,
      });

      const mockCalls = mockSupabase.from().eq.mock.calls;
      expect(mockCalls.some((call) => call[0] === "status" && call[1] === "active")).toBe(true);
    });
  });

  describe("getPatientStats", () => {
    it("retrieves patient statistics successfully", async () => {
      const mockStats = {
        total_patients: 150,
        active_patients: 140,
        new_this_month: 15,
        avg_age: 35.5,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await getPatientStats();

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_patient_statistics");
      expect(result).toEqual({
        success: true,
        data: mockStats,
      });
    });

    it("handles statistics retrieval errors", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Function not found" },
      });

      const result = await getPatientStats();

      expect(result).toEqual({
        success: false,
        error: "Function not found",
      });
    });
  });

  describe("FHIR Data Transformation", () => {
    it("correctly transforms Brazilian address to FHIR format", async () => {
      const insertMock = jest.fn().mockResolvedValue({
        data: [{ id: 123 }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
        select: jest.fn().mockReturnThis(),
      });

      await createPatient(mockPatientData);

      const fhirData = insertMock.mock.calls[0][0].fhir_data;
      const address = fhirData.address[0];

      expect(address.use).toBe("home");
      expect(address.type).toBe("physical");
      expect(address.line).toContain("Rua das Flores, 123");
      expect(address.city).toBe("São Paulo");
      expect(address.state).toBe("SP");
      expect(address.postalCode).toBe("01234567");
      expect(address.country).toBe("BR");
    });

    it("correctly transforms emergency contact to FHIR RelatedPerson", async () => {
      const insertMock = jest.fn().mockResolvedValue({
        data: [{ id: 123 }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
        select: jest.fn().mockReturnThis(),
      });

      await createPatient(mockPatientData);

      const fhirData = insertMock.mock.calls[0][0].fhir_data;
      const contact = fhirData.contact[0];

      expect(contact.relationship[0].coding[0].code).toBe("C");
      expect(contact.name.text).toBe("Maria Silva");
      expect(contact.telecom[0].value).toBe("11987654322");
    });
  });
});
