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
exports.ConsentFormsManager = ConsentFormsManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var consent_service_1 = require("@/app/services/consent.service");
var lucide_react_1 = require("lucide-react");
var use_toast_1 = require("@/hooks/use-toast");
function ConsentFormsManager(_a) {
  var clinicId = _a.clinicId,
    userRole = _a.userRole;
  var _b = (0, react_1.useState)([]),
    consentForms = _b[0],
    setConsentForms = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedForm = _d[0],
    setSelectedForm = _d[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var consentService = new consent_service_1.ConsentService();
  (0, react_1.useEffect)(() => {
    loadConsentForms();
  }, [clinicId]);
  var loadConsentForms = () =>
    __awaiter(this, void 0, void 0, function () {
      var forms, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, consentService.getConsentForms(clinicId)];
          case 1:
            forms = _a.sent();
            setConsentForms(forms);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Error loading consent forms:", error_1);
            toast({
              title: "Erro",
              description: "Não foi possível carregar os formulários de consentimento.",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var handleArchiveForm = (formId) =>
    __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, consentService.deactivateConsentForm(formId)];
          case 1:
            _a.sent();
            toast({
              title: "Sucesso",
              description: "Formulário arquivado com sucesso.",
            });
            loadConsentForms();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error archiving form:", error_2);
            toast({
              title: "Erro",
              description: "Não foi possível arquivar o formulário.",
              variant: "destructive",
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getConsentTypeLabel = (type) => {
    var labels = {
      data_processing: "Processamento de Dados",
      medical_treatment: "Tratamento Médico",
      marketing: "Marketing",
      research: "Pesquisa",
      data_sharing: "Compartilhamento de Dados",
      telehealth: "Telemedicina",
      photography: "Fotografias",
      communication: "Comunicação",
    };
    return labels[type] || type;
  };
  var getLegalBasisLabel = (basis) => {
    var labels = {
      consent: "Consentimento",
      legitimate_interest: "Interesse Legítimo",
      vital_interests: "Interesses Vitais",
      legal_obligation: "Obrigação Legal",
      public_task: "Tarefa Pública",
      contract: "Contrato",
    };
    return basis ? labels[basis] || basis : "N/A";
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Formulários de Consentimento</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie formulários de consentimento para conformidade com LGPD
          </p>
        </div>
        {userRole === "admin" && (
          <button_1.Button>
            <lucide_react_1.Plus className="w-4 h-4 mr-2" />
            Novo Formulário
          </button_1.Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Formulários</p>
                <p className="text-2xl font-bold">{consentForms.length}</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Shield className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold">
                  {consentForms.filter((f) => f.is_active).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Com Auto-Expiração</p>
                <p className="text-2xl font-bold">
                  {consentForms.filter((f) => f.auto_expire).length}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Users className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Tipos de Consentimento</p>
                <p className="text-2xl font-bold">
                  {new Set(consentForms.map((f) => f.consent_type)).size}
                </p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Consent Forms List */}
      <div className="grid gap-4">
        {consentForms.length === 0
          ? <card_1.Card>
              <card_1.CardContent className="p-8 text-center">
                <lucide_react_1.FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum formulário encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro formulário de consentimento.
                </p>
                {userRole === "admin" && (
                  <button_1.Button>
                    <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Formulário
                  </button_1.Button>
                )}
              </card_1.CardContent>
            </card_1.Card>
          : consentForms.map((form) => (
              <card_1.Card key={form.id} className="hover:shadow-md transition-shadow">
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="text-lg">{form.form_name}</card_1.CardTitle>
                      <card_1.CardDescription className="mt-1">
                        {form.consent_type}
                      </card_1.CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge
                        variant={form.is_active ? "default" : "secondary"}
                        className={form.is_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {form.is_active ? "Ativo" : "Inativo"}
                      </badge_1.Badge>
                      <badge_1.Badge variant="outline">
                        {getConsentTypeLabel(form.consent_type)}
                      </badge_1.Badge>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Base Legal</p>
                      <p>{getLegalBasisLabel(form.legal_basis)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Versão</p>
                      <p>{form.form_version}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Auto-Expiração</p>
                      <p>{form.auto_expire ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Criado em</p>
                      <p>{new Date(form.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  {form.auto_expire && form.retention_period_days && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <lucide_react_1.Calendar className="w-4 h-4 inline mr-1" />
                        Expira automaticamente em {form.retention_period_days} dias após
                        consentimento
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Última atualização: {new Date(form.updated_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button_1.Button variant="outline" size="sm">
                        <lucide_react_1.Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </button_1.Button>
                      {userRole === "admin" && (
                        <>
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Edit className="w-4 h-4 mr-1" />
                            Editar
                          </button_1.Button>
                          {form.is_active && (
                            <button_1.Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveForm(form.id)}
                            >
                              <lucide_react_1.Archive className="w-4 h-4 mr-1" />
                              Arquivar
                            </button_1.Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
      </div>
    </div>
  );
}
