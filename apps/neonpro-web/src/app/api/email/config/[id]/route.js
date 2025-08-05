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
exports.GET = GET;
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var email_1 = require("@/app/types/email");
var zod_1 = require("zod");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, session, authError, profile, config, error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_c = _d.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("email_provider_configs")
              .select("*")
              .eq("id", params.id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 4:
          config = _d.sent().data;
          if (!config) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Configuration not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json(config)];
        case 5:
          error_1 = _d.sent();
          console.error("Get email config error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      _c,
      session,
      authError,
      profile,
      body,
      partialSchema,
      validatedConfig,
      _d,
      config,
      error,
      error_2;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_c = _e.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _e.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _e.sent();
          partialSchema = email_1.EmailProviderConfigSchema.partial();
          validatedConfig = partialSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("email_provider_configs")
              .update(
                __assign(__assign({}, validatedConfig), { updated_at: new Date().toISOString() }),
              )
              .eq("id", params.id)
              .eq("clinic_id", profile.clinic_id)
              .select()
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (config = _d.data), (error = _d.error);
          if (error) {
            throw error;
          }
          if (!config) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Configuration not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json(config)];
        case 6:
          error_2 = _e.sent();
          console.error("Update email config error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid configuration data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
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
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, session, authError, profile, error, error_3;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_c = _d.sent()), (session = _c.data.session), (authError = _c.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("email_provider_configs")
              .delete()
              .eq("id", params.id)
              .eq("clinic_id", profile.clinic_id),
          ];
        case 4:
          error = _d.sent().error;
          if (error) {
            throw error;
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 5:
          error_3 = _d.sent();
          console.error("Delete email config error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
