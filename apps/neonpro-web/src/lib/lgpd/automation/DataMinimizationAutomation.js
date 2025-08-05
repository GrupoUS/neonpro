"use strict";
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
exports.DataMinimizationAutomation = void 0;
var DataMinimizationAutomation = /** @class */ (function () {
  function DataMinimizationAutomation(supabase, complianceManager, config) {
    this.analysisInterval = null;
    this.minimizationCallbacks = [];
    this.supabase = supabase;
    this.complianceManager = complianceManager;
    this.config = config;
  }
  /**
   * Start Automated Data Minimization
   */
  DataMinimizationAutomation.prototype.startDataMinimization = function () {
    return __awaiter(this, arguments, void 0, function (analysisIntervalHours) {
      var error_1;
      var _this = this;
      if (analysisIntervalHours === void 0) {
        analysisIntervalHours = 24;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (this.analysisInterval) {
              clearInterval(this.analysisInterval);
            }
            // Initial data discovery and analysis
            return [4 /*yield*/, this.performDataDiscovery()];
          case 1:
            // Initial data discovery and analysis
            _a.sent();
            return [
              4 /*yield*/,
              this.analyzeMinimizationOpportunities(),
              // Set up automated analysis
            ];
          case 2:
            _a.sent();
            // Set up automated analysis
            if (this.config.auto_discovery_enabled) {
              this.analysisInterval = setInterval(
                function () {
                  return __awaiter(_this, void 0, void 0, function () {
                    var error_2;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          _a.trys.push([0, 4, , 5]);
                          return [4 /*yield*/, this.performDataDiscovery()];
                        case 1:
                          _a.sent();
                          return [4 /*yield*/, this.analyzeMinimizationOpportunities()];
                        case 2:
                          _a.sent();
                          return [4 /*yield*/, this.processScheduledMinimization()];
                        case 3:
                          _a.sent();
                          return [3 /*break*/, 5];
                        case 4:
                          error_2 = _a.sent();
                          console.error("Error in data minimization cycle:", error_2);
                          return [3 /*break*/, 5];
                        case 5:
                          return [2 /*return*/];
                      }
                    });
                  });
                },
                analysisIntervalHours * 60 * 60 * 1000,
              );
            }
            console.log(
              "Data minimization automation started (".concat(
                analysisIntervalHours,
                "h intervals)",
              ),
            );
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Error starting data minimization:", error_1);
            throw new Error("Failed to start data minimization: ".concat(error_1.message));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Stop Data Minimization
   */
  DataMinimizationAutomation.prototype.stopDataMinimization = function () {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    console.log("Data minimization automation stopped");
  };
  /**
   * Create Minimization Rule
   */
  DataMinimizationAutomation.prototype.createMinimizationRule = function (ruleData) {
    return __awaiter(this, void 0, void 0, function () {
      var validation, _a, rule, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.validateMinimizationRule(ruleData)];
          case 1:
            validation = _b.sent();
            if (!validation.valid) {
              throw new Error("Invalid minimization rule: ".concat(validation.errors.join(", ")));
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_minimization_rules")
                .insert(
                  __assign(__assign({}, ruleData), {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                )
                .select("id")
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (rule = _a.data), (error = _a.error);
            if (error) throw error;
            // Log rule creation
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "data_minimization",
                resource_type: "minimization_rule",
                resource_id: rule.id,
                action: "minimization_rule_created",
                details: {
                  rule_name: ruleData.name,
                  table_name: ruleData.table_name,
                  column_name: ruleData.column_name,
                  minimization_type: ruleData.minimization_type,
                  auto_execute: ruleData.auto_execute,
                },
              }),
            ];
          case 3:
            // Log rule creation
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                rule_id: rule.id,
              },
            ];
          case 4:
            error_3 = _b.sent();
            console.error("Error creating minimization rule:", error_3);
            throw new Error("Failed to create minimization rule: ".concat(error_3.message));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Schedule Minimization Task
   */
  DataMinimizationAutomation.prototype.scheduleMinimizationTask = function (
    ruleId_1,
    scheduledAt_1,
  ) {
    return __awaiter(this, arguments, void 0, function (ruleId, scheduledAt, taskType) {
      var _a,
        rule,
        ruleError,
        affectedRecords,
        executionPlan,
        businessImpact,
        rollbackPlan,
        _b,
        task,
        error,
        error_4;
      if (taskType === void 0) {
        taskType = "scheduled";
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 10, , 11]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_data_minimization_rules")
                .select("*")
                .eq("id", ruleId)
                .single(),
            ];
          case 1:
            (_a = _c.sent()), (rule = _a.data), (ruleError = _a.error);
            if (ruleError) throw ruleError;
            if (!rule) throw new Error("Minimization rule not found");
            return [
              4 /*yield*/,
              this.analyzeAffectedRecords(rule),
              // Generate execution plan
            ];
          case 2:
            affectedRecords = _c.sent();
            return [
              4 /*yield*/,
              this.generateExecutionPlan(rule, affectedRecords),
              // Generate business impact assessment
            ];
          case 3:
            executionPlan = _c.sent();
            return [
              4 /*yield*/,
              this.assessBusinessImpact(rule, affectedRecords),
              // Generate rollback plan
            ];
          case 4:
            businessImpact = _c.sent();
            return [
              4 /*yield*/,
              this.generateRollbackPlan(rule, executionPlan),
              // Create minimization task
            ];
          case 5:
            rollbackPlan = _c.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .insert({
                  rule_id: ruleId,
                  task_type: taskType,
                  status: rule.requires_approval ? "pending" : "approved",
                  target_table: rule.table_name,
                  target_columns: [rule.column_name],
                  affected_records_count: affectedRecords.count,
                  minimization_method: rule.minimization_type,
                  execution_plan: executionPlan,
                  scheduled_at: scheduledAt,
                  business_impact_assessment: businessImpact,
                  rollback_plan: rollbackPlan,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select("id")
                .single(),
            ];
          case 6:
            (_b = _c.sent()), (task = _b.data), (error = _b.error);
            if (error) throw error;
            if (!(rule.auto_execute && !rule.requires_approval)) return [3 /*break*/, 8];
            return [4 /*yield*/, this.executeMinimizationTask(task.id)];
          case 7:
            _c.sent();
            _c.label = 8;
          case 8:
            // Log task scheduling
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "data_minimization",
                resource_type: "minimization_task",
                resource_id: task.id,
                action: "minimization_task_scheduled",
                details: {
                  rule_id: ruleId,
                  task_type: taskType,
                  scheduled_at: scheduledAt,
                  affected_records: affectedRecords.count,
                  requires_approval: rule.requires_approval,
                },
              }),
            ];
          case 9:
            // Log task scheduling
            _c.sent();
            return [
              2 /*return*/,
              {
                success: true,
                task_id: task.id,
              },
            ];
          case 10:
            error_4 = _c.sent();
            console.error("Error scheduling minimization task:", error_4);
            throw new Error("Failed to schedule minimization task: ".concat(error_4.message));
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute Minimization Task
   */
  DataMinimizationAutomation.prototype.executeMinimizationTask = function (taskId, executedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, task, taskError, recordsProcessed, _b, _i, _c, callback, executionError_1, error_5;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 25, , 26]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .select("*, lgpd_data_minimization_rules(*)")
                .eq("id", taskId)
                .single(),
            ];
          case 1:
            (_a = _d.sent()), (task = _a.data), (taskError = _a.error);
            if (taskError) throw taskError;
            if (!task) throw new Error("Minimization task not found");
            // Check if task is approved
            if (task.status !== "approved") {
              throw new Error("Task must be approved before execution");
            }
            // Update task status to executing
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .update({
                  status: "executing",
                  started_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", taskId),
            ];
          case 2:
            // Update task status to executing
            _d.sent();
            recordsProcessed = 0;
            _d.label = 3;
          case 3:
            _d.trys.push([3, 22, , 24]);
            if (!this.config.backup_before_minimization) return [3 /*break*/, 5];
            return [4 /*yield*/, this.createDataBackup(task)];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            _b = task.minimization_method;
            switch (_b) {
              case "anonymization":
                return [3 /*break*/, 6];
              case "pseudonymization":
                return [3 /*break*/, 8];
              case "aggregation":
                return [3 /*break*/, 10];
              case "deletion":
                return [3 /*break*/, 12];
              case "masking":
                return [3 /*break*/, 14];
              case "encryption":
                return [3 /*break*/, 16];
            }
            return [3 /*break*/, 18];
          case 6:
            return [4 /*yield*/, this.executeAnonymization(task)];
          case 7:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 8:
            return [4 /*yield*/, this.executePseudonymization(task)];
          case 9:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 10:
            return [4 /*yield*/, this.executeAggregation(task)];
          case 11:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 12:
            return [4 /*yield*/, this.executeDeletion(task)];
          case 13:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 14:
            return [4 /*yield*/, this.executeMasking(task)];
          case 15:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 16:
            return [4 /*yield*/, this.executeEncryption(task)];
          case 17:
            recordsProcessed = _d.sent();
            return [3 /*break*/, 19];
          case 18:
            throw new Error("Unsupported minimization method: ".concat(task.minimization_method));
          case 19:
            // Update task status to completed
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", taskId),
              // Trigger callbacks
            ];
          case 20:
            // Update task status to completed
            _d.sent();
            // Trigger callbacks
            for (_i = 0, _c = this.minimizationCallbacks; _i < _c.length; _i++) {
              callback = _c[_i];
              try {
                callback(
                  __assign(__assign({}, task), {
                    status: "completed",
                    completed_at: new Date().toISOString(),
                  }),
                );
              } catch (error) {
                console.error("Error in minimization callback:", error);
              }
            }
            // Log successful execution
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "data_minimization",
                resource_type: "minimization_task",
                resource_id: taskId,
                action: "minimization_task_executed",
                details: {
                  minimization_method: task.minimization_method,
                  records_processed: recordsProcessed,
                  executed_by: executedBy,
                  execution_duration: Date.now() - new Date(task.started_at).getTime(),
                },
              }),
            ];
          case 21:
            // Log successful execution
            _d.sent();
            return [
              2 /*return*/,
              {
                success: true,
                records_processed: recordsProcessed,
              },
            ];
          case 22:
            executionError_1 = _d.sent();
            // Update task status to failed
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .update({
                  status: "failed",
                  error_message: executionError_1.message,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", taskId),
            ];
          case 23:
            // Update task status to failed
            _d.sent();
            throw executionError_1;
          case 24:
            return [3 /*break*/, 26];
          case 25:
            error_5 = _d.sent();
            console.error("Error executing minimization task:", error_5);
            throw new Error("Failed to execute minimization task: ".concat(error_5.message));
          case 26:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Approve Minimization Task
   */
  DataMinimizationAutomation.prototype.approveMinimizationTask = function (
    taskId,
    approvedBy,
    approvalNotes,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .update({
                  status: "approved",
                  approved_by: approvedBy,
                  approved_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", taskId)
                .eq("status", "pending"),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Log approval
            return [
              4 /*yield*/,
              this.complianceManager.logAuditEvent({
                event_type: "data_minimization",
                resource_type: "minimization_task",
                resource_id: taskId,
                action: "minimization_task_approved",
                details: {
                  approved_by: approvedBy,
                  approval_notes: approvalNotes,
                },
              }),
            ];
          case 2:
            // Log approval
            _a.sent();
            return [2 /*return*/, { success: true }];
          case 3:
            error_6 = _a.sent();
            console.error("Error approving minimization task:", error_6);
            throw new Error("Failed to approve minimization task: ".concat(error_6.message));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get Data Inventory
   */
  DataMinimizationAutomation.prototype.getDataInventory = function () {
    return __awaiter(this, arguments, void 0, function (includeAnalysis) {
      var _a, inventory, error, error_7;
      if (includeAnalysis === void 0) {
        includeAnalysis = true;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.rpc("get_data_inventory", {
                include_analysis: includeAnalysis,
              }),
            ];
          case 1:
            (_a = _b.sent()), (inventory = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, inventory || []];
          case 2:
            error_7 = _b.sent();
            console.error("Error getting data inventory:", error_7);
            throw new Error("Failed to get data inventory: ".concat(error_7.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze Minimization Opportunities
   */
  DataMinimizationAutomation.prototype.analyzeMinimizationOpportunities = function (tableName) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, analysis, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_minimization_opportunities", {
                table_name: tableName,
              }),
            ];
          case 1:
            (_a = _b.sent()), (analysis = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, analysis || []];
          case 2:
            error_8 = _b.sent();
            console.error("Error analyzing minimization opportunities:", error_8);
            throw new Error(
              "Failed to analyze minimization opportunities: ".concat(error_8.message),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get Minimization Dashboard
   */
  DataMinimizationAutomation.prototype.getMinimizationDashboard = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, dashboard, error, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("get_minimization_dashboard")];
          case 1:
            (_a = _b.sent()), (dashboard = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, dashboard];
          case 2:
            error_9 = _b.sent();
            console.error("Error getting minimization dashboard:", error_9);
            throw new Error("Failed to get minimization dashboard: ".concat(error_9.message));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Register Minimization Callback
   */
  DataMinimizationAutomation.prototype.onMinimizationCompleted = function (callback) {
    this.minimizationCallbacks.push(callback);
  };
  // Private helper methods
  DataMinimizationAutomation.prototype.performDataDiscovery = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.rpc("perform_data_discovery")];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            console.log("Data discovery completed");
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error performing data discovery:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.processScheduledMinimization = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, tasks, error, _i, tasks_1, task, taskError_1, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              this.supabase
                .from("lgpd_minimization_tasks")
                .select("*")
                .eq("status", "approved")
                .lte("scheduled_at", new Date().toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (tasks = _a.data), (error = _a.error);
            if (error) throw error;
            if (!tasks || tasks.length === 0) {
              return [2 /*return*/];
            }
            (_i = 0), (tasks_1 = tasks);
            _b.label = 2;
          case 2:
            if (!(_i < tasks_1.length)) return [3 /*break*/, 7];
            task = tasks_1[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.executeMinimizationTask(task.id, "system")];
          case 4:
            _b.sent();
            return [3 /*break*/, 6];
          case 5:
            taskError_1 = _b.sent();
            console.error("Error executing scheduled task ".concat(task.id, ":"), taskError_1);
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [3 /*break*/, 9];
          case 8:
            error_11 = _b.sent();
            console.error("Error processing scheduled minimization:", error_11);
            return [3 /*break*/, 9];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.validateMinimizationRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var errors;
      return __generator(this, function (_a) {
        errors = [];
        if (!rule.name || rule.name.trim().length === 0) {
          errors.push("Rule name is required");
        }
        if (!rule.table_name || rule.table_name.trim().length === 0) {
          errors.push("Table name is required");
        }
        if (!rule.column_name || rule.column_name.trim().length === 0) {
          errors.push("Column name is required");
        }
        if (!rule.data_category) {
          errors.push("Data category is required");
        }
        if (!rule.minimization_type) {
          errors.push("Minimization type is required");
        }
        if (!rule.retention_period_days || rule.retention_period_days <= 0) {
          errors.push("Retention period must be greater than 0");
        }
        if (!rule.business_justification || rule.business_justification.trim().length === 0) {
          errors.push("Business justification is required");
        }
        if (!rule.legal_basis || rule.legal_basis.trim().length === 0) {
          errors.push("Legal basis is required");
        }
        return [
          2 /*return*/,
          {
            valid: errors.length === 0,
            errors: errors,
          },
        ];
      });
    });
  };
  DataMinimizationAutomation.prototype.analyzeAffectedRecords = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, analysis, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("analyze_affected_records", {
                table_name: rule.table_name,
                column_name: rule.column_name,
                trigger_condition: rule.trigger_condition,
              }),
            ];
          case 1:
            (_a = _b.sent()), (analysis = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, analysis || { count: 0, sample: [] }];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.generateExecutionPlan = function (rule, affectedRecords) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            method: rule.minimization_type,
            target_table: rule.table_name,
            target_column: rule.column_name,
            affected_records: affectedRecords.count,
            execution_steps: this.getExecutionSteps(rule.minimization_type),
            estimated_duration: this.estimateExecutionDuration(
              affectedRecords.count,
              rule.minimization_type,
            ),
            resource_requirements: this.getResourceRequirements(rule.minimization_type),
            rollback_supported: this.isRollbackSupported(rule.minimization_type),
          },
        ];
      });
    });
  };
  DataMinimizationAutomation.prototype.assessBusinessImpact = function (rule, affectedRecords) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            data_utility_impact: "medium", // Would be calculated based on usage patterns
            performance_impact: "low",
            storage_savings: this.calculateStorageSavings(
              affectedRecords.count,
              rule.minimization_type,
            ),
            compliance_benefit: "high",
            risk_reduction: "high",
            affected_processes: [], // Would be determined by analyzing dependencies
            mitigation_measures: this.getMitigationMeasures(rule.minimization_type),
          },
        ];
      });
    });
  };
  DataMinimizationAutomation.prototype.generateRollbackPlan = function (rule, executionPlan) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (!executionPlan.rollback_supported) {
          return [
            2 /*return*/,
            {
              rollback_supported: false,
              reason: "Irreversible operation",
            },
          ];
        }
        return [
          2 /*return*/,
          {
            rollback_supported: true,
            backup_location: "backups/".concat(rule.table_name, "_").concat(Date.now()),
            rollback_steps: this.getRollbackSteps(rule.minimization_type),
            estimated_rollback_duration: executionPlan.estimated_duration * 0.5,
            data_recovery_method: this.getDataRecoveryMethod(rule.minimization_type),
          },
        ];
      });
    });
  };
  DataMinimizationAutomation.prototype.createDataBackup = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("create_minimization_backup", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executeAnonymization = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_anonymization", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
                anonymization_config: this.config.anonymization_algorithms,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executePseudonymization = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_pseudonymization", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
                pseudonymization_config: this.config.pseudonymization_methods,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executeAggregation = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_aggregation", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executeDeletion = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_secure_deletion", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executeMasking = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_data_masking", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.executeEncryption = function (task) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, result, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.rpc("execute_field_encryption", {
                task_id: task.id,
                table_name: task.target_table,
                columns: task.target_columns,
                execution_plan: task.execution_plan,
              }),
            ];
          case 1:
            (_a = _b.sent()), (result = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              (result === null || result === void 0 ? void 0 : result.records_processed) || 0,
            ];
        }
      });
    });
  };
  DataMinimizationAutomation.prototype.getExecutionSteps = function (minimizationType) {
    var steps = {
      anonymization: [
        "Analyze data distribution",
        "Apply k-anonymity algorithm",
        "Verify anonymization quality",
        "Update records",
      ],
      pseudonymization: [
        "Generate pseudonym mapping",
        "Apply pseudonymization",
        "Store mapping securely",
        "Verify pseudonymization",
      ],
      aggregation: [
        "Group records by criteria",
        "Calculate aggregated values",
        "Replace individual records",
        "Verify aggregation accuracy",
      ],
      deletion: [
        "Identify records for deletion",
        "Create backup if required",
        "Perform secure deletion",
        "Verify deletion completion",
      ],
      masking: [
        "Identify sensitive fields",
        "Apply masking patterns",
        "Preserve data format",
        "Verify masking effectiveness",
      ],
      encryption: [
        "Generate encryption keys",
        "Encrypt sensitive fields",
        "Store keys securely",
        "Verify encryption integrity",
      ],
    };
    return steps[minimizationType] || ["Execute minimization"];
  };
  DataMinimizationAutomation.prototype.estimateExecutionDuration = function (
    recordCount,
    minimizationType,
  ) {
    // Estimate duration in minutes based on record count and method complexity
    var baseTime = Math.ceil(recordCount / 1000); // 1 minute per 1000 records
    var complexityMultiplier = {
      deletion: 1,
      masking: 1.5,
      encryption: 2,
      pseudonymization: 2.5,
      aggregation: 3,
      anonymization: 4,
    };
    return baseTime * (complexityMultiplier[minimizationType] || 1);
  };
  DataMinimizationAutomation.prototype.getResourceRequirements = function (minimizationType) {
    var requirements = {
      anonymization: { cpu: "high", memory: "high", storage: "medium" },
      pseudonymization: { cpu: "medium", memory: "medium", storage: "high" },
      aggregation: { cpu: "medium", memory: "high", storage: "low" },
      deletion: { cpu: "low", memory: "low", storage: "low" },
      masking: { cpu: "low", memory: "low", storage: "low" },
      encryption: { cpu: "medium", memory: "medium", storage: "medium" },
    };
    return requirements[minimizationType] || { cpu: "medium", memory: "medium", storage: "medium" };
  };
  DataMinimizationAutomation.prototype.isRollbackSupported = function (minimizationType) {
    // Deletion is typically irreversible
    return minimizationType !== "deletion";
  };
  DataMinimizationAutomation.prototype.calculateStorageSavings = function (
    recordCount,
    minimizationType,
  ) {
    // Estimate storage savings based on minimization type
    var avgRecordSize = 1024; // 1KB average
    var savingsMultiplier = {
      deletion: 1.0, // 100% savings
      aggregation: 0.8, // 80% savings
      anonymization: 0.1, // 10% savings
      pseudonymization: 0.05, // 5% savings
      masking: 0.02, // 2% savings
      encryption: -0.1, // -10% (encryption overhead)
    };
    var savings = recordCount * avgRecordSize * (savingsMultiplier[minimizationType] || 0);
    return this.formatBytes(Math.max(0, savings));
  };
  DataMinimizationAutomation.prototype.getMitigationMeasures = function (minimizationType) {
    var measures = {
      anonymization: [
        "Maintain data utility metrics",
        "Implement quality checks",
        "Monitor re-identification risks",
      ],
      pseudonymization: [
        "Secure pseudonym key management",
        "Regular key rotation",
        "Access control for mapping tables",
      ],
      aggregation: [
        "Preserve statistical accuracy",
        "Maintain business intelligence capabilities",
        "Document aggregation methods",
      ],
      deletion: [
        "Comprehensive backup strategy",
        "Legal compliance verification",
        "Business impact assessment",
      ],
      masking: [
        "Format preservation",
        "Referential integrity maintenance",
        "Test environment synchronization",
      ],
      encryption: [
        "Key management procedures",
        "Performance impact monitoring",
        "Backup encryption verification",
      ],
    };
    return measures[minimizationType] || ["Standard data protection measures"];
  };
  DataMinimizationAutomation.prototype.getRollbackSteps = function (minimizationType) {
    var steps = {
      anonymization: ["Restore from backup", "Verify data integrity", "Update dependent systems"],
      pseudonymization: [
        "Reverse pseudonym mapping",
        "Restore original values",
        "Verify restoration accuracy",
      ],
      aggregation: [
        "Restore individual records",
        "Recalculate aggregations",
        "Verify data consistency",
      ],
      masking: [
        "Restore original values",
        "Verify unmasking accuracy",
        "Update dependent processes",
      ],
      encryption: ["Decrypt fields", "Restore plaintext values", "Verify decryption integrity"],
    };
    return steps[minimizationType] || ["Restore from backup"];
  };
  DataMinimizationAutomation.prototype.getDataRecoveryMethod = function (minimizationType) {
    var methods = {
      anonymization: "backup_restoration",
      pseudonymization: "mapping_reversal",
      aggregation: "backup_restoration",
      masking: "value_restoration",
      encryption: "decryption",
    };
    return methods[minimizationType] || "backup_restoration";
  };
  DataMinimizationAutomation.prototype.formatBytes = function (bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  return DataMinimizationAutomation;
})();
exports.DataMinimizationAutomation = DataMinimizationAutomation;
