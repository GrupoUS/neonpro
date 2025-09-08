/**
 * Consolidated Appointment Slots API
 * Handles all slot-related operations: availability, suggestions, validation
 * Consolidates: available-slots, suggest-slots, suggest-alternatives, validate-slot
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface SlotRequest {
  action: "availability" | "suggest" | "validate" | "alternatives";
  date?: string;
  duration?: number;
  professionalId?: string;
  patientId?: string;
  slotId?: string;
  preferences?: {
    timeOfDay?: "morning" | "afternoon" | "evening";
    dayOfWeek?: string[];
    maxDistance?: number;
  };
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  professionalId: string;
  professionalName: string;
  available: boolean;
  duration: number;
  location?: string;
  type: "in-person" | "telemedicine";
}

interface SlotResponse {
  success: boolean;
  action: string;
  data: {
    slots?: TimeSlot[];
    availability?: {
      date: string;
      totalSlots: number;
      availableSlots: number;
      busyPeriods: { start: string; end: string; }[];
    };
    validation?: {
      valid: boolean;
      conflicts: string[];
      warnings: string[];
    };
    alternatives?: {
      suggestedDates: string[];
      nearbyProfessionals: {
        id: string;
        name: string;
        distance: number;
        availableSlots: number;
      }[];
    };
  };
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") as SlotRequest["action"];
    const date = searchParams.get("date");
    const duration = searchParams.get("duration");
    const professionalId = searchParams.get("professionalId");

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action parameter required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "availability":
        return handleAvailability({ date, professionalId, duration });

      case "suggest":
        return handleSuggestions({ date, duration, professionalId });

      case "alternatives":
        return handleAlternatives({ date, duration, professionalId });

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Slots API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SlotRequest = await request.json();
    const { action } = body;

    switch (action) {
      case "validate":
        return handleValidation(body);

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action for POST" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Slots API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

async function handleAvailability(params: {
  date?: string | null;
  professionalId?: string | null;
  duration?: string | null;
}): Promise<NextResponse<SlotResponse>> {
  // Mock availability data - in production would query database
  const mockAvailability = {
    date: params.date || new Date().toISOString().split("T")[0],
    totalSlots: 16,
    availableSlots: 8,
    busyPeriods: [
      { start: "09:00", end: "10:30" },
      { start: "14:00", end: "15:30" },
    ],
  };

  return NextResponse.json({
    success: true,
    action: "availability",
    data: { availability: mockAvailability },
  });
}

async function handleSuggestions(params: {
  date?: string | null;
  duration?: string | null;
  professionalId?: string | null;
}): Promise<NextResponse<SlotResponse>> {
  // Mock slot suggestions - in production would use AI/ML algorithms
  const mockSlots: TimeSlot[] = [
    {
      id: "slot-1",
      startTime: "10:30",
      endTime: "11:30",
      professionalId: params.professionalId || "prof-1",
      professionalName: "Dr. Silva",
      available: true,
      duration: 60,
      type: "in-person",
    },
    {
      id: "slot-2",
      startTime: "15:30",
      endTime: "16:30",
      professionalId: params.professionalId || "prof-1",
      professionalName: "Dr. Silva",
      available: true,
      duration: 60,
      type: "telemedicine",
    },
  ];

  return NextResponse.json({
    success: true,
    action: "suggest",
    data: { slots: mockSlots },
  });
}

async function handleAlternatives(params: {
  date?: string | null;
  duration?: string | null;
  professionalId?: string | null;
}): Promise<NextResponse<SlotResponse>> {
  // Mock alternatives - in production would suggest based on availability
  const mockAlternatives = {
    suggestedDates: [
      new Date(Date.now() + 86_400_000).toISOString().split("T")[0], // Tomorrow
      new Date(Date.now() + 172_800_000).toISOString().split("T")[0], // Day after
    ],
    nearbyProfessionals: [
      {
        id: "prof-2",
        name: "Dr. Santos",
        distance: 2.5,
        availableSlots: 4,
      },
      {
        id: "prof-3",
        name: "Dr. Costa",
        distance: 3.8,
        availableSlots: 6,
      },
    ],
  };

  return NextResponse.json({
    success: true,
    action: "alternatives",
    data: { alternatives: mockAlternatives },
  });
}

async function handleValidation(body: SlotRequest): Promise<NextResponse<SlotResponse>> {
  // Mock validation - in production would check conflicts and constraints
  const mockValidation = {
    valid: true,
    conflicts: [],
    warnings: body.slotId === "slot-conflict" ? ["Professional has back-to-back appointments"] : [],
  };

  return NextResponse.json({
    success: true,
    action: "validate",
    data: { validation: mockValidation },
  });
}

export const dynamic = "force-dynamic";
