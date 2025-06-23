interface EnvironmentVariables {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NEXTAUTH_URL?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
}

/**
 * Validates required environment variables for authentication
 * @param isProduction - Whether to enforce production-specific variables
 * @returns Validation result with missing variables and warnings
 */
export function validateEnvironmentVariables(
  isProduction = false
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    missingVars: [],
    warnings: [],
  };

  // Required variables for all environments
  const requiredVars: (keyof EnvironmentVariables)[] = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ];

  // Additional variables for production OAuth
  const oauthVars: (keyof EnvironmentVariables)[] = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.missingVars.push(varName);
      result.isValid = false;
    }
  }

  // Check OAuth variables (warnings for development, errors for production)
  for (const varName of oauthVars) {
    if (!process.env[varName]) {
      if (isProduction) {
        result.missingVars.push(varName);
        result.isValid = false;
      } else {
        result.warnings.push(`${varName} not set - Google OAuth will not work`);
      }
    }
  }

  // Validate SUPABASE_URL format
  if (
    process.env.SUPABASE_URL &&
    !isValidSupabaseUrl(process.env.SUPABASE_URL)
  ) {
    result.missingVars.push("SUPABASE_URL (invalid format)");
    result.isValid = false;
  }

  return result;
}

/**
 * Validates Supabase URL format
 */
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname.includes("supabase") ||
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/**
 * Logs environment validation results
 */
export function logEnvironmentValidation(): void {
  const isProduction = process.env.NODE_ENV === "production";
  const result = validateEnvironmentVariables(isProduction);

  if (!result.isValid) {
    console.error("❌ Environment validation failed!");
    console.error("Missing required variables:", result.missingVars);

    if (isProduction) {
      throw new Error(
        `Missing required environment variables: ${result.missingVars.join(
          ", "
        )}`
      );
    }
  } else {
    console.log("✅ Environment variables validated successfully");
  }

  if (result.warnings.length > 0) {
    console.warn("⚠️ Environment warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

/**
 * Gets environment configuration for client-side use
 */
export function getClientConfig() {
  return {
    supabaseUrl:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    supabaseAnonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY,
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
  };
}
