"use strict";
/**
 * Optimal Timing Analysis Engine
 * NeonPro - Machine Learning para análise de horários ótimos de comunicação
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createoptimalTimingEngine = exports.OptimalTimingEngine = void 0;
var client_1 = require("@/lib/supabase/client");
var OptimalTimingEngine = /** @class */ (function () {
  function OptimalTimingEngine() {
    this.cache = new Map();
    this.mlModels = new Map();
    this.config = null;
    this.realTimeFactors = new Map();
    this.supabase = (0, client_1.createClient)();
    this.initializeModels();
    this.loadConfiguration();
  }
  /**
   * ====================================================================
   * INITIALIZATION & CONFIGURATION
   * ====================================================================
   */
  OptimalTimingEngine.prototype.initializeModels = function () {
    return __awaiter(this, void 0, void 0, function () {
      var models, error_1;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 6]);
            return [
              4 /*yield*/,
              this.supabase.from("ml_timing_models").select("*").eq("status", "active"),
            ];
          case 1:
            models = _a.sent().data;
            if (models) {
              models.forEach(function (model) {
                _this.mlModels.set(model.id, {
                  id: model.id,
                  name: model.name,
                  type: model.type,
                  version: model.version,
                  accuracy: model.accuracy,
                  features: model.features,
                  lastTrained: new Date(model.last_trained),
                  dataPoints: model.data_points,
                  predictions: model.predictions,
                });
              });
            }
            if (!(this.mlModels.size === 0)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.initializeDefaultModels()];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error initializing ML models:", error_1);
            return [4 /*yield*/, this.initializeDefaultModels()];
          case 5:
            _a.sent();
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  OptimalTimingEngine.prototype.initializeDefaultModels = function () {
    return __awaiter(this, void 0, void 0, function () {
      var defaultModels;
      var _this = this;
      return __generator(this, function (_a) {
        defaultModels = [
          {
            id: "timing-gb-v1",
            name: "Gradient Boosting Timing Predictor",
            type: "gradient_boosting",
            version: "1.0",
            accuracy: 0.78,
            features: ["hour", "day_of_week", "patient_age", "communication_type", "season"],
            lastTrained: new Date(),
            dataPoints: 0,
            predictions: { responseRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
          },
          {
            id: "timing-rf-v1",
            name: "Random Forest Engagement Predictor",
            type: "random_forest",
            version: "1.0",
            accuracy: 0.75,
            features: ["hour", "day_of_week", "previous_engagements", "time_since_last"],
            lastTrained: new Date(),
            dataPoints: 0,
            predictions: { responseRate: 0, openRate: 0, clickRate: 0, conversionRate: 0 },
          },
        ];
        defaultModels.forEach(function (model) {
          _this.mlModels.set(model.id, model);
        });
        return [2 /*return*/];
      });
    });
  };
  OptimalTimingEngine.prototype.loadConfiguration = function () {
    return __awaiter(this, void 0, void 0, function () {
      var data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("timing_optimization_config").select("*").single(),
            ];
          case 1:
            data = _a.sent().data;
            if (data) {
              this.config = {
                clinicId: data.clinic_id,
                globalSettings: data.global_settings,
                channelSettings: data.channel_settings,
                audienceSegments: data.audience_segments,
              };
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error loading configuration:", error_2);
            this.config = this.getDefaultConfig();
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  OptimalTimingEngine.prototype.getDefaultConfig = function () {
    return {
      clinicId: "",
      globalSettings: {
        defaultTimezone: "America/Sao_Paulo",
        businessHours: {
          startHour: 8,
          startMinute: 0,
          endHour: 18,
          endMinute: 0,
        },
        blackoutPeriods: [],
        minimumSampleSize: 30,
        minimumConfidence: 0.7,
        enableMLPredictions: true,
        enableSeasonalAdjustments: true,
        enableWeatherFactors: false,
        enableHolidayFactors: true,
      },
      channelSettings: {
        email: {
          enabled: true,
          priority: 1,
          optimalFrequency: { daily: 2, weekly: 10, monthly: 30 },
          cooldownPeriod: 240,
          retryLogic: { maxAttempts: 3, backoffMultiplier: 2 },
        },
        sms: {
          enabled: true,
          priority: 2,
          optimalFrequency: { daily: 1, weekly: 5, monthly: 15 },
          cooldownPeriod: 480,
          retryLogic: { maxAttempts: 2, backoffMultiplier: 3 },
        },
        whatsapp: {
          enabled: true,
          priority: 3,
          optimalFrequency: { daily: 1, weekly: 7, monthly: 20 },
          cooldownPeriod: 360,
          retryLogic: { maxAttempts: 2, backoffMultiplier: 2 },
        },
      },
      audienceSegments: [],
    };
  };
  /**
   * ====================================================================
   * PATTERN ANALYSIS
   * ====================================================================
   */
  /**
   * Analisar padrões de timing para uma clínica
   */
  OptimalTimingEngine.prototype.analyzeTimingPatterns = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var requestId,
        communicationData,
        globalPatterns,
        segmentedPatterns,
        recommendations,
        insights,
        performanceMetrics,
        result,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            requestId = this.generateId();
            return [4 /*yield*/, this.fetchCommunicationData(request)];
          case 1:
            communicationData = _a.sent();
            return [4 /*yield*/, this.analyzeGlobalPatterns(communicationData, request)];
          case 2:
            globalPatterns = _a.sent();
            return [4 /*yield*/, this.analyzeSegmentedPatterns(communicationData, request)];
          case 3:
            segmentedPatterns = _a.sent();
            return [
              4 /*yield*/,
              this.generateMLRecommendations(globalPatterns, segmentedPatterns, request),
            ];
          case 4:
            recommendations = _a.sent();
            return [
              4 /*yield*/,
              this.generateTimingInsights(globalPatterns, segmentedPatterns, communicationData),
            ];
          case 5:
            insights = _a.sent();
            performanceMetrics = this.calculatePerformanceMetrics(communicationData);
            result = {
              requestId: requestId,
              clinicId: request.clinicId,
              analysisDate: new Date(),
              timeframe: request.dateRange,
              globalPatterns: globalPatterns,
              segmentedPatterns: segmentedPatterns,
              recommendations: recommendations,
              insights: insights,
              performanceMetrics: performanceMetrics,
            };
            // Salvar resultado para cache
            return [4 /*yield*/, this.saveAnalysisResult(result)];
          case 6:
            // Salvar resultado para cache
            _a.sent();
            return [2 /*return*/, result];
          case 7:
            error_3 = _a.sent();
            console.error("Error analyzing timing patterns:", error_3);
            throw error_3;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Buscar dados históricos de comunicação
   */
  OptimalTimingEngine.prototype.fetchCommunicationData = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            query = this.supabase
              .from("communications_log")
              .select(
                "\n        *,\n        patient:patients(id, birth_date, gender, timezone),\n        communication_events(type, timestamp, device_info)\n      ",
              )
              .eq("clinic_id", request.clinicId)
              .gte("sent_at", request.dateRange.start.toISOString())
              .lte("sent_at", request.dateRange.end.toISOString());
            if ((_b = request.patientIds) === null || _b === void 0 ? void 0 : _b.length) {
              query = query.in("patient_id", request.patientIds);
            }
            if (request.communicationType) {
              query = query.eq("type", request.communicationType);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  /**
   * Analisar padrões globais de timing
   */
  OptimalTimingEngine.prototype.analyzeGlobalPatterns = function (data, request) {
    return __awaiter(this, void 0, void 0, function () {
      var patterns,
        _i,
        data_1,
        communication,
        sentDate,
        dayOfWeek,
        hour,
        key,
        pattern,
        events,
        hasOpen,
        hasClick,
        hasResponse;
      var _this = this;
      var _a;
      return __generator(this, function (_b) {
        patterns = new Map();
        for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
          communication = data_1[_i];
          sentDate = new Date(communication.sent_at);
          dayOfWeek = sentDate.getDay();
          hour = sentDate.getHours();
          key = "".concat(communication.type, "-").concat(dayOfWeek, "-").concat(hour);
          if (!patterns.has(key)) {
            patterns.set(key, {
              id: key,
              clinicId: request.clinicId,
              communicationType: communication.type,
              dayOfWeek: dayOfWeek,
              hour: hour,
              responseRate: 0,
              openRate: 0,
              clickRate: 0,
              conversionRate: 0,
              sampleSize: 0,
              confidence: 0,
              lastUpdated: new Date(),
              timezone:
                ((_a = this.config) === null || _a === void 0
                  ? void 0
                  : _a.globalSettings.defaultTimezone) || "America/Sao_Paulo",
            });
          }
          pattern = patterns.get(key);
          pattern.sampleSize++;
          events = communication.communication_events || [];
          hasOpen = events.some(function (e) {
            return e.type === "open";
          });
          hasClick = events.some(function (e) {
            return e.type === "click";
          });
          hasResponse = events.some(function (e) {
            return e.type === "response";
          });
          if (hasOpen)
            pattern.openRate =
              (pattern.openRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
          if (hasClick)
            pattern.clickRate =
              (pattern.clickRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
          if (hasResponse)
            pattern.responseRate =
              (pattern.responseRate * (pattern.sampleSize - 1) + 1) / pattern.sampleSize;
        }
        // Converter para array e calcular confiança
        return [
          2 /*return*/,
          Array.from(patterns.values()).map(function (pattern) {
            return __assign(__assign({}, pattern), {
              confidence: _this.calculatePatternConfidence(pattern.sampleSize),
              responseRate: pattern.responseRate * 100,
              openRate: (pattern.openRate || 0) * 100,
              clickRate: (pattern.clickRate || 0) * 100,
            });
          }),
        ];
      });
    });
  };
  /**
   * Analisar padrões segmentados
   */
  OptimalTimingEngine.prototype.analyzeSegmentedPatterns = function (data, request) {
    return __awaiter(this, void 0, void 0, function () {
      var segmentedPatterns,
        ageSegments,
        _i,
        _a,
        _b,
        segment,
        segmentData,
        _c,
        _d,
        genderSegments,
        _e,
        _f,
        _g,
        segment,
        segmentData,
        _h,
        _j,
        typeSegments,
        _k,
        _l,
        _m,
        segment,
        segmentData,
        _o,
        _p;
      return __generator(this, function (_q) {
        switch (_q.label) {
          case 0:
            segmentedPatterns = {};
            ageSegments = this.segmentByAge(data);
            (_i = 0), (_a = Object.entries(ageSegments));
            _q.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            (_b = _a[_i]), (segment = _b[0]), (segmentData = _b[1]);
            _c = segmentedPatterns;
            _d = "age_".concat(segment);
            return [4 /*yield*/, this.analyzeGlobalPatterns(segmentData, request)];
          case 2:
            _c[_d] = _q.sent();
            _q.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            genderSegments = this.segmentByGender(data);
            (_e = 0), (_f = Object.entries(genderSegments));
            _q.label = 5;
          case 5:
            if (!(_e < _f.length)) return [3 /*break*/, 8];
            (_g = _f[_e]), (segment = _g[0]), (segmentData = _g[1]);
            _h = segmentedPatterns;
            _j = "gender_".concat(segment);
            return [4 /*yield*/, this.analyzeGlobalPatterns(segmentData, request)];
          case 6:
            _h[_j] = _q.sent();
            _q.label = 7;
          case 7:
            _e++;
            return [3 /*break*/, 5];
          case 8:
            typeSegments = this.segmentByType(data);
            (_k = 0), (_l = Object.entries(typeSegments));
            _q.label = 9;
          case 9:
            if (!(_k < _l.length)) return [3 /*break*/, 12];
            (_m = _l[_k]), (segment = _m[0]), (segmentData = _m[1]);
            _o = segmentedPatterns;
            _p = "type_".concat(segment);
            return [4 /*yield*/, this.analyzeGlobalPatterns(segmentData, request)];
          case 10:
            _o[_p] = _q.sent();
            _q.label = 11;
          case 11:
            _k++;
            return [3 /*break*/, 9];
          case 12:
            return [2 /*return*/, segmentedPatterns];
        }
      });
    });
  };
  /**
   * ====================================================================
   * MACHINE LEARNING PREDICTIONS
   * ====================================================================
   */
  /**
   * Gerar recomendações usando Machine Learning
   */
  OptimalTimingEngine.prototype.generateMLRecommendations = function (
    globalPatterns,
    segmentedPatterns,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendations, _i, _a, patientId, recommendation, generalRecommendations;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            recommendations = [];
            if (!((_b = request.patientIds) === null || _b === void 0 ? void 0 : _b.length))
              return [3 /*break*/, 5];
            (_i = 0), (_a = request.patientIds);
            _c.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            patientId = _a[_i];
            return [
              4 /*yield*/,
              this.generatePersonalizedRecommendation(
                patientId,
                request.communicationType,
                globalPatterns,
                segmentedPatterns,
              ),
            ];
          case 2:
            recommendation = _c.sent();
            if (recommendation) {
              recommendations.push(recommendation);
            }
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [3 /*break*/, 7];
          case 5:
            return [
              4 /*yield*/,
              this.generateGeneralRecommendations(globalPatterns, segmentedPatterns, request),
            ];
          case 6:
            generalRecommendations = _c.sent();
            recommendations.push.apply(recommendations, generalRecommendations);
            _c.label = 7;
          case 7:
            return [2 /*return*/, recommendations];
        }
      });
    });
  };
  /**
   * Gerar recomendação personalizada para um paciente
   */
  OptimalTimingEngine.prototype.generatePersonalizedRecommendation = function (
    patientId_1,
    communicationType_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (patientId, communicationType, globalPatterns, segmentedPatterns) {
        var patient,
          patientPatterns,
          segments,
          optimalTime,
          alternativeTimes,
          avoidTimes,
          reasoning,
          error_4;
        if (globalPatterns === void 0) {
          globalPatterns = [];
        }
        if (segmentedPatterns === void 0) {
          segmentedPatterns = {};
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                this.supabase.from("patients").select("*").eq("id", patientId).single(),
              ];
            case 1:
              patient = _a.sent().data;
              if (!patient) return [2 /*return*/, null];
              return [4 /*yield*/, this.getPatientEngagementHistory(patientId)];
            case 2:
              patientPatterns = _a.sent();
              segments = this.determinePatientSegments(patient);
              return [
                4 /*yield*/,
                this.predictOptimalTime(
                  patient,
                  communicationType || "email",
                  patientPatterns,
                  globalPatterns,
                  segmentedPatterns,
                ),
              ];
            case 3:
              optimalTime = _a.sent();
              return [
                4 /*yield*/,
                this.generateAlternativeTimes(optimalTime, patientPatterns, globalPatterns),
              ];
            case 4:
              alternativeTimes = _a.sent();
              avoidTimes = this.determineAvoidTimes(patient, patientPatterns);
              reasoning = this.generateRecommendationReasoning(
                optimalTime,
                patientPatterns,
                segments,
                globalPatterns,
              );
              return [
                2 /*return*/,
                {
                  patientId: patientId,
                  communicationType: communicationType || "email",
                  optimalTime: optimalTime,
                  reasoning: reasoning,
                  confidence: optimalTime.confidence,
                  basedOnSegments: segments,
                  fallbackTimes: alternativeTimes,
                  avoidTimes: avoidTimes,
                  seasonalAdjustments: this.calculateSeasonalAdjustments(),
                },
              ];
            case 5:
              error_4 = _a.sent();
              console.error("Error generating personalized recommendation:", error_4);
              return [2 /*return*/, null];
            case 6:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Predizer horário ótimo usando ML
   */
  OptimalTimingEngine.prototype.predictOptimalTime = function (
    patient,
    communicationType,
    patientPatterns,
    globalPatterns,
    segmentedPatterns,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var model, features, predictions, bestPrediction;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            model = this.mlModels.get("timing-gb-v1");
            if (!model || patientPatterns.length === 0) {
              // Fallback para análise estatística simples
              return [
                2 /*return*/,
                this.generateStatisticalOptimalTime(patient, communicationType, globalPatterns),
              ];
            }
            features = this.prepareMLFeatures(patient, communicationType, patientPatterns);
            return [4 /*yield*/, this.simulateMLPrediction(features, model)];
          case 1:
            predictions = _b.sent();
            bestPrediction = predictions.reduce(function (best, current) {
              return current.probability > best.probability ? current : best;
            });
            return [
              2 /*return*/,
              {
                hour: bestPrediction.hour,
                minute: 0,
                dayOfWeek: bestPrediction.dayOfWeek,
                timezone:
                  patient.timezone ||
                  ((_a = this.config) === null || _a === void 0
                    ? void 0
                    : _a.globalSettings.defaultTimezone) ||
                  "America/Sao_Paulo",
                confidence: bestPrediction.probability,
                expectedResponseRate: bestPrediction.expectedResponseRate,
              },
            ];
        }
      });
    });
  };
  /**
   * Simular predição de ML (placeholder para integração real)
   */
  OptimalTimingEngine.prototype.simulateMLPrediction = function (features, model) {
    return __awaiter(this, void 0, void 0, function () {
      var predictions, hour, day, probability;
      return __generator(this, function (_a) {
        predictions = [];
        for (hour = 6; hour <= 22; hour++) {
          for (day = 0; day <= 6; day++) {
            probability = 0.1;
            // Boost para horários comerciais
            if (hour >= 9 && hour <= 17 && day >= 1 && day <= 5) {
              probability += 0.3;
            }
            // Boost para horários de pico (manhã e fim da tarde)
            if ((hour >= 8 && hour <= 10) || (hour >= 16 && hour <= 18)) {
              probability += 0.2;
            }
            // Penalidade para fins de semana (exceto para alguns tipos)
            if (day === 0 || day === 6) {
              probability -= 0.1;
            }
            // Adicionar alguma variação baseada no paciente
            probability += (features.patientEngagement || 0) * 0.1;
            probability += (features.historicalResponseRate || 0) * 0.2;
            predictions.push({
              hour: hour,
              dayOfWeek: day,
              probability: Math.max(0.01, Math.min(0.99, probability)),
              expectedResponseRate: probability * 100,
            });
          }
        }
        return [
          2 /*return*/,
          predictions.sort(function (a, b) {
            return b.probability - a.probability;
          }),
        ];
      });
    });
  };
  /**
   * Preparar features para ML
   */
  OptimalTimingEngine.prototype.prepareMLFeatures = function (
    patient,
    communicationType,
    patterns,
  ) {
    var age = this.calculateAge(new Date(patient.birth_date));
    var avgResponseRate =
      patterns.length > 0
        ? patterns.reduce(function (sum, p) {
            return sum + p.responseRate;
          }, 0) / patterns.length
        : 0;
    var recentEngagement = patterns.filter(function (p) {
      return p.lastUpdated > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }).length;
    return {
      patientAge: age,
      patientGender: patient.gender,
      communicationType: communicationType,
      historicalResponseRate: avgResponseRate / 100,
      recentEngagementCount: recentEngagement,
      patientEngagement: recentEngagement / Math.max(1, patterns.length),
      daysSinceLastCommunication: this.calculateDaysSinceLastCommunication(patient.id),
      totalCommunications: patterns.length,
    };
  };
  /**
   * ====================================================================
   * BEHAVIOR ANALYSIS
   * ====================================================================
   */
  /**
   * Analisar padrões de comportamento de um paciente
   */
  OptimalTimingEngine.prototype.analyzeBehaviorPattern = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var patterns,
        hourCounts,
        preferredHours,
        dayCounts,
        preferredDays,
        pattern,
        avgResponseLatency,
        engagementWindow,
        confidence,
        error_5;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getPatientEngagementHistory(patientId)];
          case 1:
            patterns = _c.sent();
            if (patterns.length < 5) {
              return [2 /*return*/, null]; // Dados insuficientes
            }
            hourCounts = patterns.reduce(function (acc, pattern) {
              acc[pattern.hour] = (acc[pattern.hour] || 0) + pattern.responseRate;
              return acc;
            }, {});
            preferredHours = Object.entries(hourCounts)
              .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b - a;
              })
              .slice(0, 4)
              .map(function (_a) {
                var hour = _a[0];
                return parseInt(hour);
              });
            dayCounts = patterns.reduce(function (acc, pattern) {
              acc[pattern.dayOfWeek] = (acc[pattern.dayOfWeek] || 0) + pattern.responseRate;
              return acc;
            }, {});
            preferredDays = Object.entries(dayCounts)
              .sort(function (_a, _b) {
                var a = _a[1];
                var b = _b[1];
                return b - a;
              })
              .slice(0, 3)
              .map(function (_a) {
                var day = _a[0];
                return parseInt(day);
              });
            pattern = this.classifyBehaviorPattern(preferredHours, preferredDays);
            avgResponseLatency = this.calculateAverageResponseLatency(patientId);
            engagementWindow = this.calculateEngagementWindow(patterns);
            confidence = Math.min(0.95, patterns.length / 50);
            _a = {
              patientId: patientId,
              pattern: pattern,
              confidence: confidence,
            };
            _b = {
              preferredHours: preferredHours,
              preferredDays: preferredDays,
            };
            return [4 /*yield*/, avgResponseLatency];
          case 2:
            return [
              2 /*return*/,
              ((_a.characteristics =
                ((_b.responseLatency = _c.sent()), (_b.engagementWindow = engagementWindow), _b)),
              (_a.lastUpdated = new Date()),
              _a),
            ];
          case 3:
            error_5 = _c.sent();
            console.error("Error analyzing behavior pattern:", error_5);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Classificar padrão de comportamento
   */
  OptimalTimingEngine.prototype.classifyBehaviorPattern = function (preferredHours, preferredDays) {
    var morningHours = preferredHours.filter(function (h) {
      return h >= 6 && h <= 10;
    }).length;
    var eveningHours = preferredHours.filter(function (h) {
      return h >= 18 && h <= 22;
    }).length;
    var businessHours = preferredHours.filter(function (h) {
      return h >= 9 && h <= 17;
    }).length;
    var weekendDays = preferredDays.filter(function (d) {
      return d === 0 || d === 6;
    }).length;
    if (morningHours >= 2) return "early_bird";
    if (eveningHours >= 2) return "night_owl";
    if (businessHours >= 2) return "business_hours";
    if (weekendDays >= 1) return "weekend_warrior";
    return "irregular";
  };
  /**
   * ====================================================================
   * OPTIMIZATION & SCHEDULING
   * ====================================================================
   */
  /**
   * Otimizar horário de envio em tempo real
   */
  OptimalTimingEngine.prototype.optimizeSendTime = function (
    communicationId,
    patientId,
    scheduledTime,
    communicationType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var recommendation, realTimeFactors, optimizedTime, expectedImprovement, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getPatientRecommendation(patientId, communicationType)];
          case 1:
            recommendation = _a.sent();
            return [4 /*yield*/, this.getRealTimeFactors(patientId)];
          case 2:
            realTimeFactors = _a.sent();
            return [
              4 /*yield*/,
              this.applyOptimizationRules(scheduledTime, recommendation, realTimeFactors),
            ];
          case 3:
            optimizedTime = _a.sent();
            expectedImprovement = this.calculateExpectedImprovement(
              scheduledTime,
              optimizedTime,
              recommendation,
            );
            return [
              2 /*return*/,
              {
                communicationId: communicationId,
                originalScheduledTime: scheduledTime,
                optimizedTime: optimizedTime,
                reason: this.generateOptimizationReason(
                  scheduledTime,
                  optimizedTime,
                  recommendation,
                ),
                confidence:
                  (recommendation === null || recommendation === void 0
                    ? void 0
                    : recommendation.confidence) || 0.5,
                factors: this.extractOptimizationFactors(realTimeFactors, recommendation),
                expectedImprovement: expectedImprovement,
                algorithm: "real_time_optimization_v1",
                version: "1.0",
              },
            ];
          case 4:
            error_6 = _a.sent();
            console.error("Error optimizing send time:", error_6);
            // Retornar sem otimização em caso de erro
            return [
              2 /*return*/,
              {
                communicationId: communicationId,
                originalScheduledTime: scheduledTime,
                optimizedTime: scheduledTime,
                reason: "Optimization failed, using original time",
                confidence: 0,
                factors: [],
                expectedImprovement: 0,
                algorithm: "fallback",
                version: "1.0",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Aplicar regras de otimização
   */
  OptimalTimingEngine.prototype.applyOptimizationRules = function (
    scheduledTime,
    recommendation,
    realTimeFactors,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var optimizedTime,
        optimalHour,
        optimalDay,
        daysToAdd,
        _i,
        _a,
        avoidTime,
        now,
        businessHours,
        hour;
      var _b;
      return __generator(this, function (_c) {
        optimizedTime = new Date(scheduledTime);
        // Regra 1: Respeitar horário ótimo se disponível
        if (
          recommendation === null || recommendation === void 0 ? void 0 : recommendation.optimalTime
        ) {
          optimalHour = recommendation.optimalTime.hour;
          optimalDay = recommendation.optimalTime.dayOfWeek;
          // Se o dia está correto, ajustar apenas a hora
          if (scheduledTime.getDay() === optimalDay) {
            optimizedTime.setHours(optimalHour, recommendation.optimalTime.minute || 0, 0, 0);
          } else {
            daysToAdd = (optimalDay - scheduledTime.getDay() + 7) % 7;
            optimizedTime.setDate(scheduledTime.getDate() + daysToAdd);
            optimizedTime.setHours(optimalHour, recommendation.optimalTime.minute || 0, 0, 0);
          }
        }
        // Regra 2: Evitar horários de não perturbar
        if (
          recommendation === null || recommendation === void 0 ? void 0 : recommendation.avoidTimes
        ) {
          for (_i = 0, _a = recommendation.avoidTimes; _i < _a.length; _i++) {
            avoidTime = _a[_i];
            if (this.isTimeInWindow(optimizedTime, avoidTime)) {
              // Mover para depois do período de evitar
              optimizedTime.setHours(avoidTime.endHour, avoidTime.endMinute || 0, 0, 0);
            }
          }
        }
        // Regra 3: Considerar atividade em tempo real
        if (
          realTimeFactors === null || realTimeFactors === void 0
            ? void 0
            : realTimeFactors.factors.deviceActivity
        ) {
          now = new Date();
          if (optimizedTime > now && optimizedTime.getTime() - now.getTime() < 30 * 60 * 1000) {
            optimizedTime = now;
          }
        }
        // Regra 4: Respeitar configurações globais
        if (
          (_b = this.config) === null || _b === void 0 ? void 0 : _b.globalSettings.businessHours
        ) {
          businessHours = this.config.globalSettings.businessHours;
          hour = optimizedTime.getHours();
          if (hour < businessHours.startHour || hour > businessHours.endHour) {
            // Mover para o início do próximo horário comercial
            if (hour < businessHours.startHour) {
              optimizedTime.setHours(businessHours.startHour, businessHours.startMinute || 0, 0, 0);
            } else {
              optimizedTime.setDate(optimizedTime.getDate() + 1);
              optimizedTime.setHours(businessHours.startHour, businessHours.startMinute || 0, 0, 0);
            }
          }
        }
        return [2 /*return*/, optimizedTime];
      });
    });
  };
  /**
   * ====================================================================
   * PERFORMANCE TRACKING
   * ====================================================================
   */
  /**
   * Calcular métricas de performance da otimização
   */
  OptimalTimingEngine.prototype.calculateOptimizationPerformance = function (clinicId, period) {
    return __awaiter(this, void 0, void 0, function () {
      var communications,
        optimized,
        baseline,
        baselineMetrics,
        optimizedMetrics,
        improvement,
        error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("communications_log")
                .select(
                  "\n          *,\n          communication_events(type, timestamp),\n          send_time_optimization(*)\n        ",
                )
                .eq("clinic_id", clinicId)
                .gte("sent_at", period.start.toISOString())
                .lte("sent_at", period.end.toISOString()),
            ];
          case 1:
            communications = _a.sent().data;
            if (
              !(communications === null || communications === void 0
                ? void 0
                : communications.length)
            ) {
              return [2 /*return*/, this.getEmptyPerformanceMetrics(period)];
            }
            optimized = communications.filter(function (c) {
              var _a;
              return (
                ((_a = c.send_time_optimization) === null || _a === void 0 ? void 0 : _a.length) > 0
              );
            });
            baseline = communications.filter(function (c) {
              var _a;
              return !((_a = c.send_time_optimization) === null || _a === void 0
                ? void 0
                : _a.length);
            });
            baselineMetrics = this.calculateGroupMetrics(baseline);
            optimizedMetrics = this.calculateGroupMetrics(optimized);
            improvement = {
              responseRate:
                optimizedMetrics.averageResponseRate - baselineMetrics.averageResponseRate,
              openRate: optimizedMetrics.averageOpenRate - baselineMetrics.averageOpenRate,
              clickRate: optimizedMetrics.averageClickRate - baselineMetrics.averageClickRate,
              conversionRate:
                optimizedMetrics.averageConversionRate - baselineMetrics.averageConversionRate,
            };
            return [
              2 /*return*/,
              {
                period: period,
                baseline: baselineMetrics,
                optimized: optimizedMetrics,
                improvement: improvement,
                segments: {}, // Implementar segmentação se necessário
              },
            ];
          case 2:
            error_7 = _a.sent();
            console.error("Error calculating optimization performance:", error_7);
            return [2 /*return*/, this.getEmptyPerformanceMetrics(period)];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * ====================================================================
   * HELPER METHODS
   * ====================================================================
   */
  /**
   * Buscar histórico de engajamento de um paciente
   */
  OptimalTimingEngine.prototype.getPatientEngagementHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_timing_patterns")
                .select("*")
                .eq("patient_id", patientId)
                .gte("last_updated", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, (data || []).map(this.mapTimingPatternFromDB)];
        }
      });
    });
  };
  /**
   * Calcular confiança de um padrão baseado no tamanho da amostra
   */
  OptimalTimingEngine.prototype.calculatePatternConfidence = function (sampleSize) {
    if (sampleSize < 10) return 0.1;
    if (sampleSize < 30) return 0.5;
    if (sampleSize < 50) return 0.7;
    if (sampleSize < 100) return 0.8;
    return 0.9;
  };
  /**
   * Segmentar dados por idade
   */
  OptimalTimingEngine.prototype.segmentByAge = function (data) {
    var _this = this;
    return data.reduce(function (acc, item) {
      var _a;
      if (!((_a = item.patient) === null || _a === void 0 ? void 0 : _a.birth_date)) return acc;
      var age = _this.calculateAge(new Date(item.patient.birth_date));
      var segment = "unknown";
      if (age < 25) segment = "18-24";
      else if (age < 35) segment = "25-34";
      else if (age < 45) segment = "35-44";
      else if (age < 55) segment = "45-54";
      else if (age < 65) segment = "55-64";
      else segment = "65+";
      if (!acc[segment]) acc[segment] = [];
      acc[segment].push(item);
      return acc;
    }, {});
  };
  /**
   * Segmentar dados por gênero
   */
  OptimalTimingEngine.prototype.segmentByGender = function (data) {
    return data.reduce(function (acc, item) {
      var _a;
      var gender =
        ((_a = item.patient) === null || _a === void 0 ? void 0 : _a.gender) || "unknown";
      if (!acc[gender]) acc[gender] = [];
      acc[gender].push(item);
      return acc;
    }, {});
  };
  /**
   * Segmentar dados por tipo de comunicação
   */
  OptimalTimingEngine.prototype.segmentByType = function (data) {
    return data.reduce(function (acc, item) {
      var type = item.type || "unknown";
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
  };
  /**
   * Calcular idade baseada na data de nascimento
   */
  OptimalTimingEngine.prototype.calculateAge = function (birthDate) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  /**
   * Mapear padrão de timing do banco de dados
   */
  OptimalTimingEngine.prototype.mapTimingPatternFromDB = function (data) {
    return {
      id: data.id,
      clinicId: data.clinic_id,
      patientId: data.patient_id,
      communicationType: data.communication_type,
      dayOfWeek: data.day_of_week,
      hour: data.hour,
      responseRate: data.response_rate,
      openRate: data.open_rate,
      clickRate: data.click_rate,
      conversionRate: data.conversion_rate,
      sampleSize: data.sample_size,
      confidence: data.confidence,
      lastUpdated: new Date(data.last_updated),
      timezone: data.timezone,
    };
  };
  /**
   * Gerar ID único
   */
  OptimalTimingEngine.prototype.generateId = function () {
    return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
  };
  // Placeholder methods for completion
  OptimalTimingEngine.prototype.generateGeneralRecommendations = function (
    globalPatterns,
    segmentedPatterns,
    request,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []];
      });
    });
  };
  OptimalTimingEngine.prototype.generateTimingInsights = function (
    globalPatterns,
    segmentedPatterns,
    data,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []];
      });
    });
  };
  OptimalTimingEngine.prototype.calculatePerformanceMetrics = function (data) {
    return {
      totalCommunications: data.length,
      averageResponseRate: 0,
      optimizedCommunications: 0,
      improvementRate: 0,
    };
  };
  OptimalTimingEngine.prototype.saveAnalysisResult = function (result) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  OptimalTimingEngine.prototype.determinePatientSegments = function (patient) {
    var segments = [];
    var age = this.calculateAge(new Date(patient.birth_date));
    if (age < 25) segments.push("young_adult");
    else if (age < 45) segments.push("middle_age");
    else segments.push("senior");
    segments.push(patient.gender || "unknown");
    return segments;
  };
  OptimalTimingEngine.prototype.generateAlternativeTimes = function (
    optimalTime,
    patientPatterns,
    globalPatterns,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, []];
      });
    });
  };
  OptimalTimingEngine.prototype.determineAvoidTimes = function (patient, patterns) {
    return [];
  };
  OptimalTimingEngine.prototype.generateRecommendationReasoning = function (
    optimalTime,
    patterns,
    segments,
    globalPatterns,
  ) {
    return ["Based on historical engagement patterns"];
  };
  OptimalTimingEngine.prototype.calculateSeasonalAdjustments = function () {
    return [];
  };
  OptimalTimingEngine.prototype.generateStatisticalOptimalTime = function (
    patient,
    communicationType,
    patterns,
  ) {
    var _a;
    // Fallback simples baseado em padrões estatísticos
    var bestPattern = patterns
      .filter(function (p) {
        return p.communicationType === communicationType;
      })
      .sort(function (a, b) {
        return b.responseRate - a.responseRate;
      })[0];
    if (bestPattern) {
      return {
        hour: bestPattern.hour,
        minute: 0,
        dayOfWeek: bestPattern.dayOfWeek,
        timezone: bestPattern.timezone,
        confidence: bestPattern.confidence,
        expectedResponseRate: bestPattern.responseRate,
      };
    }
    // Horário padrão se não há dados
    return {
      hour: 10,
      minute: 0,
      dayOfWeek: 2, // Terça-feira
      timezone:
        ((_a = this.config) === null || _a === void 0
          ? void 0
          : _a.globalSettings.defaultTimezone) || "America/Sao_Paulo",
      confidence: 0.3,
      expectedResponseRate: 15,
    };
  };
  OptimalTimingEngine.prototype.calculateDaysSinceLastCommunication = function (patientId) {
    // Implementar busca da última comunicação
    return 7; // placeholder
  };
  OptimalTimingEngine.prototype.calculateEngagementWindow = function (patterns) {
    // Calcular janela de engajamento em minutos
    return 120; // placeholder
  };
  OptimalTimingEngine.prototype.calculateAverageResponseLatency = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementar cálculo de latência média de resposta
        return [2 /*return*/, 30]; // placeholder em minutos
      });
    });
  };
  OptimalTimingEngine.prototype.getPatientRecommendation = function (patientId, communicationType) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Buscar recomendação existente no cache ou banco
        return [2 /*return*/, null];
      });
    });
  };
  OptimalTimingEngine.prototype.getRealTimeFactors = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Buscar fatores em tempo real
        return [2 /*return*/, null];
      });
    });
  };
  OptimalTimingEngine.prototype.calculateExpectedImprovement = function (
    originalTime,
    optimizedTime,
    recommendation,
  ) {
    // Calcular melhoria esperada em %
    return 0;
  };
  OptimalTimingEngine.prototype.generateOptimizationReason = function (
    originalTime,
    optimizedTime,
    recommendation,
  ) {
    return "Optimized based on timing analysis";
  };
  OptimalTimingEngine.prototype.extractOptimizationFactors = function (
    realTimeFactors,
    recommendation,
  ) {
    return [];
  };
  OptimalTimingEngine.prototype.isTimeInWindow = function (time, window) {
    var hour = time.getHours();
    var minute = time.getMinutes();
    var totalMinutes = hour * 60 + minute;
    var startMinutes = window.startHour * 60 + (window.startMinute || 0);
    var endMinutes = window.endHour * 60 + (window.endMinute || 0);
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  };
  OptimalTimingEngine.prototype.getEmptyPerformanceMetrics = function (period) {
    return {
      period: period,
      baseline: {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0,
      },
      optimized: {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0,
      },
      improvement: {
        responseRate: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
      },
      segments: {},
    };
  };
  OptimalTimingEngine.prototype.calculateGroupMetrics = function (communications) {
    if (!communications.length) {
      return {
        totalCommunications: 0,
        averageResponseRate: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageConversionRate: 0,
      };
    }
    var totalResponses = 0;
    var totalOpens = 0;
    var totalClicks = 0;
    var totalConversions = 0;
    communications.forEach(function (comm) {
      var events = comm.communication_events || [];
      if (
        events.some(function (e) {
          return e.type === "response";
        })
      )
        totalResponses++;
      if (
        events.some(function (e) {
          return e.type === "open";
        })
      )
        totalOpens++;
      if (
        events.some(function (e) {
          return e.type === "click";
        })
      )
        totalClicks++;
      if (
        events.some(function (e) {
          return e.type === "conversion";
        })
      )
        totalConversions++;
    });
    return {
      totalCommunications: communications.length,
      averageResponseRate: (totalResponses / communications.length) * 100,
      averageOpenRate: (totalOpens / communications.length) * 100,
      averageClickRate: (totalClicks / communications.length) * 100,
      averageConversionRate: (totalConversions / communications.length) * 100,
    };
  };
  return OptimalTimingEngine;
})();
exports.OptimalTimingEngine = OptimalTimingEngine;
// Export singleton instance
var createoptimalTimingEngine = function () {
  return new OptimalTimingEngine();
};
exports.createoptimalTimingEngine = createoptimalTimingEngine;
