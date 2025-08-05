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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientSearch = PatientSearch;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var PatientTable_1 = require("./PatientTable");
var patients_1 = require("@/lib/supabase/patients");
var lodash_1 = require("lodash");
function PatientSearch() {
    var _this = this;
    var _a = (0, react_1.useState)([]), patients = _a[0], setPatients = _a[1];
    var _b = (0, react_1.useState)(null), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)(false), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(0), totalCount = _d[0], setTotalCount = _d[1];
    var _e = (0, react_1.useState)({
        query: '',
        status: 'all',
        gender: 'all',
        ageRange: 'all',
        page: 1,
        limit: 20
    }), filters = _e[0], setFilters = _e[1];
    // Debounced search function
    var debouncedSearch = (0, react_1.useMemo)(function () { return (0, lodash_1.debounce)(function (searchFilters) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, patients_1.searchPatients)({
                            query: searchFilters.query,
                            status: searchFilters.status === 'all' ? undefined : searchFilters.status,
                            gender: searchFilters.gender === 'all' ? undefined : searchFilters.gender,
                            ageRange: searchFilters.ageRange === 'all' ? undefined : searchFilters.ageRange,
                            page: searchFilters.page,
                            limit: searchFilters.limit
                        })];
                case 2:
                    result = _a.sent();
                    if (result.success && result.data) {
                        setPatients(result.data.patients);
                        setTotalCount(result.data.total);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error searching patients:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, 300); }, []);
    // Load patient statistics
    (0, react_1.useEffect)(function () {
        var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, patients_1.getPatientStats)()];
                    case 1:
                        result = _a.sent();
                        if (result.success && result.data) {
                            setStats(result.data);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        loadStats();
    }, []);
    // Trigger search when filters change
    (0, react_1.useEffect)(function () {
        debouncedSearch(filters);
        return function () {
            debouncedSearch.cancel();
        };
    }, [filters, debouncedSearch]);
    var handleFilterChange = function (key, value) {
        setFilters(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a.page = key !== 'page' ? 1 : value // Reset page when other filters change
            , _a)));
        });
    };
    var handlePageChange = function (page) {
        handleFilterChange('page', page);
    };
    var calculateAge = function (birthDate) {
        var today = new Date();
        var birth = new Date(birthDate);
        var age = today.getFullYear() - birth.getFullYear();
        var monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    var formatPhoneNumber = function (telecom) {
        var phone = telecom === null || telecom === void 0 ? void 0 : telecom.find(function (t) { return t.system === 'phone'; });
        if (!phone)
            return 'N/A';
        var digits = phone.value.replace(/\D/g, '');
        if (digits.length === 11) {
            return "(".concat(digits.slice(0, 2), ") ").concat(digits.slice(2, 7), "-").concat(digits.slice(7));
        }
        return phone.value;
    };
    var getGenderLabel = function (gender) {
        var labels = {
            male: 'Masculino',
            female: 'Feminino',
            other: 'Outro',
            unknown: 'Não informado'
        };
        return labels[gender] || 'Não informado';
    };
    var getStatusBadge = function (status) {
        if (status === 'active') {
            return <badge_1.Badge variant="default" className="bg-green-100 text-green-800">Ativo</badge_1.Badge>;
        }
        return <badge_1.Badge variant="secondary">Inativo</badge_1.Badge>;
    };
    // Prepare table data
    var tableData = patients.map(function (patient) {
        var _a;
        return ({
            id: patient.id,
            medical_record_number: patient.medical_record_number,
            name: ((_a = patient.fhir_data.name[0]) === null || _a === void 0 ? void 0 : _a.text) || 'Nome não informado',
            age: calculateAge(patient.fhir_data.birthDate),
            gender: getGenderLabel(patient.fhir_data.gender),
            phone: formatPhoneNumber(patient.fhir_data.telecom),
            status: getStatusBadge(patient.status),
            created_at: new Date(patient.created_at).toLocaleDateString('pt-BR'),
            actions: patient.id
        });
    });
    var totalPages = Math.ceil(totalCount / filters.limit);
    return (<div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Total de Pacientes</card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.total_patients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_patients} ativos
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Novos este Mês</card_1.CardTitle>
              <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{stats.new_this_month}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados em {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Idade Média</card_1.CardTitle>
              <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avg_age)} anos</div>
              <p className="text-xs text-muted-foreground">
                Média geral dos pacientes
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Atividade</card_1.CardTitle>
              <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground"/>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.active_patients / stats.total_patients) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Pacientes ativos
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}

      {/* Search and Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Buscar Pacientes</card_1.CardTitle>
          <card_1.CardDescription>
            Encontre pacientes por nome, CPF, telefone ou número do prontuário
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
            <input_1.Input placeholder="Buscar por nome, CPF, telefone ou prontuário..." value={filters.query} onChange={function (e) { return handleFilterChange('query', e.target.value); }} className="pl-10"/>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select_1.Select value={filters.status} onValueChange={function (value) { return handleFilterChange('status', value); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="active">Ativos</select_1.SelectItem>
                  <select_1.SelectItem value="inactive">Inativos</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gênero</label>
              <select_1.Select value={filters.gender} onValueChange={function (value) { return handleFilterChange('gender', value); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="male">Masculino</select_1.SelectItem>
                  <select_1.SelectItem value="female">Feminino</select_1.SelectItem>
                  <select_1.SelectItem value="other">Outro</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa Etária</label>
              <select_1.Select value={filters.ageRange} onValueChange={function (value) { return handleFilterChange('ageRange', value); }}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  <select_1.SelectItem value="0-18">0-18 anos</select_1.SelectItem>
                  <select_1.SelectItem value="19-40">19-40 anos</select_1.SelectItem>
                  <select_1.SelectItem value="41-65">41-65 anos</select_1.SelectItem>
                  <select_1.SelectItem value="65+">65+ anos</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {loading ? 'Carregando...' : "".concat(totalCount, " paciente(s) encontrado(s)")}
            </span>
            <button_1.Button variant="outline" size="sm" onClick={function () { return setFilters({
            query: '',
            status: 'all',
            gender: 'all',
            ageRange: 'all',
            page: 1,
            limit: 20
        }); }}>
              <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
              Limpar Filtros
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Patient Table */}
      <PatientTable_1.PatientTable data={tableData} loading={loading} currentPage={filters.page} totalPages={totalPages} onPageChange={handlePageChange}/>
    </div>);
}
