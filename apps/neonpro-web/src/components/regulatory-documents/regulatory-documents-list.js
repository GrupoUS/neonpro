"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegulatoryDocumentsList = RegulatoryDocumentsList;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var use_regulatory_categories_1 = require("@/hooks/use-regulatory-categories");
var use_regulatory_documents_1 = require("@/hooks/use-regulatory-documents");
var regulatory_documents_1 = require("@/types/regulatory-documents");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function RegulatoryDocumentsList(_a) {
    var _this = this;
    var onCreateDocument = _a.onCreateDocument, onEditDocument = _a.onEditDocument, onViewDocument = _a.onViewDocument;
    var _b = (0, react_1.useState)(""), search = _b[0], setSearch = _b[1];
    var _c = (0, react_1.useState)(""), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = (0, react_1.useState)(""), categoryFilter = _d[0], setCategoryFilter = _d[1];
    var _e = (0, use_regulatory_documents_1.useRegulatoryDocuments)({
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        limit: 10,
    }), documents = _e.documents, loading = _e.loading, pagination = _e.pagination, loadMore = _e.loadMore, hasMore = _e.hasMore, deleteDocument = _e.deleteDocument;
    var _f = (0, use_regulatory_categories_1.useRegulatoryCategories)(), categories = _f.categories, authorities = _f.authorities;
    var getStatusBadgeVariant = function (status) {
        switch (status) {
            case "valid":
                return "default";
            case "expiring":
                return "destructive";
            case "expired":
                return "destructive";
            case "pending":
                return "secondary";
            default:
                return "secondary";
        }
    };
    var getDaysUntilExpiration = function (expirationDate) {
        if (!expirationDate)
            return null;
        var expiration = new Date(expirationDate);
        var now = new Date();
        var diffTime = expiration.getTime() - now.getTime();
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    var handleDeleteDocument = function (id) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.confirm("Tem certeza que deseja excluir este documento?")) return [3 /*break*/, 2];
                    return [4 /*yield*/, deleteDocument(id)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Documentação Regulatória
          </h2>
          <p className="text-muted-foreground">
            Gerencie documentos de compliance e certificações da clínica
          </p>
        </div>
        <button_1.Button onClick={onCreateDocument} className="gap-2">
          <lucide_react_1.Plus className="h-4 w-4"/>
          Novo Documento
        </button_1.Button>
      </div>

      {/* Filters */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar por tipo, número ou nome do arquivo..." value={search} onChange={function (e) { return setSearch(e.target.value); }} className="pl-8"/>
              </div>
            </div>
            <div className="flex gap-2">
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-[150px]">
                  <select_1.SelectValue placeholder="Status"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todos os status</select_1.SelectItem>
                  <select_1.SelectItem value="valid">Válido</select_1.SelectItem>
                  <select_1.SelectItem value="expiring">Expirando</select_1.SelectItem>
                  <select_1.SelectItem value="expired">Expirado</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pendente</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <select_1.SelectTrigger className="w-[200px]">
                  <select_1.SelectValue placeholder="Categoria"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="">Todas as categorias</select_1.SelectItem>
                  {categories.map(function (category) { return (<select_1.SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {loading && documents.length === 0 ? (<div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Carregando documentos...
            </p>
          </div>) : documents.length === 0 ? (<card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="text-center py-8">
                <lucide_react_1.FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  {search || statusFilter || categoryFilter
                ? "Tente alterar os filtros para encontrar documentos."
                : "Comece adicionando seu primeiro documento regulatório."}
                </p>
                {onCreateDocument && (<button_1.Button onClick={onCreateDocument}>
                    <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                    Adicionar Documento
                  </button_1.Button>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>) : (<>
            {documents.map(function (document) {
                var daysUntilExpiration = getDaysUntilExpiration(document.expiration_date);
                var isExpiring = (0, regulatory_documents_1.isDocumentExpiring)(document);
                var isExpired = (0, regulatory_documents_1.isDocumentExpired)(document);
                return (<card_1.Card key={document.id} className="hover:shadow-md transition-shadow">
                  <card_1.CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {document.document_type}
                          </h3>
                          <badge_1.Badge variant={getStatusBadgeVariant(document.status)}>
                            {regulatory_documents_1.DocumentStatusLabels[document.status]}
                          </badge_1.Badge>
                          {(isExpiring || isExpired) && (<badge_1.Badge variant="destructive" className="gap-1">
                              <lucide_react_1.AlertTriangle className="h-3 w-3"/>
                              {isExpired
                            ? "Expirado"
                            : "".concat(daysUntilExpiration, " dias")}
                            </badge_1.Badge>)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Autoridade:</span>{" "}
                            {document.authority}
                          </div>
                          <div>
                            <span className="font-medium">Categoria:</span>{" "}
                            {document.document_category}
                          </div>
                          {document.document_number && (<div>
                              <span className="font-medium">Número:</span>{" "}
                              {document.document_number}
                            </div>)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Calendar className="h-3 w-3"/>
                            <span className="font-medium">Emissão:</span>
                            {(0, date_fns_1.formatDistanceToNow)(new Date(document.issue_date), {
                        addSuffix: true,
                        locale: locale_1.ptBR,
                    })}
                          </div>
                          {document.expiration_date && (<div className="flex items-center gap-1">
                              <lucide_react_1.Calendar className="h-3 w-3"/>
                              <span className="font-medium">Validade:</span>
                              {(0, date_fns_1.formatDistanceToNow)(new Date(document.expiration_date), {
                            addSuffix: true,
                            locale: locale_1.ptBR,
                        })}
                            </div>)}
                        </div>

                        {document.file_name && (<div className="mt-2 text-sm text-muted-foreground">
                            <span className="font-medium">Arquivo:</span>{" "}
                            {document.file_name}
                          </div>)}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {onViewDocument && (<button_1.Button variant="outline" size="sm" onClick={function () { return onViewDocument(document.id); }}>
                            Ver
                          </button_1.Button>)}
                        {onEditDocument && (<button_1.Button variant="outline" size="sm" onClick={function () { return onEditDocument(document.id); }} data-testid="edit-document-button">
                            Editar
                          </button_1.Button>)}
                        <button_1.Button variant="outline" size="sm" onClick={function () { return handleDeleteDocument(document.id); }} data-testid="delete-document-button" className="text-destructive hover:text-destructive">
                          Excluir
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
            })}

            {/* Load More */}
            {hasMore && (<div className="text-center pt-4">
                <button_1.Button variant="outline" onClick={loadMore} disabled={loading}>
                  {loading ? "Carregando..." : "Carregar mais"}
                </button_1.Button>
              </div>)}
          </>)}
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && pagination && (<card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="text-sm text-muted-foreground text-center">
              Mostrando {documents.length} de {pagination.total} documentos
              {pagination.totalPages > 1 && (<span>
                  {" "}
                  • Página {pagination.page} de {pagination.totalPages}
                </span>)}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
