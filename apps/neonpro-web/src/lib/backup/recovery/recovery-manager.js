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
exports.RecoveryManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var audit_logger_1 = require("../../audit/audit-logger");
var encryption_service_1 = require("../../security/encryption-service");
var lgpd_manager_1 = require("../../lgpd/lgpd-manager");
var backup_strategies_1 = require("../strategies/backup-strategies");
var RecoveryManager = /** @class */ (() => {
  function RecoveryManager() {
    this.activeExecutions = new Map();
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.encryptionService = new encryption_service_1.EncryptionService();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
    this.strategyManager = new backup_strategies_1.BackupStrategyManager();
  }
  /**
   * Cria um plano de recuperação
   */
  RecoveryManager.prototype.createRecoveryPlan = function (planData, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var planId, plan, validation, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            planId = this.generatePlanId();
            plan = __assign({ id: planId }, planData);
            return [4 /*yield*/, this.validateRecoveryPlan(plan)];
          case 1:
            validation = _a.sent();
            if (!validation.valid) {
              throw new Error("Plano inv\u00E1lido: ".concat(validation.errors.join(", ")));
            }
            // Salvar plano
            return [4 /*yield*/, this.saveRecoveryPlan(plan)];
          case 2:
            // Salvar plano
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "recovery_plan_created",
                resource_type: "recovery_plan",
                resource_id: planId,
                user_id: userId,
                details: {
                  name: plan.name,
                  recovery_type: plan.recovery_type,
                  data_sources: plan.data_sources,
                },
              }),
            ];
          case 3:
            _a.sent();
            return [2 /*return*/, planId];
          case 4:
            error_1 = _a.sent();
            throw new Error("Erro ao criar plano de recupera\u00E7\u00E3o: ".concat(error_1));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa um plano de recuperação
   */
  RecoveryManager.prototype.executeRecoveryPlan = function (planId, userId, options) {
    return __awaiter(this, void 0, void 0, function () {
      var plan, executionId_1, estimatedCompletion, execution, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getRecoveryPlan(planId)];
          case 1:
            plan = _a.sent();
            if (!plan) {
              throw new Error("Plano de recuperação não encontrado");
            }
            if (options === null || options === void 0 ? void 0 : options.force_execution)
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.checkPrerequisites(plan)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            executionId_1 = this.generateExecutionId();
            estimatedCompletion = new Date();
            estimatedCompletion.setMinutes(
              estimatedCompletion.getMinutes() + plan.estimated_duration_minutes,
            );
            execution = {
              id: executionId_1,
              plan_id: planId,
              status: "pending",
              started_at: new Date(),
              progress_percentage: 0,
              steps_completed: 0,
              steps_total: plan.recovery_steps.length,
              errors: [],
              warnings: [],
              rollback_executed: false,
              validation_results: [],
              estimated_completion: estimatedCompletion,
              executed_by: userId,
              metadata: {
                dry_run:
                  (options === null || options === void 0 ? void 0 : options.dry_run) || false,
                skip_validation:
                  (options === null || options === void 0 ? void 0 : options.skip_validation) ||
                  false,
                custom_parameters:
                  (options === null || options === void 0 ? void 0 : options.custom_parameters) ||
                  {},
              },
            };
            // Salvar execução
            return [4 /*yield*/, this.saveRecoveryExecution(execution)];
          case 4:
            // Salvar execução
            _a.sent();
            this.activeExecutions.set(executionId_1, execution);
            // Executar plano
            this.executeRecoverySteps(executionId_1, plan).catch((error) => {
              console.error("Erro na execu\u00E7\u00E3o ".concat(executionId_1, ":"), error);
            });
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "recovery_execution_started",
                resource_type: "recovery_execution",
                resource_id: executionId_1,
                user_id: userId,
                details: {
                  plan_id: planId,
                  dry_run: options === null || options === void 0 ? void 0 : options.dry_run,
                  estimated_duration: plan.estimated_duration_minutes,
                },
              }),
            ];
          case 5:
            _a.sent();
            return [2 /*return*/, executionId_1];
          case 6:
            error_2 = _a.sent();
            throw new Error("Erro ao executar plano de recupera\u00E7\u00E3o: ".concat(error_2));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém status de uma execução
   */
  RecoveryManager.prototype.getRecoveryExecutionStatus = function (executionId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeExecution, _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            activeExecution = this.activeExecutions.get(executionId);
            if (activeExecution) {
              return [2 /*return*/, activeExecution];
            }
            return [
              4 /*yield*/,
              this.supabase.from("recovery_executions").select("*").eq("id", executionId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") return [2 /*return*/, null];
              throw error;
            }
            return [2 /*return*/, this.mapDatabaseToRecoveryExecution(data)];
          case 2:
            error_3 = _b.sent();
            throw new Error("Erro ao obter status da execu\u00E7\u00E3o: ".concat(error_3));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cancela uma execução em andamento
   */
  RecoveryManager.prototype.cancelRecoveryExecution = function (executionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var execution, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            execution = this.activeExecutions.get(executionId);
            if (!execution) {
              throw new Error("Execução não encontrada ou não está em andamento");
            }
            if (execution.status === "completed" || execution.status === "failed") {
              throw new Error("Execução já foi finalizada");
            }
            // Atualizar status
            execution.status = "cancelled";
            execution.completed_at = new Date();
            execution.actual_duration_minutes = Math.floor(
              (execution.completed_at.getTime() - execution.started_at.getTime()) / 60000,
            );
            // Remover da lista ativa
            this.activeExecutions.delete(executionId);
            // Atualizar no banco
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 1:
            // Atualizar no banco
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "recovery_execution_cancelled",
                resource_type: "recovery_execution",
                resource_id: executionId,
                user_id: userId,
                details: {
                  steps_completed: execution.steps_completed,
                  progress: execution.progress_percentage,
                },
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            throw new Error("Erro ao cancelar execu\u00E7\u00E3o: ".concat(error_4));
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Executa rollback de uma recuperação
   */
  RecoveryManager.prototype.executeRollback = function (executionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var execution, plan, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getRecoveryExecutionStatus(executionId)];
          case 1:
            execution = _a.sent();
            if (!execution) {
              throw new Error("Execução não encontrada");
            }
            return [4 /*yield*/, this.getRecoveryPlan(execution.plan_id)];
          case 2:
            plan = _a.sent();
            if (!plan) {
              throw new Error("Plano de recuperação não encontrado");
            }
            if (execution.rollback_executed) {
              throw new Error("Rollback já foi executado");
            }
            // Executar steps de rollback
            return [4 /*yield*/, this.executeRollbackSteps(plan.rollback_plan, execution)];
          case 3:
            // Executar steps de rollback
            _a.sent();
            // Atualizar execução
            execution.rollback_executed = true;
            execution.status = "rolling_back";
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 4:
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "recovery_rollback_executed",
                resource_type: "recovery_execution",
                resource_id: executionId,
                user_id: userId,
                details: {
                  rollback_steps: plan.rollback_plan.length,
                },
              }),
            ];
          case 5:
            _a.sent();
            return [3 /*break*/, 7];
          case 6:
            error_5 = _a.sent();
            throw new Error("Erro ao executar rollback: ".concat(error_5));
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista planos de recuperação
   */
  RecoveryManager.prototype.listRecoveryPlans = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var query, offset, _a, data, error, count, plans, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("recovery_plans")
              .select("*", { count: "exact" })
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.recovery_type) {
              query = query.in("recovery_type", filters.recovery_type);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.data_sources) {
              query = query.overlaps("data_sources", filters.data_sources);
            }
            if (pagination) {
              offset = (pagination.page - 1) * pagination.limit;
              query = query.range(offset, offset + pagination.limit - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            plans = data.map(this.mapDatabaseToRecoveryPlan);
            return [
              2 /*return*/,
              {
                plans: plans,
                total: count || 0,
                page:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1,
                limit:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.limit) ||
                  plans.length,
              },
            ];
          case 2:
            error_6 = _b.sent();
            throw new Error("Erro ao listar planos: ".concat(error_6));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Lista execuções de recuperação
   */
  RecoveryManager.prototype.listRecoveryExecutions = function (filters, pagination) {
    return __awaiter(this, void 0, void 0, function () {
      var query, offset, _a, data, error, count, executions, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("recovery_executions")
              .select("*", { count: "exact" })
              .order("started_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.plan_id) {
              query = query.eq("plan_id", filters.plan_id);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.in("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.executed_by) {
              query = query.eq("executed_by", filters.executed_by);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_from) {
              query = query.gte("started_at", filters.date_from.toISOString());
            }
            if (filters === null || filters === void 0 ? void 0 : filters.date_to) {
              query = query.lte("started_at", filters.date_to.toISOString());
            }
            if (pagination) {
              offset = (pagination.page - 1) * pagination.limit;
              query = query.range(offset, offset + pagination.limit - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            executions = data.map(this.mapDatabaseToRecoveryExecution);
            return [
              2 /*return*/,
              {
                executions: executions,
                total: count || 0,
                page:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.page) || 1,
                limit:
                  (pagination === null || pagination === void 0 ? void 0 : pagination.limit) ||
                  executions.length,
              },
            ];
          case 2:
            error_7 = _b.sent();
            throw new Error("Erro ao listar execu\u00E7\u00F5es: ".concat(error_7));
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Obtém métricas de recuperação
   */
  RecoveryManager.prototype.getRecoveryMetrics = function () {
    return __awaiter(this, arguments, void 0, function (period) {
      var startDate,
        _a,
        executions,
        error,
        totalRecoveries_1,
        successfulRecoveries,
        failedRecoveries,
        successRate,
        completedExecutions,
        averageDuration,
        errorCounts_1,
        mostCommonErrors,
        recoveryTrends,
        dataSourcePerformance,
        error_8;
      if (period === void 0) {
        period = "month";
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            startDate = new Date();
            switch (period) {
              case "day":
                startDate.setDate(startDate.getDate() - 1);
                break;
              case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
              case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_executions")
                .select("*")
                .gte("started_at", startDate.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (executions = _a.data), (error = _a.error);
            if (error) throw error;
            totalRecoveries_1 = executions.length;
            successfulRecoveries = executions.filter((e) => e.status === "completed").length;
            failedRecoveries = executions.filter((e) => e.status === "failed").length;
            successRate =
              totalRecoveries_1 > 0 ? (successfulRecoveries / totalRecoveries_1) * 100 : 0;
            completedExecutions = executions.filter((e) => e.actual_duration_minutes);
            averageDuration =
              completedExecutions.length > 0
                ? completedExecutions.reduce((sum, e) => sum + e.actual_duration_minutes, 0) /
                  completedExecutions.length
                : 0;
            errorCounts_1 = new Map();
            executions.forEach((e) => {
              var _a;
              (_a = e.errors) === null || _a === void 0
                ? void 0
                : _a.forEach((error) => {
                    var count = errorCounts_1.get(error.error_type) || 0;
                    errorCounts_1.set(error.error_type, count + 1);
                  });
            });
            mostCommonErrors = Array.from(errorCounts_1.entries())
              .map((_a) => {
                var type = _a[0],
                  count = _a[1];
                return {
                  error_type: type,
                  count: count,
                  percentage: (count / totalRecoveries_1) * 100,
                };
              })
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            return [4 /*yield*/, this.getRecoveryTrends(period)];
          case 2:
            recoveryTrends = _b.sent();
            return [4 /*yield*/, this.getDataSourcePerformance(period)];
          case 3:
            dataSourcePerformance = _b.sent();
            return [
              2 /*return*/,
              {
                total_recoveries: totalRecoveries_1,
                successful_recoveries: successfulRecoveries,
                failed_recoveries: failedRecoveries,
                success_rate: successRate,
                average_duration_minutes: averageDuration,
                most_common_errors: mostCommonErrors,
                recovery_trends: recoveryTrends,
                data_source_performance: dataSourcePerformance,
              },
            ];
          case 4:
            error_8 = _b.sent();
            throw new Error("Erro ao obter m\u00E9tricas: ".concat(error_8));
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Testa um plano de recuperação (dry run)
   */
  RecoveryManager.prototype.testRecoveryPlan = function (planId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var plan,
        issues,
        warnings,
        estimatedDuration,
        _i,
        _a,
        step,
        stepValidation,
        dependencyValidation,
        backupValidation,
        error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 9, , 10]);
            return [4 /*yield*/, this.getRecoveryPlan(planId)];
          case 1:
            plan = _b.sent();
            if (!plan) {
              throw new Error("Plano não encontrado");
            }
            issues = [];
            warnings = [];
            estimatedDuration = 0;
            (_i = 0), (_a = plan.recovery_steps);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            step = _a[_i];
            return [4 /*yield*/, this.validateRecoveryStep(step)];
          case 3:
            stepValidation = _b.sent();
            if (!stepValidation.valid) {
              issues.push.apply(issues, stepValidation.errors);
            }
            warnings.push.apply(warnings, stepValidation.warnings);
            estimatedDuration += step.timeout_minutes;
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [4 /*yield*/, this.validateStepDependencies(plan.recovery_steps)];
          case 6:
            dependencyValidation = _b.sent();
            if (!dependencyValidation.valid) {
              issues.push.apply(issues, dependencyValidation.errors);
            }
            return [4 /*yield*/, this.validateBackupAvailability(plan)];
          case 7:
            backupValidation = _b.sent();
            if (!backupValidation.valid) {
              issues.push.apply(issues, backupValidation.errors);
            }
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "recovery_plan_tested",
                resource_type: "recovery_plan",
                resource_id: planId,
                user_id: userId,
                details: {
                  success: issues.length === 0,
                  issues_count: issues.length,
                  warnings_count: warnings.length,
                },
              }),
            ];
          case 8:
            _b.sent();
            return [
              2 /*return*/,
              {
                success: issues.length === 0,
                issues: issues,
                warnings: warnings,
                estimated_duration_minutes: estimatedDuration,
              },
            ];
          case 9:
            error_9 = _b.sent();
            throw new Error("Erro ao testar plano: ".concat(error_9));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  // Métodos privados
  RecoveryManager.prototype.executeRecoverySteps = function (executionId, plan) {
    return __awaiter(this, void 0, void 0, function () {
      var execution, orderedSteps, i, step, error_10, recoveryError, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            execution = this.activeExecutions.get(executionId);
            if (!execution) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 15, , 17]);
            execution.status = "running";
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 2:
            _a.sent();
            orderedSteps = this.orderStepsByDependencies(plan.recovery_steps);
            i = 0;
            _a.label = 3;
          case 3:
            if (!(i < orderedSteps.length)) return [3 /*break*/, 11];
            step = orderedSteps[i];
            execution.current_step = step.id;
            _a.label = 4;
          case 4:
            _a.trys.push([4, 7, , 10]);
            return [4 /*yield*/, this.executeRecoveryStep(step, execution, plan)];
          case 5:
            _a.sent();
            execution.steps_completed++;
            execution.progress_percentage = Math.floor(
              (execution.steps_completed / execution.steps_total) * 100,
            );
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 6:
            _a.sent();
            return [3 /*break*/, 10];
          case 7:
            error_10 = _a.sent();
            recoveryError = {
              step_id: step.id,
              error_type: "system_error",
              message: error_10.toString(),
              timestamp: new Date(),
              recoverable: false,
              suggested_action: "Verificar logs e tentar novamente",
            };
            execution.errors.push(recoveryError);
            if (!step.rollback_on_failure) return [3 /*break*/, 9];
            return [4 /*yield*/, this.executeRollbackSteps(plan.rollback_plan, execution)];
          case 8:
            _a.sent();
            execution.rollback_executed = true;
            _a.label = 9;
          case 9:
            throw error_10;
          case 10:
            i++;
            return [3 /*break*/, 3];
          case 11:
            if (execution.metadata.skip_validation) return [3 /*break*/, 13];
            return [4 /*yield*/, this.executeValidationChecks(plan.validation_checks, execution)];
          case 12:
            _a.sent();
            _a.label = 13;
          case 13:
            execution.status = "completed";
            execution.completed_at = new Date();
            execution.progress_percentage = 100;
            execution.actual_duration_minutes = Math.floor(
              (execution.completed_at.getTime() - execution.started_at.getTime()) / 60000,
            );
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 14:
            _a.sent();
            this.activeExecutions.delete(executionId);
            return [3 /*break*/, 17];
          case 15:
            error_11 = _a.sent();
            execution.status = "failed";
            execution.completed_at = new Date();
            execution.actual_duration_minutes = Math.floor(
              (execution.completed_at.getTime() - execution.started_at.getTime()) / 60000,
            );
            return [4 /*yield*/, this.updateRecoveryExecution(execution)];
          case 16:
            _a.sent();
            this.activeExecutions.delete(executionId);
            throw error_11;
          case 17:
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.executeRecoveryStep = function (step, execution, plan) {
    return __awaiter(this, void 0, void 0, function () {
      var strategy, _a, isValid;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            strategy = this.strategyManager.getStrategy(step.data_source);
            if (!strategy) {
              throw new Error("Estrat\u00E9gia n\u00E3o encontrada: ".concat(step.data_source));
            }
            _a = step.type;
            switch (_a) {
              case "prepare":
                return [3 /*break*/, 1];
              case "restore":
                return [3 /*break*/, 3];
              case "validate":
                return [3 /*break*/, 5];
              case "cleanup":
                return [3 /*break*/, 7];
            }
            return [3 /*break*/, 9];
          case 1:
            return [4 /*yield*/, this.prepareRecoveryStep(step, execution)];
          case 2:
            _b.sent();
            return [3 /*break*/, 10];
          case 3:
            return [4 /*yield*/, strategy.restore(step.backup_location, step.target_location)];
          case 4:
            _b.sent();
            return [3 /*break*/, 10];
          case 5:
            return [4 /*yield*/, strategy.validate(step.backup_location)];
          case 6:
            isValid = _b.sent();
            if (!isValid) {
              throw new Error("Valida\u00E7\u00E3o falhou para ".concat(step.name));
            }
            return [3 /*break*/, 10];
          case 7:
            return [4 /*yield*/, this.cleanupRecoveryStep(step, execution)];
          case 8:
            _b.sent();
            return [3 /*break*/, 10];
          case 9:
            throw new Error("Tipo de step n\u00E3o suportado: ".concat(step.type));
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.executeRollbackSteps = function (rollbackSteps, execution) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, step, error_12;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_i = 0), (_a = rollbackSteps.sort((a, b) => a.order - b.order));
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 6];
            step = _a[_i];
            _b.label = 2;
          case 2:
            _b.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.executeRollbackStep(step)];
          case 3:
            _b.sent();
            return [3 /*break*/, 5];
          case 4:
            error_12 = _b.sent();
            console.error("Erro no rollback step ".concat(step.id, ":"), error_12);
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.executeRollbackStep = function (step) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        switch (step.action) {
          case "restore_backup":
            // Implementar restauração de backup anterior
            console.log("Restaurando backup para: ".concat(step.target));
            break;
          case "delete_files":
            // Implementar deleção de arquivos
            console.log("Deletando arquivos em: ".concat(step.target));
            break;
          case "revert_database":
            // Implementar reversão de banco
            console.log("Revertendo banco: ".concat(step.target));
            break;
          case "custom_script":
            // Executar script customizado
            if (step.script) {
              console.log("Executando script: ".concat(step.script));
            }
            break;
        }
        return [2 /*return*/];
      });
    });
  };
  RecoveryManager.prototype.executeValidationChecks = function (checks, execution) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, checks_1, check, result, error_13, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (_i = 0), (checks_1 = checks);
            _a.label = 1;
          case 1:
            if (!(_i < checks_1.length)) return [3 /*break*/, 6];
            check = checks_1[_i];
            _a.label = 2;
          case 2:
            _a.trys.push([2, 4, , 5]);
            return [4 /*yield*/, this.executeValidationCheck(check)];
          case 3:
            result = _a.sent();
            execution.validation_results.push(result);
            if (result.status === "failed" && check.critical) {
              throw new Error("Valida\u00E7\u00E3o cr\u00EDtica falhou: ".concat(check.name));
            }
            return [3 /*break*/, 5];
          case 4:
            error_13 = _a.sent();
            result = {
              check_id: check.id,
              status: "failed",
              actual_result: null,
              expected_result: check.expected_result,
              message: error_13.toString(),
              timestamp: new Date(),
            };
            execution.validation_results.push(result);
            if (check.critical) {
              throw error_13;
            }
            return [3 /*break*/, 5];
          case 5:
            _i++;
            return [3 /*break*/, 1];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.executeValidationCheck = function (check) {
    return __awaiter(this, void 0, void 0, function () {
      var actualResult, status, message, _a, difference;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            status = "passed";
            message = "Validação passou";
            _a = check.type;
            switch (_a) {
              case "checksum":
                return [3 /*break*/, 1];
              case "integrity":
                return [3 /*break*/, 3];
              case "connectivity":
                return [3 /*break*/, 5];
              case "performance":
                return [3 /*break*/, 7];
              case "custom":
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 12];
          case 1:
            return [4 /*yield*/, this.validateChecksum(check.target)];
          case 2:
            actualResult = _b.sent();
            return [3 /*break*/, 12];
          case 3:
            return [4 /*yield*/, this.validateIntegrity(check.target)];
          case 4:
            actualResult = _b.sent();
            return [3 /*break*/, 12];
          case 5:
            return [4 /*yield*/, this.validateConnectivity(check.target)];
          case 6:
            actualResult = _b.sent();
            return [3 /*break*/, 12];
          case 7:
            return [4 /*yield*/, this.validatePerformance(check.target)];
          case 8:
            actualResult = _b.sent();
            return [3 /*break*/, 12];
          case 9:
            if (!check.script) return [3 /*break*/, 11];
            return [4 /*yield*/, this.executeCustomValidation(check.script)];
          case 10:
            actualResult = _b.sent();
            _b.label = 11;
          case 11:
            return [3 /*break*/, 12];
          case 12:
            // Comparar resultado com esperado
            if (actualResult !== check.expected_result) {
              difference = Math.abs(actualResult - check.expected_result);
              if (difference > check.tolerance) {
                status = "failed";
                message = "Resultado "
                  .concat(actualResult, " difere do esperado ")
                  .concat(check.expected_result);
              } else {
                status = "warning";
                message = "Resultado ".concat(actualResult, " dentro da toler\u00E2ncia");
              }
            }
            return [
              2 /*return*/,
              {
                check_id: check.id,
                status: status,
                actual_result: actualResult,
                expected_result: check.expected_result,
                message: message,
                timestamp: new Date(),
              },
            ];
        }
      });
    });
  };
  // Métodos auxiliares
  RecoveryManager.prototype.generatePlanId = () =>
    "plan_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  RecoveryManager.prototype.generateExecutionId = () =>
    "exec_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  RecoveryManager.prototype.validateRecoveryPlan = function (plan) {
    return __awaiter(this, void 0, void 0, function () {
      var errors;
      return __generator(this, (_a) => {
        errors = [];
        if (!plan.name) errors.push("Nome é obrigatório");
        if (!plan.recovery_type) errors.push("Tipo de recuperação é obrigatório");
        if (!plan.data_sources || plan.data_sources.length === 0) {
          errors.push("Pelo menos uma fonte de dados deve ser especificada");
        }
        if (!plan.recovery_steps || plan.recovery_steps.length === 0) {
          errors.push("Pelo menos um step de recuperação deve ser especificado");
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
  RecoveryManager.prototype.checkPrerequisites = function (plan) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, prerequisite;
      return __generator(this, (_b) => {
        for (_i = 0, _a = plan.prerequisites; _i < _a.length; _i++) {
          prerequisite = _a[_i];
          // Implementar verificação de pré-requisitos
          console.log("Verificando pr\u00E9-requisito: ".concat(prerequisite));
        }
        return [2 /*return*/];
      });
    });
  };
  RecoveryManager.prototype.orderStepsByDependencies = (steps) => {
    // Implementar ordenação topológica baseada em dependências
    return steps.sort((a, b) => a.order - b.order);
  };
  RecoveryManager.prototype.prepareRecoveryStep = function (step, execution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar preparação do step
        console.log("Preparando step: ".concat(step.name));
        return [2 /*return*/];
      });
    });
  };
  RecoveryManager.prototype.cleanupRecoveryStep = function (step, execution) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar limpeza do step
        console.log("Limpando step: ".concat(step.name));
        return [2 /*return*/];
      });
    });
  };
  RecoveryManager.prototype.validateRecoveryStep = function (step) {
    return __awaiter(this, void 0, void 0, function () {
      var errors, warnings;
      return __generator(this, (_a) => {
        errors = [];
        warnings = [];
        if (!step.name) errors.push("Nome do step é obrigatório");
        if (!step.data_source) errors.push("Data source é obrigatório");
        if (!step.backup_location) errors.push("Localização do backup é obrigatória");
        return [2 /*return*/, { valid: errors.length === 0, errors: errors, warnings: warnings }];
      });
    });
  };
  RecoveryManager.prototype.validateStepDependencies = function (steps) {
    return __awaiter(this, void 0, void 0, function () {
      var errors, stepIds, _i, steps_1, step, _a, _b, dependency;
      return __generator(this, (_c) => {
        errors = [];
        stepIds = new Set(steps.map((s) => s.id));
        for (_i = 0, steps_1 = steps; _i < steps_1.length; _i++) {
          step = steps_1[_i];
          for (_a = 0, _b = step.dependencies; _a < _b.length; _a++) {
            dependency = _b[_a];
            if (!stepIds.has(dependency)) {
              errors.push(
                "Depend\u00EAncia n\u00E3o encontrada: "
                  .concat(dependency, " para step ")
                  .concat(step.id),
              );
            }
          }
        }
        return [2 /*return*/, { valid: errors.length === 0, errors: errors }];
      });
    });
  };
  RecoveryManager.prototype.validateBackupAvailability = function (plan) {
    return __awaiter(this, void 0, void 0, function () {
      var errors, _i, _a, step, exists;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            errors = [];
            (_i = 0), (_a = plan.recovery_steps);
            _b.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 4];
            step = _a[_i];
            if (!(step.type === "restore")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.checkBackupExists(step.backup_location)];
          case 2:
            exists = _b.sent();
            if (!exists) {
              errors.push("Backup n\u00E3o encontrado: ".concat(step.backup_location));
            }
            _b.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/, { valid: errors.length === 0, errors: errors }];
        }
      });
    });
  };
  RecoveryManager.prototype.checkBackupExists = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar verificação de existência do backup
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  RecoveryManager.prototype.getRecoveryTrends = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      var trends, days, i, date;
      return __generator(this, (_a) => {
        trends = [];
        days = period === "month" ? 30 : period === "week" ? 7 : 1;
        for (i = days - 1; i >= 0; i--) {
          date = new Date();
          date.setDate(date.getDate() - i);
          trends.push({
            date: date.toISOString().split("T")[0],
            count: Math.floor(Math.random() * 10),
            success_rate: 80 + Math.random() * 20,
          });
        }
        return [2 /*return*/, trends];
      });
    });
  };
  RecoveryManager.prototype.getDataSourcePerformance = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar cálculo de performance por data source
        return [
          2 /*return*/,
          [
            { data_source: "database", avg_duration_minutes: 45, success_rate: 95 },
            { data_source: "filesystem", avg_duration_minutes: 30, success_rate: 90 },
            { data_source: "configurations", avg_duration_minutes: 10, success_rate: 98 },
          ],
        ];
      });
    });
  };
  RecoveryManager.prototype.validateChecksum = function (target) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  RecoveryManager.prototype.validateIntegrity = function (target) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  RecoveryManager.prototype.validateConnectivity = function (target) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  RecoveryManager.prototype.validatePerformance = function (target) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        return [2 /*return*/, Math.random() * 100]; // Simulado
      });
    });
  };
  RecoveryManager.prototype.executeCustomValidation = function (script) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementar execução de script customizado
        return [2 /*return*/, true]; // Simulado
      });
    });
  };
  // Métodos de persistência
  RecoveryManager.prototype.saveRecoveryPlan = function (plan) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("recovery_plans").insert({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                recovery_type: plan.recovery_type,
                target_timestamp: plan.target_timestamp.toISOString(),
                data_sources: plan.data_sources,
                recovery_steps: plan.recovery_steps,
                estimated_duration_minutes: plan.estimated_duration_minutes,
                prerequisites: plan.prerequisites,
                rollback_plan: plan.rollback_plan,
                validation_checks: plan.validation_checks,
                metadata: plan.metadata,
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
  RecoveryManager.prototype.getRecoveryPlan = function (planId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("recovery_plans").select("*").eq("id", planId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") return [2 /*return*/, null];
              throw error;
            }
            return [2 /*return*/, this.mapDatabaseToRecoveryPlan(data)];
        }
      });
    });
  };
  RecoveryManager.prototype.saveRecoveryExecution = function (execution) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("recovery_executions").insert({
                id: execution.id,
                plan_id: execution.plan_id,
                status: execution.status,
                started_at: execution.started_at.toISOString(),
                completed_at:
                  (_a = execution.completed_at) === null || _a === void 0
                    ? void 0
                    : _a.toISOString(),
                current_step: execution.current_step,
                progress_percentage: execution.progress_percentage,
                steps_completed: execution.steps_completed,
                steps_total: execution.steps_total,
                errors: execution.errors,
                warnings: execution.warnings,
                rollback_executed: execution.rollback_executed,
                validation_results: execution.validation_results,
                estimated_completion: execution.estimated_completion.toISOString(),
                actual_duration_minutes: execution.actual_duration_minutes,
                executed_by: execution.executed_by,
                metadata: execution.metadata,
              }),
            ];
          case 1:
            error = _b.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.updateRecoveryExecution = function (execution) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("recovery_executions")
                .update({
                  status: execution.status,
                  completed_at:
                    (_a = execution.completed_at) === null || _a === void 0
                      ? void 0
                      : _a.toISOString(),
                  current_step: execution.current_step,
                  progress_percentage: execution.progress_percentage,
                  steps_completed: execution.steps_completed,
                  errors: execution.errors,
                  warnings: execution.warnings,
                  rollback_executed: execution.rollback_executed,
                  validation_results: execution.validation_results,
                  actual_duration_minutes: execution.actual_duration_minutes,
                  metadata: execution.metadata,
                })
                .eq("id", execution.id),
            ];
          case 1:
            error = _b.sent().error;
            if (error) throw error;
            return [2 /*return*/];
        }
      });
    });
  };
  RecoveryManager.prototype.mapDatabaseToRecoveryPlan = (data) => ({
    id: data.id,
    name: data.name,
    description: data.description,
    recovery_type: data.recovery_type,
    target_timestamp: new Date(data.target_timestamp),
    data_sources: data.data_sources || [],
    recovery_steps: data.recovery_steps || [],
    estimated_duration_minutes: data.estimated_duration_minutes || 0,
    prerequisites: data.prerequisites || [],
    rollback_plan: data.rollback_plan || [],
    validation_checks: data.validation_checks || [],
    metadata: data.metadata || {},
  });
  RecoveryManager.prototype.mapDatabaseToRecoveryExecution = (data) => ({
    id: data.id,
    plan_id: data.plan_id,
    status: data.status,
    started_at: new Date(data.started_at),
    completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
    current_step: data.current_step,
    progress_percentage: data.progress_percentage || 0,
    steps_completed: data.steps_completed || 0,
    steps_total: data.steps_total || 0,
    errors: data.errors || [],
    warnings: data.warnings || [],
    rollback_executed: data.rollback_executed || false,
    validation_results: data.validation_results || [],
    estimated_completion: new Date(data.estimated_completion),
    actual_duration_minutes: data.actual_duration_minutes,
    executed_by: data.executed_by,
    metadata: data.metadata || {},
  });
  return RecoveryManager;
})();
exports.RecoveryManager = RecoveryManager;
exports.default = RecoveryManager;
