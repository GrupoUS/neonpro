"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConflictPrevention = useConflictPrevention;
exports.useQuickAvailabilityCheck = useQuickAvailabilityCheck;
var react_1 = require("react");
function useConflictPrevention(_a) {
  var _this = this;
  var _b = _a === void 0 ? {} : _a,
    _c = _b.debounceMs,
    debounceMs = _c === void 0 ? 300 : _c,
    _d = _b.enableRealTime,
    enableRealTime = _d === void 0 ? true : _d;
  // State management
  var _e = (0, react_1.useState)(false),
    isValidating = _e[0],
    setIsValidating = _e[1];
  var _f = (0, react_1.useState)(null),
    lastValidation = _f[0],
    setLastValidation = _f[1];
  var _g = (0, react_1.useState)([]),
    conflicts = _g[0],
    setConflicts = _g[1];
  var _h = (0, react_1.useState)([]),
    warnings = _h[0],
    setWarnings = _h[1];
  var _j = (0, react_1.useState)([]),
    alternativeSlots = _j[0],
    setAlternativeSlots = _j[1];
  var _k = (0, react_1.useState)(false),
    isAvailable = _k[0],
    setIsAvailable = _k[1];
  // Refs for debouncing and request management
  var debounceTimeoutRef = (0, react_1.useRef)(null);
  var currentRequestRef = (0, react_1.useRef)("");
  // Generate request key for deduplication
  var generateRequestKey = function (request) {
    return ""
      .concat(request.professional_id, "-")
      .concat(request.service_type_id, "-")
      .concat(request.start_time, "-")
      .concat(request.end_time);
  };
  // Main validation function
  var validateSlot = (0, react_1.useCallback)(
    function (request) {
      return __awaiter(_this, void 0, void 0, function () {
        var requestKey;
        var _this = this;
        return __generator(this, function (_a) {
          requestKey = generateRequestKey(request);
          // Prevent duplicate requests
          if (currentRequestRef.current === requestKey && isValidating) {
            return [
              2 /*return*/,
              lastValidation || {
                success: false,
                available: false,
                conflicts: [],
                warnings: [],
                alternative_slots: [],
                validation_details: {
                  appointment_date: "",
                  appointment_time: "",
                  day_of_week: 0,
                  duration_minutes: 0,
                },
              },
            ];
          }
          // Clear previous debounce
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          // Set up debounced validation
          return [
            2 /*return*/,
            new Promise(function (resolve, reject) {
              debounceTimeoutRef.current = setTimeout(
                function () {
                  return __awaiter(_this, void 0, void 0, function () {
                    var response, errorData, validationResult, error_1, errorResponse;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          _a.trys.push([0, 5, 6, 7]);
                          setIsValidating(true);
                          currentRequestRef.current = requestKey;
                          return [
                            4 /*yield*/,
                            fetch("/api/appointments/validate-slot", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(request),
                            }),
                          ];
                        case 1:
                          response = _a.sent();
                          if (!!response.ok) return [3 /*break*/, 3];
                          return [4 /*yield*/, response.json()];
                        case 2:
                          errorData = _a.sent();
                          throw new Error(errorData.details || "HTTP ".concat(response.status));
                        case 3:
                          return [4 /*yield*/, response.json()];
                        case 4:
                          validationResult = _a.sent();
                          // Update state
                          setLastValidation(validationResult);
                          setConflicts(validationResult.conflicts || []);
                          setWarnings(validationResult.warnings || []);
                          setAlternativeSlots(validationResult.alternative_slots || []);
                          setIsAvailable(validationResult.available || false);
                          resolve(validationResult);
                          return [3 /*break*/, 7];
                        case 5:
                          error_1 = _a.sent();
                          console.error("Slot validation error:", error_1);
                          errorResponse = {
                            success: false,
                            available: false,
                            conflicts: [
                              {
                                type: "APPOINTMENT_OVERLAP", // Generic type for errors
                                message: "Validation failed: ".concat(
                                  error_1 instanceof Error ? error_1.message : "Unknown error",
                                ),
                                severity: "error",
                              },
                            ],
                            warnings: [],
                            alternative_slots: [],
                            validation_details: {
                              appointment_date: new Date(request.start_time)
                                .toISOString()
                                .split("T")[0],
                              appointment_time: new Date(request.start_time)
                                .toTimeString()
                                .split(" ")[0],
                              day_of_week: new Date(request.start_time).getDay(),
                              duration_minutes: Math.round(
                                (new Date(request.end_time).getTime() -
                                  new Date(request.start_time).getTime()) /
                                  60000,
                              ),
                            },
                          };
                          setLastValidation(errorResponse);
                          setConflicts(errorResponse.conflicts);
                          setWarnings([]);
                          setAlternativeSlots([]);
                          setIsAvailable(false);
                          reject(error_1);
                          return [3 /*break*/, 7];
                        case 6:
                          setIsValidating(false);
                          currentRequestRef.current = "";
                          return [7 /*endfinally*/];
                        case 7:
                          return [2 /*return*/];
                      }
                    });
                  });
                },
                enableRealTime ? debounceMs : 0,
              );
            }),
          ];
        });
      });
    },
    [debounceMs, enableRealTime, isValidating, lastValidation],
  );
  // Clear validation state
  var clearValidation = (0, react_1.useCallback)(function () {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsValidating(false);
    setLastValidation(null);
    setConflicts([]);
    setWarnings([]);
    setAlternativeSlots([]);
    setIsAvailable(false);
    currentRequestRef.current = "";
  }, []);
  // Utility functions
  var hasErrors = conflicts.some(function (c) {
    return c.severity === "error";
  });
  var hasWarnings =
    warnings.length > 0 ||
    conflicts.some(function (c) {
      return c.severity === "warning";
    });
  var getConflictsByType = (0, react_1.useCallback)(
    function (type) {
      return conflicts.filter(function (conflict) {
        return conflict.type === type;
      });
    },
    [conflicts],
  );
  var getSuggestedSlots = (0, react_1.useCallback)(
    function (limit) {
      if (limit === void 0) {
        limit = 3;
      }
      return alternativeSlots
        .filter(function (slot) {
          return slot.available;
        })
        .sort(function (a, b) {
          return (b.score || 0) - (a.score || 0);
        })
        .slice(0, limit);
    },
    [alternativeSlots],
  );
  // Cleanup on unmount
  var cleanup = (0, react_1.useCallback)(function () {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);
  // Auto-cleanup effect would go here if this was a full component
  return {
    // State
    isValidating: isValidating,
    lastValidation: lastValidation,
    conflicts: conflicts,
    warnings: warnings,
    alternativeSlots: alternativeSlots,
    isAvailable: isAvailable,
    // Actions
    validateSlot: validateSlot,
    clearValidation: clearValidation,
    // Utilities
    hasErrors: hasErrors,
    hasWarnings: hasWarnings,
    getConflictsByType: getConflictsByType,
    getSuggestedSlots: getSuggestedSlots,
  };
}
// Utility hook for checking availability without full conflict details
function useQuickAvailabilityCheck() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isChecking = _a[0],
    setIsChecking = _a[1];
  var checkAvailability = (0, react_1.useCallback)(function (
    professionalId,
    serviceTypeId,
    startTime,
    endTime,
    excludeAppointmentId,
  ) {
    return __awaiter(_this, void 0, void 0, function () {
      var params, response, result, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsChecking(true);
            params = new URLSearchParams(
              __assign(
                {
                  professional_id: professionalId,
                  service_type_id: serviceTypeId,
                  start_time: startTime,
                  end_time: endTime,
                },
                excludeAppointmentId && {
                  exclude_appointment_id: excludeAppointmentId,
                },
              ),
            );
            return [4 /*yield*/, fetch("/api/appointments/validate-slot?".concat(params))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              return [2 /*return*/, false];
            }
            return [4 /*yield*/, response.json()];
          case 2:
            result = _a.sent();
            return [2 /*return*/, result.available || false];
          case 3:
            error_2 = _a.sent();
            console.error("Quick availability check error:", error_2);
            return [2 /*return*/, false];
          case 4:
            setIsChecking(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  return {
    isChecking: isChecking,
    checkAvailability: checkAvailability,
  };
}
