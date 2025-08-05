/**
 * Medical Timeline Component
 * Visual timeline display of patient medical history
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalTimeline = MedicalTimeline;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function MedicalTimeline(_a) {
  var patientId = _a.patientId,
    className = _a.className;
  var _b = (0, react_1.useState)([]),
    events = _b[0],
    setEvents = _b[1];
  var _c = (0, react_1.useState)([]),
    milestones = _c[0],
    setMilestones = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)({}),
    filter = _e[0],
    setFilter = _e[1];
  var _f = (0, react_1.useState)("timeline"),
    activeTab = _f[0],
    setActiveTab = _f[1];
  var _g = (0, react_1.useState)(false),
    showFilters = _g[0],
    setShowFilters = _g[1];
  var _h = (0, react_1.useState)(null),
    selectedEvent = _h[0],
    setSelectedEvent = _h[1];
  (0, react_1.useEffect)(() => {
    loadTimeline();
    loadMilestones();
  }, [patientId, filter]);
  var loadTimeline = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_1;
      var _a, _b;
      return __generator(this, (_c) => {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, 4, 5]);
            setLoading(true);
            params = new URLSearchParams(
              __assign(
                __assign(
                  __assign(
                    __assign(
                      __assign(
                        __assign(
                          __assign(
                            __assign(
                              { patientId: patientId, action: "timeline" },
                              filter.eventTypes && { eventTypes: filter.eventTypes.join(",") },
                            ),
                            filter.categories && { categories: filter.categories.join(",") },
                          ),
                          ((_a = filter.dateRange) === null || _a === void 0
                            ? void 0
                            : _a.start) && {
                            startDate: filter.dateRange.start.toISOString(),
                          },
                        ),
                        ((_b = filter.dateRange) === null || _b === void 0 ? void 0 : _b.end) && {
                          endDate: filter.dateRange.end.toISOString(),
                        },
                      ),
                      filter.professionals && {
                        professionals: filter.professionals.join(","),
                      },
                    ),
                    filter.severity && { severity: filter.severity.join(",") },
                  ),
                  filter.includePhotos && { includePhotos: "true" },
                ),
                filter.includeAttachments && { includeAttachments: "true" },
              ),
            );
            return [4 /*yield*/, fetch("/api/patients/timeline?".concat(params))];
          case 1:
            response = _c.sent();
            if (!response.ok) throw new Error("Failed to load timeline");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _c.sent();
            setEvents(data.timeline || []);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            console.error("Error loading timeline:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var loadMilestones = () =>
    __awaiter(this, void 0, void 0, function () {
      var params, response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            params = new URLSearchParams({
              patientId: patientId,
              action: "milestones",
            });
            return [4 /*yield*/, fetch("/api/patients/timeline?".concat(params))];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Failed to load milestones");
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setMilestones(data.milestones || []);
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error loading milestones:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var toggleEventExpansion = (eventId) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? __assign(__assign({}, event), { expanded: !event.expanded }) : event,
      ),
    );
  };
  var getEventIcon = (eventType) => {
    switch (eventType) {
      case "appointment":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "treatment":
        return <lucide_react_1.Stethoscope className="h-4 w-4" />;
      case "procedure":
        return <lucide_react_1.Activity className="h-4 w-4" />;
      case "medication":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "test":
        return <lucide_react_1.TrendingUp className="h-4 w-4" />;
      case "diagnosis":
        return <lucide_react_1.AlertCircle className="h-4 w-4" />;
      case "note":
        return <lucide_react_1.MessageSquare className="h-4 w-4" />;
      case "photo":
        return <lucide_react_1.Camera className="h-4 w-4" />;
      default:
        return <lucide_react_1.Clock className="h-4 w-4" />;
    }
  };
  var getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  var getCategoryColor = (category) => {
    switch (category) {
      case "medical":
        return "bg-blue-100 text-blue-800";
      case "aesthetic":
        return "bg-purple-100 text-purple-800";
      case "dental":
        return "bg-green-100 text-green-800";
      case "wellness":
        return "bg-teal-100 text-teal-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var formatDate = (date) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  var formatRelativeDate = (date) => {
    var now = new Date();
    var diff = now.getTime() - new Date(date).getTime();
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return "".concat(days, " dias atr\u00E1s");
    if (days < 30) return "".concat(Math.floor(days / 7), " semanas atr\u00E1s");
    if (days < 365) return "".concat(Math.floor(days / 30), " meses atr\u00E1s");
    return "".concat(Math.floor(days / 365), " anos atr\u00E1s");
  };
  var renderTimelineEvent = (event, index) => {
    var isLast = index === events.length - 1;
    return (
      <div key={event.id} className="relative">
        {/* Timeline line */}
        {!isLast && <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -ml-px" />}

        {/* Event marker */}
        <div className="relative flex items-start space-x-4">
          <div
            className={(0, utils_1.cn)(
              "flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm",
              getSeverityColor(event.severity) || "bg-blue-500",
            )}
          >
            <div className="text-white">{getEventIcon(event.eventType)}</div>
          </div>

          {/* Event content */}
          <div className="flex-1 min-w-0 pb-8">
            <card_1.Card
              className={(0, utils_1.cn)(
                "cursor-pointer transition-all hover:shadow-md",
                event.expanded && "shadow-lg",
              )}
              onClick={() => toggleEventExpansion(event.id)}
            >
              <card_1.CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <card_1.CardTitle className="text-lg">{event.title}</card_1.CardTitle>
                    <card_1.CardDescription className="flex items-center space-x-2">
                      <span>{formatDate(event.date)}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(event.date)}</span>
                      {event.professionalName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center">
                            <lucide_react_1.User className="h-3 w-3 mr-1" />
                            {event.professionalName}
                          </span>
                        </>
                      )}
                    </card_1.CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <badge_1.Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </badge_1.Badge>
                    {event.severity && (
                      <badge_1.Badge variant="outline" className="text-xs">
                        {event.severity}
                      </badge_1.Badge>
                    )}
                  </div>
                </div>
              </card_1.CardHeader>

              {event.expanded && (
                <card_1.CardContent className="space-y-4">
                  {/* Description */}
                  {event.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Descrição</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {event.beforeAfterPhotos && event.beforeAfterPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fotos Antes/Depois</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {event.beforeAfterPhotos.map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {photo.beforePhoto && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">Antes</p>
                                  <img
                                    src={photo.beforePhoto.thumbnailUrl}
                                    alt="Antes"
                                    className="w-full h-24 object-cover rounded"
                                  />
                                </div>
                              )}
                              {photo.afterPhoto && (
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-500">Depois</p>
                                  <img
                                    src={photo.afterPhoto.thumbnailUrl}
                                    alt="Depois"
                                    className="w-full h-24 object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                            {photo.notes && <p className="text-xs text-gray-600">{photo.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment Outcome */}
                  {event.outcome && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Resultado do Tratamento</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {event.outcome.success
                            ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                            : <lucide_react_1.AlertCircle className="h-4 w-4 text-red-500" />}
                          <span className="text-sm">
                            {event.outcome.success ? "Sucesso" : "Intercorrências"}
                          </span>
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{event.outcome.satisfactionScore}/10</span>
                          </div>
                        </div>
                        {event.outcome.patientFeedback && (
                          <div>
                            <p className="text-xs text-gray-500">Feedback do Paciente:</p>
                            <p className="text-sm">{event.outcome.patientFeedback}</p>
                          </div>
                        )}
                        {event.outcome.professionalAssessment && (
                          <div>
                            <p className="text-xs text-gray-500">Avaliação Profissional:</p>
                            <p className="text-sm">{event.outcome.professionalAssessment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Notes */}
                  {event.notes && event.notes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Observações</h4>
                      <div className="space-y-2">
                        {event.notes.map((note) => (
                          <div key={note.id} className="border-l-2 border-gray-200 pl-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{note.author}</span>
                              <span className="text-xs text-gray-400">{formatDate(note.date)}</span>
                            </div>
                            <p className="text-sm mt-1">{note.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {event.attachments && event.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Anexos</h4>
                      <div className="space-y-1">
                        {event.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                            <lucide_react_1.FileText className="h-4 w-4 text-gray-400" />
                            <span>{attachment.name}</span>
                            <badge_1.Badge variant="outline" className="text-xs">
                              {attachment.type}
                            </badge_1.Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </card_1.CardContent>
              )}
            </card_1.Card>
          </div>
        </div>
      </div>
    );
  };
  var renderMilestones = () => (
    <div className="space-y-6">
      {milestones.map((tracking) => (
        <card_1.Card key={tracking.id}>
          <card_1.CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <card_1.CardTitle>{tracking.treatmentPlan}</card_1.CardTitle>
                <card_1.CardDescription>
                  Progresso geral: {tracking.overallProgress}%
                </card_1.CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Conclusão estimada: {formatDate(tracking.estimatedCompletion)}
                </p>
              </div>
            </div>
            <progress_1.Progress value={tracking.overallProgress} className="w-full" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {tracking.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {milestone.status === "completed"
                      ? <lucide_react_1.CheckCircle className="h-5 w-5 text-green-500" />
                      : milestone.status === "in_progress"
                        ? <lucide_react_1.Timer className="h-5 w-5 text-blue-500" />
                        : <lucide_react_1.Clock className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <badge_1.Badge
                        variant={milestone.status === "completed" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {milestone.status}
                      </badge_1.Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        Meta: {formatDate(milestone.targetDate)}
                      </span>
                      <span className="text-xs text-gray-500">{milestone.progress}% completo</span>
                    </div>
                    <progress_1.Progress value={milestone.progress} className="w-full mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      ))}
    </div>
  );
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico Médico</h2>
          <p className="text-muted-foreground">
            Timeline completo de eventos médicos e tratamentos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <lucide_react_1.Filter className="h-4 w-4 mr-2" />
            Filtros
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Exportar
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </button_1.Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Filtros</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label_1.Label htmlFor="eventTypes">Tipos de Evento</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todos os tipos" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="appointment">Consultas</select_1.SelectItem>
                    <select_1.SelectItem value="treatment">Tratamentos</select_1.SelectItem>
                    <select_1.SelectItem value="procedure">Procedimentos</select_1.SelectItem>
                    <select_1.SelectItem value="medication">Medicações</select_1.SelectItem>
                    <select_1.SelectItem value="test">Exames</select_1.SelectItem>
                    <select_1.SelectItem value="diagnosis">Diagnósticos</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div>
                <label_1.Label htmlFor="categories">Categorias</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todas as categorias" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="medical">Médico</select_1.SelectItem>
                    <select_1.SelectItem value="aesthetic">Estético</select_1.SelectItem>
                    <select_1.SelectItem value="dental">Dental</select_1.SelectItem>
                    <select_1.SelectItem value="wellness">Bem-estar</select_1.SelectItem>
                    <select_1.SelectItem value="emergency">Emergência</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div>
                <label_1.Label htmlFor="severity">Severidade</label_1.Label>
                <select_1.Select>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Todas as severidades" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                    <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                    <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                    <select_1.SelectItem value="critical">Crítica</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label_1.Label htmlFor="startDate">Data Inicial</label_1.Label>
                <input_1.Input type="date" id="startDate" />
              </div>
              <div>
                <label_1.Label htmlFor="endDate">Data Final</label_1.Label>
                <input_1.Input type="date" id="endDate" />
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-2">
          <tabs_1.TabsTrigger value="timeline">Timeline</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="milestones">Marcos</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="timeline" className="space-y-4">
          {loading
            ? <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            : events.length === 0
              ? <card_1.Card>
                  <card_1.CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <lucide_react_1.Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhum evento encontrado
                      </h3>
                      <p className="text-gray-500">
                        Não há eventos no histórico médico deste paciente.
                      </p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              : <div className="space-y-0">
                  {events.map((event, index) => renderTimelineEvent(event, index))}
                </div>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="milestones">
          {milestones.length === 0
            ? <card_1.Card>
                <card_1.CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <lucide_react_1.CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum marco encontrado
                    </h3>
                    <p className="text-gray-500">
                      Não há marcos de tratamento definidos para este paciente.
                    </p>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            : renderMilestones()}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
exports.default = MedicalTimeline;
