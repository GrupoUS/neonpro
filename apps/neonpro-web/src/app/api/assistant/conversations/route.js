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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      searchParams,
      limit,
      offset,
      _b,
      conversations,
      error,
      formattedConversations,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
          offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
          return [
            4 /*yield*/,
            supabase
              .from("assistant_conversations")
              .select(
                "\n        id,\n        title,\n        model_used,\n        is_active,\n        created_at,\n        updated_at,\n        assistant_messages(count)\n      ",
              )
              .eq("user_id", user.id)
              .order("updated_at", { ascending: false })
              .range(offset, offset + limit - 1),
          ];
        case 3:
          (_b = _c.sent()), (conversations = _b.data), (error = _b.error);
          if (error) {
            console.error("Error fetching conversations:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch conversations" },
                { status: 500 },
              ),
            ];
          }
          formattedConversations =
            (conversations === null || conversations === void 0
              ? void 0
              : conversations.map(function (conv) {
                  var _a, _b;
                  return {
                    id: conv.id,
                    title: conv.title,
                    model_used: conv.model_used,
                    is_active: conv.is_active,
                    created_at: conv.created_at,
                    updated_at: conv.updated_at,
                    message_count:
                      ((_b =
                        (_a = conv.assistant_messages) === null || _a === void 0
                          ? void 0
                          : _a[0]) === null || _b === void 0
                        ? void 0
                        : _b.count) || 0,
                  };
                })) || [];
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              conversations: formattedConversations,
              pagination: {
                limit: limit,
                offset: offset,
                total: formattedConversations.length,
              },
            }),
          ];
        case 4:
          error_1 = _c.sent();
          console.error("Conversations API Error:", error_1);
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, authError, _b, title, _c, model, _d, conversation, error, error_2;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          (_b = _e.sent()),
            (title = _b.title),
            (_c = _b.model),
            (model = _c === void 0 ? "gpt4" : _c);
          if (!title || title.trim().length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Title is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("assistant_conversations")
              .insert({
                user_id: user.id,
                title: title.trim(),
                model_used: model,
                is_active: true,
              })
              .select()
              .single(),
          ];
        case 4:
          (_d = _e.sent()), (conversation = _d.data), (error = _d.error);
          if (error) {
            console.error("Error creating conversation:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create conversation" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ conversation: conversation })];
        case 5:
          error_2 = _e.sent();
          console.error("Create Conversation API Error:", error_2);
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
