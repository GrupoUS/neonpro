/**
 * Smart Search Component
 * Story 3.4: Smart Search + NLP Integration - Task 1
 * Intelligent search interface with NLP processing
 */
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
exports.SmartSearch = SmartSearch;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var use_debounce_1 = require("@/hooks/use-debounce");
var utils_1 = require("@/lib/utils");
/**
 * Smart Search Component with NLP Integration
 */
function SmartSearch(_a) {
  var onResultSelect = _a.onResultSelect,
    _b = _a.placeholder,
    placeholder = _b === void 0 ? "Pesquisar pacientes, consultas, tratamentos..." : _b,
    className = _a.className,
    _c = _a.showFilters,
    showFilters = _c === void 0 ? true : _c,
    _d = _a.showAnalytics,
    showAnalytics = _d === void 0 ? true : _d,
    contentTypes = _a.contentTypes,
    _e = _a.maxResults,
    maxResults = _e === void 0 ? 20 : _e;
  // State
  var _f = (0, react_1.useState)(""),
    query = _f[0],
    setQuery = _f[1];
  var _g = (0, react_1.useState)(false),
    isSearching = _g[0],
    setIsSearching = _g[1];
  var _h = (0, react_1.useState)([]),
    results = _h[0],
    setResults = _h[1];
  var _j = (0, react_1.useState)([]),
    suggestions = _j[0],
    setSuggestions = _j[1];
  var _k = (0, react_1.useState)(null),
    nlpAnalysis = _k[0],
    setNlpAnalysis = _k[1];
  var _l = (0, react_1.useState)(false),
    showSuggestions = _l[0],
    setShowSuggestions = _l[1];
  var _m = (0, react_1.useState)([]),
    selectedFilters = _m[0],
    setSelectedFilters = _m[1];
  var _o = (0, react_1.useState)([]),
    recentSearches = _o[0],
    setRecentSearches = _o[1];
  var _p = (0, react_1.useState)(false),
    isVoiceActive = _p[0],
    setIsVoiceActive = _p[1];
  var _q = (0, react_1.useState)(0),
    totalResults = _q[0],
    setTotalResults = _q[1];
  var _r = (0, react_1.useState)(0),
    searchTime = _r[0],
    setSearchTime = _r[1];
  // Refs
  var searchInputRef = (0, react_1.useRef)(null);
  var suggestionsRef = (0, react_1.useRef)(null);
  var recognition = (0, react_1.useRef)(null);
  // Debounced query for suggestions
  var debouncedQuery = (0, use_debounce_1.useDebounce)(query, 300);
  // Available content types
  var availableContentTypes = [
    { id: "patient", label: "Pacientes", icon: "👤" },
    { id: "appointment", label: "Consultas", icon: "📅" },
    { id: "treatment", label: "Tratamentos", icon: "💊" },
    { id: "note", label: "Anotações", icon: "📝" },
    { id: "file", label: "Arquivos", icon: "📄" },
    { id: "provider", label: "Profissionais", icon: "👨‍⚕️" },
  ];
  // Initialize speech recognition
  (0, react_1.useEffect)(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "pt-BR";
      recognition.current.onresult = (event) => {
        var transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsVoiceActive(false);
      };
      recognition.current.onerror = () => {
        setIsVoiceActive(false);
      };
      recognition.current.onend = () => {
        setIsVoiceActive(false);
      };
    }
  }, []);
  // Load recent searches from localStorage
  (0, react_1.useEffect)(() => {
    var saved = localStorage.getItem("smart-search-recent");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    }
  }, []);
  // Get suggestions when query changes
  (0, react_1.useEffect)(() => {
    if (debouncedQuery.length >= 2) {
      getSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);
  // Perform search
  var performSearch = (0, react_1.useCallback)(
    (searchQuery) =>
      __awaiter(this, void 0, void 0, function () {
        var startTime, response, data, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!searchQuery.trim()) {
                setResults([]);
                setNlpAnalysis(null);
                return [2 /*return*/];
              }
              setIsSearching(true);
              startTime = Date.now();
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch("/api/search", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    query: searchQuery,
                    language: "pt",
                    contentTypes: contentTypes || selectedFilters,
                    limit: maxResults,
                    includeAnalytics: showAnalytics,
                  }),
                }),
              ];
            case 2:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              if (data.success) {
                setResults(data.data.results);
                setTotalResults(data.data.totalCount);
                setNlpAnalysis(data.data.nlpAnalysis);
                setSearchTime(Date.now() - startTime);
                // Save to recent searches
                saveRecentSearch(searchQuery);
              } else {
                console.error("Search error:", data.error);
                setResults([]);
                setNlpAnalysis(null);
              }
              return [3 /*break*/, 6];
            case 4:
              error_1 = _a.sent();
              console.error("Search request error:", error_1);
              setResults([]);
              setNlpAnalysis(null);
              return [3 /*break*/, 6];
            case 5:
              setIsSearching(false);
              setShowSuggestions(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [contentTypes, selectedFilters, maxResults, showAnalytics],
  );
  // Get search suggestions
  var getSuggestions = (0, react_1.useCallback)(
    (searchQuery) =>
      __awaiter(this, void 0, void 0, function () {
        var response, data, apiSuggestions, recentSuggestions, error_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch(
                  "/api/search/suggestions?q=".concat(
                    encodeURIComponent(searchQuery),
                    "&lang=pt&limit=8",
                  ),
                ),
              ];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              if (data.success) {
                apiSuggestions = data.data.suggestions.map((text) => ({
                  text: text,
                  type: "nlp",
                }));
                recentSuggestions = recentSearches
                  .filter((recent) => recent.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 3)
                  .map((text) => ({ text: text, type: "recent" }));
                setSuggestions(
                  __spreadArray(__spreadArray([], recentSuggestions, true), apiSuggestions, true),
                );
                setShowSuggestions(true);
              }
              return [3 /*break*/, 4];
            case 3:
              error_2 = _a.sent();
              console.error("Error getting suggestions:", error_2);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [recentSearches],
  );
  // Save recent search
  var saveRecentSearch = (searchQuery) => {
    var updated = __spreadArray(
      [searchQuery],
      recentSearches.filter((s) => s !== searchQuery),
      true,
    ).slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("smart-search-recent", JSON.stringify(updated));
  };
  // Handle search submission
  var handleSearch = (searchQuery) => {
    var queryToSearch = searchQuery || query;
    if (queryToSearch.trim()) {
      performSearch(queryToSearch);
    }
  };
  // Handle voice search
  var handleVoiceSearch = () => {
    if (recognition.current && !isVoiceActive) {
      setIsVoiceActive(true);
      recognition.current.start();
    }
  };
  // Handle filter toggle
  var toggleFilter = (filterId) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : __spreadArray(__spreadArray([], prev, true), [filterId], false),
    );
  };
  // Handle suggestion click
  var handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };
  // Handle result click
  var handleResultClick = (result) => {
    onResultSelect === null || onResultSelect === void 0 ? void 0 : onResultSelect(result);
  };
  // Handle key press
  var handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };
  return (
    <div className={(0, utils_1.cn)("relative w-full max-w-4xl mx-auto", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <lucide_react_1.Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input_1.Input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            className="pl-10 pr-20 h-12 text-base"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {recognition.current && (
              <button_1.Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                disabled={isVoiceActive}
                className={(0, utils_1.cn)(
                  "h-8 w-8 p-0",
                  isVoiceActive && "text-red-500 animate-pulse",
                )}
              >
                <lucide_react_1.Mic className="h-4 w-4" />
              </button_1.Button>
            )}
            <button_1.Button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              size="sm"
              className="h-8"
            >
              {isSearching ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </button_1.Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <card_1.Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
            <card_1.CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.type === "recent"
                    ? <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
                    : <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground" />}
                  <span className="flex-1">{suggestion.text}</span>
                  {suggestion.count && (
                    <badge_1.Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </badge_1.Badge>
                  )}
                </div>
              ))}
            </card_1.CardContent>
          </card_1.Card>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {availableContentTypes.map((type) => (
            <button_1.Button
              key={type.id}
              variant={selectedFilters.includes(type.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(type.id)}
              className="h-8"
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button_1.Button>
          ))}
          {selectedFilters.length > 0 && (
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFilters([])}
              className="h-8 text-muted-foreground"
            >
              <lucide_react_1.X className="h-4 w-4 mr-1" />
              Limpar
            </button_1.Button>
          )}
        </div>
      )}

      {/* NLP Analysis */}
      {nlpAnalysis && showAnalytics && (
        <card_1.Card className="mt-4">
          <card_1.CardHeader className="pb-3">
            <card_1.CardTitle className="text-sm font-medium">Análise Inteligente</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Intenção:</span>
                <div className="flex items-center gap-2 mt-1">
                  <badge_1.Badge variant="outline">{nlpAnalysis.intent.primary}</badge_1.Badge>
                  <span className="text-muted-foreground">
                    {Math.round(nlpAnalysis.intent.confidence * 100)}%
                  </span>
                </div>
              </div>
              {nlpAnalysis.entities.length > 0 && (
                <div>
                  <span className="font-medium">Entidades:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nlpAnalysis.entities.map((entity, index) => (
                      <badge_1.Badge key={index} variant="secondary" className="text-xs">
                        {entity.value} ({entity.type})
                      </badge_1.Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium">Confiança:</span>
                <div className="mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: "".concat(nlpAnalysis.confidence * 100, "%") }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {Math.round(nlpAnalysis.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Search Results */}
      {(results.length > 0 || isSearching) && (
        <card_1.Card className="mt-4">
          <card_1.CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <card_1.CardTitle className="text-base">
                {isSearching ? "Pesquisando..." : "".concat(totalResults, " resultados")}
              </card_1.CardTitle>
              {searchTime > 0 && (
                <span className="text-sm text-muted-foreground">{searchTime}ms</span>
              )}
            </div>
          </card_1.CardHeader>
          <card_1.CardContent className="pt-0">
            {isSearching
              ? <div className="flex items-center justify-center py-8">
                  <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Processando consulta...</span>
                </div>
              : results.length > 0
                ? <div className="space-y-3">
                    {results.map((result, index) => {
                      var _a;
                      return (
                        <div
                          key={result.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <badge_1.Badge variant="outline" className="text-xs">
                                  {((_a = availableContentTypes.find(
                                    (t) => t.id === result.contentType,
                                  )) === null || _a === void 0
                                    ? void 0
                                    : _a.label) || result.contentType}
                                </badge_1.Badge>
                                <span className="text-sm text-muted-foreground">
                                  Relevância: {Math.round(result.relevanceScore * 100)}%
                                </span>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{result.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.highlightedText || result.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                : <div className="text-center py-8 text-muted-foreground">
                    <lucide_react_1.Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum resultado encontrado para "{query}"</p>
                    {(nlpAnalysis === null || nlpAnalysis === void 0
                      ? void 0
                      : nlpAnalysis.suggestions) &&
                      nlpAnalysis.suggestions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm mb-2">Tente pesquisar por:</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {nlpAnalysis.suggestions.map((suggestion, index) => (
                              <button_1.Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleSearch(suggestion)}
                              >
                                {suggestion}
                              </button_1.Button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>}
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
exports.default = SmartSearch;
