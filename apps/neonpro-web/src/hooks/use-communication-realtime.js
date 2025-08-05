"use client";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCommunicationRealtime = useCommunicationRealtime;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("./use-toast");
function useCommunicationRealtime(_a) {
  var conversationId = _a.conversationId,
    userId = _a.userId,
    _b = _a.autoConnect,
    autoConnect = _b === void 0 ? true : _b;
  var _c = (0, react_1.useState)({
      messages: [],
      isConnected: false,
      isLoading: false,
      error: null,
      participants: [],
      typingUsers: [],
    }),
    state = _c[0],
    setState = _c[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = yield (0, client_1.createClient)();
  // Carregar mensagens iniciais
  var loadMessages = (0, react_1.useCallback)(
    (convId) =>
      __awaiter(this, void 0, void 0, function () {
        var _a, messages_1, error, error_1;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, , 3]);
              setState((prev) => __assign(__assign({}, prev), { isLoading: true, error: null }));
              return [
                4 /*yield*/,
                supabase
                  .from("communication_messages")
                  .select(
                    "\n          *,\n          sender:auth.users!sender_id(id, email, raw_user_meta_data),\n          attachments:communication_attachments(*)\n        ",
                  )
                  .eq("conversation_id", convId)
                  .order("created_at", { ascending: true }),
              ];
            case 1:
              (_a = _b.sent()), (messages_1 = _a.data), (error = _a.error);
              if (error) throw error;
              setState((prev) =>
                __assign(__assign({}, prev), {
                  messages: messages_1 || [],
                  isLoading: false,
                }),
              );
              return [3 /*break*/, 3];
            case 2:
              error_1 = _b.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: error_1 instanceof Error ? error_1.message : "Erro ao carregar mensagens",
                  isLoading: false,
                }),
              );
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase],
  );
  // Conectar ao canal de realtime
  var connect = (0, react_1.useCallback)(
    (convId) => {
      try {
        var channel = supabase
          .channel("conversation:".concat(convId))
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "communication_messages",
              filter: "conversation_id=eq.".concat(convId),
            },
            (payload) =>
              __awaiter(this, void 0, void 0, function () {
                var fullMessage;
                return __generator(this, (_a) => {
                  switch (_a.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        supabase
                          .from("communication_messages")
                          .select(
                            "\n                *,\n                sender:auth.users!sender_id(id, email, raw_user_meta_data),\n                attachments:communication_attachments(*)\n              ",
                          )
                          .eq("id", payload.new.id)
                          .single(),
                      ];
                    case 1:
                      fullMessage = _a.sent().data;
                      if (fullMessage) {
                        setState((prev) =>
                          __assign(__assign({}, prev), {
                            messages: __spreadArray(
                              __spreadArray([], prev.messages, true),
                              [fullMessage],
                              false,
                            ),
                          }),
                        );
                      }
                      return [2 /*return*/];
                  }
                });
              }),
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "communication_messages",
              filter: "conversation_id=eq.".concat(convId),
            },
            (payload) =>
              __awaiter(this, void 0, void 0, function () {
                var fullMessage;
                return __generator(this, (_a) => {
                  switch (_a.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        supabase
                          .from("communication_messages")
                          .select(
                            "\n                *,\n                sender:auth.users!sender_id(id, email, raw_user_meta_data),\n                attachments:communication_attachments(*)\n              ",
                          )
                          .eq("id", payload.new.id)
                          .single(),
                      ];
                    case 1:
                      fullMessage = _a.sent().data;
                      if (fullMessage) {
                        setState((prev) =>
                          __assign(__assign({}, prev), {
                            messages: prev.messages.map((msg) =>
                              msg.id === fullMessage.id ? fullMessage : msg,
                            ),
                          }),
                        );
                      }
                      return [2 /*return*/];
                  }
                });
              }),
          )
          .on("broadcast", { event: "typing" }, (payload) => {
            if (payload.userId !== userId) {
              setState((prev) =>
                __assign(__assign({}, prev), {
                  typingUsers: payload.isTyping
                    ? __spreadArray(
                        __spreadArray(
                          [],
                          prev.typingUsers.filter((u) => u !== payload.userId),
                          true,
                        ),
                        [payload.userId],
                        false,
                      )
                    : prev.typingUsers.filter((u) => u !== payload.userId),
                }),
              );
            }
          })
          .on("broadcast", { event: "user_joined" }, (payload) => {
            setState((prev) =>
              __assign(__assign({}, prev), {
                participants: __spreadArray(
                  [],
                  new Set(
                    __spreadArray(
                      __spreadArray([], prev.participants, true),
                      [payload.userId],
                      false,
                    ),
                  ),
                  true,
                ),
              }),
            );
          })
          .on("broadcast", { event: "user_left" }, (payload) => {
            setState((prev) =>
              __assign(__assign({}, prev), {
                participants: prev.participants.filter((p) => p !== payload.userId),
              }),
            );
          })
          .subscribe((status) => {
            setState((prev) =>
              __assign(__assign({}, prev), {
                isConnected: status === "SUBSCRIBED",
                error: status === "CLOSED" ? "Conexão perdida" : null,
              }),
            );
          });
        return channel;
      } catch (error) {
        setState((prev) =>
          __assign(__assign({}, prev), {
            error: error instanceof Error ? error.message : "Erro ao conectar",
            isConnected: false,
          }),
        );
        return null;
      }
    },
    [supabase, userId],
  );
  // Enviar mensagem
  var sendMessage = (0, react_1.useCallback)(
    (content_1) => {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        this,
        __spreadArray([content_1], args_1, true),
        void 0,
        function (content, type, conversationId, metadata) {
          var _a, message, error, error_2;
          if (type === void 0) {
            type = "text";
          }
          return __generator(this, (_b) => {
            switch (_b.label) {
              case 0:
                if (!conversationId) {
                  toast({
                    title: "Erro",
                    description: "ID da conversa é obrigatório",
                    variant: "destructive",
                  });
                  return [2 /*return*/, null];
                }
                _b.label = 1;
              case 1:
                _b.trys.push([1, 3, , 4]);
                return [
                  4 /*yield*/,
                  supabase
                    .from("communication_messages")
                    .insert({
                      conversation_id: conversationId,
                      sender_id: userId,
                      content: content,
                      type: type,
                      metadata: metadata || {},
                    })
                    .select()
                    .single(),
                ];
              case 2:
                (_a = _b.sent()), (message = _a.data), (error = _a.error);
                if (error) throw error;
                return [2 /*return*/, message];
              case 3:
                error_2 = _b.sent();
                toast({
                  title: "Erro ao enviar mensagem",
                  description: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
                  variant: "destructive",
                });
                return [2 /*return*/, null];
              case 4:
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [supabase, userId, toast],
  );
  // Marcar mensagem como lida
  var markAsRead = (0, react_1.useCallback)(
    (messageId) =>
      __awaiter(this, void 0, void 0, function () {
        var error, error_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                supabase
                  .from("communication_messages")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", messageId)
                  .eq("conversation_id", conversationId),
              ];
            case 1:
              error = _a.sent().error;
              if (error) throw error;
              return [3 /*break*/, 3];
            case 2:
              error_3 = _a.sent();
              console.error("Erro ao marcar mensagem como lida:", error_3);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, conversationId],
  );
  // Broadcast de digitação
  var broadcastTyping = (0, react_1.useCallback)(
    (isTyping) =>
      __awaiter(this, void 0, void 0, function () {
        var channel, error_4;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!conversationId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              channel = supabase.channel("conversation:".concat(conversationId));
              return [
                4 /*yield*/,
                channel.send({
                  type: "broadcast",
                  event: "typing",
                  payload: { userId: userId, isTyping: isTyping },
                }),
              ];
            case 2:
              _a.sent();
              return [3 /*break*/, 4];
            case 3:
              error_4 = _a.sent();
              console.error("Erro ao enviar status de digitação:", error_4);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, conversationId, userId],
  );
  // Efeito principal
  (0, react_1.useEffect)(() => {
    if (!conversationId || !autoConnect) return;
    var channel = null;
    var setupConnection = () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Carregar mensagens iniciais
              return [4 /*yield*/, loadMessages(conversationId)];
            case 1:
              // Carregar mensagens iniciais
              _a.sent();
              // Conectar ao realtime
              channel = connect(conversationId);
              return [2 /*return*/];
          }
        });
      });
    setupConnection();
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, autoConnect, loadMessages, connect, supabase]);
  return __assign(__assign({}, state), {
    sendMessage: sendMessage,
    markAsRead: markAsRead,
    broadcastTyping: broadcastTyping,
    loadMessages: loadMessages,
    connect: (convId) => connect(convId),
  });
}
