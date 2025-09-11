// T013 validateEnv implementation (initial)
// Throws if required environment variables are missing. Extend as needed.

export interface EnvRequirements {
  required: string[];
}

const DEFAULT_REQUIRED = ['SUPABASE_URL'];

export function validateEnv(req: EnvRequirements = { required: DEFAULT_REQUIRED }) {
  const missing: string[] = [];
  for (const key of req.required) {
    if (!process.env[key] || process.env[key]?.trim() === '') missing.push(key);
  }
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
  return true;
}
