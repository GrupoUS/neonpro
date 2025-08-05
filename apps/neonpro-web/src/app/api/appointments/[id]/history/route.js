// app/api/appointments/[id]/history/route.ts
// API route for appointment history and audit trail
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
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
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
/**
 * GET /api/appointments/[id]/history
 * Fetch appointment history and audit trail
 */
function GET(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      resolvedParams,
      appointmentId,
      searchParams,
      limit,
      offset,
      _c,
      history_1,
      error,
      count,
      transformedHistory,
      response,
      error_1;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, undefined, 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error_message: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          resolvedParams = _d.sent();
          appointmentId = resolvedParams.id;
          searchParams = new URL(request.url).searchParams;
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          return [
            4 /*yield*/,
            supabase
              .from("appointment_history")
              .select(
                "\n        id,\n        appointment_id,\n        action,\n        changed_fields,\n        old_values,\n        new_values,\n        change_reason,\n        changed_by,\n        created_at,\n        changed_by_user:profiles!appointment_history_changed_by_fkey(full_name)\n      ",
                { count: "exact" },
              )
              .eq("appointment_id", appointmentId)
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1),
          ];
        case 4:
          (_c = _d.sent()), (history_1 = _c.data), (error = _c.error), (count = _c.count);
          if (error) {
            throw error;
          }
          transformedHistory = (history_1 || []).map((entry) => {
            var _a;
            return __assign(__assign({}, entry), {
              changed_by_name:
                ((_a = entry.changed_by_user) === null || _a === void 0 ? void 0 : _a.full_name) ||
                "Unknown User",
            });
          });
          response = {
            success: true,
            data: transformedHistory,
            total_count: count || 0,
          };
          return [2 /*return*/, server_1.NextResponse.json(response)];
        case 5:
          error_1 = _d.sent();
          console.error("Error fetching appointment history:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error_message: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
