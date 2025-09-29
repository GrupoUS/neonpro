import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { createClient } from '@supabase/supabase-js';

const nodeApp = new Hono()
  .use(cors({
    origin: ['http://localhost:3000', 'https://*.vercel.app'],
    credentials: true,
  }))
  .post('/api/appointments', async (c) => {
    const body = await c.req.json();
    
    // Use service role for appointment creation
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { persistSession: false },
        // Service role bypasses RLS
      }
    );

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(body)
        .select()
        .single();

      if (error) throw error;

      return c.json({ data });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return c.json({ error: 'Failed to create appointment' }, 500);
    }
  })  .post('/api/webhooks/supabase', async (c) => {
    const payload = await c.req.json();
    
    // Process Supabase webhook events
    console.log('Supabase webhook received:', payload);
    
    // Handle different event types
    switch (payload.type) {
      case 'appointment_created':
        await handleAppointmentCreated(payload.record);
        break;
      case 'appointment_updated':
        await handleAppointmentUpdated(payload.record);
        break;
      default:
        console.log('Unknown webhook type:', payload.type);
    }

    return c.json({ received: true });
  });

// Background job handlers
async function handleAppointmentCreated(appointment: any) {
  console.log('Processing new appointment:', appointment.id);
  // Send confirmation emails, notifications, etc.
}

async function handleAppointmentUpdated(appointment: any) {
  console.log('Processing appointment update:', appointment.id);
  // Send update notifications
}

export const nodeHandler = handle(nodeApp);