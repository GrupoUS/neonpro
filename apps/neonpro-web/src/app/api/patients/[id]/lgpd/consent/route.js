"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.POST = POST;
exports.PATCH = PATCH;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var zod_1 = require("zod");
var ConsentSchema = zod_1.z.object({
  dataProcessingConsent: zod_1.z.boolean(),
  sensitiveDataConsent: zod_1.z.boolean(),
  marketingConsent: zod_1.z.boolean(),
  dataRetentionAcknowledgment: zod_1.z.boolean(),
  consentVersion: zod_1.z.string().default("1.0"),
});
// POST - Record new LGPD consent
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, user, authError, id, body, validatedConsent, _d, consent, error, error_1;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 7, , 8]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Verify authentication
          ];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          id = _e.sent().id;
          return [4 /*yield*/, request.json()];
        case 4:
          body = _e.sent();
          validatedConsent = ConsentSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_consents")
              .insert({
                patient_id: id,
                data_processing_consent: validatedConsent.dataProcessingConsent,
                sensitive_data_consent: validatedConsent.sensitiveDataConsent,
                marketing_consent: validatedConsent.marketingConsent,
                data_retention_acknowledgment: validatedConsent.dataRetentionAcknowledgment,
                consent_version: validatedConsent.consentVersion,
                consent_date: new Date().toISOString(),
                created_by: user.id,
              })
              .select()
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (consent = _d.data), (error = _d.error);
          if (error) {
            console.error("Consent recording error:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to record consent" }, { status: 500 }),
            ];
          } // Log consent for audit trail
          return [
            4 /*yield*/,
            supabase.from("lgpd_audit_log").insert({
              patient_id: id,
              action: "consent_given",
              data_fields: Object.keys(validatedConsent),
              legal_basis: "Consentimento do titular (Art. 7°, I, LGPD)",
              user_agent: request.headers.get("user-agent"),
              ip_address: request.ip || "unknown",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Consent recorded successfully",
              consent: consent,
            }),
          ];
        case 7:
          error_1 = _e.sent();
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Validation error", details: error_1.errors },
                { status: 400 },
              ),
            ];
          }
          console.error("Consent POST error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// PATCH - Update existing consent
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, user, authError, id, body, _d, consent, error, error_2;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          id = _e.sent().id;
          return [
            4 /*yield*/,
            request.json(),
            // Update consent record
          ];
        case 4:
          body = _e.sent();
          return [
            4 /*yield*/,
            supabase
              .from("lgpd_consents")
              .update(__assign(__assign({}, body), { updated_at: new Date().toISOString() }))
              .eq("patient_id", id)
              .select()
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (consent = _d.data), (error = _d.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update consent" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Consent updated successfully",
              consent: consent,
            }),
          ];
        case 6:
          error_2 = _e.sent();
          console.error("Consent PATCH error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
