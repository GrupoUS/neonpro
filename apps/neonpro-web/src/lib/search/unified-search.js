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
exports.createunifiedSearchSystem = void 0;
// lib/search/unified-search.ts - Server-side search implementation
var server_1 = require("@/lib/supabase/server");
var insights_engine_1 = require("@/lib/ai/insights-engine");
var timeline_manager_1 = require("@/lib/medical/timeline-manager");
var duplicate_detection_1 = require("@/lib/patients/duplicate-detection");
var photo_recognition_1 = require("@/lib/patients/photo-recognition");
var profile_manager_1 = require("@/lib/patients/profile-manager");
var nlp_engine_1 = require("./nlp-engine");
var createunifiedSearchSystem = /** @class */ (() => {
  function createunifiedSearchSystem() {
    this.supabase = (0, server_1.createClient)();
    this.profileManager = new profile_manager_1.ProfileManager();
    this.timelineManager = new timeline_manager_1.MedicalTimelineManager();
    this.duplicateDetection = new duplicate_detection_1.DuplicateDetectionSystem();
    this.photoRecognition = new photo_recognition_1.PhotoRecognitionSystem();
    this.insightsEngine = new insights_engine_1.AIInsightsEngine();
  }
  /**
   * Executa busca unificada em todo o sistema com análise NLP
   */
  createunifiedSearchSystem.prototype.search = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        nlpAnalysis,
        allResults,
        searchPromises,
        searchTypes,
        searchResults,
        offset,
        limit,
        paginatedResults,
        executionTime,
        suggestions,
        error_1;
      var _a, _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            startTime = performance.now();
            _e.label = 1;
          case 1:
            _e.trys.push([1, 5, , 6]);
            nlpAnalysis = void 0;
            if (!(((_a = query.options) === null || _a === void 0 ? void 0 : _a.useNLP) !== false))
              return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              nlp_engine_1.nlpSearchEngine.processQuery(query.term, query.context),
            ];
          case 2:
            nlpAnalysis = _e.sent();
            query.nlpAnalysis = nlpAnalysis;
            _e.label = 3;
          case 3:
            allResults = [];
            searchPromises = [];
            searchTypes = ((_b = query.filters) === null || _b === void 0 ? void 0 : _b.types) || [
              "patients",
              "appointments",
              "medical_records",
              "insights",
              "timeline_events",
            ];
            // Refine search types based on NLP intent
            if (nlpAnalysis) {
              searchTypes = this.refineSearchTypesFromNLP(searchTypes, nlpAnalysis);
            }
            // Executar buscas em paralelo para cada tipo
            if (searchTypes.includes("patients")) {
              searchPromises.push(this.searchPatients(query));
            }
            if (searchTypes.includes("timeline_events")) {
              searchPromises.push(this.searchTimelineEvents(query));
            }
            if (searchTypes.includes("insights")) {
              searchPromises.push(this.searchInsights(query));
            }
            if (searchTypes.includes("duplicates")) {
              searchPromises.push(this.searchDuplicates(query));
            }
            if (searchTypes.includes("photos")) {
              searchPromises.push(this.searchPhotos(query));
            }
            if (searchTypes.includes("medical_records")) {
              searchPromises.push(this.searchMedicalRecords(query));
            }
            if (searchTypes.includes("appointments")) {
              searchPromises.push(this.searchAppointments(query));
            }
            if (searchTypes.includes("documents")) {
              searchPromises.push(this.searchDocuments(query));
            }
            return [4 /*yield*/, Promise.all(searchPromises)];
          case 4:
            searchResults = _e.sent();
            allResults = searchResults.flat();
            // Ordenar por relevância (considerando scores NLP se disponível)
            allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
            offset = ((_c = query.options) === null || _c === void 0 ? void 0 : _c.offset) || 0;
            limit = ((_d = query.options) === null || _d === void 0 ? void 0 : _d.limit) || 50;
            paginatedResults = allResults.slice(offset, offset + limit);
            executionTime = performance.now() - startTime;
            suggestions =
              (nlpAnalysis === null || nlpAnalysis === void 0 ? void 0 : nlpAnalysis.suggestions) ||
              this.generateSearchSuggestions(query.term);
            return [
              2 /*return*/,
              {
                query: query,
                nlpAnalysis: nlpAnalysis,
                results: paginatedResults,
                totalCount: allResults.length,
                executionTime: executionTime,
                suggestions: suggestions,
                facets: this.generateSearchFacets(allResults),
              },
            ];
          case 5:
            error_1 = _e.sent();
            console.error("Erro na busca unificada:", error_1);
            throw new Error("Falha na execução da busca");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Refina tipos de busca baseado na análise NLP
   */
  createunifiedSearchSystem.prototype.refineSearchTypesFromNLP = (defaultTypes, nlpAnalysis) => {
    var refinedTypes = __spreadArray([], defaultTypes, true);
    // Based on intent target, prioritize certain search types
    switch (nlpAnalysis.intent.target) {
      case "patient":
        if (!refinedTypes.includes("patients")) refinedTypes.unshift("patients");
        if (!refinedTypes.includes("photos")) refinedTypes.push("photos");
        if (!refinedTypes.includes("duplicates")) refinedTypes.push("duplicates");
        break;
      case "appointment":
        if (!refinedTypes.includes("appointments")) refinedTypes.unshift("appointments");
        break;
      case "treatment":
        if (!refinedTypes.includes("medical_records")) refinedTypes.unshift("medical_records");
        if (!refinedTypes.includes("timeline_events")) refinedTypes.push("timeline_events");
        break;
      case "procedure":
        if (!refinedTypes.includes("timeline_events")) refinedTypes.unshift("timeline_events");
        if (!refinedTypes.includes("medical_records")) refinedTypes.push("medical_records");
        break;
      case "record":
        if (!refinedTypes.includes("medical_records")) refinedTypes.unshift("medical_records");
        if (!refinedTypes.includes("documents")) refinedTypes.push("documents");
        break;
    }
    // Based on entities found, add relevant search types
    var hasPersonEntity = nlpAnalysis.entities.some((e) => e.type === "person");
    var hasProcedureEntity = nlpAnalysis.entities.some((e) => e.type === "procedure");
    var hasConditionEntity = nlpAnalysis.entities.some((e) => e.type === "condition");
    if (hasPersonEntity && !refinedTypes.includes("patients")) {
      refinedTypes.unshift("patients");
    }
    if (hasProcedureEntity && !refinedTypes.includes("timeline_events")) {
      refinedTypes.push("timeline_events");
    }
    if (hasConditionEntity && !refinedTypes.includes("medical_records")) {
      refinedTypes.push("medical_records");
    }
    return refinedTypes;
  };
  /**
   * Busca pacientes com melhorias NLP
   */
  createunifiedSearchSystem.prototype.searchPatients = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var results,
        nlpAnalysis,
        searchTerm,
        nameFilter,
        ageFilter,
        specialtyFilter,
        personEntities,
        ageEntities,
        age,
        specialtyEntities,
        mockPatients,
        _i,
        mockPatients_1,
        patient,
        matches,
        matchScore,
        matchReasons,
        procedureEntities,
        _a,
        procedureEntities_1,
        proc;
      return __generator(this, function (_b) {
        try {
          results = [];
          nlpAnalysis = query.nlpAnalysis;
          searchTerm = query.term;
          nameFilter = void 0;
          ageFilter = void 0;
          specialtyFilter = void 0;
          // Extract filters from NLP analysis if available
          if (nlpAnalysis) {
            personEntities = nlpAnalysis.entities.filter((e) => e.type === "person");
            if (personEntities.length > 0) {
              nameFilter = personEntities[0].value;
            }
            ageEntities = nlpAnalysis.entities.filter((e) => e.type === "age");
            if (ageEntities.length > 0) {
              age = parseInt(ageEntities[0].value);
              ageFilter = { min: age - 2, max: age + 2 }; // Allow some variance
            }
            specialtyEntities = nlpAnalysis.entities.filter((e) => e.type === "specialty");
            if (specialtyEntities.length > 0) {
              specialtyFilter = specialtyEntities[0].value;
            }
          }
          mockPatients = [
            {
              id: "pat_123",
              name: "João Silva Santos",
              email: "joao.silva@email.com",
              phone: "(11) 99999-9999",
              birthDate: "1985-03-15",
              age: 39,
              specialty: "dermatologia",
            },
            {
              id: "pat_456",
              name: "Maria Santos Silva",
              email: "maria.santos@email.com",
              phone: "(11) 88888-8888",
              birthDate: "1990-07-22",
              age: 34,
              specialty: "estética",
            },
            {
              id: "pat_789",
              name: "Ana Botox Cliente",
              email: "ana.cliente@email.com",
              phone: "(11) 77777-7777",
              birthDate: "1988-11-10",
              age: 36,
              specialty: "estética",
            },
          ];
          for (_i = 0, mockPatients_1 = mockPatients; _i < mockPatients_1.length; _i++) {
            patient = mockPatients_1[_i];
            matches = false;
            matchScore = 0.5;
            matchReasons = [];
            // Check name match
            if (nameFilter) {
              if (patient.name.toLowerCase().includes(nameFilter.toLowerCase())) {
                matches = true;
                matchScore += 0.3;
                matchReasons.push("Nome corresponde: ".concat(nameFilter));
              }
            } else if (
              this.matchesSearchTerm(searchTerm, patient.name, patient.email, patient.phone)
            ) {
              matches = true;
              matchScore += 0.2;
              matchReasons.push("Corresponde ao termo de busca");
            }
            // Check age match
            if (ageFilter) {
              if (patient.age >= (ageFilter.min || 0) && patient.age <= (ageFilter.max || 120)) {
                matches = true;
                matchScore += 0.2;
                matchReasons.push("Idade corresponde: ".concat(patient.age, " anos"));
              }
            }
            // Check specialty match
            if (specialtyFilter) {
              if (patient.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())) {
                matches = true;
                matchScore += 0.2;
                matchReasons.push("Especialidade: ".concat(patient.specialty));
              }
            }
            // Check for procedure entities (enhanced matching)
            if (nlpAnalysis) {
              procedureEntities = nlpAnalysis.entities.filter((e) => e.type === "procedure");
              for (
                _a = 0, procedureEntities_1 = procedureEntities;
                _a < procedureEntities_1.length;
                _a++
              ) {
                proc = procedureEntities_1[_a];
                if (
                  proc.value.toLowerCase() === "botox" &&
                  patient.name.toLowerCase().includes("botox")
                ) {
                  matches = true;
                  matchScore += 0.3;
                  matchReasons.push("Procedimento relacionado: ".concat(proc.value));
                }
              }
            }
            if (matches) {
              results.push({
                id: patient.id,
                type: "patients",
                title: patient.name,
                description: ""
                  .concat(patient.email, " \u2022 ")
                  .concat(patient.phone, " \u2022 ")
                  .concat(patient.age, " anos \u2022 ")
                  .concat(patient.specialty),
                relevanceScore: Math.min(matchScore, 1.0),
                metadata: __assign(__assign({}, patient), {
                  matchReasons: matchReasons,
                  nlpEnhanced: !!nlpAnalysis,
                }),
                highlights: matchReasons,
                url: "/patients/".concat(patient.id),
                actions: [
                  { id: "view", label: "Ver Perfil", url: "/patients/".concat(patient.id) },
                  { id: "edit", label: "Editar", url: "/patients/".concat(patient.id, "/edit") },
                  {
                    id: "timeline",
                    label: "Timeline",
                    url: "/patients/".concat(patient.id, "/timeline"),
                  },
                ],
              });
            }
          }
          return [2 /*return*/, results.sort((a, b) => b.relevanceScore - a.relevanceScore)];
        } catch (error) {
          console.error("Erro na busca de pacientes:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca eventos da timeline
   */
  createunifiedSearchSystem.prototype.searchTimelineEvents = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var results, mockEvents, _i, mockEvents_1, event_1;
      return __generator(this, function (_a) {
        try {
          results = [];
          mockEvents = [
            {
              id: "evt_001",
              title: "Consulta de Rotina",
              description: "Consulta anual preventiva",
              date: new Date("2024-01-15"),
              provider: "Dr. Maria Silva",
              type: "appointment",
            },
            {
              id: "evt_002",
              title: "Exames Laboratoriais",
              description: "Hemograma completo, perfil lipídico",
              date: new Date("2024-01-20"),
              provider: "Lab Central",
              type: "lab",
            },
          ];
          for (_i = 0, mockEvents_1 = mockEvents; _i < mockEvents_1.length; _i++) {
            event_1 = mockEvents_1[_i];
            if (
              this.matchesSearchTerm(
                query.term,
                event_1.title,
                event_1.description,
                event_1.provider,
              )
            ) {
              results.push({
                id: event_1.id,
                type: "timeline_events",
                title: event_1.title,
                description: "".concat(event_1.description, " \u2022 ").concat(event_1.provider),
                relevanceScore: this.calculateRelevance(query.term, event_1.title),
                metadata: event_1,
                actions: [{ id: "view", label: "Ver Detalhes", handler: "viewTimelineEvent" }],
              });
            }
          }
          return [2 /*return*/, results];
        } catch (error) {
          console.error("Erro na busca de eventos da timeline:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca insights de IA
   */
  createunifiedSearchSystem.prototype.searchInsights = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var results, mockInsights, _i, mockInsights_1, insight;
      return __generator(this, function (_a) {
        try {
          results = [];
          mockInsights = [
            {
              id: "insight_001",
              title: "Risco Cardiovascular Elevado",
              description: "Análise dos dados clínicos indica risco aumentado",
              confidence: 0.87,
              type: "clinical",
            },
            {
              id: "insight_002",
              title: "Padrão de Não Aderência",
              description: "IA detectou padrões de baixa aderência medicamentosa",
              confidence: 0.73,
              type: "behavioral",
            },
          ];
          for (_i = 0, mockInsights_1 = mockInsights; _i < mockInsights_1.length; _i++) {
            insight = mockInsights_1[_i];
            if (this.matchesSearchTerm(query.term, insight.title, insight.description)) {
              results.push({
                id: insight.id,
                type: "insights",
                title: insight.title,
                description: insight.description,
                relevanceScore: this.calculateRelevance(query.term, insight.title),
                metadata: insight,
                actions: [{ id: "view", label: "Ver Insight", handler: "viewInsight" }],
              });
            }
          }
          return [2 /*return*/, results];
        } catch (error) {
          console.error("Erro na busca de insights:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca duplicatas
   */
  createunifiedSearchSystem.prototype.searchDuplicates = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var results, duplicates, _i, duplicates_1, duplicate, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            results = [];
            return [4 /*yield*/, this.duplicateDetection.detectDuplicates()];
          case 1:
            duplicates = _a.sent();
            for (_i = 0, duplicates_1 = duplicates; _i < duplicates_1.length; _i++) {
              duplicate = duplicates_1[_i];
              if (this.matchesSearchTerm(query.term, duplicate.id, duplicate.status)) {
                results.push({
                  id: duplicate.id,
                  type: "duplicates",
                  title: "Duplicata: "
                    .concat(duplicate.primaryPatientId, " \u2194 ")
                    .concat(duplicate.duplicatePatientId),
                  description: "Score: "
                    .concat(duplicate.confidenceScore, " \u2022 Status: ")
                    .concat(duplicate.status),
                  relevanceScore: duplicate.confidenceScore,
                  metadata: duplicate,
                  actions: [
                    { id: "review", label: "Revisar", handler: "reviewDuplicate" },
                    { id: "merge", label: "Merge", handler: "mergeDuplicate" },
                  ],
                });
              }
            }
            return [2 /*return*/, results];
          case 2:
            error_2 = _a.sent();
            console.error("Erro na busca de duplicatas:", error_2);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Busca fotos
   */
  createunifiedSearchSystem.prototype.searchPhotos = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      var results, mockPhotos, _i, mockPhotos_1, photo;
      return __generator(this, function (_a) {
        try {
          results = [];
          mockPhotos = [
            {
              id: "photo_001",
              patientId: "pat_123",
              fileName: "profile_photo.jpg",
              status: "verified",
              verificationScore: 0.92,
            },
          ];
          for (_i = 0, mockPhotos_1 = mockPhotos; _i < mockPhotos_1.length; _i++) {
            photo = mockPhotos_1[_i];
            if (this.matchesSearchTerm(query.term, photo.fileName, photo.patientId, photo.status)) {
              results.push({
                id: photo.id,
                type: "photos",
                title: photo.fileName,
                description: "Paciente: "
                  .concat(photo.patientId, " \u2022 Status: ")
                  .concat(photo.status),
                relevanceScore: photo.verificationScore || 0.5,
                metadata: photo,
                actions: [{ id: "view", label: "Ver Foto", handler: "viewPhoto" }],
              });
            }
          }
          return [2 /*return*/, results];
        } catch (error) {
          console.error("Erro na busca de fotos:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca registros médicos
   */
  createunifiedSearchSystem.prototype.searchMedicalRecords = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Simular busca de registros médicos
          return [2 /*return*/, []];
        } catch (error) {
          console.error("Erro na busca de registros médicos:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca consultas
   */
  createunifiedSearchSystem.prototype.searchAppointments = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Simular busca de consultas
          return [2 /*return*/, []];
        } catch (error) {
          console.error("Erro na busca de consultas:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Busca documentos
   */
  createunifiedSearchSystem.prototype.searchDocuments = function (query) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // Simular busca de documentos
          return [2 /*return*/, []];
        } catch (error) {
          console.error("Erro na busca de documentos:", error);
          return [2 /*return*/, []];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Verifica se o termo de busca corresponde aos campos
   */
  createunifiedSearchSystem.prototype.matchesSearchTerm = (searchTerm) => {
    var fields = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      fields[_i - 1] = arguments[_i];
    }
    var term = searchTerm.toLowerCase();
    return fields.some((field) => field && field.toLowerCase().includes(term));
  };
  /**
   * Calcula relevância do resultado
   */
  createunifiedSearchSystem.prototype.calculateRelevance = (searchTerm, text) => {
    var term = searchTerm.toLowerCase();
    var content = text.toLowerCase();
    if (content === term) return 1.0;
    if (content.startsWith(term)) return 0.9;
    if (content.includes(term)) return 0.7;
    // Calcular similaridade por palavras
    var termWords = term.split(" ");
    var contentWords = content.split(" ");
    var matches = termWords.filter((word) =>
      contentWords.some((contentWord) => contentWord.includes(word)),
    ).length;
    return (matches / termWords.length) * 0.6;
  };
  /**
   * Gera sugestões de busca
   */
  createunifiedSearchSystem.prototype.generateSearchSuggestions = (term) => {
    var suggestions = [
      "".concat(term, " consultas"),
      "".concat(term, " exames"),
      "".concat(term, " medicamentos"),
      "hist\u00F3rico ".concat(term),
      "timeline ".concat(term),
    ];
    return suggestions.slice(0, 3);
  };
  /**
   * Gera facetas para filtros
   */
  createunifiedSearchSystem.prototype.generateSearchFacets = (results) => {
    var facets = {};
    // Faceta por tipo
    var typeCount = {};
    results.forEach((result) => {
      typeCount[result.type] = (typeCount[result.type] || 0) + 1;
    });
    facets.type = Object.entries(typeCount).map((_a) => {
      var value = _a[0],
        count = _a[1];
      return { value: value, count: count };
    });
    return facets;
  };
  /**
   * Busca inteligente com NLP automático
   */
  createunifiedSearchSystem.prototype.smartSearch = function (term, context, options) {
    return __awaiter(this, void 0, void 0, function () {
      var query;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            query = {
              term: term,
              context: context,
              filters: {
                types: (options === null || options === void 0 ? void 0 : options.types) || [
                  "patients",
                  "appointments",
                  "timeline_events",
                  "insights",
                ],
              },
              options: {
                useNLP: true, // Force NLP processing
                limit: (options === null || options === void 0 ? void 0 : options.limit) || 20,
                sortBy: "relevance",
              },
            };
            return [4 /*yield*/, this.search(query)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Busca conversacional - interface amigável para usuários
   */
  createunifiedSearchSystem.prototype.conversationalSearch = function (
    naturalLanguageQuery_1,
    userId_1,
  ) {
    return __awaiter(this, arguments, void 0, function (naturalLanguageQuery, userId, userRole) {
      var context, query, response;
      if (userRole === void 0) {
        userRole = "user";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            context = {
              userId: userId,
              userRole: userRole,
              recentSearches: [], // Could be loaded from database
            };
            query = {
              term: naturalLanguageQuery,
              context: context,
              options: {
                useNLP: true,
                limit: 15,
                sortBy: "relevance",
                highlight: true,
              },
            };
            return [4 /*yield*/, this.search(query)];
          case 1:
            response = _a.sent();
            // Add conversational context to response
            if (response.nlpAnalysis) {
              // Log the search for future context
              console.log(
                "Conversational search by ".concat(userId, ': "').concat(naturalLanguageQuery, '"'),
              );
              console.log(
                "Intent: "
                  .concat(response.nlpAnalysis.intent.action, " ")
                  .concat(response.nlpAnalysis.intent.target),
              );
              console.log(
                "Entities: ".concat(
                  response.nlpAnalysis.entities
                    .map((e) => "".concat(e.type, ":").concat(e.value))
                    .join(", "),
                ),
              );
            }
            return [2 /*return*/, response];
        }
      });
    });
  };
  /**
   * Busca avançada com múltiplos critérios e NLP
   */
  createunifiedSearchSystem.prototype.advancedSearch = function (criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var searchTerms, query, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            searchTerms = __spreadArray(
              __spreadArray(
                __spreadArray([criteria.patientName], criteria.keywords || [], true),
                criteria.eventTypes || [],
                true,
              ),
              criteria.providers || [],
              true,
            )
              .filter(Boolean)
              .join(" ");
            query = {
              term: searchTerms,
              context: criteria.context,
              filters: {
                dateRange: criteria.dateRange,
                types: ["patients", "timeline_events", "appointments"],
              },
              options: {
                useNLP: criteria.useNLP !== false, // Default to true for advanced search
                limit: 50,
                sortBy: "relevance",
              },
            };
            return [4 /*yield*/, this.search(query)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_3 = _a.sent();
            console.error("Erro na busca avançada:", error_3);
            throw new Error("Falha na busca avançada");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Salva busca para uso futuro
   */
  createunifiedSearchSystem.prototype.saveSearch = function (name, query, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var savedSearchId;
      return __generator(this, (_a) => {
        try {
          savedSearchId = "search_".concat(Date.now());
          // Simular salvamento da busca
          console.log("Busca salva: ".concat(name, " por ").concat(userId));
          return [2 /*return*/, savedSearchId];
        } catch (error) {
          console.error("Erro ao salvar busca:", error);
          throw new Error("Falha ao salvar busca");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Gera estatísticas do sistema de busca
   */
  createunifiedSearchSystem.prototype.getSearchStatistics = function () {
    return __awaiter(this, arguments, void 0, function (timeframe) {
      var stats;
      if (timeframe === void 0) {
        timeframe = "30days";
      }
      return __generator(this, (_a) => {
        try {
          stats = {
            totalSearches: 1847,
            averageResultsPerSearch: 12.3,
            mostSearchedTerms: [
              { term: "joão", count: 145 },
              { term: "consulta", count: 98 },
              { term: "exame", count: 87 },
            ],
            searchesByType: {
              patients: 654,
              appointments: 432,
              medical_records: 287,
              timeline_events: 234,
              insights: 156,
              lab_results: 84,
              medications: 67,
              documents: 45,
              duplicates: 23,
              photos: 12,
            },
            averageExecutionTime: 145.6,
            userSearchPatterns: {
              peakHours: ["09:00-11:00", "14:00-16:00"],
              commonSequences: [
                ["paciente", "timeline", "consultas"],
                ["exame", "resultado", "histórico"],
              ],
            },
          };
          return [2 /*return*/, stats];
        } catch (error) {
          console.error("Erro ao gerar estatísticas de busca:", error);
          throw new Error("Falha na geração de estatísticas");
        }
        return [2 /*return*/];
      });
    });
  };
  return createunifiedSearchSystem;
})();
exports.createunifiedSearchSystem = createunifiedSearchSystem;
