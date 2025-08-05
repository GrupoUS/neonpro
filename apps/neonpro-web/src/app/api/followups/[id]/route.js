"use strict";
// =====================================================================================
// INDIVIDUAL FOLLOW-UP API ROUTES
// Epic 7.3: REST API endpoints for individual follow-up operations
// GET /api/followups/[id] - Get single follow-up
// PATCH /api/followups/[id] - Update follow-up
// DELETE /api/followups/[id] - Delete follow-up
// =====================================================================================
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
var treatment_followup_service_1 = require("@/app/lib/services/treatment-followup-service");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, session, authError, id, followup, error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
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
          id = params.id;
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Follow-up ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            treatment_followup_service_1.treatmentFollowupService.getFollowupById(id),
          ];
        case 3:
          followup = _d.sent();
          if (!followup) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Follow-up not found" }, { status: 404 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ data: followup })];
        case 4:
          error_1 = _d.sent();
          console.error("API error in GET /api/followups/[id]:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, session, authError, id, updates, updatedFollowup, error_2;
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
          id = params.id;
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Follow-up ID is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          updates = _d.sent();
          // Convert dates if present
          if (updates.scheduled_date) {
            updates.scheduled_date = new Date(updates.scheduled_date).toISOString();
          }
          if (updates.completed_date) {
            updates.completed_date = new Date(updates.completed_date).toISOString();
          }
          return [
            4 /*yield*/,
            treatment_followup_service_1.treatmentFollowupService.updateFollowup(id, updates),
          ];
        case 4:
          updatedFollowup = _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: updatedFollowup,
              message: "Follow-up updated successfully",
            }),
          ];
        case 5:
          error_2 = _d.sent();
          console.error("API error in PATCH /api/followups/[id]:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, _c, session, authError, id, error_3;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 4, , 5]);
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
          id = params.id;
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Follow-up ID is required" }, { status: 400 }),
            ];
          }
          // Delete follow-up
          return [
            4 /*yield*/,
            treatment_followup_service_1.treatmentFollowupService.deleteFollowup(id),
          ];
        case 3:
          // Delete follow-up
          _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Follow-up deleted successfully",
            }),
          ];
        case 4:
          error_3 = _d.sent();
          console.error("API error in DELETE /api/followups/[id]:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
