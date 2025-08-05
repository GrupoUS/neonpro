'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSearch = AdvancedSearch;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var sonner_1 = require("sonner");
var lodash_1 = require("lodash");
function AdvancedSearch(_a) {
    var _this = this;
    var onPatientSelect = _a.onPatientSelect, onCreateSegment = _a.onCreateSegment;
    var _b = (0, react_1.useState)(''), query = _b[0], setQuery = _b[1];
    var _c = (0, react_1.useState)({}), filters = _c[0], setFilters = _c[1];
    var _d = (0, react_1.useState)(null), results = _d[0], setResults = _d[1];
    var _e = (0, react_1.useState)([]), selectedPatients = _e[0], setSelectedPatients = _e[1];
    var _f = (0, react_1.useState)(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = (0, react_1.useState)(false), showFilters = _g[0], setShowFilters = _g[1];
    var _h = (0, react_1.useState)([]), suggestions = _h[0], setSuggestions = _h[1];
    // Debounced search function
    var debouncedSearch = (0, react_1.useCallback)((0, lodash_1.debounce)(function (searchQuery, searchFilters) { return __awaiter(_this, void 0, void 0, function () {
        var params_1, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
                        setResults(null);
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    params_1 = new URLSearchParams();
                    if (searchQuery.trim())
                        params_1.append('q', searchQuery);
                    Object.entries(searchFilters).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value !== undefined && value !== null && value !== '') {
                            if (key === 'ageRange' && typeof value === 'object') {
                                params_1.append('minAge', value.min.toString());
                                params_1.append('maxAge', value.max.toString());
                            }
                            else if (key === 'lastVisit' && typeof value === 'object') {
                                params_1.append('lastVisitFrom', value.from.toISOString());
                                params_1.append('lastVisitTo', value.to.toISOString());
                            }
                            else if (key === 'tags' && Array.isArray(value)) {
                                params_1.append('tags', value.join(','));
                            }
                            else {
                                params_1.append(key, value.toString());
                            }
                        }
                    });
                    return [4 /*yield*/, fetch("/api/patients/integration/search?".concat(params_1))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.success) {
                        setResults(data.data);
                        setSuggestions(data.data.suggestions || []);
                    }
                    else {
                        sonner_1.toast.error(data.error || 'Erro na busca');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Search error:', error_1);
                    sonner_1.toast.error('Erro ao realizar busca');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, 300), []);
    // Effect to trigger search when query or filters change
    (0, react_1.useEffect)(function () {
        debouncedSearch(query, filters);
    }, [query, filters, debouncedSearch]);
    var handleFilterChange = function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var clearFilters = function () {
        setFilters({});
        setQuery('');
        setResults(null);
    };
    var togglePatientSelection = function (patientId) {
        setSelectedPatients(function (prev) {
            return prev.includes(patientId)
                ? prev.filter(function (id) { return id !== patientId; })
                : __spreadArray(__spreadArray([], prev, true), [patientId], false);
        });
    };
    var selectAllPatients = function () {
        if (!results)
            return;
        setSelectedPatients(results.patients.map(function (p) { return p.id; }));
    };
    var clearSelection = function () {
        setSelectedPatients([]);
    };
    var handleCreateSegment = function () {
        if (!results || selectedPatients.length === 0)
            return;
        var selectedPatientData = results.patients.filter(function (p) {
            return selectedPatients.includes(p.id);
        });
        onCreateSegment === null || onCreateSegment === void 0 ? void 0 : onCreateSegment(selectedPatientData);
    };
    var getRiskLevelColor = function (level) {
        switch (level) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (<div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <lucide_react_1.Search className="h-5 w-5 text-gray-500"/>
          <h2 className="text-lg font-semibold">Busca Avançada de Pacientes</h2>
        </div>
        <button_1.Button variant="outline" onClick={function () { return setShowFilters(!showFilters); }} className="flex items-center space-x-2">
          <lucide_react_1.Filter className="h-4 w-4"/>
          <span>Filtros</span>
        </button_1.Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
        <input_1.Input placeholder="Buscar por nome, email, telefone, CPF..." value={query} onChange={function (e) { return setQuery(e.target.value); }} className="pl-10"/>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (<div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Sugestões:</span>
          {suggestions.map(function (suggestion, index) { return (<button_1.Button key={index} variant="outline" size="sm" onClick={function () { return setQuery(suggestion); }} className="text-xs">
              {suggestion}
            </button_1.Button>); })}
        </div>)}

      {/* Advanced Filters */}
      {showFilters && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-base">Filtros Avançados</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Gender Filter */}
              <div>
                <label_1.Label>Gênero</label_1.Label>
                <select_1.Select value={filters.gender || ''} onValueChange={function (value) { return handleFilterChange('gender', value); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecionar gênero"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="male">Masculino</select_1.SelectItem>
                    <select_1.SelectItem value="female">Feminino</select_1.SelectItem>
                    <select_1.SelectItem value="other">Outro</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label_1.Label>Nível de Risco</label_1.Label>
                <select_1.Select value={filters.riskLevel || ''} onValueChange={function (value) { return handleFilterChange('riskLevel', value); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecionar risco"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="low">Baixo</select_1.SelectItem>
                    <select_1.SelectItem value="medium">Médio</select_1.SelectItem>
                    <select_1.SelectItem value="high">Alto</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Treatment Type Filter */}
              <div>
                <label_1.Label>Tipo de Tratamento</label_1.Label>
                <select_1.Select value={filters.treatmentType || ''} onValueChange={function (value) { return handleFilterChange('treatmentType', value); }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecionar tratamento"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="consultation">Consulta</select_1.SelectItem>
                    <select_1.SelectItem value="surgery">Cirurgia</select_1.SelectItem>
                    <select_1.SelectItem value="therapy">Terapia</select_1.SelectItem>
                    <select_1.SelectItem value="emergency">Emergência</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              {/* Age Range */}
              <div>
                <label_1.Label>Idade Mínima</label_1.Label>
                <input_1.Input type="number" placeholder="Ex: 18" value={filters.minAge || ''} onChange={function (e) { return handleFilterChange('minAge', parseInt(e.target.value) || undefined); }}/>
              </div>

              <div>
                <label_1.Label>Idade Máxima</label_1.Label>
                <input_1.Input type="number" placeholder="Ex: 65" value={filters.maxAge || ''} onChange={function (e) { return handleFilterChange('maxAge', parseInt(e.target.value) || undefined); }}/>
              </div>
            </div>

            {/* Boolean Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox id="hasPhotos" checked={filters.hasPhotos || false} onCheckedChange={function (checked) { return handleFilterChange('hasPhotos', checked); }}/>
                <label_1.Label htmlFor="hasPhotos">Possui fotos</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox id="consentStatus" checked={filters.consentStatus || false} onCheckedChange={function (checked) { return handleFilterChange('consentStatus', checked); }}/>
                <label_1.Label htmlFor="consentStatus">Consentimento LGPD</label_1.Label>
              </div>
            </div>

            <div className="flex space-x-2">
              <button_1.Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Search Results */}
      {isLoading && (<div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Buscando pacientes...</p>
        </div>)}

      {results && (<div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {results.totalCount} pacientes encontrados em {results.searchTime}ms
              </span>
              {selectedPatients.length > 0 && (<span className="text-sm text-blue-600">
                  {selectedPatients.length} selecionados
                </span>)}
            </div>
            
            {results.patients.length > 0 && (<div className="flex space-x-2">
                <button_1.Button variant="outline" size="sm" onClick={selectAllPatients}>
                  Selecionar Todos
                </button_1.Button>
                {selectedPatients.length > 0 && (<>
                    <button_1.Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpar Seleção
                    </button_1.Button>
                    {onCreateSegment && (<button_1.Button size="sm" onClick={handleCreateSegment}>
                        Criar Segmento ({selectedPatients.length})
                      </button_1.Button>)}
                  </>)}
              </div>)}
          </div>

          {/* Patient Results */}
          <div className="space-y-2">
            {results.patients.map(function (patient) { return (<card_1.Card key={patient.id} className={"cursor-pointer transition-colors ".concat(selectedPatients.includes(patient.id)
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50')} onClick={function () { return togglePatientSelection(patient.id); }}>
                <card_1.CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <checkbox_1.Checkbox checked={selectedPatients.includes(patient.id)} onChange={function () { return togglePatientSelection(patient.id); }}/>
                      <div>
                        <h3 className="font-medium">{patient.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{patient.email}</span>
                          <span>•</span>
                          <span>{patient.phone}</span>
                          <span>•</span>
                          <span>{patient.age} anos</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <badge_1.Badge className={getRiskLevelColor(patient.riskLevel)}>
                        {patient.riskLevel === 'high' && <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1"/>}
                        {patient.riskLevel === 'high' ? 'Alto Risco' :
                    patient.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                      </badge_1.Badge>
                      
                      {patient.hasPhotos && (<badge_1.Badge variant="outline">
                          📸 Fotos
                        </badge_1.Badge>)}
                      
                      {patient.consentStatus && (<badge_1.Badge variant="outline">
                          ✓ LGPD
                        </badge_1.Badge>)}
                      
                      <button_1.Button variant="ghost" size="sm" onClick={function (e) {
                    e.stopPropagation();
                    onPatientSelect === null || onPatientSelect === void 0 ? void 0 : onPatientSelect(patient);
                }}>
                        Ver Detalhes
                      </button_1.Button>
                    </div>
                  </div>
                  
                  {patient.tags.length > 0 && (<div className="mt-2 flex flex-wrap gap-1">
                      {patient.tags.map(function (tag, index) { return (<badge_1.Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </badge_1.Badge>); })}
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>

          {results.patients.length === 0 && (<div className="text-center py-8">
              <lucide_react_1.Users className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
              <p className="text-gray-500">Nenhum paciente encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>)}
        </div>)}
    </div>);
}
