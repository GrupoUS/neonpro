import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { createClient } from '@supabase/supabase-js';

const edgeApp = new Hono()
  .use(cors({
    origin: ['http://localhost:3000', 'https://*.vercel.app'],
    credentials: true,
  }))
  .get('/api/appointments', async (c) => {
    const clinicId = c.req.query('clinicId');
    
    if (!clinicId) {
      return c.json({ error: 'clinicId is required' }, 400);
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:users(name, email),
          professional:users(name, specialization)
        `)
        .eq('clinic_id', clinicId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return c.json({ data });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return c.json({ error: 'Failed to fetch appointments' }, 500);
    }
  })
  .get('/api/clinics/:id', async (c) => {
    const clinicId = c.req.param('id');
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single();

      if (error) throw error;

      return c.json({ data });
    } catch (error) {
      console.error('Error fetching clinic:', error);
      return c.json({ error: 'Failed to fetch clinic' }, 500);
    }
  });

export default handle(edgeApp);