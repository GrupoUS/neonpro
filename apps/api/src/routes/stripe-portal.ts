/**
 * Stripe Customer Portal API Routes
 * Handles creation of customer portal sessions for subscription management
 */

import { createClient } from '@supabase/supabase-js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Standardized CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8081',
  );
}

app.use(
  '*',
  cors({
    origin: origin =>
      !origin
        ? undefined
        : allowedOrigins.includes(origin)
        ? origin
        : undefined,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Create Stripe Customer Portal Session
 * POST /api/stripe/create-portal-session
 */
app.post('/create-portal-session', async c => {
  try {
    // Get user ID from request body
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return c.json({ error: 'User not found' }, 404);
    }

    // Check if user has a Stripe customer ID
    if (!profile.stripe_customer_id) {
      return c.json(
        {
          error: 'No Stripe customer found. Please subscribe first.',
        },
        400,
      );
    }

    // Import Stripe (dynamic import to avoid issues)
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8081'}/subscription`,
    });

    return c.json({
      success: true,
      portal_url: session.url,
    });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return c.json(
      {
        error: 'Failed to create customer portal session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * Get Customer Portal Configuration
 * GET /api/stripe/portal-config
 */
app.get('/portal-config', async c => {
  try {
    // Import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    // Get portal configuration
    const configurations = await stripe.billingPortal.configurations.list({
      limit: 1,
    });

    const config = configurations.data[0];

    return c.json({
      success: true,
      configuration: {
        id: config?.id,
        features: config?.features,
        default_return_url: config?.default_return_url,
      },
    });
  } catch (error) {
    console.error('Error fetching portal configuration:', error);
    return c.json(
      {
        error: 'Failed to fetch portal configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * Create Customer in Stripe (if needed)
 * POST /api/stripe/create-customer
 */
app.post('/create-customer', async c => {
  try {
    const { userId, email, name } = await c.req.json();

    if (!userId || !email) {
      return c.json({ error: 'User ID and email are required' }, 400);
    }

    // Import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name: name || email,
      metadata: {
        user_id: userId,
      },
    });

    // Update user profile with Stripe customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    if (updateError) {
      console.error(
        'Error updating user profile with customer ID:',
        updateError,
      );
      return c.json({ error: 'Failed to update user profile' }, 500);
    }

    return c.json({
      success: true,
      customer_id: customer.id,
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return c.json(
      {
        error: 'Failed to create customer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * Health check endpoint
 * GET /api/stripe/health
 */
app.get('/health', c => {
  return c.json({
    status: 'healthy',
    service: 'stripe-portal',
    timestamp: new Date().toISOString(),
  });
});

export default app;
