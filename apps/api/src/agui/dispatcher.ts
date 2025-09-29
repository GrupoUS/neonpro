import { Hono } from 'hono';
import { verifyJWT } from '@neonpro/core/auth';
import { createServiceClient } from '@neonpro/database';

const app = new Hono();

interface AGUIEvent {
  type: string;
  data: any;
  timestamp: string;
  source: string;
}

const handleAppointmentCreated = async (clinicId: string, data: any) => {
  const supabase = createServiceClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Send notification to relevant users
  await supabase.from('notifications').insert({
    clinic_id: clinicId,
    type: 'appointment_created',
    data: data,
    created_at: new Date().toISOString()
  });

  // Trigger other business logic
  console.log('Appointment created event processed:', data);
};

const handleMessageSent = async (clinicId: string, data: any) => {
  const supabase = createServiceClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Process message for AI analysis
  await supabase.from('message_analytics').insert({
    clinic_id: clinicId,
    message_id: data.id,
    sentiment: data.sentiment || 'neutral',
    processed_at: new Date().toISOString()
  });

  console.log('Message sent event processed:', data);
};

const handleLeadUpdated = async (clinicId: string, data: any) => {
  const supabase = createServiceClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update lead score or trigger follow-up
  if (data.status === 'qualified') {
    await supabase.from('lead_tasks').insert({
      clinic_id: clinicId,
      lead_id: data.id,
      task_type: 'follow_up_call',
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h from now
    });
  }

  console.log('Lead updated event processed:', data);
};

app.post('/api/agui/events', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    const payload: AGUIEvent = await c.req.json();
    
    if (!token) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const jwt = await verifyJWT(token);
    const clinicId = jwt.clinic_id;

    if (!clinicId) {
      return c.json({ error: 'Clinic ID not found in token' }, 400);
    }
    
    switch (payload.type) {
      case 'appointment_created':
        await handleAppointmentCreated(clinicId, payload.data);
        break;
      case 'message_sent':
        await handleMessageSent(clinicId, payload.data);
        break;
      case 'lead_updated':
        await handleLeadUpdated(clinicId, payload.data);
        break;
      default:
        console.warn('Unknown AG-UI event type:', payload.type);
    }
    
    return c.json({ 
      success: true, 
      message: `Event ${payload.type} processed successfully` 
    });
  } catch (error) {
    console.error('AG-UI event processing error:', error);
    return c.json({ 
      error: 'Failed to process event',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;