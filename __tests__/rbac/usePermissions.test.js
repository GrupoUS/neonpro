/**
 * Unit Tests for usePermissions React Hook
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Test suite for React hook that manages permissions in frontend components
 */
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
var globals_1 = require("@jest/globals");
var react_1 = require("@testing-library/react");
var usePermissions_1 = require("@/hooks/usePermissions");
// Mock the auth context
var mockUser = {
  id: "user-1",
  email: "test@example.com",
  role: "manager",
  clinicId: "clinic-1",
  iat: Date.now(),
  exp: Date.now() + 3600000,
};
// Mock the useAuth hook
globals_1.jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  }),
}));
// Mock fetch for API calls
global.fetch = globals_1.jest.fn();
var mockFetch = global.fetch;
/**
 * Mock successful API response
 */
function mockSuccessfulPermissionCheck(granted, reason) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [
          2 /*return*/,
          {
            granted: granted,
            reason: reason || (granted ? "Permission granted" : "Permission denied"),
            roleUsed: mockUser.role,
          },
        ]);
      }),
  });
}
/**
 * Mock failed API response
 */
function mockFailedPermissionCheck() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => [2 /*return*/, { error: "Internal server error" }]);
      }),
  });
}
(0, globals_1.describe)("usePermissions Hook", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
    // Clear localStorage cache
    localStorage.clear();
  });
  (0, globals_1.afterEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Basic permission checking", () => {
    (0, globals_1.it)("should check if user has a specific permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          hasPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasPermission).toBe(true);
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  permission: "patients.read",
                  resourceId: undefined,
                  context: undefined,
                }),
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return false when user lacks permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(false);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("billing.manage")];
                        case 1:
                          hasPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasPermission).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle API errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockFailedPermissionCheck();
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          hasPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasPermission).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check permission with resource ID", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasPermission("patients.read", "patient-123"),
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
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  permission: "patients.read",
                  resourceId: "patient-123",
                  context: undefined,
                }),
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check permission with context", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, context;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              context = { clinicId: "clinic-2" };
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasPermission("patients.read", undefined, context),
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
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith("/api/auth/permissions/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  permission: "patients.read",
                  resourceId: undefined,
                  context: context,
                }),
              });
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Multiple permission checking", () => {
    (0, globals_1.it)("should check if user has any of multiple permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasAnyPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock multiple API calls
              mockSuccessfulPermissionCheck(false); // First permission denied
              mockSuccessfulPermissionCheck(true); // Second permission granted
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasAnyPermission(["billing.manage", "patients.read"]),
                          ];
                        case 1:
                          hasAnyPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasAnyPermission).toBe(true);
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledTimes(2);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return false when user has none of the permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasAnyPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(false);
              mockSuccessfulPermissionCheck(false);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasAnyPermission(["billing.manage", "users.manage"]),
                          ];
                        case 1:
                          hasAnyPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasAnyPermission).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check if user has all required permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasAllPermissions;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasAllPermissions([
                              "patients.read",
                              "appointments.read",
                            ]),
                          ];
                        case 1:
                          hasAllPermissions = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasAllPermissions).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return false when user is missing any required permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasAllPermissions;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true); // First permission granted
              mockSuccessfulPermissionCheck(false); // Second permission denied
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [
                            4 /*yield*/,
                            result.current.hasAllPermissions(["patients.read", "billing.manage"]),
                          ];
                        case 1:
                          hasAllPermissions = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasAllPermissions).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Role checking", () => {
    (0, globals_1.it)("should check if user has specific role", () => {
      var result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
      var hasRole = result.current.hasRole("manager");
      (0, globals_1.expect)(hasRole).toBe(true);
    });
    (0, globals_1.it)("should return false for different role", () => {
      var result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
      var hasRole = result.current.hasRole("owner");
      (0, globals_1.expect)(hasRole).toBe(false);
    });
    (0, globals_1.it)("should check if user has minimum role level", () => {
      var result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
      var hasMinimumRole = result.current.hasMinimumRole("staff");
      (0, globals_1.expect)(hasMinimumRole).toBe(true); // manager >= staff
    });
    (0, globals_1.it)("should return false when user role is below minimum", () => {
      var result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
      var hasMinimumRole = result.current.hasMinimumRole("owner");
      (0, globals_1.expect)(hasMinimumRole).toBe(false); // manager < owner
    });
  });
  (0, globals_1.describe)("Feature access checking", () => {
    (0, globals_1.it)("should check if user can access a feature", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, canAccess;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.canAccess("patient-management")];
                        case 1:
                          canAccess = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(canAccess).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check if user can manage a resource", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, canManage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.canManage("patients", "patient-123")];
                        case 1:
                          canManage = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(canManage).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check if user can view a resource", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, canView;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.canView("billing")];
                        case 1:
                          canView = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(canView).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Caching", () => {
    (0, globals_1.it)("should cache permission results", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              // First call
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              // First call
              _a.sent();
              // Second call (should use cache)
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              // Second call (should use cache)
              _a.sent();
              // Should only make one API call due to caching
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should clear cache when requested", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              // First call
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              // First call
              _a.sent();
              // Clear cache
              (0, react_1.act)(() => {
                result.current.clearCache();
              });
              // Second call (should make new API call)
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              // Second call (should make new API call)
              _a.sent();
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledTimes(2);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should use localStorage for persistent caching", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, cacheKey, cachedResult, parsed;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
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
              cacheKey = "perm_cache_".concat(mockUser.id, "_patients.read_undefined_undefined");
              cachedResult = localStorage.getItem(cacheKey);
              (0, globals_1.expect)(cachedResult).toBeTruthy();
              if (cachedResult) {
                parsed = JSON.parse(cachedResult);
                (0, globals_1.expect)(parsed.granted).toBe(true);
              }
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should respect cache expiration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var cacheKey, expiredCache, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              cacheKey = "perm_cache_".concat(mockUser.id, "_patients.read_undefined_undefined");
              expiredCache = {
                granted: true,
                timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (expired)
                roleUsed: "manager",
              };
              localStorage.setItem(cacheKey, JSON.stringify(expiredCache));
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
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
              // Should make API call despite cache due to expiration
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Loading states", () => {
    (0, globals_1.it)("should track loading state during permission checks", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Mock a delayed response
              mockFetch.mockImplementationOnce(
                () =>
                  new Promise((resolve) =>
                    setTimeout(
                      () =>
                        resolve({
                          ok: true,
                          json: () =>
                            __awaiter(void 0, void 0, void 0, function () {
                              return __generator(this, (_a) => [
                                2 /*return*/,
                                { granted: true, roleUsed: "manager" },
                              ]);
                            }),
                        }),
                      100,
                    ),
                  ),
              );
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              (0, globals_1.expect)(result.current.isLoading).toBe(false);
              (0, react_1.act)(() => {
                result.current.hasPermission("patients.read");
              });
              // Should be loading immediately after call
              (0, globals_1.expect)(result.current.isLoading).toBe(true);
              // Wait for completion
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.isLoading).toBe(false);
                }),
              ];
            case 1:
              // Wait for completion
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Error handling", () => {
    (0, globals_1.it)("should handle network errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockFetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
                        case 1:
                          hasPermission = _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(hasPermission).toBe(false);
              (0, globals_1.expect)(result.current.error).toBeTruthy();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should clear errors on successful requests", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // First request fails
              mockFetch.mockRejectedValueOnce(new Error("Network error"));
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
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
              (0, globals_1.expect)(result.current.error).toBeTruthy();
              // Second request succeeds
              mockSuccessfulPermissionCheck(true);
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("appointments.read")];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              _a.sent();
              (0, globals_1.expect)(result.current.error).toBeNull();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Edge cases", () => {
    (0, globals_1.it)("should handle empty permission arrays", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasAny, hasAll;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [4 /*yield*/, result.current.hasAnyPermission([])];
            case 1:
              hasAny = _a.sent();
              return [4 /*yield*/, result.current.hasAllPermissions([])];
            case 2:
              hasAll = _a.sent();
              (0, globals_1.expect)(hasAny).toBe(false);
              (0, globals_1.expect)(hasAll).toBe(true); // Vacuous truth
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle undefined user gracefully", () => {
      // Mock useAuth to return no user
      globals_1.jest.doMock("@/hooks/useAuth", () => ({
        useAuth: () => ({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }),
      }));
      var result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
      (0, globals_1.expect)(result.current.hasRole("manager")).toBe(false);
      (0, globals_1.expect)(result.current.hasMinimumRole("staff")).toBe(false);
    });
    (0, globals_1.it)("should handle malformed cache data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var cacheKey, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              cacheKey = "perm_cache_".concat(mockUser.id, "_patients.read_undefined_undefined");
              localStorage.setItem(cacheKey, "invalid-json");
              mockSuccessfulPermissionCheck(true);
              result = (0, react_1.renderHook)(() => (0, usePermissions_1.usePermissions)()).result;
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.hasPermission("patients.read")];
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
              // Should make API call despite cache due to malformed data
              (0, globals_1.expect)(mockFetch).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
