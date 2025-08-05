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
exports.default = ErrorMessagesDisplay;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var collapsible_1 = require("@/components/ui/collapsible");
var scroll_area_1 = require("@/components/ui/scroll-area");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var getMessageIcon = (type) => {
  switch (type) {
    case "error":
      return <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <lucide_react_1.Info className="h-4 w-4 text-blue-500" />;
    case "success":
      return <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <lucide_react_1.AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};
var getMessageVariant = (type) => {
  switch (type) {
    case "error":
      return "destructive";
    case "warning":
      return "default";
    case "info":
      return "default";
    case "success":
      return "default";
    default:
      return "default";
  }
};
var getMessageColors = (type) => {
  switch (type) {
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    default:
      return "border-gray-200 bg-gray-50 text-gray-800";
  }
};
var MessageCard = (_a) => {
  var _b, _c, _d, _e;
  var message = _a.message,
    onRemove = _a.onRemove,
    showProgressiveDisclosure = _a.showProgressiveDisclosure,
    isRetrying = _a.isRetrying;
  var _f = (0, react_1.useState)(false),
    isExpanded = _f[0],
    setIsExpanded = _f[1];
  var _g = (0, react_1.useState)(null),
    isExecutingAction = _g[0],
    setIsExecutingAction = _g[1];
  var handleActionClick = (actionIndex) =>
    __awaiter(void 0, void 0, void 0, function () {
      var action, error_1;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            action = (_a = message.actions) === null || _a === void 0 ? void 0 : _a[actionIndex];
            if (!action) return [2 /*return*/];
            setIsExecutingAction("action-".concat(actionIndex));
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, action.action()];
          case 2:
            _b.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _b.sent();
            console.error("Error executing action:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setIsExecutingAction(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var hasExpandableContent =
    message.details ||
    message.context ||
    (showProgressiveDisclosure &&
      (((_b = message.context) === null || _b === void 0 ? void 0 : _b.metadata) ||
        ((_c = message.context) === null || _c === void 0 ? void 0 : _c.component)));
  return (
    <card_1.Card className={"mb-3 ".concat(getMessageColors(message.type))}>
      <card_1.CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getMessageIcon(message.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{message.title}</h4>
                <badge_1.Badge variant="outline" className="text-xs">
                  {(0, date_fns_1.format)(message.timestamp, "HH:mm", { locale: locale_1.ptBR })}
                </badge_1.Badge>
              </div>

              <p className="text-sm mb-3">{message.message}</p>

              {/* Context Information */}
              {message.context && (
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  {message.context.component && (
                    <div className="flex items-center gap-1">
                      <lucide_react_1.MapPin className="h-3 w-3" />
                      <span>{message.context.component}</span>
                    </div>
                  )}
                  {message.context.operation && (
                    <div className="flex items-center gap-1">
                      <lucide_react_1.Clock className="h-3 w-3" />
                      <span>{message.context.operation}</span>
                    </div>
                  )}
                  {message.context.userId && (
                    <div className="flex items-center gap-1">
                      <lucide_react_1.User className="h-3 w-3" />
                      <span>ID: {message.context.userId.slice(-6)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progressive Disclosure */}
              {hasExpandableContent && showProgressiveDisclosure && (
                <collapsible_1.Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <collapsible_1.CollapsibleTrigger asChild>
                    <button_1.Button variant="ghost" size="sm" className="h-6 p-0 text-xs">
                      {isExpanded
                        ? <>
                            <lucide_react_1.ChevronUp className="h-3 w-3 mr-1" />
                            Menos detalhes
                          </>
                        : <>
                            <lucide_react_1.ChevronDown className="h-3 w-3 mr-1" />
                            Mais detalhes
                          </>}
                    </button_1.Button>
                  </collapsible_1.CollapsibleTrigger>
                  <collapsible_1.CollapsibleContent className="mt-2 pt-2 border-t border-current/20">
                    {message.details && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">Detalhes:</p>
                        <p className="text-xs text-gray-600">{message.details}</p>
                      </div>
                    )}

                    {((_d = message.context) === null || _d === void 0 ? void 0 : _d.metadata) && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">Informações Técnicas:</p>
                        <pre className="text-xs bg-black/5 p-2 rounded text-gray-600 overflow-x-auto">
                          {JSON.stringify(message.context.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {((_e = message.context) === null || _e === void 0
                      ? void 0
                      : _e.appointmentId) && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">ID do Agendamento:</p>
                        <code className="text-xs bg-black/5 px-1 py-0.5 rounded">
                          {message.context.appointmentId}
                        </code>
                      </div>
                    )}
                  </collapsible_1.CollapsibleContent>
                </collapsible_1.Collapsible>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action, index) => {
                    var isLoading =
                      isExecutingAction === "action-".concat(index) ||
                      (isRetrying && action.label.includes("Tentar"));
                    return (
                      <button_1.Button
                        key={index}
                        size="sm"
                        variant={
                          action.variant === "primary"
                            ? "default"
                            : action.variant === "destructive"
                              ? "destructive"
                              : "outline"
                        }
                        onClick={() => handleActionClick(index)}
                        disabled={isLoading || Boolean(isExecutingAction)}
                        className="h-7 text-xs"
                      >
                        {isLoading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                        )}
                        {action.label}
                      </button_1.Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          {message.dismissible && (
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(message.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 ml-2"
            >
              <lucide_react_1.X className="h-3 w-3" />
            </button_1.Button>
          )}
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
};
function ErrorMessagesDisplay(_a) {
  var messages = _a.messages,
    onRemoveMessage = _a.onRemoveMessage,
    onClearAll = _a.onClearAll,
    _b = _a.isRetrying,
    isRetrying = _b === void 0 ? false : _b,
    _c = _a.showProgressiveDisclosure,
    showProgressiveDisclosure = _c === void 0 ? true : _c,
    _d = _a.maxHeight,
    maxHeight = _d === void 0 ? "400px" : _d;
  if (messages.length === 0) return null;
  var errorCount = messages.filter((m) => m.type === "error").length;
  var warningCount = messages.filter((m) => m.type === "warning").length;
  var infoCount = messages.filter((m) => m.type === "info").length;
  var successCount = messages.filter((m) => m.type === "success").length;
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <lucide_react_1.AlertCircle className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm text-gray-900">Mensagens do Sistema</span>
          </div>

          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <badge_1.Badge variant="destructive" className="text-xs">
                {errorCount} erro(s)
              </badge_1.Badge>
            )}
            {warningCount > 0 && (
              <badge_1.Badge variant="default" className="text-xs">
                {warningCount} aviso(s)
              </badge_1.Badge>
            )}
            {infoCount > 0 && (
              <badge_1.Badge variant="secondary" className="text-xs">
                {infoCount} info
              </badge_1.Badge>
            )}
            {successCount > 0 && (
              <badge_1.Badge variant="outline" className="text-xs text-green-600">
                {successCount} sucesso
              </badge_1.Badge>
            )}
          </div>
        </div>

        {messages.length > 1 && (
          <button_1.Button variant="outline" size="sm" onClick={onClearAll} className="h-7 text-xs">
            Limpar Tudo
          </button_1.Button>
        )}
      </div>

      {/* Messages */}
      <scroll_area_1.ScrollArea style={{ maxHeight: maxHeight }}>
        <div className="space-y-0">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onRemove={onRemoveMessage}
              showProgressiveDisclosure={showProgressiveDisclosure}
              isRetrying={isRetrying}
            />
          ))}
        </div>
      </scroll_area_1.ScrollArea>

      {/* Help Footer */}
      {showProgressiveDisclosure && messages.some((m) => m.type === "error") && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <lucide_react_1.HelpCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Precisa de Ajuda?</p>
              <p className="text-xs">
                Se os problemas persistirem, entre em contato com o suporte técnico ou consulte
                nossa documentação de ajuda.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
