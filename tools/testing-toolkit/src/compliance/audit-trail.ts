/**
 * Audit Trail Testing Utilities
 *
 * Provides utilities for testing audit trail functionality
 * required for healthcare compliance.
 */

import { describe, expect, it } from "vitest";
import type { AuditTrailEntry } from "./types";

export class AuditTrailValidator {
  /**
   * Validate audit trail entry structure
   */
  static validateEntry(entry: AuditTrailEntry): boolean {
    return (
      entry.timestamp instanceof Date &&
      typeof entry.action === "string" &&
      entry.action.length > 0 &&
      typeof entry.userId === "string" &&
      entry.userId.length > 0 &&
      typeof entry.resourceType === "string" &&
      entry.resourceType.length > 0 &&
      typeof entry.resourceId === "string" &&
      entry.resourceId.length > 0
    );
  }

  /**
   * Validate audit trail completeness
   */
  static validateTrail(entries: AuditTrailEntry[]): {
    valid: boolean;
    issues: string[];
    coverage: number;
  } {
    const issues: string[] = [];

    if (!Array.isArray(entries)) {
      issues.push("Audit trail must be an array");
      return { valid: false, issues, coverage: 0 };
    }

    if (entries.length === 0) {
      issues.push("Audit trail cannot be empty");
      return { valid: false, issues, coverage: 0 };
    }

    // Validate each entry
    const invalidEntries = entries.filter(
      (entry) => !this.validateEntry(entry),
    );
    if (invalidEntries.length > 0) {
      issues.push(`${invalidEntries.length} invalid audit trail entries found`);
    }

    // Check for required actions
    const requiredActions = ["create", "read", "update", "delete"];
    const presentActions = new Set(
      entries.map((entry) => entry.action.toLowerCase()),
    );
    const missingActions = requiredActions.filter(
      (action) => !presentActions.has(action),
    );

    if (missingActions.length > 0) {
      issues.push(`Missing audit trail actions: ${missingActions.join(", ")}`);
    }

    // Check chronological order
    const sortedEntries = [...entries].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    const isChronological = entries.every(
      (entry, index) =>
        entry.timestamp.getTime() === sortedEntries[index]?.timestamp.getTime(),
    );

    if (!isChronological) {
      issues.push("Audit trail entries are not in chronological order");
    }

    const coverage =
      ((requiredActions.length - missingActions.length) /
        requiredActions.length) *
      100;

    return {
      valid: issues.length === 0,
      issues,
      coverage,
    };
  }

  /**
   * Validate audit trail for specific resource
   */
  static validateResourceTrail(
    entries: AuditTrailEntry[],
    resourceType: string,
    resourceId: string,
  ): {
    valid: boolean;
    entries: AuditTrailEntry[];
    actions: string[];
    timeline: { start: Date; end: Date };
  } {
    const resourceEntries = entries.filter(
      (entry) =>
        entry.resourceType === resourceType && entry.resourceId === resourceId,
    );

    if (resourceEntries.length === 0) {
      return {
        valid: false,
        entries: [],
        actions: [],
        timeline: { start: new Date(), end: new Date() },
      };
    }

    const actions = resourceEntries.map((entry) => entry.action);
    const timestamps = resourceEntries.map((entry) => entry.timestamp);
    const timeline = {
      start: new Date(Math.min(...timestamps.map((t) => t.getTime()))),
      end: new Date(Math.max(...timestamps.map((t) => t.getTime()))),
    };

    return {
      valid: true,
      entries: resourceEntries,
      actions,
      timeline,
    };
  }
}

/**
 * Create audit trail test suite
 */
export function createAuditTrailTestSuite(
  testName: string,
  auditTrail: AuditTrailEntry[],
) {
  describe(`Audit Trail: ${testName}`, () => {
    it("should have valid audit trail structure", () => {
      const validation = AuditTrailValidator.validateTrail(auditTrail);
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it("should have complete action coverage", () => {
      const validation = AuditTrailValidator.validateTrail(auditTrail);
      expect(validation.coverage).toBeGreaterThanOrEqual(75);
    });

    it("should have chronological entries", () => {
      const timestamps = auditTrail.map((entry) => entry.timestamp.getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it("should have valid entry structure", () => {
      auditTrail.forEach((entry, index) => {
        expect(
          AuditTrailValidator.validateEntry(entry),
          `Entry ${index} should be valid`,
        ).toBe(true);
      });
    });
  });
}

/**
 * Mock audit trail data for testing
 */
export function createMockAuditTrail(
  resourceType: string = "patient",
  resourceId: string = "test-patient-123",
): AuditTrailEntry[] {
  const baseTime = new Date("2024-01-01T10:00:00Z");

  return [
    {
      timestamp: new Date(baseTime.getTime()),
      action: "create",
      userId: "user-123",
      resourceType,
      resourceId,
      details: { reason: "Patient registration" },
    },
    {
      timestamp: new Date(baseTime.getTime() + 60000), // +1 minute
      action: "read",
      userId: "user-123",
      resourceType,
      resourceId,
      details: { reason: "Patient data access" },
    },
    {
      timestamp: new Date(baseTime.getTime() + 120000), // +2 minutes
      action: "update",
      userId: "user-456",
      resourceType,
      resourceId,
      details: { reason: "Medical record update", fields: ["diagnosis"] },
    },
    {
      timestamp: new Date(baseTime.getTime() + 180000), // +3 minutes
      action: "read",
      userId: "user-789",
      resourceType,
      resourceId,
      details: { reason: "Medical consultation" },
    },
    {
      timestamp: new Date(baseTime.getTime() + 240000), // +4 minutes
      action: "delete",
      userId: "user-321",
      resourceType,
      resourceId,
      details: { reason: "Patient requested data removal" },
    },
  ];
}
