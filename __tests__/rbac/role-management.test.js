"use strict";
// Role Management Component Tests
// Story 1.2: Role-Based Permissions Enhancement
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var role_management_1 = require("@/components/admin/role-management");
var use_rbac_1 = require("@/hooks/use-rbac");
var permissions_1 = require("@/lib/auth/rbac/permissions");
// Mock dependencies
jest.mock("@/hooks/use-rbac", function () {
  return {
    useRBAC: jest.fn(),
  };
});
jest.mock("@/lib/auth/rbac/permissions", function () {
  return {
    RBACPermissionManager: jest.fn(function () {
      return {
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getUserRole: jest.fn(),
        getAllUsers: jest.fn(),
        getAllRoles: jest.fn(),
      };
    }),
  };
});
// Mock UI components
jest.mock("@/components/ui/card", function () {
  return {
    Card: function (_a) {
      var children = _a.children,
        className = _a.className;
      return <div className={className}>{children}</div>;
    },
    CardContent: function (_a) {
      var children = _a.children;
      return <div>{children}</div>;
    },
    CardDescription: function (_a) {
      var children = _a.children;
      return <p>{children}</p>;
    },
    CardHeader: function (_a) {
      var children = _a.children;
      return <div>{children}</div>;
    },
    CardTitle: function (_a) {
      var children = _a.children;
      return <h3>{children}</h3>;
    },
  };
});
jest.mock("@/components/ui/button", function () {
  return {
    Button: function (_a) {
      var children = _a.children,
        onClick = _a.onClick,
        disabled = _a.disabled,
        variant = _a.variant;
      return (
        <button onClick={onClick} disabled={disabled} data-variant={variant}>
          {children}
        </button>
      );
    },
  };
});
jest.mock("@/components/ui/select", function () {
  return {
    Select: function (_a) {
      var children = _a.children,
        onValueChange = _a.onValueChange;
      return (
        <div
          data-testid="select"
          onClick={function () {
            return onValueChange === null || onValueChange === void 0
              ? void 0
              : onValueChange("test-value");
          }}
        >
          {children}
        </div>
      );
    },
    SelectContent: function (_a) {
      var children = _a.children;
      return <div>{children}</div>;
    },
    SelectItem: function (_a) {
      var children = _a.children,
        value = _a.value;
      return <option value={value}>{children}</option>;
    },
    SelectTrigger: function (_a) {
      var children = _a.children;
      return <div>{children}</div>;
    },
    SelectValue: function (_a) {
      var placeholder = _a.placeholder;
      return <span>{placeholder}</span>;
    },
  };
});
jest.mock("@/components/ui/table", function () {
  return {
    Table: function (_a) {
      var children = _a.children;
      return <table>{children}</table>;
    },
    TableBody: function (_a) {
      var children = _a.children;
      return <tbody>{children}</tbody>;
    },
    TableCell: function (_a) {
      var children = _a.children;
      return <td>{children}</td>;
    },
    TableHead: function (_a) {
      var children = _a.children;
      return <th>{children}</th>;
    },
    TableHeader: function (_a) {
      var children = _a.children;
      return <thead>{children}</thead>;
    },
    TableRow: function (_a) {
      var children = _a.children;
      return <tr>{children}</tr>;
    },
  };
});
jest.mock("@/components/ui/badge", function () {
  return {
    Badge: function (_a) {
      var children = _a.children,
        variant = _a.variant;
      return <span data-variant={variant}>{children}</span>;
    },
  };
});
jest.mock("@/components/ui/alert", function () {
  return {
    Alert: function (_a) {
      var children = _a.children;
      return <div role="alert">{children}</div>;
    },
    AlertDescription: function (_a) {
      var children = _a.children;
      return <p>{children}</p>;
    },
  };
});
jest.mock("lucide-react", function () {
  return {
    Users: function () {
      return <span data-testid="users-icon">Users</span>;
    },
    Shield: function () {
      return <span data-testid="shield-icon">Shield</span>;
    },
    UserCheck: function () {
      return <span data-testid="user-check-icon">UserCheck</span>;
    },
    AlertCircle: function () {
      return <span data-testid="alert-circle-icon">AlertCircle</span>;
    },
    Loader2: function () {
      return <span data-testid="loader-icon">Loading</span>;
    },
  };
});
var mockClinicId = "clinic-123";
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
var mockManagerRole = {
  id: "role-manager",
  name: "manager",
  display_name: "Gerente",
  description: "Gerente da clínica",
  permissions: ["manage_users", "view_users", "view_patients"],
  hierarchy: 2,
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
var mockUsers = [
  {
    id: "user-1",
    email: "owner@clinic.com",
    name: "Owner User",
    role: mockOwnerRole,
  },
  {
    id: "user-2",
    email: "manager@clinic.com",
    name: "Manager User",
    role: mockManagerRole,
  },
  {
    id: "user-3",
    email: "staff@clinic.com",
    name: "Staff User",
    role: mockStaffRole,
  },
];
var mockRoles = [mockOwnerRole, mockManagerRole, mockStaffRole];
(0, globals_1.describe)("RoleManagement Component", function () {
  var mockRBACManager;
  var mockUseRBAC;
  (0, globals_1.beforeEach)(function () {
    jest.clearAllMocks();
    mockRBACManager = {
      assignRole: jest.fn(),
      removeRole: jest.fn(),
      getUserRole: jest.fn(),
      getAllUsers: jest.fn(),
      getAllRoles: jest.fn(),
    };
    mockUseRBAC = {
      loading: false,
      role: mockOwnerRole,
      permissions: mockOwnerRole.permissions,
      checkPermission: jest.fn().mockResolvedValue(true),
      canManageUser: jest.fn().mockResolvedValue(true),
      isInRole: jest.fn().mockReturnValue(true),
      isAtLeastRole: jest.fn().mockReturnValue(true),
    };
    permissions_1.RBACPermissionManager.mockReturnValue(mockRBACManager);
    use_rbac_1.useRBAC.mockReturnValue(mockUseRBAC);
    // Mock successful data loading
    mockRBACManager.getAllUsers.mockResolvedValue(mockUsers);
    mockRBACManager.getAllRoles.mockResolvedValue(mockRoles);
  });
  (0, globals_1.afterEach)(function () {
    jest.restoreAllMocks();
  });
  (0, globals_1.describe)("Component Rendering", function () {
    (0, globals_1.it)("should render role management interface", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              (0, globals_1.expect)(
                react_1.screen.getByText("Gerenciamento de Funções"),
              ).toBeInTheDocument();
              (0, globals_1.expect)(
                react_1.screen.getByText("Gerencie funções e permissões dos usuários"),
              ).toBeInTheDocument();
              // Wait for data to load
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 1:
              // Wait for data to load
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should show loading state initially", function () {
      mockUseRBAC.loading = true;
      (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
      (0, globals_1.expect)(react_1.screen.getByTestId("loader-icon")).toBeInTheDocument();
      (0, globals_1.expect)(
        react_1.screen.getByText("Carregando dados de função..."),
      ).toBeInTheDocument();
    });
    (0, globals_1.it)("should show access denied when user lacks permissions", function () {
      mockUseRBAC.checkPermission.mockResolvedValue(false);
      mockUseRBAC.isAtLeastRole.mockReturnValue(false);
      (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
      (0, globals_1.expect)(react_1.screen.getByText("Acesso Negado")).toBeInTheDocument();
      (0, globals_1.expect)(
        react_1.screen.getByText("Você não tem permissão para gerenciar funções de usuário."),
      ).toBeInTheDocument();
    });
  });
  (0, globals_1.describe)("User List Display", function () {
    (0, globals_1.it)("should display list of users with their roles", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Manager User"),
                  ).toBeInTheDocument();
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(
                react_1.screen.getByText("owner@clinic.com"),
              ).toBeInTheDocument();
              (0, globals_1.expect)(
                react_1.screen.getByText("manager@clinic.com"),
              ).toBeInTheDocument();
              (0, globals_1.expect)(
                react_1.screen.getByText("staff@clinic.com"),
              ).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("Proprietário")).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("Gerente")).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("Funcionário")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should show role hierarchy levels", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Nível 1")).toBeInTheDocument();
                  (0, globals_1.expect)(react_1.screen.getByText("Nível 2")).toBeInTheDocument();
                  (0, globals_1.expect)(react_1.screen.getByText("Nível 3")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle empty user list", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRBACManager.getAllUsers.mockResolvedValue([]);
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Nenhum usuário encontrado"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Role Assignment", function () {
    (0, globals_1.it)("should allow role assignment for manageable users", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, assignButtons;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              assignButtons = react_1.screen.getAllByText("Alterar Função");
              return [4 /*yield*/, user.click(assignButtons[2])];
            case 2:
              _a.sent(); // Staff user button
              // Should show role selection
              (0, globals_1.expect)(
                react_1.screen.getByText("Selecionar nova função"),
              ).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should disable role assignment for non-manageable users", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var buttons;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockUseRBAC.canManageUser.mockImplementation(function (userId) {
                return userId !== "user-1"; // Cannot manage owner
              });
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              buttons = react_1.screen.getAllByText("Alterar Função");
              (0, globals_1.expect)(buttons[0]).toBeDisabled();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should successfully assign new role", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, assignButtons, selectElement, confirmButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockRBACManager.assignRole.mockResolvedValue({ success: true });
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              assignButtons = react_1.screen.getAllByText("Alterar Função");
              return [4 /*yield*/, user.click(assignButtons[2])];
            case 2:
              _a.sent();
              selectElement = react_1.screen.getByTestId("select");
              return [4 /*yield*/, user.click(selectElement)];
            case 3:
              _a.sent();
              confirmButton = react_1.screen.getByText("Confirmar Alteração");
              return [4 /*yield*/, user.click(confirmButton)];
            case 4:
              _a.sent();
              (0, globals_1.expect)(mockRBACManager.assignRole).toHaveBeenCalledWith(
                "user-3",
                "test-value", // Mock value from select
                mockClinicId,
                globals_1.expect.any(Object),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle role assignment errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, assignButtons, selectElement, confirmButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockRBACManager.assignRole.mockRejectedValue(new Error("Assignment failed"));
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              assignButtons = react_1.screen.getAllByText("Alterar Função");
              return [4 /*yield*/, user.click(assignButtons[2])];
            case 2:
              _a.sent();
              selectElement = react_1.screen.getByTestId("select");
              return [4 /*yield*/, user.click(selectElement)];
            case 3:
              _a.sent();
              confirmButton = react_1.screen.getByText("Confirmar Alteração");
              return [4 /*yield*/, user.click(confirmButton)];
            case 4:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Erro ao alterar função"),
                  ).toBeInTheDocument();
                }),
              ];
            case 5:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Role Removal", function () {
    (0, globals_1.it)("should allow role removal for manageable users", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, removeButtons;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              removeButtons = react_1.screen.getAllByText("Remover Função");
              return [4 /*yield*/, user.click(removeButtons[2])];
            case 2:
              _a.sent();
              (0, globals_1.expect)(
                react_1.screen.getByText("Confirmar remoção de função"),
              ).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should successfully remove role", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, removeButtons, confirmButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockRBACManager.removeRole.mockResolvedValue({ success: true });
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              removeButtons = react_1.screen.getAllByText("Remover Função");
              return [4 /*yield*/, user.click(removeButtons[2])];
            case 2:
              _a.sent();
              confirmButton = react_1.screen.getByText("Confirmar Remoção");
              return [4 /*yield*/, user.click(confirmButton)];
            case 3:
              _a.sent();
              (0, globals_1.expect)(mockRBACManager.removeRole).toHaveBeenCalledWith(
                "user-3",
                mockClinicId,
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle role removal errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, removeButtons, confirmButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockRBACManager.removeRole.mockRejectedValue(new Error("Removal failed"));
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Staff User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              removeButtons = react_1.screen.getAllByText("Remover Função");
              return [4 /*yield*/, user.click(removeButtons[2])];
            case 2:
              _a.sent();
              confirmButton = react_1.screen.getByText("Confirmar Remoção");
              return [4 /*yield*/, user.click(confirmButton)];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Erro ao remover função"),
                  ).toBeInTheDocument();
                }),
              ];
            case 4:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Permission Display", function () {
    (0, globals_1.it)("should show role permissions when expanded", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, expandButtons;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              expandButtons = react_1.screen.getAllByText("Ver Permissões");
              return [4 /*yield*/, user.click(expandButtons[0])];
            case 2:
              _a.sent();
              (0, globals_1.expect)(react_1.screen.getByText("manage_clinic")).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("manage_users")).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("view_users")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should hide permissions when collapsed", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, expandButtons, collapseButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              expandButtons = react_1.screen.getAllByText("Ver Permissões");
              return [4 /*yield*/, user.click(expandButtons[0])];
            case 2:
              _a.sent();
              (0, globals_1.expect)(react_1.screen.getByText("manage_clinic")).toBeInTheDocument();
              collapseButton = react_1.screen.getByText("Ocultar Permissões");
              return [4 /*yield*/, user.click(collapseButton)];
            case 3:
              _a.sent();
              (0, globals_1.expect)(
                react_1.screen.queryByText("manage_clinic"),
              ).not.toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Statistics Display", function () {
    (0, globals_1.it)("should show role statistics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("3")).toBeInTheDocument(); // Total users
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(
                react_1.screen.getByText("Total de Usuários"),
              ).toBeInTheDocument();
              (0, globals_1.expect)(react_1.screen.getByText("Funções Ativas")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should update statistics when data changes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var rerender;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              rerender = (0, react_1.render)(
                <role_management_1.RoleManagement clinicId={mockClinicId} />,
              ).rerender;
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("3")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              // Update mock data
              mockRBACManager.getAllUsers.mockResolvedValue(
                __spreadArray(
                  __spreadArray([], mockUsers, true),
                  [
                    {
                      id: "user-4",
                      email: "new@clinic.com",
                      name: "New User",
                      role: mockStaffRole,
                    },
                  ],
                  false,
                ),
              );
              rerender(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("4")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error Handling", function () {
    (0, globals_1.it)("should handle data loading errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockRBACManager.getAllUsers.mockRejectedValue(new Error("Failed to load users"));
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Erro ao carregar dados"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should show retry option on error", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, retryButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockRBACManager.getAllUsers.mockRejectedValue(new Error("Network error"));
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(
                    react_1.screen.getByText("Tentar Novamente"),
                  ).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              // Mock successful retry
              mockRBACManager.getAllUsers.mockResolvedValue(mockUsers);
              retryButton = react_1.screen.getByText("Tentar Novamente");
              return [4 /*yield*/, user.click(retryButton)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Accessibility", function () {
    (0, globals_1.it)("should have proper ARIA labels", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByRole("table")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              (0, globals_1.expect)(react_1.screen.getByRole("table")).toHaveAttribute(
                "aria-label",
                globals_1.expect.stringContaining("usuários"),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should support keyboard navigation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, buttons, _i, buttons_1, button;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_1.render)(<role_management_1.RoleManagement clinicId={mockClinicId} />);
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  (0, globals_1.expect)(react_1.screen.getByText("Owner User")).toBeInTheDocument();
                }),
              ];
            case 1:
              _a.sent();
              buttons = react_1.screen.getAllByRole("button");
              (_i = 0), (buttons_1 = buttons);
              _a.label = 2;
            case 2:
              if (!(_i < buttons_1.length)) return [3 /*break*/, 5];
              button = buttons_1[_i];
              return [4 /*yield*/, user.tab()];
            case 3:
              _a.sent();
              if (document.activeElement === button) {
                (0, globals_1.expect)(button).toHaveFocus();
                return [3 /*break*/, 5];
              }
              _a.label = 4;
            case 4:
              _i++;
              return [3 /*break*/, 2];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
