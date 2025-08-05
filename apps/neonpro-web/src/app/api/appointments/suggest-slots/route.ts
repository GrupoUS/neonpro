import type { createClient } from "@/lib/supabase/server";
import type { addDays, addMinutes, format, parseISO } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

// =============================================
// NeonPro Alternative Slot Suggestion API
// Story 1.2: Intelligent slot recommendation
// =============================================

interface SlotSuggestionParams {
  professional_id: string;
  service_type_id: string;
  preferred_start_time: string;
  duration_minutes: number;
  exclude_appointment_id?: string;
  max_suggestions: number;
  search_window_days: number;
  clinic_id: string;
}

interface AlternativeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  conflicts?: Array<{
    type: string;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
  score?: number;
  reason?: string;
}

interface SuggestionResponse {
  suggestions: AlternativeSlot[];
  search_info: {
    total_slots_checked: number;
    available_slots_found: number;
    search_period: {
      start_date: string;
      end_date: string;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate parameters
    const params: SlotSuggestionParams = {
      professional_id: searchParams.get("professional_id") || "",
      service_type_id: searchParams.get("service_type_id") || "",
      preferred_start_time: searchParams.get("preferred_start_time") || "",
      duration_minutes: parseInt(searchParams.get("duration_minutes") || "60"),
      exclude_appointment_id: searchParams.get("exclude_appointment_id") || undefined,
      max_suggestions: Math.min(parseInt(searchParams.get("max_suggestions") || "6"), 20),
      search_window_days: Math.min(parseInt(searchParams.get("search_window_days") || "14"), 30),
      clinic_id: searchParams.get("clinic_id") || "",
    };

    // Validation
    if (
      !params.professional_id ||
      !params.service_type_id ||
      !params.preferred_start_time ||
      !params.clinic_id
    ) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get professional schedule and service rules
    const [professionalSchedule, serviceRules, existingAppointments] = await Promise.all([
      getProfessionalSchedule(supabase, params.professional_id, params.clinic_id),
      getServiceRules(supabase, params.service_type_id, params.clinic_id),
      getExistingAppointments(
        supabase,
        params.professional_id,
        params.clinic_id,
        params.search_window_days,
        params.exclude_appointment_id,
      ),
    ]);

    // Generate suggestions
    const suggestions = await generateSlotSuggestions(
      params,
      professionalSchedule,
      serviceRules,
      existingAppointments,
    );

    // Calculate search info
    const preferredDate = parseISO(params.preferred_start_time);
    const searchInfo = {
      total_slots_checked: params.search_window_days * 48, // Assuming 30-min intervals
      available_slots_found: suggestions.length,
      search_period: {
        start_date: format(preferredDate, "yyyy-MM-dd"),
        end_date: format(addDays(preferredDate, params.search_window_days), "yyyy-MM-dd"),
      },
    };

    const response: SuggestionResponse = {
      suggestions: suggestions.slice(0, params.max_suggestions),
      search_info: searchInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in suggest-slots API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getProfessionalSchedule(supabase: any, professionalId: string, clinicId: string) {
  const { data, error } = await supabase
    .from("professional_schedules")
    .select("*")
    .eq("professional_id", professionalId)
    .eq("clinic_id", clinicId)
    .eq("is_available", true);

  if (error) {
    console.error("Error fetching professional schedule:", error);
    return [];
  }

  return data || [];
}

async function getServiceRules(supabase: any, serviceTypeId: string, clinicId: string) {
  const { data, error } = await supabase
    .from("service_type_rules")
    .select("*")
    .eq("service_type_id", serviceTypeId)
    .eq("clinic_id", clinicId)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    // Not found is OK
    console.error("Error fetching service rules:", error);
  }

  return data || {};
}

async function getExistingAppointments(
  supabase: any,
  professionalId: string,
  clinicId: string,
  searchWindowDays: number,
  excludeId?: string,
) {
  const startDate = new Date();
  const endDate = addDays(startDate, searchWindowDays);

  let query = supabase
    .from("appointments")
    .select("start_time, end_time")
    .eq("professional_id", professionalId)
    .eq("clinic_id", clinicId)
    .neq("status", "cancelled")
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString());

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching existing appointments:", error);
    return [];
  }

  return data || [];
}

async function generateSlotSuggestions(
  params: SlotSuggestionParams,
  schedule: any[],
  serviceRules: any,
  existingAppointments: any[],
): Promise<AlternativeSlot[]> {
  const suggestions: AlternativeSlot[] = [];
  const preferredDate = parseISO(params.preferred_start_time);
  const preferredTime = format(preferredDate, "HH:mm");

  // Create schedule map for quick lookup
  const scheduleMap = new Map();
  schedule.forEach((s) => {
    scheduleMap.set(s.day_of_week, s);
  });

  // Convert existing appointments to easier format
  const appointments = existingAppointments.map((apt) => ({
    start: parseISO(apt.start_time),
    end: parseISO(apt.end_time),
  }));

  // Search through each day in the window
  for (let dayOffset = 0; dayOffset < params.search_window_days; dayOffset++) {
    const searchDate = addDays(preferredDate, dayOffset);
    const dayOfWeek = searchDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const daySchedule = scheduleMap.get(dayOfWeek);
    if (!daySchedule) continue; // No schedule for this day

    // Generate time slots for this day
    const daySlots = generateDaySuggestions(
      searchDate,
      daySchedule,
      serviceRules,
      appointments,
      params,
      preferredTime,
      dayOffset,
    );

    suggestions.push(...daySlots);
  }

  // Sort by score (best first)
  return suggestions.sort((a, b) => (b.score || 0) - (a.score || 0));
}

function generateDaySuggestions(
  date: Date,
  schedule: any,
  serviceRules: any,
  appointments: any[],
  params: SlotSuggestionParams,
  preferredTime: string,
  dayOffset: number,
): AlternativeSlot[] {
  const slots: AlternativeSlot[] = [];
  const startTime = parseTime(schedule.start_time);
  const endTime = parseTime(schedule.end_time);
  const bufferBefore = serviceRules.buffer_before || 0;
  const bufferAfter = serviceRules.buffer_after || 0;

  // 30-minute intervals
  const intervalMinutes = 30;
  let currentTime = startTime;

  while (currentTime + params.duration_minutes <= endTime) {
    const slotStart = new Date(date);
    slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

    const slotEnd = addMinutes(slotStart, params.duration_minutes);

    // Check for conflicts
    const conflicts = checkSlotConflicts(
      slotStart,
      slotEnd,
      appointments,
      schedule,
      bufferBefore,
      bufferAfter,
    );
    const hasErrors = conflicts.some((c) => c.severity === "error");

    if (!hasErrors) {
      const score = calculateSlotScore(slotStart, preferredTime, dayOffset, conflicts.length);

      slots.push({
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        available: true,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        score,
        reason: generateSlotReason(slotStart, preferredTime, dayOffset),
      });
    }

    currentTime += intervalMinutes;
  }

  return slots;
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function checkSlotConflicts(
  slotStart: Date,
  slotEnd: Date,
  appointments: any[],
  schedule: any,
  bufferBefore: number,
  bufferAfter: number,
): Array<{
  type: string;
  message: string;
  severity: "error" | "warning" | "info";
}> {
  const conflicts = [];

  // Check appointment overlaps
  const slotStartWithBuffer = addMinutes(slotStart, -bufferBefore);
  const slotEndWithBuffer = addMinutes(slotEnd, bufferAfter);

  for (const apt of appointments) {
    if (
      (slotStartWithBuffer >= apt.start && slotStartWithBuffer < apt.end) ||
      (slotEndWithBuffer > apt.start && slotEndWithBuffer <= apt.end) ||
      (slotStartWithBuffer <= apt.start && slotEndWithBuffer >= apt.end)
    ) {
      conflicts.push({
        type: "appointment_overlap",
        message: "Conflito com agendamento existente",
        severity: "error" as const,
      });
    }
  }

  // Check break time
  if (schedule.break_start_time && schedule.break_end_time) {
    const breakStart = parseTime(schedule.break_start_time);
    const breakEnd = parseTime(schedule.break_end_time);
    const slotTimeStart = parseTime(format(slotStart, "HH:mm"));
    const slotTimeEnd = parseTime(format(slotEnd, "HH:mm"));

    if (
      (slotTimeStart >= breakStart && slotTimeStart < breakEnd) ||
      (slotTimeEnd > breakStart && slotTimeEnd <= breakEnd) ||
      (slotTimeStart <= breakStart && slotTimeEnd >= breakEnd)
    ) {
      conflicts.push({
        type: "break_time",
        message: "Conflito com horÃ¡rio de intervalo",
        severity: "error" as const,
      });
    }
  }

  // Check capacity limits
  const hourStart = new Date(slotStart);
  hourStart.setMinutes(0, 0, 0);
  const hourEnd = addMinutes(hourStart, 60);

  const appointmentsInHour = appointments.filter(
    (apt) => apt.start >= hourStart && apt.start < hourEnd,
  ).length;

  if (appointmentsInHour >= (schedule.max_appointments_per_hour || 4)) {
    conflicts.push({
      type: "capacity_exceeded",
      message: `Capacidade mÃ¡xima da hora (${schedule.max_appointments_per_hour}) atingida`,
      severity: "warning" as const,
    });
  }

  return conflicts;
}

function calculateSlotScore(
  slotStart: Date,
  preferredTime: string,
  dayOffset: number,
  conflictCount: number,
): number {
  let score = 100;

  // Penalty for days away from preferred date
  score -= dayOffset * 5;

  // Penalty for time difference from preferred
  const slotTime = format(slotStart, "HH:mm");
  const preferredMinutes = parseTime(preferredTime);
  const slotMinutes = parseTime(slotTime);
  const timeDiff = Math.abs(preferredMinutes - slotMinutes);
  score -= Math.min(timeDiff / 30, 20); // Max 20 points penalty for time difference

  // Penalty for conflicts (warnings)
  score -= conflictCount * 10;

  // Bonus for morning slots (generally preferred)
  const hour = slotStart.getHours();
  if (hour >= 8 && hour <= 11) {
    score += 5;
  }

  return Math.max(score, 0);
}

function generateSlotReason(slotStart: Date, preferredTime: string, dayOffset: number): string {
  if (dayOffset === 0) {
    const slotTime = format(slotStart, "HH:mm");
    if (slotTime === preferredTime) {
      return "HorÃ¡rio exato solicitado";
    }
    return "Mesmo dia, horÃ¡rio prÃ³ximo";
  }

  if (dayOffset === 1) {
    return "PrÃ³ximo dia Ãºtil disponÃ­vel";
  }

  if (dayOffset <= 3) {
    return "HorÃ¡rio prÃ³ximo disponÃ­vel";
  }

  return "PrÃ³xima disponibilidade";
}
