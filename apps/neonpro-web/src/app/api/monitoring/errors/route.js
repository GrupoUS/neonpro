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
exports.POST = POST;
exports.PATCH = PATCH;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var intelligent_error_handler_1 = require("@/lib/error-handling/intelligent-error-handler");
/**
 * 🔧 Error Monitoring & Management API
 *
 * Provides real-time error analytics and management capabilities
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, searchParams, timeWindow, errorId, error, summary, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          timeWindow = parseInt(searchParams.get("timeWindow") || "1800000");
          errorId = searchParams.get("errorId");
          if (errorId) {
            error = intelligent_error_handler_1.intelligentErrorHandler.getError(errorId);
            if (!error) {
              return [
                2 /*return*/,
                server_2.NextResponse.json({ error: "Error not found" }, { status: 404 }),
              ];
            }
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                error: error,
                timestamp: Date.now(),
              }),
            ];
          } else {
            summary =
              intelligent_error_handler_1.intelligentErrorHandler.getErrorSummary(timeWindow);
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                timeWindow: timeWindow,
                summary: summary,
                timestamp: Date.now(),
              }),
            ];
          }
          return [3 /*break*/, 4];
        case 3:
          error_1 = _a.sent();
          console.error("Error monitoring API failed:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
} /**
 * 📝 Report client-side error
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, message, stack, route, severity, metadata, errorContext, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          (message = body.message),
            (stack = body.stack),
            (route = body.route),
            (severity = body.severity),
            (metadata = body.metadata);
          if (!message) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Error message is required" }, { status: 400 }),
            ];
          }
          errorContext = intelligent_error_handler_1.intelligentErrorHandler.captureError(message, {
            stack: stack,
            route: route,
            userId: user.id,
            severity: severity || "medium",
            userAgent: request.headers.get("user-agent") || "unknown",
            metadata: __assign(__assign({}, metadata), { clientReported: true }),
          });
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              errorId: errorContext.errorId,
              recoveryAction: errorContext.recoveryAction,
            }),
          ];
        case 4:
          error_2 = _a.sent();
          console.error("Error reporting failed:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to report error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
} /**
 * ✅ Mark error as resolved
 */
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, errorId, resolution, resolved, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          (errorId = body.errorId), (resolution = body.resolution);
          if (!errorId) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Error ID is required" }, { status: 400 }),
            ];
          }
          resolved = intelligent_error_handler_1.intelligentErrorHandler.resolveError(
            errorId,
            resolution,
          );
          if (!resolved) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Error not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ success: true, resolved: true })];
        case 4:
          error_3 = _a.sent();
          console.error("Error resolution failed:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to resolve error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
