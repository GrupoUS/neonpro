/**
 * @fileoverview Environment Configuration
 * Consolidated from infrastructure/environments/
 */

export interface EnvironmentConfig {
  NODE_ENV: string;
  APP_ENV: string;
  PORT: number;
  NEXT_PUBLIC_APP_URL: string;
}

export const environments = {
  production: {
    configFile: "./production.env",
    description: "Production environment configuration",
    requires: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OPENAI_API_KEY"],
  },
};

export const validateEnvironment = (env: string) => {
  const config = environments[env as keyof typeof environments];
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }
  return config;
};
