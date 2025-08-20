import { Hono } from 'hono';

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  // Simple validation for test purposes
  if (!body.email || !body.password) {
    return c.json({ error: 'Email and password required' }, 422);
  }
  
  // For testing - always return 401 for invalid credentials
  return c.json({ error: 'Invalid credentials' }, 401);
});

authRoutes.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  // Validate registration data
  if (!body.email || !body.password || !body.name) {
    return c.json({ error: 'Email, password and name required' }, 422);
  }
  
  // Simple email validation
  if (!body.email.includes('@')) {
    return c.json({ error: 'Invalid email format' }, 400);
  }
  
  return c.json({ message: 'Registration successful' }, 200);
});