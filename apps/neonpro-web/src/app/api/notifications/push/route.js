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
exports.POST = POST;
exports.DELETE = DELETE;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var push_notification_service_1 = require("@/lib/push-notification-service");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, subscription, result, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          subscription = _d.sent().subscription;
          if (!subscription || !subscription.endpoint) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid subscription data" }, { status: 400 }),
            ];
          }
          // Validate subscription format
          if (
            !((_b = subscription.keys) === null || _b === void 0 ? void 0 : _b.p256dh) ||
            !((_c = subscription.keys) === null || _c === void 0 ? void 0 : _c.auth)
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Missing subscription keys" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            push_notification_service_1.default.saveSubscription(user.id, subscription),
          ];
        case 4:
          result = _d.sent();
          if (!result.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: result.error || "Failed to save subscription" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 5:
          error_1 = _d.sent();
          console.error("Error subscribing to push notifications:", error_1);
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
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, endpoint, result, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          endpoint = _b.sent().endpoint;
          if (!endpoint) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Missing endpoint" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            push_notification_service_1.default.removeSubscription(user.id, endpoint),
          ];
        case 4:
          result = _b.sent();
          if (!result.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: result.error || "Failed to remove subscription" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 5:
          error_2 = _b.sent();
          console.error("Error unsubscribing from push notifications:", error_2);
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
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, vapidPublicKey, subscriptions, error_3;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Check authentication
          ];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          vapidPublicKey = push_notification_service_1.default.getVapidPublicKey();
          if (!vapidPublicKey) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Push notifications not configured" },
                { status: 503 },
              ),
            ];
          }
          return [4 /*yield*/, push_notification_service_1.default.getUserSubscriptions(user.id)];
        case 3:
          subscriptions = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              vapidPublicKey: vapidPublicKey,
              hasSubscriptions: subscriptions.length > 0,
              subscriptionCount: subscriptions.length,
            }),
          ];
        case 4:
          error_3 = _b.sent();
          console.error("Error getting push notification info:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
