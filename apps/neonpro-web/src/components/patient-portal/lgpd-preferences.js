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
exports.LgpdPreferences = LgpdPreferences;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var switch_1 = require("@/components/ui/switch");
var label_1 = require("@/components/ui/label");
var separator_1 = require("@/components/ui/separator");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var consentPreferences = [
  {
    id: "1",
    title: "Processamento de Dados Médicos",
    description:
      "Autoriza o processamento dos seus dados de saúde para prestação de cuidados médicos, diagnósticos e tratamentos.",
    enabled: true,
    required: true,
    category: "essential",
  },
  {
    id: "2",
    title: "Comunicações sobre Consultas",
    description:
      "Permite o envio de lembretes de consultas, resultados de exames e orientações médicas via SMS, email ou WhatsApp.",
    enabled: true,
    required: false,
    category: "communication",
  },
  {
    id: "3",
    title: "Pesquisas de Satisfação",
    description:
      "Autoriza o contato para pesquisas de qualidade e satisfação sobre os serviços prestados.",
    enabled: false,
    required: false,
    category: "communication",
  },
  {
    id: "4",
    title: "Análises e Estatísticas",
    description:
      "Permite o uso anonimizado dos seus dados para análises estatísticas e melhoria dos serviços médicos.",
    enabled: true,
    required: false,
    category: "analytics",
  },
  {
    id: "5",
    title: "Campanhas Educativas",
    description:
      "Autoriza o recebimento de materiais educativos sobre prevenção, saúde e bem-estar.",
    enabled: false,
    required: false,
    category: "marketing",
  },
  {
    id: "6",
    title: "Compartilhamento entre Profissionais",
    description:
      "Permite o compartilhamento dos seus dados entre profissionais da clínica para coordenação do cuidado.",
    enabled: true,
    required: false,
    category: "essential",
  },
];
var mockDataRequests = [
  {
    id: "1",
    type: "access",
    status: "completed",
    requestDate: "2024-07-10",
    completionDate: "2024-07-12",
    description: "Solicitação de cópia dos dados pessoais",
  },
  {
    id: "2",
    type: "portability",
    status: "processing",
    requestDate: "2024-07-20",
    description: "Exportação de histórico médico completo",
  },
];
var categoryLabels = {
  essential: "Essencial",
  communication: "Comunicação",
  analytics: "Análises",
  marketing: "Marketing",
};
var requestTypeLabels = {
  access: "Acesso aos Dados",
  portability: "Portabilidade",
  deletion: "Exclusão",
  correction: "Correção",
};
var statusLabels = {
  pending: "Pendente",
  processing: "Processando",
  completed: "Concluído",
};
function LgpdPreferences() {
  var _a = (0, react_1.useState)(consentPreferences),
    preferences = _a[0],
    setPreferences = _a[1];
  var _b = (0, react_1.useState)(mockDataRequests),
    dataRequests = _b[0],
    setDataRequests = _b[1];
  var _c = (0, react_1.useState)(false),
    showDataExport = _c[0],
    setShowDataExport = _c[1];
  var _d = (0, react_1.useState)(false),
    showDeleteAccount = _d[0],
    setShowDeleteAccount = _d[1];
  var _e = (0, react_1.useState)(""),
    deleteReason = _e[0],
    setDeleteReason = _e[1];
  var handlePreferenceChange = (id, enabled) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? __assign(__assign({}, pref), { enabled: enabled }) : pref,
      ),
    );
  };
  var handleDataRequest = (type) => {
    var newRequest = {
      id: Date.now().toString(),
      type: type,
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
      description: getRequestDescription(type),
    };
    setDataRequests((prev) => __spreadArray([newRequest], prev, true));
  };
  var getRequestDescription = (type) => {
    switch (type) {
      case "access":
        return "Solicitação de acesso aos dados pessoais";
      case "portability":
        return "Solicitação de portabilidade dos dados";
      case "deletion":
        return "Solicitação de exclusão dos dados";
      case "correction":
        return "Solicitação de correção dos dados";
      default:
        return "Solicitação de dados";
    }
  };
  var getCategoryIcon = (category) => {
    switch (category) {
      case "essential":
        return lucide_react_1.Shield;
      case "communication":
        return lucide_react_1.MessageSquare;
      case "analytics":
        return lucide_react_1.BarChart3;
      case "marketing":
        return lucide_react_1.Mail;
      default:
        return lucide_react_1.User;
    }
  };
  var getCategoryColor = (category) => {
    switch (category) {
      case "essential":
        return "bg-red-100 text-red-800 border-red-200";
      case "communication":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "analytics":
        return "bg-green-100 text-green-800 border-green-200";
      case "marketing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  var getRequestIcon = (type) => {
    switch (type) {
      case "access":
        return lucide_react_1.Eye;
      case "portability":
        return lucide_react_1.Download;
      case "deletion":
        return lucide_react_1.Trash2;
      case "correction":
        return lucide_react_1.User;
      default:
        return lucide_react_1.User;
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Preferências LGPD</h2>
        <p className="text-gray-600">Gerencie seus consentimentos e direitos de privacidade</p>
      </div>

      {/* LGPD Rights Information */}
      <alert_1.Alert>
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Seus Direitos LGPD:</strong> Você tem direito ao acesso, correção, portabilidade e
          exclusão dos seus dados pessoais, conforme Lei Geral de Proteção de Dados.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      {/* Consent Preferences */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Consentimentos de Processamento</card_1.CardTitle>
          <card_1.CardDescription>
            Configure como seus dados podem ser utilizados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-6">
            {Object.entries(
              preferences.reduce((acc, pref) => {
                if (!acc[pref.category]) acc[pref.category] = [];
                acc[pref.category].push(pref);
                return acc;
              }, {}),
            ).map((_a) => {
              var category = _a[0],
                prefs = _a[1];
              var IconComponent = getCategoryIcon(category);
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-gray-900">{categoryLabels[category]}</h3>
                    <badge_1.Badge className={getCategoryColor(category)}>
                      {prefs.filter((p) => p.enabled).length}/{prefs.length}
                    </badge_1.Badge>
                  </div>
                  <div className="space-y-3 ml-7">
                    {prefs.map((pref) => (
                      <div
                        key={pref.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{pref.title}</h4>
                            {pref.required && (
                              <badge_1.Badge variant="secondary" className="text-xs">
                                Obrigatório
                              </badge_1.Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{pref.description}</p>
                        </div>
                        <div className="ml-4">
                          <switch_1.Switch
                            checked={pref.enabled}
                            onCheckedChange={(enabled) => handlePreferenceChange(pref.id, enabled)}
                            disabled={pref.required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <separator_1.Separator />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button_1.Button className="bg-primary hover:bg-primary/90">
              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
              Salvar Preferências
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Data Rights Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Exercer Direitos LGPD</card_1.CardTitle>
          <card_1.CardDescription>
            Solicite acesso, correção, portabilidade ou exclusão dos seus dados
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button_1.Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleDataRequest("access")}
            >
              <lucide_react_1.Eye className="h-6 w-6 text-primary" />
              <span className="font-medium">Acessar Dados</span>
              <span className="text-xs text-gray-500 text-center">Visualizar dados coletados</span>
            </button_1.Button>

            <dialog_1.Dialog>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <lucide_react_1.Download className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Exportar Dados</span>
                  <span className="text-xs text-gray-500 text-center">Download dos seus dados</span>
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle>Exportar Dados Pessoais</dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Solicite a exportação dos seus dados em formato portável
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  <alert_1.Alert>
                    <lucide_react_1.Download className="h-4 w-4" />
                    <alert_1.AlertDescription>
                      O arquivo exportado será enviado para seu email em até 72 horas úteis.
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                  <button_1.Button
                    onClick={() => handleDataRequest("portability")}
                    className="w-full"
                  >
                    Solicitar Exportação
                  </button_1.Button>
                </div>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>

            <button_1.Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => handleDataRequest("correction")}
            >
              <lucide_react_1.User className="h-6 w-6 text-green-600" />
              <span className="font-medium">Corrigir Dados</span>
              <span className="text-xs text-gray-500 text-center">Solicitar correções</span>
            </button_1.Button>

            <dialog_1.Dialog>
              <dialog_1.DialogTrigger asChild>
                <button_1.Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 border-red-200 hover:bg-red-50"
                >
                  <lucide_react_1.Trash2 className="h-6 w-6 text-red-600" />
                  <span className="font-medium text-red-600">Excluir Conta</span>
                  <span className="text-xs text-gray-500 text-center">Remover todos os dados</span>
                </button_1.Button>
              </dialog_1.DialogTrigger>
              <dialog_1.DialogContent>
                <dialog_1.DialogHeader>
                  <dialog_1.DialogTitle className="text-red-600">
                    Exclusão de Conta
                  </dialog_1.DialogTitle>
                  <dialog_1.DialogDescription>
                    Esta ação é irreversível e removerá todos os seus dados
                  </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <div className="space-y-4">
                  <alert_1.Alert>
                    <lucide_react_1.AlertTriangle className="h-4 w-4" />
                    <alert_1.AlertDescription>
                      <strong>Atenção:</strong> Dados médicos necessários por lei poderão ser
                      mantidos pelo período legalmente exigido.
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="delete-reason">
                      Motivo da exclusão (opcional)
                    </label_1.Label>
                    <textarea_1.Textarea
                      id="delete-reason"
                      placeholder="Conte-nos o motivo para nos ajudar a melhorar nossos serviços..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button_1.Button
                      variant="destructive"
                      onClick={() => handleDataRequest("deletion")}
                      className="flex-1"
                    >
                      Confirmar Exclusão
                    </button_1.Button>
                    <button_1.Button variant="outline" className="flex-1">
                      Cancelar
                    </button_1.Button>
                  </div>
                </div>
              </dialog_1.DialogContent>
            </dialog_1.Dialog>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Data Requests History */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Histórico de Solicitações</card_1.CardTitle>
          <card_1.CardDescription>Acompanhe suas solicitações de dados LGPD</card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {dataRequests.length === 0
              ? <div className="text-center py-8">
                  <lucide_react_1.Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhuma solicitação encontrada</p>
                  <p className="text-sm text-gray-400">Suas solicitações LGPD aparecerão aqui</p>
                </div>
              : dataRequests.map((request) => {
                  var IconComponent = getRequestIcon(request.type);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {requestTypeLabels[request.type]}
                            </p>
                            <badge_1.Badge className={getStatusColor(request.status)}>
                              {statusLabels[request.status]}
                            </badge_1.Badge>
                          </div>
                          <p className="text-sm text-gray-600">{request.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Solicitado em{" "}
                              {new Date(request.requestDate).toLocaleDateString("pt-BR")}
                            </span>
                            {request.completionDate && (
                              <span>
                                Concluído em{" "}
                                {new Date(request.completionDate).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {request.status === "completed" && (
                        <button_1.Button size="sm" variant="outline">
                          <lucide_react_1.Download className="h-4 w-4 mr-2" />
                          Download
                        </button_1.Button>
                      )}
                    </div>
                  );
                })}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
