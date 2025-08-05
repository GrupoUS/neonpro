"use strict";
/**
 * Temporary demand forecasting types for build compatibility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandForecastingEngine =
  exports.DemandForecastSchema =
  exports.FORECASTING_CONSTANTS =
    void 0;
exports.FORECASTING_CONSTANTS = {
  MAX_FORECAST_DAYS: 365,
  MIN_HISTORICAL_DAYS: 30,
  DEFAULT_CONFIDENCE_LEVEL: 0.95,
  ALGORITHMS: ["LINEAR", "SEASONAL", "EXPONENTIAL"],
};
// Export do DemandForecastSchema
exports.DemandForecastSchema = {
  type: "object",
  properties: {
    algorithm: { type: "string" },
    confidenceLevel: { type: "number" },
    forecastDays: { type: "number" },
  },
};
// Export do DemandForecastingEngine
var DemandForecastingEngine = /** @class */ (function () {
  function DemandForecastingEngine() {}
  DemandForecastingEngine.analyze = function () {
    return {};
  };
  DemandForecastingEngine.predict = function () {
    return {};
  };
  DemandForecastingEngine.calculate = function () {
    return {};
  };
  return DemandForecastingEngine;
})();
exports.DemandForecastingEngine = DemandForecastingEngine;
