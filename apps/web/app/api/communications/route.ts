/**
 * Consolidated Communications API
 * Handles all communication operations: email, SMS, WhatsApp, push notifications
 * Consolidates: notifications/*, email/*, sms/*, whatsapp/*, communication/messages
 *
 * For aesthetic clinic patient communication and engagement
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface CommunicationRequest {
  action?: "send" | "status" | "preferences" | "analytics" | "test";
  provider?: "email" | "sms" | "whatsapp" | "push";
  data?: {
    recipient?: string;
    message?: string;
    subject?: string;
    template?: string;
    variables?: Record<string, string>;
    scheduledAt?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    messageId?: string;
    patientId?: string;
    appointmentId?: string;
    preferences?: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
      push: boolean;
    };
  };
}

interface Message {
  messageId: string;
  recipient: string;
  provider: "email" | "sms" | "whatsapp" | "push";
  subject?: string;
  content: string;
  status: "pending" | "sent" | "delivered" | "failed" | "read";
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  scheduledAt?: string;
  priority: "low" | "normal" | "high" | "urgent";
  metadata?: {
    patientId?: string;
    appointmentId?: string;
    template?: string;
    variables?: Record<string, string>;
  };
}

interface CommunicationPreferences {
  patientId: string;
  email: {
    enabled: boolean;
    address: string;
    frequency: "immediate" | "daily" | "weekly";
  };
  sms: {
    enabled: boolean;
    number: string;
    frequency: "immediate" | "daily";
  };
  whatsapp: {
    enabled: boolean;
    number: string;
    frequency: "immediate" | "daily";
  };
  push: {
    enabled: boolean;
    deviceTokens: string[];
  };
  preferences: {
    appointmentReminders: boolean;
    promotionalMessages: boolean;
    treatmentUpdates: boolean;
    emergencyAlerts: boolean;
  };
}

interface CommunicationAnalytics {
  totalMessages: number;
  byProvider: {
    email: { sent: number; delivered: number; opened: number; };
    sms: { sent: number; delivered: number; };
    whatsapp: { sent: number; delivered: number; read: number; };
    push: { sent: number; delivered: number; opened: number; };
  };
  deliveryRates: {
    email: number;
    sms: number;
    whatsapp: number;
    push: number;
  };
  engagementRates: {
    email: number;
    whatsapp: number;
    push: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

interface CommunicationResponse {
  success: boolean;
  action?: string;
  data?: {
    message?: Message;
    messages?: Message[];
    preferences?: CommunicationPreferences;
    analytics?: CommunicationAnalytics;
    testResult?: {
      provider: string;
      status: "success" | "failed";
      details: string;
    };
  };
  message?: string;
}

// GET /api/communications - Get communication overview
// GET /api/communications?action=status&messageId=... - Get message status
// GET /api/communications?action=preferences&patientId=... - Get patient preferences
// GET /api/communications?action=analytics - Get communication analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const messageId = searchParams.get("messageId");
    const patientId = searchParams.get("patientId");

    const requestData: CommunicationRequest = {
      action: action as CommunicationRequest["action"],
      data: {
        messageId: messageId || undefined,
        patientId: patientId || undefined,
      },
    };

    switch (action) {
      case "status":
        return handleMessageStatus(requestData);

      case "preferences":
        return handlePreferences(requestData);

      case "analytics":
        return handleAnalytics(requestData);

      default:
        return handleCommunicationOverview(requestData);
    }
  } catch (error) {
    console.error("Communications API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/communications - Send messages, update preferences, run tests
export async function POST(request: NextRequest) {
  try {
    const body: CommunicationRequest = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { success: false, message: "Action required" },
        { status: 400 },
      );
    }

    switch (body.action) {
      case "send":
        return handleSendMessage(body);

      case "test":
        return handleTestCommunication(body);

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Communications API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/communications - Update preferences
export async function PUT(request: NextRequest) {
  try {
    const body: CommunicationRequest = await request.json();

    if (body.action === "preferences") {
      return handleUpdatePreferences(body);
    }

    return NextResponse.json(
      { success: false, message: "Invalid action for PUT" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Communications API PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler functions
async function handleCommunicationOverview(
  request: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock communication overview
  const overview = {
    totalMessages: 2450,
    todayMessages: 85,
    deliveryRate: 94.2,
    engagementRate: 67.8,
    activeProviders: ["email", "sms", "whatsapp", "push"],
    recentMessages: 12,
    byProvider: {
      email: { sent: 1200, delivered: 1134, opened: 680, read: 650 },
      sms: { sent: 850, delivered: 825, opened: 620, read: 600 },
      whatsapp: { sent: 300, delivered: 290, opened: 200, read: 180 },
      push: { sent: 100, delivered: 95, opened: 45, read: 40 },
    },
    deliveryRates: { email: 94.5, sms: 97.1, whatsapp: 96.7, push: 95 },
    engagementRates: { email: 56.7, sms: 72.9, whatsapp: 66.7, push: 45 },
    period: { startDate: new Date().toISOString(), endDate: new Date().toISOString() },
  };

  return NextResponse.json({
    success: true,
    data: { analytics: overview },
  } as CommunicationResponse);
}

async function handleMessageStatus(
  request: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock message status
  const message: Message = {
    messageId: request.data?.messageId || "msg-123",
    recipient: "patient@example.com",
    provider: "email",
    subject: "Appointment Reminder",
    content: "Your appointment is scheduled for tomorrow at 2:00 PM",
    status: "delivered",
    sentAt: "2024-01-27T10:00:00Z",
    deliveredAt: "2024-01-27T10:01:30Z",
    priority: "normal",
    metadata: {
      patientId: "patient-123",
      appointmentId: "apt-456",
      template: "appointment_reminder",
    },
  };

  return NextResponse.json({
    success: true,
    action: "status",
    data: { message },
  });
}

async function handlePreferences(
  request: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock patient preferences
  const preferences: CommunicationPreferences = {
    patientId: request.data?.patientId || "patient-123",
    email: {
      enabled: true,
      address: "patient@example.com",
      frequency: "immediate",
    },
    sms: {
      enabled: true,
      number: "+55 11 99999-9999",
      frequency: "immediate",
    },
    whatsapp: {
      enabled: false,
      number: "+55 11 99999-9999",
      frequency: "daily",
    },
    push: {
      enabled: true,
      deviceTokens: ["token-123", "token-456"],
    },
    preferences: {
      appointmentReminders: true,
      promotionalMessages: false,
      treatmentUpdates: true,
      emergencyAlerts: true,
    },
  };

  return NextResponse.json({
    success: true,
    action: "preferences",
    data: { preferences },
  });
}

async function handleAnalytics(
  request: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock analytics data
  const analytics: CommunicationAnalytics = {
    totalMessages: 2450,
    byProvider: {
      email: { sent: 1200, delivered: 1140, opened: 684 },
      sms: { sent: 800, delivered: 776 },
      whatsapp: { sent: 350, delivered: 343, read: 298 },
      push: { sent: 100, delivered: 92, opened: 67 },
    },
    deliveryRates: {
      email: 95,
      sms: 97,
      whatsapp: 98,
      push: 92,
    },
    engagementRates: {
      email: 60,
      whatsapp: 86.9,
      push: 72.8,
    },
    period: {
      startDate: "2024-01-01T00:00:00Z",
      endDate: "2024-01-27T23:59:59Z",
    },
  };

  return NextResponse.json({
    success: true,
    action: "analytics",
    data: { analytics },
  });
}

async function handleSendMessage(
  body: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock message sending
  const message: Message = {
    messageId: `msg-${Date.now()}`,
    recipient: body.data?.recipient || "unknown",
    provider: body.provider || "email",
    subject: body.data?.subject,
    content: body.data?.message || "Default message content",
    status: "sent",
    sentAt: new Date().toISOString(),
    priority: body.data?.priority || "normal",
    metadata: {
      patientId: body.data?.patientId,
      appointmentId: body.data?.appointmentId,
      template: body.data?.template,
      variables: body.data?.variables,
    },
  };

  return NextResponse.json({
    success: true,
    action: "send",
    data: { message },
    message: `Message sent via ${body.provider || "email"}`,
  });
}

async function handleTestCommunication(
  body: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock communication test
  const testResult = {
    provider: body.provider || "email",
    status: Math.random() > 0.1 ? "success" : "failed" as "success" | "failed",
    details: Math.random() > 0.1
      ? `${body.provider || "email"} provider is working correctly`
      : `${body.provider || "email"} provider connection failed`,
  };

  return NextResponse.json({
    success: true,
    action: "test",
    data: { testResult },
    message: "Communication test completed",
  });
}

async function handleUpdatePreferences(
  body: CommunicationRequest,
): Promise<NextResponse<CommunicationResponse>> {
  // Mock preferences update
  const updatedPreferences: CommunicationPreferences = {
    patientId: body.data?.patientId || "unknown",
    email: {
      enabled: body.data?.preferences?.email || false,
      address: "patient@example.com",
      frequency: "immediate",
    },
    sms: {
      enabled: body.data?.preferences?.sms || false,
      number: "+55 11 99999-9999",
      frequency: "immediate",
    },
    whatsapp: {
      enabled: body.data?.preferences?.whatsapp || false,
      number: "+55 11 99999-9999",
      frequency: "daily",
    },
    push: {
      enabled: body.data?.preferences?.push || false,
      deviceTokens: ["token-123"],
    },
    preferences: {
      appointmentReminders: true,
      promotionalMessages: false,
      treatmentUpdates: true,
      emergencyAlerts: true,
    },
  };

  return NextResponse.json({
    success: true,
    action: "preferences",
    data: { preferences: updatedPreferences },
    message: "Communication preferences updated successfully",
  });
}

export const dynamic = "force-dynamic";
