"use strict";
/**
 * Clerk Configuration and Setup
 * Production-ready configuration for healthcare applications
 * Based on Next.js 14+ App Router best practices
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthcareAppearance = exports.clerkConfig = void 0;
exports.validateClerkConfig = validateClerkConfig;
exports.clerkConfig = {
  // Environment validation
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  // Healthcare-specific URLs
  signInUrl: process.env.CLERK_SIGN_IN_URL || "/entrar",
  signUpUrl: process.env.CLERK_SIGN_UP_URL || "/cadastro",
  afterSignInUrl: process.env.CLERK_AFTER_SIGN_IN_URL || "/dashboard",
  afterSignUpUrl: process.env.CLERK_AFTER_SIGN_UP_URL || "/onboarding",
  // Session configuration for healthcare compliance
  sessionTimeout: 30 * 60 * 1000, // 30 minutes for security
  maxConcurrentSessions: 3, // Allow limited concurrent sessions
  // Protected routes configuration
  protectedRoutes: ["/dashboard", "/patients", "/appointments", "/admin", "/api/protected"],
  // Public routes that should always be accessible
  publicRoutes: [
    "/",
    "/sobre",
    "/contato",
    "/privacy",
    "/terms",
    "/entrar",
    "/cadastro",
    "/api/health",
    "/api/webhook",
  ],
};
// Validate environment variables at startup
function validateClerkConfig() {
  var errors = [];
  if (!exports.clerkConfig.publishableKey) {
    errors.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required");
  }
  if (!exports.clerkConfig.secretKey) {
    errors.push("CLERK_SECRET_KEY is required");
  }
  if (errors.length > 0) {
    throw new Error("Clerk configuration errors:\n".concat(errors.join("\n")));
  }
  return true;
}
// Healthcare-specific appearance configuration
exports.healthcareAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: "#0ea5e9", // Healthcare blue
    colorBackground: "#ffffff",
    colorInputBackground: "#f8fafc",
    colorInputText: "#1e293b",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  },
  elements: {
    formButtonPrimary: {
      backgroundColor: "#0ea5e9",
      borderRadius: "0.5rem",
      fontSize: "14px",
      fontWeight: "500",
      padding: "12px 24px",
      "&:hover": {
        backgroundColor: "#0284c7",
      },
    },
    card: {
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      borderRadius: "12px",
      padding: "32px",
    },
    headerTitle: {
      color: "#1e293b",
      fontSize: "24px",
      fontWeight: "600",
    },
    headerSubtitle: {
      color: "#64748b",
      fontSize: "14px",
      marginTop: "4px",
    },
    formFieldInput: {
      borderColor: "#d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      padding: "12px 16px",
      "&:focus": {
        borderColor: "#0ea5e9",
        boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
      },
    },
    socialButtonsBlockButton: {
      borderColor: "#d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      padding: "12px 24px",
      "&:hover": {
        borderColor: "#9ca3af",
      },
    },
    footerActionText: {
      color: "#64748b",
      fontSize: "14px",
    },
    footerActionLink: {
      color: "#0ea5e9",
      fontSize: "14px",
      fontWeight: "500",
      "&:hover": {
        color: "#0284c7",
      },
    },
  },
};
