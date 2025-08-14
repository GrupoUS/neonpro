import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';
import { validatePatientSession } from '@/lib/utils/patient-portal-validation';

// GET /api/patient-portal/appointments
// List patient appointments
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
    const patientId = patientSession.patient_id;
    const clinicId = patientSession.clinic_id;

    // Parse query parameters
    const status = searchParams.get('status'); // pending, confirmed, cancelled, completed
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('online_bookings')
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        notes,
        confirmation_code,
        created_at,
        professional:professionals(
          id,
          name,
          specialty
        ),
        procedure:procedures(
          id,
          name,
          duration_minutes,
          price
        )
      `)
      .eq('patient_id', patientId)
      .eq('clinic_id', clinicId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('appointment_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('appointment_date', dateTo);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appointments: appointments || [],
      total: appointments?.length || 0,
      pagination: {
        limit,
        offset,
        has_more: appointments?.length === limit
      }
    });

  } catch (error) {
    console.error('Appointments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/patient-portal/appointments
// Create new appointment booking
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate patient session
    const sessionResult = await validatePatientSession(request);
    if (!sessionResult.success) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      );
    }

    const { patientSession } = sessionResult;
    const patientId = patientSession.patient_id;
    const clinicId = patientSession.clinic_id;

    // Validate required fields
    const {
      professional_id,
      procedure_id,
      appointment_date,
      appointment_time,
      duration_minutes,
      notes
    } = body;

    if (!professional_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { error: 'Professional, date and time are required' },
        { status: 400 }
      );
    }

    // Validate date format and ensure it's not in the past
    const targetDate = new Date(appointment_date);
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
        { error: 'Online booking not available' },
        { status: 404 }
      );
    }

    // Check minimum hours ahead
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const now = new Date();
    const hoursAhead = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursAhead < bookingSettings.min_hours_ahead) {
      return NextResponse.json(
        { error: `Must book at least ${bookingSettings.min_hours_ahead} hours ahead` },
        { status: 400 }
      );
    }

    // Check if slot is still available
    const { data: existingBooking } = await supabase
      .from('online_bookings')
      .select('id')
      .eq('professional_id', professional_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .in('status', ['confirmed', 'pending'])
      .single();

    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // Create appointment
    const { data: newAppointment, error: createError } = await supabase
      .from('online_bookings')
      .insert({
        patient_id: patientId,
        clinic_id: clinicId,
        professional_id,
        procedure_id,
        appointment_date,
        appointment_time,
        duration_minutes: duration_minutes || bookingSettings.default_duration_minutes,
        status: bookingSettings.auto_confirm ? 'confirmed' : 'pending',
        notes,
        confirmation_code: confirmationCode,
        booking_method: 'online_portal'
      })
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        confirmation_code,
        professional:professionals(name, specialty),
        procedure:procedures(name, duration_minutes, price)
      `)
      .single();

    if (createError) {
      console.error('Error creating appointment:', createError);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation email/SMS
    // await sendAppointmentConfirmation(newAppointment, patientSession.patient);

    return NextResponse.json({
      success: true,
      appointment: newAppointment,
      message: bookingSettings.auto_confirm 
        ? 'Appointment confirmed successfully' 
        : 'Appointment request submitted for approval'
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateConfirmationCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`.toUpperCase();
}