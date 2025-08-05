"use strict";
/**
 * Voice Search Engine
 * Story 3.4: Smart Search + NLP Integration - Task 5
 * Advanced voice search with speech recognition, NLP processing, and voice commands
 */
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
exports.voiceSearch = exports.VoiceSearch = void 0;
var nlp_engine_1 = require("./nlp-engine");
var comprehensive_search_1 = require("./comprehensive-search");
/**
 * Voice Search Engine Class
 * Handles speech recognition, voice commands, and audio processing
 */
var VoiceSearch = /** @class */ (function () {
    function VoiceSearch(options) {
        if (options === void 0) { options = {}; }
        this.recognition = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.currentSession = null;
        this.isListening = false;
        this.isProcessing = false;
        this.commands = new Map();
        this.eventListeners = new Map();
        this.audioChunks = [];
        this.silenceTimer = null;
        this.options = __assign({ language: 'pt-BR', continuous: true, interimResults: true, maxAlternatives: 3, noiseReduction: true, autoStop: true, timeout: 30000, confidenceThreshold: 0.5 }, options);
        this.initializeRecognition();
        this.initializeCommands();
    }
    /**
     * Initialize speech recognition
     */
    VoiceSearch.prototype.initializeRecognition = function () {
        var _this = this;
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        // Configure recognition
        this.recognition.continuous = this.options.continuous;
        this.recognition.interimResults = this.options.interimResults;
        this.recognition.lang = this.options.language;
        this.recognition.maxAlternatives = this.options.maxAlternatives;
        // Event handlers
        this.recognition.onstart = function () {
            _this.isListening = true;
            _this.emit('start');
        };
        this.recognition.onresult = function (event) {
            _this.handleRecognitionResult(event);
        };
        this.recognition.onerror = function (event) {
            _this.handleRecognitionError(event);
        };
        this.recognition.onend = function () {
            _this.isListening = false;
            _this.emit('end');
        };
    };
    /**
     * Initialize voice commands
     */
    VoiceSearch.prototype.initializeCommands = function () {
        var _this = this;
        var defaultCommands = [
            {
                id: 'search_patients',
                patterns: ['buscar paciente', 'procurar paciente', 'encontrar paciente'],
                action: 'search',
                parameters: { type: 'patient' },
                description: 'Buscar pacientes',
                examples: ['Buscar paciente João Silva', 'Procurar paciente com diabetes'],
                category: 'search'
            },
            {
                id: 'search_appointments',
                patterns: ['buscar consulta', 'procurar agendamento', 'encontrar consulta'],
                action: 'search',
                parameters: { type: 'appointment' },
                description: 'Buscar consultas e agendamentos',
                examples: ['Buscar consulta hoje', 'Procurar agendamento Dr. Silva'],
                category: 'search'
            },
            {
                id: 'filter_by_date',
                patterns: ['filtrar por data', 'mostrar de hoje', 'mostrar desta semana'],
                action: 'filter',
                parameters: { filterType: 'date' },
                description: 'Filtrar resultados por data',
                examples: ['Filtrar por data hoje', 'Mostrar consultas desta semana'],
                category: 'filter'
            },
            {
                id: 'clear_search',
                patterns: ['limpar busca', 'limpar pesquisa', 'resetar filtros'],
                action: 'clear',
                description: 'Limpar busca e filtros',
                examples: ['Limpar busca', 'Resetar filtros'],
                category: 'action'
            },
            {
                id: 'help_voice',
                patterns: ['ajuda', 'comandos de voz', 'o que posso falar'],
                action: 'help',
                description: 'Mostrar comandos de voz disponíveis',
                examples: ['Ajuda', 'Quais comandos posso usar?'],
                category: 'system'
            },
            {
                id: 'stop_listening',
                patterns: ['parar', 'parar de escutar', 'cancelar'],
                action: 'stop',
                description: 'Parar reconhecimento de voz',
                examples: ['Parar', 'Cancelar escuta'],
                category: 'system'
            }
        ];
        defaultCommands.forEach(function (command) {
            _this.commands.set(command.id, command);
        });
    };
    /**
     * Start voice search session
     */
    VoiceSearch.prototype.startSession = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.currentSession) {
                            throw new Error('Voice search session already active');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({ audio: true })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error('Microphone permission denied');
                    case 4:
                        // Create new session
                        this.currentSession = {
                            id: "voice_session_".concat(Date.now()),
                            userId: userId,
                            startTime: Date.now(),
                            queries: [],
                            totalDuration: 0,
                            successRate: 0,
                            averageConfidence: 0,
                            commandsUsed: [],
                            errors: []
                        };
                        this.emit('sessionStart', this.currentSession);
                        return [2 /*return*/, this.currentSession.id];
                }
            });
        });
    };
    /**
     * End voice search session
     */
    VoiceSearch.prototype.endSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var session, successfulQueries, totalConfidence, completedSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentSession) {
                            return [2 /*return*/, null];
                        }
                        // Stop listening if active
                        if (this.isListening) {
                            this.stopListening();
                        }
                        session = this.currentSession;
                        session.endTime = Date.now();
                        session.totalDuration = session.endTime - session.startTime;
                        if (session.queries.length > 0) {
                            successfulQueries = session.queries.filter(function (q) { return q.success; }).length;
                            session.successRate = successfulQueries / session.queries.length;
                            totalConfidence = session.queries.reduce(function (sum, q) { return sum + q.confidence; }, 0);
                            session.averageConfidence = totalConfidence / session.queries.length;
                        }
                        // Save session to database
                        return [4 /*yield*/, this.saveSession(session)];
                    case 1:
                        // Save session to database
                        _a.sent();
                        completedSession = __assign({}, session);
                        this.currentSession = null;
                        this.emit('sessionEnd', completedSession);
                        return [2 /*return*/, completedSession];
                }
            });
        });
    };
    /**
     * Start listening for voice input
     */
    VoiceSearch.prototype.startListening = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.recognition) {
                    throw new Error('Speech recognition not available');
                }
                if (this.isListening) {
                    return [2 /*return*/];
                }
                try {
                    this.recognition.start();
                    // Set timeout if configured
                    if (this.options.timeout) {
                        setTimeout(function () {
                            if (_this.isListening) {
                                _this.stopListening();
                            }
                        }, this.options.timeout);
                    }
                }
                catch (error) {
                    throw new Error("Failed to start voice recognition: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Stop listening for voice input
     */
    VoiceSearch.prototype.stopListening = function () {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
    };
    /**
     * Handle speech recognition result
     */
    VoiceSearch.prototype.handleRecognitionResult = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var result, transcript, confidence, isFinal, alternatives, i, recognitionResult;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = event.results[event.resultIndex];
                        transcript = result[0].transcript.trim();
                        confidence = result[0].confidence;
                        isFinal = result.isFinal;
                        alternatives = [];
                        for (i = 0; i < result.length; i++) {
                            alternatives.push({
                                transcript: result[i].transcript.trim(),
                                confidence: result[i].confidence
                            });
                        }
                        recognitionResult = {
                            transcript: transcript,
                            confidence: confidence,
                            alternatives: alternatives,
                            isFinal: isFinal,
                            timestamp: Date.now()
                        };
                        this.emit('recognition', recognitionResult);
                        if (!(isFinal && confidence >= this.options.confidenceThreshold)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.processVoiceInput(transcript, confidence, alternatives.map(function (a) { return a.transcript; }))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        // Handle silence detection for auto-stop
                        if (this.options.autoStop && isFinal) {
                            this.silenceTimer = setTimeout(function () {
                                _this.stopListening();
                            }, 2000); // Stop after 2 seconds of silence
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle speech recognition error
     */
    VoiceSearch.prototype.handleRecognitionError = function (event) {
        var error = {
            type: this.mapErrorType(event.error),
            message: event.error,
            timestamp: Date.now(),
            context: { event: event.error }
        };
        if (this.currentSession) {
            this.currentSession.errors.push(error);
        }
        this.emit('error', error);
    };
    /**
     * Map speech recognition error to our error types
     */
    VoiceSearch.prototype.mapErrorType = function (error) {
        switch (error) {
            case 'network':
                return 'network';
            case 'not-allowed':
            case 'service-not-allowed':
                return 'permission';
            case 'aborted':
            case 'audio-capture':
                return 'recognition';
            default:
                return 'processing';
        }
    };
    /**
     * Process voice input (transcript)
     */
    VoiceSearch.prototype.processVoiceInput = function (transcript, confidence, alternatives) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, query, command, error_2, errorMessage, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentSession) {
                            throw new Error('No active voice search session');
                        }
                        this.isProcessing = true;
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        query = {
                            id: "voice_query_".concat(Date.now()),
                            sessionId: this.currentSession.id,
                            transcript: transcript,
                            confidence: confidence,
                            alternatives: alternatives,
                            processedQuery: transcript,
                            timestamp: startTime,
                            duration: 0,
                            success: false
                        };
                        command = this.detectCommand(transcript);
                        if (!command) return [3 /*break*/, 3];
                        query.command = command;
                        return [4 /*yield*/, this.executeCommand(command, transcript, query)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // Process as search query
                    return [4 /*yield*/, this.executeSearch(transcript, query)];
                    case 4:
                        // Process as search query
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        // Update query duration and success
                        query.duration = Date.now() - startTime;
                        query.success = !query.errorMessage;
                        // Add to session
                        this.currentSession.queries.push(query);
                        this.emit('queryProcessed', query);
                        return [3 /*break*/, 8];
                    case 6:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                        query = {
                            id: "voice_query_".concat(Date.now()),
                            sessionId: this.currentSession.id,
                            transcript: transcript,
                            confidence: confidence,
                            alternatives: alternatives,
                            processedQuery: transcript,
                            timestamp: startTime,
                            duration: Date.now() - startTime,
                            success: false,
                            errorMessage: errorMessage
                        };
                        this.currentSession.queries.push(query);
                        this.emit('queryError', { query: query, error: errorMessage });
                        return [3 /*break*/, 8];
                    case 7:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect voice command in transcript
     */
    VoiceSearch.prototype.detectCommand = function (transcript) {
        var normalizedTranscript = transcript.toLowerCase().trim();
        for (var _i = 0, _a = this.commands.values(); _i < _a.length; _i++) {
            var command = _a[_i];
            for (var _b = 0, _c = command.patterns; _b < _c.length; _b++) {
                var pattern = _c[_b];
                if (normalizedTranscript.includes(pattern.toLowerCase())) {
                    return command;
                }
            }
        }
        return null;
    };
    /**
     * Execute voice command
     */
    VoiceSearch.prototype.executeCommand = function (command, transcript, query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, searchTerms;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Track command usage
                        if (this.currentSession && !this.currentSession.commandsUsed.includes(command.id)) {
                            this.currentSession.commandsUsed.push(command.id);
                        }
                        _a = command.action;
                        switch (_a) {
                            case 'search': return [3 /*break*/, 1];
                            case 'filter': return [3 /*break*/, 4];
                            case 'clear': return [3 /*break*/, 5];
                            case 'help': return [3 /*break*/, 6];
                            case 'stop': return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 1:
                        searchTerms = this.extractSearchTerms(transcript, command.patterns);
                        if (!searchTerms) return [3 /*break*/, 3];
                        query.processedQuery = searchTerms;
                        return [4 /*yield*/, this.executeSearch(searchTerms, query, command.parameters)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 9];
                    case 4:
                        this.emit('filterCommand', { command: command, transcript: transcript, parameters: command.parameters });
                        return [3 /*break*/, 9];
                    case 5:
                        this.emit('clearCommand', { command: command });
                        return [3 /*break*/, 9];
                    case 6:
                        this.emit('helpCommand', { commands: Array.from(this.commands.values()) });
                        return [3 /*break*/, 9];
                    case 7:
                        this.stopListening();
                        return [3 /*break*/, 9];
                    case 8:
                        this.emit('customCommand', { command: command, transcript: transcript });
                        _b.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extract search terms from transcript after removing command patterns
     */
    VoiceSearch.prototype.extractSearchTerms = function (transcript, patterns) {
        var normalizedTranscript = transcript.toLowerCase();
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var patternIndex = normalizedTranscript.indexOf(pattern.toLowerCase());
            if (patternIndex !== -1) {
                var searchTerms = transcript
                    .substring(patternIndex + pattern.length)
                    .trim();
                if (searchTerms.length > 0) {
                    return searchTerms;
                }
            }
        }
        return null;
    };
    /**
     * Execute search with voice input
     */
    VoiceSearch.prototype.executeSearch = function (searchQuery, query, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var nlpResults, searchOptions, searchResults, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, nlp_engine_1.nlpEngine.processQuery(searchQuery)];
                    case 1:
                        nlpResults = _a.sent();
                        query.nlpResults = nlpResults;
                        searchOptions = {
                            query: searchQuery,
                            nlpResults: nlpResults,
                            dataTypes: (parameters === null || parameters === void 0 ? void 0 : parameters.type) ? [parameters.type] : undefined,
                            limit: 10,
                            includeHighlights: true,
                            includeRelated: true
                        };
                        return [4 /*yield*/, comprehensive_search_1.comprehensiveSearch.search(searchOptions)];
                    case 2:
                        searchResults = _a.sent();
                        query.searchResults = searchResults;
                        this.emit('searchResults', { query: query, results: searchResults });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        query.errorMessage = error_3 instanceof Error ? error_3.message : 'Search failed';
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add custom voice command
     */
    VoiceSearch.prototype.addCommand = function (command) {
        this.commands.set(command.id, command);
    };
    /**
     * Remove voice command
     */
    VoiceSearch.prototype.removeCommand = function (commandId) {
        return this.commands.delete(commandId);
    };
    /**
     * Get all available commands
     */
    VoiceSearch.prototype.getCommands = function () {
        return Array.from(this.commands.values());
    };
    /**
     * Get commands by category
     */
    VoiceSearch.prototype.getCommandsByCategory = function (category) {
        return Array.from(this.commands.values()).filter(function (cmd) { return cmd.category === category; });
    };
    /**
     * Check if speech recognition is supported
     */
    VoiceSearch.prototype.isSupported = function () {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    };
    /**
     * Check if currently listening
     */
    VoiceSearch.prototype.getIsListening = function () {
        return this.isListening;
    };
    /**
     * Check if currently processing
     */
    VoiceSearch.prototype.getIsProcessing = function () {
        return this.isProcessing;
    };
    /**
     * Get current session
     */
    VoiceSearch.prototype.getCurrentSession = function () {
        return this.currentSession;
    };
    /**
     * Save session to database
     */
    VoiceSearch.prototype.saveSession = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would typically save to Supabase
                    // Implementation depends on your database schema
                    console.log('Saving voice search session:', session.id);
                }
                catch (error) {
                    console.error('Failed to save voice search session:', error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get voice search analytics
     */
    VoiceSearch.prototype.getAnalytics = function (userId, dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This would typically query from Supabase
                // Placeholder implementation
                return [2 /*return*/, {
                        totalSessions: 0,
                        totalQueries: 0,
                        averageSessionDuration: 0,
                        successRate: 0,
                        mostUsedCommands: [],
                        languageDistribution: {},
                        errorDistribution: {},
                        confidenceDistribution: {
                            high: 0,
                            medium: 0,
                            low: 0
                        }
                    }];
            });
        });
    };
    /**
     * Event system
     */
    VoiceSearch.prototype.on = function (event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    };
    VoiceSearch.prototype.off = function (event, callback) {
        var listeners = this.eventListeners.get(event);
        if (listeners) {
            var index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    VoiceSearch.prototype.emit = function (event, data) {
        var listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(function (callback) { return callback(data); });
        }
    };
    /**
     * Cleanup resources
     */
    VoiceSearch.prototype.destroy = function () {
        this.stopListening();
        if (this.currentSession) {
            this.endSession();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.eventListeners.clear();
        this.commands.clear();
    };
    return VoiceSearch;
}());
exports.VoiceSearch = VoiceSearch;
// Create and export singleton instance
exports.voiceSearch = new VoiceSearch();
