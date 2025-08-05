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
exports.default = OptimizedPatientList;
var react_1 = require("react");
var client_1 = require("@/app/utils/supabase/client");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var avatar_1 = require("@/components/ui/avatar");
var table_1 = require("@/components/ui/table");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ITEMS_PER_PAGE = 20;
var SEARCH_DEBOUNCE_MS = 500;
function OptimizedPatientList(_a) {
  var onPatientSelect = _a.onPatientSelect,
    _b = _a.searchTerm,
    searchTerm = _b === void 0 ? "" : _b,
    onSearchChange = _a.onSearchChange;
  var _c = (0, react_1.useState)([]),
    patients = _c[0],
    setPatients = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)(1),
    currentPage = _f[0],
    setCurrentPage = _f[1];
  var _g = (0, react_1.useState)(0),
    totalCount = _g[0],
    setTotalCount = _g[1];
  var _h = (0, react_1.useState)(searchTerm),
    localSearchTerm = _h[0],
    setLocalSearchTerm = _h[1];
  var _j = (0, react_1.useState)(true),
    mounted = _j[0],
    setMounted = _j[1];
  var supabase = (0, client_1.createClient)();
  // =====================================================================================
  // MEMOIZED VALUES
  // =====================================================================================
  var totalPages = (0, react_1.useMemo)(() => Math.ceil(totalCount / ITEMS_PER_PAGE), [totalCount]);
  var paginationInfo = (0, react_1.useMemo)(() => {
    var start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    var end = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);
    return { start: start, end: end, total: totalCount };
  }, [currentPage, totalCount]);
  // =====================================================================================
  // OPTIMIZED SEARCH WITH DEBOUNCING
  // =====================================================================================
  (0, react_1.useEffect)(() => {
    if (localSearchTerm.length === 0 || localSearchTerm.length >= 2) {
      var timer_1 = setTimeout(() => {
        if (mounted) {
          onSearchChange === null || onSearchChange === void 0
            ? void 0
            : onSearchChange(localSearchTerm);
          setCurrentPage(1); // Reset to first page on search
        }
      }, SEARCH_DEBOUNCE_MS);
      return () => clearTimeout(timer_1);
    }
  }, [localSearchTerm, onSearchChange, mounted]);
  // =====================================================================================
  // OPTIMIZED DATA FETCHING
  // =====================================================================================
  var fetchPatients = (0, react_1.useCallback)(
    (page, search) =>
      __awaiter(this, void 0, void 0, function () {
        var from, to, query, _a, data, fetchError, count, err_1;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              if (!mounted) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, 4, 5]);
              setLoading(true);
              setError(null);
              from = (page - 1) * ITEMS_PER_PAGE;
              to = from + ITEMS_PER_PAGE - 1;
              query = supabase
                .from("patients")
                .select("*", { count: "exact" })
                .range(from, to)
                .order("created_at", { ascending: false });
              // Apply search filter if provided
              if (search.trim()) {
                query = query.or(
                  "name.ilike.%"
                    .concat(search, "%,email.ilike.%")
                    .concat(search, "%,phone.ilike.%")
                    .concat(search, "%"),
                );
              }
              return [4 /*yield*/, query];
            case 2:
              (_a = _b.sent()), (data = _a.data), (fetchError = _a.error), (count = _a.count);
              if (fetchError) {
                throw fetchError;
              }
              if (mounted) {
                setPatients(data || []);
                setTotalCount(count || 0);
              }
              return [3 /*break*/, 5];
            case 3:
              err_1 = _b.sent();
              if (mounted) {
                setError(err_1 instanceof Error ? err_1.message : "Failed to fetch patients");
                console.error("Error fetching patients:", err_1);
              }
              return [3 /*break*/, 5];
            case 4:
              if (mounted) {
                setLoading(false);
              }
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [supabase, mounted],
  );
  // =====================================================================================
  // EFFECTS
  // =====================================================================================
  (0, react_1.useEffect)(() => {
    fetchPatients(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchPatients]);
  // Cleanup effect
  (0, react_1.useEffect)(
    () => () => {
      setMounted(false);
    },
    [],
  );
  // =====================================================================================
  // EVENT HANDLERS
  // =====================================================================================
  var handleSearchChange = (0, react_1.useCallback)((value) => {
    setLocalSearchTerm(value);
  }, []);
  var handlePageChange = (0, react_1.useCallback)(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );
  var handleRefresh = (0, react_1.useCallback)(() => {
    fetchPatients(currentPage, searchTerm);
  }, [fetchPatients, currentPage, searchTerm]);
  var getStatusBadgeColor = (0, react_1.useCallback)((status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);
  var formatDate = (0, react_1.useCallback)(
    (dateString) => new Date(dateString).toLocaleDateString("pt-BR"),
    [],
  );
  // =====================================================================================
  // RENDER
  // =====================================================================================
  if (error) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erro ao carregar pacientes: {error}</p>
            <button_1.Button onClick={handleRefresh} className="mt-2">
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center justify-between">
          <span>Lista de Pacientes Otimizada</span>
          <button_1.Button onClick={handleRefresh} variant="outline" size="sm">
            <lucide_react_1.RefreshCw className="h-4 w-4" />
          </button_1.Button>
        </card_1.CardTitle>

        {/* Optimized Search */}
        <div className="relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input_1.Input
            placeholder="Buscar pacientes (mín. 2 caracteres)..."
            value={localSearchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Mostrando {paginationInfo.start}-{paginationInfo.end} de {paginationInfo.total}{" "}
            pacientes
          </p>
          {loading && <span className="text-sm text-blue-600">Carregando...</span>}
        </div>

        {/* Optimized Table */}
        <div className="border rounded-lg">
          <table_1.Table>
            <table_1.TableHeader>
              <table_1.TableRow>
                <table_1.TableHead>Paciente</table_1.TableHead>
                <table_1.TableHead>Contato</table_1.TableHead>
                <table_1.TableHead>Status</table_1.TableHead>
                <table_1.TableHead>Última Visita</table_1.TableHead>
                <table_1.TableHead>Ações</table_1.TableHead>
              </table_1.TableRow>
            </table_1.TableHeader>
            <table_1.TableBody>
              {patients.map((patient) => (
                <table_1.TableRow key={patient.id}>
                  <table_1.TableCell>
                    <div className="flex items-center space-x-3">
                      <avatar_1.Avatar className="h-8 w-8">
                        <avatar_1.AvatarImage src={patient.avatar_url} />
                        <avatar_1.AvatarFallback>
                          <lucide_react_1.User className="h-4 w-4" />
                        </avatar_1.AvatarFallback>
                      </avatar_1.Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">
                          {patient.birth_date && formatDate(patient.birth_date)}
                        </p>
                      </div>
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <div className="space-y-1">
                      {patient.email && (
                        <div className="flex items-center text-sm">
                          <lucide_react_1.Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center text-sm">
                          <lucide_react_1.Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                      )}
                    </div>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <badge_1.Badge className={getStatusBadgeColor(patient.status)}>
                      {patient.status}
                    </badge_1.Badge>
                  </table_1.TableCell>
                  <table_1.TableCell>
                    {patient.last_visit ? formatDate(patient.last_visit) : "Nunca"}
                  </table_1.TableCell>
                  <table_1.TableCell>
                    <button_1.Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onPatientSelect === null || onPatientSelect === void 0
                          ? void 0
                          : onPatientSelect(patient)
                      }
                    >
                      <lucide_react_1.Eye className="h-4 w-4" />
                    </button_1.Button>
                  </table_1.TableCell>
                </table_1.TableRow>
              ))}
            </table_1.TableBody>
          </table_1.Table>
        </div>

        {/* Optimized Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <lucide_react_1.ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button_1.Button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <button_1.Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
              <lucide_react_1.ChevronRight className="h-4 w-4 ml-1" />
            </button_1.Button>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
