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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.broadcastToChannel = broadcastToChannel;
exports.broadcastToUser = broadcastToUser;
exports.getConnectedClientsCount = getConnectedClientsCount;
exports.getChannelSubscribers = getChannelSubscribers;
var server_1 = require("next/server");
var ws_1 = require("ws");
var supabase_js_1 = require("@supabase/supabase-js");
var url_1 = require("url");
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
// WebSocket server instance
var wss = null;
// Connected clients map
var clients = new Map();
/**
 * GET /api/websocket - WebSocket upgrade endpoint
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var upgrade;
    return __generator(this, (_a) => {
      try {
        upgrade = request.headers.get("upgrade");
        if (upgrade !== "websocket") {
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "WebSocket upgrade required",
                message: "This endpoint only accepts WebSocket connections",
              },
              { status: 400 },
            ),
          ];
        }
        // Initialize WebSocket server if not already done
        if (!wss) {
          wss = new ws_1.WebSocketServer({ noServer: true });
          setupWebSocketHandlers();
        }
        return [
          2 /*return*/,
          server_1.NextResponse.json({ message: "WebSocket server ready" }, { status: 200 }),
        ];
      } catch (error) {
        console.error("WebSocket setup error:", error);
        return [
          2 /*return*/,
          server_1.NextResponse.json(
            { error: "Failed to setup WebSocket server" },
            { status: 500 },
          ),
        ];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Setup WebSocket event handlers
 */
function setupWebSocketHandlers() {
  if (!wss) return;
  wss.on("connection", (ws, request) =>
    __awaiter(this, void 0, void 0, function () {
      var query, token, userId, clientId, pingInterval;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            console.log("New WebSocket connection established");
            query = (0, url_1.parse)(request.url || "", true).query;
            token = query.token;
            if (!token) {
              ws.close(1008, "Authentication token required");
              return [2 /*return*/];
            }
            return [4 /*yield*/, verifyWebSocketAuth(token)];
          case 1:
            userId = _a.sent();
            if (!userId) {
              ws.close(1008, "Invalid authentication token");
              return [2 /*return*/];
            }
            clientId = generateClientId();
            clients.set(clientId, {
              ws: ws,
              userId: userId,
              subscriptions: new Set(),
            });
            // Send welcome message
            ws.send(
              JSON.stringify({
                type: "connected",
                clientId: clientId,
                message: "WebSocket connection established",
              }),
            );
            // Handle incoming messages
            ws.on("message", (data) =>
              __awaiter(this, void 0, void 0, function () {
                var message, error_1;
                return __generator(this, (_a) => {
                  switch (_a.label) {
                    case 0:
                      _a.trys.push([0, 2, , 3]);
                      message = JSON.parse(data.toString());
                      return [4 /*yield*/, handleWebSocketMessage(clientId, message)];
                    case 1:
                      _a.sent();
                      return [3 /*break*/, 3];
                    case 2:
                      error_1 = _a.sent();
                      console.error("WebSocket message error:", error_1);
                      ws.send(
                        JSON.stringify({
                          type: "error",
                          message: "Invalid message format",
                        }),
                      );
                      return [3 /*break*/, 3];
                    case 3:
                      return [2 /*return*/];
                  }
                });
              }),
            );
            // Handle connection close
            ws.on("close", () => {
              console.log("WebSocket connection closed for client ".concat(clientId));
              clients.delete(clientId);
            });
            // Handle errors
            ws.on("error", (error) => {
              console.error("WebSocket error for client ".concat(clientId, ":"), error);
              clients.delete(clientId);
            });
            pingInterval = setInterval(() => {
              if (ws.readyState === ws.OPEN) {
                ws.ping();
              } else {
                clearInterval(pingInterval);
              }
            }, 30000); // Ping every 30 seconds
            ws.on("pong", () => {
              // Connection is alive
            });
            return [2 /*return*/];
        }
      });
    }),
  );
}
/**
 * Handle WebSocket messages
 */
function handleWebSocketMessage(clientId, message) {
  return __awaiter(this, void 0, void 0, function () {
    var client, ws, userId, subscriptions, _a, canSubscribe;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          client = clients.get(clientId);
          if (!client) return [2 /*return*/];
          (ws = client.ws), (userId = client.userId), (subscriptions = client.subscriptions);
          _a = message.type;
          switch (_a) {
            case "subscribe":
              return [3 /*break*/, 1];
            case "unsubscribe":
              return [3 /*break*/, 4];
            case "ping":
              return [3 /*break*/, 5];
          }
          return [3 /*break*/, 6];
        case 1:
          if (!message.channel) return [3 /*break*/, 3];
          return [4 /*yield*/, verifyChannelAccess(userId, message.channel)];
        case 2:
          canSubscribe = _b.sent();
          if (canSubscribe) {
            subscriptions.add(message.channel);
            ws.send(
              JSON.stringify({
                type: "subscribed",
                channel: message.channel,
                message: "Subscribed to ".concat(message.channel),
              }),
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Access denied to channel ".concat(message.channel),
              }),
            );
          }
          _b.label = 3;
        case 3:
          return [3 /*break*/, 7];
        case 4:
          if (message.channel) {
            subscriptions.delete(message.channel);
            ws.send(
              JSON.stringify({
                type: "unsubscribed",
                channel: message.channel,
                message: "Unsubscribed from ".concat(message.channel),
              }),
            );
          }
          return [3 /*break*/, 7];
        case 5:
          ws.send(
            JSON.stringify({
              type: "pong",
              timestamp: new Date().toISOString(),
            }),
          );
          return [3 /*break*/, 7];
        case 6:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type: ".concat(message.type),
            }),
          );
          _b.label = 7;
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Verify WebSocket authentication
 */
function verifyWebSocketAuth(token) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, user, error, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [4 /*yield*/, supabase.auth.getUser(token)];
        case 1:
          (_a = _b.sent()), (user = _a.data.user), (error = _a.error);
          if (error || !user) {
            return [2 /*return*/, null];
          }
          return [2 /*return*/, user.id];
        case 2:
          error_2 = _b.sent();
          console.error("WebSocket auth verification error:", error_2);
          return [2 /*return*/, null];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Verify channel access permissions
 */
function verifyChannelAccess(userId, channel) {
  return __awaiter(this, void 0, void 0, function () {
    var channelRules, rule;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          channelRules = {
            analytics: (uid) =>
              __awaiter(this, void 0, void 0, function () {
                return __generator(this, (_a) => {
                  // Users can access their own analytics
                  return [2 /*return*/, true];
                });
              }),
            trials: (uid) =>
              __awaiter(this, void 0, void 0, function () {
                return __generator(this, (_a) => {
                  // Users can access their trial updates
                  return [2 /*return*/, true];
                });
              }),
            admin: (uid) =>
              __awaiter(this, void 0, void 0, function () {
                var user;
                return __generator(this, (_a) => {
                  switch (_a.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        supabase.from("users").select("role").eq("id", uid).single(),
                      ];
                    case 1:
                      user = _a.sent().data;
                      return [
                        2 /*return*/,
                        (user === null || user === void 0 ? void 0 : user.role) === "admin",
                      ];
                  }
                });
              }),
            global: (uid) =>
              __awaiter(this, void 0, void 0, function () {
                return __generator(this, (_a) => {
                  // Global announcements - all authenticated users
                  return [2 /*return*/, true];
                });
              }),
          };
          rule = channelRules[channel];
          if (!rule) {
            return [2 /*return*/, false];
          }
          return [4 /*yield*/, rule(userId)];
        case 1:
          return [2 /*return*/, _a.sent()];
      }
    });
  });
}
/**
 * Generate unique client ID
 */
function generateClientId() {
  return "client_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
}
/**
 * Broadcast message to specific channel
 */
function broadcastToChannel(channel, message) {
  clients.forEach((client, clientId) => {
    if (client.subscriptions.has(channel) && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "broadcast",
          channel: channel,
          data: message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });
}
/**
 * Broadcast message to specific user
 */
function broadcastToUser(userId, message) {
  clients.forEach((client, clientId) => {
    if (client.userId === userId && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "direct_message",
          data: message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });
}
/**
 * Get connected clients count
 */
function getConnectedClientsCount() {
  return clients.size;
}
/**
 * Get connected clients for a specific channel
 */
function getChannelSubscribers(channel) {
  var count = 0;
  clients.forEach((client) => {
    if (client.subscriptions.has(channel)) {
      count++;
    }
  });
  return count;
}
