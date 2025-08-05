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
exports.ProfessionalSelection = ProfessionalSelection;
var client_1 = require("@/app/utils/supabase/client");
var alert_1 = require("@/components/ui/alert");
var avatar_1 = require("@/components/ui/avatar");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function ProfessionalSelection(_a) {
  var _this = this;
  var serviceId = _a.serviceId,
    selectedProfessional = _a.selectedProfessional,
    onProfessionalSelect = _a.onProfessionalSelect,
    _b = _a.allowAnyProfessional,
    allowAnyProfessional = _b === void 0 ? true : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c;
  var _d = (0, react_1.useState)([]),
    professionals = _d[0],
    setProfessionals = _d[1];
  var _e = (0, react_1.useState)(true),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(""),
    error = _f[0],
    setError = _f[1];
  (0, react_1.useEffect)(
    function () {
      if (serviceId) {
        fetchProfessionals();
      }
    },
    [serviceId],
  );
  var fetchProfessionals = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var supabase, _a, data, fetchError, err_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, 3, 4]);
            supabase = (0, client_1.createClient)();
            return [
              4 /*yield*/,
              supabase.rpc("get_professionals_for_service", {
                p_service_id: serviceId,
              }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (fetchError = _a.error);
            if (fetchError) throw fetchError;
            setProfessionals(data || []);
            return [3 /*break*/, 4];
          case 2:
            err_1 = _b.sent();
            console.error("Error fetching professionals:", err_1);
            setError("Erro ao carregar profissionais. Tente novamente.");
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
  var getInitials = function (name) {
    return name
      .split(" ")
      .map(function (n) {
        return n[0];
      })
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  var renderStars = function (rating) {
    if (!rating) return null;
    var stars = [];
    var fullStars = Math.floor(rating);
    var hasHalfStar = rating % 1 !== 0;
    for (var i = 0; i < fullStars; i++) {
      stars.push(
        <lucide_react_1.Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <lucide_react_1.Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />,
      );
    }
    var emptyStars = 5 - Math.ceil(rating);
    for (var i = 0; i < emptyStars; i++) {
      stars.push(
        <lucide_react_1.Star key={"empty-".concat(i)} className="h-4 w-4 text-gray-300" />,
      );
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Escolha o Profissional</h2>
        <p className="text-gray-600">
          Selecione um profissional específico ou deixe que escolhamos o melhor disponível
        </p>
      </div>

      {/* Any Professional Option */}
      {allowAnyProfessional && (
        <card_1.Card
          className={"cursor-pointer transition-all hover:shadow-md ".concat(
            selectedProfessional === null
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:border-blue-300",
          )}
          onClick={function () {
            return onProfessionalSelect(null);
          }}
          role="button"
          tabIndex={0}
          aria-pressed={selectedProfessional === null}
          onKeyDown={function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onProfessionalSelect(null);
            }
          }}
        >
          <card_1.CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-4">
              <lucide_react_1.User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Qualquer Profissional Disponível
              </h3>
              <p className="text-gray-600 text-sm">
                Escolheremos automaticamente o melhor profissional disponível para seu horário
              </p>
              {selectedProfessional === null && (
                <badge_1.Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
                  Selecionado
                </badge_1.Badge>
              )}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map(function (professional) {
          return (
            <card_1.Card
              key={professional.id}
              className={"cursor-pointer transition-all hover:shadow-md "
                .concat(
                  (selectedProfessional === null || selectedProfessional === void 0
                    ? void 0
                    : selectedProfessional.id) === professional.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:border-blue-300",
                  " ",
                )
                .concat(!professional.is_available ? "opacity-60" : "")}
              onClick={function () {
                if (professional.is_available) {
                  onProfessionalSelect(professional);
                }
              }}
              role="button"
              tabIndex={professional.is_available ? 0 : -1}
              aria-pressed={
                (selectedProfessional === null || selectedProfessional === void 0
                  ? void 0
                  : selectedProfessional.id) === professional.id
              }
              aria-disabled={!professional.is_available}
              onKeyDown={function (e) {
                if ((e.key === "Enter" || e.key === " ") && professional.is_available) {
                  e.preventDefault();
                  onProfessionalSelect(professional);
                }
              }}
            >
              <card_1.CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <avatar_1.Avatar className="w-16 h-16">
                      <avatar_1.AvatarImage
                        src={professional.avatar_url || undefined}
                        alt={"Foto de ".concat(professional.name)}
                      />
                      <avatar_1.AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                        {getInitials(professional.name)}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    {!professional.is_available && (
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                        <badge_1.Badge variant="secondary" className="text-xs px-1">
                          Indisponível
                        </badge_1.Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                      {(selectedProfessional === null || selectedProfessional === void 0
                        ? void 0
                        : selectedProfessional.id) === professional.id && (
                        <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Selecionado
                        </badge_1.Badge>
                      )}
                    </div>

                    {professional.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {professional.specialties.slice(0, 3).map(function (specialty) {
                          return (
                            <badge_1.Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </badge_1.Badge>
                          );
                        })}
                        {professional.specialties.length > 3 && (
                          <badge_1.Badge variant="outline" className="text-xs">
                            +{professional.specialties.length - 3}
                          </badge_1.Badge>
                        )}
                      </div>
                    )}

                    {professional.rating && renderStars(professional.rating)}

                    {professional.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <lucide_react_1.MapPin className="h-4 w-4 mr-1" />
                        <span>{professional.location}</span>
                      </div>
                    )}

                    {professional.bio && (
                      <p className="text-gray-600 text-sm line-clamp-2">{professional.bio}</p>
                    )}
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {professionals.length === 0 && (
        <card_1.Card className="p-6 text-center">
          <lucide_react_1.User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum profissional encontrado</h3>
          <p className="text-gray-600">
            Não há profissionais disponíveis para este serviço no momento.
          </p>
          <button_1.Button variant="outline" onClick={fetchProfessionals} className="mt-4">
            Atualizar Lista
          </button_1.Button>
        </card_1.Card>
      )}

      {/* Info about professional selection */}
      <alert_1.Alert className="border-blue-200 bg-blue-50">
        <lucide_react_1.User className="h-4 w-4" />
        <alert_1.AlertDescription className="text-blue-700">
          Você pode escolher um profissional específico ou deixar que selecionemos automaticamente
          com base na disponibilidade e especialização.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    </div>
  );
}
