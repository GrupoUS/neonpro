/**
 * Smart Autocomplete Component
 * Story 3.4: Smart Search + NLP Integration - Task 4
 * Intelligent autocomplete with learning capabilities and contextual suggestions
 */
'use client';
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartAutocomplete = SmartAutocomplete;
exports.EnhancedSmartAutocomplete = EnhancedSmartAutocomplete;
var react_1 = require("react");
var command_1 = require("@/components/ui/command");
var popover_1 = require("@/components/ui/popover");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var use_debounce_1 = require("@/hooks/use-debounce");
var search_suggestions_1 = require("@/lib/search/search-suggestions");
function SmartAutocomplete(_a) {
    var _this = this;
    var value = _a.value, onValueChange = _a.onValueChange, onSuggestionSelect = _a.onSuggestionSelect, onSearch = _a.onSearch, context = _a.context, _b = _a.placeholder, placeholder = _b === void 0 ? "Buscar..." : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, className = _a.className, _d = _a.maxSuggestions, maxSuggestions = _d === void 0 ? 8 : _d, _e = _a.showCategories, showCategories = _e === void 0 ? true : _e, _f = _a.showIcons, showIcons = _f === void 0 ? true : _f, _g = _a.enableLearning, enableLearning = _g === void 0 ? true : _g;
    // State
    var _h = (0, react_1.useState)(false), open = _h[0], setOpen = _h[1];
    var _j = (0, react_1.useState)([]), suggestions = _j[0], setSuggestions = _j[1];
    var _k = (0, react_1.useState)(false), isLoading = _k[0], setIsLoading = _k[1];
    var _l = (0, react_1.useState)(-1), selectedIndex = _l[0], setSelectedIndex = _l[1];
    var _m = (0, react_1.useState)(0), interactionStartTime = _m[0], setInteractionStartTime = _m[1];
    // Refs
    var inputRef = (0, react_1.useRef)(null);
    var listRef = (0, react_1.useRef)(null);
    // Debounced value for API calls
    var debouncedValue = (0, use_debounce_1.useDebounce)(value, 300);
    // Load suggestions when debounced value changes
    (0, react_1.useEffect)(function () {
        if (debouncedValue.length >= 2) {
            loadSuggestions(debouncedValue);
        }
        else {
            setSuggestions([]);
            setOpen(false);
        }
    }, [debouncedValue]);
    // Load suggestions from API
    var loadSuggestions = (0, react_1.useCallback)(function (query) { return __awaiter(_this, void 0, void 0, function () {
        var options, results, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!query.trim())
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    options = {
                        maxSuggestions: maxSuggestions,
                        includeHistory: true,
                        includePopular: true,
                        includePersonalized: context.userPreferences.personalizedSuggestions,
                        includeContextual: true,
                        minConfidence: 0.3,
                        language: context.userPreferences.language
                    };
                    return [4 /*yield*/, search_suggestions_1.searchSuggestions.getSuggestions(query, context, options)];
                case 2:
                    results = _a.sent();
                    setSuggestions(results);
                    setOpen(results.length > 0);
                    setSelectedIndex(-1);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading suggestions:', error_1);
                    setSuggestions([]);
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [maxSuggestions, context]);
    // Handle input change
    var handleInputChange = function (newValue) {
        onValueChange(newValue);
        if (newValue.length >= 2 && !interactionStartTime) {
            setInteractionStartTime(Date.now());
        }
    };
    // Handle suggestion selection
    var handleSuggestionSelect = function (suggestion) { return __awaiter(_this, void 0, void 0, function () {
        var timeToSelect, learningData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    timeToSelect = interactionStartTime ? Date.now() - interactionStartTime : 0;
                    onValueChange(suggestion.text);
                    setOpen(false);
                    setSelectedIndex(-1);
                    // Trigger search if callback provided
                    if (onSearch) {
                        onSearch(suggestion.text);
                    }
                    // Notify parent component
                    if (onSuggestionSelect) {
                        onSuggestionSelect(suggestion);
                    }
                    if (!enableLearning) return [3 /*break*/, 2];
                    learningData = {
                        query: value,
                        selectedSuggestion: suggestion.text,
                        resultClicked: true,
                        timeToSelect: timeToSelect,
                        refinements: [],
                        success: true
                    };
                    return [4 /*yield*/, search_suggestions_1.searchSuggestions.learnFromInteraction(learningData)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    setInteractionStartTime(0);
                    return [2 /*return*/];
            }
        });
    }); };
    // Handle keyboard navigation
    var handleKeyDown = function (e) {
        var _a;
        if (!open || suggestions.length === 0)
            return;
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(function (prev) {
                    return prev < suggestions.length - 1 ? prev + 1 : 0;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(function (prev) {
                    return prev > 0 ? prev - 1 : suggestions.length - 1;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                }
                else if (value.trim()) {
                    // Search with current value
                    setOpen(false);
                    if (onSearch) {
                        onSearch(value);
                    }
                }
                break;
            case 'Escape':
                setOpen(false);
                setSelectedIndex(-1);
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                break;
        }
    };
    // Handle input focus
    var handleFocus = function () {
        if (value.length >= 2 && suggestions.length > 0) {
            setOpen(true);
        }
    };
    // Handle input blur
    var handleBlur = function () {
        // Delay closing to allow for suggestion clicks
        setTimeout(function () {
            setOpen(false);
            setSelectedIndex(-1);
        }, 200);
    };
    // Get suggestion icon
    var getSuggestionIcon = function (suggestion) {
        if (!showIcons)
            return null;
        var iconMap = {
            'query_completion': <lucide_react_1.Sparkles className="h-4 w-4 text-blue-500"/>,
            'entity_suggestion': <lucide_react_1.Target className="h-4 w-4 text-green-500"/>,
            'historical': <lucide_react_1.History className="h-4 w-4 text-gray-500"/>,
            'popular': <lucide_react_1.TrendingUp className="h-4 w-4 text-orange-500"/>,
            'contextual': <lucide_react_1.Brain className="h-4 w-4 text-purple-500"/>,
            'personalized': <lucide_react_1.User className="h-4 w-4 text-pink-500"/>,
            'semantic': <lucide_react_1.Zap className="h-4 w-4 text-yellow-500"/>,
            'filter_suggestion': <lucide_react_1.Filter className="h-4 w-4 text-indigo-500"/>
        };
        return iconMap[suggestion.type] || <lucide_react_1.Search className="h-4 w-4 text-gray-400"/>;
    };
    // Get suggestion category label
    var getCategoryLabel = function (category) {
        var labelMap = {
            'completion': 'Completar',
            'history': 'Histórico',
            'trending': 'Popular',
            'context': 'Contextual',
            'preferences': 'Personalizado',
            'patterns': 'Padrões',
            'similar': 'Similares',
            'session': 'Sessão'
        };
        return labelMap[category] || category;
    };
    // Group suggestions by category
    var groupedSuggestions = suggestions.reduce(function (groups, suggestion) {
        var category = suggestion.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(suggestion);
        return groups;
    }, {});
    // Get confidence color
    var getConfidenceColor = function (confidence) {
        if (confidence >= 0.8)
            return 'text-green-600';
        if (confidence >= 0.6)
            return 'text-yellow-600';
        return 'text-gray-500';
    };
    return (<div className={(0, utils_1.cn)("relative", className)}>
      <popover_1.Popover open={open} onOpenChange={setOpen}>
        <popover_1.PopoverTrigger asChild>
          <div className="relative">
            <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <input ref={inputRef} type="text" value={value} onChange={function (e) { return handleInputChange(e.target.value); }} onKeyDown={handleKeyDown} onFocus={handleFocus} onBlur={handleBlur} placeholder={placeholder} disabled={disabled} className={(0, utils_1.cn)("flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background", "file:border-0 file:bg-transparent file:text-sm file:font-medium", "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50")}/>
            {isLoading && (<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"/>
              </div>)}
          </div>
        </popover_1.PopoverTrigger>
        
        <popover_1.PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" side="bottom">
          <command_1.Command>
            <command_1.CommandList ref={listRef}>
              {suggestions.length === 0 ? (<command_1.CommandEmpty>
                  {isLoading ? (<div className="flex items-center justify-center py-6">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"/>
                      <span className="ml-2 text-sm text-muted-foreground">Carregando sugestões...</span>
                    </div>) : (<div className="flex flex-col items-center justify-center py-6">
                      <lucide_react_1.Search className="h-8 w-8 text-muted-foreground mb-2"/>
                      <span className="text-sm text-muted-foreground">Nenhuma sugestão encontrada</span>
                    </div>)}
                </command_1.CommandEmpty>) : (<scroll_area_1.ScrollArea className="max-h-80">
                  {showCategories ? (
            // Grouped by category
            Object.entries(groupedSuggestions).map(function (_a, categoryIndex) {
                var category = _a[0], categorySuggestions = _a[1];
                return (<div key={category}>
                        {categoryIndex > 0 && <separator_1.Separator className="my-1"/>}
                        
                        <command_1.CommandGroup heading={getCategoryLabel(category)}>
                          {categorySuggestions.map(function (suggestion, index) {
                        var _a;
                        var globalIndex = suggestions.findIndex(function (s) { return s.id === suggestion.id; });
                        var isSelected = selectedIndex === globalIndex;
                        return (<command_1.CommandItem key={suggestion.id} value={suggestion.text} onSelect={function () { return handleSuggestionSelect(suggestion); }} className={(0, utils_1.cn)("flex items-center justify-between px-3 py-2 cursor-pointer", "hover:bg-accent hover:text-accent-foreground", isSelected && "bg-accent text-accent-foreground")}>
                                <div className="flex items-center flex-1 min-w-0">
                                  {getSuggestionIcon(suggestion)}
                                  
                                  <div className="ml-3 flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate" dangerouslySetInnerHTML={{
                                __html: suggestion.highlighted || suggestion.text
                            }}/>
                                    
                                    {((_a = suggestion.metadata) === null || _a === void 0 ? void 0 : _a.context) && (<div className="text-xs text-muted-foreground mt-1">
                                        {suggestion.metadata.context}
                                      </div>)}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-2">
                                  {suggestion.frequency > 0 && (<badge_1.Badge variant="secondary" className="text-xs">
                                      {suggestion.frequency}
                                    </badge_1.Badge>)}
                                  
                                  <div className={(0, utils_1.cn)("text-xs font-medium", getConfidenceColor(suggestion.confidence))}>
                                    {Math.round(suggestion.confidence * 100)}%
                                  </div>
                                  
                                  <lucide_react_1.ChevronRight className="h-3 w-3 text-muted-foreground"/>
                                </div>
                              </command_1.CommandItem>);
                    })}
                        </command_1.CommandGroup>
                      </div>);
            })) : (
            // Flat list
            <command_1.CommandGroup>
                      {suggestions.map(function (suggestion, index) {
                    var _a;
                    var isSelected = selectedIndex === index;
                    return (<command_1.CommandItem key={suggestion.id} value={suggestion.text} onSelect={function () { return handleSuggestionSelect(suggestion); }} className={(0, utils_1.cn)("flex items-center justify-between px-3 py-2 cursor-pointer", "hover:bg-accent hover:text-accent-foreground", isSelected && "bg-accent text-accent-foreground")}>
                            <div className="flex items-center flex-1 min-w-0">
                              {getSuggestionIcon(suggestion)}
                              
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" dangerouslySetInnerHTML={{
                            __html: suggestion.highlighted || suggestion.text
                        }}/>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <badge_1.Badge variant="outline" className="text-xs">
                                    {getCategoryLabel(suggestion.category)}
                                  </badge_1.Badge>
                                  
                                  {((_a = suggestion.metadata) === null || _a === void 0 ? void 0 : _a.context) && (<span className="text-xs text-muted-foreground">
                                      {suggestion.metadata.context}
                                    </span>)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                              {suggestion.frequency > 0 && (<badge_1.Badge variant="secondary" className="text-xs">
                                  {suggestion.frequency}
                                </badge_1.Badge>)}
                              
                              <div className={(0, utils_1.cn)("text-xs font-medium", getConfidenceColor(suggestion.confidence))}>
                                {Math.round(suggestion.confidence * 100)}%
                              </div>
                              
                              <lucide_react_1.ChevronRight className="h-3 w-3 text-muted-foreground"/>
                            </div>
                          </command_1.CommandItem>);
                })}
                    </command_1.CommandGroup>)}
                </scroll_area_1.ScrollArea>)}
            </command_1.CommandList>
          </command_1.Command>
          
          {/* Footer with tips */}
          {suggestions.length > 0 && (<>
              <separator_1.Separator />
              <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
                <div className="flex items-center justify-between">
                  <span>Use ↑↓ para navegar, Enter para selecionar</span>
                  <div className="flex items-center gap-1">
                    <lucide_react_1.Brain className="h-3 w-3"/>
                    <span>IA Ativa</span>
                  </div>
                </div>
              </div>
            </>)}
        </popover_1.PopoverContent>
      </popover_1.Popover>
    </div>);
}
// Enhanced autocomplete with additional features
function EnhancedSmartAutocomplete(_a) {
    var value = _a.value, onValueChange = _a.onValueChange, onSuggestionSelect = _a.onSuggestionSelect, onSearch = _a.onSearch, context = _a.context, props = __rest(_a, ["value", "onValueChange", "onSuggestionSelect", "onSearch", "context"]);
    var _b = (0, react_1.useState)(false), showAdvanced = _b[0], setShowAdvanced = _b[1];
    var _c = (0, react_1.useState)({}), filters = _c[0], setFilters = _c[1];
    return (<div className="space-y-2">
      <SmartAutocomplete value={value} onValueChange={onValueChange} onSuggestionSelect={onSuggestionSelect} onSearch={onSearch} context={context} {...props}/>
      
      {/* Advanced options */}
      {showAdvanced && (<div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
          <button_1.Button variant="outline" size="sm" onClick={function () { return setShowAdvanced(false); }}>
            Ocultar Filtros
          </button_1.Button>
          
          {/* Add filter controls here */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <lucide_react_1.Filter className="h-4 w-4"/>
            <span>Filtros avançados disponíveis</span>
          </div>
        </div>)}
      
      {!showAdvanced && (<button_1.Button variant="ghost" size="sm" onClick={function () { return setShowAdvanced(true); }} className="text-xs text-muted-foreground">
          <lucide_react_1.Filter className="h-3 w-3 mr-1"/>
          Mostrar Filtros Avançados
        </button_1.Button>)}
    </div>);
}
