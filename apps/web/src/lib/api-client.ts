import type { AppType } from "@neonpro/api";
import { hc } from "hono/client";

/**
 * Hono RPC Client for NeonPro API
 * Type-safe API calls with automatic serialization
 */

// Environment variables - Fixed API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004";

// Create typed Hono client
export const apiClient = hc<AppType>(API_BASE_URL, {
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Authentication utilities
 */
export class AuthApiClient {
  private static getAuthHeaders(token?: string) {
    if (!token) {
      // Try to get token from localStorage (client-side only)
      if (typeof window !== "undefined") {
        token = localStorage.getItem("authToken");
      }
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async login(credentials: {
    email: string;
    password: string;
    tenantId: string;
  }) {
    const response = await apiClient.api.auth.login.$post({
      json: credentials,
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  }

  static async logout(token?: string) {
    const response = await apiClient.api.auth.logout.$post(
      {},
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.json();
  }

  static async refreshToken(refreshToken: string) {
    const response = await apiClient.api.auth.refresh.$post({
      json: { refreshToken },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  }
}

/**
 * Patients API utilities
 */
export class PatientsApiClient {
  private static getAuthHeaders(token?: string) {
    if (!token) {
      if (typeof window !== "undefined") {
        token = localStorage.getItem("authToken");
      }
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    token?: string;
  }) {
    const { token, ...queryParams } = params || {};

    const response = await apiClient.api.patients.$get(
      { query: queryParams },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch patients");
    }

    return response.json();
  }

  static async getPatient(id: string, token?: string) {
    const response = await apiClient.api.patients[":id"].$get(
      { param: { id } },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch patient");
    }

    return response.json();
  }

  static async createPatient(data: {
    name: string;
    email: string;
    phone?: string;
    cpf: string;
    birthDate: string;
    token?: string;
  }) {
    const { token, ...patientData } = data;

    const response = await apiClient.api.patients.$post(
      { json: patientData },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create patient");
    }

    return response.json();
  }

  static async updatePatient(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      token?: string;
    },
  ) {
    const { token, ...updateData } = data;

    const response = await apiClient.api.patients[":id"].$patch(
      {
        param: { id },
        json: updateData,
      },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update patient");
    }

    return response.json();
  }
}

/**
 * Appointments API utilities
 */
export class AppointmentsApiClient {
  private static getAuthHeaders(token?: string) {
    if (!token) {
      if (typeof window !== "undefined") {
        token = localStorage.getItem("authToken");
      }
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async getAppointments(params?: {
    date?: string;
    patientId?: string;
    status?: string;
    token?: string;
  }) {
    const { token, ...queryParams } = params || {};

    const response = await apiClient.api.appointments.$get(
      { query: queryParams },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    return response.json();
  }

  static async createAppointment(data: {
    patientId: string;
    dateTime: string;
    duration: number;
    serviceId: string;
    notes?: string;
    token?: string;
  }) {
    const { token, ...appointmentData } = data;

    const response = await apiClient.api.appointments.$post(
      { json: appointmentData },
      {
        headers: this.getAuthHeaders(token),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create appointment");
    }

    return response.json();
  }
}

/**
 * Health check utility
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.health.$get();
    return response.ok;
  } catch {
    return false;
  }
};

// Export the main client for custom usage
export { apiClient as api };
export default apiClient;
