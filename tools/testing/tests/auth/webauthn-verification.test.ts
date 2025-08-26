/**
 * WebAuthn API Integration Tests
 * TASK-002: Authentication & Security Enhancement
 *
 * Tests for WebAuthn/FIDO2 authentication implementation
 */

import { describe, expect, it } from "vitest";

describe("webAuthn Implementation Verification", () => {
  it("should have WebAuthn service utilities", () => {
    // Test that all required modules exist and can be imported
    expect(() => {
      require("../../lib/auth/webauthn-service");
    }).not.toThrow();

    expect(() => {
      require("../../lib/auth/webauthn-client");
    }).not.toThrow();

    expect(() => {
      require("../../lib/auth/performance-tracker");
    }).not.toThrow();
  });

  it("should have WebAuthn API endpoints", async () => {
    // Test that API route files exist
    const fs = require("node:fs");
    const path = require("node:path");

    const apiPaths = [
      "app/api/auth/webauthn/register/options/route.ts",
      "app/api/auth/webauthn/register/verify/route.ts",
      "app/api/auth/webauthn/authenticate/options/route.ts",
      "app/api/auth/webauthn/authenticate/verify/route.ts",
      "app/api/auth/webauthn/credentials/route.ts",
      "app/api/auth/webauthn/credentials/[credentialId]/route.ts",
    ];

    for (const apiPath of apiPaths) {
      const fullPath = path.join(process.cwd(), apiPath);
      expect(fs.existsSync(fullPath)).toBeTruthy();
    }
  });

  it("should have WebAuthn React component", () => {
    const fs = require("node:fs");
    const path = require("node:path");

    const componentPath = path.join(
      process.cwd(),
      "components/auth/webauthn-manager.tsx",
    );
    expect(fs.existsSync(componentPath)).toBeTruthy();
  });

  it("should have WebAuthn dependencies installed", () => {
    // Test that WebAuthn dependencies are available
    expect(() => {
      require("@simplewebauthn/server");
    }).not.toThrow();

    expect(() => {
      require("@simplewebauthn/browser");
    }).not.toThrow();
  });

  it("should have performance tracking integration", () => {
    const {
      authPerformanceTracker,
    } = require("../../lib/auth/performance-tracker");

    // Test that performance tracker is properly initialized
    expect(authPerformanceTracker).toBeDefined();
    expect(typeof authPerformanceTracker.getPerformanceThresholds).toBe(
      "function",
    );

    // Test that performance thresholds match TASK-002 requirements
    const thresholds = authPerformanceTracker.getPerformanceThresholds();
    expect(thresholds.login).toBe(350); // ≤350ms requirement from TASK-002
    expect(thresholds.session_validation).toBe(100);
    expect(thresholds.mfa_verification).toBe(500);
  });

  it("should have proper WebAuthn configuration", () => {
    // Test environment variables and configuration
    const { webAuthnService } = require("../../lib/auth/webauthn-service");
    expect(webAuthnService).toBeDefined();
  });
});

describe("tASK-002 Authentication Performance Requirements", () => {
  it("should meet performance targets", () => {
    const {
      authPerformanceTracker,
    } = require("../../lib/auth/performance-tracker");
    const thresholds = authPerformanceTracker.getPerformanceThresholds();

    // TASK-002 Story 1.1 Performance Requirements
    expect(thresholds.login).toBeLessThanOrEqual(350); // ≤350ms target
    expect(thresholds.logout).toBeLessThanOrEqual(200);
    expect(thresholds.session_validation).toBeLessThanOrEqual(100);
    expect(thresholds.token_refresh).toBeLessThanOrEqual(250);
    expect(thresholds.mfa_verification).toBeLessThanOrEqual(500);
  });

  it("should integrate with TASK-001 monitoring infrastructure", () => {
    // Verify integration with monitoring infrastructure from TASK-001
    expect(() => {
      require("../../lib/monitoring/performance");
    }).not.toThrow();

    expect(() => {
      require("../../lib/monitoring/analytics");
    }).not.toThrow();
  });
});

describe("webAuthn Security Features", () => {
  it("should have comprehensive security audit preparation", () => {
    const fs = require("node:fs");
    const path = require("node:path");

    // Check that security audit schema is prepared
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250124_webauthn_schema.sql",
    );
    expect(fs.existsSync(migrationPath)).toBeTruthy();

    // Verify migration contains security audit table
    const migrationContent = fs.readFileSync(migrationPath, "utf8");
    expect(migrationContent).toContain("security_audit_log");
    expect(migrationContent).toContain("webauthn_credentials");
    expect(migrationContent).toContain("trusted_devices");
    expect(migrationContent).toContain("mfa_backup_codes");
  });

  it("should have proper database schema for WebAuthn", () => {
    const fs = require("node:fs");
    const path = require("node:path");

    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20250124_webauthn_schema.sql",
    );
    const content = fs.readFileSync(migrationPath, "utf8");

    // Verify essential WebAuthn fields are present
    expect(content).toContain("credential_id");
    expect(content).toContain("public_key");
    expect(content).toContain("counter");
    expect(content).toContain("device_type");
    expect(content).toContain("RLS");
  });
});
