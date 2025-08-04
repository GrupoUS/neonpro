import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePatientSession } from '@/lib/utils-legacy/patient-portal-validation';

// GET /api/patient-portal/availability
// Real-time availability check for online booking
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Validate patient session
    const sessionResult = await validatePatientSession(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      );
    }

    const { patientSession } = sessionResult;
    const clinicId = patientSession.clinic_id;

    // Parse query parameters
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const professionalId = searchParams.get('professional_id');
    const procedureId = searchParams.get('procedure_id');
    const duration = searchParams.get('duration') || '60'; // Default 60 minutes

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's not in the past
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      );
    }

    // Get clinic booking settings
    const { data: bookingSettings } = await supabase
      .from('online_booking_settings')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single();

    if (!bookingSettings) {
      return NextResponse.json(
        { error: 'Online booking not available for this clinic' },
        { status: 404 }
      );
    }

    // Check if booking is within allowed time window
    const daysAhead = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAhead > bookingSettings.max_days_ahead) {
      return NextResponse.json(
        { error: `Cannot book more than ${bookingSettings.max_days_ahead} days ahead` },
        { status: 400 }
      );
    }

    // Build the availability query
    let query = supabase
      .from('professional_schedules')
      .select(`
        id,
        professional_id,
        day_of_week,
        start_time,
        end_time,
        is_available,
        professional:professionals!inner(
          id,
          name,
          specialty,
          is_active
        )
      `)
      .eq('professional.clinic_id', clinicId)
      .eq('professional.is_active', true)
      .eq('is_available', true)
      .eq('day_of_week', targetDate.getDay()); // 0 = Sunday, 1 = Monday, etc.

    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }

    const { data: schedules, error: schedulesError } = await query;

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      );
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: true,
        date,
        availableSlots: [],
        message: 'No professionals available on this date'
      });
    }

    // Get existing appointments for the date
    const { data: existingAppointments } = await supabase
      .from('online_bookings')
      .select('professional_id, appointment_date, appointment_time, duration_minutes, status')
      .eq('clinic_id', clinicId)
      .eq('appointment_date', date)
      .in('status', ['confirmed', 'pending']);

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = parseInt(duration);

    for (const schedule of schedules) {
      const professional = schedule.professional;
      const startTime = schedule.start_time; // HH:MM format
      const endTime = schedule.end_time;

      // Convert time strings to minutes from midnight
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      // Generate slots every slotDuration minutes
      for (let currentMinutes = startMinutes; currentMinutes + slotDuration <= endMinutes; currentMinutes += slotDuration) {
        const slotTime = minutesToTime(currentMinutes);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments?.some(apt => 
          apt.professional_id === professional.id &&
          timeOverlaps(
            slotTime, 
            slotDuration, 
            apt.appointment_time, 
            apt.duration_minutes || 60
          )
        );

        if (!hasConflict) {
          availableSlots.push({
            professional: {
              id: professional.id,
              name: professional.name,
              specialty: professional.specialty
            },
            time: slotTime,
            duration: slotDuration,
            available: true
          });
        }
      }
    }

    // Sort slots by time and professional name
    availableSlots.sort((a, b) => {
      const timeCompare = a.time.localeCompare(b.time);
      if (timeCompare === 0) {
        return a.professional.name.localeCompare(b.professional.name);
      }
      return timeCompare;
    });

    return NextResponse.json({
      success: true,
      date,
      clinic_id: clinicId,
      total_slots: availableSlots.length,
      availableSlots,
      booking_settings: {
        min_hours_ahead: bookingSettings.min_hours_ahead,
        max_days_ahead: bookingSettings.max_days_ahead,
        default_duration: bookingSettings.default_duration_minutes
      }
    });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility functions
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function timeOverlaps(
  time1: string, 
  duration1: number, 
  time2: string, 
  duration2: number
): boolean {
  const start1 = timeToMinutes(time1);
  const end1 = start1 + duration1;
  const start2 = timeToMinutes(time2);
  const end2 = start2 + duration2;

  return (start1 < end2) && (end1 > start2);
}