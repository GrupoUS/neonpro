// Tax Calculator Component
// Story 5.5: Interactive tax calculation tool
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TaxCalculator;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function TaxCalculator(_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)({
      valor_base: "",
      tipo_servico: "",
      codigo_servico: "",
      regime_tributario: "",
    }),
    formData = _b[0],
    setFormData = _b[1];
  var _c = (0, react_1.useState)(null),
    calculation = _c[0],
    setCalculation = _c[1];
  var _d = (0, react_1.useState)(false),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var serviceTypes = [
    "Consulta Médica",
    "Exame Laboratorial",
    "Procedimento Cirúrgico",
    "Fisioterapia",
    "Psicologia",
    "Nutrição",
    "Outros",
  ];
  var taxRegimes = [
    { value: "simples_nacional", label: "Simples Nacional" },
    { value: "lucro_presumido", label: "Lucro Presumido" },
    { value: "lucro_real", label: "Lucro Real" },
  ];
  var handleInputChange = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
    setError(null);
  };
  var calculateTaxes = () =>
    __awaiter(this, void 0, void 0, function () {
      var valorBase, requestData, response, errorData, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            setError(null);
            valorBase = parseFloat(formData.valor_base);
            if (isNaN(valorBase) || valorBase <= 0) {
              throw new Error("Valor base deve ser um número positivo");
            }
            if (!formData.tipo_servico) {
              throw new Error("Tipo de serviço é obrigatório");
            }
            requestData = {
              clinic_id: clinicId,
              valor_base: valorBase,
              tipo_servico: formData.tipo_servico,
              codigo_servico: formData.codigo_servico || undefined,
              regime_tributario: formData.regime_tributario || undefined,
            };
            return [
              4 /*yield*/,
              fetch("/api/tax/calculate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
              }),
            ];
          case 1:
            response = _a.sent();
            if (response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            errorData = _a.sent();
            throw new Error(errorData.error || "Erro no cálculo");
          case 3:
            return [4 /*yield*/, response.json()];
          case 4:
            data = _a.sent();
            setCalculation(data.data);
            return [3 /*break*/, 7];
          case 5:
            err_1 = _a.sent();
            console.error("Error calculating taxes:", err_1);
            setError(err_1 instanceof Error ? err_1.message : "Erro desconhecido");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  var handleSubmit = (e) => {
    e.preventDefault();
    calculateTaxes();
  };
  var resetForm = () => {
    setFormData({
      valor_base: "",
      tipo_servico: "",
      codigo_servico: "",
      regime_tributario: "",
    });
    setCalculation(null);
    setError(null);
  };
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center space-x-2">
            <lucide_react_1.Calculator className="h-5 w-5" />
            <span>Calculadora de Impostos</span>
          </card_1.CardTitle>
          <card_1.CardDescription>
            Calcule os impostos para serviços de saúde de acordo com a legislação brasileira
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="valor_base">Valor Base (R$)</label_1.Label>
                <input_1.Input
                  id="valor_base"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor_base}
                  onChange={(e) => handleInputChange("valor_base", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="tipo_servico">Tipo de Serviço</label_1.Label>
                <select_1.Select
                  onValueChange={(value) => handleInputChange("tipo_servico", value)}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione o serviço" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {serviceTypes.map((service) => (
                      <select_1.SelectItem key={service} value={service}>
                        {service}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="codigo_servico">Código do Serviço (opcional)</label_1.Label>
                <input_1.Input
                  id="codigo_servico"
                  placeholder="Ex: 04.01"
                  value={formData.codigo_servico}
                  onChange={(e) => handleInputChange("codigo_servico", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="regime_tributario">
                  Regime Tributário (opcional)
                </label_1.Label>
                <select_1.Select
                  onValueChange={(value) => handleInputChange("regime_tributario", value)}
                >
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Usar configuração da clínica" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {taxRegimes.map((regime) => (
                      <select_1.SelectItem key={regime.value} value={regime.value}>
                        {regime.label}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <lucide_react_1.AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button_1.Button type="submit" disabled={loading}>
                {loading
                  ? <>
                      <lucide_react_1.RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculando...
                    </>
                  : <>
                      <lucide_react_1.Calculator className="h-4 w-4 mr-2" />
                      Calcular Impostos
                    </>}
              </button_1.Button>
              <button_1.Button type="button" variant="outline" onClick={resetForm}>
                Limpar
              </button_1.Button>
            </div>
          </form>
        </card_1.CardContent>
      </card_1.Card>

      {/* Results */}
      {calculation && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center space-x-2">
              <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600" />
              <span>Resultado do Cálculo</span>
            </card_1.CardTitle>
            <card_1.CardDescription>
              Calculado em {new Date(calculation.calculated_at).toLocaleString()}
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <lucide_react_1.DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Valor Base</span>
                </div>
                <p className="text-2xl font-bold">
                  {(0, utils_1.formatCurrency)(calculation.valor_base)}
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <lucide_react_1.Percent className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Total Impostos</span>
                </div>
                <p className="text-2xl font-bold">
                  {(0, utils_1.formatCurrency)(calculation.total_taxes)}
                </p>
                <p className="text-sm text-red-600">
                  {(0, utils_1.formatPercentage)(calculation.effective_rate)} do valor base
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Valor Líquido</span>
                </div>
                <p className="text-2xl font-bold">
                  {(0, utils_1.formatCurrency)(calculation.valor_liquido)}
                </p>
              </div>
            </div>

            <separator_1.Separator />

            {/* Tax Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Detalhamento dos Impostos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(calculation.tax_breakdown)
                  .filter((_a) => {
                    var _ = _a[0],
                      value = _a[1];
                    return value > 0;
                  })
                  .map((_a) => {
                    var tax = _a[0],
                      value = _a[1];
                    return (
                      <div key={tax} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium uppercase">
                            {tax.replace("_", " ")}
                          </span>
                          <badge_1.Badge variant="secondary">
                            {(0, utils_1.formatPercentage)((value / calculation.valor_base) * 100)}
                          </badge_1.Badge>
                        </div>
                        <p className="text-lg font-semibold">
                          {(0, utils_1.formatCurrency)(value)}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <lucide_react_1.Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Informações Adicionais</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Regime tributário:{" "}
                      {calculation.regime_tributario.replace("_", " ").toUpperCase()}
                    </li>
                    <li>• Tipo de serviço: {calculation.service_type}</li>
                    {calculation.service_code && (
                      <li>• Código do serviço: {calculation.service_code}</li>
                    )}
                    <li>
                      • Carga tributária efetiva:{" "}
                      {(0, utils_1.formatPercentage)(calculation.effective_rate)}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
