/**
 * NeonPro Testing Toolkit
 *
 * Unified testing toolkit following KISS and YAGNI principles.
 * Provides comprehensive testing utilities for the entire NeonPro project.
 */

// Core testing utilities
export * from "./core";

// Agent coordination
export * from "./agents";

// Healthcare compliance
export * from "./compliance";

// Test fixtures and mocks
export * from "./fixtures";

// Testing utilities
export * from "./utils";

// Re-export commonly used testing libraries for convenience
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  vitest,
} from "vitest";

export {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

export { userEvent } from "@testing-library/user-event";

// Version and metadata
export const TOOLKIT_VERSION = "1.0.0";
export const SUPPORTED_FRAMEWORKS = [
  "React",
  "Hono",
  "Vitest",
  "Playwright",
  "Supabase",
] as const;

export const COMPLIANCE_STANDARDS = ["LGPD", "ANVISA", "CFM"] as const;

export const AGENT_TYPES = [
  "architect-review",
  "code-reviewer",
  "security-auditor",
  "tdd-orchestrator",
] as const;
