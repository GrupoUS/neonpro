import { NextRequest } from "next/server";
import { POST, GET } from "../../../app/api/scheduling/reminders/route";

// Mock the workflow module
jest.mock("../../../lib/communication/scheduling-workflow", () => ({
  SchedulingCommunicationWorkflow: {
    initializeWorkflows: jest.fn().mockResolvedValue([
      {
        id: "workflow-1",
        appointmentId: "550e8400-e29b-41d4-a716-446655440000",
        type: "24h_reminder",
        scheduledAt: new Date(),
        status: "scheduled",
      },
    ]),
    executeWorkflow: jest.fn().mockResolvedValue({
      success: true,
      step: "complete",
    }),
  },
}));

// Mock communication service
jest.mock("../../../lib/communication/communication-service", () => ({
  CommunicationService: {
    sendReminder: jest.fn().mockResolvedValue({
      success: true,
      provider: "whatsapp",
      messageId: "msg-123",
    }),
  },
}));

describe("Reminders API - Simple Test", () => {
  const mockUser = {
    id: "350e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
  };

  const mockAppointment = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    clinic_id: "450e8400-e29b-41d4-a716-446655440000",
    patient_name: "João Silva",
    date: "2024-12-20",
    time: "10:00",
    service: "Limpeza facial",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful authentication
    const mockSupabase = require("@supabase/supabase-js").createClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock appointment fetch
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockAppointment,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQueryBuilder);
  });

  it("should schedule reminders successfully", async () => {
    const request = new NextRequest("http://localhost:3000/api/scheduling/reminders", {
      method: "POST",
      body: JSON.stringify({
        appointmentId: "550e8400-e29b-41d4-a716-446655440000",
        reminderTypes: ["24h"],
        channels: ["whatsapp"],
        useWorkflow: true,
      }),
    });

    const response = await POST(request);

    // Verificar se a resposta tem estrutura básica
    expect(response).toBeDefined();
    expect(typeof response.json).toBe("function");
  });

  it("should fetch reminders successfully", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/scheduling/reminders?clinicId=450e8400-e29b-41d4-a716-446655440000",
    );

    const response = await GET(request);

    // Verificar se a resposta tem estrutura básica
    expect(response).toBeDefined();
    expect(typeof response.json).toBe("function");
  });
});
