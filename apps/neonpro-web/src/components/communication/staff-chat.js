"use client";
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
exports.StaffChat = StaffChat;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var use_communication_realtime_1 = require("@/hooks/use-communication-realtime");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
function StaffChat(_a) {
  var _this = this;
  var conversationId = _a.conversationId,
    userId = _a.userId,
    patientContext = _a.patientContext,
    className = _a.className;
  var _b = (0, react_1.useState)(""),
    messageInput = _b[0],
    setMessageInput = _b[1];
  var _c = (0, react_1.useState)(false),
    isTyping = _c[0],
    setIsTyping = _c[1];
  var messagesEndRef = (0, react_1.useRef)(null);
  var inputRef = (0, react_1.useRef)(null);
  var typingTimeoutRef = (0, react_1.useRef)();
  var _d = (0, use_communication_realtime_1.useCommunicationRealtime)({
      conversationId: conversationId,
      userId: userId,
      autoConnect: true,
    }),
    messages = _d.messages,
    isConnected = _d.isConnected,
    isLoading = _d.isLoading,
    error = _d.error,
    typingUsers = _d.typingUsers,
    sendMessage = _d.sendMessage,
    markAsRead = _d.markAsRead,
    broadcastTyping = _d.broadcastTyping;
  // Auto scroll para a última mensagem
  (0, react_1.useEffect)(
    function () {
      var _a;
      (_a = messagesEndRef.current) === null || _a === void 0
        ? void 0
        : _a.scrollIntoView({ behavior: "smooth" });
    },
    [messages],
  );
  // Gerenciar status de digitação
  var handleTyping = function () {
    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }
    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Definir novo timeout
    typingTimeoutRef.current = setTimeout(function () {
      setIsTyping(false);
      broadcastTyping(false);
    }, 1000);
  };
  // Enviar mensagem
  var handleSendMessage = function (e) {
    return __awaiter(_this, void 0, void 0, function () {
      var content;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            e.preventDefault();
            if (!messageInput.trim()) return [2 /*return*/];
            content = messageInput.trim();
            setMessageInput("");
            // Parar indicador de digitação
            if (isTyping) {
              setIsTyping(false);
              broadcastTyping(false);
            }
            return [4 /*yield*/, sendMessage(content, "text", conversationId)];
          case 1:
            _b.sent();
            // Focar novamente no input
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            return [2 /*return*/];
        }
      });
    });
  };
  // Renderizar mensagem
  var renderMessage = function (message, index) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var isCurrentUser = message.sender_id === userId;
    var showAvatar =
      !isCurrentUser &&
      (index === 0 ||
        ((_a = messages[index - 1]) === null || _a === void 0 ? void 0 : _a.sender_id) !==
          message.sender_id);
    return (
      <div
        key={message.id}
        className={(0, utils_1.cn)(
          "flex gap-3 mb-4",
          isCurrentUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        {showAvatar && !isCurrentUser && (
          <avatar_1.Avatar className="w-8 h-8">
            <avatar_1.AvatarImage
              src={
                (_c =
                  (_b = message.sender) === null || _b === void 0
                    ? void 0
                    : _b.raw_user_meta_data) === null || _c === void 0
                  ? void 0
                  : _c.avatar
              }
            />
            <avatar_1.AvatarFallback>
              {((_f =
                (_e =
                  (_d = message.sender) === null || _d === void 0
                    ? void 0
                    : _d.raw_user_meta_data) === null || _e === void 0
                  ? void 0
                  : _e.full_name) === null || _f === void 0
                ? void 0
                : _f[0]) ||
                ((_j =
                  (_h = (_g = message.sender) === null || _g === void 0 ? void 0 : _g.email) ===
                    null || _h === void 0
                    ? void 0
                    : _h[0]) === null || _j === void 0
                  ? void 0
                  : _j.toUpperCase()) ||
                "U"}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
        )}

        {!showAvatar && !isCurrentUser && (
          <div className="w-8" /> // Espaçamento
        )}

        <div
          className={(0, utils_1.cn)(
            "max-w-[70%] flex flex-col",
            isCurrentUser ? "items-end" : "items-start",
          )}
        >
          {!isCurrentUser && showAvatar && (
            <span className="text-xs text-muted-foreground mb-1">
              {((_l =
                (_k = message.sender) === null || _k === void 0
                  ? void 0
                  : _k.raw_user_meta_data) === null || _l === void 0
                ? void 0
                : _l.full_name) ||
                ((_m = message.sender) === null || _m === void 0 ? void 0 : _m.email) ||
                "Usuário"}
            </span>
          )}

          <div
            className={(0, utils_1.cn)(
              "rounded-lg px-3 py-2 break-words",
              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <p>{message.content}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map(function (attachment) {
                  return (
                    <div key={attachment.id} className="flex items-center gap-2 text-xs">
                      <lucide_react_1.Paperclip className="w-3 h-3" />
                      <span>{attachment.filename}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground mt-1">
            {(0, date_fns_1.formatDistanceToNow)(new Date(message.created_at), {
              addSuffix: true,
              locale: locale_1.ptBR,
            })}
            {message.read_at && isCurrentUser && <span className="ml-1">✓</span>}
          </span>
        </div>
      </div>
    );
  };
  return (
    <card_1.Card className={(0, utils_1.cn)("flex flex-col h-[600px]", className)}>
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <card_1.CardTitle className="text-lg">
              {patientContext ? "Chat - ".concat(patientContext.name) : "Chat da Equipe"}
            </card_1.CardTitle>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </badge_1.Badge>
              {patientContext && (
                <badge_1.Badge variant="outline">
                  Paciente #{patientContext.id.slice(-6)}
                </badge_1.Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.Phone className="w-4 h-4" />
            </button_1.Button>
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.Video className="w-4 h-4" />
            </button_1.Button>
            <dropdown_menu_1.DropdownMenu>
              <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button variant="ghost" size="sm">
                  <lucide_react_1.MoreHorizontal className="w-4 h-4" />
                </button_1.Button>
              </dropdown_menu_1.DropdownMenuTrigger>
              <dropdown_menu_1.DropdownMenuContent align="end">
                <dropdown_menu_1.DropdownMenuItem>
                  Histórico completo
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>
                  Exportar conversa
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem>Configurações</dropdown_menu_1.DropdownMenuItem>
              </dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>
          </div>
        </div>
      </card_1.CardHeader>

      <separator_1.Separator />

      <card_1.CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <scroll_area_1.ScrollArea className="flex-1 p-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-destructive">
              <p>Erro ao carregar chat: {error}</p>
              <button_1.Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={function () {
                  return window.location.reload();
                }}
              >
                Tentar novamente
              </button_1.Button>
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm mt-1">Inicie a conversa!</p>
            </div>
          )}

          {messages.map(function (message, index) {
            return renderMessage(message, index);
          })}

          {/* Indicador de digitação */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
              <span>
                {typingUsers.length === 1
                  ? "Alguém está digitando..."
                  : "".concat(typingUsers.length, " pessoas est\u00E3o digitando...")}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </scroll_area_1.ScrollArea>

        <separator_1.Separator />

        {/* Input de mensagem */}
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button_1.Button type="button" variant="ghost" size="sm" className="shrink-0">
              <lucide_react_1.Paperclip className="w-4 h-4" />
            </button_1.Button>

            <input_1.Input
              ref={inputRef}
              value={messageInput}
              onChange={function (e) {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={!isConnected}
            />

            <button_1.Button
              type="submit"
              disabled={!messageInput.trim() || !isConnected}
              size="sm"
            >
              <lucide_react_1.Send className="w-4 h-4" />
            </button_1.Button>
          </form>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
