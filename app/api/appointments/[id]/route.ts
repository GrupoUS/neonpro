// app/api/appointments/[id]/route.ts
// API route for appointment details and updates
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { 
  AppointmentDetailsResponse, 
  UpdateAppointmentResponse,
  UpdateAppointmentFormData 
} from '@/app/lib/types/appointments';

/**
 * GET /api/appointments/[id]
 * Fetch detailed appointment information with related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error_message: 'Authentication required' },
        { status: 401 }
      );
    }

    const appointmentId = params.id;

    // Fetch appointment with all related data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(id, full_name, email, phone),
        professionals!inner(id, full_name, email, phone),
        service_types!inner(id, name, duration_minutes, price, color),
        clinics!inner(id, name)
      `)
      .eq('id', appointmentId)
      .eq('deleted_at', null)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { success: false, error_message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Transform to AppointmentWithDetails format
    const appointmentWithDetails = {
      ...appointment,
      patient_name: appointment.patients.full_name,
      patient_email: appointment.patients.email,
      patient_phone: appointment.patients.phone,
      professional_name: appointment.professionals.full_name,
      service_name: appointment.service_types.name,
      service_duration: appointment.service_types.duration_minutes,
      service_price: appointment.service_types.price,
      service_color: appointment.service_types.color,
      clinic_name: appointment.clinics.name,
    };

    const response: AppointmentDetailsResponse = {
      success: true,
      data: appointmentWithDetails
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching appointment details:', error);
    return NextResponse.json(
      { success: false, error_message: 'Internal server error' },
      { status: 500 }
    );
  }
}/**
 * PATCH /api/appointments/[id] 
 * Update appointment with conflict validation and audit logging
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error_message: 'Authentication required' },
        { status: 401 }
      );
    }

    const appointmentId = params.id;
    const updateData: UpdateAppointmentFormData = await request.json();

    // Convert dates to ISO strings if they exist
    const processedData = {
      ...updateData,
      start_time: updateData.start_time ? new Date(updateData.start_time).toISOString() : undefined,
      end_time: updateData.end_time ? new Date(updateData.end_time).toISOString() : undefined,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    };

    // Use stored procedure for update with validation
    const { data, error } = await supabase.rpc('sp_update_appointment', {
      p_appointment_id: appointmentId,
      p_patient_id: processedData.patient_id,
      p_professional_id: processedData.professional_id,
      p_service_type_id: processedData.service_type_id,
      p_start_time: processedData.start_time,
      p_end_time: processedData.end_time,
      p_status: processedData.status || 'scheduled',
      p_notes: processedData.notes || null,
      p_internal_notes: processedData.internal_notes || null,
      p_change_reason: processedData.change_reason || null,
      p_updated_by: session.user.id
    });    if (error) {
      // Handle specific validation errors
      if (error.message?.includes('conflict')) {
        return NextResponse.json(
          { 
            success: false, 
            error_message: 'Scheduling conflict detected',
            error_details: error.message 
          },
          { status: 409 }
        );
      }

      if (error.message?.includes('business_hours')) {
        return NextResponse.json(
          { 
            success: false, 
            error_message: 'Appointment outside business hours',
            error_details: error.message 
          },
          { status: 400 }
        );
      }

      throw error;
    }

    // Fetch updated appointment with details
    const { data: updatedAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        patients!inner(full_name, email, phone),
        professionals!inner(full_name),
        service_types!inner(name, duration_minutes, price, color),
        clinics!inner(name)
      `)
      .eq('id', appointmentId)
      .single();

    if (fetchError || !updatedAppointment) {
      throw new Error('Failed to fetch updated appointment');
    }    // Transform to AppointmentWithDetails format  
    const appointmentWithDetails = {
      ...updatedAppointment,
      patient_name: updatedAppointment.patients.full_name,
      patient_email: updatedAppointment.patients.email,
      patient_phone: updatedAppointment.patients.phone,
      professional_name: updatedAppointment.professionals.full_name,
      service_name: updatedAppointment.service_types.name,
      service_duration: updatedAppointment.service_types.duration_minutes,
      service_price: updatedAppointment.service_types.price,
      service_color: updatedAppointment.service_types.color,
      clinic_name: updatedAppointment.clinics.name,
    };

    const response: UpdateAppointmentResponse = {
      success: true,
      data: appointmentWithDetails
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error_message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Soft delete appointment with reason tracking  
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error_message: 'Authentication required' },
        { status: 401 }
      );
    }    const appointmentId = params.id;
    const { reason } = await request.json();

    // Use stored procedure for soft delete
    const { data, error } = await supabase.rpc('sp_delete_appointment', {
      p_appointment_id: appointmentId,
      p_delete_reason: reason || 'Cancelled by user',
      p_deleted_by: session.user.id
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error_message: 'Internal server error' },
      { status: 500 }
    );
  }
}