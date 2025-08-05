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
exports.PortalDashboard = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var PortalDashboard = /** @class */ (() => {
  function PortalDashboard(
    supabaseUrl,
    supabaseKey,
    auditLogger,
    lgpdManager,
    sessionManager,
    config,
  ) {
    this.cache = new Map();
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.lgpdManager = lgpdManager;
    this.sessionManager = sessionManager;
    this.config = __assign(
      {
        refreshInterval: 30,
        maxRecentItems: 5,
        enableRealTimeUpdates: true,
        cacheTimeout: 5,
        defaultLanguage: "pt-BR",
        defaultTheme: "light",
      },
      config,
    );
  }
  /**
   * Get complete dashboard data for a patient
   */
  PortalDashboard.prototype.getDashboardData = function (patientId, sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionValidation,
        cacheKey,
        cached,
        _a,
        patient,
        appointments,
        progress,
        uploads,
        tasks,
        notifications,
        stats,
        preferences,
        dashboardData,
        error_1;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 6]);
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 1:
            sessionValidation = _c.sent();
            if (
              !sessionValidation.isValid ||
              ((_b = sessionValidation.session) === null || _b === void 0
                ? void 0
                : _b.patientId) !== patientId
            ) {
              throw new Error("Invalid session or unauthorized access");
            }
            cacheKey = "dashboard_".concat(patientId);
            cached = this.getCachedData(cacheKey);
            if (cached) {
              return [2 /*return*/, cached];
            }
            return [
              4 /*yield*/,
              Promise.all([
                this.getPatientInfo(patientId),
                this.getAppointments(patientId),
                this.getTreatmentProgress(patientId),
                this.getRecentUploads(patientId),
                this.getPendingTasks(patientId),
                this.getNotifications(patientId),
                this.getDashboardStats(patientId),
                this.getPatientPreferences(patientId),
              ]),
            ];
          case 2:
            (_a = _c.sent()),
              (patient = _a[0]),
              (appointments = _a[1]),
              (progress = _a[2]),
              (uploads = _a[3]),
              (tasks = _a[4]),
              (notifications = _a[5]),
              (stats = _a[6]),
              (preferences = _a[7]);
            dashboardData = {
              patient: patient,
              upcomingAppointments: appointments.upcoming,
              recentAppointments: appointments.recent,
              treatmentProgress: progress,
              recentUploads: uploads,
              pendingTasks: tasks,
              notifications: notifications,
              quickStats: stats,
              preferences: preferences,
            };
            // Cache the data
            this.setCachedData(cacheKey, dashboardData);
            // Log dashboard access
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "dashboard_accessed",
                userId: patientId,
                userType: "patient",
                details: {
                  timestamp: new Date(),
                  dataTypes: ["appointments", "progress", "uploads", "tasks", "notifications"],
                },
              }),
            ];
          case 3:
            // Log dashboard access
            _c.sent();
            return [2 /*return*/, dashboardData];
          case 4:
            error_1 = _c.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "dashboard_access_failed",
                userId: patientId,
                userType: "patient",
                details: { error: error_1.message },
              }),
            ];
          case 5:
            _c.sent();
            throw error_1;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get patient basic information
   */
  PortalDashboard.prototype.getPatientInfo = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select(
                  "\n        id, name, email, phone, birth_date, gender,\n        profile_photo_url, membership_start_date,\n        emergency_contact_name, emergency_contact_phone\n      ",
                )
                .eq("id", patientId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Get patient appointments (upcoming and recent)
   */
  PortalDashboard.prototype.getAppointments = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        thirtyDaysAgo,
        _a,
        upcomingData,
        upcomingError,
        _b,
        recentData,
        recentError,
        upcoming,
        recent;
      var _this = this;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            now = new Date();
            thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n        id, appointment_date, appointment_time, status,\n        estimated_duration, location,\n        services(name, category),\n        staff(name, specialization)\n      ",
                )
                .eq("patient_id", patientId)
                .gte("appointment_date", now.toISOString().split("T")[0])
                .order("appointment_date", { ascending: true })
                .limit(this.config.maxRecentItems),
            ];
          case 1:
            (_a = _c.sent()), (upcomingData = _a.data), (upcomingError = _a.error);
            if (upcomingError) throw upcomingError;
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n        id, appointment_date, appointment_time, status,\n        estimated_duration, location,\n        services(name, category),\n        staff(name, specialization)\n      ",
                )
                .eq("patient_id", patientId)
                .lt("appointment_date", now.toISOString().split("T")[0])
                .gte("appointment_date", thirtyDaysAgo.toISOString().split("T")[0])
                .order("appointment_date", { ascending: false })
                .limit(this.config.maxRecentItems),
            ];
          case 2:
            (_b = _c.sent()), (recentData = _b.data), (recentError = _b.error);
            if (recentError) throw recentError;
            upcoming =
              (upcomingData === null || upcomingData === void 0
                ? void 0
                : upcomingData.map((apt) => _this.transformAppointment(apt))) || [];
            recent =
              (recentData === null || recentData === void 0
                ? void 0
                : recentData.map((apt) => _this.transformAppointment(apt))) || [];
            return [2 /*return*/, { upcoming: upcoming, recent: recent }];
        }
      });
    });
  };
  /**
   * Transform appointment data to AppointmentSummary
   */
  PortalDashboard.prototype.transformAppointment = (apt) => {
    var _a, _b;
    var appointmentDate = new Date(
      "".concat(apt.appointment_date, "T").concat(apt.appointment_time),
    );
    var now = new Date();
    var hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return {
      id: apt.id,
      date: new Date(apt.appointment_date),
      time: apt.appointment_time,
      serviceType: ((_a = apt.services) === null || _a === void 0 ? void 0 : _a.name) || "Consulta",
      staffName: ((_b = apt.staff) === null || _b === void 0 ? void 0 : _b.name) || "Profissional",
      status: apt.status,
      location: apt.location || "Clínica",
      canReschedule: hoursUntilAppointment > 24 && apt.status === "scheduled",
      canCancel: hoursUntilAppointment > 24 && apt.status === "scheduled",
      estimatedDuration: apt.estimated_duration || 60,
    };
  };
  /**
   * Get treatment progress for patient
   */
  PortalDashboard.prototype.getTreatmentProgress = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("treatment_progress")
                .select(
                  "\n        id, treatment_name, progress_percentage,\n        current_session, total_sessions, next_session_date,\n        last_update, status\n      ",
                )
                .eq("patient_id", patientId)
                .eq("status", "active")
                .order("last_update", { ascending: false })
                .limit(this.config.maxRecentItems),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((progress) => ({
                    id: progress.id,
                    treatmentName: progress.treatment_name,
                    progressPercentage: progress.progress_percentage,
                    currentSession: progress.current_session,
                    totalSessions: progress.total_sessions,
                    nextSessionDate: progress.next_session_date
                      ? new Date(progress.next_session_date)
                      : undefined,
                    lastUpdate: new Date(progress.last_update),
                    status: progress.status,
                  }))) || [],
            ];
        }
      });
    });
  };
  /**
   * Get recent uploads for patient
   */
  PortalDashboard.prototype.getRecentUploads = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_uploads")
                .select(
                  "\n        id, filename, category, upload_date,\n        is_processed, is_verified, file_size\n      ",
                )
                .eq("patient_id", patientId)
                .order("upload_date", { ascending: false })
                .limit(this.config.maxRecentItems),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((upload) => ({
                    id: upload.id,
                    filename: upload.filename,
                    category: upload.category,
                    uploadDate: new Date(upload.upload_date),
                    isProcessed: upload.is_processed,
                    isVerified: upload.is_verified,
                    fileSize: upload.file_size,
                  }))) || [],
            ];
        }
      });
    });
  };
  /**
   * Get pending tasks for patient
   */
  PortalDashboard.prototype.getPendingTasks = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var tasks, evaluations;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tasks = [];
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_evaluations")
                .select("id, evaluation_type, due_date")
                .eq("patient_id", patientId)
                .eq("completed", false),
            ];
          case 1:
            evaluations = _a.sent().data;
            evaluations === null || evaluations === void 0 ? void 0 : evaluations.forEach((eval) => {
                            tasks.push({
                                id: "eval_".concat(eval.id),
                                title: "Avalia\u00E7\u00E3o: ".concat(eval.evaluation_type),
                                description: 'Complete sua avaliação pendente',
                                dueDate: eval.due_date ? new Date(eval.due_date) : undefined, priority: 'medium',
                                type: 'evaluation',
                                completed: false
                            });
                        });
            return [2 /*return*/, tasks];
        }
      });
    });
  };
  /**
   * Get notifications for patient
   */
  PortalDashboard.prototype.getNotifications = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("notifications")
                .select(
                  "\n        id, title, message, type, is_read,\n        created_at, action_url, action_text\n      ",
                )
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false })
                .limit(10),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (data === null || data === void 0
                ? void 0
                : data.map((notification) => ({
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                    type: notification.type,
                    isRead: notification.is_read,
                    createdAt: new Date(notification.created_at),
                    actionUrl: notification.action_url,
                    actionText: notification.action_text,
                  }))) || [],
            ];
        }
      });
    });
  };
  /**
   * Get dashboard statistics for patient
   */
  PortalDashboard.prototype.getDashboardStats = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var totalAppointments,
        completedTreatments,
        uploadedDocuments,
        pendingTasks,
        ratings,
        averageRating,
        patient,
        membershipDays;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("*", { count: "exact", head: true })
                .eq("patient_id", patientId),
            ];
          case 1:
            totalAppointments = _a.sent().count;
            return [
              4 /*yield*/,
              this.supabase
                .from("treatment_progress")
                .select("*", { count: "exact", head: true })
                .eq("patient_id", patientId)
                .eq("status", "completed"),
            ];
          case 2:
            completedTreatments = _a.sent().count;
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_uploads")
                .select("*", { count: "exact", head: true })
                .eq("patient_id", patientId),
            ];
          case 3:
            uploadedDocuments = _a.sent().count;
            return [4 /*yield*/, this.getPendingTasks(patientId)];
          case 4:
            pendingTasks = _a.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_evaluations")
                .select("rating")
                .eq("patient_id", patientId)
                .not("rating", "is", null),
            ];
          case 5:
            ratings = _a.sent().data;
            averageRating =
              (ratings === null || ratings === void 0 ? void 0 : ratings.length) > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("membership_start_date")
                .eq("id", patientId)
                .single(),
            ];
          case 6:
            patient = _a.sent().data;
            membershipDays = (
              patient === null || patient === void 0
                ? void 0
                : patient.membership_start_date
            )
              ? Math.floor(
                  (Date.now() - new Date(patient.membership_start_date).getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : 0;
            return [
              2 /*return*/,
              {
                totalAppointments: totalAppointments || 0,
                completedTreatments: completedTreatments || 0,
                uploadedDocuments: uploadedDocuments || 0,
                pendingTasks: pendingTasks.length,
                averageRating: averageRating,
                membershipDays: membershipDays,
              },
            ];
        }
      });
    });
  };
  /**
   * Get patient preferences
   */
  PortalDashboard.prototype.getPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_preferences")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") throw error;
            // Return default preferences if none found
            if (!data) {
              return [
                2 /*return*/,
                {
                  language: this.config.defaultLanguage,
                  timezone: "America/Sao_Paulo",
                  theme: this.config.defaultTheme,
                  notifications: {
                    email: true,
                    sms: true,
                    push: true,
                    appointmentReminders: true,
                    treatmentUpdates: true,
                    promotional: false,
                  },
                  accessibility: {
                    highContrast: false,
                    largeText: false,
                    screenReader: false,
                    reducedMotion: false,
                  },
                  privacy: {
                    shareProgressPhotos: false,
                    allowTestimonials: false,
                    marketingConsent: false,
                    dataSharing: false,
                  },
                },
              ];
            }
            return [2 /*return*/, data.preferences];
        }
      });
    });
  };
  /**
   * Get cached data if still valid
   */
  PortalDashboard.prototype.getCachedData = function (key) {
    var cached = this.cache.get(key);
    if (!cached) return null;
    var now = new Date();
    var cacheAge = (now.getTime() - cached.timestamp.getTime()) / (1000 * 60); // minutes
    if (cacheAge > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  };
  /**
   * Set data in cache
   */
  PortalDashboard.prototype.setCachedData = function (key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: new Date(),
    });
  };
  /**
   * Clear cache for specific patient or all cache
   */
  PortalDashboard.prototype.clearCache = function (patientId) {
    if (patientId) {
      var keysToDelete = Array.from(this.cache.keys()).filter((key) => key.includes(patientId));
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  };
  return PortalDashboard;
})();
exports.PortalDashboard = PortalDashboard;
