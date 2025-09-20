import { beforeAll } from "vitest";
import * as dotenv from "dotenv";
import * as path from "path";

// Load test environment variables
beforeAll(() => {
  // Set NODE_ENV first to ensure test environment is detected
  process.env.NODE_ENV = "test";
  
  // Load .env.test file for test environment
  dotenv.config({ path: path.resolve(__dirname, "../.env.test") });
  
  // Set default test environment variables if not provided
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
  }
  
  if (!process.env.SUPABASE_JWT_SECRET) {
    process.env.SUPABASE_JWT_SECRET = "test-jwt-secret";
  }
  
  if (!process.env.SUPABASE_PROJECT_ID) {
    process.env.SUPABASE_PROJECT_ID = "test-project";
  }
  
  // Additional Supabase environment variables for completeness
  if (!process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  
  if (!process.env.SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }
});