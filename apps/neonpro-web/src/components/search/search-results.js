// components/search/search-results.tsx
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
exports.default = SearchResults;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function SearchResults(_a) {
  var results = _a.results,
    totalCount = _a.totalCount,
    query = _a.query,
    onResultClick = _a.onResultClick,
    onLoadMore = _a.onLoadMore,
    _b = _a.hasMore,
    hasMore = _b === void 0 ? false : _b,
    _c = _a.loading,
    loading = _c === void 0 ? false : _c;
  var _d = (0, react_1.useState)("list"),
    viewMode = _d[0],
    setViewMode = _d[1];
  var _e = (0, react_1.useState)("relevance"),
    sortBy = _e[0],
    setSortBy = _e[1];
  var _f = (0, react_1.useState)("all"),
    filterByType = _f[0],
    setFilterByType = _f[1];
  var getTypeIcon = (type) => {
    var iconMap = {
      patients: lucide_react_1.User,
      appointments: lucide_react_1.Calendar,
      medical_records: lucide_react_1.FileText,
      lab_results: lucide_react_1.Activity,
      medications: lucide_react_1.FileText,
      documents: lucide_react_1.FileText,
      insights: lucide_react_1.Brain,
      timeline_events: lucide_react_1.Activity,
      duplicates: lucide_react_1.Users,
      photos: lucide_react_1.Camera,
    };
    var IconComponent = iconMap[type] || lucide_react_1.FileText;
    return <IconComponent className="h-4 w-4" />;
  };
  var getTypeColor = (type) => {
    var colorMap = {
      patients: "bg-blue-100 text-blue-800",
      appointments: "bg-green-100 text-green-800",
      medical_records: "bg-purple-100 text-purple-800",
      lab_results: "bg-orange-100 text-orange-800",
      medications: "bg-pink-100 text-pink-800",
      documents: "bg-gray-100 text-gray-800",
      insights: "bg-indigo-100 text-indigo-800",
      timeline_events: "bg-teal-100 text-teal-800",
      duplicates: "bg-red-100 text-red-800",
      photos: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[type] || "bg-gray-100 text-gray-800";
  };
  var filteredResults = results.filter(
    (result) => filterByType === "all" || result.type === filterByType,
  );
  var sortedResults = __spreadArray([], filteredResults, true).sort((a, b) => {
    var _a, _b;
    switch (sortBy) {
      case "relevance":
        return b.relevanceScore - a.relevanceScore;
      case "date":
        // Assumindo que temos data no metadata
        return (
          new Date(
            ((_a = b.metadata) === null || _a === void 0 ? void 0 : _a.date) || 0,
          ).getTime() -
          new Date(((_b = a.metadata) === null || _b === void 0 ? void 0 : _b.date) || 0).getTime()
        );
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  var typeGroups = results.reduce((groups, result) => {
    groups[result.type] = (groups[result.type] || 0) + 1;
    return groups;
  }, {});
  var exportResults = () => {
    var csvContent = __spreadArray(
      [["Tipo", "Título", "Descrição", "Relevância"]],
      sortedResults.map((result) => [
        result.type,
        result.title,
        result.description,
        (result.relevanceScore * 100).toFixed(1) + "%",
      ]),
      true,
    )
      .map((row) => row.join(","))
      .join("\n");
    var blob = new Blob([csvContent], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "search-results-".concat(query, ".csv");
    a.click();
    URL.revokeObjectURL(url);
  };
  var shareResults = () =>
    __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!navigator.share) return [3 /*break*/, 5];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              navigator.share({
                title: "Resultados da busca: ".concat(query),
                text: "".concat(totalCount, " resultados encontrados"),
                url: window.location.href,
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao compartilhar:", error_1);
            return [3 /*break*/, 4];
          case 4:
            return [3 /*break*/, 6];
          case 5:
            navigator.clipboard.writeText(window.location.href);
            alert("Link copiado para a área de transferência");
            _a.label = 6;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados para "{query}"</h1>
            <p className="text-gray-600">{totalCount} resultados encontrados</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <lucide_react_1.Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={shareResults}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <lucide_react_1.Share2 className="h-4 w-4" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Distribuição por tipo */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeGroups).map((_a) => {
            var type = _a[0],
              count = _a[1];
            return (
              <span
                key={type}
                className={"px-3 py-1 rounded-full text-sm font-medium ".concat(getTypeColor(type))}
              >
                {type}: {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Controles de visualização */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {/* Filtro por tipo */}
            <select
              value={filterByType}
              onChange={(e) => setFilterByType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="patients">Pacientes</option>
              <option value="appointments">Consultas</option>
              <option value="medical_records">Registros</option>
              <option value="insights">Insights</option>
              <option value="timeline_events">Timeline</option>
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="relevance">Relevância</option>
              <option value="date">Data</option>
              <option value="type">Tipo</option>
            </select>
          </div>

          {/* Modo de visualização */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={"p-2 ".concat(
                viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-600",
              )}
            >
              <lucide_react_1.List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={"p-2 ".concat(
                viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-600",
              )}
            >
              <lucide_react_1.Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-sm border">
        {sortedResults.length === 0
          ? <div className="p-8 text-center text-gray-500">
              Nenhum resultado encontrado com os filtros aplicados
            </div>
          : <>
              {viewMode === "list"
                ? <div className="divide-y divide-gray-100">
                    {sortedResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => onResultClick(result)}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={"p-2 rounded-lg ".concat(getTypeColor(result.type))}>
                            {getTypeIcon(result.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {result.title}
                              </h3>
                              <span
                                className={"px-2 py-1 rounded-full text-xs font-medium ".concat(
                                  getTypeColor(result.type),
                                )}
                              >
                                {result.type}
                              </span>
                            </div>

                            <p className="text-gray-600 mb-3">{result.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: "".concat(result.relevanceScore * 100, "%"),
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500">
                                  {(result.relevanceScore * 100).toFixed(0)}% relevante
                                </span>
                              </div>

                              {result.actions && (
                                <div className="flex gap-2">
                                  {result.actions.slice(0, 2).map((action) => (
                                    <button
                                      key={action.id}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (action.url) {
                                          window.open(action.url, "_blank");
                                        }
                                      }}
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                : <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => onResultClick(result)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={"p-2 rounded-lg ".concat(getTypeColor(result.type))}>
                            {getTypeIcon(result.type)}
                          </div>
                          <span
                            className={"px-2 py-1 rounded-full text-xs font-medium ".concat(
                              getTypeColor(result.type),
                            )}
                          >
                            {result.type}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {result.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: "".concat(result.relevanceScore * 100, "%") }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {(result.relevanceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>}

              {/* Botão carregar mais */}
              {hasMore && (
                <div className="p-6 border-t border-gray-100 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Carregando..." : "Carregar mais resultados"}
                  </button>
                </div>
              )}
            </>}
      </div>
    </div>
  );
}
