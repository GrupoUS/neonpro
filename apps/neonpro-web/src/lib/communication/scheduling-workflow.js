/**
 * Automated Communication Workflow for Scheduling
 * Story 5.3: Automated Communication for Scheduling
 */
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
exports.createschedulingCommunicationWorkflow = exports.SchedulingCommunicationWorkflow = void 0;
var server_1 = require("@/lib/supabase/server");
var communication_service_1 = require("./communication-service");
var no_show_predictor_1 = require("./no-show-predictor");
var scheduling_templates_1 = require("./scheduling-templates");
var SchedulingCommunicationWorkflow = /** @class */ (() => {
  function SchedulingCommunicationWorkflow() {
    this.supabase = (0, server_1.createClient)();
    this.communicationService = new communication_service_1.CommunicationService();
    this.noShowPredictor = new no_show_predictor_1.NoShowPredictor();
  }
  /**
   * Initialize automated workflows for an appointment
   */
  SchedulingCommunicationWorkflow.prototype.initializeWorkflows = function (appointmentId, config) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        appointment,
        appointmentError,
        workflowConfig,
        workflows,
        appointmentDate,
        now,
        reminderTime24h,
        _b,
        _c,
        reminderTime2h,
        _d,
        _e,
        reminderTime30m,
        _f,
        _g,
        confirmationTime,
        _h,
        _j,
        prediction,
        interventionTime,
        _k,
        _l,
        _i,
        workflows_1,
        workflow,
        error_1;
      return __generator(this, function (_m) {
        switch (_m.label) {
          case 0:
            _m.trys.push([0, 18, , 19]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          *,\n          patients(*),\n          professionals(*),\n          services(*),\n          clinics(*)\n        ",
                )
                .eq("id", appointmentId)
                .single(),
            ];
          case 1:
            (_a = _m.sent()), (appointment = _a.data), (appointmentError = _a.error);
            if (appointmentError || !appointment) {
              throw new Error("Appointment not found");
            }
            return [4 /*yield*/, this.getWorkflowConfig(appointment.clinic_id, config)];
          case 2:
            workflowConfig = _m.sent();
            if (!workflowConfig.enabled) {
              return [2 /*return*/, []];
            }
            workflows = [];
            appointmentDate = new Date(appointment.date);
            now = new Date();
            if (!workflowConfig.reminderSettings.enabled24h) return [3 /*break*/, 4];
            reminderTime24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
            if (!(reminderTime24h > now)) return [3 /*break*/, 4];
            _c = (_b = workflows).push;
            return [
              4 /*yield*/,
              this.createReminderWorkflow(appointment, "24h", reminderTime24h, workflowConfig),
            ];
          case 3:
            _c.apply(_b, [_m.sent()]);
            _m.label = 4;
          case 4:
            if (!workflowConfig.reminderSettings.enabled2h) return [3 /*break*/, 6];
            reminderTime2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
            if (!(reminderTime2h > now)) return [3 /*break*/, 6];
            _e = (_d = workflows).push;
            return [
              4 /*yield*/,
              this.createReminderWorkflow(appointment, "2h", reminderTime2h, workflowConfig),
            ];
          case 5:
            _e.apply(_d, [_m.sent()]);
            _m.label = 6;
          case 6:
            if (!workflowConfig.reminderSettings.enabled30m) return [3 /*break*/, 8];
            reminderTime30m = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
            if (!(reminderTime30m > now)) return [3 /*break*/, 8];
            _g = (_f = workflows).push;
            return [
              4 /*yield*/,
              this.createReminderWorkflow(appointment, "30m", reminderTime30m, workflowConfig),
            ];
          case 7:
            _g.apply(_f, [_m.sent()]);
            _m.label = 8;
          case 8:
            if (!workflowConfig.confirmationSettings.enableConfirmationRequests)
              return [3 /*break*/, 10];
            confirmationTime = this.calculateConfirmationTime(
              appointmentDate,
              workflowConfig.confirmationSettings.sendTime,
            );
            if (!(confirmationTime > now)) return [3 /*break*/, 10];
            _j = (_h = workflows).push;
            return [
              4 /*yield*/,
              this.createConfirmationWorkflow(appointment, confirmationTime, workflowConfig),
            ];
          case 9:
            _j.apply(_h, [_m.sent()]);
            _m.label = 10;
          case 10:
            if (!workflowConfig.noShowPrevention.enabled) return [3 /*break*/, 13];
            return [4 /*yield*/, this.noShowPredictor.predict(appointmentId)];
          case 11:
            prediction = _m.sent();
            if (!(prediction.probability >= workflowConfig.noShowPrevention.probabilityThreshold))
              return [3 /*break*/, 13];
            interventionTime = this.calculateInterventionTime(
              appointmentDate,
              workflowConfig.noShowPrevention.interventionTiming,
            );
            if (!(interventionTime > now)) return [3 /*break*/, 13];
            _l = (_k = workflows).push;
            return [
              4 /*yield*/,
              this.createNoShowPreventionWorkflow(
                appointment,
                prediction,
                interventionTime,
                workflowConfig,
              ),
            ];
          case 12:
            _l.apply(_k, [_m.sent()]);
            _m.label = 13;
          case 13:
            (_i = 0), (workflows_1 = workflows);
            _m.label = 14;
          case 14:
            if (!(_i < workflows_1.length)) return [3 /*break*/, 17];
            workflow = workflows_1[_i];
            return [4 /*yield*/, this.saveWorkflow(workflow)];
          case 15:
            _m.sent();
            _m.label = 16;
          case 16:
            _i++;
            return [3 /*break*/, 14];
          case 17:
            return [2 /*return*/, workflows];
          case 18:
            error_1 = _m.sent();
            console.error("Error initializing workflows:", error_1);
            throw error_1;
          case 19:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create reminder workflows based on configuration
   * This method is used for testing and direct workflow creation
   */
  SchedulingCommunicationWorkflow.prototype.createReminderWorkflows = (
    appointmentId,
    config,
    appointment,
  ) => {
    var _a, _b;
    var workflows = [];
    if ((_a = config.reminderSettings) === null || _a === void 0 ? void 0 : _a.enabled24h) {
      workflows.push({
        id: "reminder-24h-".concat(appointmentId),
        appointmentId: appointmentId,
        type: "24h_reminder",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "scheduled",
        steps: [],
      });
    }
    if ((_b = config.reminderSettings) === null || _b === void 0 ? void 0 : _b.enabled2h) {
      workflows.push({
        id: "reminder-2h-".concat(appointmentId),
        appointmentId: appointmentId,
        type: "2h_reminder",
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: "scheduled",
        steps: [],
      });
    }
    return workflows;
  };
  /**
   * Execute a scheduled workflow
   */
  SchedulingCommunicationWorkflow.prototype.executeWorkflow = function (workflowId) {
    return __awaiter(this, void 0, void 0, function () {
      var workflow, _i, _a, step, stepError_1, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 10, , 11]);
            return [4 /*yield*/, this.getWorkflow(workflowId)];
          case 1:
            workflow = _b.sent();
            if (!workflow || workflow.status !== "scheduled") {
              throw new Error("Workflow not found or not schedulable");
            }
            // Update workflow status
            workflow.status = "running";
            workflow.startedAt = new Date();
            return [
              4 /*yield*/,
              this.updateWorkflow(workflow),
              // Execute workflow steps
            ];
          case 2:
            _b.sent();
            (_i = 0), (_a = workflow.steps);
            _b.label = 3;
          case 3:
            if (!(_i < _a.length)) return [3 /*break*/, 8];
            step = _a[_i];
            _b.label = 4;
          case 4:
            _b.trys.push([4, 6, , 7]);
            return [4 /*yield*/, this.executeWorkflowStep(workflow, step)];
          case 5:
            _b.sent();
            return [3 /*break*/, 7];
          case 6:
            stepError_1 = _b.sent();
            console.error("Error executing step ".concat(step.id, ":"), stepError_1);
            step.status = "failed";
            step.error = stepError_1.message;
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            // Complete workflow
            workflow.status = "completed";
            workflow.completedAt = new Date();
            return [4 /*yield*/, this.updateWorkflow(workflow)];
          case 9:
            _b.sent();
            return [2 /*return*/, workflow.results];
          case 10:
            error_2 = _b.sent();
            console.error("Error executing workflow:", error_2);
            throw error_2;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute individual workflow step
   */
  SchedulingCommunicationWorkflow.prototype.executeWorkflowStep = function (workflow, step) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            step.status = "running";
            step.executedAt = new Date();
            _a = step.type;
            switch (_a) {
              case "send_message":
                return [3 /*break*/, 1];
              case "predict_no_show":
                return [3 /*break*/, 3];
              case "wait_response":
                return [3 /*break*/, 5];
              case "escalate":
                return [3 /*break*/, 7];
              case "complete":
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 10];
          case 1:
            return [4 /*yield*/, this.executeSendMessageStep(workflow, step)];
          case 2:
            _b.sent();
            return [3 /*break*/, 11];
          case 3:
            return [4 /*yield*/, this.executePredictNoShowStep(workflow, step)];
          case 4:
            _b.sent();
            return [3 /*break*/, 11];
          case 5:
            return [4 /*yield*/, this.executeWaitResponseStep(workflow, step)];
          case 6:
            _b.sent();
            return [3 /*break*/, 11];
          case 7:
            return [4 /*yield*/, this.executeEscalationStep(workflow, step)];
          case 8:
            _b.sent();
            return [3 /*break*/, 11];
          case 9:
            step.status = "completed";
            return [3 /*break*/, 11];
          case 10:
            throw new Error("Unknown step type: ".concat(step.type));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute send message step
   */
  SchedulingCommunicationWorkflow.prototype.executeSendMessageStep = function (workflow, step) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        templateType,
        channel,
        timing,
        appointment,
        templateConditionData,
        template,
        variables,
        renderedContent,
        result;
      var _b, _c, _d, _e, _f, _g, _h;
      return __generator(this, function (_j) {
        switch (_j.label) {
          case 0:
            (_a = step.input),
              (templateType = _a.templateType),
              (channel = _a.channel),
              (timing = _a.timing);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n        *,\n        patients(*),\n        professionals(*),\n        services(*),\n        clinics(*)\n      ",
                )
                .eq("id", workflow.appointmentId)
                .single(),
              // Select best template - flatten data for template conditions
            ];
          case 1:
            appointment = _j.sent().data;
            templateConditionData = __assign(__assign({}, appointment), {
              service_category:
                ((_b = appointment.services) === null || _b === void 0 ? void 0 : _b.category) ||
                "general",
              service_name:
                ((_c = appointment.services) === null || _c === void 0 ? void 0 : _c.name) ||
                "Consulta",
              professional_name:
                ((_d = appointment.professionals) === null || _d === void 0 ? void 0 : _d.name) ||
                "Profissional",
              patient_name:
                ((_e = appointment.patients) === null || _e === void 0 ? void 0 : _e.name) ||
                "Paciente",
              patient_age:
                ((_f = appointment.patients) === null || _f === void 0 ? void 0 : _f.age) || 0,
              clinic_name:
                ((_g = appointment.clinics) === null || _g === void 0 ? void 0 : _g.name) ||
                "Clínica",
            });
            template = scheduling_templates_1.schedulingTemplateEngine.selectBestTemplate(
              templateType,
              templateConditionData,
              appointment.patients || {},
              workflow.metadata.noShowPrediction || {},
            );
            if (!template) {
              throw new Error("No suitable template found");
            }
            variables = {
              patientName: appointment.patients.name,
              serviceName: appointment.services.name,
              professionalName: appointment.professionals.name,
              appointmentDate: new Date(appointment.date).toLocaleDateString("pt-BR"),
              appointmentTime: new Date(appointment.date).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              clinicName: appointment.clinics.name,
              clinicPhone: appointment.clinics.phone,
              confirmationUrl: ""
                .concat(process.env.NEXT_PUBLIC_APP_URL, "/patient/confirm/")
                .concat(workflow.metadata.confirmationToken),
              rescheduleUrl: ""
                .concat(process.env.NEXT_PUBLIC_APP_URL, "/patient/reschedule/")
                .concat(workflow.metadata.confirmationToken),
              no_show_probability:
                (_h = workflow.metadata.noShowPrediction) === null || _h === void 0
                  ? void 0
                  : _h.probability,
              service_category: appointment.services.category,
            };
            return [
              4 /*yield*/,
              scheduling_templates_1.schedulingTemplateEngine.renderTemplate(
                template,
                channel,
                variables,
              ),
              // Send message
            ];
          case 2:
            renderedContent = _j.sent();
            return [
              4 /*yield*/,
              this.communicationService.sendMessage({
                patientId: workflow.patientId,
                clinicId: workflow.clinicId,
                appointmentId: workflow.appointmentId,
                messageType: templateType,
                templateId: template.id,
                channel: channel,
                variables: variables,
                customContent: renderedContent,
              }),
              // Update step output
            ];
          case 3:
            result = _j.sent();
            // Update step output
            step.output = {
              messageId: result.messageId,
              templateUsed: template.id,
              channel: channel,
              cost: result.cost,
              delivered: result.success,
            };
            // Update workflow results
            workflow.results.messagesSent++;
            if (result.success) {
              workflow.results.messagesDelivered++;
            }
            workflow.results.cost += result.cost || 0;
            step.status = "completed";
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute no-show prediction step
   */
  SchedulingCommunicationWorkflow.prototype.executePredictNoShowStep = function (workflow, step) {
    return __awaiter(this, void 0, void 0, function () {
      var prediction;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.noShowPredictor.predict(workflow.appointmentId)];
          case 1:
            prediction = _a.sent();
            step.output = prediction;
            workflow.metadata.noShowPrediction = prediction;
            step.status = "completed";
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute wait response step
   */
  SchedulingCommunicationWorkflow.prototype.executeWaitResponseStep = function (workflow, step) {
    return __awaiter(this, void 0, void 0, function () {
      var response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointment_confirmations")
                .select("*")
                .eq("appointment_id", workflow.appointmentId)
                .neq("status", "pending")
                .order("response_date", { ascending: false })
                .limit(1)
                .single(),
            ];
          case 1:
            response = _a.sent().data;
            if (response) {
              workflow.results.responseReceived = true;
              workflow.results.responseType = response.status;
              if (response.status === "confirmed") {
                workflow.results.noShowPrevented = true;
              }
            }
            step.output = { responseReceived: !!response, response: response };
            step.status = "completed";
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute escalation step
   */
  SchedulingCommunicationWorkflow.prototype.executeEscalationStep = function (workflow, step) {
    return __awaiter(this, void 0, void 0, function () {
      var escalationChannel;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            escalationChannel = step.input.escalationChannel || "whatsapp";
            // Use no-show prevention template for escalation
            return [
              4 /*yield*/,
              this.executeSendMessageStep(
                workflow,
                __assign(__assign({}, step), {
                  input: {
                    templateType: "no_show_prevention",
                    channel: escalationChannel,
                    timing: "immediate",
                  },
                }),
              ),
            ];
          case 1:
            // Use no-show prevention template for escalation
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get workflow configuration for clinic
   */
  SchedulingCommunicationWorkflow.prototype.getWorkflowConfig = function (clinicId, override) {
    return __awaiter(this, void 0, void 0, function () {
      var savedConfig, defaultConfig;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("clinic_workflow_configs")
                .select("*")
                .eq("clinic_id", clinicId)
                .single(),
              // Default configuration
            ];
          case 1:
            savedConfig = _a.sent().data;
            defaultConfig = {
              clinicId: clinicId,
              enabled: true,
              reminderSettings: {
                enabled24h: true,
                enabled2h: true,
                enabled30m: false,
                channels: ["whatsapp", "sms"],
                preferredChannel: "whatsapp",
              },
              confirmationSettings: {
                enableConfirmationRequests: true,
                sendTime: "09:00",
                timeoutHours: 24,
                escalationChannels: ["whatsapp", "sms"],
              },
              noShowPrevention: {
                enabled: true,
                probabilityThreshold: 0.7,
                interventionTiming: "4h",
                specialHandling: true,
              },
              analytics: {
                enabled: true,
                reportingInterval: "weekly",
                kpiTargets: {
                  confirmationRate: 0.85,
                  noShowReduction: 0.3,
                  responseRate: 0.7,
                },
              },
            };
            return [
              2 /*return*/,
              __assign(
                __assign(
                  __assign({}, defaultConfig),
                  savedConfig === null || savedConfig === void 0 ? void 0 : savedConfig.config,
                ),
                override,
              ),
            ];
        }
      });
    });
  };
  /**
   * Create reminder workflow
   */
  SchedulingCommunicationWorkflow.prototype.createReminderWorkflow = function (
    appointment,
    timing,
    scheduledTime,
    config,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var workflowId;
      return __generator(this, (_a) => {
        workflowId = "reminder_".concat(timing, "_").concat(appointment.id, "_").concat(Date.now());
        return [
          2 /*return*/,
          {
            id: workflowId,
            appointmentId: appointment.id,
            patientId: appointment.patient_id,
            clinicId: appointment.clinic_id,
            workflowType: "reminder",
            status: "scheduled",
            scheduledAt: scheduledTime,
            steps: [
              {
                id: "".concat(workflowId, "_send"),
                type: "send_message",
                status: "pending",
                scheduledAt: scheduledTime,
                input: {
                  templateType: "reminder",
                  channel: config.reminderSettings.preferredChannel,
                  timing: timing,
                },
                output: null,
              },
              {
                id: "".concat(workflowId, "_wait"),
                type: "wait_response",
                status: "pending",
                scheduledAt: new Date(scheduledTime.getTime() + 2 * 60 * 60 * 1000), // 2h later
                input: { timeoutHours: 2 },
                output: null,
              },
            ],
            results: {
              messagesSent: 0,
              messagesDelivered: 0,
              responseReceived: false,
              noShowPrevented: false,
              waitlistFilled: false,
              cost: 0,
              effectiveness: 0,
            },
            metadata: {
              timing: timing,
              templateType: "reminder",
            },
          },
        ];
      });
    });
  };
  /**
   * Create confirmation workflow
   */
  SchedulingCommunicationWorkflow.prototype.createConfirmationWorkflow = function (
    appointment,
    scheduledTime,
    config,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var workflowId, confirmationToken;
      return __generator(this, function (_a) {
        workflowId = "confirmation_".concat(appointment.id, "_").concat(Date.now());
        confirmationToken = this.generateConfirmationToken();
        return [
          2 /*return*/,
          {
            id: workflowId,
            appointmentId: appointment.id,
            patientId: appointment.patient_id,
            clinicId: appointment.clinic_id,
            workflowType: "confirmation",
            status: "scheduled",
            scheduledAt: scheduledTime,
            steps: [
              {
                id: "".concat(workflowId, "_predict"),
                type: "predict_no_show",
                status: "pending",
                scheduledAt: scheduledTime,
                input: {},
                output: null,
              },
              {
                id: "".concat(workflowId, "_send"),
                type: "send_message",
                status: "pending",
                scheduledAt: scheduledTime,
                input: {
                  templateType: "confirmation",
                  channel: config.reminderSettings.preferredChannel,
                  timing: "immediate",
                },
                output: null,
              },
              {
                id: "".concat(workflowId, "_wait"),
                type: "wait_response",
                status: "pending",
                scheduledAt: new Date(
                  scheduledTime.getTime() +
                    config.confirmationSettings.timeoutHours * 60 * 60 * 1000,
                ),
                input: { timeoutHours: config.confirmationSettings.timeoutHours },
                output: null,
              },
            ],
            results: {
              messagesSent: 0,
              messagesDelivered: 0,
              responseReceived: false,
              noShowPrevented: false,
              waitlistFilled: false,
              cost: 0,
              effectiveness: 0,
            },
            metadata: {
              confirmationToken: confirmationToken,
              templateType: "confirmation",
            },
          },
        ];
      });
    });
  };
  /**
   * Create no-show prevention workflow
   */
  SchedulingCommunicationWorkflow.prototype.createNoShowPreventionWorkflow = function (
    appointment,
    prediction,
    scheduledTime,
    config,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var workflowId;
      return __generator(this, (_a) => {
        workflowId = "no_show_prevention_".concat(appointment.id, "_").concat(Date.now());
        return [
          2 /*return*/,
          {
            id: workflowId,
            appointmentId: appointment.id,
            patientId: appointment.patient_id,
            clinicId: appointment.clinic_id,
            workflowType: "no_show_prevention",
            status: "scheduled",
            scheduledAt: scheduledTime,
            steps: [
              {
                id: "".concat(workflowId, "_send"),
                type: "send_message",
                status: "pending",
                scheduledAt: scheduledTime,
                input: {
                  templateType: "no_show_prevention",
                  channel: "whatsapp",
                  timing: "immediate",
                },
                output: null,
              },
              {
                id: "".concat(workflowId, "_wait"),
                type: "wait_response",
                status: "pending",
                scheduledAt: new Date(scheduledTime.getTime() + 30 * 60 * 1000), // 30 minutes
                input: { timeoutMinutes: 30 },
                output: null,
              },
              {
                id: "".concat(workflowId, "_escalate"),
                type: "escalate",
                status: "pending",
                scheduledAt: new Date(scheduledTime.getTime() + 60 * 60 * 1000), // 1 hour
                input: { escalationChannel: "email" },
                output: null,
              },
            ],
            results: {
              messagesSent: 0,
              messagesDelivered: 0,
              responseReceived: false,
              noShowPrevented: false,
              waitlistFilled: false,
              cost: 0,
              effectiveness: 0,
            },
            metadata: {
              noShowPrediction: prediction,
              templateType: "no_show_prevention",
            },
          },
        ];
      });
    });
  };
  /**
   * Helper methods
   */
  SchedulingCommunicationWorkflow.prototype.calculateConfirmationTime = (
    appointmentDate,
    sendTime,
  ) => {
    var _a = sendTime.split(":").map(Number),
      hours = _a[0],
      minutes = _a[1];
    var confirmationDate = new Date(appointmentDate);
    confirmationDate.setDate(confirmationDate.getDate() - 1); // Day before
    confirmationDate.setHours(hours, minutes, 0, 0);
    return confirmationDate;
  };
  SchedulingCommunicationWorkflow.prototype.calculateInterventionTime = (
    appointmentDate,
    timing,
  ) => {
    var hours = parseInt(timing.replace("h", ""));
    return new Date(appointmentDate.getTime() - hours * 60 * 60 * 1000);
  };
  SchedulingCommunicationWorkflow.prototype.generateConfirmationToken = () =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  SchedulingCommunicationWorkflow.prototype.saveWorkflow = function (workflow) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("communication_workflows").insert([
                {
                  id: workflow.id,
                  appointment_id: workflow.appointmentId,
                  patient_id: workflow.patientId,
                  clinic_id: workflow.clinicId,
                  workflow_type: workflow.workflowType,
                  status: workflow.status,
                  scheduled_at: workflow.scheduledAt.toISOString(),
                  steps: workflow.steps,
                  results: workflow.results,
                  metadata: workflow.metadata,
                  created_at: new Date().toISOString(),
                },
              ]),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SchedulingCommunicationWorkflow.prototype.getWorkflow = function (workflowId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("communication_workflows")
                .select("*")
                .eq("id", workflowId)
                .single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data ? this.mapToWorkflowExecution(data) : null];
        }
      });
    });
  };
  SchedulingCommunicationWorkflow.prototype.updateWorkflow = function (workflow) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("communication_workflows")
                .update({
                  status: workflow.status,
                  started_at:
                    (_a = workflow.startedAt) === null || _a === void 0 ? void 0 : _a.toISOString(),
                  completed_at:
                    (_b = workflow.completedAt) === null || _b === void 0
                      ? void 0
                      : _b.toISOString(),
                  steps: workflow.steps,
                  results: workflow.results,
                  metadata: workflow.metadata,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", workflow.id),
            ];
          case 1:
            _c.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  SchedulingCommunicationWorkflow.prototype.mapToWorkflowExecution = (data) => ({
    id: data.id,
    appointmentId: data.appointment_id,
    patientId: data.patient_id,
    clinicId: data.clinic_id,
    workflowType: data.workflow_type,
    status: data.status,
    steps: data.steps || [],
    scheduledAt: new Date(data.scheduled_at),
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    results: data.results || {
      messagesSent: 0,
      messagesDelivered: 0,
      responseReceived: false,
      noShowPrevented: false,
      waitlistFilled: false,
      cost: 0,
      effectiveness: 0,
    },
    metadata: data.metadata || {},
  });
  return SchedulingCommunicationWorkflow;
})();
exports.SchedulingCommunicationWorkflow = SchedulingCommunicationWorkflow;
var createschedulingCommunicationWorkflow = () => new SchedulingCommunicationWorkflow();
exports.createschedulingCommunicationWorkflow = createschedulingCommunicationWorkflow;
