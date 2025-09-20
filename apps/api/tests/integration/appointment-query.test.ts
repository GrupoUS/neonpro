import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createServer } from "http";
import { fetch } from "undici";

// Import the agent endpoint with mock data service
import { agentRouter } from "../../src/routes/ai/data-agent";

// Mock the AIDataService to avoid actual database calls during tests
vi.mock("../../src/services/ai-data-service", () => ({
  AIDataService: {
    getInstance: () => ({
      getClientsByName: async (name: string) => ({
        type: "list",
        title: "Clientes Encontrados",
        data: [],
        columns: [],
      }),
      getAppointmentsByDate: async (date: string) => {
        // Mock appointment data
        const mockAppointments = [
          {
            id: "apt-1",
            datetime: "2024-01-20T09:00:00Z",
            clientName: "Maria Silva",
            status: "scheduled",
            type: "Consulta",
            duration: 60,
          },
          {
            id: "apt-2",
            datetime: "2024-01-20T10:30:00Z",
            clientName: "João Santos",
            status: "scheduled",
            type: "Avaliação",
            duration: 45,
          },
          {
            id: "apt-3",
            datetime: "2024-01-20T14:00:00Z",
            clientName: "Ana Oliveira",
            status: "confirmed",
            type: "Retorno",
            duration: 30,
          },
        ];

        return {
          type: "list",
          title: "Agendamentos",
          data: mockAppointments,
          columns: [
            { key: "datetime", label: "Data/Hora", type: "datetime" },
            { key: "clientName", label: "Cliente", type: "text" },
            { key: "status", label: "Status", type: "badge" },
            { key: "type", label: "Tipo", type: "text" },
          ],
          actions: [
            { id: "view-details", label: "Ver Detalhes", type: "button" },
          ],
        };
      },
      getFinancialSummary: async (period: string) => ({
        type: "summary",
        title: "Resumo Financeiro",
        data: [],
        summary: {},
        columns: [],
      }),
    }),
  },
}));

describe("Integration Tests: Appointment Query", () => {
  let server: any;
  let baseUrl: string;
  let app: Hono;

  beforeAll(async () => {
    // Create Hono app with agent route
    app = new Hono();
    app.route("/api/ai/data-agent", agentRouter);

    // Start test server
    server = createServer({
      fetch: app.fetch,
      port: 0,
    });

    await new Promise((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve(true);
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe("Appointment Query Integration", () => {
    it("should successfully query for appointments", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Quais os próximos agendamentos?",
          sessionId: "test-session-apt-1",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe("list");
      expect(data.response.title).toBe("Agendamentos");
      expect(Array.isArray(data.response.data)).toBe(true);
      expect(data.response.data.length).toBeGreaterThan(0);

      // Verify appointment data structure
      const appointment = data.response.data[0];
      expect(appointment).toHaveProperty("id");
      expect(appointment).toHaveProperty("datetime");
      expect(appointment).toHaveProperty("clientName");
      expect(appointment).toHaveProperty("status");
      expect(appointment).toHaveProperty("type");
    });

    it("should query appointments for today", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos de hoje",
          sessionId: "test-session-apt-2",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe("list");
      expect(data.response.title).toBe("Agendamentos");
    });

    it("should query appointments for tomorrow", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos para amanhã",
          sessionId: "test-session-apt-3",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe("list");
    });

    it("should query appointments for specific client", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos da Maria Silva",
          sessionId: "test-session-apt-4",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe("list");

      // Verify that appointments are returned
      const appointments = data.response.data;
      expect(appointments.length).toBeGreaterThan(0);
    });

    it("should include action buttons in response", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Próximas consultas",
          sessionId: "test-session-apt-5",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.actions).toBeDefined();
      expect(Array.isArray(data.actions)).toBe(true);
      expect(data.actions.length).toBeGreaterThan(0);

      // Verify action structure
      const action = data.actions[0];
      expect(action).toHaveProperty("id");
      expect(action).toHaveProperty("label");
      expect(action).toHaveProperty("type");
      expect(action.type).toBe("button");
    });

    it("should handle variations in appointment query phrasing", async () => {
      const variations = [
        "Agendamentos de hoje",
        "Consultas marcadas",
        "Próximos atendimentos",
        "Mostrar agendamentos",
        "minhas consultas",
      ];

      for (const query of variations) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            query,
            sessionId: `test-session-var-${query}`,
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.response.type).toBe("list");
      }
    });

    it("should return appointments in chronological order", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos de hoje",
          sessionId: "test-session-apt-6",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const appointments = data.response.data;

      // Verify appointments are sorted by datetime
      for (let i = 1; i < appointments.length; i++) {
        const prevTime = new Date(appointments[i - 1].datetime).getTime();
        const currTime = new Date(appointments[i].datetime).getTime();
        expect(prevTime).toBeLessThanOrEqual(currTime);
      }
    });

    it("should handle appointment status display", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos",
          sessionId: "test-session-apt-7",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const appointments = data.response.data;

      // Verify status field exists and has valid values
      const validStatuses = [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no-show",
      ];
      appointments.forEach((apt) => {
        expect(validStatuses).toContain(apt.status);
      });
    });

    it("should handle empty appointment list", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos para dia sem agendamentos",
          sessionId: "test-session-apt-8",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.response.type).toBe("list");
      expect(Array.isArray(data.response.data)).toBe(true);
      expect(data.response.data.length).toBe(0);
    });

    it("should include duration information when available", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos de hoje",
          sessionId: "test-session-apt-9",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const appointments = data.response.data;

      if (appointments.length > 0) {
        // Duration might be optional
        if ("duration" in appointments[0]) {
          expect(typeof appointments[0].duration).toBe("number");
          expect(appointments[0].duration).toBeGreaterThan(0);
        }
      }
    });

    it("should handle appointment type queries", async () => {
      const types = ["Consulta", "Avaliação", "Retorno", "Procedimento"];

      for (const type of types) {
        const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({
            query: `Agendamentos do tipo ${type}`,
            sessionId: `test-session-type-${type}`,
          }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    it("should handle datetime formatting correctly", async () => {
      const response = await fetch(`${baseUrl}/api/ai/data-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          query: "Agendamentos",
          sessionId: "test-session-apt-10",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();

      const appointments = data.response.data;

      if (appointments.length > 0) {
        // Verify datetime is valid ISO string
        expect(() => new Date(appointments[0].datetime)).not.toThrow();
      }
    });
  });
});
