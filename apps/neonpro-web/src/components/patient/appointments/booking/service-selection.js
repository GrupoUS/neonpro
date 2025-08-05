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
exports.ServiceSelection = ServiceSelection;
var client_1 = require("@/app/utils/supabase/client");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function ServiceSelection(_a) {
  var _this = this;
  var selectedService = _a.selectedService,
    onServiceSelect = _a.onServiceSelect,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  var _c = (0, react_1.useState)([]),
    services = _c[0],
    setServices = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(""),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedCategory = _f[0],
    setSelectedCategory = _f[1];
  (0, react_1.useEffect)(function () {
    fetchServices();
  }, []);
  var fetchServices = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var supabase, _a, data, fetchError, err_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            supabase = (0, client_1.createClient)();
            return [
              4 /*yield*/,
              supabase
                .from("services")
                .select("*")
                .eq("is_active", true)
                .order("category", { ascending: true })
                .order("name", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
            if (fetchError) throw fetchError;
            setServices(data || []);
            return [3 /*break*/, 4];
          case 2:
            err_1 = _b.sent();
            console.error("Error fetching services:", err_1);
            setError("Erro ao carregar serviços. Tente novamente.");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var categories = __spreadArray(
    ["all"],
    new Set(
      services.map(function (service) {
        return service.category;
      }),
    ),
    true,
  );
  var filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter(function (service) {
          return service.category === selectedCategory;
        });
  if (loading) {
    return (
      <div className={"flex justify-center p-8 ".concat(className)}>
        <loading_spinner_1.LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert className={"".concat(className, " border-red-200 bg-red-50")}>
        <alert_1.AlertDescription className="text-red-700">{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Escolha o Serviço</h2>
        <p className="text-gray-600">
          Selecione o serviço desejado para continuar com o agendamento
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(function (category) {
          return (
            <button_1.Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={function () {
                return setSelectedCategory(category);
              }}
              className="capitalize"
            >
              {category === "all" ? "Todos" : category}
            </button_1.Button>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(function (service) {
          return (
            <card_1.Card
              key={service.id}
              className={"cursor-pointer transition-all hover:shadow-md ".concat(
                (selectedService === null || selectedService === void 0
                  ? void 0
                  : selectedService.id) === service.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:border-blue-300",
              )}
              onClick={function () {
                return onServiceSelect(service);
              }}
              role="button"
              tabIndex={0}
              aria-pressed={
                (selectedService === null || selectedService === void 0
                  ? void 0
                  : selectedService.id) === service.id
              }
              onKeyDown={function (e) {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onServiceSelect(service);
                }
              }}
            >
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-lg flex items-center justify-between">
                  <span>{service.name}</span>
                  {(selectedService === null || selectedService === void 0
                    ? void 0
                    : selectedService.id) === service.id && (
                    <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Selecionado
                    </badge_1.Badge>
                  )}
                </card_1.CardTitle>
                <badge_1.Badge variant="outline" className="w-fit capitalize">
                  {service.category}
                </badge_1.Badge>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <p className="text-gray-600 text-sm">{service.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <lucide_react_1.Clock className="h-4 w-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <lucide_react_1.DollarSign className="h-4 w-4" />
                    <span>R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8">
          <lucide_react_1.User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {selectedCategory === "all"
              ? "Nenhum serviço disponível no momento"
              : 'Nenhum servi\u00E7o encontrado na categoria "'.concat(selectedCategory, '"')}
          </p>
        </div>
      )}
    </div>
  );
}
