/**
 * Patient Service - Updated to use API endpoints instead of direct Supabase queries
 * Ensures LGPD compliance, proper RLS enforcement, audit trails, and authentication context
 */

import { apiClient, type ApiResponse, type PaginatedResponse } from '@/utils/api-client';

// Patient data types (maintaining existing interfaces)
export interface Patient {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  createdAt: string;
}

export interface CreatePatientData {
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    complement?: string;
  };
  healthcareInfo?: {
    allergies?: string[];
    medications?: string[];
    medicalHistory?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  lgpdConsent: {
    dataProcessing: boolean;
    marketing?: boolean;
    dataSharing?: boolean;
    consentDate?: string;
  };
  notes?: string;
}

export interface PatientAppointmentHistory {
  id: string;
  date: string;
  serviceName: string;
  professionalName: string;
  status: string;
  notes?: string;
}

export interface PatientListResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientSearchFilters {
  gender?: 'male' | 'female' | 'other';
  status?: string | string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    field?: 'createdAt' | 'updatedAt' | 'birthDate';
    start?: string;
    end?: string;
  };
  hasEmail?: boolean;
  hasPhone?: boolean;
  city?: string;
  state?: string;
  medicalConditions?: string[];
}

export interface PatientSearchCriteria {
  query?: string;
  searchType?: 'fulltext' | 'structured' | 'fuzzy' | 'advanced';
  filters?: PatientSearchFilters;
  fuzzyOptions?: {
    threshold?: number;
    fields?: string[];
  };
  pagination?: {
    page?: number;
    limit?: number;
  };
  sorting?: {
    field?: 'name' | 'createdAt' | 'updatedAt' | 'birthDate';
    order?: 'asc' | 'desc';
  };
  includeInactive?: boolean;
}

/**
 * Patient Service class with API integration
 */
class PatientService {
  private readonly baseEndpoint = '/api/v2/patients';

  /**
   * Search patients by name or phone
   */
  async searchPatients(clinicId: string, query: string, limit = 10): Promise<Patient[]> {
    try {
      const searchCriteria: PatientSearchCriteria = {
        query,
        searchType: 'fulltext',
        pagination: { page: 1, limit },
        sorting: { field: 'name', order: 'asc' },
      };

      const response = await apiClient.post<{
        patients: Patient[];
        pagination: any;
        searchMetadata: any;
      }>(`${this.baseEndpoint}/search`, searchCriteria);

      if (!response.success) {
        throw new Error(response.error || 'Failed to search patients');
      }

      return response.data?.patients || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatient(patientId: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get<Patient>(`${this.baseEndpoint}/${patientId}`);

      if (!response.success) {
        if (response.code === 'NOT_FOUND') {
          return null;
        }
        throw new Error(response.error || 'Failed to get patient');
      }

      return response.data || null;
    } catch (error) {
      console.error('Error getting patient:', error);
      
      // Handle 404 errors gracefully
      if (error.status === 404) {
        return null;
      }
      
      throw error;
    }
  }

  /**
   * List patients with pagination and filtering
   */
  async listPatients(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    gender?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<PatientListResponse> {
    try {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.gender && { gender: params.gender }),
        sortBy: params.sortBy || 'name',
        sortOrder: params.sortOrder || 'asc',
      };

      const response = await apiClient.get<PatientListResponse>(
        this.baseEndpoint,
        queryParams
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to list patients');
      }

      return response.data || { patients: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('Error listing patients:', error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  async createPatient(data: CreatePatientData, clinicId: string, userId: string): Promise<Patient> {
    try {
      const response = await apiClient.post<Patient>(this.baseEndpoint, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create patient');
      }

      if (!response.data) {
        throw new Error('No patient data returned from API');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Update patient
   */
  async updatePatient(patientId: string, data: Partial<CreatePatientData>): Promise<Patient> {
    try {
      const response = await apiClient.put<Patient>(`${this.baseEndpoint}/${patientId}`, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update patient');
      }

      if (!response.data) {
        throw new Error('No patient data returned from API');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  async deletePatient(patientId: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseEndpoint}/${patientId}`);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  /**
   * Get patient appointment history
   */
  async getPatientAppointmentHistory(
    patientId: string,
    limit = 10,
  ): Promise<PatientAppointmentHistory[]> {
    try {
      const response = await apiClient.get<PatientAppointmentHistory[]>(
        `${this.baseEndpoint}/${patientId}/history`,
        { limit }
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to get patient appointment history');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error getting patient appointment history:', error);
      throw error;
    }
  }

  /**
   * Advanced patient search with complex criteria
   */
  async advancedSearch(criteria: PatientSearchCriteria): Promise<{
    patients: Patient[];
    pagination: any;
    searchMetadata: any;
  }> {
    try {
      const response = await apiClient.post<{
        patients: Patient[];
        pagination: any;
        searchMetadata: any;
      }>(`${this.baseEndpoint}/search`, criteria);

      if (!response.success) {
        throw new Error(response.error || 'Failed to perform advanced search');
      }

      return response.data || { patients: [], pagination: {}, searchMetadata: {} };
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }

  /**
   * Bulk operations on patients
   */
  async bulkAction(action: string, patientIds: string[], data?: any): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}/bulk-actions`, {
        action,
        patientIds,
        data,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to perform bulk action');
      }

      return response.data;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  }

  /**
   * Export patients data
   */
  async exportPatients(format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<Blob> {
    try {
      // Note: This would typically return a blob or file download URL
      // Implementation depends on the actual API response format
      const response = await apiClient.post(`${this.baseEndpoint}/export`, {
        format,
        filters,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to export patients');
      }

      // Return blob or handle download URL as appropriate
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } catch (error) {
      console.error('Error exporting patients:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const patientService = new PatientService();
export { PatientService };