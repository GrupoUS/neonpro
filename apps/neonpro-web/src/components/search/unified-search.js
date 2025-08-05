// components/search/unified-search.tsx
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UnifiedSearch;
var search_client_1 = require("@/lib/search/search-client");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function UnifiedSearch(_a) {
  var _this = this;
  var onResultSelect = _a.onResultSelect,
    _b = _a.placeholder,
    placeholder = _b === void 0 ? "Buscar pacientes, consultas, registros..." : _b,
    _c = _a.showFilters,
    showFilters = _c === void 0 ? true : _c,
    _d = _a.showHistory,
    showHistory = _d === void 0 ? true : _d,
    _e = _a.initialQuery,
    initialQuery = _e === void 0 ? "" : _e,
    types = _a.types;
  var _f = (0, react_1.useState)(initialQuery),
    query = _f[0],
    setQuery = _f[1];
  var _g = (0, react_1.useState)([]),
    results = _g[0],
    setResults = _g[1];
  var _h = (0, react_1.useState)(false),
    loading = _h[0],
    setLoading = _h[1];
  var _j = (0, react_1.useState)(false),
    showResults = _j[0],
    setShowResults = _j[1];
  var _k = (0, react_1.useState)(null),
    searchStats = _k[0],
    setSearchStats = _k[1];
  var _l = (0, react_1.useState)(types || ["patients", "appointments", "medical_records"]),
    selectedTypes = _l[0],
    setSelectedTypes = _l[1];
  var _m = (0, react_1.useState)([]),
    searchHistory = _m[0],
    setSearchHistory = _m[1];
  var _o = (0, react_1.useState)([]),
    savedSearches = _o[0],
    setSavedSearches = _o[1];
  // Carrega histórico de busca do localStorage
  (0, react_1.useEffect)(function () {
    var history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    var saved = localStorage.getItem("savedSearches");
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);
  // Função de busca debounced
  var performSearch = (0, react_1.useCallback)(
    function (searchTerm) {
      return __awaiter(_this, void 0, void 0, function () {
        var searchQuery, response, newHistory, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!searchTerm.trim()) {
                setResults([]);
                setShowResults(false);
                return [2 /*return*/];
              }
              setLoading(true);
              setShowResults(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              searchQuery = {
                term: searchTerm,
                filters: {
                  types: selectedTypes,
                },
                options: {
                  limit: 20,
                  fuzzy: true,
                  highlight: true,
                },
              };
              return [4 /*yield*/, search_client_1.searchClient.search(searchQuery)];
            case 2:
              response = _a.sent();
              setResults(response.results);
              setSearchStats(response);
              newHistory = __spreadArray(
                [searchTerm],
                searchHistory.filter(function (h) {
                  return h !== searchTerm;
                }),
                true,
              ).slice(0, 10);
              setSearchHistory(newHistory);
              localStorage.setItem("searchHistory", JSON.stringify(newHistory));
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Erro na busca:", error_1);
              setResults([]);
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [selectedTypes, searchHistory],
  );
  // Debounce para busca automática
  (0, react_1.useEffect)(
    function () {
      var timer = setTimeout(function () {
        performSearch(query);
      }, 300);
      return function () {
        return clearTimeout(timer);
      };
    },
    [query, performSearch],
  );
  var handleResultClick = function (result) {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
    setShowResults(false);
  };
  var handleTypeToggle = function (type) {
    setSelectedTypes(function (prev) {
      return prev.includes(type)
        ? prev.filter(function (t) {
            return t !== type;
          })
        : __spreadArray(__spreadArray([], prev, true), [type], false);
    });
  };
  var saveCurrentSearch = function () {
    if (!query.trim()) return;
    var name = prompt("Nome para esta busca:");
    if (name) {
      var newSaved = __spreadArray(
        __spreadArray([], savedSearches, true),
        [{ name: name, query: query }],
        false,
      );
      setSavedSearches(newSaved);
      localStorage.setItem("savedSearches", JSON.stringify(newSaved));
    }
  };
  var loadSavedSearch = function (savedQuery) {
    setQuery(savedQuery);
    setShowResults(false);
  };
  var getTypeIcon = function (type) {
    var icons = {
      patients: "👤",
      appointments: "📅",
      medical_records: "📋",
      lab_results: "🧪",
      medications: "💊",
      documents: "📄",
      insights: "🧠",
      timeline_events: "📈",
      duplicates: "👥",
      photos: "📸",
    };
    return icons[type] || "📄";
  };
  var getTypeLabel = function (type) {
    var labels = {
      patients: "Pacientes",
      appointments: "Consultas",
      medical_records: "Registros",
      lab_results: "Exames",
      medications: "Medicamentos",
      documents: "Documentos",
      insights: "Insights",
      timeline_events: "Timeline",
      duplicates: "Duplicatas",
      photos: "Fotos",
    };
    return labels[type] || type;
  };
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="relative flex items-center">
          <lucide_react_1.Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={function (e) {
              return setQuery(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />

          {query && (
            <button
              onClick={function () {
                return setQuery("");
              }}
              className="absolute right-12 p-1 text-gray-400 hover:text-gray-600"
            >
              <lucide_react_1.X className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={saveCurrentSearch}
            disabled={!query.trim()}
            className="absolute right-3 p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
            title="Salvar busca"
          >
            <lucide_react_1.Bookmark className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Filtros de tipo */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {["patients", "appointments", "medical_records", "insights", "timeline_events"].map(
            function (type) {
              return (
                <button
                  key={type}
                  onClick={function () {
                    return handleTypeToggle(type);
                  }}
                  className={"flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ".concat(
                    selectedTypes.includes(type)
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200",
                  )}
                >
                  <span>{getTypeIcon(type)}</span>
                  {getTypeLabel(type)}
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Histórico e buscas salvas */}
      {showHistory && !query && !showResults && (
        <div className="mt-4 space-y-3">
          {searchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <lucide_react_1.Clock className="h-4 w-4" />
                Buscas recentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map(function (term, index) {
                  return (
                    <button
                      key={index}
                      onClick={function () {
                        return setQuery(term);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {savedSearches.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <lucide_react_1.Bookmark className="h-4 w-4" />
                Buscas salvas
              </h3>
              <div className="space-y-1">
                {savedSearches.slice(0, 3).map(function (saved, index) {
                  return (
                    <button
                      key={index}
                      onClick={function () {
                        return loadSavedSearch(saved.query);
                      }}
                      className="flex justify-between items-center w-full p-2 text-left rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium">{saved.name}</span>
                      <span className="text-xs text-gray-500">{saved.query}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          {searchStats && (
            <div className="p-3 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>
                {searchStats.totalCount} resultados em {searchStats.executionTime.toFixed(0)}ms
              </span>
              {searchStats.suggestions && searchStats.suggestions.length > 0 && (
                <span className="text-blue-600">
                  Você quis dizer: {searchStats.suggestions[0]}?
                </span>
              )}
            </div>
          )}

          {results.length === 0
            ? <div className="p-4 text-center text-gray-500">
                {loading ? "Buscando..." : "Nenhum resultado encontrado"}
              </div>
            : <div className="divide-y divide-gray-100">
                {results.map(function (result) {
                  return (
                    <button
                      key={result.id}
                      onClick={function () {
                        return handleResultClick(result);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getTypeIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{result.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: "".concat(result.relevanceScore * 100, "%") }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {(result.relevanceScore * 100).toFixed(0)}% relevante
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>}
        </div>
      )}

      {/* Overlay para fechar resultados */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={function () {
            return setShowResults(false);
          }}
        />
      )}
    </div>
  );
}
