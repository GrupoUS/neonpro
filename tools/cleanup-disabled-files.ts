#!/usr/bin/env tsx

/**
 * Automated cleanup script for .disabled files
 * NEONPRO System Maintenance
 */

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface CleanupItem {
  path: string;
  action: "remove" | "reactivate" | "keep";
  reason: string;
  category: string;
}

// Files to definitely REMOVE (duplicated/obsolete)
const REMOVE_LIST: CleanupItem[] = [
  {
    path: "apps/web/types/lgpd.ts.disabled",
    action: "remove",
    reason:
      "LGPD types already implemented in packages/compliance/src/lgpd/types.ts",
    category: "duplicate",
  },
  {
    path: "apps/web/jest.config.js.disabled",
    action: "remove",
    reason: "Using Vitest now, Jest config obsolete",
    category: "obsolete",
  },
  {
    path: "apps/web/jest.setup.js.disabled",
    action: "remove",
    reason: "Using Vitest setup, Jest setup obsolete",
    category: "obsolete",
  },
  {
    path: "packages/ui/jest.config.js.disabled",
    action: "remove",
    reason: "Using Vitest now, Jest config obsolete",
    category: "obsolete",
  },
  {
    path: "packages/ui/vitest.config.mjs.disabled",
    action: "remove",
    reason: "Superseded by main vitest config",
    category: "obsolete",
  },
  {
    path: "packages/ai/src/chatbot/chatbot-service.ts.disabled",
    action: "remove",
    reason: "Experimental AI service, not part of core healthcare system",
    category: "experimental",
  },
  {
    path: "packages/ai/src/ethics/explainable-ai.ts.disabled",
    action: "remove",
    reason: "Experimental AI service, not part of core healthcare system",
    category: "experimental",
  },
  {
    path: "packages/ai/src/follow-up/follow-up-service.ts.disabled",
    action: "remove",
    reason: "Experimental AI service, not part of core healthcare system",
    category: "experimental",
  },
  {
    path: "packages/ai/src/scheduling/intelligent-scheduler.ts.disabled",
    action: "remove",
    reason: "Experimental AI service, not part of core healthcare system",
    category: "experimental",
  },
  {
    path: "packages/domain/src/api/anvisa.ts.disabled",
    action: "remove",
    reason: "ANVISA compliance already implemented in active compliance system",
    category: "duplicate",
  },
  {
    path: "packages/domain/src/api/lgpd.ts.disabled",
    action: "remove",
    reason: "LGPD API already implemented in active compliance system",
    category: "duplicate",
  },
  {
    path: "packages/domain/src/api/compliance-automation.ts.disabled",
    action: "remove",
    reason: "Compliance automation already implemented in active system",
    category: "duplicate",
  },
];

// Files to potentially REACTIVATE (might be useful)
const REACTIVATE_CANDIDATES: CleanupItem[] = [
  {
    path: "apps/web/types/rbac.ts.disabled",
    action: "keep",
    reason:
      "RBAC types may be needed, analyze if current implementation is complete",
    category: "evaluate",
  },
  {
    path: "apps/web/types/session.ts.disabled",
    action: "keep",
    reason: "Session types may be needed for advanced session management",
    category: "evaluate",
  },
  {
    path: "apps/web/types/sso.ts.disabled",
    action: "keep",
    reason: "SSO types may be needed for enterprise integrations",
    category: "evaluate",
  },
];

// Files to KEEP disabled (legacy/future use)
const KEEP_DISABLED: CleanupItem[] = [
  // All analytics hooks - keeping for potential future activation
  {
    path: "packages/domain/src/hooks/analytics/*.disabled",
    action: "keep",
    reason: "Analytics hooks may be useful for advanced analytics features",
    category: "future",
  },
  // Legacy hooks - keeping for reference
  {
    path: "packages/domain/src/hooks/legacy/*.disabled",
    action: "keep",
    reason: "Legacy hooks kept for reference and potential migration",
    category: "legacy",
  },
];

/**
 * Execute cleanup actions
 */
function executeCleanup() {
  let removedCount = 0;
  let keptCount = 0;
  let errorCount = 0;
  for (const item of REMOVE_LIST) {
    const fullPath = join(process.cwd(), item.path);

    try {
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        removedCount++;
      } else {
      }
    } catch {
      errorCount++;
    }
  }
  for (const item of REACTIVATE_CANDIDATES) {
    const fullPath = join(process.cwd(), item.path);
    if (existsSync(fullPath)) {
      keptCount++;
    }
  }

  // Create cleanup report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      removed: removedCount,
      kept: keptCount,
      errors: errorCount,
    },
    actions: {
      removed: REMOVE_LIST,
      candidates: REACTIVATE_CANDIDATES,
      kept: KEEP_DISABLED,
    },
  };

  // Write report
  const reportPath = join(process.cwd(), "scripts/cleanup-report.json");
  writeFileSync(reportPath, JSON.stringify(report, undefined, 2));

  if (errorCount === 0) {
  } else {
  }
}

/**
 * Analyze a .disabled file to suggest action
 */
function analyzeDisabledFile(filePath: string): CleanupItem {
  try {
    const content = readFileSync(filePath, "utf8");
    const fileName = filePath.split("/").pop() || "";

    // Analyze content to suggest action
    if (content.includes("// Placeholder") || content.includes("placeholder")) {
      return {
        path: filePath,
        action: "remove",
        reason: "Contains only placeholder code",
        category: "placeholder",
      };
    }

    if (fileName.includes("jest") || fileName.includes("test")) {
      return {
        path: filePath,
        action: "remove",
        reason: "Old test configuration, using Vitest now",
        category: "obsolete",
      };
    }

    if (content.includes("experimental") || content.includes("TODO")) {
      return {
        path: filePath,
        action: "keep",
        reason: "Experimental or incomplete code, may be useful later",
        category: "experimental",
      };
    }

    return {
      path: filePath,
      action: "keep",
      reason: "Unable to determine action automatically",
      category: "unknown",
    };
  } catch (error) {
    return {
      path: filePath,
      action: "keep",
      reason: `Error analyzing file: ${error}`,
      category: "error",
    };
  }
}

// Execute if run directly
if (require.main === module) {
  executeCleanup();
}

export {
  analyzeDisabledFile,
  executeCleanup,
  REACTIVATE_CANDIDATES,
  REMOVE_LIST,
};
