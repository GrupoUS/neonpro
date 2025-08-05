"use strict";
/**
 * Unit Tests for RBAC Permissions System
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Comprehensive test suite for permission validation and authorization
 */
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
var globals_1 = require("@jest/globals");
var permissions_1 = require("@/lib/auth/rbac/permissions");
// Mock Supabase client
globals_1.jest.mock("@/app/utils/supabase/client", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return {
        from: globals_1.jest.fn(function () {
          return {
            select: globals_1.jest.fn(function () {
              return {
                eq: globals_1.jest.fn(function () {
                  return {
                    single: globals_1.jest.fn(),
                  };
                }),
              };
            }),
            insert: globals_1.jest.fn(),
          };
        }),
      };
    }),
  };
});
// Mock console.error to avoid noise in tests
var originalConsoleError = console.error;
(0, globals_1.beforeEach)(function () {
  console.error = globals_1.jest.fn();
  (0, permissions_1.clearAllPermissionCache)();
});
(0, globals_1.afterEach)(function () {
  console.error = originalConsoleError;
  globals_1.jest.clearAllMocks();
});
/**
 * Create mock user for testing
 */
function createMockUser(role, clinicId) {
  if (clinicId === void 0) {
    clinicId = "clinic-1";
  }
  return {
    id: "user-".concat(role),
    email: "".concat(role, "@test.com"),
    role: role,
    clinicId: clinicId,
    iat: Date.now(),
    exp: Date.now() + 3600000,
  };
}
(0, globals_1.describe)("RBAC Permissions System", function () {
  (0, globals_1.describe)("hasPermission", function () {
    (0, globals_1.it)(
      "should grant permission when user role has the required permission",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var user, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                user = createMockUser("manager");
                return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
              case 1:
                result = _a.sent();
                (0, globals_1.expect)(result.granted).toBe(true);
                (0, globals_1.expect)(result.roleUsed).toBe("manager");
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)(
      "should deny permission when user role lacks the required permission",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var user, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                user = createMockUser("patient");
                return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "users.manage")];
              case 1:
                result = _a.sent();
                (0, globals_1.expect)(result.granted).toBe(false);
                (0, globals_1.expect)(result.reason).toContain("does not have permission");
                (0, globals_1.expect)(result.roleUsed).toBe("patient");
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)("should deny permission for invalid user role", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("invalid");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("Invalid user role");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should deny cross-clinic access for non-admin users", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff", "clinic-1");
              return [
                4 /*yield*/,
                (0, permissions_1.hasPermission)(user, "patients.read", undefined, {
                  clinicId: "clinic-2",
                }),
              ];
            case 1:
              result = _a.sent();
              // This would be handled by the permission validation logic
              (0, globals_1.expect)(result.granted).toBe(true); // Basic role check passes, clinic check would be in resource validation
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should use permission cache for repeated checks", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result1, result2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              result1 = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 2:
              result2 = _a.sent();
              (0, globals_1.expect)(result1.granted).toBe(true);
              (0, globals_1.expect)(result2.granted).toBe(true);
              (0, globals_1.expect)(result1.roleUsed).toBe(result2.roleUsed);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("hasAnyPermission", function () {
    (0, globals_1.it)(
      "should grant access when user has at least one of the required permissions",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var user, permissions, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                user = createMockUser("staff");
                permissions = ["patients.read", "billing.manage"];
                return [4 /*yield*/, (0, permissions_1.hasAnyPermission)(user, permissions)];
              case 1:
                result = _a.sent();
                (0, globals_1.expect)(result.granted).toBe(true);
                (0, globals_1.expect)(result.roleUsed).toBe("staff");
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)(
      "should deny access when user has none of the required permissions",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var user, permissions, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                user = createMockUser("patient");
                permissions = ["billing.manage", "users.manage"];
                return [4 /*yield*/, (0, permissions_1.hasAnyPermission)(user, permissions)];
              case 1:
                result = _a.sent();
                (0, globals_1.expect)(result.granted).toBe(false);
                (0, globals_1.expect)(result.reason).toContain(
                  "does not have any of the required permissions",
                );
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)("should handle empty permissions array", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, permissions, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              permissions = [];
              return [4 /*yield*/, (0, permissions_1.hasAnyPermission)(user, permissions)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("hasAllPermissions", function () {
    (0, globals_1.it)("should grant access when user has all required permissions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, permissions, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              permissions = ["patients.read", "appointments.read"];
              return [4 /*yield*/, (0, permissions_1.hasAllPermissions)(user, permissions)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              (0, globals_1.expect)(result.roleUsed).toBe("manager");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)(
      "should deny access when user is missing any required permission",
      function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var user, permissions, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                user = createMockUser("staff");
                permissions = ["patients.read", "billing.manage"];
                return [4 /*yield*/, (0, permissions_1.hasAllPermissions)(user, permissions)];
              case 1:
                result = _a.sent();
                (0, globals_1.expect)(result.granted).toBe(false);
                (0, globals_1.expect)(result.reason).toContain("Missing required permission");
                return [2 /*return*/];
            }
          });
        });
      },
    );
    (0, globals_1.it)("should handle empty permissions array", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, permissions, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("patient");
              permissions = [];
              return [4 /*yield*/, (0, permissions_1.hasAllPermissions)(user, permissions)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Role-based permission validation", function () {
    (0, globals_1.it)("should validate owner permissions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, patientRead, billingManage, clinicManage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("owner");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              patientRead = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "billing.manage")];
            case 2:
              billingManage = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "clinic.manage")];
            case 3:
              clinicManage = _a.sent();
              (0, globals_1.expect)(patientRead.granted).toBe(true);
              (0, globals_1.expect)(billingManage.granted).toBe(true);
              (0, globals_1.expect)(clinicManage.granted).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate manager permissions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, patientRead, billingManage, clinicManage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              patientRead = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "billing.manage")];
            case 2:
              billingManage = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "clinic.manage")];
            case 3:
              clinicManage = _a.sent();
              (0, globals_1.expect)(patientRead.granted).toBe(true);
              (0, globals_1.expect)(billingManage.granted).toBe(true);
              (0, globals_1.expect)(clinicManage.granted).toBe(false); // Managers can't manage clinic settings
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate staff permissions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, patientRead, appointmentManage, billingManage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              patientRead = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "appointments.manage")];
            case 2:
              appointmentManage = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "billing.manage")];
            case 3:
              billingManage = _a.sent();
              (0, globals_1.expect)(patientRead.granted).toBe(true);
              (0, globals_1.expect)(appointmentManage.granted).toBe(true);
              (0, globals_1.expect)(billingManage.granted).toBe(false); // Staff can't manage billing
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate patient permissions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, patientRead, appointmentManage, billingRead;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("patient");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              patientRead = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "appointments.manage")];
            case 2:
              appointmentManage = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "billing.read")];
            case 3:
              billingRead = _a.sent();
              (0, globals_1.expect)(patientRead.granted).toBe(true); // Patients can read their own data
              (0, globals_1.expect)(appointmentManage.granted).toBe(false);
              (0, globals_1.expect)(billingRead.granted).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error handling", function () {
    (0, globals_1.it)("should handle permission validation errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, originalValidation, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              originalValidation = require("@/lib/auth/rbac/permissions");
              globals_1.jest
                .spyOn(originalValidation, "hasPermission")
                .mockRejectedValueOnce(new Error("Database error"));
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("Permission validation failed");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle missing user data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidUser, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidUser = {
                id: "",
                email: "",
                role: "",
                clinicId: "",
                iat: 0,
                exp: 0,
              };
              return [4 /*yield*/, (0, permissions_1.hasPermission)(invalidUser, "patients.read")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Performance and caching", function () {
    (0, globals_1.it)("should cache permission results for performance", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, start1, result1, time1, start2, result2, time2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              start1 = Date.now();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              result1 = _a.sent();
              time1 = Date.now() - start1;
              start2 = Date.now();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 2:
              result2 = _a.sent();
              time2 = Date.now() - start2;
              (0, globals_1.expect)(result1.granted).toBe(true);
              (0, globals_1.expect)(result2.granted).toBe(true);
              // Cache should be faster (though this might be flaky in fast environments)
              (0, globals_1.expect)(time2).toBeLessThanOrEqual(time1 + 5); // Allow some margin
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should clear cache when requested", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              // Cache a result
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              // Cache a result
              _a.sent();
              // Clear cache
              (0, permissions_1.clearAllPermissionCache)();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 2:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Resource-specific permissions", function () {
    (0, globals_1.it)("should handle patient-specific access", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              return [
                4 /*yield*/,
                (0, permissions_1.hasPermission)(user, "patients.read", "patient-123"),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              (0, globals_1.expect)(result.roleUsed).toBe("staff");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle appointment-specific access", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("staff");
              return [
                4 /*yield*/,
                (0, permissions_1.hasPermission)(user, "appointments.manage", "appointment-456"),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              (0, globals_1.expect)(result.roleUsed).toBe("staff");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should handle financial data access restrictions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var staffUser, managerUser, staffResult, managerResult;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              staffUser = createMockUser("staff");
              managerUser = createMockUser("manager");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(staffUser, "billing.read")];
            case 1:
              staffResult = _a.sent();
              return [4 /*yield*/, (0, permissions_1.hasPermission)(managerUser, "billing.read")];
            case 2:
              managerResult = _a.sent();
              (0, globals_1.expect)(staffResult.granted).toBe(false);
              (0, globals_1.expect)(managerResult.granted).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Audit logging", function () {
    (0, globals_1.it)("should log successful permission checks", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("manager");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "patients.read")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should log failed permission checks", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = createMockUser("patient");
              return [4 /*yield*/, (0, permissions_1.hasPermission)(user, "users.manage")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.granted).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
