/**
 * Unit Tests for RBAC Permission Guard Components
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Test suite for React components that control access based on permissions
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
var user_event_1 = require("@testing-library/user-event");
var PermissionGuard_1 = require("@/components/rbac/PermissionGuard");
var _react_2 = require("react");
// Mock the usePermissions hook
var mockUsePermissions = {
  hasPermission: globals_1.jest.fn(),
  hasAnyPermission: globals_1.jest.fn(),
  hasAllPermissions: globals_1.jest.fn(),
  hasRole: globals_1.jest.fn(),
  hasMinimumRole: globals_1.jest.fn(),
  canAccess: globals_1.jest.fn(),
  canManage: globals_1.jest.fn(),
  canView: globals_1.jest.fn(),
  isLoading: false,
  error: null,
  clearCache: globals_1.jest.fn(),
};
globals_1.jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: () => mockUsePermissions,
}));
// Mock the useAuth hook
var mockUser = {
  id: "user-1",
  email: "test@example.com",
  role: "manager",
  clinicId: "clinic-1",
  iat: Date.now(),
  exp: Date.now() + 3600000,
};
var mockUseAuth = {
  user: mockUser,
  isLoading: false,
  isAuthenticated: true,
};
globals_1.jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth,
}));
// Test components
var TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
var FallbackComponent = () => <div data-testid="fallback-content">Access Denied</div>;
var LoadingComponent = () => <div data-testid="loading-content">Loading...</div>;
(0, globals_1.describe)("RBAC Permission Guard Components", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
    // Reset mock implementations
    mockUsePermissions.hasPermission.mockResolvedValue(true);
    mockUsePermissions.hasAnyPermission.mockResolvedValue(true);
    mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
    mockUsePermissions.hasRole.mockReturnValue(true);
    mockUsePermissions.hasMinimumRole.mockReturnValue(true);
    mockUsePermissions.canAccess.mockResolvedValue(true);
    mockUsePermissions.canManage.mockResolvedValue(true);
    mockUsePermissions.canView.mockResolvedValue(true);
    mockUsePermissions.isLoading = false;
    mockUsePermissions.error = null;
  });
  (0, globals_1.describe)("PermissionGuard", () => {
    (0, globals_1.it)("should render children when user has required permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard permission="patients.read">
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("protected-content"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
                "patients.read",
                undefined,
                undefined,
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should not render children when user lacks permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard permission="billing.manage">
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.queryByTestId("protected-content"),
                  ).not.toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render fallback component when access is denied", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard
                  permission="billing.manage"
                  fallback={<FallbackComponent />}
                >
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("fallback-content"),
                  ).toBeInTheDocument();
                  (0, globals_1.expect)(
                    react_1.screen.queryByTestId("protected-content"),
                  ).not.toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render loading component while checking permissions", () => {
      mockUsePermissions.isLoading = true;
      (0, react_1.render)(
        <PermissionGuard_1.PermissionGuard
          permission="patients.read"
          loading={<LoadingComponent />}
        >
          <TestComponent />
        </PermissionGuard_1.PermissionGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("loading-content")).toBeInTheDocument();
      (0, globals_1.expect)(
        react_1.screen.queryByTestId("protected-content"),
      ).not.toBeInTheDocument();
    });
    (0, globals_1.it)("should pass resource ID to permission check", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard
                  permission="patients.read"
                  resourceId="patient-123"
                >
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
                    "patients.read",
                    "patient-123",
                    undefined,
                  );
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should pass context to permission check", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var context;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              context = { clinicId: "clinic-2" };
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard permission="patients.read" context={context}>
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(mockUsePermissions.hasPermission).toHaveBeenCalledWith(
                    "patients.read",
                    undefined,
                    context,
                  );
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle multiple permissions with AND logic", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard
                  permissions={["patients.read", "appointments.read"]}
                  requireAll={true}
                >
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(mockUsePermissions.hasAllPermissions).toHaveBeenCalledWith([
                    "patients.read",
                    "appointments.read",
                  ]);
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle multiple permissions with OR logic", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasAnyPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard
                  permissions={["patients.read", "billing.read"]}
                  requireAll={false}
                >
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(mockUsePermissions.hasAnyPermission).toHaveBeenCalledWith([
                    "patients.read",
                    "billing.read",
                  ]);
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("RoleGuard", () => {
    (0, globals_1.it)("should render children when user has required role", () => {
      mockUsePermissions.hasRole.mockReturnValue(true);
      (0, react_1.render)(
        <PermissionGuard_1.RoleGuard>
          <TestComponent />
        </PermissionGuard_1.RoleGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("protected-content")).toBeInTheDocument();
      (0, globals_1.expect)(mockUsePermissions.hasRole).toHaveBeenCalledWith("manager");
    });
    (0, globals_1.it)("should not render children when user lacks role", () => {
      mockUsePermissions.hasRole.mockReturnValue(false);
      (0, react_1.render)(
        <PermissionGuard_1.RoleGuard>
          <TestComponent />
        </PermissionGuard_1.RoleGuard>,
      );
      (0, globals_1.expect)(
        react_1.screen.queryByTestId("protected-content"),
      ).not.toBeInTheDocument();
    });
    (0, globals_1.it)("should handle multiple roles", () => {
      mockUsePermissions.hasRole.mockImplementation((role) => ["manager", "staff"].includes(role));
      (0, react_1.render)(
        <PermissionGuard_1.RoleGuard roles={["manager", "staff"]}>
          <TestComponent />
        </PermissionGuard_1.RoleGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("protected-content")).toBeInTheDocument();
    });
    (0, globals_1.it)("should check minimum role level", () => {
      mockUsePermissions.hasMinimumRole.mockReturnValue(true);
      (0, react_1.render)(
        <PermissionGuard_1.RoleGuard minimumRole="staff">
          <TestComponent />
        </PermissionGuard_1.RoleGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("protected-content")).toBeInTheDocument();
      (0, globals_1.expect)(mockUsePermissions.hasMinimumRole).toHaveBeenCalledWith("staff");
    });
    (0, globals_1.it)("should render fallback for insufficient role", () => {
      mockUsePermissions.hasRole.mockReturnValue(false);
      (0, react_1.render)(
        <PermissionGuard_1.RoleGuard fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard_1.RoleGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("fallback-content")).toBeInTheDocument();
      (0, globals_1.expect)(
        react_1.screen.queryByTestId("protected-content"),
      ).not.toBeInTheDocument();
    });
  });
  (0, globals_1.describe)("FeatureGuard", () => {
    (0, globals_1.it)("should render children when user can access feature", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.canAccess.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.FeatureGuard feature="patient-management">
                  <TestComponent />
                </PermissionGuard_1.FeatureGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("protected-content"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(mockUsePermissions.canAccess).toHaveBeenCalledWith(
                "patient-management",
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should not render children when user cannot access feature", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.canAccess.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.FeatureGuard feature="billing-management">
                  <TestComponent />
                </PermissionGuard_1.FeatureGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.queryByTestId("protected-content"),
                  ).not.toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render loading state while checking feature access", () => {
      mockUsePermissions.isLoading = true;
      (0, react_1.render)(
        <PermissionGuard_1.FeatureGuard feature="patient-management" loading={<LoadingComponent />}>
          <TestComponent />
        </PermissionGuard_1.FeatureGuard>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("loading-content")).toBeInTheDocument();
    });
  });
  (0, globals_1.describe)("ConditionalRender", () => {
    (0, globals_1.it)("should render children when condition is true", () => {
      (0, react_1.render)(
        <PermissionGuard_1.ConditionalRender condition={true}>
          <TestComponent />
        </PermissionGuard_1.ConditionalRender>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("protected-content")).toBeInTheDocument();
    });
    (0, globals_1.it)("should not render children when condition is false", () => {
      (0, react_1.render)(
        <PermissionGuard_1.ConditionalRender condition={false}>
          <TestComponent />
        </PermissionGuard_1.ConditionalRender>,
      );
      (0, globals_1.expect)(
        react_1.screen.queryByTestId("protected-content"),
      ).not.toBeInTheDocument();
    });
    (0, globals_1.it)("should render fallback when condition is false", () => {
      (0, react_1.render)(
        <PermissionGuard_1.ConditionalRender condition={false} fallback={<FallbackComponent />}>
          <TestComponent />
        </PermissionGuard_1.ConditionalRender>,
      );
      (0, globals_1.expect)(react_1.screen.getByTestId("fallback-content")).toBeInTheDocument();
      (0, globals_1.expect)(
        react_1.screen.queryByTestId("protected-content"),
      ).not.toBeInTheDocument();
    });
  });
  (0, globals_1.describe)("PermissionButton", () => {
    (0, globals_1.it)("should render enabled button when user has permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionButton permission="patients.create" onClick={() => {}}>
                  Create Patient
                </PermissionGuard_1.PermissionButton>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var button = react_1.screen.getByRole("button", { name: "Create Patient" });
                  (0, globals_1.expect)(button).toBeInTheDocument();
                  (0, globals_1.expect)(button).toBeEnabled();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render disabled button when user lacks permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionButton permission="billing.create" onClick={() => {}}>
                  Create Invoice
                </PermissionGuard_1.PermissionButton>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var button = react_1.screen.getByRole("button", { name: "Create Invoice" });
                  (0, globals_1.expect)(button).toBeInTheDocument();
                  (0, globals_1.expect)(button).toBeDisabled();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should call onClick when clicked and permission is granted", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockOnClick, user, button;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockOnClick = globals_1.jest.fn();
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionButton
                  permission="patients.create"
                  onClick={mockOnClick}
                >
                  Create Patient
                </PermissionGuard_1.PermissionButton>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var button = react_1.screen.getByRole("button", { name: "Create Patient" });
                  (0, globals_1.expect)(button).toBeEnabled();
                }),
              ];
            case 1:
              _a.sent();
              user = user_event_1.default.setup();
              button = react_1.screen.getByRole("button", { name: "Create Patient" });
              return [4 /*yield*/, user.click(button)];
            case 2:
              _a.sent();
              (0, globals_1.expect)(mockOnClick).toHaveBeenCalledTimes(1);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should not call onClick when clicked and permission is denied", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockOnClick, user, button;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockOnClick = globals_1.jest.fn();
              mockUsePermissions.hasPermission.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionButton
                  permission="billing.create"
                  onClick={mockOnClick}
                >
                  Create Invoice
                </PermissionGuard_1.PermissionButton>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var button = react_1.screen.getByRole("button", { name: "Create Invoice" });
                  (0, globals_1.expect)(button).toBeDisabled();
                }),
              ];
            case 1:
              _a.sent();
              user = user_event_1.default.setup();
              button = react_1.screen.getByRole("button", { name: "Create Invoice" });
              return [4 /*yield*/, user.click(button)];
            case 2:
              _a.sent();
              (0, globals_1.expect)(mockOnClick).not.toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should show loading state while checking permissions", () => {
      mockUsePermissions.isLoading = true;
      (0, react_1.render)(
        <PermissionGuard_1.PermissionButton permission="patients.create" onClick={() => {}}>
          Create Patient
        </PermissionGuard_1.PermissionButton>,
      );
      var button = react_1.screen.getByRole("button");
      (0, globals_1.expect)(button).toBeDisabled();
      (0, globals_1.expect)(button).toHaveTextContent("Loading...");
    });
    (0, globals_1.it)("should pass additional props to button element", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionButton
                  permission="patients.create"
                  onClick={() => {}}
                  className="custom-button"
                  data-testid="permission-button"
                >
                  Create Patient
                </PermissionGuard_1.PermissionButton>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var button = react_1.screen.getByTestId("permission-button");
                  (0, globals_1.expect)(button).toHaveClass("custom-button");
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("PermissionLink", () => {
    (0, globals_1.it)("should render enabled link when user has permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionLink permission="patients.read" href="/patients">
                  View Patients
                </PermissionGuard_1.PermissionLink>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var link = react_1.screen.getByRole("link", { name: "View Patients" });
                  (0, globals_1.expect)(link).toBeInTheDocument();
                  (0, globals_1.expect)(link).toHaveAttribute("href", "/patients");
                  (0, globals_1.expect)(link).not.toHaveAttribute("aria-disabled");
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render disabled link when user lacks permission", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockResolvedValue(false);
              (0, react_1.render)(
                <PermissionGuard_1.PermissionLink permission="billing.read" href="/billing">
                  View Billing
                </PermissionGuard_1.PermissionLink>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  var link = react_1.screen.getByText("View Billing");
                  (0, globals_1.expect)(link).toBeInTheDocument();
                  (0, globals_1.expect)(link).not.toHaveAttribute("href");
                  (0, globals_1.expect)(link).toHaveAttribute("aria-disabled", "true");
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should show loading state while checking permissions", () => {
      mockUsePermissions.isLoading = true;
      (0, react_1.render)(
        <PermissionGuard_1.PermissionLink permission="patients.read" href="/patients">
          View Patients
        </PermissionGuard_1.PermissionLink>,
      );
      (0, globals_1.expect)(react_1.screen.getByText("Loading...")).toBeInTheDocument();
    });
  });
  (0, globals_1.describe)("Error handling", () => {
    (0, globals_1.it)("should handle permission check errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.error = "Permission check failed";
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard permission="patients.read">
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.queryByTestId("protected-content"),
                  ).not.toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should render error fallback when provided", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var ErrorComponent;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.error = "Permission check failed";
              ErrorComponent = () => <div data-testid="error-content">Error occurred</div>;
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard
                  permission="patients.read"
                  errorFallback={<ErrorComponent />}
                >
                  <TestComponent />
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("error-content"),
                  ).toBeInTheDocument();
                  (0, globals_1.expect)(
                    react_1.screen.queryByTestId("protected-content"),
                  ).not.toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Integration scenarios", () => {
    (0, globals_1.it)("should handle nested permission guards", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasPermission.mockImplementation((permission) =>
                Promise.resolve(permission === "patients.read" || permission === "patients.manage"),
              );
              (0, react_1.render)(
                <PermissionGuard_1.PermissionGuard permission="patients.read">
                  <div data-testid="outer-content">
                    <PermissionGuard_1.PermissionGuard permission="patients.manage">
                      <div data-testid="inner-content">Manage Patients</div>
                    </PermissionGuard_1.PermissionGuard>
                  </div>
                </PermissionGuard_1.PermissionGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("outer-content"),
                  ).toBeInTheDocument();
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("inner-content"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle complex permission combinations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockUsePermissions.hasAllPermissions.mockResolvedValue(true);
              mockUsePermissions.hasRole.mockReturnValue(true);
              (0, react_1.render)(
                <PermissionGuard_1.RoleGuard>
                  <PermissionGuard_1.PermissionGuard
                    permissions={["patients.read", "appointments.read"]}
                    requireAll={true}
                  >
                    <TestComponent />
                  </PermissionGuard_1.PermissionGuard>
                </PermissionGuard_1.RoleGuard>,
              );
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(() => {
                  (0, globals_1.expect)(
                    react_1.screen.getByTestId("protected-content"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
