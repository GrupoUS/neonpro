// Alert Acknowledgment API
// Description: Dedicated endpoint for alert acknowledgment
// Author: Dev Agent
// Date: 2025-01-26
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
exports.PATCH = PATCH;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
function PATCH(_request_1, _a) {
  return __awaiter(this, arguments, void 0, function (_request, _b) {
    var supabase, _c, user, userError, _d, updatedAlert, error, error_1;
    var params = _b.params;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 3, undefined, 4]);
          supabase = (0, server_2.createClient)();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (userError = _c.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("kpi_alerts")
              .update({
                is_acknowledged: true,
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: user.id,
              })
              .eq("id", params.id)
              .select()
              .single(),
          ];
        case 2:
          (_d = _e.sent()), (updatedAlert = _d.data), (error = _d.error);
          if (error) {
            if (error.code === "PGRST116") {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { success: false, error: "Alert not found" },
                  { status: 404 },
                ),
              ];
            }
            throw new Error("Database error: ".concat(error.message));
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedAlert,
              message: "Alert acknowledged successfully",
            }),
          ];
        case 3:
          error_1 = _e.sent();
          console.error("Error acknowledging alert:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
