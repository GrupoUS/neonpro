import { Hono } from 'hono';

export const appointmentRoutes = new Hono();

// Authentication middleware for all appointment routes
appointmentRoutes.use('*', async (c, next) => {
  const auth = c.req.header('Authorization');
  if (!(auth && auth.startsWith('Bearer '))) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  await next();
});

appointmentRoutes.get('/', async (c) => {
  return c.json({ message: 'Appointments list - not implemented' }, 501);
});

appointmentRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));

  // Validate appointment data
  if (!(body.patient_id && body.date)) {
    return c.json({ error: 'Missing patient_id or date' }, 422);
  }

  return c.json({ message: 'Create appointment - not implemented' }, 501);
});
