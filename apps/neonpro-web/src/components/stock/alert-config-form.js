// Stock Alert Configuration Form Component
// Story 11.4: Alertas e Relatórios de Estoque
// Formulário para criar e editar configurações de alertas
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_1 = require("@/components/ui/alert");
var form_1 = require("@/components/ui/form");
var lucide_react_1 = require("lucide-react");
var stock_1 = require("@/app/lib/types/stock");
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
var getNotificationIcon = function (channel) {
  var iconProps = { className: "h-4 w-4" };
  switch (channel) {
    case "in_app":
      return <lucide_react_1.Bell {...iconProps} />;
    case "email":
      return <lucide_react_1.Mail {...iconProps} />;
    case "whatsapp":
      return <lucide_react_1.MessageSquare {...iconProps} />;
    case "sms":
      return <lucide_react_1.Smartphone {...iconProps} />;
    default:
      return <lucide_react_1.Bell {...iconProps} />;
  }
};
// =====================================================
// MAIN COMPONENT
// =====================================================
var AlertConfigForm = function (_a) {
  var onSubmit = _a.onSubmit,
    onCancel = _a.onCancel,
    initialData = _a.initialData,
    _b = _a.products,
    products = _b === void 0 ? [] : _b,
    _c = _a.categories,
    categories = _c === void 0 ? [] : _c,
    _d = _a.loading,
    loading = _d === void 0 ? false : _d;
  var _e = (0, react_1.useState)(null),
    submitError = _e[0],
    setSubmitError = _e[1];
  var _f = (0, react_1.useState)("global"),
    selectedScope = _f[0],
    setSelectedScope = _f[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(
      stock_1.StockAlertConfigSchema.omit({
        id: true,
        clinicId: true,
        createdAt: true,
        updatedAt: true,
      }),
    ),
    defaultValues: __assign(
      {
        alertType: "low_stock",
        thresholdValue: 10,
        thresholdUnit: "quantity",
        severityLevel: "medium",
        isActive: true,
        notificationChannels: ["in_app"],
      },
      initialData,
    ),
  });
  // =====================================================
  // EFFECTS
  // =====================================================
  (0, react_1.useEffect)(
    function () {
      if (initialData === null || initialData === void 0 ? void 0 : initialData.productId) {
        setSelectedScope("product");
      } else if (initialData === null || initialData === void 0 ? void 0 : initialData.categoryId) {
        setSelectedScope("category");
      } else {
        setSelectedScope("global");
      }
    },
    [initialData],
  );
  // Reset product/category fields when scope changes
  (0, react_1.useEffect)(
    function () {
      if (selectedScope === "global") {
        form.setValue("productId", undefined);
        form.setValue("categoryId", undefined);
      } else if (selectedScope === "product") {
        form.setValue("categoryId", undefined);
      } else if (selectedScope === "category") {
        form.setValue("productId", undefined);
      }
    },
    [selectedScope, form],
  );
  // =====================================================
  // FORM HANDLERS
  // =====================================================
  var handleSubmit = function (data) {
    return __awaiter(void 0, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            setSubmitError(null);
            return [4 /*yield*/, onSubmit(data)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            if (error_1 instanceof stock_1.StockAlertError) {
              setSubmitError(error_1.message);
            } else if (error_1 instanceof Error) {
              setSubmitError(error_1.message);
            } else {
              setSubmitError("Falha ao salvar configuração de alerta");
            }
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleNotificationChannelChange = function (channel, checked) {
    var currentChannels = form.getValues("notificationChannels") || [];
    if (checked) {
      if (!currentChannels.includes(channel)) {
        form.setValue(
          "notificationChannels",
          __spreadArray(__spreadArray([], currentChannels, true), [channel], false),
        );
      }
    } else {
      form.setValue(
        "notificationChannels",
        currentChannels.filter(function (c) {
          return c !== channel;
        }),
      );
    }
  };
  // =====================================================
  // RENDER
  // =====================================================
  return (
    <card_1.Card className="w-full max-w-2xl mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.AlertTriangle className="h-5 w-5" />
          {initialData ? "Editar Configuração de Alerta" : "Nova Configuração de Alerta"}
        </card_1.CardTitle>
        <card_1.CardDescription>
          Configure alertas automáticos para monitorar níveis de estoque e vencimentos
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {submitError && (
              <alert_1.Alert variant="destructive">
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>{submitError}</alert_1.AlertDescription>
              </alert_1.Alert>
            )}

            {/* Scope Selection */}
            <div className="space-y-3">
              <label_1.Label className="text-sm font-medium">Escopo do Alerta</label_1.Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-global"
                    name="scope"
                    value="global"
                    checked={selectedScope === "global"}
                    onChange={function (e) {
                      return e.target.checked && setSelectedScope("global");
                    }}
                    className="radio"
                  />
                  <label_1.Label htmlFor="scope-global" className="cursor-pointer">
                    Global
                  </label_1.Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-product"
                    name="scope"
                    value="product"
                    checked={selectedScope === "product"}
                    onChange={function (e) {
                      return e.target.checked && setSelectedScope("product");
                    }}
                    className="radio"
                  />
                  <label_1.Label htmlFor="scope-product" className="cursor-pointer">
                    Produto
                  </label_1.Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="scope-category"
                    name="scope"
                    value="category"
                    checked={selectedScope === "category"}
                    onChange={function (e) {
                      return e.target.checked && setSelectedScope("category");
                    }}
                    className="radio"
                  />
                  <label_1.Label htmlFor="scope-category" className="cursor-pointer">
                    Categoria
                  </label_1.Label>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            {selectedScope === "product" && (
              <form_1.FormField
                control={form.control}
                name="productId"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Produto</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione um produto" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {products.map(function (product) {
                            return (
                              <select_1.SelectItem key={product.id} value={product.id}>
                                {product.name} {product.sku && "(".concat(product.sku, ")")}
                              </select_1.SelectItem>
                            );
                          })}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            )}

            {/* Category Selection */}
            {selectedScope === "category" && (
              <form_1.FormField
                control={form.control}
                name="categoryId"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Categoria</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione uma categoria" />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {categories.map(function (category) {
                            return (
                              <select_1.SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </select_1.SelectItem>
                            );
                          })}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            )}

            {/* Alert Type */}
            <form_1.FormField
              control={form.control}
              name="alertType"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Tipo de Alerta</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {Object.entries(stock_1.ALERT_TYPE_LABELS).map(function (_a) {
                          var value = _a[0],
                            label = _a[1];
                          return (
                            <select_1.SelectItem key={value} value={value}>
                              {label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Threshold Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <form_1.FormField
                control={form.control}
                name="thresholdValue"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Valor Limite</form_1.FormLabel>
                      <form_1.FormControl>
                        <input_1.Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={function (e) {
                            return field.onChange(parseFloat(e.target.value) || 0);
                          }}
                        />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="thresholdUnit"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem>
                      <form_1.FormLabel>Unidade</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          {Object.entries(stock_1.THRESHOLD_UNIT_LABELS).map(function (_a) {
                            var value = _a[0],
                              label = _a[1];
                            return (
                              <select_1.SelectItem key={value} value={value}>
                                {label}
                              </select_1.SelectItem>
                            );
                          })}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </div>

            {/* Severity Level */}
            <form_1.FormField
              control={form.control}
              name="severityLevel"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem>
                    <form_1.FormLabel>Nível de Severidade</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {Object.entries(stock_1.SEVERITY_LABELS).map(function (_a) {
                          var value = _a[0],
                            label = _a[1];
                          return (
                            <select_1.SelectItem key={value} value={value}>
                              {label}
                            </select_1.SelectItem>
                          );
                        })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>
                );
              }}
            />

            {/* Notification Channels */}
            <div className="space-y-3">
              <label_1.Label className="text-sm font-medium">Canais de Notificação</label_1.Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stock_1.NOTIFICATION_CHANNEL_LABELS).map(function (_a) {
                  var _b;
                  var channel = _a[0],
                    label = _a[1];
                  return (
                    <div key={channel} className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id={"channel-".concat(channel)}
                        checked={
                          (_b = form.getValues("notificationChannels")) === null || _b === void 0
                            ? void 0
                            : _b.includes(channel)
                        }
                        onCheckedChange={function (checked) {
                          return handleNotificationChannelChange(channel, !!checked);
                        }}
                      />
                      <label_1.Label
                        htmlFor={"channel-".concat(channel)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {getNotificationIcon(channel)}
                        {label}
                      </label_1.Label>
                    </div>
                  );
                })}
              </div>
              {form.formState.errors.notificationChannels && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.notificationChannels.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <form_1.FormField
              control={form.control}
              name="isActive"
              render={function (_a) {
                var field = _a.field;
                return (
                  <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <form_1.FormLabel className="text-base">Ativo</form_1.FormLabel>
                      <form_1.FormDescription>
                        O alerta será processado automaticamente quando ativo
                      </form_1.FormDescription>
                    </div>
                    <form_1.FormControl>
                      <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                    </form_1.FormControl>
                  </form_1.FormItem>
                );
              }}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button_1.Button type="button" variant="outline" onClick={onCancel}>
                <lucide_react_1.X className="h-4 w-4 mr-2" />
                Cancelar
              </button_1.Button>
              <button_1.Button type="submit" disabled={loading}>
                <lucide_react_1.Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Configuração"}
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </card_1.CardContent>
    </card_1.Card>
  );
};
exports.default = AlertConfigForm;
