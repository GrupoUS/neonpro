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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantProcedure =
  exports.adminProcedure =
  exports.medicalProcedure =
  exports.protectedProcedure =
  exports.publicProcedureWithAudit =
  exports.tenantMiddleware =
  exports.adminMiddleware =
  exports.medicalProfessionalMiddleware =
  exports.authMiddleware =
  exports.healthcareAuditMiddleware =
    void 0;
var server_1 = require("@trpc/server");
var trpc_1 = require("./trpc");
// Healthcare compliance middleware
exports.healthcareAuditMiddleware = (0, trpc_1.middleware)((_a) =>
  __awaiter(void 0, [_a], void 0, function (_b) {
    var startTime, result, error_1;
    var ctx = _b.ctx,
      next = _b.next,
      path = _b.path,
      type = _b.type;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          startTime = Date.now();
          _c.label = 1;
        case 1:
          _c.trys.push([1, 4, undefined, 6]);
          return [4 /*yield*/, next()];
        case 2:
          result = _c.sent();
          // Log successful healthcare operation
          return [
            4 /*yield*/,
            logHealthcareAudit({
              ctx: ctx,
              path: path,
              type: type,
              success: true,
              duration: Date.now() - startTime,
              error: null,
            }),
          ];
        case 3:
          // Log successful healthcare operation
          _c.sent();
          return [2 /*return*/, result];
        case 4:
          error_1 = _c.sent();
          // Log failed healthcare operation
          return [
            4 /*yield*/,
            logHealthcareAudit({
              ctx: ctx,
              path: path,
              type: type,
              success: false,
              duration: Date.now() - startTime,
              error: error_1 instanceof Error ? error_1.message : "Unknown error",
            }),
          ];
        case 5:
          // Log failed healthcare operation
          _c.sent();
          throw error_1;
        case 6:
          return [2 /*return*/];
      }
    });
  }),
);
// Authentication middleware with healthcare role validation
exports.authMiddleware = (0, trpc_1.middleware)((_a) =>
  __awaiter(void 0, [_a], void 0, function (_b) {
    var ctx = _b.ctx,
      next = _b.next;
    return __generator(this, (_c) => {
      if (!ctx.user) {
        throw new server_1.TRPCError({
          code: "UNAUTHORIZED",
          message: "Healthcare authentication required",
        });
      }
      // Validate LGPD compliance
      if (!ctx.user.lgpd_consent || !ctx.user.data_consent_given) {
        throw new server_1.TRPCError({
          code: "FORBIDDEN",
          message: "LGPD data consent required for healthcare operations",
        });
      }
      return [
        2 /*return*/,
        next({
          ctx: __assign(__assign({}, ctx), { user: ctx.user }),
        }),
      ];
    });
  }),
);
// Medical professional middleware
exports.medicalProfessionalMiddleware = exports.authMiddleware.unstable_pipe(
  (0, trpc_1.middleware)((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var allowedRoles;
      var ctx = _b.ctx,
        next = _b.next;
      return __generator(this, (_c) => {
        allowedRoles = ["healthcare_professional", "admin"];
        if (!allowedRoles.includes(ctx.user.role)) {
          throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "Medical professional access required",
          });
        }
        // Validate medical license for healthcare professionals
        if (ctx.user.role === "healthcare_professional" && !ctx.user.medical_license) {
          throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "Valid medical license required",
          });
        }
        return [2 /*return*/, next()];
      });
    }),
  ),
);
// Admin-only middleware
exports.adminMiddleware = exports.authMiddleware.unstable_pipe(
  (0, trpc_1.middleware)((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var ctx = _b.ctx,
        next = _b.next;
      return __generator(this, (_c) => {
        if (ctx.user.role !== "admin") {
          throw new server_1.TRPCError({
            code: "FORBIDDEN",
            message: "Administrative access required",
          });
        }
        return [2 /*return*/, next()];
      });
    }),
  ),
);
// Tenant isolation middleware
exports.tenantMiddleware = exports.authMiddleware.unstable_pipe(
  (0, trpc_1.middleware)((_a) =>
    __awaiter(void 0, [_a], void 0, function (_b) {
      var ctx = _b.ctx,
        next = _b.next,
        input = _b.input;
      return __generator(this, (_c) => {
        // Ensure tenant_id matches user's tenant for data isolation
        if (input && typeof input === "object" && "tenant_id" in input) {
          if (input.tenant_id !== ctx.user.tenant_id) {
            throw new server_1.TRPCError({
              code: "FORBIDDEN",
              message: "Cross-tenant access not allowed",
            });
          }
        }
        return [
          2 /*return*/,
          next({
            ctx: __assign(__assign({}, ctx), { tenantId: ctx.user.tenant_id }),
          }),
        ];
      });
    }),
  ),
); // Healthcare audit logging function
function logHealthcareAudit(_a) {
  return __awaiter(this, arguments, void 0, function (_b) {
    var auditData, auditError_1;
    var _c, _d, _e, _f, _g, _h;
    var ctx = _b.ctx,
      path = _b.path,
      type = _b.type,
      success = _b.success,
      duration = _b.duration,
      error = _b.error;
    return __generator(this, (_j) => {
      switch (_j.label) {
        case 0:
          _j.trys.push([0, 2, undefined, 3]);
          auditData = {
            user_id: ((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id) || null,
            action: "".concat(type, ".").concat(path),
            resource_type: path.split(".")[0] || "unknown",
            tenant_id: (_d = ctx.user) === null || _d === void 0 ? void 0 : _d.tenant_id,
            metadata: {
              success: success,
              duration_ms: duration,
              error: error || undefined,
            },
            request_id: ctx.requestId,
            ip_address: ctx.ipAddress,
            user_agent: ctx.userAgent,
            timestamp: ctx.timestamp,
            compliance_flags: {
              lgpd_compliant:
                ((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.lgpd_consent) || false,
              data_consent_validated:
                ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.data_consent_given) ||
                false,
              medical_role_verified:
                ((_g = ctx.user) === null || _g === void 0 ? void 0 : _g.role) ===
                "healthcare_professional"
                  ? !!((_h = ctx.user) === null || _h === void 0 ? void 0 : _h.medical_license)
                  : true,
            },
          };
          // Insert audit log into Supabase
          return [4 /*yield*/, ctx.supabase.from("healthcare_audit_logs").insert(auditData)];
        case 1:
          // Insert audit log into Supabase
          _j.sent();
          return [3 /*break*/, 3];
        case 2:
          auditError_1 = _j.sent();
          // Log audit errors but don't fail the main operation
          console.error("Healthcare audit logging failed:", auditError_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Procedure definitions with healthcare middleware
exports.publicProcedureWithAudit = trpc_1.publicProcedure.use(exports.healthcareAuditMiddleware);
exports.protectedProcedure = exports.publicProcedureWithAudit.use(exports.authMiddleware);
exports.medicalProcedure = exports.publicProcedureWithAudit.use(
  exports.medicalProfessionalMiddleware,
);
exports.adminProcedure = exports.publicProcedureWithAudit.use(exports.adminMiddleware);
exports.tenantProcedure = exports.publicProcedureWithAudit.use(exports.tenantMiddleware);
