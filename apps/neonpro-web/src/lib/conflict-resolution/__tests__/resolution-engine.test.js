var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
var resolution_engine_1 = require("../resolution-engine");
var types_1 = require("../types");
var supabase_js_1 = require("@supabase/supabase-js");
// Mock Supabase
jest.mock("@supabase/supabase-js");
var mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            neq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
};
supabase_js_1.createClient.mockReturnValue(mockSupabase);
describe("ResolutionEngine", () => {
  var engine;
  var mockConfig;
  var mockConflict;
  beforeEach(() => {
    mockConfig = {
      enabledStrategies: [
        types_1.ResolutionStrategy.RESCHEDULE_LATER,
        types_1.ResolutionStrategy.RESCHEDULE_EARLIER,
        types_1.ResolutionStrategy.CHANGE_STAFF,
        types_1.ResolutionStrategy.CHANGE_ROOM,
      ],
      maxResolutionOptions: 5,
      autoApplyThreshold: 0.9,
      requireApproval: true,
      notificationEnabled: true,
      rollbackEnabled: true,
      maxRollbackDays: 7,
    };
    mockConflict = {
      id: "conflict-1",
      type: types_1.ConflictType.TIME_OVERLAP,
      severity: types_1.ConflictSeverity.HIGH,
      appointmentId: "appointment-1",
      conflictingAppointmentId: "appointment-2",
      description: "Time overlap conflict",
      detectedAt: new Date(),
      metadata: {
        overlapDuration: 30,
        overlapPercentage: 0.5,
      },
    };
    engine = new resolution_engine_1.ResolutionEngine(mockConfig);
    jest.clearAllMocks();
  });
  describe("Initialization", () => {
    it("should initialize with default config", () => {
      var defaultEngine = new resolution_engine_1.ResolutionEngine();
      expect(defaultEngine).toBeInstanceOf(resolution_engine_1.ResolutionEngine);
    });
    it("should initialize with custom config", () => {
      expect(engine).toBeInstanceOf(resolution_engine_1.ResolutionEngine);
    });
    it("should validate config on initialization", () => {
      var invalidConfig = __assign(__assign({}, mockConfig), { maxResolutionOptions: -1 });
      expect(() => new resolution_engine_1.ResolutionEngine(invalidConfig)).toThrow();
    });
  });
  describe("generateResolutions", () => {
    it("should generate resolution options for time overlap conflict", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointment, resolutions;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              // Mock available slots
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, engine.generateResolutions(mockConflict, mockAppointment)];
            case 1:
              resolutions = _a.sent();
              expect(resolutions).toBeDefined();
              expect(Array.isArray(resolutions)).toBe(true);
              expect(resolutions.length).toBeGreaterThan(0);
              expect(resolutions.length).toBeLessThanOrEqual(mockConfig.maxResolutionOptions);
              return [2 /*return*/];
          }
        });
      }));
    it("should generate different strategies for different conflict types", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var staffConflict,
          roomConflict,
          mockAppointment,
          staffResolutions,
          roomResolutions,
          staffStrategies,
          roomStrategies;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              staffConflict = __assign(__assign({}, mockConflict), {
                type: types_1.ConflictType.STAFF_CONFLICT,
              });
              roomConflict = __assign(__assign({}, mockConflict), {
                type: types_1.ConflictType.ROOM_CONFLICT,
              });
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, engine.generateResolutions(staffConflict, mockAppointment)];
            case 1:
              staffResolutions = _a.sent();
              return [4 /*yield*/, engine.generateResolutions(roomConflict, mockAppointment)];
            case 2:
              roomResolutions = _a.sent();
              expect(staffResolutions).toBeDefined();
              expect(roomResolutions).toBeDefined();
              staffStrategies = staffResolutions.map((r) => r.strategy);
              roomStrategies = roomResolutions.map((r) => r.strategy);
              expect(staffStrategies).toContain(types_1.ResolutionStrategy.CHANGE_STAFF);
              expect(roomStrategies).toContain(types_1.ResolutionStrategy.CHANGE_ROOM);
              return [2 /*return*/];
          }
        });
      }));
    it("should rank resolutions by score", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointment, resolutions, i;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, engine.generateResolutions(mockConflict, mockAppointment)];
            case 1:
              resolutions = _a.sent();
              // Check if resolutions are sorted by score (descending)
              for (i = 0; i < resolutions.length - 1; i++) {
                expect(resolutions[i].score).toBeGreaterThanOrEqual(resolutions[i + 1].score);
              }
              return [2 /*return*/];
          }
        });
      }));
    it("should handle equipment conflicts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var equipmentConflict, mockAppointment, resolutions;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              equipmentConflict = __assign(__assign({}, mockConflict), {
                type: types_1.ConflictType.EQUIPMENT_CONFLICT,
              });
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, engine.generateResolutions(equipmentConflict, mockAppointment)];
            case 1:
              resolutions = _a.sent();
              expect(resolutions).toBeDefined();
              expect(resolutions.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("applyResolution", () => {
    var mockResolution;
    beforeEach(() => {
      mockResolution = {
        id: "resolution-1",
        strategy: types_1.ResolutionStrategy.RESCHEDULE_LATER,
        description: "Reschedule appointment to later time",
        score: 0.85,
        confidence: 0.9,
        estimatedCost: 10,
        feasibility: 0.95,
        changes: {
          appointmentId: "appointment-1",
          newStartTime: "2024-01-15T14:00:00Z",
          newEndTime: "2024-01-15T15:00:00Z",
        },
        pros: ["Minimal disruption", "Same day"],
        cons: ["Later in day"],
        affectedAppointments: ["appointment-1"],
        requiredApprovals: ["client-1"],
        estimatedDuration: 5,
      };
    });
    it("should apply resolution successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [{ id: "appointment-1" }],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.applyResolution(mockResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              expect(result.appliedChanges).toBeDefined();
              expect(mockSupabase.from).toHaveBeenCalledWith("appointments");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle validation errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidResolution, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidResolution = __assign(__assign({}, mockResolution), {
                changes: {
                  appointmentId: "appointment-1",
                  newStartTime: "invalid-date",
                  newEndTime: "2024-01-15T15:00:00Z",
                },
              });
              return [4 /*yield*/, engine.applyResolution(invalidResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle database errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: null,
                      error: { message: "Database error" },
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.applyResolution(mockResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.error).toContain("Database error");
              return [2 /*return*/];
          }
        });
      }));
    it("should create rollback point when enabled", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var configWithRollback, engineWithRollback, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              configWithRollback = __assign(__assign({}, mockConfig), { rollbackEnabled: true });
              engineWithRollback = new resolution_engine_1.ResolutionEngine(configWithRollback);
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [{ id: "appointment-1" }],
                      error: null,
                    }),
                  ),
                })),
                insert: jest.fn(() =>
                  Promise.resolve({
                    data: [{ id: "rollback-1" }],
                    error: null,
                  }),
                ),
              });
              return [4 /*yield*/, engineWithRollback.applyResolution(mockResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              expect(result.rollbackId).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle staff changes", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var staffChangeResolution, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              staffChangeResolution = __assign(__assign({}, mockResolution), {
                strategy: types_1.ResolutionStrategy.CHANGE_STAFF,
                changes: {
                  appointmentId: "appointment-1",
                  newStaffId: "staff-2",
                },
              });
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [{ id: "appointment-1" }],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.applyResolution(staffChangeResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle room changes", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var roomChangeResolution, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              roomChangeResolution = __assign(__assign({}, mockResolution), {
                strategy: types_1.ResolutionStrategy.CHANGE_ROOM,
                changes: {
                  appointmentId: "appointment-1",
                  newRoomId: "room-2",
                },
              });
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [{ id: "appointment-1" }],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.applyResolution(roomChangeResolution)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("rollbackResolution", () => {
    it("should rollback resolution successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var rollbackId, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              rollbackId = "rollback-1";
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [
                        {
                          id: rollbackId,
                          original_data: {
                            appointment_id: "appointment-1",
                            start_time: "2024-01-15T10:00:00Z",
                            end_time: "2024-01-15T11:00:00Z",
                          },
                        },
                      ],
                      error: null,
                    }),
                  ),
                })),
                update: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [{ id: "appointment-1" }],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.rollbackResolution(rollbackId)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle rollback not found", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var rollbackId, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              rollbackId = "nonexistent-rollback";
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.rollbackResolution(rollbackId)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.error).toContain("not found");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle expired rollback", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var rollbackId, expiredDate, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              rollbackId = "expired-rollback";
              expiredDate = new Date();
              expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: [
                        {
                          id: rollbackId,
                          created_at: expiredDate.toISOString(),
                          original_data: {},
                        },
                      ],
                      error: null,
                    }),
                  ),
                })),
              });
              return [4 /*yield*/, engine.rollbackResolution(rollbackId)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.error).toContain("expired");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Configuration Updates", () => {
    it("should update configuration", () => {
      var newConfig = __assign(__assign({}, mockConfig), { autoApplyThreshold: 0.95 });
      engine.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });
    it("should validate new configuration", () => {
      var invalidConfig = __assign(__assign({}, mockConfig), { maxResolutionOptions: -5 });
      expect(() => engine.updateConfig(invalidConfig)).toThrow();
    });
  });
  describe("Performance and Optimization", () => {
    it("should handle multiple resolutions efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var conflicts, mockAppointment, startTime, resolutionPromises, results, endTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              conflicts = Array.from({ length: 10 }, (_, i) =>
                __assign(__assign({}, mockConflict), {
                  id: "conflict-".concat(i),
                  appointmentId: "appointment-".concat(i),
                }),
              );
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              startTime = Date.now();
              resolutionPromises = conflicts.map((conflict) =>
                engine.generateResolutions(conflict, mockAppointment),
              );
              return [4 /*yield*/, Promise.all(resolutionPromises)];
            case 1:
              results = _a.sent();
              endTime = Date.now();
              expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
              expect(results).toHaveLength(10);
              results.forEach((resolutions) => {
                expect(Array.isArray(resolutions)).toBe(true);
              });
              return [2 /*return*/];
          }
        });
      }));
    it("should cache resolution strategies", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointment, startTime, endTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() =>
                          Promise.resolve({
                            data: [],
                            error: null,
                          }),
                        ),
                      })),
                    })),
                  })),
                })),
              });
              // First call
              return [4 /*yield*/, engine.generateResolutions(mockConflict, mockAppointment)];
            case 1:
              // First call
              _a.sent();
              startTime = Date.now();
              return [4 /*yield*/, engine.generateResolutions(mockConflict, mockAppointment)];
            case 2:
              _a.sent();
              endTime = Date.now();
              expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling", () => {
    it("should handle invalid conflict data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidConflict, mockAppointment;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidConflict = __assign(__assign({}, mockConflict), { type: "INVALID_TYPE" });
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              return [
                4 /*yield*/,
                expect(
                  engine.generateResolutions(invalidConflict, mockAppointment),
                ).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle network failures gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointment;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointment = {
                id: "appointment-1",
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-1",
                room_id: "room-1",
                client_id: "client-1",
                service_id: "service-1",
                status: "scheduled",
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                      lte: jest.fn(() => ({
                        neq: jest.fn(() => Promise.reject(new Error("Network error"))),
                      })),
                    })),
                  })),
                })),
              });
              return [
                4 /*yield*/,
                expect(engine.generateResolutions(mockConflict, mockAppointment)).rejects.toThrow(
                  "Network error",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
});
