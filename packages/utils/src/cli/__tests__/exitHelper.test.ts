/**
 * Exit Helper Tests - Simplified version
 */

import { describe, it, expect } from "vitest";
import { validateExitResult, type ExitResult } from "../exitHelper.js";

describe(_"exitHelper",_() => {
  describe(_"validateExitResult",_() => {
    it(_"should validate correct ExitResult objects",_() => {
      const validResults: ExitResult[] = [
        { status: "ok", code: 0 },
        { status: "error", code: 1, message: "Error" },
        {
          status: "ok",
          code: 0,
          message: "Success",
          details: { key: "value" },
        },
      ];

      validResults.forEach(_(result) => {
        expect(validateExitResult(result)).toBe(true);
      });
    });

    it(_"should reject invalid objects",_() => {
      const invalidResults = [
        null,
        undefined,
        "string",
        123,
        { status: "invalid" },
        { status: "ok" }, // missing code
        { code: 0 }, // missing status
        { status: "ok", code: "0" }, // wrong type for code
        { status: "ok", code: 0, message: 123 }, // wrong type for message
      ];

      invalidResults.forEach(_(result) => {
        expect(validateExitResult(result)).toBe(false);
      });
    });
  });

  // Test JSON schema compliance without process mocking
  describe(_"JSON schema",_() => {
    it(_"should define proper ExitResult interface",_() => {
      const okResult: ExitResult = {
        status: "ok",
        code: 0,
        message: "Success",
        details: { data: "test" },
      };

      const errorResult: ExitResult = {
        status: "error",
        code: 1,
        message: "Failed",
      };

      expect(okResult.status).toBe("ok");
      expect(errorResult.status).toBe("error");
      expect(typeof okResult.code).toBe("number");
      expect(typeof errorResult.code).toBe("number");
    });

    it(_"should allow optional message and details",_() => {
      const minimalOk: ExitResult = { status: "ok", code: 0 };
      const minimalError: ExitResult = { status: "error", code: 1 };

      expect(validateExitResult(minimalOk)).toBe(true);
      expect(validateExitResult(minimalError)).toBe(true);
    });
  });
});
