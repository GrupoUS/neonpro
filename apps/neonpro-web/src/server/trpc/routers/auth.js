"use strict";
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
exports.authRouter = void 0;
var zod_1 = require("zod");
var trpc_1 = require("../trpc");
var middleware_1 = require("../middleware");
var server_1 = require("@trpc/server");
// Healthcare user profile schema
var HealthcareUserSchema = zod_1.z.object({
  id: zod_1.z.string(),
  email: zod_1.z.string().email(),
  role: zod_1.z.enum(["admin", "healthcare_professional", "patient", "staff"]),
  tenant_id: zod_1.z.string(),
  medical_license: zod_1.z.string().optional(),
  lgpd_consent: zod_1.z.boolean(),
  data_consent_given: zod_1.z.boolean(),
  data_consent_date: zod_1.z.string().optional(),
  profile: zod_1.z
    .object({
      full_name: zod_1.z.string(),
      specialization: zod_1.z.string().optional(),
      department: zod_1.z.string().optional(),
      phone: zod_1.z.string().optional(),
      avatar_url: zod_1.z.string().optional(),
    })
    .optional(),
  tenant: zod_1.z
    .object({
      id: zod_1.z.string(),
      name: zod_1.z.string(),
      type: zod_1.z.enum(["hospital", "clinic", "practice"]),
      settings: zod_1.z.record(zod_1.z.any()).optional(),
    })
    .optional(),
});
exports.authRouter = (0, trpc_1.createTRPCRouter)({
  // Get current user with healthcare profile
  me: middleware_1.protectedProcedure.output(HealthcareUserSchema).query(function (_a) {
    return __awaiter(void 0, [_a], void 0, function (_b) {
      var _c, userProfile, profileError, error_1;
      var ctx = _b.ctx;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              ctx.supabase
                .from("user_profiles")
                .select(
                  "\n            id,\n            email,\n            role,\n            tenant_id,\n            medical_license,\n            lgpd_consent,\n            data_consent_given,\n            data_consent_date,\n            full_name,\n            specialization,\n            department,\n            phone,\n            avatar_url,\n            tenants:tenant_id (\n              id,\n              name,\n              type,\n              settings\n            )\n          ",
                )
                .eq("id", ctx.user.id)
                .single(),
            ];
          case 1:
            (_c = _d.sent()), (userProfile = _c.data), (profileError = _c.error);
            if (profileError || !userProfile) {
              throw new server_1.TRPCError({
                code: "NOT_FOUND",
                message: "Healthcare profile not found",
              });
            }
            // Validate LGPD compliance
            if (!userProfile.lgpd_consent || !userProfile.data_consent_given) {
              throw new server_1.TRPCError({
                code: "FORBIDDEN",
                message: "LGPD data consent required",
              });
            }
            return [
              2 /*return*/,
              {
                id: userProfile.id,
                email: userProfile.email,
                role: userProfile.role,
                tenant_id: userProfile.tenant_id,
                medical_license: userProfile.medical_license || undefined,
                lgpd_consent: userProfile.lgpd_consent,
                data_consent_given: userProfile.data_consent_given,
                data_consent_date: userProfile.data_consent_date || undefined,
                profile: {
                  full_name: userProfile.full_name,
                  specialization: userProfile.specialization || undefined,
                  department: userProfile.department || undefined,
                  phone: userProfile.phone || undefined,
                  avatar_url: userProfile.avatar_url || undefined,
                },
                tenant: userProfile.tenants
                  ? {
                      id: userProfile.tenants.id,
                      name: userProfile.tenants.name,
                      type: userProfile.tenants.type,
                      settings: userProfile.tenants.settings || undefined,
                    }
                  : undefined,
              },
            ];
          case 2:
            error_1 = _d.sent();
            if (error_1 instanceof server_1.TRPCError) {
              throw error_1;
            }
            throw new server_1.TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to fetch healthcare profile",
              cause: error_1,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }),
  // Update LGPD consent
  updateConsent: middleware_1.protectedProcedure
    .input(
      zod_1.z.object({
        lgpd_consent: zod_1.z.boolean(),
        data_consent_given: zod_1.z.boolean(),
      }),
    )
    .output(
      zod_1.z.object({
        success: zod_1.z.boolean(),
        message: zod_1.z.string(),
      }),
    )
    .mutation(function (_a) {
      return __awaiter(void 0, [_a], void 0, function (_b) {
        var error, error_2;
        var ctx = _b.ctx,
          input = _b.input;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                ctx.supabase
                  .from("user_profiles")
                  .update({
                    lgpd_consent: input.lgpd_consent,
                    data_consent_given: input.data_consent_given,
                    data_consent_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", ctx.user.id),
              ];
            case 1:
              error = _c.sent().error;
              if (error) {
                throw new server_1.TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to update LGPD consent",
                  cause: error,
                });
              }
              return [
                2 /*return*/,
                {
                  success: true,
                  message: "LGPD consent updated successfully",
                },
              ];
            case 2:
              error_2 = _c.sent();
              if (error_2 instanceof server_1.TRPCError) {
                throw error_2;
              }
              throw new server_1.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update consent",
                cause: error_2,
              });
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }),
});
