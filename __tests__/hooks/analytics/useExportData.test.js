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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var useExportData_1 = require("@/hooks/analytics/useExportData");
var mockData_1 = require("@/../../__tests__/utils/mockData");
// Mock fetch for API calls
global.fetch = jest.fn();
var createWrapper = () => {
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (_a) => {
    var children = _a.children;
    return react_1.default.createElement(
      react_query_1.QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
};
describe("useExportData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should export data to PDF successfully", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var mockFetch, result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockFetch = fetch;
            mockFetch.mockResolvedValueOnce({
              ok: true,
              blob: () => Promise.resolve(new Blob(["PDF content"], { type: "application/pdf" })),
            });
            result = (0, react_2.renderHook)(() => (0, useExportData_1.useExportData)(), {
              wrapper: createWrapper(),
            }).result;
            return [
              4 /*yield*/,
              (0, react_2.act)(() =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, result.current.exportToPDF(mockData_1.mockExportData)];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
            ];
          case 1:
            _a.sent();
            expect(mockFetch).toHaveBeenCalledWith("/api/analytics/export", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                format: "pdf",
                data: mockData_1.mockExportData,
              }),
            });
            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportError).toBeNull();
            return [2 /*return*/];
        }
      });
    }));
  it("should export data to Excel successfully", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var mockFetch, result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockFetch = fetch;
            mockFetch.mockResolvedValueOnce({
              ok: true,
              blob: () =>
                Promise.resolve(
                  new Blob(["Excel content"], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  }),
                ),
            });
            result = (0, react_2.renderHook)(() => (0, useExportData_1.useExportData)(), {
              wrapper: createWrapper(),
            }).result;
            return [
              4 /*yield*/,
              (0, react_2.act)(() =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          result.current.exportToExcel(mockData_1.mockExportData),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
            ];
          case 1:
            _a.sent();
            expect(mockFetch).toHaveBeenCalledWith("/api/analytics/export", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                format: "excel",
                data: mockData_1.mockExportData,
              }),
            });
            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportError).toBeNull();
            return [2 /*return*/];
        }
      });
    }));
  it("should handle export errors gracefully", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var mockFetch, result;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            mockFetch = fetch;
            mockFetch.mockRejectedValueOnce(new Error("Export failed"));
            result = (0, react_2.renderHook)(() => (0, useExportData_1.useExportData)(), {
              wrapper: createWrapper(),
            }).result;
            return [
              4 /*yield*/,
              (0, react_2.act)(() =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, result.current.exportToPDF(mockData_1.mockExportData)];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
            ];
          case 1:
            _b.sent();
            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportError).toBeTruthy();
            expect(
              (_a = result.current.exportError) === null || _a === void 0 ? void 0 : _a.message,
            ).toBe("Export failed");
            return [2 /*return*/];
        }
      });
    }));
  it("should show loading state during export", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var mockFetch, resolvePromise, promise, result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockFetch = fetch;
            promise = new Promise((resolve) => {
              resolvePromise = resolve;
            });
            mockFetch.mockReturnValueOnce(promise);
            result = (0, react_2.renderHook)(() => (0, useExportData_1.useExportData)(), {
              wrapper: createWrapper(),
            }).result;
            // Start export
            (0, react_2.act)(() => {
              result.current.exportToPDF(mockData_1.mockExportData);
            });
            // Should be loading
            expect(result.current.isExporting).toBe(true);
            expect(result.current.exportError).toBeNull();
            // Resolve the promise
            (0, react_2.act)(() => {
              resolvePromise({
                ok: true,
                blob: () => Promise.resolve(new Blob(["PDF content"], { type: "application/pdf" })),
              });
            });
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                expect(result.current.isExporting).toBe(false);
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should handle multiple simultaneous exports", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var mockFetch, result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockFetch = fetch;
            mockFetch.mockResolvedValue({
              ok: true,
              blob: () => Promise.resolve(new Blob(["content"], { type: "application/pdf" })),
            });
            result = (0, react_2.renderHook)(() => (0, useExportData_1.useExportData)(), {
              wrapper: createWrapper(),
            }).result;
            // Start multiple exports
            return [
              4 /*yield*/,
              (0, react_2.act)(() =>
                __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        return [
                          4 /*yield*/,
                          Promise.all([
                            result.current.exportToPDF(mockData_1.mockExportData),
                            result.current.exportToExcel(mockData_1.mockExportData),
                            result.current.exportToCSV(mockData_1.mockExportData),
                          ]),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
              // Should handle all exports successfully
            ];
          case 1:
            // Start multiple exports
            _a.sent();
            // Should handle all exports successfully
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(result.current.isExporting).toBe(false);
            expect(result.current.exportError).toBeNull();
            return [2 /*return*/];
        }
      });
    }));
});
