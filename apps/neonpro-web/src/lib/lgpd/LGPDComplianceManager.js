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
exports.LGPDComplianceManager = void 0;
var LGPDComplianceManager = /** @class */ (() => {
  function LGPDComplianceManager(supabase) {
    this.supabase = supabase;
  }
  // Dashboard Metrics
  LGPDComplianceManager.prototype.getDashboardMetrics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("get_lgpd_dashboard_metrics")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              data || {
                compliance_percentage: 0,
                active_consents: 0,
                pending_requests: 0,
                active_breaches: 0,
                total_users: 0,
                consent_rate: 0,
                avg_response_time: 0,
                last_assessment: null,
              },
            ];
          case 2:
            error_1 = _b.sent();
            console.error("Error fetching dashboard metrics:", error_1);
            throw new Error("Failed to fetch dashboard metrics");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Consent Management
  LGPDComplianceManager.prototype.getConsents = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, page, limit, offset, _a, data, error, count, error_2;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("lgpd_user_consents")
              .select(
                "\n          *,\n          lgpd_consent_purposes!inner(\n            id,\n            name,\n            description,\n            category,\n            required\n          )\n        ",
              );
            if (filters.user_id) {
              query = query.eq("user_id", filters.user_id);
            }
            if (filters.purpose_id) {
              query = query.eq("purpose_id", filters.purpose_id);
            }
            if (filters.granted !== undefined) {
              query = query.eq("granted", filters.granted);
            }
            page = filters.page || 1;
            limit = filters.limit || 50;
            offset = (page - 1) * limit;
            query = query
              .order("created_at", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                consents: data || [],
                total: count || 0,
                page: page,
                limit: limit,
              },
            ];
          case 2:
            error_2 = _b.sent();
            console.error("Error fetching consents:", error_2);
            throw new Error("Failed to fetch consents");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.createOrUpdateConsent = function (consentData) {
    return __awaiter(this, void 0, void 0, function () {
      var existingConsent, result, _a, data, error, _b, data, error, error_3;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .select("id")
                .eq("user_id", consentData.user_id)
                .eq("purpose_id", consentData.purpose_id)
                .single(),
            ];
          case 1:
            existingConsent = _c.sent().data;
            result = void 0;
            if (!existingConsent) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .update({
                  granted: consentData.granted,
                  granted_at: consentData.granted ? new Date().toISOString() : null,
                  withdrawn_at: !consentData.granted ? new Date().toISOString() : null,
                  expires_at: consentData.expires_at,
                  ip_address: consentData.ip_address,
                  user_agent: consentData.user_agent,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existingConsent.id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            result = data;
            return [3 /*break*/, 5];
          case 3:
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .insert({
                  user_id: consentData.user_id,
                  purpose_id: consentData.purpose_id,
                  granted: consentData.granted,
                  granted_at: consentData.granted ? new Date().toISOString() : null,
                  withdrawn_at: !consentData.granted ? new Date().toISOString() : null,
                  expires_at: consentData.expires_at,
                  ip_address: consentData.ip_address,
                  user_agent: consentData.user_agent,
                })
                .select()
                .single(),
            ];
          case 4:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            result = data;
            _c.label = 5;
          case 5:
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "consent_management",
                user_id: consentData.user_id,
                resource_type: "consent",
                resource_id: result.id,
                action: consentData.granted ? "consent_granted" : "consent_withdrawn",
                details: {
                  purpose_id: consentData.purpose_id,
                  granted: consentData.granted,
                },
                ip_address: consentData.ip_address,
                user_agent: consentData.user_agent,
              }),
            ];
          case 6:
            // Log audit event
            _c.sent();
            return [2 /*return*/, result];
          case 7:
            error_3 = _c.sent();
            console.error("Error creating/updating consent:", error_3);
            throw new Error("Failed to create or update consent");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.withdrawConsent = function (consentId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_user_consents")
                .update({
                  granted: false,
                  withdrawn_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", consentId)
                .eq("user_id", userId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "consent_management",
                user_id: userId,
                resource_type: "consent",
                resource_id: consentId,
                action: "consent_withdrawn",
                details: {
                  purpose_id: data.purpose_id,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_4 = _b.sent();
            console.error("Error withdrawing consent:", error_4);
            throw new Error("Failed to withdraw consent");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Data Subject Rights
  LGPDComplianceManager.prototype.getDataSubjectRequests = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, page, limit, offset, _a, data, error, count, error_5;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_data_subject_requests").select("*");
            if (filters.user_id) {
              query = query.eq("user_id", filters.user_id);
            }
            if (filters.request_type) {
              query = query.eq("request_type", filters.request_type);
            }
            if (filters.status) {
              query = query.eq("status", filters.status);
            }
            page = filters.page || 1;
            limit = filters.limit || 50;
            offset = (page - 1) * limit;
            query = query
              .order("requested_at", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                requests: data || [],
                total: count || 0,
                page: page,
                limit: limit,
              },
            ];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching data subject requests:", error_5);
            throw new Error("Failed to fetch data subject requests");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.createDataSubjectRequest = function (requestData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .insert({
                  user_id: requestData.user_id,
                  request_type: requestData.request_type,
                  description: requestData.description,
                  status: "pending",
                  requested_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "data_subject_rights",
                user_id: requestData.user_id,
                resource_type: "data_subject_request",
                resource_id: data.id,
                action: "request_created",
                details: {
                  request_type: requestData.request_type,
                  description: requestData.description,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_6 = _b.sent();
            console.error("Error creating data subject request:", error_6);
            throw new Error("Failed to create data subject request");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.updateDataSubjectRequest = function (requestId, updateData) {
    return __awaiter(this, void 0, void 0, function () {
      var updateFields, _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            updateFields = __assign(__assign({}, updateData), {
              updated_at: new Date().toISOString(),
            });
            if (updateData.status === "completed" || updateData.status === "rejected") {
              updateFields.processed_at = new Date().toISOString();
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_subject_requests")
                .update(updateFields)
                .eq("id", requestId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "data_subject_rights",
                user_id: data.user_id,
                resource_type: "data_subject_request",
                resource_id: requestId,
                action: "request_updated",
                details: {
                  status: updateData.status,
                  processed_by: updateData.processed_by,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_7 = _b.sent();
            console.error("Error updating data subject request:", error_7);
            throw new Error("Failed to update data subject request");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Breach Management
  LGPDComplianceManager.prototype.getBreachIncidents = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, page, limit, offset, _a, data, error, count, error_8;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_breach_incidents").select("*");
            if (filters.severity) {
              query = query.eq("severity", filters.severity);
            }
            if (filters.status) {
              query = query.eq("status", filters.status);
            }
            page = filters.page || 1;
            limit = filters.limit || 50;
            offset = (page - 1) * limit;
            query = query
              .order("discovered_at", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                breaches: data || [],
                total: count || 0,
                page: page,
                limit: limit,
              },
            ];
          case 2:
            error_8 = _b.sent();
            console.error("Error fetching breach incidents:", error_8);
            throw new Error("Failed to fetch breach incidents");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.reportBreachIncident = function (breachData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_breach_incidents")
                .insert({
                  title: breachData.title,
                  description: breachData.description,
                  severity: breachData.severity,
                  status: "reported",
                  affected_users: breachData.affected_users,
                  data_types: breachData.data_types,
                  discovered_at: breachData.discovered_at,
                  reported_at: new Date().toISOString(),
                  reported_by: breachData.reported_by,
                  authority_notified: false,
                  users_notified: false,
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "breach_management",
                user_id: breachData.reported_by,
                resource_type: "breach_incident",
                resource_id: data.id,
                action: "breach_reported",
                details: {
                  title: breachData.title,
                  severity: breachData.severity,
                  affected_users: breachData.affected_users,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_9 = _b.sent();
            console.error("Error reporting breach incident:", error_9);
            throw new Error("Failed to report breach incident");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.updateBreachIncident = function (breachId, updateData) {
    return __awaiter(this, void 0, void 0, function () {
      var updateFields, _a, data, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            updateFields = __assign(__assign({}, updateData), {
              updated_at: new Date().toISOString(),
            });
            if (updateData.status === "resolved") {
              updateFields.resolved_at = new Date().toISOString();
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_breach_incidents")
                .update(updateFields)
                .eq("id", breachId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "breach_management",
                resource_type: "breach_incident",
                resource_id: breachId,
                action: "breach_updated",
                details: {
                  status: updateData.status,
                  assigned_to: updateData.assigned_to,
                  authority_notified: updateData.authority_notified,
                  users_notified: updateData.users_notified,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_10 = _b.sent();
            console.error("Error updating breach incident:", error_10);
            throw new Error("Failed to update breach incident");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Audit Trail
  LGPDComplianceManager.prototype.getAuditEvents = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, page, limit, offset, _a, data, error, count, error_11;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_audit_trail").select("*");
            if (filters.event_type) {
              query = query.eq("event_type", filters.event_type);
            }
            if (filters.user_id) {
              query = query.eq("user_id", filters.user_id);
            }
            if (filters.resource_type) {
              query = query.eq("resource_type", filters.resource_type);
            }
            if (filters.action) {
              query = query.eq("action", filters.action);
            }
            if (filters.start_date) {
              query = query.gte("timestamp", filters.start_date);
            }
            if (filters.end_date) {
              query = query.lte("timestamp", filters.end_date);
            }
            page = filters.page || 1;
            limit = filters.limit || 100;
            offset = (page - 1) * limit;
            query = query
              .order("timestamp", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                events: data || [],
                total: count || 0,
                page: page,
                limit: limit,
              },
            ];
          case 2:
            error_11 = _b.sent();
            console.error("Error fetching audit events:", error_11);
            throw new Error("Failed to fetch audit events");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.logAuditEvent = function (eventData) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_audit_trail").insert({
                event_type: eventData.event_type,
                user_id: eventData.user_id,
                resource_type: eventData.resource_type,
                resource_id: eventData.resource_id,
                action: eventData.action,
                details: eventData.details,
                ip_address: eventData.ip_address,
                user_agent: eventData.user_agent,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 3];
          case 2:
            error_12 = _a.sent();
            console.error("Error logging audit event:", error_12);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Compliance Assessment
  LGPDComplianceManager.prototype.getComplianceAssessments = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, page, limit, offset, _a, data, error, count, error_13;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_compliance_assessments").select("*");
            if (filters.assessment_type) {
              query = query.eq("assessment_type", filters.assessment_type);
            }
            if (filters.status) {
              query = query.eq("status", filters.status);
            }
            page = filters.page || 1;
            limit = filters.limit || 50;
            offset = (page - 1) * limit;
            query = query
              .order("started_at", { ascending: false })
              .range(offset, offset + limit - 1);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                assessments: data || [],
                total: count || 0,
                page: page,
                limit: limit,
              },
            ];
          case 2:
            error_13 = _b.sent();
            console.error("Error fetching compliance assessments:", error_13);
            throw new Error("Failed to fetch compliance assessments");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.createComplianceAssessment = function (assessmentData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_compliance_assessments")
                .insert({
                  assessment_type: assessmentData.assessment_type,
                  status: "pending",
                  max_score: 100,
                  conducted_by: assessmentData.conducted_by,
                  started_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "compliance_assessment",
                user_id: assessmentData.conducted_by,
                resource_type: "compliance_assessment",
                resource_id: data.id,
                action: "assessment_created",
                details: {
                  assessment_type: assessmentData.assessment_type,
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_14 = _b.sent();
            console.error("Error creating compliance assessment:", error_14);
            throw new Error("Failed to create compliance assessment");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.runAutomatedAssessment = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.supabase.rpc("run_compliance_assessment")];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Log audit event
            return [
              4 /*yield*/,
              this.logAuditEvent({
                event_type: "compliance_assessment",
                resource_type: "compliance_assessment",
                action: "automated_assessment_executed",
                details: {
                  assessment_type: "automated",
                },
              }),
            ];
          case 2:
            // Log audit event
            _b.sent();
            return [2 /*return*/, data];
          case 3:
            error_15 = _b.sent();
            console.error("Error running automated assessment:", error_15);
            throw new Error("Failed to run automated assessment");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Utility Methods
  LGPDComplianceManager.prototype.getAuditStatistics = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, _a, data, error, stats_1, error_16;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("lgpd_audit_trail").select("event_type, action");
            if (filters.start_date) {
              query = query.gte("timestamp", filters.start_date);
            }
            if (filters.end_date) {
              query = query.lte("timestamp", filters.end_date);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            stats_1 = {
              total_events: (data === null || data === void 0 ? void 0 : data.length) || 0,
              by_event_type: {},
              by_action: {},
            };
            data === null || data === void 0
              ? void 0
              : data.forEach((event) => {
                  stats_1.by_event_type[event.event_type] =
                    (stats_1.by_event_type[event.event_type] || 0) + 1;
                  stats_1.by_action[event.action] = (stats_1.by_action[event.action] || 0) + 1;
                });
            return [2 /*return*/, stats_1];
          case 2:
            error_16 = _b.sent();
            console.error("Error fetching audit statistics:", error_16);
            throw new Error("Failed to fetch audit statistics");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  LGPDComplianceManager.prototype.getBreachStatistics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, stats_2, error_17;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("lgpd_breach_incidents").select("severity, status"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            stats_2 = {
              total_breaches: (data === null || data === void 0 ? void 0 : data.length) || 0,
              by_severity: {},
              by_status: {},
            };
            data === null || data === void 0
              ? void 0
              : data.forEach((breach) => {
                  stats_2.by_severity[breach.severity] =
                    (stats_2.by_severity[breach.severity] || 0) + 1;
                  stats_2.by_status[breach.status] = (stats_2.by_status[breach.status] || 0) + 1;
                });
            return [2 /*return*/, stats_2];
          case 2:
            error_17 = _b.sent();
            console.error("Error fetching breach statistics:", error_17);
            throw new Error("Failed to fetch breach statistics");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return LGPDComplianceManager;
})();
exports.LGPDComplianceManager = LGPDComplianceManager;
