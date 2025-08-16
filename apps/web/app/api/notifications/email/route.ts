import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import emailService from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role (for manual email sending)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'manager') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const { to, template, variables, type } = await request.json();

    if (!(to && template)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, template' },
        { status: 400 },
      );
    }

    let result;

    // Handle specific email types with predefined methods
    switch (type) {
      case 'appointment_confirmation':
        if (
          !(
            variables.patientName &&
            variables.appointmentDate &&
            variables.appointmentTime &&
            variables.serviceName &&
            variables.professionalName
          )
        ) {
          return NextResponse.json(
            {
              error: 'Missing required variables for appointment confirmation',
            },
            { status: 400 },
          );
        }

        result = await emailService.sendAppointmentConfirmation({
          patientEmail: to,
          patientName: variables.patientName,
          appointmentDate: variables.appointmentDate,
          appointmentTime: variables.appointmentTime,
          serviceName: variables.serviceName,
          professionalName: variables.professionalName,
          clinicName: variables.clinicName || 'NeonPro',
        });
        break;

      case 'appointment_reminder':
        if (
          !(
            variables.patientName &&
            variables.appointmentDate &&
            variables.appointmentTime &&
            variables.serviceName &&
            variables.professionalName
          )
        ) {
          return NextResponse.json(
            { error: 'Missing required variables for appointment reminder' },
            { status: 400 },
          );
        }

        result = await emailService.sendAppointmentReminder({
          patientEmail: to,
          patientName: variables.patientName,
          appointmentDate: variables.appointmentDate,
          appointmentTime: variables.appointmentTime,
          serviceName: variables.serviceName,
          professionalName: variables.professionalName,
          clinicName: variables.clinicName || 'NeonPro',
        });
        break;

      case 'appointment_cancellation':
        if (
          !(
            variables.patientName &&
            variables.appointmentDate &&
            variables.appointmentTime
          )
        ) {
          return NextResponse.json(
            {
              error: 'Missing required variables for appointment cancellation',
            },
            { status: 400 },
          );
        }

        result = await emailService.sendAppointmentCancellation({
          patientEmail: to,
          patientName: variables.patientName,
          appointmentDate: variables.appointmentDate,
          appointmentTime: variables.appointmentTime,
          cancellationReason: variables.cancellationReason,
          clinicName: variables.clinicName || 'NeonPro',
        });
        break;

      default:
        // Generic email sending
        result = await emailService.sendEmail({
          to,
          template,
          variables: variables || {},
        });
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send email',
        },
        { status: 500 },
      );
    }

    // Log the email sending activity
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'email',
      title: `Email sent: ${template}`,
      message: `Email sent to ${to} using template ${template}`,
      data: {
        template,
        to,
        messageId: result.messageId,
        sentBy: user.id,
      },
      is_read: true,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test email service connection
    const result = await emailService.testConnection();

    return NextResponse.json({
      connected: result.success,
      error: result.error,
      message: result.success
        ? 'Email service is working correctly'
        : 'Email service connection failed',
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
