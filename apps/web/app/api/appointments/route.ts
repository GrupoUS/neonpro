import { NextResponse } from 'next/server';
import type {
  BookingResponse,
  CreateAppointmentFormData,
} from '@/app/lib/types/appointments';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error_message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the appointment data from request body
    const body: CreateAppointmentFormData = await request.json();

    // Validate required fields
    if (
      !(
        body.patient_id &&
        body.professional_id &&
        body.service_type_id &&
        body.start_time &&
        body.end_time
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error_message: 'Dados obrigatórios não fornecidos',
        },
        { status: 400 }
      );
    }

    // Get clinic_id from user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json(
        {
          success: false,
          error_message: 'Perfil de usuário não encontrado',
        },
        { status: 400 }
      );
    }

    // Call the stored procedure to book the appointment
    const { data: bookingResult, error: bookingError } = await supabase.rpc(
      'book_appointment',
      {
        p_clinic_id: profile.clinic_id,
        p_patient_id: body.patient_id,
        p_professional_id: body.professional_id,
        p_service_type_id: body.service_type_id,
        p_start_time: body.start_time.toISOString(),
        p_end_time: body.end_time.toISOString(),
        p_notes: body.notes || null,
        p_internal_notes: body.internal_notes || null,
        p_created_by: user.id,
      }
    );

    if (bookingError) {
      console.error('Booking error:', bookingError);

      // Check for specific errors
      if (bookingError.message.includes('conflict')) {
        return NextResponse.json(
          {
            success: false,
            error_message: 'Conflito de horário detectado',
            error_details: bookingError.message,
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error_message: 'Erro ao agendar',
          error_details: bookingError.message,
        },
        { status: 500 }
      );
    }

    if (!bookingResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error_message:
            bookingResult?.error_message || 'Erro desconhecido ao agendar',
        },
        { status: 400 }
      );
    }

    // Return success response
    const response: BookingResponse = {
      success: true,
      appointment_id: bookingResult.appointment_id,
      message: 'Agendamento criado com sucesso',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error_message: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get clinic_id from user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 400 });
    }

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const professional_id = searchParams.get('professional_id');
    const service_type_id = searchParams.get('service_type_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    // Build base query
    let query = supabase
      .from('appointments')
      .select(
        `
        id,
        patient_id,
        professional_id,
        service_type_id,
        status,
        start_time,
        end_time,
        notes,
        created_at,
        patients:patient_id (
          id,
          full_name,
          phone,
          email
        ),
        professionals:professional_id (
          id,
          full_name,
          specialization
        ),
        service_types:service_type_id (
          id,
          name,
          duration_minutes,
          price
        )
      `
      )
      .eq('clinic_id', profile.clinic_id);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (professional_id) {
      query = query.eq('professional_id', professional_id);
    }

    if (service_type_id) {
      query = query.eq('service_type_id', service_type_id);
    }

    if (date_from) {
      query = query.gte('start_time', date_from);
    }

    if (date_to) {
      // Add one day to include the entire day
      const endDate = new Date(date_to);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('start_time', endDate.toISOString());
    }

    // For search, we need to use text search on patient name
    // Since we can't search on joined tables directly, we'll filter after fetching
    const { data: appointmentsData, error } = await query.order('start_time', {
      ascending: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Apply search filter on patient name or notes if provided
    let appointments = appointmentsData;
    if (search && appointments) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter((appointment) => {
        const patientName =
          (appointment.patients as any)?.[0]?.full_name?.toLowerCase() || '';
        const notes = appointment.notes?.toLowerCase() || '';
        const professionalName =
          (appointment.professionals as any)?.[0]?.full_name?.toLowerCase() ||
          '';
        const serviceName =
          (appointment.service_types as any)?.[0]?.name?.toLowerCase() || '';

        return (
          patientName.includes(searchLower) ||
          notes.includes(searchLower) ||
          professionalName.includes(searchLower) ||
          serviceName.includes(searchLower)
        );
      });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
