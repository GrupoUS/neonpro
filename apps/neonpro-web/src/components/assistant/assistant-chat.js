"use client";
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
exports.AssistantChat = AssistantChat;
var react_1 = require("react");
var react_2 = require("ai/react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var scroll_area_1 = require("@/components/ui/scroll-area");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function AssistantChat(_a) {
  var conversationId = _a.conversationId,
    onConversationChange = _a.onConversationChange;
  var scrollAreaRef = (0, react_1.useRef)(null);
  var _b = (0, react_1.useState)("gpt4"),
    selectedModel = _b[0],
    setSelectedModel = _b[1];
  var _c = (0, react_2.useChat)({
      api: "/api/assistant/chat",
      body: {
        conversationId: conversationId,
        model: selectedModel,
      },
      onResponse: (response) =>
        __awaiter(this, void 0, void 0, function () {
          var error;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                if (response.ok) return [3 /*break*/, 2];
                return [4 /*yield*/, response.text()];
              case 1:
                error = _a.sent();
                sonner_1.toast.error("Erro ao enviar mensagem: " + error);
                _a.label = 2;
              case 2:
                return [2 /*return*/];
            }
          });
        }),
      onFinish: (message) => {
        // Scroll to bottom after response
        setTimeout(() => {
          if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }
        }, 100);
      },
    }),
    messages = _c.messages,
    input = _c.input,
    handleInputChange = _c.handleInputChange,
    handleSubmit = _c.handleSubmit,
    isLoading = _c.isLoading,
    setMessages = _c.setMessages;
  // Auto-scroll to bottom when new messages arrive
  (0, react_1.useEffect)(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  // Load conversation messages if conversationId provided
  (0, react_1.useEffect)(() => {
    if (conversationId) {
      loadConversationMessages(conversationId);
    }
  }, [conversationId]);
  var loadConversationMessages = (convId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, formattedMessages, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/assistant/conversations/".concat(convId))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            formattedMessages = data.messages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: new Date(msg.created_at),
            }));
            setMessages(formattedMessages);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading conversation:", error_1);
            sonner_1.toast.error("Erro ao carregar conversa");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getModelBadgeColor = (model) => {
    switch (model) {
      case "gpt4":
        return "bg-green-100 text-green-800";
      case "claude":
        return "bg-purple-100 text-purple-800";
      case "gpt35":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getModelName = (model) => {
    switch (model) {
      case "gpt4":
        return "GPT-4";
      case "claude":
        return "Claude 3.5 Sonnet";
      case "gpt35":
        return "GPT-3.5 Turbo";
      default:
        return model;
    }
  };
  return (
    <card_1.Card className="h-full flex flex-col">
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <lucide_react_1.Bot className="h-5 w-5 text-blue-600" />
            <card_1.CardTitle className="text-lg">Assistente Virtual NeonPro</card_1.CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <badge_1.Badge className={getModelBadgeColor(selectedModel)}>
              {getModelName(selectedModel)}
            </badge_1.Badge>
            <button_1.Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <lucide_react_1.Settings className="h-4 w-4" />
            </button_1.Button>
          </div>
        </div>
        <separator_1.Separator className="mt-2" />
      </card_1.CardHeader>

      <card_1.CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <scroll_area_1.ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0
              ? <div className="text-center text-muted-foreground py-8">
                  <lucide_react_1.Bot className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-medium mb-2">
                    Olá! Sou seu assistente virtual do NeonPro
                  </h3>
                  <p className="text-sm">
                    Estou aqui para ajudar com gestão da sua clínica, agendamentos, pacientes e
                    muito mais. Como posso ajudar hoje?
                  </p>
                </div>
              : messages.map((message) => (
                  <div
                    key={message.id}
                    className={"flex gap-3 ".concat(
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.role === "assistant" && (
                      <avatar_1.Avatar className="h-8 w-8 mt-1">
                        <avatar_1.AvatarFallback className="bg-blue-100 text-blue-600">
                          <lucide_react_1.Bot className="h-4 w-4" />
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                    )}

                    <div
                      className={"max-w-[80%] rounded-lg px-4 py-2 ".concat(
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900",
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>

                    {message.role === "user" && (
                      <avatar_1.Avatar className="h-8 w-8 mt-1">
                        <avatar_1.AvatarFallback className="bg-gray-100 text-gray-600">
                          <lucide_react_1.User className="h-4 w-4" />
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                    )}
                  </div>
                ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <avatar_1.Avatar className="h-8 w-8 mt-1">
                  <avatar_1.AvatarFallback className="bg-blue-100 text-blue-600">
                    <lucide_react_1.Bot className="h-4 w-4" />
                  </avatar_1.AvatarFallback>
                </avatar_1.Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </scroll_area_1.ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input_1.Input
              value={input}
              onChange={handleInputChange}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1"
              autoFocus
            />
            <button_1.Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="sm"
              className="px-3"
            >
              {isLoading
                ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" />
                : <lucide_react_1.Send className="h-4 w-4" />}
            </button_1.Button>
          </form>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
