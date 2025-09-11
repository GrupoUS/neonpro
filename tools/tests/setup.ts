import { beforeAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables for testing
beforeAll(() => {
  // Load .env files in order of precedence
  config({ path: '.env.local' });
  config({ path: '.env.test' });
  config({ path: '.env' });
  
  // Set test-specific defaults
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  // Validate required environment variables for testing
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables for full test coverage: ${missingVars.join(', ')}`);
    console.warn('Some tests may be skipped or limited in scope.');
  }
  
  // Optional variables that enable advanced testing
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingOptional = optionalVars.filter(varName => !process.env[varName]);
  
  if (missingOptional.length > 0) {
    console.warn(`ℹ️  Optional environment variables not set: ${missingOptional.join(', ')}`);
    console.warn('Advanced tests requiring elevated permissions will be skipped.');
  }
});