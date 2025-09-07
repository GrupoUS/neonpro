/**
 * Individual Patient Management API
 * Handles specific patient operations: profile, insights, timeline, data consent
 * Consolidates: /patients/[id]/profile, /patients/[id]/insights, /patients/[id]/timeline, /patients/[id]/consent
 *
 * For aesthetic clinic patient details and consultation management
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface PatientDetailRequest {
  action?: "profile" | "insights" | "timeline" | "data-consent";
  updateData?: {
    profile?: Record<string, unknown>;
    dataConsent?: {
      dataProcessing: boolean;
      marketing: boolean;
    };
  };
}

// GET /api/patients/[id] - Get patient details
// GET /api/patients/[id]?action=profile - Get patient profile
// GET /api/patients/[id]?action=insights - Get patient insights
// GET /api/patients/[id]?action=timeline - Get patient timeline
// GET /api/patients/[id]?action=data-consent - Get data consent status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; }; },
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const patientId = params.id;

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "profile":
        return handlePatientProfile(patientId);

      case "insights":
        return handlePatientInsights(patientId);

      case "timeline":
        return handlePatientTimeline(patientId);

      case "data-consent":
        return handleDataConsent(patientId);

      default:
        return handlePatientDetails(patientId);
    }
  } catch (error) {
    console.error("Patient detail API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; }; },
) {
  try {
    const body: PatientDetailRequest = await request.json();
    const patientId = params.id;

    if (!patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID required" },
        { status: 400 },
      );
    }

    return handlePatientDetailUpdate(patientId, body);
  } catch (error) {
    console.error("Patient detail PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler functions
async function handlePatientDetails(patientId: string) {
  // Mock patient details - in production would query database
  const mockPatient = {
    id: patientId,
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "+55 11 99999-9999",
    cpf: "123.456.789-00",
    birthDate: "1985-03-15",
    gender: "F",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    lastVisit: "2024-01-20T14:30:00Z",
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    medicalHistory: ["Hipertensão", "Diabetes tipo 2"],
    allergies: ["Penicilina"],
    medications: ["Losartana 50mg", "Metformina 850mg"],
    dataConsent: {
      dataProcessing: true,
      marketing: false,
      consentDate: "2024-01-15T10:00:00Z",
      ipAddress: "192.168.1.1",
    },
  };

  return NextResponse.json({
    success: true,
    data: { patient: mockPatient },
  });
}

async function handlePatientProfile(patientId: string) {
  // Mock profile data
  const mockProfile = {
    id: patientId,
    personalInfo: {
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "+55 11 99999-9999",
      cpf: "123.456.789-00",
      birthDate: "1985-03-15",
      gender: "F",
    },
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
    },
    preferences: {
      language: "pt-BR",
      notifications: {
        email: true,
        sms: false,
        whatsapp: true,
      },
    },
  };

  return NextResponse.json({
    success: true,
    action: "profile",
    data: { profile: mockProfile },
  });
}

async function handlePatientInsights(patientId: string) {
  // Mock insights data
  const mockInsights = {
    patientId,
    riskScore: 7.5,
    riskLevel: "medium",
    treatmentRecommendations: [
      "Acompanhamento nutricional",
      "Exercícios cardiovasculares",
      "Monitoramento glicêmico",
    ],
    nextAppointmentSuggestion: "2024-02-15T14:00:00Z",
    complianceStatus: "compliant",
    alerts: [
      {
        type: "medication",
        message: "Verificar adesão ao tratamento",
        priority: "medium",
        date: "2024-01-25T10:00:00Z",
      },
    ],
    trends: {
      appointmentFrequency: "regular",
      treatmentAdherence: 85,
      satisfactionScore: 9.2,
    },
  };

  return NextResponse.json({
    success: true,
    action: "insights",
    data: { insights: mockInsights },
  });
}

async function handlePatientTimeline(_patientId: string) {
  // Mock timeline data
  const mockTimeline = [
    {
      id: "timeline-1",
      type: "appointment",
      date: "2024-01-20T14:30:00Z",
      description: "Consulta de rotina - Endocrinologia",
      professional: "Dr. Silva",
      metadata: {
        duration: 60,
        status: "completed",
        notes: "Paciente apresentou melhora nos níveis glicêmicos",
      },
    },
    {
      id: "timeline-2",
      type: "treatment",
      date: "2024-01-15T10:00:00Z",
      description: "Início do tratamento com Metformina",
      professional: "Dr. Silva",
      metadata: {
        medication: "Metformina 850mg",
        dosage: "2x ao dia",
        duration: "3 meses",
      },
    },
    {
      id: "timeline-3",
      type: "consent_update",
      date: "2024-01-15T10:00:00Z",
      description: "Consentimento LGPD atualizado",
      metadata: {
        consentType: "data_processing",
        status: "granted",
        ipAddress: "192.168.1.1",
      },
    },
  ];

  return NextResponse.json({
    success: true,
    action: "timeline",
    data: { timeline: mockTimeline },
  });
}

async function handleDataConsent(patientId: string) {
  // Mock data consent data
  const mockConsentStatus = {
    patientId,
    compliant: true,
    lastUpdate: "2024-01-15T10:00:00Z",
    consents: {
      dataProcessing: {
        granted: true,
        date: "2024-01-15T10:00:00Z",
        ipAddress: "192.168.1.1",
      },
      marketing: {
        granted: false,
        date: "2024-01-15T10:00:00Z",
        ipAddress: "192.168.1.1",
      },
    },
    requiredActions: [],
    dataRetentionPolicy: {
      medicalRecords: "20 years",
      personalData: "5 years after last interaction",
      marketingData: "2 years or until consent withdrawal",
    },
  };

  return NextResponse.json({
    success: true,
    action: "data-consent",
    data: { consentStatus: mockConsentStatus },
  });
}

async function handlePatientDetailUpdate(patientId: string, body: PatientDetailRequest) {
  // Mock update functionality
  const updateResult = {
    patientId,
    updated: true,
    timestamp: new Date().toISOString(),
    changes: body.updateData || {},
  };

  return NextResponse.json({
    success: true,
    data: updateResult,
    message: "Patient details updated successfully",
  });
}

export const dynamic = "force-dynamic";
