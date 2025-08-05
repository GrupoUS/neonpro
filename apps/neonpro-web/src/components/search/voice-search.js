/**
 * Voice Search Component
 * Story 3.4: Smart Search + NLP Integration - Task 5
 * Voice search interface with speech recognition and visual feedback
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
exports.VoiceSearch = VoiceSearch;
exports.VoiceSearchButton = VoiceSearchButton;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var scroll_area_1 = require("@/components/ui/scroll-area");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var voice_search_1 = require("@/lib/search/voice-search");
function VoiceSearch(_a) {
    var _this = this;
    var onSearchResults = _a.onSearchResults, onTranscriptChange = _a.onTranscriptChange, onError = _a.onError, className = _a.className, _b = _a.options, options = _b === void 0 ? {} : _b, _c = _a.showCommands, showCommands = _c === void 0 ? true : _c, _d = _a.showAnalytics, showAnalytics = _d === void 0 ? false : _d, _e = _a.autoStart, autoStart = _e === void 0 ? false : _e, userId = _a.userId;
    // State
    var _f = (0, react_1.useState)(false), isListening = _f[0], setIsListening = _f[1];
    var _g = (0, react_1.useState)(false), isProcessing = _g[0], setIsProcessing = _g[1];
    var _h = (0, react_1.useState)(''), currentTranscript = _h[0], setCurrentTranscript = _h[1];
    var _j = (0, react_1.useState)(''), interimTranscript = _j[0], setInterimTranscript = _j[1];
    var _k = (0, react_1.useState)(0), confidence = _k[0], setConfidence = _k[1];
    var _l = (0, react_1.useState)(null), session = _l[0], setSession = _l[1];
    var _m = (0, react_1.useState)([]), queries = _m[0], setQueries = _m[1];
    var _o = (0, react_1.useState)([]), errors = _o[0], setErrors = _o[1];
    var _p = (0, react_1.useState)(false), isSupported = _p[0], setIsSupported = _p[1];
    var _q = (0, react_1.useState)(false), permissionGranted = _q[0], setPermissionGranted = _q[1];
    var _r = (0, react_1.useState)(0), audioLevel = _r[0], setAudioLevel = _r[1];
    var _s = (0, react_1.useState)([]), commands = _s[0], setCommands = _s[1];
    var _t = (0, react_1.useState)(false), showHelp = _t[0], setShowHelp = _t[1];
    // Refs
    var audioLevelRef = (0, react_1.useRef)(0);
    var animationFrameRef = (0, react_1.useRef)(0);
    // Initialize voice search
    (0, react_1.useEffect)(function () {
        setIsSupported(voice_search_1.voiceSearch.isSupported());
        setCommands(voice_search_1.voiceSearch.getCommands());
        // Check microphone permission
        checkMicrophonePermission();
        // Setup event listeners
        var handleStart = function () {
            setIsListening(true);
            setErrors([]);
        };
        var handleEnd = function () {
            setIsListening(false);
            setInterimTranscript('');
            setAudioLevel(0);
        };
        var handleRecognition = function (result) {
            if (result.isFinal) {
                setCurrentTranscript(result.transcript);
                setInterimTranscript('');
                setConfidence(result.confidence);
                if (onTranscriptChange) {
                    onTranscriptChange(result.transcript);
                }
            }
            else {
                setInterimTranscript(result.transcript);
            }
        };
        var handleQueryProcessed = function (query) {
            setQueries(function (prev) { return __spreadArray(__spreadArray([], prev, true), [query], false); });
            setIsProcessing(false);
            if (query.searchResults && onSearchResults) {
                onSearchResults(query.searchResults);
            }
        };
        var handleQueryError = function (_a) {
            var query = _a.query, error = _a.error;
            setQueries(function (prev) { return __spreadArray(__spreadArray([], prev, true), [query], false); });
            setIsProcessing(false);
            var voiceError = {
                type: 'processing',
                message: error,
                timestamp: Date.now()
            };
            setErrors(function (prev) { return __spreadArray(__spreadArray([], prev, true), [voiceError], false); });
            if (onError) {
                onError(voiceError);
            }
        };
        var handleError = function (error) {
            setErrors(function (prev) { return __spreadArray(__spreadArray([], prev, true), [error], false); });
            setIsListening(false);
            setIsProcessing(false);
            if (onError) {
                onError(error);
            }
        };
        var handleSessionStart = function (newSession) {
            setSession(newSession);
            setQueries([]);
            setErrors([]);
        };
        var handleSessionEnd = function (endedSession) {
            setSession(null);
        };
        var handleSearchResults = function (_a) {
            var results = _a.results;
            setIsProcessing(false);
            if (onSearchResults) {
                onSearchResults(results);
            }
        };
        var handleHelpCommand = function (_a) {
            var commands = _a.commands;
            setShowHelp(true);
        };
        // Register event listeners
        voice_search_1.voiceSearch.on('start', handleStart);
        voice_search_1.voiceSearch.on('end', handleEnd);
        voice_search_1.voiceSearch.on('recognition', handleRecognition);
        voice_search_1.voiceSearch.on('queryProcessed', handleQueryProcessed);
        voice_search_1.voiceSearch.on('queryError', handleQueryError);
        voice_search_1.voiceSearch.on('error', handleError);
        voice_search_1.voiceSearch.on('sessionStart', handleSessionStart);
        voice_search_1.voiceSearch.on('sessionEnd', handleSessionEnd);
        voice_search_1.voiceSearch.on('searchResults', handleSearchResults);
        voice_search_1.voiceSearch.on('helpCommand', handleHelpCommand);
        // Auto-start if requested
        if (autoStart && isSupported) {
            startVoiceSearch();
        }
        return function () {
            // Cleanup event listeners
            voice_search_1.voiceSearch.off('start', handleStart);
            voice_search_1.voiceSearch.off('end', handleEnd);
            voice_search_1.voiceSearch.off('recognition', handleRecognition);
            voice_search_1.voiceSearch.off('queryProcessed', handleQueryProcessed);
            voice_search_1.voiceSearch.off('queryError', handleQueryError);
            voice_search_1.voiceSearch.off('error', handleError);
            voice_search_1.voiceSearch.off('sessionStart', handleSessionStart);
            voice_search_1.voiceSearch.off('sessionEnd', handleSessionEnd);
            voice_search_1.voiceSearch.off('searchResults', handleSearchResults);
            voice_search_1.voiceSearch.off('helpCommand', handleHelpCommand);
            // Stop listening
            if (isListening) {
                stopVoiceSearch();
            }
            // Cancel animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [autoStart, isSupported, onSearchResults, onTranscriptChange, onError]);
    // Check microphone permission
    var checkMicrophonePermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true })];
                case 1:
                    stream = _a.sent();
                    setPermissionGranted(true);
                    stream.getTracks().forEach(function (track) { return track.stop(); });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    setPermissionGranted(false);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Start voice search
    var startVoiceSearch = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3, error_4, error_2, voiceError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isSupported) {
                        error_3 = {
                            type: 'recognition',
                            message: 'Reconhecimento de voz não suportado neste navegador',
                            timestamp: Date.now()
                        };
                        setErrors(function (prev) { return __spreadArray(__spreadArray([], prev, true), [error_3], false); });
                        return [2 /*return*/];
                    }
                    if (!!permissionGranted) return [3 /*break*/, 2];
                    return [4 /*yield*/, checkMicrophonePermission()];
                case 1:
                    _a.sent();
                    if (!permissionGranted) {
                        error_4 = {
                            type: 'permission',
                            message: 'Permissão de microfone negada',
                            timestamp: Date.now()
                        };
                        setErrors(function (prev) { return __spreadArray(__spreadArray([], prev, true), [error_4], false); });
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    if (!!session) return [3 /*break*/, 4];
                    return [4 /*yield*/, voice_search_1.voiceSearch.startSession(userId)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: 
                // Start listening
                return [4 /*yield*/, voice_search_1.voiceSearch.startListening()];
                case 5:
                    // Start listening
                    _a.sent();
                    setIsProcessing(true);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    voiceError_1 = {
                        type: 'recognition',
                        message: error_2 instanceof Error ? error_2.message : 'Falha ao iniciar reconhecimento de voz',
                        timestamp: Date.now()
                    };
                    setErrors(function (prev) { return __spreadArray(__spreadArray([], prev, true), [voiceError_1], false); });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Stop voice search
    var stopVoiceSearch = function () {
        voice_search_1.voiceSearch.stopListening();
        setIsProcessing(false);
    };
    // End session
    var endSession = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, voice_search_1.voiceSearch.endSession()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    // Get status color
    var getStatusColor = function () {
        if (errors.length > 0)
            return 'text-red-500';
        if (isListening)
            return 'text-green-500';
        if (isProcessing)
            return 'text-blue-500';
        return 'text-gray-500';
    };
    // Get status text
    var getStatusText = function () {
        if (errors.length > 0)
            return 'Erro';
        if (isListening)
            return 'Escutando...';
        if (isProcessing)
            return 'Processando...';
        return 'Pronto';
    };
    // Get confidence color
    var getConfidenceColor = function (conf) {
        if (conf >= 0.8)
            return 'text-green-600';
        if (conf >= 0.6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    // Format duration
    var formatDuration = function (ms) {
        var seconds = Math.floor(ms / 1000);
        var minutes = Math.floor(seconds / 60);
        return "".concat(minutes, ":").concat((seconds % 60).toString().padStart(2, '0'));
    };
    if (!isSupported) {
        return (<card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="pt-6">
          <alert_1.Alert>
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Reconhecimento de voz não é suportado neste navegador.
              Tente usar Chrome, Edge ou Safari mais recentes.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className={(0, utils_1.cn)("space-y-4", className)}>
      {/* Main Voice Control */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Mic className="h-5 w-5"/>
              Busca por Voz
            </card_1.CardTitle>
            
            <div className="flex items-center gap-2">
              <badge_1.Badge variant={isListening ? 'default' : 'secondary'} className={getStatusColor()}>
                {getStatusText()}
              </badge_1.Badge>
              
              {session && (<badge_1.Badge variant="outline">
                  {queries.length} consultas
                </badge_1.Badge>)}
            </div>
          </div>
        </card_1.CardHeader>
        
        <card_1.CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4">
            <button_1.Button size="lg" variant={isListening ? 'destructive' : 'default'} onClick={isListening ? stopVoiceSearch : startVoiceSearch} disabled={isProcessing} className="h-16 w-16 rounded-full">
              {isProcessing ? (<lucide_react_1.Loader2 className="h-6 w-6 animate-spin"/>) : isListening ? (<lucide_react_1.Square className="h-6 w-6"/>) : (<lucide_react_1.Mic className="h-6 w-6"/>)}
            </button_1.Button>
            
            {session && (<button_1.Button variant="outline" onClick={endSession} disabled={isListening || isProcessing}>
                Finalizar Sessão
              </button_1.Button>)}
            
            <button_1.Button variant="ghost" size="sm" onClick={function () { return setShowHelp(!showHelp); }}>
              <lucide_react_1.HelpCircle className="h-4 w-4 mr-2"/>
              Comandos
            </button_1.Button>
          </div>
          
          {/* Audio Level Indicator */}
          {isListening && (<div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível de Áudio</span>
                <span className={(0, utils_1.cn)("font-medium", audioLevel > 50 ? 'text-green-600' : 'text-gray-500')}>
                  {Math.round(audioLevel)}%
                </span>
              </div>
              <progress_1.Progress value={audioLevel} className="h-2"/>
            </div>)}
          
          {/* Transcript Display */}
          <div className="space-y-2">
            {(currentTranscript || interimTranscript) && (<div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {currentTranscript && (<p className="text-sm font-medium">
                        {currentTranscript}
                      </p>)}
                    
                    {interimTranscript && (<p className="text-sm text-muted-foreground italic">
                        {interimTranscript}
                      </p>)}
                  </div>
                  
                  {confidence > 0 && (<badge_1.Badge variant="outline" className={getConfidenceColor(confidence)}>
                      {Math.round(confidence * 100)}%
                    </badge_1.Badge>)}
                </div>
              </div>)}
          </div>
          
          {/* Errors */}
          {errors.length > 0 && (<alert_1.Alert variant="destructive">
              <lucide_react_1.XCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                {errors[errors.length - 1].message}
              </alert_1.AlertDescription>
            </alert_1.Alert>)}
          
          {/* Permission Warning */}
          {!permissionGranted && (<alert_1.Alert>
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                Permissão de microfone necessária para busca por voz.
                <button_1.Button variant="link" className="p-0 h-auto ml-2" onClick={checkMicrophonePermission}>
                  Verificar permissão
                </button_1.Button>
              </alert_1.AlertDescription>
            </alert_1.Alert>)}
        </card_1.CardContent>
      </card_1.Card>
      
      {/* Voice Commands Help */}
      {showHelp && showCommands && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Brain className="h-5 w-5"/>
              Comandos de Voz Disponíveis
            </card_1.CardTitle>
          </card_1.CardHeader>
          
          <card_1.CardContent>
            <scroll_area_1.ScrollArea className="h-64">
              <div className="space-y-4">
                {Object.entries(commands.reduce(function (groups, cmd) {
                if (!groups[cmd.category])
                    groups[cmd.category] = [];
                groups[cmd.category].push(cmd);
                return groups;
            }, {})).map(function (_a) {
                var category = _a[0], categoryCommands = _a[1];
                return (<div key={category}>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {category === 'search' ? 'Busca' :
                        category === 'filter' ? 'Filtros' :
                            category === 'action' ? 'Ações' :
                                category === 'system' ? 'Sistema' : category}
                    </h4>
                    
                    <div className="space-y-2">
                      {categoryCommands.map(function (command) { return (<div key={command.id} className="p-2 bg-muted/50 rounded">
                          <div className="font-medium text-sm">{command.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Exemplos: {command.examples.join(', ')}
                          </div>
                        </div>); })}
                    </div>
                  </div>);
            })}
              </div>
            </scroll_area_1.ScrollArea>
          </card_1.CardContent>
        </card_1.Card>)}
      
      {/* Session Analytics */}
      {showAnalytics && session && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BarChart3 className="h-5 w-5"/>
              Estatísticas da Sessão
            </card_1.CardTitle>
          </card_1.CardHeader>
          
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{queries.length}</div>
                <div className="text-sm text-muted-foreground">Consultas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queries.filter(function (q) { return q.success; }).length}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session.totalDuration > 0 ? formatDuration(Date.now() - session.startTime) : '0:00'}
                </div>
                <div className="text-sm text-muted-foreground">Duração</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queries.length > 0 ? Math.round(queries.reduce(function (sum, q) { return sum + q.confidence; }, 0) / queries.length * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Confiança Média</div>
              </div>
            </div>
            
            {/* Recent Queries */}
            {queries.length > 0 && (<div className="mt-4">
                <separator_1.Separator className="mb-3"/>
                <h4 className="font-medium text-sm mb-2">Consultas Recentes</h4>
                <scroll_area_1.ScrollArea className="h-32">
                  <div className="space-y-2">
                    {queries.slice(-5).reverse().map(function (query) { return (<div key={query.id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{query.transcript}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <badge_1.Badge variant="outline" className={getConfidenceColor(query.confidence)}>
                            {Math.round(query.confidence * 100)}%
                          </badge_1.Badge>
                          {query.success ? (<lucide_react_1.CheckCircle className="h-3 w-3 text-green-500"/>) : (<lucide_react_1.XCircle className="h-3 w-3 text-red-500"/>)}
                        </div>
                      </div>); })}
                  </div>
                </scroll_area_1.ScrollArea>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
// Compact voice search button for integration into other components
function VoiceSearchButton(_a) {
    var _this = this;
    var onTranscript = _a.onTranscript, onResults = _a.onResults, className = _a.className, _b = _a.size, size = _b === void 0 ? 'default' : _b;
    var _c = (0, react_1.useState)(false), isListening = _c[0], setIsListening = _c[1];
    var isSupported = (0, react_1.useState)(voice_search_1.voiceSearch.isSupported())[0];
    var handleClick = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isSupported)
                        return [2 /*return*/];
                    if (!isListening) return [3 /*break*/, 1];
                    voice_search_1.voiceSearch.stopListening();
                    return [3 /*break*/, 6];
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!!voice_search_1.voiceSearch.getCurrentSession()) return [3 /*break*/, 3];
                    return [4 /*yield*/, voice_search_1.voiceSearch.startSession()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, voice_search_1.voiceSearch.startListening()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_5 = _a.sent();
                    console.error('Voice search error:', error_5);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        var handleStart = function () { return setIsListening(true); };
        var handleEnd = function () { return setIsListening(false); };
        var handleRecognition = function (result) {
            if (result.isFinal && onTranscript) {
                onTranscript(result.transcript);
            }
        };
        var handleSearchResults = function (_a) {
            var results = _a.results;
            if (onResults) {
                onResults(results);
            }
        };
        voice_search_1.voiceSearch.on('start', handleStart);
        voice_search_1.voiceSearch.on('end', handleEnd);
        voice_search_1.voiceSearch.on('recognition', handleRecognition);
        voice_search_1.voiceSearch.on('searchResults', handleSearchResults);
        return function () {
            voice_search_1.voiceSearch.off('start', handleStart);
            voice_search_1.voiceSearch.off('end', handleEnd);
            voice_search_1.voiceSearch.off('recognition', handleRecognition);
            voice_search_1.voiceSearch.off('searchResults', handleSearchResults);
        };
    }, [onTranscript, onResults]);
    if (!isSupported) {
        return null;
    }
    return (<button_1.Button variant={isListening ? 'destructive' : 'outline'} size={size} onClick={handleClick} className={(0, utils_1.cn)("transition-all duration-200", isListening && "animate-pulse", className)}>
      {isListening ? (<lucide_react_1.Square className="h-4 w-4"/>) : (<lucide_react_1.Mic className="h-4 w-4"/>)}
    </button_1.Button>);
}
