import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePatientSession } from '@/lib/utils-legacy/patient-portal-validation';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/patient-portal/appointments/[id]
// Get specific appointment details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const appointmentId = params.id;
    
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

    // Get appointment details
    const { data: appointment, error } = await supabase
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
        updated_at,
        professional:professionals(
          id,
          name,
          specialty,
          email,
          phone
        ),
        procedure:procedures(
          id,
          name,
          description,
          duration_minutes,
          price
        ),
        clinic:clinics(
          id,
          name,
          address,
          phone,
          email
        )
      `)
      .eq('id', appointmentId)
      .eq('patient_id', patientId)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/patient-portal/appointments/[id]
// Update/reschedule appointment
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const appointmentId = params.id;
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

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('online_bookings')
      .select('*')
      .eq('id', appointmentId)
      .eq('patient_id', patientId)
      .single();

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if appointment can be rescheduled
    if (currentAppointment.status === 'cancelled' || currentAppointment.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot reschedule cancelled or completed appointments' },
        { status: 400 }
      );
    }

    const {
      appointment_date,
      appointment_time,
      notes,
      action = 'reschedule'
    } = body;

    if (action === 'reschedule') {
      // Validate new date and time
      if (!appointment_date || !appointment_time) {
        return NextResponse.json(
          { error: 'New date and time are required for rescheduling' },
          { status: 400 }
        );
      }

      // Validate date is not in the past
      const targetDate = new Date(appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        return NextResponse.json(
          { error: 'Cannot reschedule to a past date' },
          { status: 400 }
        );
      }

      // Get clinic booking settings
      const { data: bookingSettings } = await supabase
        .from('online_booking_settings')
        .select('*')
        .eq('clinic_id', clinicId)
        .single();

      if (bookingSettings) {
        // Check minimum hours ahead
        const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
        const now = new Date();
        const hoursAhead = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursAhead < bookingSettings.min_hours_ahead) {
          return NextResponse.json(
            { error: `Must reschedule at least ${bookingSettings.min_hours_ahead} hours ahead` },
            { status: 400 }
          );
        }
      }

      // Check if new slot is available
      const { data: conflictingBooking } = await supabase
        .from('online_bookings')
        .select('id')
        .eq('professional_id', currentAppointment.professional_id)
        .eq('appointment_date', appointment_date)
        .eq('appointment_time', appointment_time)
        .neq('id', appointmentId)
        .in('status', ['confirmed', 'pending'])
        .single();

      if (conflictingBooking) {
        return NextResponse.json(
          { error: 'This time slot is not available' },
          { status: 409 }
        );
      }

      // Update appointment
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('online_bookings')
        .update({
          appointment_date,
          appointment_time,
          notes,
          status: bookingSettings?.auto_confirm ? 'confirmed' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select(`
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          status,
          confirmation_code,
          professional:professionals(name, specialty),
          procedure:procedures(name)
        `)
        .single();

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        return NextResponse.json(
          { error: 'Failed to reschedule appointment' },
          { status: 500 }
        );
      }

      // TODO: Send reschedule notification
      // await sendRescheduleNotification(updatedAppointment, patientSession.patient);

      return NextResponse.json({
        success: true,
        appointment: updatedAppointment,
        message: 'Appointment rescheduled successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "reschedule"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/patient-portal/appointments/[id]
// Cancel appointment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const appointmentId = params.id;
    
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

    // Get current appointment
    const { data: currentAppointment, error: fetchError } = await supabase
      .from('online_bookings')
      .select('*')
      .eq('id', appointmentId)
      .eq('patient_id', patientId)
      .single();

    if (fetchError || !currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check if appointment can be cancelled
    if (currentAppointment.status === 'cancelled' || currentAppointment.status === 'completed') {
      return NextResponse.json(
        { error: 'Appointment is already cancelled or completed' },
        { status: 400 }
      );
    }

    // Get clinic booking settings for cancellation policy
    const { data: bookingSettings } = await supabase
      .from('online_booking_settings')
      .select('min_cancellation_hours')
      .eq('clinic_id', clinicId)
      .single();

    if (bookingSettings?.min_cancellation_hours) {
      const appointmentDateTime = new Date(`${currentAppointment.appointment_date}T${currentAppointment.appointment_time}`);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilAppointment < bookingSettings.min_cancellation_hours) {
        return NextResponse.json(
          { error: `Must cancel at least ${bookingSettings.min_cancellation_hours} hours before appointment` },
          { status: 400 }
        );
      }
    }

    // Cancel appointment
    const { data: cancelledAppointment, error: cancelError } = await supabase
      .from('online_bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select(`
        id,
        appointment_date,
        appointment_time,
        confirmation_code,
        professional:professionals(name),
        procedure:procedures(name)
      `)
      .single();

    if (cancelError) {
      console.error('Error cancelling appointment:', cancelError);
      return NextResponse.json(
        { error: 'Failed to cancel appointment' },
        { status: 500 }
      );
    }

    // Check waitlist for this time slot
    const { data: waitlistEntries } = await supabase
      .from('booking_waitlist')
      .select(`
        id,
        patient_id,
        professional_id,
        preferred_date,
        preferred_time_start,
        preferred_time_end,
        patient:patients(name, email, phone)
      `)
      .eq('professional_id', currentAppointment.professional_id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(5);

    // TODO: Notify waitlisted patients about available slot
    // if (waitlistEntries?.length > 0) {
    //   await notifyWaitlistPatients(currentAppointment, waitlistEntries);
    // }

    // TODO: Send cancellation confirmation
    // await sendCancellationNotification(cancelledAppointment, patientSession.patient);

    return NextResponse.json({
      success: true,
      appointment: cancelledAppointment,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}