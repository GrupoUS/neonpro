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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentCenter;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var select_1 = require("@/components/ui/select");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Dados simulados de documentos do paciente
var mockDocuments = [
  {
    id: "1",
    title: "Recibo de Pagamento - Botox",
    type: "receipt",
    category: "financial",
    date: new Date("2024-01-15"),
    size: "245 KB",
    format: "PDF",
    status: "ready",
    treatment: "Aplicação de Botox",
    amount: 1250.0,
    encrypted: true,
    accessCount: 3,
    lgpdCompliant: true,
  },
  {
    id: "2",
    title: "Relatório Médico - Preenchimento Facial",
    type: "medical_report",
    category: "medical",
    date: new Date("2024-01-10"),
    size: "1.2 MB",
    format: "PDF",
    status: "signed",
    doctor: "Dra. Marina Silva",
    treatment: "Preenchimento com Ácido Hialurônico",
    encrypted: true,
    accessCount: 1,
    expiryDate: new Date("2025-01-10"),
    lgpdCompliant: true,
  },
  {
    id: "3",
    title: "Termo de Consentimento - Peeling",
    type: "consent_form",
    category: "legal",
    date: new Date("2024-01-08"),
    size: "180 KB",
    format: "PDF",
    status: "signed",
    treatment: "Peeling Químico",
    encrypted: true,
    accessCount: 2,
    lgpdCompliant: true,
  },
  {
    id: "4",
    title: "Fatura - Janeiro 2024",
    type: "invoice",
    category: "financial",
    date: new Date("2024-01-05"),
    size: "320 KB",
    format: "PDF",
    status: "ready",
    amount: 2850.0,
    encrypted: true,
    accessCount: 5,
    lgpdCompliant: true,
  },
  {
    id: "5",
    title: "Certificado de Conclusão - Tratamento",
    type: "certificate",
    category: "administrative",
    date: new Date("2023-12-20"),
    size: "95 KB",
    format: "PDF",
    status: "ready",
    treatment: "Protocolo Anti-Idade Completo",
    encrypted: true,
    accessCount: 1,
    lgpdCompliant: true,
  },
];
function DocumentCenter() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    documents = _a[0],
    setDocuments = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(""),
    searchTerm = _c[0],
    setSearchTerm = _c[1];
  var _d = (0, react_1.useState)("all"),
    filterType = _d[0],
    setFilterType = _d[1];
  var _e = (0, react_1.useState)("all"),
    filterCategory = _e[0],
    setFilterCategory = _e[1];
  var _f = (0, react_1.useState)(null),
    downloading = _f[0],
    setDownloading = _f[1];
  (0, react_1.useEffect)(function () {
    // Simular carregamento de documentos
    var timer = setTimeout(function () {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
    return function () {
      return clearTimeout(timer);
    };
  }, []);
  // Filtrar documentos baseado nos critérios de busca
  var filteredDocuments = documents.filter(function (doc) {
    var _a, _b;
    var matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((_a = doc.treatment) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((_b = doc.doctor) === null || _b === void 0
        ? void 0
        : _b.toLowerCase().includes(searchTerm.toLowerCase()));
    var matchesType = filterType === "all" || doc.type === filterType;
    var matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });
  // Simular download de documento
  var handleDownload = function (document) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setDownloading(document.id);
            // Simular processo de download seguro
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 2000);
              }),
            ];
          case 1:
            // Simular processo de download seguro
            _a.sent();
            // Incrementar contador de acesso (compliance LGPD)
            setDocuments(function (prev) {
              return prev.map(function (doc) {
                return doc.id === document.id
                  ? __assign(__assign({}, doc), { accessCount: doc.accessCount + 1 })
                  : doc;
              });
            });
            setDownloading(null);
            // Em implementação real, iniciar download aqui
            console.log("Downloading document: ".concat(document.title));
            return [2 /*return*/];
        }
      });
    });
  };
  // Simular visualização de documento
  var handlePreview = function (document) {
    // Em implementação real, abrir preview seguro
    console.log("Previewing document: ".concat(document.title));
  };
  // Ícone baseado no tipo de documento
  var getDocumentIcon = function (type) {
    switch (type) {
      case "receipt":
        return <lucide_react_1.CreditCard className="h-5 w-5 text-green-600" />;
      case "medical_report":
        return <lucide_react_1.FileText className="h-5 w-5 text-blue-600" />;
      case "consent_form":
        return <lucide_react_1.Shield className="h-5 w-5 text-purple-600" />;
      case "prescription":
        return <lucide_react_1.FileText className="h-5 w-5 text-orange-600" />;
      case "invoice":
        return <lucide_react_1.CreditCard className="h-5 w-5 text-red-600" />;
      case "certificate":
        return <lucide_react_1.FileText className="h-5 w-5 text-indigo-600" />;
      default:
        return <lucide_react_1.FileText className="h-5 w-5 text-gray-600" />;
    }
  };
  // Badge de status do documento
  var getStatusBadge = function (status) {
    switch (status) {
      case "ready":
        return (
          <badge_1.Badge variant="outline" className="text-green-700 border-green-300">
            Disponível
          </badge_1.Badge>
        );
      case "processing":
        return (
          <badge_1.Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Processando
          </badge_1.Badge>
        );
      case "signed":
        return (
          <badge_1.Badge variant="outline" className="text-blue-700 border-blue-300">
            Assinado
          </badge_1.Badge>
        );
      case "pending_signature":
        return (
          <badge_1.Badge variant="outline" className="text-orange-700 border-orange-300">
            Aguardando Assinatura
          </badge_1.Badge>
        );
      default:
        return <badge_1.Badge variant="outline">Desconhecido</badge_1.Badge>;
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <loading_spinner_1.default size="lg" />
        <span className="ml-3 text-gray-600">Carregando seus documentos...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <lucide_react_1.FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Central de Documentos</h1>
        </div>
        <p className="text-gray-600 mb-4">
          Acesse com segurança todos os seus documentos médicos e financeiros. Todos os downloads
          são registrados para conformidade com a LGPD.
        </p>

        {/* Informações de Segurança LGPD */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <lucide_react_1.Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-700 font-medium mb-1">Segurança e Privacidade</p>
              <ul className="text-gray-600 space-y-1">
                <li>• Todos os documentos são criptografados</li>
                <li>• Acessos são registrados conforme LGPD</li>
                <li>• Documentos médicos têm prazo de validade</li>
                <li>• Você pode solicitar exclusão de dados a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Filtros e Busca */}
      <card_1.Card>
        <card_1.CardHeader className="pb-4">
          <card_1.CardTitle className="text-lg">Filtrar Documentos</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input_1.Input
                placeholder="Buscar por título, tratamento ou médico..."
                value={searchTerm}
                onChange={function (e) {
                  return setSearchTerm(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {/* Filtro por Tipo */}
            <select_1.Select value={filterType} onValueChange={setFilterType}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Tipo de documento" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
                <select_1.SelectItem value="receipt">Recibos</select_1.SelectItem>
                <select_1.SelectItem value="medical_report">Relatórios Médicos</select_1.SelectItem>
                <select_1.SelectItem value="consent_form">
                  Termos de Consentimento
                </select_1.SelectItem>
                <select_1.SelectItem value="prescription">Prescrições</select_1.SelectItem>
                <select_1.SelectItem value="invoice">Faturas</select_1.SelectItem>
                <select_1.SelectItem value="certificate">Certificados</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            {/* Filtro por Categoria */}
            <select_1.Select value={filterCategory} onValueChange={setFilterCategory}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Categoria" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">Todas as categorias</select_1.SelectItem>
                <select_1.SelectItem value="financial">Financeiro</select_1.SelectItem>
                <select_1.SelectItem value="medical">Médico</select_1.SelectItem>
                <select_1.SelectItem value="legal">Legal</select_1.SelectItem>
                <select_1.SelectItem value="administrative">Administrativo</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardContent>
      </card_1.Card>
      {/* Lista de Documentos */}
      <div className="space-y-4">
        {filteredDocuments.length === 0
          ? <card_1.Card>
              <card_1.CardContent className="flex flex-col items-center justify-center py-12">
                <lucide_react_1.FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 text-center">
                  {searchTerm || filterType !== "all" || filterCategory !== "all"
                    ? "Tente ajustar os filtros de busca."
                    : "Você ainda não possui documentos disponíveis."}
                </p>
              </card_1.CardContent>
            </card_1.Card>
          : filteredDocuments.map(function (document) {
              return (
                <card_1.Card key={document.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Informações do Documento */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {getDocumentIcon(document.type)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{document.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <lucide_react_1.Calendar className="h-4 w-4" />
                                {(0, date_fns_1.format)(document.date, "dd 'de' MMMM 'de' yyyy", {
                                  locale: locale_1.ptBR,
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <lucide_react_1.FileText className="h-4 w-4" />
                                {document.format} • {document.size}
                              </div>
                              {document.doctor && (
                                <div className="flex items-center gap-1">
                                  <lucide_react_1.User className="h-4 w-4" />
                                  {document.doctor}
                                </div>
                              )}
                              {document.amount && (
                                <div className="flex items-center gap-1">
                                  <lucide_react_1.CreditCard className="h-4 w-4" />
                                  R${" "}
                                  {document.amount.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Badges e Informações Adicionais */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {getStatusBadge(document.status)}
                          {document.encrypted && (
                            <badge_1.Badge
                              variant="outline"
                              className="text-green-700 border-green-300"
                            >
                              <lucide_react_1.Shield className="h-3 w-3 mr-1" />
                              Criptografado
                            </badge_1.Badge>
                          )}
                          {document.lgpdCompliant && (
                            <badge_1.Badge
                              variant="outline"
                              className="text-blue-700 border-blue-300"
                            >
                              <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                              LGPD
                            </badge_1.Badge>
                          )}
                          {document.expiryDate && (
                            <badge_1.Badge
                              variant="outline"
                              className="text-orange-700 border-orange-300"
                            >
                              <lucide_react_1.Clock className="h-3 w-3 mr-1" />
                              Expira em {(0, date_fns_1.format)(document.expiryDate, "dd/MM/yyyy")}
                            </badge_1.Badge>
                          )}
                        </div>{" "}
                        {/* Informações de Acesso LGPD */}
                        <div className="text-xs text-gray-500 mb-4">
                          Acessado {document.accessCount}{" "}
                          {document.accessCount === 1 ? "vez" : "vezes"} • Último acesso registrado
                          conforme LGPD
                        </div>
                        {/* Tratamento Relacionado */}
                        {document.treatment && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <lucide_react_1.Building className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-700">Tratamento:</span>
                              <span className="text-gray-600">{document.treatment}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* Visualizar */}
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={function () {
                            return handlePreview(document);
                          }}
                          className="flex items-center gap-2"
                        >
                          <lucide_react_1.Eye className="h-4 w-4" />
                          Visualizar
                        </button_1.Button>

                        {/* Download */}
                        <button_1.Button
                          size="sm"
                          onClick={function () {
                            return handleDownload(document);
                          }}
                          disabled={downloading === document.id || document.status === "processing"}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                          {downloading === document.id
                            ? <>
                                <loading_spinner_1.default size="sm" />
                                Baixando...
                              </>
                            : <>
                                <lucide_react_1.Download className="h-4 w-4" />
                                Download
                              </>}
                        </button_1.Button>
                      </div>
                    </div>

                    {/* Avisos Especiais */}
                    {document.requiresPassword && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <lucide_react_1.AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-800 mb-1">Documento Protegido</p>
                            <p className="text-yellow-700">
                              Este documento requer senha para acesso. A senha foi enviada por
                              SMS/email.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {document.expiryDate &&
                      document.expiryDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <lucide_react_1.Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-orange-800 mb-1">
                                Documento Expirando
                              </p>
                              <p className="text-orange-700">
                                Este documento expira em breve. Faça o download se necessário.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
      </div>
      {/* Informações Adicionais LGPD */}
      <card_1.Card className="border-blue-200 bg-blue-50">
        <card_1.CardContent className="p-6">
          <div className="flex items-start gap-3">
            <lucide_react_1.Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Seus Direitos LGPD</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-1">Acesso aos Dados</p>
                  <p>Você pode acessar todos os seus documentos a qualquer momento.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Correção de Dados</p>
                  <p>Solicite correção de informações incorretas em seus documentos.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Exclusão de Dados</p>
                  <p>Solicite a exclusão de documentos quando permitido por lei.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Portabilidade</p>
                  <p>Solicite o envio de seus dados para outro prestador de serviços.</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  Para exercer seus direitos LGPD, entre em contato através da página de
                  configurações ou envie um email para privacidade@neonpro.com.br
                </p>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
