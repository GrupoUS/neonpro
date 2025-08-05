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
var conflict_detector_1 = require("../conflict-detector");
var types_1 = require("../types");
var supabase_js_1 = require("@supabase/supabase-js");
// Mock Supabase
jest.mock("@supabase/supabase-js");
var mockSupabase = {
  from: jest.fn(function () {
    return {
      select: jest.fn(function () {
        return {
          gte: jest.fn(function () {
            return {
              lte: jest.fn(function () {
                return {
                  eq: jest.fn(function () {
                    return {
                      neq: jest.fn(function () {
                        return Promise.resolve({ data: [], error: null });
                      }),
                    };
                  }),
                };
              }),
            };
          }),
        };
      }),
    };
  }),
};
supabase_js_1.createClient.mockReturnValue(mockSupabase);
describe("ConflictDetector", function () {
  var detector;
  var mockConfig;
  beforeEach(function () {
    mockConfig = {
      enabledTypes: [
        types_1.ConflictType.TIME_OVERLAP,
        types_1.ConflictType.STAFF_CONFLICT,
        types_1.ConflictType.ROOM_CONFLICT,
      ],
      severityThresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8,
      },
      cacheEnabled: true,
      cacheTTL: 300000,
      batchSize: 100,
      maxConcurrentChecks: 5,
    };
    detector = new conflict_detector_1.ConflictDetector(mockConfig);
    jest.clearAllMocks();
  });
  describe("Initialization", function () {
    it("should initialize with default config", function () {
      var defaultDetector = new conflict_detector_1.ConflictDetector();
      expect(defaultDetector).toBeInstanceOf(conflict_detector_1.ConflictDetector);
    });
    it("should initialize with custom config", function () {
      expect(detector).toBeInstanceOf(conflict_detector_1.ConflictDetector);
    });
    it("should validate config on initialization", function () {
      var invalidConfig = __assign(__assign({}, mockConfig), {
        severityThresholds: {
          low: 0.8,
          medium: 0.6,
          high: 0.3,
        },
      });
      expect(function () {
        return new conflict_detector_1.ConflictDetector(invalidConfig);
      }).toThrow();
    });
  });
  describe("detectConflicts", function () {
    var mockAppointment = {
      id: "test-appointment",
      start_time: "2024-01-15T10:00:00Z",
      end_time: "2024-01-15T11:00:00Z",
      staff_id: "staff-1",
      room_id: "room-1",
      client_id: "client-1",
      service_id: "service-1",
      status: "scheduled",
    };
    it("should detect time overlap conflicts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var overlappingAppointment, conflicts;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              overlappingAppointment = {
                id: "overlapping-appointment",
                start_time: "2024-01-15T10:30:00Z",
                end_time: "2024-01-15T11:30:00Z",
                staff_id: "staff-1",
                room_id: "room-2",
                client_id: "client-2",
                service_id: "service-2",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [overlappingAppointment],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectConflicts(mockAppointment)];
            case 1:
              conflicts = _a.sent();
              expect(conflicts).toHaveLength(1);
              expect(conflicts[0].type).toBe(types_1.ConflictType.TIME_OVERLAP);
              expect(conflicts[0].severity).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should detect staff conflicts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var staffConflictAppointment, conflicts;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              staffConflictAppointment = {
                id: "staff-conflict-appointment",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-2",
                client_id: "client-2",
                service_id: "service-2",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [staffConflictAppointment],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectConflicts(mockAppointment)];
            case 1:
              conflicts = _a.sent();
              expect(conflicts).toHaveLength(1);
              expect(conflicts[0].type).toBe(types_1.ConflictType.STAFF_CONFLICT);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should detect room conflicts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var roomConflictAppointment, conflicts;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              roomConflictAppointment = {
                id: "room-conflict-appointment",
                start_time: "2024-01-15T10:30:00Z",
                end_time: "2024-01-15T11:30:00Z",
                staff_id: "staff-2",
                room_id: "room-1",
                client_id: "client-2",
                service_id: "service-2",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [roomConflictAppointment],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectConflicts(mockAppointment)];
            case 1:
              conflicts = _a.sent();
              expect(conflicts).toHaveLength(1);
              expect(conflicts[0].type).toBe(types_1.ConflictType.ROOM_CONFLICT);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle multiple conflicts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var multipleConflicts, conflicts;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              multipleConflicts = [
                {
                  id: "conflict-1",
                  start_time: "2024-01-15T10:30:00Z",
                  end_time: "2024-01-15T11:30:00Z",
                  staff_id: "staff-1",
                  room_id: "room-1",
                  client_id: "client-2",
                  service_id: "service-2",
                  status: "scheduled",
                },
                {
                  id: "conflict-2",
                  start_time: "2024-01-15T10:15:00Z",
                  end_time: "2024-01-15T11:15:00Z",
                  staff_id: "staff-1",
                  room_id: "room-2",
                  client_id: "client-3",
                  service_id: "service-3",
                  status: "scheduled",
                },
              ];
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: multipleConflicts,
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectConflicts(mockAppointment)];
            case 1:
              conflicts = _a.sent();
              expect(conflicts.length).toBeGreaterThan(1);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should return empty array when no conflicts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var conflicts;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectConflicts(mockAppointment)];
            case 1:
              conflicts = _a.sent();
              expect(conflicts).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle database errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: null,
                                    error: { message: "Database error" },
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [
                4 /*yield*/,
                expect(detector.detectConflicts(mockAppointment)).rejects.toThrow("Database error"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("detectBatchConflicts", function () {
    var mockAppointments = [
      {
        id: "appointment-1",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      },
      {
        id: "appointment-2",
        start_time: "2024-01-15T11:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
        staff_id: "staff-2",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      },
    ];
    it("should detect conflicts for multiple appointments", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectBatchConflicts(mockAppointments)];
            case 1:
              results = _a.sent();
              expect(results).toHaveLength(2);
              expect(results[0].appointmentId).toBe("appointment-1");
              expect(results[1].appointmentId).toBe("appointment-2");
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle empty appointment list", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, detector.detectBatchConflicts([])];
            case 1:
              results = _a.sent();
              expect(results).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should respect batch size limits", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var largeAppointmentList, results;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              largeAppointmentList = Array.from({ length: 250 }, function (_, i) {
                return {
                  id: "appointment-".concat(i),
                  start_time: "2024-01-15T10:00:00Z",
                  end_time: "2024-01-15T11:00:00Z",
                  staff_id: "staff-".concat(i),
                  room_id: "room-".concat(i),
                  client_id: "client-".concat(i),
                  service_id: "service-".concat(i),
                  status: "scheduled",
                };
              });
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [4 /*yield*/, detector.detectBatchConflicts(largeAppointmentList)];
            case 1:
              results = _a.sent();
              expect(results).toHaveLength(250);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Severity Calculation", function () {
    it("should calculate correct severity for high overlap", function () {
      var appointment1 = {
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
      };
      var appointment2 = {
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
      };
      // Access private method through any type
      var severity = detector.calculateOverlapSeverity(appointment1, appointment2);
      expect(severity).toBeGreaterThan(0.5);
    });
    it("should calculate correct severity for low overlap", function () {
      var appointment1 = {
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
      };
      var appointment2 = {
        start_time: "2024-01-15T11:45:00Z",
        end_time: "2024-01-15T12:15:00Z",
      };
      var severity = detector.calculateOverlapSeverity(appointment1, appointment2);
      expect(severity).toBeLessThan(0.3);
    });
  });
  describe("Cache Management", function () {
    it("should use cache when enabled", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var appointment;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              appointment = {
                id: "cached-appointment",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: [],
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              // First call
              return [4 /*yield*/, detector.detectConflicts(appointment)];
            case 1:
              // First call
              _a.sent();
              // Second call should use cache
              return [4 /*yield*/, detector.detectConflicts(appointment)];
            case 2:
              // Second call should use cache
              _a.sent();
              // Should only call database once due to caching
              expect(mockSupabase.from).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      });
    });
    it("should clear cache when requested", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, detector.clearCache()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Configuration Updates", function () {
    it("should update configuration", function () {
      var newConfig = __assign(__assign({}, mockConfig), { cacheEnabled: false });
      detector.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });
    it("should validate new configuration", function () {
      var invalidConfig = __assign(__assign({}, mockConfig), {
        severityThresholds: {
          low: 1.5,
          medium: 0.6,
          high: 0.3,
        },
      });
      expect(function () {
        return detector.updateConfig(invalidConfig);
      }).toThrow();
    });
  });
  describe("Error Handling", function () {
    it("should handle invalid appointment data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidAppointment;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidAppointment = {
                id: "invalid-appointment",
                start_time: "invalid-date",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              return [
                4 /*yield*/,
                expect(detector.detectConflicts(invalidAppointment)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("should handle network timeouts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var appointment;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              appointment = {
                id: "timeout-appointment",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.reject(new Error("Network timeout"));
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              return [
                4 /*yield*/,
                expect(detector.detectConflicts(appointment)).rejects.toThrow("Network timeout"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Performance", function () {
    it("should handle large datasets efficiently", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var appointment, largeDataset, startTime, conflicts, endTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              appointment = {
                id: "performance-test",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              largeDataset = Array.from({ length: 1000 }, function (_, i) {
                return {
                  id: "conflict-".concat(i),
                  start_time: "2024-01-15T10:30:00Z",
                  end_time: "2024-01-15T11:30:00Z",
                  staff_id: "staff-".concat(i),
                  room_id: "room-".concat(i),
                  client_id: "client-".concat(i),
                  service_id: "service-".concat(i),
                  status: "scheduled",
                };
              });
              mockSupabase.from.mockReturnValue({
                select: jest.fn(function () {
                  return {
                    gte: jest.fn(function () {
                      return {
                        lte: jest.fn(function () {
                          return {
                            eq: jest.fn(function () {
                              return {
                                neq: jest.fn(function () {
                                  return Promise.resolve({
                                    data: largeDataset,
                                    error: null,
                                  });
                                }),
                              };
                            }),
                          };
                        }),
                      };
                    }),
                  };
                }),
              });
              startTime = Date.now();
              return [4 /*yield*/, detector.detectConflicts(appointment)];
            case 1:
              conflicts = _a.sent();
              endTime = Date.now();
              expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
              expect(conflicts).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
