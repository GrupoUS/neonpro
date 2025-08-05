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
var resource_optimizer_1 = require("../resource-optimizer");
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
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
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
describe("ResourceOptimizer", () => {
  var optimizer;
  var mockConfig;
  beforeEach(() => {
    mockConfig = {
      enabledOptimizations: [
        types_1.OptimizationType.STAFF_BALANCING,
        types_1.OptimizationType.ROOM_UTILIZATION,
        types_1.OptimizationType.EQUIPMENT_ALLOCATION,
        types_1.OptimizationType.SCHEDULE_COMPACTION,
      ],
      workloadThresholds: {
        underutilized: 0.3,
        optimal: 0.7,
        overloaded: 0.9,
      },
      utilizationTargets: {
        staff: 0.75,
        rooms: 0.8,
        equipment: 0.7,
      },
      optimizationInterval: 3600000, // 1 hour
      autoApplyOptimizations: false,
      maxRecommendations: 10,
      considerClientPreferences: true,
      respectStaffAvailability: true,
    };
    optimizer = new resource_optimizer_1.ResourceOptimizer(mockConfig);
    jest.clearAllMocks();
  });
  describe("Initialization", () => {
    it("should initialize with default config", () => {
      var defaultOptimizer = new resource_optimizer_1.ResourceOptimizer();
      expect(defaultOptimizer).toBeInstanceOf(resource_optimizer_1.ResourceOptimizer);
    });
    it("should initialize with custom config", () => {
      expect(optimizer).toBeInstanceOf(resource_optimizer_1.ResourceOptimizer);
    });
    it("should validate config on initialization", () => {
      var invalidConfig = __assign(__assign({}, mockConfig), {
        workloadThresholds: {
          underutilized: 0.8,
          optimal: 0.7,
          overloaded: 0.6,
        },
      });
      expect(() => new resource_optimizer_1.ResourceOptimizer(invalidConfig)).toThrow();
    });
  });
  describe("optimizeResources", () => {
    var mockDateRange = {
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-15T23:59:59Z"),
    };
    it("should optimize resources for given date range", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointments, mockStaff, mockRooms, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointments = [
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
                  start_time: "2024-01-15T14:00:00Z",
                  end_time: "2024-01-15T15:00:00Z",
                  staff_id: "staff-2",
                  room_id: "room-2",
                  client_id: "client-2",
                  service_id: "service-2",
                  status: "scheduled",
                },
              ];
              mockStaff = [
                {
                  id: "staff-1",
                  name: "John Doe",
                  role: "therapist",
                  availability: "09:00-17:00",
                  skills: ["massage", "therapy"],
                },
                {
                  id: "staff-2",
                  name: "Jane Smith",
                  role: "therapist",
                  availability: "10:00-18:00",
                  skills: ["facial", "therapy"],
                },
              ];
              mockRooms = [
                {
                  id: "room-1",
                  name: "Room A",
                  capacity: 1,
                  equipment: ["massage-table"],
                  availability: "09:00-17:00",
                },
                {
                  id: "room-2",
                  name: "Room B",
                  capacity: 1,
                  equipment: ["facial-bed"],
                  availability: "09:00-17:00",
                },
              ];
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: jest.fn(() => ({
                      gte: jest.fn(() => ({
                        lte: jest.fn(() => ({
                          eq: jest.fn(() =>
                            Promise.resolve({
                              data: mockAppointments,
                              error: null,
                            }),
                          ),
                        })),
                      })),
                    })),
                  };
                }
                if (table === "staff") {
                  return {
                    select: jest.fn(() =>
                      Promise.resolve({
                        data: mockStaff,
                        error: null,
                      }),
                    ),
                  };
                }
                if (table === "rooms") {
                  return {
                    select: jest.fn(() =>
                      Promise.resolve({
                        data: mockRooms,
                        error: null,
                      }),
                    ),
                  };
                }
                return {
                  select: jest.fn(() => Promise.resolve({ data: [], error: null })),
                };
              });
              return [4 /*yield*/, optimizer.optimizeResources(mockDateRange)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.recommendations).toBeDefined();
              expect(Array.isArray(result.recommendations)).toBe(true);
              expect(result.metrics).toBeDefined();
              expect(result.workloadDistribution).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle empty date range", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var emptyDateRange;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              emptyDateRange = {
                startDate: new Date("2024-01-15T00:00:00Z"),
                endDate: new Date("2024-01-14T23:59:59Z"), // End before start
              };
              return [
                4 /*yield*/,
                expect(optimizer.optimizeResources(emptyDateRange)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should respect staff availability constraints", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockAppointments, mockStaff, result, availabilityRecommendations;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockAppointments = [
                {
                  id: "appointment-1",
                  start_time: "2024-01-15T08:00:00Z", // Before staff availability
                  end_time: "2024-01-15T09:00:00Z",
                  staff_id: "staff-1",
                  room_id: "room-1",
                  client_id: "client-1",
                  service_id: "service-1",
                  status: "scheduled",
                },
              ];
              mockStaff = [
                {
                  id: "staff-1",
                  name: "John Doe",
                  role: "therapist",
                  availability: "09:00-17:00",
                  skills: ["massage"],
                },
              ];
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: jest.fn(() => ({
                      gte: jest.fn(() => ({
                        lte: jest.fn(() => ({
                          eq: jest.fn(() =>
                            Promise.resolve({
                              data: mockAppointments,
                              error: null,
                            }),
                          ),
                        })),
                      })),
                    })),
                  };
                }
                if (table === "staff") {
                  return {
                    select: jest.fn(() =>
                      Promise.resolve({
                        data: mockStaff,
                        error: null,
                      }),
                    ),
                  };
                }
                return {
                  select: jest.fn(() => Promise.resolve({ data: [], error: null })),
                };
              });
              return [4 /*yield*/, optimizer.optimizeResources(mockDateRange)];
            case 1:
              result = _a.sent();
              // Should generate recommendations to fix availability conflicts
              expect(result.recommendations.length).toBeGreaterThan(0);
              availabilityRecommendations = result.recommendations.filter((rec) =>
                rec.description.includes("availability"),
              );
              expect(availabilityRecommendations.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("balanceWorkload", () => {
    it("should balance workload across staff members", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockStaffWorkload, mockAppointments, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockStaffWorkload = [
                {
                  staffId: "staff-1",
                  totalHours: 40,
                  appointmentCount: 8,
                  utilizationRate: 0.9,
                  efficiency: 0.85,
                },
                {
                  staffId: "staff-2",
                  totalHours: 20,
                  appointmentCount: 4,
                  utilizationRate: 0.5,
                  efficiency: 0.9,
                },
              ];
              mockAppointments = [
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
              ];
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: jest.fn(() => ({
                      gte: jest.fn(() => ({
                        lte: jest.fn(() => ({
                          eq: jest.fn(() =>
                            Promise.resolve({
                              data: mockAppointments,
                              error: null,
                            }),
                          ),
                        })),
                      })),
                    })),
                  };
                }
                return {
                  select: jest.fn(() => Promise.resolve({ data: [], error: null })),
                };
              });
              return [4 /*yield*/, optimizer.balanceWorkload(mockStaffWorkload)];
            case 1:
              result = _a.sent();
              expect(result).toBeDefined();
              expect(result.recommendations).toBeDefined();
              expect(Array.isArray(result.recommendations)).toBe(true);
              expect(result.balancingActions).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("should identify overloaded staff", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var overloadedWorkload, result, overloadRecommendations;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              overloadedWorkload = [
                {
                  staffId: "staff-1",
                  totalHours: 50,
                  appointmentCount: 12,
                  utilizationRate: 0.95,
                  efficiency: 0.7,
                },
              ];
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() => ({
                      eq: jest.fn(() =>
                        Promise.resolve({
                          data: [],
                          error: null,
                        }),
                      ),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, optimizer.balanceWorkload(overloadedWorkload)];
            case 1:
              result = _a.sent();
              overloadRecommendations = result.recommendations.filter(
                (rec) =>
                  rec.description.includes("overloaded") || rec.description.includes("reduce"),
              );
              expect(overloadRecommendations.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
    it("should identify underutilized staff", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var underutilizedWorkload, result, underutilizedRecommendations;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              underutilizedWorkload = [
                {
                  staffId: "staff-1",
                  totalHours: 15,
                  appointmentCount: 3,
                  utilizationRate: 0.25,
                  efficiency: 0.9,
                },
              ];
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() => ({
                      eq: jest.fn(() =>
                        Promise.resolve({
                          data: [],
                          error: null,
                        }),
                      ),
                    })),
                  })),
                })),
              });
              return [4 /*yield*/, optimizer.balanceWorkload(underutilizedWorkload)];
            case 1:
              result = _a.sent();
              underutilizedRecommendations = result.recommendations.filter(
                (rec) =>
                  rec.description.includes("underutilized") || rec.description.includes("increase"),
              );
              expect(underutilizedRecommendations.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("applyOptimizations", () => {
    var mockRecommendations;
    beforeEach(() => {
      mockRecommendations = [
        {
          id: "rec-1",
          type: types_1.OptimizationType.STAFF_BALANCING,
          priority: "high",
          description: "Reassign appointment to balance workload",
          impact: {
            efficiency: 0.15,
            utilization: 0.1,
            cost: -50,
          },
          actions: [
            {
              type: "reassign_appointment",
              appointmentId: "appointment-1",
              fromStaffId: "staff-1",
              toStaffId: "staff-2",
            },
          ],
          estimatedDuration: 10,
          confidence: 0.9,
        },
        {
          id: "rec-2",
          type: types_1.OptimizationType.ROOM_UTILIZATION,
          priority: "medium",
          description: "Optimize room allocation",
          impact: {
            efficiency: 0.08,
            utilization: 0.12,
            cost: -25,
          },
          actions: [
            {
              type: "change_room",
              appointmentId: "appointment-2",
              fromRoomId: "room-1",
              toRoomId: "room-2",
            },
          ],
          estimatedDuration: 5,
          confidence: 0.85,
        },
      ];
    });
    it("should apply optimization recommendations", () =>
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
              return [4 /*yield*/, optimizer.applyOptimizations(mockRecommendations)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(true);
              expect(result.appliedOptimizations).toBeDefined();
              expect(result.appliedOptimizations.length).toBe(2);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle partial application failures", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var callCount, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              callCount = 0;
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() => {
                    callCount++;
                    if (callCount === 1) {
                      return Promise.resolve({
                        data: [{ id: "appointment-1" }],
                        error: null,
                      });
                    } else {
                      return Promise.resolve({
                        data: null,
                        error: { message: "Update failed" },
                      });
                    }
                  }),
                })),
              });
              return [4 /*yield*/, optimizer.applyOptimizations(mockRecommendations)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.appliedOptimizations.length).toBe(1);
              expect(result.failedOptimizations.length).toBe(1);
              return [2 /*return*/];
          }
        });
      }));
    it("should validate recommendations before applying", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidRecommendations, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidRecommendations = [
                __assign(__assign({}, mockRecommendations[0]), {
                  actions: [
                    {
                      type: "invalid_action",
                      appointmentId: "appointment-1",
                    },
                  ],
                }),
              ];
              return [4 /*yield*/, optimizer.applyOptimizations(invalidRecommendations)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.failedOptimizations.length).toBe(1);
              return [2 /*return*/];
          }
        });
      }));
    it("should handle database transaction failures", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                update: jest.fn(() => ({
                  eq: jest.fn(() => Promise.reject(new Error("Transaction failed"))),
                })),
              });
              return [4 /*yield*/, optimizer.applyOptimizations(mockRecommendations)];
            case 1:
              result = _a.sent();
              expect(result.success).toBe(false);
              expect(result.failedOptimizations.length).toBe(2);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("calculateResourceMetrics", () => {
    var mockDateRange = {
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-15T23:59:59Z"),
    };
    it("should calculate comprehensive resource metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockData, metrics;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockData = {
                appointments: [
                  {
                    id: "appointment-1",
                    start_time: "2024-01-15T10:00:00Z",
                    end_time: "2024-01-15T11:00:00Z",
                    staff_id: "staff-1",
                    room_id: "room-1",
                  },
                ],
                staff: [
                  {
                    id: "staff-1",
                    name: "John Doe",
                    availability: "09:00-17:00",
                  },
                ],
                rooms: [
                  {
                    id: "room-1",
                    name: "Room A",
                    capacity: 1,
                  },
                ],
              };
              mockSupabase.from.mockImplementation((table) => ({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() =>
                      Promise.resolve({
                        data: mockData[table] || [],
                        error: null,
                      }),
                    ),
                  })),
                })),
              }));
              return [4 /*yield*/, optimizer.calculateResourceMetrics(mockDateRange)];
            case 1:
              metrics = _a.sent();
              expect(metrics).toBeDefined();
              expect(metrics.staffUtilization).toBeDefined();
              expect(metrics.roomUtilization).toBeDefined();
              expect(metrics.equipmentUtilization).toBeDefined();
              expect(metrics.overallEfficiency).toBeDefined();
              expect(typeof metrics.overallEfficiency).toBe("number");
              return [2 /*return*/];
          }
        });
      }));
    it("should handle empty data gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var metrics;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() =>
                      Promise.resolve({
                        data: [],
                        error: null,
                      }),
                    ),
                  })),
                })),
              });
              return [4 /*yield*/, optimizer.calculateResourceMetrics(mockDateRange)];
            case 1:
              metrics = _a.sent();
              expect(metrics).toBeDefined();
              expect(metrics.overallEfficiency).toBe(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("generateRecommendations", () => {
    it("should generate staff balancing recommendations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockMetrics, mockWorkload, recommendations, staffRecommendations;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockMetrics = {
                staffUtilization: {
                  "staff-1": 0.95, // Overloaded
                  "staff-2": 0.3, // Underutilized
                },
                roomUtilization: {
                  "room-1": 0.8,
                },
                equipmentUtilization: {
                  "equipment-1": 0.7,
                },
                overallEfficiency: 0.75,
                bottlenecks: ["staff-1"],
                underutilizedResources: ["staff-2"],
              };
              mockWorkload = {
                staff: {
                  "staff-1": {
                    totalHours: 45,
                    appointmentCount: 10,
                    utilizationRate: 0.95,
                    efficiency: 0.7,
                  },
                  "staff-2": {
                    totalHours: 15,
                    appointmentCount: 3,
                    utilizationRate: 0.3,
                    efficiency: 0.9,
                  },
                },
                rooms: {},
                equipment: {},
                timeSlots: {},
              };
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
              return [4 /*yield*/, optimizer.generateRecommendations(mockMetrics, mockWorkload)];
            case 1:
              recommendations = _a.sent();
              expect(recommendations).toBeDefined();
              expect(Array.isArray(recommendations)).toBe(true);
              expect(recommendations.length).toBeGreaterThan(0);
              staffRecommendations = recommendations.filter(
                (rec) => rec.type === types_1.OptimizationType.STAFF_BALANCING,
              );
              expect(staffRecommendations.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
    it("should prioritize recommendations correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockMetrics, mockWorkload, recommendations, highPriorityRecs, staffRecs;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockMetrics = {
                staffUtilization: {
                  "staff-1": 0.98, // Critically overloaded
                },
                roomUtilization: {
                  "room-1": 0.85, // Slightly over target
                },
                equipmentUtilization: {},
                overallEfficiency: 0.6,
                bottlenecks: ["staff-1"],
                underutilizedResources: [],
              };
              mockWorkload = {
                staff: {
                  "staff-1": {
                    totalHours: 50,
                    appointmentCount: 12,
                    utilizationRate: 0.98,
                    efficiency: 0.6,
                  },
                },
                rooms: {},
                equipment: {},
                timeSlots: {},
              };
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
              return [4 /*yield*/, optimizer.generateRecommendations(mockMetrics, mockWorkload)];
            case 1:
              recommendations = _a.sent();
              highPriorityRecs = recommendations.filter((rec) => rec.priority === "high");
              staffRecs = highPriorityRecs.filter(
                (rec) => rec.type === types_1.OptimizationType.STAFF_BALANCING,
              );
              expect(staffRecs.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Configuration and Updates", () => {
    it("should update configuration", () => {
      var newConfig = __assign(__assign({}, mockConfig), { autoApplyOptimizations: true });
      optimizer.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });
    it("should validate new configuration", () => {
      var invalidConfig = __assign(__assign({}, mockConfig), {
        workloadThresholds: {
          underutilized: 0.9,
          optimal: 0.7,
          overloaded: 0.5,
        },
      });
      expect(() => optimizer.updateConfig(invalidConfig)).toThrow();
    });
  });
  describe("Performance and Scalability", () => {
    it("should handle large datasets efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var largeDataRange, largeAppointmentSet, startTime, result, endTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              largeDataRange = {
                startDate: new Date("2024-01-01T00:00:00Z"),
                endDate: new Date("2024-01-31T23:59:59Z"),
              };
              largeAppointmentSet = Array.from({ length: 1000 }, (_, i) => ({
                id: "appointment-".concat(i),
                start_time: "2024-01-15T10:00:00Z",
                end_time: "2024-01-15T11:00:00Z",
                staff_id: "staff-".concat(i % 10),
                room_id: "room-".concat(i % 5),
                client_id: "client-".concat(i),
                service_id: "service-".concat(i % 3),
                status: "scheduled",
              }));
              mockSupabase.from.mockImplementation((table) => {
                if (table === "appointments") {
                  return {
                    select: jest.fn(() => ({
                      gte: jest.fn(() => ({
                        lte: jest.fn(() => ({
                          eq: jest.fn(() =>
                            Promise.resolve({
                              data: largeAppointmentSet,
                              error: null,
                            }),
                          ),
                        })),
                      })),
                    })),
                  };
                }
                return {
                  select: jest.fn(() => Promise.resolve({ data: [], error: null })),
                };
              });
              startTime = Date.now();
              return [4 /*yield*/, optimizer.optimizeResources(largeDataRange)];
            case 1:
              result = _a.sent();
              endTime = Date.now();
              expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds
              expect(result).toBeDefined();
              expect(result.recommendations).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("should cache optimization results", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var dateRange, startTime, endTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              dateRange = {
                startDate: new Date("2024-01-15T00:00:00Z"),
                endDate: new Date("2024-01-15T23:59:59Z"),
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() => ({
                      eq: jest.fn(() =>
                        Promise.resolve({
                          data: [],
                          error: null,
                        }),
                      ),
                    })),
                  })),
                })),
              });
              // First call
              return [4 /*yield*/, optimizer.optimizeResources(dateRange)];
            case 1:
              // First call
              _a.sent();
              startTime = Date.now();
              return [4 /*yield*/, optimizer.optimizeResources(dateRange)];
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
    it("should handle database errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var dateRange;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              dateRange = {
                startDate: new Date("2024-01-15T00:00:00Z"),
                endDate: new Date("2024-01-15T23:59:59Z"),
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() => ({
                      eq: jest.fn(() => Promise.reject(new Error("Database connection failed"))),
                    })),
                  })),
                })),
              });
              return [
                4 /*yield*/,
                expect(optimizer.optimizeResources(dateRange)).rejects.toThrow(
                  "Database connection failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle invalid date ranges", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidDateRange;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidDateRange = {
                startDate: new Date("invalid-date"),
                endDate: new Date("2024-01-15T23:59:59Z"),
              };
              return [
                4 /*yield*/,
                expect(optimizer.optimizeResources(invalidDateRange)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle network timeouts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var dateRange;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              dateRange = {
                startDate: new Date("2024-01-15T00:00:00Z"),
                endDate: new Date("2024-01-15T23:59:59Z"),
              };
              mockSupabase.from.mockReturnValue({
                select: jest.fn(() => ({
                  gte: jest.fn(() => ({
                    lte: jest.fn(() => ({
                      eq: jest.fn(
                        () =>
                          new Promise((_, reject) => {
                            setTimeout(() => reject(new Error("Network timeout")), 100);
                          }),
                      ),
                    })),
                  })),
                })),
              });
              return [
                4 /*yield*/,
                expect(optimizer.optimizeResources(dateRange)).rejects.toThrow("Network timeout"),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
});
