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
exports.createTRPCContext = createTRPCContext;
var ssr_1 = require("@supabase/ssr");
var headers_1 = require("next/headers");
function createTRPCContext(opts) {
  return __awaiter(this, void 0, void 0, function () {
    var req,
      requestId,
      userAgent,
      ipAddress,
      cookieStore,
      supabase,
      user,
      _a,
      authUser,
      authError,
      _b,
      profile,
      profileError,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          req = opts.req;
          requestId = "req_"
            .concat(Date.now(), "_")
            .concat(Math.random().toString(36).substr(2, 9));
          userAgent = req.headers["user-agent"] || "unknown";
          ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
          return [4 /*yield*/, (0, headers_1.cookies)()];
        case 1:
          cookieStore = _c.sent();
          supabase = (0, ssr_1.createServerClient)(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
              cookies: {
                get: function (name) {
                  var _a;
                  return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
                },
              },
            },
          );
          user = null;
          _c.label = 2;
        case 2:
          _c.trys.push([2, 6, , 7]);
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _c.sent()), (authUser = _a.data.user), (authError = _a.error);
          if (!(authUser && !authError)) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("user_profiles")
              .select(
                "\n          id,\n          email,\n          role,\n          tenant_id,\n          medical_license,\n          lgpd_consent,\n          data_consent_given,\n          data_consent_date\n        ",
              )
              .eq("id", authUser.id)
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (profile = _b.data), (profileError = _b.error);
          if (profile && !profileError) {
            user = {
              id: profile.id,
              email: profile.email,
              role: profile.role,
              tenant_id: profile.tenant_id,
              medical_license: profile.medical_license || undefined,
              lgpd_consent: profile.lgpd_consent,
              data_consent_given: profile.data_consent_given,
              data_consent_date: profile.data_consent_date || undefined,
            };
          }
          _c.label = 5;
        case 5:
          return [3 /*break*/, 7];
        case 6:
          error_1 = _c.sent();
          console.error("Error fetching user context:", error_1);
          return [3 /*break*/, 7];
        case 7:
          return [
            2 /*return*/,
            {
              user: user,
              supabase: supabase,
              requestId: requestId,
              userAgent: userAgent,
              ipAddress: ipAddress,
              timestamp: new Date(),
            },
          ];
      }
    });
  });
}
