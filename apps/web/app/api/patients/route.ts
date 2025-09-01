/**
 * Consolidated Patient Management API
 * Handles all patient-related operations: CRUD, search, profile management
 * Consolidates: profile, search, timeline, insights, consent endpoints
 *
 * For aesthetic clinic patient management and consultation tracking
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface PatientRequest {
  action?: "search" | "profile" | "timeline" | "insights" | "data-consent";
  query?: string;
  filters?: {
    ageRange?: [number, number];
    gender?: "M" | "F" | "Other";
    status?: "active" | "inactive" | "pending";
    lastVisit?: string;
  };
  patientData?: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    gender: "M" | "F" | "Other";
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    medicalHistory?: string[];
    allergies?: string[];
    medications?: string[];
  };
  dataConsent?: {
    dataProcessing: boolean;
    marketing: boolean;
    consentDate: string;
  };
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  gender: "M" | "F" | "Other";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
  dataConsent: {
    dataProcessing: boolean;
    marketing: boolean;
    consentDate: string;
    ipAddress: string;
  };
  insights?: {
    riskScore: number;
    treatmentRecommendations: string[];
    nextAppointmentSuggestion: string;
    complianceStatus: "compliant" | "needs_attention" | "non_compliant";
  };
  timeline?: {
    id: string;
    type: "appointment" | "treatment" | "note" | "consent_update";
    date: string;
    description: string;
    professional?: string;
    metadata?: Record<string, unknown>;
  }[];
}

interface PatientResponse {
  success: boolean;
  action?: string;
  data?: {
    patients?: Patient[];
    patient?: Patient;
    total?: number;
    page?: number;
    insights?: Patient["insights"];
    timeline?: Patient["timeline"];
    lgpdStatus?: {
      compliant: boolean;
      lastUpdate: string;
      requiredActions: string[];
    };
  };
  message?: string;
}

// GET /api/patients - List patients with optional search and filters
// GET /api/patients?action=search&query=... - Search patients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    switch (action) {
      case "search":
        return handlePatientSearch({ query, page, limit });

      default:
        return handlePatientList({ page, limit, searchParams });
    }
  } catch (error) {
    console.error("Patients API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const body: PatientRequest = await request.json();

    if (!body.patientData) {
      return NextResponse.json(
        { success: false, message: "Patient data required" },
        { status: 400 },
      );
    }

    return handlePatientCreate(body);
  } catch (error) {
    console.error("Patients API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/patients - Update patient
export async function PUT(request: NextRequest) {
  try {
    const body: PatientRequest & { patientId: string; } = await request.json();

    if (!body.patientId) {
      return NextResponse.json(
        { success: false, message: "Patient ID required" },
        { status: 400 },
      );
    }

    return handlePatientUpdate(body);
  } catch (error) {
    console.error("Patients API PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Handler functions
async function handlePatientList(params: {
  page: number;
  limit: number;
  searchParams: URLSearchParams;
}): Promise<NextResponse<PatientResponse>> {
  // Mock patient data - in production would query database
  const mockPatients: Patient[] = [
    {
      id: "patient-1",
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
      lgpdConsent: {
        dataProcessing: true,
        marketing: false,
        thirdPartySharing: false,
        consentDate: "2024-01-15T10:00:00Z",
        ipAddress: "192.168.1.1",
      },
    },
    {
      id: "patient-2",
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "+55 11 88888-8888",
      cpf: "987.654.321-00",
      birthDate: "1990-07-22",
      gender: "M",
      status: "active",
      createdAt: "2024-01-10T09:00:00Z",
      updatedAt: "2024-01-18T16:45:00Z",
      lastVisit: "2024-01-18T16:45:00Z",
      lgpdConsent: {
        dataProcessing: true,
        marketing: true,
        thirdPartySharing: false,
        consentDate: "2024-01-10T09:00:00Z",
        ipAddress: "192.168.1.2",
      },
    },
  ];

  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedPatients = mockPatients.slice(startIndex, endIndex);

  return NextResponse.json({
    success: true,
    data: {
      patients: paginatedPatients,
      total: mockPatients.length,
      page: params.page,
    },
  });
}

async function handlePatientSearch(params: {
  query?: string | null;
  page: number;
  limit: number;
}): Promise<NextResponse<PatientResponse>> {
  // Mock search functionality - in production would use database search
  const mockResults: Patient[] = params.query
    ? [
      {
        id: "patient-search-1",
        name: `Resultado para: ${params.query}`,
        email: "resultado@email.com",
        phone: "+55 11 77777-7777",
        cpf: "111.222.333-44",
        birthDate: "1988-05-10",
        gender: "F",
        status: "active",
        createdAt: "2024-01-12T11:00:00Z",
        updatedAt: "2024-01-19T13:20:00Z",
        lgpdConsent: {
          dataProcessing: true,
          marketing: false,
          thirdPartySharing: false,
          consentDate: "2024-01-12T11:00:00Z",
          ipAddress: "192.168.1.3",
        },
      },
    ]
    : [];

  return NextResponse.json({
    success: true,
    action: "search",
    data: {
      patients: mockResults,
      total: mockResults.length,
      page: params.page,
    },
  });
}

async function handlePatientCreate(body: PatientRequest): Promise<NextResponse<PatientResponse>> {
  // Mock patient creation - in production would save to database
  const newPatient: Patient = {
    id: `patient-${Date.now()}`,
    ...body.patientData!,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dataConsent: {
      ...body.dataConsent!,
      ipAddress: "192.168.1.100", // Would get from request
    },
  };

  return NextResponse.json({
    success: true,
    data: { patient: newPatient },
    message: "Patient created successfully",
  });
}

async function handlePatientUpdate(
  body: PatientRequest & { patientId: string; },
): Promise<NextResponse<PatientResponse>> {
  // Mock patient update - in production would update database
  const updatedPatient: Patient = {
    id: body.patientId,
    ...body.patientData!,
    status: "active",
    createdAt: "2024-01-15T10:00:00Z", // Would come from database
    updatedAt: new Date().toISOString(),
    lgpdConsent: {
      ...body.lgpdConsent!,
      ipAddress: "192.168.1.100", // Would get from request
    },
  };

  return NextResponse.json({
    success: true,
    data: { patient: updatedPatient },
    message: "Patient updated successfully",
  });
}

export const dynamic = "force-dynamic";
