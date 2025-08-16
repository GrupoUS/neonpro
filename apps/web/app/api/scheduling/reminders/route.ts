import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';
import { CommunicationService } from '@/lib/communication/communication-service';
import { schedulingTemplateEngine } from '@/lib/communication/scheduling-templates';
import { SchedulingCommunicationWorkflow } from '@/lib/communication/scheduling-workflow';

// Schema validation for reminder requests
const ReminderConfigSchema = z.object({
  appointmentId: z.string().uuid(),
  reminderTypes: z.array(z.enum(['24h', '2h', '30m'])),
  channels: z.array(z.enum(['sms', 'email', 'whatsapp'])),
  customMessage: z.string().optional(),
  useWorkflow: z.boolean().default(true), // Enable workflow by default
  force: z.boolean().default(false), // Force send even if already sent
  patientPreferences: z
    .object({
      preferredChannel: z.enum(['sms', 'email', 'whatsapp']),
      timezone: z.string().optional(),
      language: z.enum(['pt', 'en', 'es']).default('pt'),
    })
    .optional(),
});

const ImmediateReminderSchema = z.object({
  appointmentId: z.string().uuid(),
  channel: z.enum(['sms', 'email', 'whatsapp']).optional(),
  customMessage: z.string().optional(),
  force: z.boolean().default(false),
});

const BulkReminderSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clinicId: z.string().uuid(),
  reminderType: z.enum(['24h', '2h', '30m']),
  channels: z.array(z.enum(['sms', 'email', 'whatsapp'])),
  useWorkflow: z.boolean().default(true),
});

/**
 * POST /api/scheduling/reminders
 * Schedule automated reminders for appointments using intelligent workflow
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle immediate reminders with different schema
    if (body.immediate) {
      const validatedData = ImmediateReminderSchema.parse(body);
      return await handleImmediateReminder(supabase, validatedData, user);
    }

    const validatedData = ReminderConfigSchema.parse(body);

    // Use intelligent workflow by default
    if (validatedData.useWorkflow) {
      try {
        const workflowConfig = {
          reminderSettings: {
            enabled24h: validatedData.reminderTypes.includes('24h'),
            enabled2h: validatedData.reminderTypes.includes('2h'),
            enabled30m: validatedData.reminderTypes.includes('30m'),
            channels: validatedData.channels,
            preferredChannel:
              validatedData.patientPreferences?.preferredChannel ||
              validatedData.channels[0],
          },
        };

        const workflow = new SchedulingCommunicationWorkflow();
        const workflows = await workflow.initializeWorkflows(
          validatedData.appointmentId,
          workflowConfig,
        );

        const reminderWorkflows = workflows.filter(
          (w) => w.workflowType === 'reminder',
        );

        return NextResponse.json({
          success: true,
          method: 'workflow',
          workflows: reminderWorkflows.map((w) => ({
            id: w.id,
            timing: w.metadata.timing,
            scheduledAt: w.scheduledAt,
            status: w.status,
          })),
          message: `Scheduled ${reminderWorkflows.length} reminder workflows`,
        });
      } catch (_workflowError) {
        // Fall through to legacy method
      }
    }

    // Legacy reminder scheduling method
    return await handleLegacyReminders(supabase, validatedData, user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * Handle immediate reminder sending
 */
async function handleImmediateReminder(
  supabase: any,
  data: z.infer<typeof ImmediateReminderSchema>,
  user: any,
) {
  const communicationService = new CommunicationService();

  // Get appointment details with all relations
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(
      `
      *,
      patients(*),
      professionals(*),
      services(*),
      clinics(*)
    `,
    )
    .eq('id', data.appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 },
    );
  }

  // Check if already sent recently (unless forced)
  if (!data.force) {
    const { data: recentReminder } = await supabase
      .from('appointment_reminders')
      .select('*')
      .eq('appointment_id', data.appointmentId)
      .eq('reminder_type', 'immediate')
      .gte('sent_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
      .single();

    if (recentReminder) {
      return NextResponse.json(
        { error: 'Immediate reminder already sent recently' },
        { status: 409 },
      );
    }
  }

  const channel = data.channel || 'whatsapp';
  let message = data.customMessage;

  // Generate message if not provided
  if (!message) {
    const template = schedulingTemplateEngine.selectBestTemplate(
      'reminder',
      appointment,
      appointment.patients,
      null,
    );

    if (template) {
      const variables = {
        patientName: appointment.patients.name,
        serviceName: appointment.services.name,
        professionalName: appointment.professionals.name,
        appointmentDate: new Date(appointment.date).toLocaleDateString('pt-BR'),
        appointmentTime: new Date(appointment.date).toLocaleTimeString(
          'pt-BR',
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        clinicName: appointment.clinics.name,
        clinicPhone: appointment.clinics.phone,
      };

      message = await schedulingTemplateEngine.renderTemplate(
        template,
        channel,
        variables,
      );
    }
  }

  if (!message) {
    return NextResponse.json(
      { error: 'No message content available' },
      { status: 400 },
    );
  }

  // Send immediate reminder
  const result = await communicationService.sendMessage({
    patientId: appointment.patient_id,
    clinicId: appointment.clinic_id,
    appointmentId: data.appointmentId,
    messageType: 'reminder',
    channel,
    customContent: message,
  });

  // Log the reminder
  await supabase.from('appointment_reminders').insert({
    appointment_id: data.appointmentId,
    patient_id: appointment.patient_id,
    clinic_id: appointment.clinic_id,
    reminder_type: 'immediate',
    channel,
    status: result.success ? 'sent' : 'failed',
    message_content: message,
    sent_at: new Date().toISOString(),
    delivery_status: result.success ? 'delivered' : 'failed',
    cost: result.cost || 0,
    created_by: user.id,
  });

  return NextResponse.json({
    success: result.success,
    method: 'immediate',
    messageId: result.messageId,
    channel,
    cost: result.cost,
    message: result.success
      ? 'Reminder sent immediately'
      : 'Failed to send reminder',
  });
}

/**
 * Handle legacy reminder scheduling
 */
async function handleLegacyReminders(
  supabase: any,
  data: z.infer<typeof ReminderConfigSchema>,
  user: any,
) {
  // Get appointment details
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(
      `
      *,
      patients(*),
      professionals(*),
      services(*),
      clinics(*)
    `,
    )
    .eq('id', data.appointmentId)
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 },
    );
  }

  // Calculate reminder times
  const appointmentDate = new Date(appointment.date);
  const reminders = [];

  for (const reminderType of data.reminderTypes) {
    let scheduledTime: Date;

    switch (reminderType) {
      case '24h':
        scheduledTime = new Date(
          appointmentDate.getTime() - 24 * 60 * 60 * 1000,
        );
        break;
      case '2h':
        scheduledTime = new Date(
          appointmentDate.getTime() - 2 * 60 * 60 * 1000,
        );
        break;
      case '30m':
        scheduledTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
        break;
    }

    // Skip if scheduled time is in the past
    if (scheduledTime <= new Date()) {
      continue;
    }

    reminders.push({
      appointment_id: data.appointmentId,
      patient_id: appointment.patient_id,
      clinic_id: appointment.clinic_id,
      reminder_type: reminderType,
      scheduled_time: scheduledTime.toISOString(),
      channels: data.channels,
      status: 'scheduled',
      custom_message: data.customMessage,
      patient_preferences: data.patientPreferences,
      created_by: user.id,
      created_at: new Date().toISOString(),
    });
  }

  if (reminders.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'No valid reminder times (all in the past)',
    });
  }

  // Insert reminders into database
  const { data: insertedReminders, error: insertError } = await supabase
    .from('appointment_reminders')
    .insert(reminders)
    .select();

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to schedule reminders' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    method: 'legacy',
    reminders: insertedReminders,
    appointmentId: data.appointmentId,
    message: `Scheduled ${insertedReminders.length} reminders`,
  });
}

/**
 * GET /api/scheduling/reminders
 * Get reminders for appointments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const workflowId = searchParams.get('workflowId');

    // Get workflow-based reminders if workflowId provided
    if (workflowId) {
      try {
        const workflowInstance = new SchedulingCommunicationWorkflow();
        const workflow = await workflowInstance.getWorkflow(workflowId);
        return NextResponse.json({
          success: true,
          workflow,
          message: 'Workflow retrieved',
        });
      } catch (_error) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 },
        );
      }
    }

    // Query legacy reminders
    let query = supabase.from('appointment_reminders').select(`
        *,
        appointments(*),
        patients(name, phone, email),
        clinics(name)
      `);

    if (appointmentId) {
      query = query.eq('appointment_id', appointmentId);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('scheduled_time', startOfDay.toISOString())
        .lte('scheduled_time', endOfDay.toISOString());
    }

    const { data: reminders, error: queryError } = await query.order(
      'scheduled_time',
      { ascending: true },
    );

    if (queryError) {
      return NextResponse.json(
        { error: 'Failed to fetch reminders' },
        { status: 500 },
      );
    }

    // Also get workflow-based reminders if appointment specified
    let workflows = [];
    if (appointmentId) {
      try {
        const { data: workflowData } = await supabase
          .from('communication_workflows')
          .select('*')
          .eq('appointment_id', appointmentId)
          .eq('workflow_type', 'reminder');

        workflows = workflowData || [];
      } catch (_error) {}
    }

    return NextResponse.json({
      success: true,
      reminders: reminders || [],
      workflows,
      count: {
        reminders: reminders?.length || 0,
        workflows: workflows.length,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/scheduling/reminders/bulk
 * Schedule bulk reminders for all appointments on a specific date
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = BulkReminderSchema.parse(body);

    // Get all appointments for the specified date and clinic
    const startOfDay = new Date(validatedData.date);
    const endOfDay = new Date(validatedData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id')
      .eq('clinic_id', validatedData.clinicId)
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .eq('status', 'scheduled');

    if (appointmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 },
      );
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments found for the specified date',
        processed: 0,
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each appointment
    for (const appointment of appointments) {
      try {
        if (validatedData.useWorkflow) {
          // Use intelligent workflow
          const workflowConfig = {
            reminderSettings: {
              enabled24h: validatedData.reminderType === '24h',
              enabled2h: validatedData.reminderType === '2h',
              enabled30m: validatedData.reminderType === '30m',
              channels: validatedData.channels,
              preferredChannel: validatedData.channels[0],
            },
          };

          const workflowInstance = new SchedulingCommunicationWorkflow();
          const workflows = await workflowInstance.initializeWorkflows(
            appointment.id,
            workflowConfig,
          );

          results.push({
            appointmentId: appointment.id,
            success: true,
            method: 'workflow',
            workflowsCreated: workflows.length,
          });
        } else {
          // Use legacy method
          const reminderData = {
            appointmentId: appointment.id,
            reminderTypes: [validatedData.reminderType],
            channels: validatedData.channels,
            useWorkflow: false,
          };

          await handleLegacyReminders(supabase, reminderData, user);
          results.push({
            appointmentId: appointment.id,
            success: true,
            method: 'legacy',
          });
        }

        successCount++;
      } catch (error) {
        results.push({
          appointmentId: appointment.id,
          success: false,
          error: error.message,
        });
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: appointments.length,
      successful: successCount,
      failed: errorCount,
      results,
      message: `Processed ${appointments.length} appointments: ${successCount} successful, ${errorCount} failed`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
