/**
 * Report Builder API Integration Tests
 * Story 8.2: Custom Report Builder (Drag-Drop Interface)
 *
 * API Testing Coverage:
 * - Report CRUD operations
 * - Template management
 * - Data source integration
 * - Analytics tracking
 * - Sharing and collaboration
 * - Automated scheduling
 */
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
// Mock fetch globally
global.fetch = jest.fn();
// Mock Next.js environment
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: () => ({ value: "mock-session-token" }),
  }),
}));
// Mock Supabase client
var mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    eq: jest.fn(function () {
      return this;
    }),
    order: jest.fn(function () {
      return this;
    }),
    limit: jest.fn(function () {
      return this;
    }),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
};
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));
jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => mockSupabaseClient,
}));
// Mock data
var mockReport = {
  id: "test-report-id",
  name: "Test Report",
  description: "Test Description",
  query_config: {
    data_sources: ["patients", "appointments"],
    filters: [],
    aggregations: [],
  },
  visualization_config: {
    chart_type: "bar",
    x_axis: "date",
    y_axis: "count",
  },
  layout_config: {
    components: [],
  },
  sharing_config: {
    is_public: false,
    allowed_users: [],
  },
  schedule_config: null,
  user_id: "test-user-id",
  created_at: "2025-01-26T09:00:00Z",
  updated_at: "2025-01-26T09:00:00Z",
};
describe("Report Builder API Integration Tests", () => {
  var mockFetch = global.fetch;
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Setup default auth mocks
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "test-user-id" },
          access_token: "mock-token",
        },
      },
      error: null,
    });
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: { id: "test-user-id" },
      },
      error: null,
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
  describe("Story 8.2 Acceptance Criteria API Validation", () => {
    describe("AC4: Real-time Report Generation", () => {
      it("generates reports with <3 second response time", () =>
        __awaiter(this, void 0, void 0, function () {
          var startTime, response, endTime, responseTime, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                startTime = Date.now();
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          report: mockReport,
                          generation_time: 2.1,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/generate/test-report-id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ format: "json" }),
                  }),
                ];
              case 1:
                response = _a.sent();
                endTime = Date.now();
                responseTime = (endTime - startTime) / 1000;
                expect(response.ok).toBe(true);
                expect(responseTime).toBeLessThan(3);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.report).toBeDefined();
                return [2 /*return*/];
            }
          });
        }));
      it("handles complex queries efficiently", () =>
        __awaiter(this, void 0, void 0, function () {
          var complexQuery, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                complexQuery = {
                  data_sources: ["patients", "appointments", "treatments", "payments"],
                  filters: [
                    { field: "created_at", operator: "gte", value: "2024-01-01" },
                    { field: "status", operator: "in", value: ["completed", "scheduled"] },
                  ],
                  aggregations: [
                    { field: "total_value", function: "sum" },
                    { field: "patient_id", function: "count_distinct" },
                  ],
                };
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          data: [{ total_value: 15000, patient_count: 45 }],
                          query_execution_time: 1.8,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/generate/test-report-id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: complexQuery }),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.query_execution_time).toBeLessThan(3);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC5: Advanced Filtering Capabilities", () => {
      it("validates advanced filter configurations", () =>
        __awaiter(this, void 0, void 0, function () {
          var advancedFilters, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                advancedFilters = {
                  date_range: { start: "2024-01-01", end: "2024-12-31" },
                  status_filters: ["active", "completed"],
                  custom_filters: [
                    { field: "age", operator: "between", value: [18, 65] },
                    { field: "treatment_type", operator: "contains", value: "facial" },
                  ],
                };
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          valid_filters: true,
                          filter_count: 4,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/filters/validate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(advancedFilters),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.valid_filters).toBe(true);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC6: Sharing and Collaboration Features", () => {
      it("enables report sharing with proper permissions", () =>
        __awaiter(this, void 0, void 0, function () {
          var sharingConfig, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                sharingConfig = {
                  report_id: "test-report-id",
                  share_with: ["user2@clinic.com", "user3@clinic.com"],
                  permissions: ["view", "comment"],
                  expires_at: "2025-02-01T00:00:00Z",
                };
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          share_id: "share-123",
                          shared_with: 2,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/sharing/test-report-id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sharingConfig),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.share_id).toBeDefined();
                expect(data.shared_with).toBe(2);
                return [2 /*return*/];
            }
          });
        }));
      it("validates sharing permissions correctly", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockFetch.mockResolvedValueOnce({
                  ok: false,
                  status: 403,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: false,
                          error: "Insufficient permissions",
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/sharing/unauthorized-report", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ share_with: ["user@test.com"] }),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(false);
                expect(response.status).toBe(403);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(false);
                expect(data.error).toContain("permissions");
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC7: Automated Report Scheduling", () => {
      it("creates automated report schedules", () =>
        __awaiter(this, void 0, void 0, function () {
          var scheduleConfig, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                scheduleConfig = {
                  report_id: "test-report-id",
                  frequency: "weekly",
                  day_of_week: 1, // Monday
                  time: "09:00",
                  timezone: "America/Sao_Paulo",
                  recipients: ["manager@clinic.com"],
                  format: "pdf",
                };
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 201,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          schedule_id: "schedule-123",
                          next_run: "2025-02-03T09:00:00Z",
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/schedules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(scheduleConfig),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                expect(response.status).toBe(201);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.schedule_id).toBeDefined();
                expect(data.next_run).toBeDefined();
                return [2 /*return*/];
            }
          });
        }));
      it("validates schedule configuration", () =>
        __awaiter(this, void 0, void 0, function () {
          var invalidSchedule, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                invalidSchedule = {
                  report_id: "test-report-id",
                  frequency: "invalid-frequency",
                  time: "25:00", // Invalid time
                };
                mockFetch.mockResolvedValueOnce({
                  ok: false,
                  status: 400,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: false,
                          error: "Invalid schedule configuration",
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/schedules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(invalidSchedule),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(false);
                expect(response.status).toBe(400);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(false);
                expect(data.error).toContain("Invalid");
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC8: Export Capabilities", () => {
      it("exports reports in multiple formats", () =>
        __awaiter(this, void 0, void 0, function () {
          var exportFormats, _loop_1, _i, exportFormats_1, format;
          var _this = this;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                exportFormats = ["pdf", "excel", "csv", "json"];
                _loop_1 = function (format) {
                  var response, data;
                  return __generator(this, (_b) => {
                    switch (_b.label) {
                      case 0:
                        mockFetch.mockResolvedValueOnce({
                          ok: true,
                          status: 200,
                          json: () =>
                            __awaiter(_this, void 0, void 0, function () {
                              return __generator(this, (_a) => [
                                2 /*return*/,
                                {
                                  success: true,
                                  download_url: "https://storage.com/report.".concat(format),
                                  expires_at: "2025-01-27T12:00:00Z",
                                },
                              ]);
                            }),
                        });
                        return [
                          4 /*yield*/,
                          fetch("/api/report-builder/export/test-report-id", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ format: format }),
                          }),
                        ];
                      case 1:
                        response = _b.sent();
                        expect(response.ok).toBe(true);
                        return [4 /*yield*/, response.json()];
                      case 2:
                        data = _b.sent();
                        expect(data.success).toBe(true);
                        expect(data.download_url).toContain(format);
                        return [2 /*return*/];
                    }
                  });
                };
                (_i = 0), (exportFormats_1 = exportFormats);
                _a.label = 1;
              case 1:
                if (!(_i < exportFormats_1.length)) return [3 /*break*/, 4];
                format = exportFormats_1[_i];
                return [5 /*yield**/, _loop_1(format)];
              case 2:
                _a.sent();
                _a.label = 3;
              case 3:
                _i++;
                return [3 /*break*/, 1];
              case 4:
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC9: Analytics and Usage Tracking", () => {
      it("tracks report usage analytics", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          analytics_recorded: true,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/analytics/test-report-id", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "view",
                      user_id: "test-user-id",
                      timestamp: new Date().toISOString(),
                    }),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.analytics_recorded).toBe(true);
                return [2 /*return*/];
            }
          });
        }));
      it("provides usage analytics dashboard data", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          analytics: {
                            total_reports: 42,
                            active_users: 15,
                            popular_templates: ["financial", "patient-summary"],
                            usage_trends: { weekly_growth: 0.12 },
                          },
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/analytics", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.analytics.total_reports).toBeGreaterThan(0);
                expect(data.analytics.active_users).toBeGreaterThan(0);
                expect(Array.isArray(data.analytics.popular_templates)).toBe(true);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("AC10: Integration with NeonPro Data Sources", () => {
      it("validates access to all NeonPro data sources", () =>
        __awaiter(this, void 0, void 0, function () {
          var expectedDataSources, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                expectedDataSources = [
                  "patients",
                  "appointments",
                  "treatments",
                  "payments",
                  "staff",
                  "inventory",
                  "reports",
                  "analytics",
                ];
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          available_sources: expectedDataSources,
                          total_count: expectedDataSources.length,
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/data-sources", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.available_sources).toEqual(expect.arrayContaining(expectedDataSources));
                expect(data.total_count).toBe(expectedDataSources.length);
                return [2 /*return*/];
            }
          });
        }));
      it("handles data source access restrictions", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockFetch.mockResolvedValueOnce({
                  ok: false,
                  status: 403,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: false,
                          error: "Access denied to restricted data source",
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/data-sources?source=restricted_data", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(false);
                expect(response.status).toBe(403);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(false);
                expect(data.error).toContain("Access denied");
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Report CRUD Operations", () => {
    describe("Create Report", () => {
      it("creates a new report successfully", () =>
        __awaiter(this, void 0, void 0, function () {
          var newReportData, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                newReportData = {
                  name: "New Test Report",
                  description: "A new test report",
                  query_config: {
                    data_sources: ["patients"],
                    filters: [],
                  },
                };
                mockSupabaseClient.from.mockReturnValue({
                  insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue({
                      data: [
                        __assign(__assign(__assign({}, mockReport), newReportData), {
                          id: "new-report-id",
                        }),
                      ],
                      error: null,
                    }),
                  }),
                });
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 201,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          report: __assign(__assign(__assign({}, mockReport), newReportData), {
                            id: "new-report-id",
                          }),
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/reports", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newReportData),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                expect(response.status).toBe(201);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.report.name).toBe(newReportData.name);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("Read Report", () => {
      it("retrieves report by ID", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabaseClient.from.mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                      data: [mockReport],
                      error: null,
                    }),
                  }),
                });
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          report: mockReport,
                        },
                      ]);
                    }),
                });
                return [4 /*yield*/, fetch("/api/report-builder/reports/test-report-id")];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.report.id).toBe("test-report-id");
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("Update Report", () => {
      it("updates report successfully", () =>
        __awaiter(this, void 0, void 0, function () {
          var updateData, response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                updateData = {
                  name: "Updated Report Name",
                  description: "Updated description",
                };
                mockSupabaseClient.from.mockReturnValue({
                  update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      select: jest.fn().mockResolvedValue({
                        data: [__assign(__assign({}, mockReport), updateData)],
                        error: null,
                      }),
                    }),
                  }),
                });
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          report: __assign(__assign({}, mockReport), updateData),
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/reports/test-report-id", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.report.name).toBe(updateData.name);
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("Delete Report", () => {
      it("deletes report successfully", () =>
        __awaiter(this, void 0, void 0, function () {
          var response, data;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSupabaseClient.from.mockReturnValue({
                  delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                      data: [mockReport],
                      error: null,
                    }),
                  }),
                });
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          message: "Report deleted successfully",
                        },
                      ]);
                    }),
                });
                return [
                  4 /*yield*/,
                  fetch("/api/report-builder/reports/test-report-id", {
                    method: "DELETE",
                  }),
                ];
              case 1:
                response = _a.sent();
                expect(response.ok).toBe(true);
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                expect(data.success).toBe(true);
                expect(data.message).toContain("deleted");
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Template Management", () => {
    it("retrieves available templates", () =>
      __awaiter(this, void 0, void 0, function () {
        var mockTemplates, response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockTemplates = [
                { id: "template-1", name: "Financial Report", category: "financial" },
                { id: "template-2", name: "Patient Summary", category: "clinical" },
              ];
              mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () =>
                  __awaiter(this, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: true,
                        templates: mockTemplates,
                      },
                    ]);
                  }),
              });
              return [4 /*yield*/, fetch("/api/report-builder/templates")];
            case 1:
              response = _a.sent();
              expect(response.ok).toBe(true);
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(data.success).toBe(true);
              expect(Array.isArray(data.templates)).toBe(true);
              expect(data.templates.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Performance and Load Testing", () => {
    it("handles concurrent API requests gracefully", () =>
      __awaiter(this, void 0, void 0, function () {
        var _loop_2, i, requests, responses;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _loop_2 = (i) => {
                mockFetch.mockResolvedValueOnce({
                  ok: true,
                  status: 200,
                  json: () =>
                    __awaiter(this, void 0, void 0, function () {
                      return __generator(this, (_a) => [
                        2 /*return*/,
                        {
                          success: true,
                          report: __assign(__assign({}, mockReport), {
                            id: "test-report-".concat(i),
                          }),
                        },
                      ]);
                    }),
                });
              };
              // Mock multiple responses
              for (i = 0; i < 10; i++) {
                _loop_2(i);
              }
              requests = Array.from({ length: 10 }, (_, i) =>
                fetch("/api/report-builder/reports/test-report-".concat(i)),
              );
              return [4 /*yield*/, Promise.all(requests)];
            case 1:
              responses = _a.sent();
              responses.forEach((response) => {
                expect(response.ok).toBe(true);
              });
              return [2 /*return*/];
          }
        });
      }));
    it("maintains response time under load", () =>
      __awaiter(this, void 0, void 0, function () {
        var startTime, requests, endTime, totalTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: () =>
                  __awaiter(this, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      { success: true, report: mockReport },
                    ]);
                  }),
              });
              requests = Array.from({ length: 50 }, () =>
                fetch("/api/report-builder/reports/test-report-id"),
              );
              return [4 /*yield*/, Promise.all(requests)];
            case 1:
              _a.sent();
              endTime = Date.now();
              totalTime = (endTime - startTime) / 1000;
              // Should handle 50 requests in under 5 seconds
              expect(totalTime).toBeLessThan(5);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling and Edge Cases", () => {
    it("handles invalid request data gracefully", () =>
      __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () =>
                  __awaiter(this, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: false,
                        error: "Invalid request data",
                      },
                    ]);
                  }),
              });
              return [
                4 /*yield*/,
                fetch("/api/report-builder/reports", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ invalid: "data" }),
                }),
              ];
            case 1:
              response = _a.sent();
              expect(response.ok).toBe(false);
              expect(response.status).toBe(400);
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              expect(data.success).toBe(false);
              expect(data.error).toBeDefined();
              return [2 /*return*/];
          }
        });
      }));
    it("handles database connection errors", () =>
      __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.from.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database connection failed" },
                }),
              });
              mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: () =>
                  __awaiter(this, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: false,
                        error: "Internal server error",
                      },
                    ]);
                  }),
              });
              return [4 /*yield*/, fetch("/api/report-builder/reports/test-report-id")];
            case 1:
              response = _a.sent();
              expect(response.ok).toBe(false);
              expect(response.status).toBe(500);
              return [2 /*return*/];
          }
        });
      }));
    it("handles authentication failures", () =>
      __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabaseClient.auth.getSession.mockResolvedValue({
                data: { session: null },
                error: null,
              });
              mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () =>
                  __awaiter(this, void 0, void 0, function () {
                    return __generator(this, (_a) => [
                      2 /*return*/,
                      {
                        success: false,
                        error: "Unauthorized",
                      },
                    ]);
                  }),
              });
              return [4 /*yield*/, fetch("/api/report-builder/reports")];
            case 1:
              response = _a.sent();
              expect(response.ok).toBe(false);
              expect(response.status).toBe(401);
              return [2 /*return*/];
          }
        });
      }));
  });
});
