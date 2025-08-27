/**
 * 👥 Enhanced Patient Management Hooks - NeonPro Healthcare
 * ==========================================================
 *
 * Type-safe patient management hooks with Zod validation,
 * LGPD compliance, audit logging, and healthcare-specific features.
 */

// Import our enhanced API client
import { ApiHelpers, apiClient } from "@neonpro/shared/api-client";
import type { ApiResponse } from "@neonpro/shared/api-client";
// Import validation schemas and types
import {
  CreatePatientSchema,
  PatientDataExportResponseSchema,
  PatientDataExportSchema,
  PatientQuerySchema,
  PatientResponseSchema,
  PatientStatsSchema,
  PatientsListResponseSchema,
  UpdatePatientSchema,
} from "@neonpro/shared/schemas";
import type {
  Address,
  CreatePatient,
  EmergencyContact,
  Medication,
  PatientBase,
  PatientDataExport,
  PatientDataExportResponse,
  PatientQuery,
  PatientResponse,
  UpdatePatient,
} from "@neonpro/shared/schemas";
import { useCallback, useMemo } from "react";
// Import our enhanced query utilities
import {
  HealthcareQueryConfig,
  InvalidationHelpers,
  QueryKeys,
  useHealthcareQueryUtils,
} from "@/lib/query/query-utils";

// Patient management context interface
export interface PatientManagementContext {
  // Basic operations
  createPatient: ReturnType<typeof useCreatePatient>;
  updatePatient: ReturnType<typeof useUpdatePatient>;
  deletePatient: ReturnType<typeof useDeletePatient>;

  // Data retrieval
  getPatient: (id: string) => ReturnType<typeof usePatient>;
  getPatients: (filters?: PatientQuery) => ReturnType<typeof usePatients>;
  getPatientStats: ReturnType<typeof usePatientStats>;

  // LGPD compliance
  exportPatientData: ReturnType<typeof useExportPatientData>;

  // Utility functions
  utils: ReturnType<typeof usePatientUtils>;
}

// 👤 Get single patient with validation and audit logging
export function usePatient(id: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.patients.detail(id),
    queryFn: async () => {
      const response = await apiClient.api.v1.patients[":id"].$get({
        param: { id },
      });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = PatientResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || "Failed to fetch patient");
      }
      return response.data?.patient;
    },
    enableAuditLogging: true,
    sensitiveData: true,
    lgpdCompliant: true,

    // Patient data configuration
    staleTime: HealthcareQueryConfig.patient.staleTime,
    gcTime: HealthcareQueryConfig.patient.gcTime,

    retry: (failureCount, error) => {
      // Don't retry on permission or not found errors
      if (
        ApiHelpers.isAuthError(error) ||
        (error as any)?.message?.includes("not found")
      ) {
        return false;
      }
      return failureCount < 1; // Conservative retry for patient data
    },
  });
}

// 👥 Get patients list with advanced filtering and pagination
export function usePatients(filters?: PatientQuery) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.patients.list(filters),
    queryFn: async () => {
      // Validate query parameters
      const validatedFilters = filters ? PatientQuerySchema.parse(filters) : {};

      const response = await apiClient.api.v1.patients.$get({
        query: validatedFilters as any,
      });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = PatientsListResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || "Failed to fetch patients");
      }
      return {
        patients: response.data?.patients,
        pagination: response.data?.pagination,
        summary: response.data?.summary,
      };
    },
    enableAuditLogging: true,
    sensitiveData: true,
    lgpdCompliant: true,

    // Patient data configuration
    staleTime: HealthcareQueryConfig.patient.staleTime,
    gcTime: HealthcareQueryConfig.patient.gcTime,
  });
}

// 🏗️ Create new patient with validation and consent management
export function useCreatePatient() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      patientData: CreatePatient,
    ): Promise<ApiResponse<PatientResponse["data"]>> => {
      // Validate patient data including LGPD consent
      const validatedData = CreatePatientSchema.parse(patientData);

      // Ensure LGPD consent is provided
      if (!validatedData.lgpd_consent) {
        throw new Error(
          "Consentimento LGPD é obrigatório para cadastrar um paciente",
        );
      }

      const response = await apiClient.api.v1.patients.$post({
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = PatientResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || "Failed to create patient");
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: false, // Creation includes consent
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: "Paciente cadastrado com sucesso",

    // Invalidate patient lists after creation
    invalidateQueries: [QueryKeys.patients.all(), QueryKeys.patients.stats()],

    onSuccess: (response, _variables) => {
      // Log patient creation for audit
      const user = apiClient.auth.getUser();
      if (user && response.patient) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: "create",
          resource_type: "patient",
          resource_id: response.patient.id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// ✏️ Update patient with validation and change tracking
export function useUpdatePatient(id: string) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      patientData: UpdatePatient,
    ): Promise<ApiResponse<PatientResponse["data"]>> => {
      // Validate update data
      const validatedData = UpdatePatientSchema.parse(patientData);

      const response = await apiClient.api.v1.patients[":id"].$put({
        param: { id },
        json: validatedData,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = PatientResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(response.error?.code || "Failed to update patient");
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: "Dados do paciente atualizados",

    // Invalidate related queries
    invalidateQueries: [
      QueryKeys.patients.detail(id),
      QueryKeys.patients.all(),
    ],

    // Optimistic update for better UX
    ...queryUtils.createOptimisticUpdate<PatientBase>(
      QueryKeys.patients.detail(id),
      (oldData) =>
        oldData ? { ...oldData, ...patientData } : (oldData as PatientBase),
    ),

    onSuccess: (_response, _variables) => {
      // Log patient update for audit
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: "update",
          resource_type: "patient",
          resource_id: id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },
  });
}

// 🗑️ Delete patient with LGPD compliance
export function useDeletePatient() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (id: string): Promise<ApiResponse<void>> => {
      const response = await apiClient.api.v1.patients[":id"].$delete({
        param: { id },
      });

      return await response.json();
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: "Paciente removido com sucesso",

    // Invalidate all patient data
    invalidateQueries: [QueryKeys.patients.all(), QueryKeys.patients.stats()],

    onSuccess: (_response, id) => {
      // Clear patient from cache
      queryUtils.clearSensitiveUserData(id);

      // Log patient deletion for audit
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: "delete",
          resource_type: "patient",
          resource_id: id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }
    },

    onMutate: async (id: string) => {
      // Show confirmation dialog before deletion
      const confirmed = window.confirm(
        "Tem certeza que deseja remover este paciente? Esta ação não pode ser desfeita.",
      );

      if (!confirmed) {
        throw new Error("Operação cancelada pelo usuário");
      }

      return { id };
    },
  });
}

// 📊 Get patient statistics
export function usePatientStats() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.patients.stats(),
    queryFn: async () => {
      const response = await apiClient.api.v1.patients.stats.$get();
      return await response.json();
    },
    validator: (data: unknown) => PatientStatsSchema.parse(data),
    enableAuditLogging: false, // Stats don't need audit logging
    sensitiveData: false,
    lgpdCompliant: true,

    // Stats can be cached longer
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// 🏥 Get patients by clinic
export function useClinicPatients(
  clinicId: string,
  filters?: Omit<PatientQuery, "clinic_id">,
) {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createQuery({
    queryKey: QueryKeys.patients.list({ ...filters, clinic_id: clinicId }),
    queryFn: async () => {
      const queryFilters = { ...filters, clinic_id: clinicId };
      const validatedFilters = PatientQuerySchema.parse(queryFilters);

      const response = await apiClient.api.v1.patients.$get({
        query: validatedFilters as any,
      });
      return await response.json();
    },
    validator: (data: unknown) => {
      const response = PatientsListResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(
          response.error?.code || "Failed to fetch clinic patients",
        );
      }
      return {
        patients: response.data?.patients,
        pagination: response.data?.pagination,
      };
    },
    enableAuditLogging: true,
    sensitiveData: true,
    lgpdCompliant: true,

    // Clinic patient data configuration
    staleTime: HealthcareQueryConfig.patient.staleTime,
    gcTime: HealthcareQueryConfig.patient.gcTime,
  });
}

// 📋 Export patient data for LGPD compliance
export function useExportPatientData() {
  const queryUtils = useHealthcareQueryUtils();

  return queryUtils.createMutation({
    mutationFn: async (
      exportRequest: PatientDataExport,
    ): Promise<ApiResponse<PatientDataExportResponse["data"]>> => {
      // Validate export request
      const validatedRequest = PatientDataExportSchema.parse(exportRequest);

      const response = await apiClient.api.v1.patients[":id"].export.$post({
        param: { id: validatedRequest.patient_id },
        json: validatedRequest,
      });

      return await response.json();
    },

    validator: (data: unknown) => {
      const response = PatientDataExportResponseSchema.parse(data);
      if (!response.success) {
        throw new Error(
          response.error?.code || "Failed to export patient data",
        );
      }
      return response.data!;
    },

    enableAuditLogging: true,
    requiresConsent: true,
    lgpdCompliant: true,
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: "Dados exportados com sucesso",

    onSuccess: (response, variables) => {
      // Log data export for compliance
      const user = apiClient.auth.getUser();
      if (user) {
        apiClient.audit.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          sessionId: apiClient.auth.getSessionId() || undefined,
          action: "export",
          resource_type: "patient",
          resource_id: variables.patient_id,
          ip_address: apiClient.utils.getClientIP(),
          user_agent: apiClient.utils.getUserAgent(),
          success: true,
        });
      }

      // Auto-download the file if URL is provided
      if (response.download_url) {
        const link = document.createElement("a");
        link.href = response.download_url;
        link.download = `patient-data-${variables.patient_id}.${response.format}`;
        document.body.append(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
}

// 🔍 Search patients with advanced filtering
export function useSearchPatients() {
  const queryUtils = useHealthcareQueryUtils();

  return useCallback(
    (searchQuery: string, filters?: Partial<PatientQuery>) => {
      return queryUtils.createQuery({
        queryKey: QueryKeys.patients.list({ ...filters, search: searchQuery }),
        queryFn: async () => {
          const queryFilters = PatientQuerySchema.parse({
            ...filters,
            search: searchQuery,
          });

          const response = await apiClient.api.v1.patients.$get({
            query: queryFilters as any,
          });
          return await response.json();
        },
        validator: (data: unknown) => {
          const response = PatientsListResponseSchema.parse(data);
          if (!response.success) {
            throw new Error(
              response.error?.code || "Failed to search patients",
            );
          }
          return response.data?.patients;
        },
        enableAuditLogging: true,
        sensitiveData: true,
        lgpdCompliant: true,

        // Search results can be more fresh
        staleTime: 1000 * 30, // 30 seconds
        gcTime: 1000 * 60 * 2, // 2 minutes

        // Don't fetch if search query is too short
        enabled: searchQuery.length >= 2,
      });
    },
    [queryUtils],
  );
}

// 🛠️ Patient utilities hook
export function usePatientUtils() {
  const queryUtils = useHealthcareQueryUtils();

  return useMemo(
    () => ({
      // Validate patient data
      validatePatientData: (data: unknown): CreatePatient => {
        return CreatePatientSchema.parse(data);
      },

      // Format patient name
      formatPatientName: (patient: PatientBase): string => {
        return `${patient.first_name} ${patient.last_name}`;
      },

      // Calculate patient age
      calculateAge: (birthDate: string): number => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
          age--;
        }

        return age;
      },

      // Format patient contact
      formatPatientContact: (patient: PatientBase): string => {
        return `${patient.phone} | ${patient.email}`;
      },

      // Get primary address
      getPrimaryAddress: (patient: PatientBase): Address | null => {
        return (
          patient.addresses.find((addr) => addr.is_primary) ||
          patient.addresses[0] ||
          undefined
        );
      },

      // Get primary emergency contact
      getPrimaryEmergencyContact: (
        patient: PatientBase,
      ): EmergencyContact | null => {
        return (
          patient.emergency_contacts.find((contact) => contact.is_primary) ||
          patient.emergency_contacts[0] ||
          undefined
        );
      },

      // Check LGPD consent status
      checkConsentStatus: (patient: PatientBase) => {
        const consentDate = new Date(patient.lgpd_consent_date);
        const expiryDate = new Date(
          consentDate.getTime() + 365 * 24 * 60 * 60 * 1000,
        ); // 1 year
        const isExpired = expiryDate < new Date();
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
        );

        return {
          hasConsent: true,
          isExpired,
          expiryDate,
          daysUntilExpiry,
          needsRenewal: daysUntilExpiry <= 30 && !isExpired,
        };
      },

      // Format medical conditions
      formatMedicalConditions: (patient: PatientBase): string => {
        const conditions = [
          ...patient.medical_history
            .filter((h) => h.status === "active")
            .map((h) => h.condition),
          ...patient.allergies
            .filter((a) => a.is_active)
            .map((a) => a.allergen),
        ];

        return conditions.length > 0
          ? conditions.join(", ")
          : "Nenhuma condição registrada";
      },

      // Get current medications
      getCurrentMedications: (patient: PatientBase): Medication[] => {
        return patient.medications.filter((med) => med.is_active);
      },

      // Calculate BMI if height and weight available
      calculateBMI: (patient: PatientBase): number | null => {
        if (!(patient.height && patient.weight)) {
          return;
        }

        const heightInMeters = patient.height / 100;
        return patient.weight / (heightInMeters * heightInMeters);
      },

      // Format BMI with classification
      formatBMIWithClassification: (bmi: number): string => {
        let classification = "";
        if (bmi < 18.5) {
          classification = "Abaixo do peso";
        } else if (bmi < 25) {
          classification = "Peso normal";
        } else if (bmi < 30) {
          classification = "Sobrepeso";
        } else {
          classification = "Obesidade";
        }

        return `${bmi.toFixed(1)} (${classification})`;
      },

      // Invalidate patient data
      invalidatePatient: (patientId: string) => {
        InvalidationHelpers.invalidatePatientData(
          queryUtils.queryClient,
          patientId,
        );
      },

      // Invalidate all patient data
      invalidateAllPatients: () => {
        InvalidationHelpers.invalidatePatientData(queryUtils.queryClient);
      },

      // Clear patient from cache (for LGPD compliance)
      clearPatientData: (patientId: string) => {
        queryUtils.clearSensitiveUserData(patientId);
      },

      // Export patient data
      exportPatientData: async (patientId: string) => {
        return await queryUtils.exportUserData(patientId);
      },
    }),
    [queryUtils],
  );
}

// 🎯 Complete patient management context hook
export function usePatientManagement(): PatientManagementContext {
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient;
  const deletePatient = useDeletePatient();
  const getPatientStats = usePatientStats();
  const exportPatientData = useExportPatientData();
  const utils = usePatientUtils();

  return useMemo<PatientManagementContext>(
    () => ({
      // Basic operations
      createPatient,
      updatePatient,
      deletePatient,

      // Data retrieval
      getPatient: usePatient,
      getPatients: usePatients,
      getPatientStats,

      // LGPD compliance
      exportPatientData,

      // Utility functions
      utils,
    }),
    [
      createPatient,
      updatePatient,
      deletePatient,
      getPatientStats,
      exportPatientData,
      utils,
    ],
  );
}

// All hooks are exported individually using 'export function' above
// No need for duplicate export block
