"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var index_1 = require("@/lib/ai/patient-insights/index");
(0, globals_1.describe)("Patient Insights Integration - Simple Test", function () {
  (0, globals_1.test)("should validate PatientInsightsIntegration class exists", function () {
    (0, globals_1.expect)(index_1.PatientInsightsIntegration).toBeDefined();
    (0, globals_1.expect)(typeof index_1.PatientInsightsIntegration).toBe("function");
  });
  (0, globals_1.test)("should create PatientInsightsIntegration instance", function () {
    var mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    };
    var integration = new index_1.PatientInsightsIntegration(mockSupabase);
    (0, globals_1.expect)(integration).toBeDefined();
    (0, globals_1.expect)(integration).toBeInstanceOf(index_1.PatientInsightsIntegration);
  });
});
