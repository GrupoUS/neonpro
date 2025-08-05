// useRBAC Hook Tests
// Story 1.2: Role-Based Permissions Enhancement
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
var use_rbac_1 = require("@/hooks/use-rbac");
var permissions_1 = require("@/lib/auth/rbac/permissions");
var use_user_1 = require("@/hooks/use-user");
// Mock dependencies
jest.mock("@/lib/auth/rbac/permissions", () => ({
  RBACPermissionManager: jest.fn(() => ({
    getUserRole: jest.fn(),
    getUserPermissions: jest.fn(),
    checkPermission: jest.fn(),
    canManageUser: jest.fn(),
    getRoleHierarchyLevel: jest.fn(),
  })),
}));
jest.mock("@/hooks/use-user", () => ({
  useUser: jest.fn(),
}));
var mockUser = {
  id: "user-123",
  email: "test@example.com",
};
var mockClinicId = "clinic-456";
var mockOwnerRole = {
  id: "role-owner",
  name: "owner",
  display_name: "Proprietário",
  description: "Proprietário da clínica",
  permissions: ["manage_clinic", "manage_users", "view_users"],
  hierarchy: 1,
  is_system_role: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
var mockStaffRole = {
  id: "role-staff",
  name: "staff",
  display_name: "Funcionário",
  description: "Funcionário da clínica",
  permissions: ["view_patients", "create_patients"],
  hierarchy: 3,
  is_system_role: true,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
(0, globals_1.describe)("useRBAC Hook", () => {
  var mockRBACManager;
  (0, globals_1.beforeEach)(() => {
    jest.clearAllMocks();
    mockRBACManager = {
      getUserRole: jest.fn(),
      getUserPermissions: jest.fn(),
      checkPermission: jest.fn(),
      canManageUser: jest.fn(),
      getRoleHierarchyLevel: jest.fn(),
    };
    permissions_1.RBACPermissionManager.mockReturnValue(mockRBACManager);
    use_user_1.useUser.mockReturnValue({ user: mockUser });
  });
  (0, globals_1.afterEach)(() => {
    jest.restoreAllMocks();
  });
  (0, globals_1.describe)("Basic Hook Functionality", () => {
    (0, globals_1.it)("should initialize with loading state", () => {
      mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
      mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
      var result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
      (0, globals_1.expect)(result.current.loading).toBe(true);
      (0, globals_1.expect)(result.current.role).toBeNull();
      (0, globals_1.expect)(result.current.permissions).toEqual([]);
    });
    (0, globals_1.it)("should load user role and permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
              mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(result.current.role).toEqual(mockOwnerRole);
              (0, globals_1.expect)(result.current.permissions).toEqual(mockOwnerRole.permissions);
              (0, globals_1.expect)(mockRBACManager.getUserRole).toHaveBeenCalledWith(
                mockUser.id,
                mockClinicId,
              );
              (0, globals_1.expect)(mockRBACManager.getUserPermissions).toHaveBeenCalledWith(
                mockUser.id,
                mockClinicId,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var consoleErrorSpy, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
              mockRBACManager.getUserRole.mockRejectedValue(new Error("Failed to load role"));
              mockRBACManager.getUserPermissions.mockRejectedValue(
                new Error("Failed to load permissions"),
              );
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(result.current.role).toBeNull();
              (0, globals_1.expect)(result.current.permissions).toEqual([]);
              (0, globals_1.expect)(consoleErrorSpy).toHaveBeenCalledWith(
                "Error loading RBAC data:",
                globals_1.expect.any(Error),
              );
              consoleErrorSpy.mockRestore();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should not load data when user is not available", () => {
      use_user_1.useUser.mockReturnValue({ user: null });
      var result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
      (0, globals_1.expect)(result.current.loading).toBe(false);
      (0, globals_1.expect)(result.current.role).toBeNull();
      (0, globals_1.expect)(result.current.permissions).toEqual([]);
      (0, globals_1.expect)(mockRBACManager.getUserRole).not.toHaveBeenCalled();
    });
    (0, globals_1.it)("should not load data when clinic ID is not provided", () => {
      var result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(undefined)).result;
      (0, globals_1.expect)(result.current.loading).toBe(false);
      (0, globals_1.expect)(result.current.role).toBeNull();
      (0, globals_1.expect)(result.current.permissions).toEqual([]);
      (0, globals_1.expect)(mockRBACManager.getUserRole).not.toHaveBeenCalled();
    });
  });
  (0, globals_1.describe)("Permission Checking", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
          mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should check single permission correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermission;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockRBACManager.checkPermission.mockResolvedValue({
                granted: true,
                reason: "Permission granted",
              });
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              return [4 /*yield*/, result.current.checkPermission("manage_users")];
            case 2:
              hasPermission = _a.sent();
              (0, globals_1.expect)(hasPermission).toBe(true);
              (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith({
                userId: mockUser.id,
                permission: "manage_users",
                clinicId: mockClinicId,
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check multiple permissions correctly", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hasPermissions;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockRBACManager.checkPermission
                .mockResolvedValueOnce({ granted: true, reason: "Permission granted" })
                .mockResolvedValueOnce({ granted: false, reason: "Permission denied" });
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                result.current.checkMultiplePermissions(["manage_users", "delete_users"]),
              ];
            case 2:
              hasPermissions = _a.sent();
              (0, globals_1.expect)(hasPermissions).toEqual({
                manage_users: true,
                delete_users: false,
              });
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check if user can manage another user", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, canManage;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockRBACManager.canManageUser.mockResolvedValue(true);
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              return [4 /*yield*/, result.current.canManageUser("target-user-id")];
            case 2:
              canManage = _a.sent();
              (0, globals_1.expect)(canManage).toBe(true);
              (0, globals_1.expect)(mockRBACManager.canManageUser).toHaveBeenCalledWith(
                mockUser.id,
                "target-user-id",
                mockClinicId,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Role Hierarchy", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
          mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
          mockRBACManager.getRoleHierarchyLevel.mockReturnValue(mockOwnerRole.hierarchy);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should get role hierarchy level", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result, hierarchyLevel;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              hierarchyLevel = result.current.getRoleHierarchyLevel();
              (0, globals_1.expect)(hierarchyLevel).toBe(mockOwnerRole.hierarchy);
              (0, globals_1.expect)(mockRBACManager.getRoleHierarchyLevel).toHaveBeenCalledWith(
                mockOwnerRole.name,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should return null hierarchy level when no role", () => {
      mockRBACManager.getUserRole.mockResolvedValue(null);
      var result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
      var hierarchyLevel = result.current.getRoleHierarchyLevel();
      (0, globals_1.expect)(hierarchyLevel).toBeNull();
    });
  });
  (0, globals_1.describe)("Role Checking", () => {
    (0, globals_1.beforeEach)(() =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          mockRBACManager.getUserRole.mockResolvedValue(mockOwnerRole);
          mockRBACManager.getUserPermissions.mockResolvedValue(mockOwnerRole.permissions);
          return [2 /*return*/];
        });
      }),
    );
    (0, globals_1.it)("should check if user is in specific role", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(result.current.isInRole("owner")).toBe(true);
              (0, globals_1.expect)(result.current.isInRole("staff")).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should check if user is at minimum role level", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(result.current.isAtLeastRole("owner")).toBe(true);
              (0, globals_1.expect)(result.current.isAtLeastRole("manager")).toBe(true); // owner > manager
              (0, globals_1.expect)(result.current.isAtLeastRole("staff")).toBe(true); // owner > staff
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle role checking when no role is loaded", () => {
      mockRBACManager.getUserRole.mockResolvedValue(null);
      var result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
      (0, globals_1.expect)(result.current.isInRole("owner")).toBe(false);
      (0, globals_1.expect)(result.current.isAtLeastRole("staff")).toBe(false);
    });
  });
  (0, globals_1.describe)("Refresh Functionality", () => {
    (0, globals_1.it)("should refresh role and permissions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockRBACManager.getUserRole
                .mockResolvedValueOnce(mockStaffRole)
                .mockResolvedValueOnce(mockOwnerRole);
              mockRBACManager.getUserPermissions
                .mockResolvedValueOnce(mockStaffRole.permissions)
                .mockResolvedValueOnce(mockOwnerRole.permissions);
              result = (0, react_1.renderHook)(() => (0, use_rbac_1.useRBAC)(mockClinicId)).result;
              // Wait for initial load
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(result.current.loading).toBe(false);
                }),
              ];
            case 1:
              // Wait for initial load
              _a.sent();
              (0, globals_1.expect)(result.current.role).toEqual(mockStaffRole);
              // Refresh
              return [
                4 /*yield*/,
                (0, react_1.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, result.current.refresh()];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              // Refresh
              _a.sent();
              (0, globals_1.expect)(result.current.role).toEqual(mockOwnerRole);
              (0, globals_1.expect)(mockRBACManager.getUserRole).toHaveBeenCalledTimes(2);
              (0, globals_1.expect)(mockRBACManager.getUserPermissions).toHaveBeenCalledTimes(2);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
(0, globals_1.describe)("usePermissionCheck Hook", () => {
  var mockRBACManager;
  (0, globals_1.beforeEach)(() => {
    jest.clearAllMocks();
    mockRBACManager = {
      checkPermission: jest.fn(),
    };
    permissions_1.RBACPermissionManager.mockReturnValue(mockRBACManager);
    use_user_1.useUser.mockReturnValue({ user: mockUser });
  });
  (0, globals_1.it)("should check permission and return result", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockRBACManager.checkPermission.mockResolvedValue({
              granted: true,
              reason: "Permission granted",
            });
            result = (0, react_1.renderHook)(() =>
              (0, use_rbac_1.usePermissionCheck)("view_users", mockClinicId),
            ).result;
            (0, globals_1.expect)(result.current.loading).toBe(true);
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(result.current.loading).toBe(false);
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(result.current.hasPermission).toBe(true);
            (0, globals_1.expect)(mockRBACManager.checkPermission).toHaveBeenCalledWith({
              userId: mockUser.id,
              permission: "view_users",
              clinicId: mockClinicId,
            });
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("should handle permission denied", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockRBACManager.checkPermission.mockResolvedValue({
              granted: false,
              reason: "Insufficient permissions",
            });
            result = (0, react_1.renderHook)(() =>
              (0, use_rbac_1.usePermissionCheck)("manage_users", mockClinicId),
            ).result;
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(result.current.loading).toBe(false);
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(result.current.hasPermission).toBe(false);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("should not check when user or clinic ID is missing", () => {
    use_user_1.useUser.mockReturnValue({ user: null });
    var result = (0, react_1.renderHook)(() =>
      (0, use_rbac_1.usePermissionCheck)("view_users", mockClinicId),
    ).result;
    (0, globals_1.expect)(result.current.loading).toBe(false);
    (0, globals_1.expect)(result.current.hasPermission).toBe(false);
    (0, globals_1.expect)(mockRBACManager.checkPermission).not.toHaveBeenCalled();
  });
});
(0, globals_1.describe)("useRoleGuard Hook", () => {
  (0, globals_1.beforeEach)(() => {
    jest.clearAllMocks();
    use_user_1.useUser.mockReturnValue({ user: mockUser });
  });
  (0, globals_1.it)("should render children when user has required role", () => {
    var mockUseRBAC = {
      loading: false,
      role: mockOwnerRole,
      isInRole: jest.fn().mockReturnValue(true),
    };
    jest.doMock("@/hooks/use-rbac", () => ({
      useRBAC: () => mockUseRBAC,
    }));
    var _TestComponent = () => {
      var shouldRender = (0, use_rbac_1.useRoleGuard)("owner", mockClinicId).shouldRender;
      return shouldRender ? <div>Protected Content</div> : null;
    };
    var _container = (0, react_1.renderHook)(() => {
      var shouldRender = (0, use_rbac_1.useRoleGuard)("owner", mockClinicId).shouldRender;
      return { shouldRender: shouldRender };
    }).container;
    // This test would need proper React Testing Library setup for component rendering
    // For now, we'll test the hook logic
    (0, globals_1.expect)(mockUseRBAC.isInRole).toHaveBeenCalledWith("owner");
  });
});
(0, globals_1.describe)("usePermissionGuard Hook", () => {
  var mockRBACManager;
  (0, globals_1.beforeEach)(() => {
    jest.clearAllMocks();
    mockRBACManager = {
      checkPermission: jest.fn(),
    };
    permissions_1.RBACPermissionManager.mockReturnValue(mockRBACManager);
    use_user_1.useUser.mockReturnValue({ user: mockUser });
  });
  (0, globals_1.it)("should render children when user has required permission", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockRBACManager.checkPermission.mockResolvedValue({
              granted: true,
              reason: "Permission granted",
            });
            result = (0, react_1.renderHook)(() =>
              (0, use_rbac_1.usePermissionGuard)("view_users", mockClinicId),
            ).result;
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(result.current.loading).toBe(false);
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(result.current.shouldRender).toBe(true);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("should not render children when user lacks permission", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var result;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockRBACManager.checkPermission.mockResolvedValue({
              granted: false,
              reason: "Permission denied",
            });
            result = (0, react_1.renderHook)(() =>
              (0, use_rbac_1.usePermissionGuard)("manage_users", mockClinicId),
            ).result;
            return [
              4 /*yield*/,
              (0, react_1.waitFor)(() => {
                (0, globals_1.expect)(result.current.loading).toBe(false);
              }),
            ];
          case 1:
            _a.sent();
            (0, globals_1.expect)(result.current.shouldRender).toBe(false);
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, globals_1.it)("should show loading state initially", () => {
    mockRBACManager.checkPermission.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ granted: true }), 100)),
    );
    var result = (0, react_1.renderHook)(() =>
      (0, use_rbac_1.usePermissionGuard)("view_users", mockClinicId),
    ).result;
    (0, globals_1.expect)(result.current.loading).toBe(true);
    (0, globals_1.expect)(result.current.shouldRender).toBe(false);
  });
});
