/**
 * Smart Search Interface Component
 *
 * Provides a conversational search interface with NLP capabilities.
 * Supports natural language queries and intelligent result display.
 *
 * @module smart-search-interface
 * @version 1.0.0
 */
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
exports.SmartSearchInterface = SmartSearchInterface;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var scroll_area_1 = require("@/components/ui/scroll-area");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var DEFAULT_FILTERS = {
  types: ["patients", "appointments", "medical_records", "timeline_events"],
  sortBy: "relevance",
  includeInactive: false,
};
function SmartSearchInterface(_a) {
  var userId = _a.userId,
    _b = _a.userRole,
    userRole = _b === void 0 ? "user" : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c,
    onResultSelect = _a.onResultSelect,
    _d = _a.initialQuery,
    initialQuery = _d === void 0 ? "" : _d,
    _e = _a.maxResults,
    maxResults = _e === void 0 ? 20 : _e,
    _f = _a.enableFilters,
    enableFilters = _f === void 0 ? true : _f,
    _g = _a.enableNLP,
    enableNLP = _g === void 0 ? true : _g;
  var _h = (0, react_1.useState)(initialQuery),
    query = _h[0],
    setQuery = _h[1];
  var _j = (0, react_1.useState)(false),
    isSearching = _j[0],
    setIsSearching = _j[1];
  var _k = (0, react_1.useState)(null),
    searchResponse = _k[0],
    setSearchResponse = _k[1];
  var _l = (0, react_1.useState)(DEFAULT_FILTERS),
    filters = _l[0],
    setFilters = _l[1];
  var _m = (0, react_1.useState)(false),
    showFilters = _m[0],
    setShowFilters = _m[1];
  var _o = (0, react_1.useState)([]),
    searchHistory = _o[0],
    setSearchHistory = _o[1];
  var _p = (0, react_1.useState)("all"),
    selectedTab = _p[0],
    setSelectedTab = _p[1];
  var inputRef = (0, react_1.useRef)(null);
  var searchTimeoutRef = (0, react_1.useRef)(null);
  // Debounced search function
  var performSearch = (0, react_1.useCallback)(
    (searchTerm_1) => {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        this,
        __spreadArray([searchTerm_1], args_1, true),
        void 0,
        function (searchTerm, searchFilters) {
          var response, apiResponse, apiResponse, error_1;
          if (searchFilters === void 0) {
            searchFilters = filters;
          }
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                if (!searchTerm.trim()) {
                  setSearchResponse(null);
                  return [2 /*return*/];
                }
                setIsSearching(true);
                _a.label = 1;
              case 1:
                _a.trys.push([1, 8, 9, 10]);
                response = void 0;
                if (!enableNLP) return [3 /*break*/, 4];
                return [
                  4 /*yield*/,
                  fetch("/api/search/conversational", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      term: searchTerm,
                      userId: userId,
                      userRole: userRole,
                    }),
                  }),
                ];
              case 2:
                apiResponse = _a.sent();
                return [4 /*yield*/, apiResponse.json()];
              case 3:
                response = _a.sent();
                return [3 /*break*/, 7];
              case 4:
                return [
                  4 /*yield*/,
                  fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      term: searchTerm,
                      filters: {
                        types: searchFilters.types,
                        dateRange: searchFilters.dateRange
                          ? {
                              start: new Date(searchFilters.dateRange.start),
                              end: new Date(searchFilters.dateRange.end),
                            }
                          : undefined,
                      },
                      options: {
                        useNLP: false,
                        limit: maxResults,
                        sortBy: searchFilters.sortBy,
                      },
                    }),
                  }),
                ];
              case 5:
                apiResponse = _a.sent();
                return [4 /*yield*/, apiResponse.json()];
              case 6:
                response = _a.sent();
                _a.label = 7;
              case 7:
                setSearchResponse(response);
                // Add to search history
                if (!searchHistory.includes(searchTerm)) {
                  setSearchHistory((prev) => __spreadArray([searchTerm], prev.slice(0, 4), true));
                }
                return [3 /*break*/, 10];
              case 8:
                error_1 = _a.sent();
                console.error("Search error:", error_1);
                setSearchResponse(null);
                return [3 /*break*/, 10];
              case 9:
                setIsSearching(false);
                return [7 /*endfinally*/];
              case 10:
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [userId, userRole, enableNLP, maxResults, filters, searchHistory],
  );
  // Handle search input change with debouncing
  var handleSearchChange = (value) => {
    setQuery(value);
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };
  // Handle immediate search (Enter key or search button)
  var handleSearchSubmit = (e) => {
    e === null || e === void 0 ? void 0 : e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch(query);
  };
  // Filter results by type for tabs
  var getFilteredResults = (type) => {
    if (!searchResponse) return [];
    if (type === "all") return searchResponse.results;
    return searchResponse.results.filter((result) => result.type === type);
  };
  // Get icon for search result type
  var getTypeIcon = (type) => {
    var iconMap = {
      patients: lucide_react_1.User,
      appointments: lucide_react_1.Calendar,
      medical_records: lucide_react_1.FileText,
      timeline_events: lucide_react_1.Activity,
      insights: lucide_react_1.MessageCircle,
      lab_results: lucide_react_1.FileText,
      medications: lucide_react_1.FileText,
      documents: lucide_react_1.FileText,
      duplicates: lucide_react_1.User,
      photos: lucide_react_1.User,
    };
    var IconComponent = iconMap[type] || lucide_react_1.FileText;
    return <IconComponent className="w-4 h-4" />;
  };
  // Get type label in Portuguese
  var getTypeLabel = (type) => {
    var labelMap = {
      patients: "Pacientes",
      appointments: "Agendamentos",
      medical_records: "Registros Médicos",
      timeline_events: "Timeline",
      insights: "Insights",
      lab_results: "Exames",
      medications: "Medicamentos",
      documents: "Documentos",
      duplicates: "Duplicatas",
      photos: "Fotos",
    };
    return labelMap[type] || type;
  };
  // Handle result selection
  var handleResultClick = (result) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
  };
  // Get result counts by type
  var getResultCounts = () => {
    if (!searchResponse) return {};
    var counts = {
      all: searchResponse.results.length,
    };
    for (var _i = 0, _a = searchResponse.results; _i < _a.length; _i++) {
      var result = _a[_i];
      counts[result.type] = (counts[result.type] || 0) + 1;
    }
    return counts;
  };
  var resultCounts = getResultCounts();
  // Focus input on mount
  (0, react_1.useEffect)(() => {
    if (inputRef.current && !initialQuery) {
      inputRef.current.focus();
    }
  }, [initialQuery]);
  // Perform initial search if query provided
  (0, react_1.useEffect)(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);
  return (
    <div className={"space-y-4 ".concat(className)}>
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input_1.Input
            ref={inputRef}
            type="text"
            placeholder={
              enableNLP
                ? "Busque de forma natural: 'pacientes com botox hoje', 'João Silva consultas'..."
                : "Buscar pacientes, consultas, registros..."
            }
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {enableFilters && (
              <dialog_1.Dialog open={showFilters} onOpenChange={setShowFilters}>
                <dialog_1.DialogTrigger asChild>
                  <button_1.Button type="button" variant="ghost" size="sm" className="px-2">
                    <lucide_react_1.Filter className="w-4 h-4" />
                  </button_1.Button>
                </dialog_1.DialogTrigger>
                <dialog_1.DialogContent>
                  <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Filtros de Busca</dialog_1.DialogTitle>
                  </dialog_1.DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label_1.Label>Tipos de Conteúdo</label_1.Label>
                      <div className="mt-2 space-y-2">
                        {[
                          "patients",
                          "appointments",
                          "medical_records",
                          "timeline_events",
                          "insights",
                        ].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <checkbox_1.Checkbox
                              id={type}
                              checked={filters.types.includes(type)}
                              onCheckedChange={(checked) => {
                                setFilters((prev) =>
                                  __assign(__assign({}, prev), {
                                    types: checked
                                      ? __spreadArray(
                                          __spreadArray([], prev.types, true),
                                          [type],
                                          false,
                                        )
                                      : prev.types.filter((t) => t !== type),
                                  }),
                                );
                              }}
                            />
                            <label_1.Label htmlFor={type}>{getTypeLabel(type)}</label_1.Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label_1.Label>Ordenação</label_1.Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { value: "relevance", label: "Relevância" },
                          { value: "date", label: "Data" },
                          { value: "name", label: "Nome" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <checkbox_1.Checkbox
                              id={option.value}
                              checked={filters.sortBy === option.value}
                              onCheckedChange={() => {
                                setFilters((prev) =>
                                  __assign(__assign({}, prev), { sortBy: option.value }),
                                );
                              }}
                            />
                            <label_1.Label htmlFor={option.value}>{option.label}</label_1.Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="includeInactive"
                        checked={filters.includeInactive}
                        onCheckedChange={(checked) => {
                          setFilters((prev) =>
                            __assign(__assign({}, prev), { includeInactive: !!checked }),
                          );
                        }}
                      />
                      <label_1.Label htmlFor="includeInactive">
                        Incluir registros inativos
                      </label_1.Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button_1.Button variant="outline" onClick={() => setShowFilters(false)}>
                        Cancelar
                      </button_1.Button>
                      <button_1.Button
                        onClick={() => {
                          setShowFilters(false);
                          performSearch(query, filters);
                        }}
                      >
                        Aplicar Filtros
                      </button_1.Button>
                    </div>
                  </div>
                </dialog_1.DialogContent>
              </dialog_1.Dialog>
            )}

            <button_1.Button type="submit" size="sm" className="px-3" disabled={isSearching}>
              {isSearching
                ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin" />
                : <lucide_react_1.Search className="w-4 h-4" />}
            </button_1.Button>
          </div>
        </div>
      </form>

      {/* Search History */}
      {searchHistory.length > 0 && !searchResponse && (
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Clock className="w-4 h-4 mr-2" />
              Buscas Recentes
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <badge_1.Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                >
                  {term}
                </badge_1.Badge>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* NLP Analysis Display */}
      {enableNLP &&
        (searchResponse === null || searchResponse === void 0
          ? void 0
          : searchResponse.nlpAnalysis) && (
          <card_1.Card className="border-blue-200 bg-blue-50/50">
            <card_1.CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <lucide_react_1.MessageCircle className="w-4 h-4" />
                <span className="font-medium">Análise Inteligente:</span>
                <span>
                  {searchResponse.nlpAnalysis.intent.action}{" "}
                  {searchResponse.nlpAnalysis.intent.target}
                </span>
                {searchResponse.nlpAnalysis.entities.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {searchResponse.nlpAnalysis.entities
                        .map((e) => "".concat(e.type, ": ").concat(e.value))
                        .join(", ")}
                    </span>
                  </>
                )}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        )}

      {/* Search Results */}
      {searchResponse && (
        <div className="space-y-4">
          {/* Search Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {searchResponse.totalCount} resultados em {searchResponse.executionTime.toFixed(0)}ms
            </span>
            {enableNLP && searchResponse.nlpAnalysis && (
              <badge_1.Badge variant="secondary" className="text-xs">
                NLP Ativo
              </badge_1.Badge>
            )}
          </div>

          {/* Results Tabs */}
          <tabs_1.Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value)}>
            <tabs_1.TabsList className="grid w-full grid-cols-6">
              <tabs_1.TabsTrigger value="all" className="flex items-center space-x-1">
                <span>Todos</span>
                {resultCounts.all > 0 && (
                  <badge_1.Badge variant="secondary" className="ml-1 text-xs">
                    {resultCounts.all}
                  </badge_1.Badge>
                )}
              </tabs_1.TabsTrigger>

              {["patients", "appointments", "medical_records", "timeline_events", "insights"].map(
                (type) => {
                  var count = resultCounts[type] || 0;
                  if (count === 0) return null;
                  return (
                    <tabs_1.TabsTrigger
                      key={type}
                      value={type}
                      className="flex items-center space-x-1"
                    >
                      {getTypeIcon(type)}
                      <span className="hidden sm:inline">{getTypeLabel(type)}</span>
                      <badge_1.Badge variant="secondary" className="ml-1 text-xs">
                        {count}
                      </badge_1.Badge>
                    </tabs_1.TabsTrigger>
                  );
                },
              )}
            </tabs_1.TabsList>

            {/* Results Content */}
            <div className="mt-4">
              <scroll_area_1.ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {getFilteredResults(selectedTab).map((result, index) => (
                    <card_1.Card
                      key={result.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleResultClick(result)}
                    >
                      <card_1.CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(result.type)}
                              <badge_1.Badge variant="outline" className="text-xs">
                                {getTypeLabel(result.type)}
                              </badge_1.Badge>
                              <badge_1.Badge variant="secondary" className="text-xs">
                                {Math.round(result.relevanceScore * 100)}% relevante
                              </badge_1.Badge>
                            </div>

                            <h3 className="font-semibold text-sm mb-1">{result.title}</h3>

                            <p className="text-sm text-muted-foreground mb-2">
                              {result.description}
                            </p>

                            {/* Highlights */}
                            {result.highlights && result.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {result.highlights.map((highlight, i) => (
                                  <badge_1.Badge key={i} variant="secondary" className="text-xs">
                                    {highlight}
                                  </badge_1.Badge>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            {result.actions && result.actions.length > 0 && (
                              <div className="flex space-x-2">
                                {result.actions.map((action) => (
                                  <button_1.Button
                                    key={action.id}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (action.url) {
                                        window.location.href = action.url;
                                      }
                                    }}
                                  >
                                    {action.label}
                                  </button_1.Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  ))}
                </div>
              </scroll_area_1.ScrollArea>
            </div>
          </tabs_1.Tabs>

          {/* Suggestions */}
          {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm">Sugestões</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchResponse.suggestions.map((suggestion, index) => (
                    <badge_1.Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </badge_1.Badge>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {query && searchResponse && searchResponse.results.length === 0 && (
        <card_1.Card>
          <card_1.CardContent className="py-8 text-center">
            <lucide_react_1.Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tente ajustar sua busca ou usar termos diferentes.
            </p>
            {searchResponse.suggestions && searchResponse.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Que tal tentar:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {searchResponse.suggestions.map((suggestion, index) => (
                    <badge_1.Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        setQuery(suggestion);
                        performSearch(suggestion);
                      }}
                    >
                      {suggestion}
                    </badge_1.Badge>
                  ))}
                </div>
              </div>
            )}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
exports.default = SmartSearchInterface;
