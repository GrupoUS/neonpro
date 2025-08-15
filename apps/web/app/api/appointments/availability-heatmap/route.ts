import { addDays, addMinutes, format, parseISO } from 'date-fns';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

// =============================================
// NeonPro Availability Heat Map API
// Story 1.2: Calendar availability visualization
// =============================================

interface ProfessionalSchedule {
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  max_appointments_per_hour?: number;
}

interface AvailabilitySlot {
  time: string;
  available: boolean;
  conflicts: Array<{
    type: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  capacity: {
    used: number;
    maximum: number;
  };
}

interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
  summary: {
    total_slots: number;
    available_slots: number;
    blocked_slots: number;
    warning_slots: number;
  };
}

interface HeatMapResponse {
  days: DayAvailability[];
  period: {
    start_date: string;
    end_date: string;
  };
  professional_info?: {
    id: string;
    name: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const professionalId = searchParams.get('professional_id');
    const clinicId = searchParams.get('clinic_id');
    const startDateStr = searchParams.get('start_date');
    const endDateStr = searchParams.get('end_date');
    const serviceTypeId = searchParams.get('service_type_id');

    if (!(professionalId && clinicId && startDateStr && endDateStr)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    const supabase = await createClient();

    // Get professional schedule and existing appointments
    const [professionalSchedule, existingAppointments, serviceRules, holidays] =
      await Promise.all([
        getProfessionalSchedule(supabase, professionalId, clinicId),
        getExistingAppointments(
          supabase,
          professionalId,
          clinicId,
          startDate,
          endDate
        ),
        serviceTypeId
          ? getServiceRules(supabase, serviceTypeId, clinicId)
          : Promise.resolve(null),
        getClinicHolidays(supabase, clinicId, startDate, endDate),
      ]);

    // Generate availability data for each day
    const days: DayAvailability[] = [];

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate = addDays(currentDate, 1)
    ) {
      const dayOfWeek = currentDate.getDay();
      const daySchedule = professionalSchedule.find(
        (s) => s.day_of_week === dayOfWeek
      );

      if (daySchedule?.is_available) {
        const dayAvailability = await generateDayAvailability(
          currentDate,
          daySchedule,
          existingAppointments,
          serviceRules,
          holidays
        );
        days.push(dayAvailability);
      } else {
        // No schedule for this day
        days.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          slots: [],
          summary: {
            total_slots: 0,
            available_slots: 0,
            blocked_slots: 0,
            warning_slots: 0,
          },
        });
      }
    }

    const response: HeatMapResponse = {
      days,
      period: {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in availability-heatmap API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProfessionalSchedule(
  supabase: any,
  professionalId: string,
  clinicId: string
): Promise<ProfessionalSchedule[]> {
  const { data, error } = await supabase
    .from('professional_schedules')
    .select('*')
    .eq('professional_id', professionalId)
    .eq('clinic_id', clinicId);

  if (error) {
    console.error('Error fetching professional schedule:', error);
    return [];
  }

  return data || [];
}

async function getExistingAppointments(
  supabase: any,
  professionalId: string,
  clinicId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('appointments')
    .select('start_time, end_time, service_type_id, status')
    .eq('professional_id', professionalId)
    .eq('clinic_id', clinicId)
    .neq('status', 'cancelled')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString());

  if (error) {
    console.error('Error fetching existing appointments:', error);
    return [];
  }

  return data || [];
}

async function getServiceRules(
  supabase: any,
  serviceTypeId: string,
  clinicId: string
) {
  const { data, error } = await supabase
    .from('service_type_rules')
    .select('*')
    .eq('service_type_id', serviceTypeId)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // Not found is OK
    console.error('Error fetching service rules:', error);
  }

  return data;
}

async function getClinicHolidays(
  supabase: any,
  clinicId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('clinic_holidays')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .or(
      `start_date.lte.${format(endDate, 'yyyy-MM-dd')},end_date.gte.${format(
        startDate,
        'yyyy-MM-dd'
      )}`
    );

  if (error) {
    console.error('Error fetching clinic holidays:', error);
    return [];
  }

  return data || [];
}

async function generateDayAvailability(
  date: Date,
  schedule: any,
  appointments: any[],
  serviceRules: any,
  holidays: any[]
): Promise<DayAvailability> {
  const slots: AvailabilitySlot[] = [];
  const intervalMinutes = 30; // 30-minute slots

  const startTime = parseTime(schedule.start_time);
  const endTime = parseTime(schedule.end_time);

  // Check if this date has any holidays
  const dayHolidays = holidays.filter((holiday) => {
    const holidayStart = parseISO(holiday.start_date);
    const holidayEnd = parseISO(holiday.end_date);
    return date >= holidayStart && date <= holidayEnd;
  });

  // Generate time slots
  for (
    let currentTime = startTime;
    currentTime < endTime;
    currentTime += intervalMinutes
  ) {
    const slotStart = new Date(date);
    slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

    const slotEnd = addMinutes(slotStart, intervalMinutes);

    const slot = await analyzeSlot(
      slotStart,
      slotEnd,
      schedule,
      appointments,
      serviceRules,
      dayHolidays
    );

    slots.push(slot);
  }

  // Calculate summary
  const summary = {
    total_slots: slots.length,
    available_slots: slots.filter(
      (s) => s.available && s.conflicts.length === 0
    ).length,
    blocked_slots: slots.filter((s) => !s.available).length,
    warning_slots: slots.filter(
      (s) => s.available && s.conflicts.some((c) => c.severity === 'warning')
    ).length,
  };

  return {
    date: format(date, 'yyyy-MM-dd'),
    slots,
    summary,
  };
}

async function analyzeSlot(
  slotStart: Date,
  slotEnd: Date,
  schedule: any,
  appointments: any[],
  serviceRules: any,
  holidays: any[]
): Promise<AvailabilitySlot> {
  const conflicts = [];
  let available = true;
  let capacityUsed = 0;
  const maxCapacity = schedule.max_appointments_per_hour || 2;

  // Check holiday conflicts
  for (const holiday of holidays) {
    if (holiday.start_time && holiday.end_time) {
      // Partial day holiday
      const holidayStartTime = parseTime(holiday.start_time);
      const holidayEndTime = parseTime(holiday.end_time);
      const slotStartTime = slotStart.getHours() * 60 + slotStart.getMinutes();
      const slotEndTime = slotEnd.getHours() * 60 + slotEnd.getMinutes();

      if (slotStartTime >= holidayStartTime && slotEndTime <= holidayEndTime) {
        conflicts.push({
          type: 'holiday',
          message: `Fechado: ${holiday.name}`,
          severity: 'error' as const,
        });
        available = false;
      }
    } else {
      // Full day holiday
      conflicts.push({
        type: 'holiday',
        message: `Fechado: ${holiday.name}`,
        severity: 'error' as const,
      });
      available = false;
    }
  }

  // Check break time
  if (schedule.break_start_time && schedule.break_end_time) {
    const breakStart = parseTime(schedule.break_start_time);
    const breakEnd = parseTime(schedule.break_end_time);
    const slotStartTime = slotStart.getHours() * 60 + slotStart.getMinutes();
    const slotEndTime = slotEnd.getHours() * 60 + slotEnd.getMinutes();

    if (
      (slotStartTime >= breakStart && slotStartTime < breakEnd) ||
      (slotEndTime > breakStart && slotEndTime <= breakEnd) ||
      (slotStartTime <= breakStart && slotEndTime >= breakEnd)
    ) {
      conflicts.push({
        type: 'break_time',
        message: 'Horário de intervalo',
        severity: 'error' as const,
      });
      available = false;
    }
  }

  // Check existing appointments in this hour
  const hourStart = new Date(slotStart);
  hourStart.setMinutes(0, 0, 0);
  const hourEnd = addMinutes(hourStart, 60);

  const appointmentsInHour = appointments.filter((apt) => {
    const aptStart = parseISO(apt.start_time);
    return aptStart >= hourStart && aptStart < hourEnd;
  });

  capacityUsed = appointmentsInHour.length;

  // Check capacity limits
  if (capacityUsed >= maxCapacity) {
    conflicts.push({
      type: 'capacity_full',
      message: `Capacidade esgotada (${capacityUsed}/${maxCapacity})`,
      severity: 'error' as const,
    });
    available = false;
  } else if (capacityUsed / maxCapacity >= 0.8) {
    conflicts.push({
      type: 'capacity_high',
      message: `Alta ocupação (${capacityUsed}/${maxCapacity})`,
      severity: 'warning' as const,
    });
  }

  // Check direct appointment overlaps
  const directOverlaps = appointments.filter((apt) => {
    const aptStart = parseISO(apt.start_time);
    const aptEnd = parseISO(apt.end_time);

    return (
      (slotStart >= aptStart && slotStart < aptEnd) ||
      (slotEnd > aptStart && slotEnd <= aptEnd) ||
      (slotStart <= aptStart && slotEnd >= aptEnd)
    );
  });

  if (directOverlaps.length > 0) {
    conflicts.push({
      type: 'appointment_overlap',
      message: 'Conflito direto com agendamento',
      severity: 'error' as const,
    });
    available = false;
  }

  // Service-specific rules
  if (serviceRules) {
    const bufferBefore = serviceRules.buffer_before || 0;
    const bufferAfter = serviceRules.buffer_after || 0;

    if (bufferBefore > 0 || bufferAfter > 0) {
      const bufferConflicts = appointments.filter((apt) => {
        const aptStart = parseISO(apt.start_time);
        const aptEnd = parseISO(apt.end_time);
        const slotWithBufferStart = addMinutes(slotStart, -bufferBefore);
        const slotWithBufferEnd = addMinutes(slotEnd, bufferAfter);

        return (
          (slotWithBufferStart >= aptStart && slotWithBufferStart < aptEnd) ||
          (slotWithBufferEnd > aptStart && slotWithBufferEnd <= aptEnd) ||
          (slotWithBufferStart <= aptStart && slotWithBufferEnd >= aptEnd)
        );
      });

      if (bufferConflicts.length > 0) {
        conflicts.push({
          type: 'buffer_conflict',
          message: `Conflito com tempo de buffer (${
            bufferBefore + bufferAfter
          }min)`,
          severity: 'warning' as const,
        });
      }
    }
  }

  return {
    time: slotStart.toISOString(),
    available,
    conflicts,
    capacity: {
      used: capacityUsed,
      maximum: maxCapacity,
    },
  };
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}
