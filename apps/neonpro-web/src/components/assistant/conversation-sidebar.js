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
exports.ConversationSidebar = ConversationSidebar;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var scroll_area_1 = require("@/components/ui/scroll-area");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
function ConversationSidebar(_a) {
  var selectedConversationId = _a.selectedConversationId,
    onSelectConversation = _a.onSelectConversation,
    onNewConversation = _a.onNewConversation;
  var _b = (0, react_1.useState)([]),
    conversations = _b[0],
    setConversations = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  (0, react_1.useEffect)(() => {
    loadConversations();
  }, []);
  var loadConversations = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/assistant/conversations")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setConversations(data.conversations);
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Erro ao carregar conversas");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Error loading conversations:", error_1);
            sonner_1.toast.error("Erro ao carregar conversas");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var createNewConversation = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data_1, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              fetch("/api/assistant/conversations", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: "Nova Conversa",
                  model: "gpt4",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data_1 = _a.sent();
            setConversations((prev) => __spreadArray([data_1.conversation], prev, true));
            onSelectConversation(data_1.conversation.id);
            onNewConversation();
            sonner_1.toast.success("Nova conversa criada");
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Erro ao criar nova conversa");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Error creating conversation:", error_2);
            sonner_1.toast.error("Erro ao criar nova conversa");
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var deleteConversation = (conversationId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/assistant/conversations/".concat(conversationId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) {
              setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
              if (selectedConversationId === conversationId) {
                onNewConversation(); // Reset to new conversation
              }
              sonner_1.toast.success("Conversa excluída");
            } else {
              sonner_1.toast.error("Erro ao excluir conversa");
            }
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error deleting conversation:", error_3);
            sonner_1.toast.error("Erro ao excluir conversa");
            return [3 /*break*/, 3];
          case 3:
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
        return "Claude";
      case "gpt35":
        return "GPT-3.5";
      default:
        return model;
    }
  };
  return (
    <card_1.Card className="h-full flex flex-col">
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.MessageSquare className="h-5 w-5" />
            Conversas
          </card_1.CardTitle>
          <button_1.Button size="sm" onClick={createNewConversation} className="h-8 w-8 p-0">
            <lucide_react_1.Plus className="h-4 w-4" />
          </button_1.Button>
        </div>
        <separator_1.Separator className="mt-2" />
      </card_1.CardHeader>

      <card_1.CardContent className="flex-1 p-0">
        <scroll_area_1.ScrollArea className="h-full px-3">
          {loading
            ? <div className="space-y-3 py-4">
                {__spreadArray([], Array(5), true).map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
                ))}
              </div>
            : conversations.length === 0
              ? <div className="text-center text-muted-foreground py-8">
                  <lucide_react_1.MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma conversa ainda</p>
                  <p className="text-xs">Clique em + para começar</p>
                </div>
              : <div className="space-y-2 py-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={"group p-3 rounded-lg cursor-pointer transition-colors border ".concat(
                        selectedConversationId === conversation.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-transparent",
                      )}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{conversation.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <badge_1.Badge
                              variant="secondary"
                              className={"text-xs ".concat(
                                getModelBadgeColor(conversation.model_used),
                              )}
                            >
                              {getModelName(conversation.model_used)}
                            </badge_1.Badge>
                            <span className="text-xs text-muted-foreground">
                              {conversation.message_count} mensagens
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <lucide_react_1.Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {(0, date_fns_1.formatDistanceToNow)(
                                new Date(conversation.updated_at),
                                {
                                  addSuffix: true,
                                  locale: locale_1.ptBR,
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <lucide_react_1.MoreVertical className="h-3 w-3" />
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                            <dropdown_menu_1.DropdownMenuItem>
                              <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                              Renomear
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conversation.id);
                              }}
                            >
                              <lucide_react_1.Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>}
        </scroll_area_1.ScrollArea>
      </card_1.CardContent>
    </card_1.Card>
  );
}
