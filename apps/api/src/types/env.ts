/**
 * Environment types for Hono.dev application
 */

export interface AppEnv {
  Bindings: {
    // Vercel environment variables
    NODE_ENV: string;
    DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    JWT_SECRET: string;
    NEXTAUTH_SECRET: string;

    // Optional environment variables
    REDIS_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;

    // Analytics and monitoring
    ANALYTICS_API_KEY?: string;
    SENTRY_DSN?: string;

    // AI services
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
  };

  Variables: {
    // Request-scoped variables
    user?: {
      id: string;
      email: string;
      role: string;
      clinic_id?: string;
    };

    // Database connection
    db?: string;

    // Request metadata
    request_id?: string;
    start_time?: number;
    ip_address?: string;
    user_agent?: string;
  };
}
