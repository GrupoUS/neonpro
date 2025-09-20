/**
 * AI Agent Service
 * Handles API communication with the AI agent backend
 */

import {
  DataAgentRequest,
  DataAgentResponse,
  ValidDataAgentRequest,
  ValidDataAgentResponse,
  safeValidate,
  DataAgentRequestSchema,
  DataAgentResponseSchema,
} from "@neonpro/types";

export class AIAgentService {
  private baseUrl: string;
  private getToken: () => Promise<string>;

  constructor(options: { baseUrl?: string; getToken: () => Promise<string> }) {
    this.baseUrl = options.baseUrl || "/api";
    this.getToken = options.getToken;
  }

  /**
   * Send query to AI agent
   */
  async sendQuery(
    query: string,
    context?: {
      userId?: string;
      domain?: string;
      limit?: number;
      filters?: Record<string, any>;
    },
  ): Promise<ValidDataAgentResponse> {
    try {
      const request: DataAgentRequest = {
        query,
        context,
      };

      // Validate request
      const validatedRequest = safeValidate(DataAgentRequestSchema, request);
      if (!validatedRequest.success) {
        throw new Error(`Invalid request: ${validatedRequest.error.message}`);
      }

      const response = await fetch(`${this.baseUrl}/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(validatedRequest.data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate response
      const validatedResponse = safeValidate(DataAgentResponseSchema, data);
      if (!validatedResponse.success) {
        throw new Error(`Invalid response: ${validatedResponse.error.message}`);
      }

      return validatedResponse.data;
    } catch (error) {
      console.error("AI Agent service error:", error);
      throw error;
    }
  }

  /**
   * Export data
   */
  async exportData(payload: {
    type: "clients" | "appointments" | "financial";
    filters?: Record<string, any>;
    format?: "xlsx" | "csv" | "pdf";
  }): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  }

  /**
   * Get agent health status
   */
  async getHealthStatus(): Promise<{
    status: "healthy" | "unhealthy";
    timestamp: string;
    version?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Health check error:", error);
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get suggestions based on query
   */
  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getToken()}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error("Suggestions error:", error);
      return [];
    }
  }
}

// Create default instance
export const aiAgentService = new AIAgentService({
  getToken: async () => {
    // This should be replaced with actual token retrieval logic
    const token = localStorage.getItem("auth-token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return token;
  },
});
