// =====================================================
// NeonPro Intelligent Allocation Engine
// Story 2.4: Smart Resource Management - Task 2
// =====================================================
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
exports.AllocationEngine = void 0;
var resource_manager_1 = require("./resource-manager");
// =====================================================
// Intelligent Allocation Engine
// =====================================================
var AllocationEngine = /** @class */ (() => {
  function AllocationEngine() {
    this.resourceManager = new resource_manager_1.ResourceManager();
  }
  // =====================================================
  // Core Allocation Intelligence
  // =====================================================
  AllocationEngine.prototype.suggestOptimalAllocation = function (clinicId, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var availableResources, suggestions, conflicts, optimizationMetrics, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            console.log("Starting optimal allocation suggestion for:", criteria);
            return [
              4 /*yield*/,
              this.resourceManager.getAvailableResources(
                clinicId,
                criteria.startTime,
                criteria.endTime,
                criteria.resourceType,
                criteria.requirements,
              ),
            ];
          case 1:
            availableResources = _a.sent();
            console.log("Found ".concat(availableResources.length, " available resources"));
            return [4 /*yield*/, this.scoreResources(availableResources, criteria)];
          case 2:
            suggestions = _a.sent();
            return [
              4 /*yield*/,
              this.analyzeSystemConflicts(clinicId, criteria.startTime, criteria.endTime),
            ];
          case 3:
            conflicts = _a.sent();
            return [4 /*yield*/, this.calculateOptimizationMetrics(clinicId, suggestions)];
          case 4:
            optimizationMetrics = _a.sent();
            return [
              2 /*return*/,
              {
                suggestions: suggestions,
                conflicts: conflicts,
                optimization_metrics: optimizationMetrics,
              },
            ];
          case 5:
            error_1 = _a.sent();
            console.error("Error in optimal allocation suggestion:", error_1);
            throw new Error("Failed to suggest optimal allocation");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  AllocationEngine.prototype.scoreResources = function (resources, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions,
        _i,
        resources_1,
        resource,
        score,
        confidence,
        reasoning,
        estimatedCost,
        utilizationImpact;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suggestions = [];
            (_i = 0), (resources_1 = resources);
            _a.label = 1;
          case 1:
            if (!(_i < resources_1.length)) return [3 /*break*/, 5];
            resource = resources_1[_i];
            return [4 /*yield*/, this.calculateResourceScore(resource, criteria)];
          case 2:
            score = _a.sent();
            confidence = this.calculateConfidence(resource, criteria);
            reasoning = this.generateReasoning(resource, criteria, score);
            estimatedCost = this.calculateEstimatedCost(resource, criteria);
            return [4 /*yield*/, this.calculateUtilizationImpact(resource, criteria)];
          case 3:
            utilizationImpact = _a.sent();
            suggestions.push({
              resource: resource,
              confidence: confidence,
              score: score,
              reasoning: reasoning,
              estimatedCost: estimatedCost,
              utilizationImpact: utilizationImpact,
            });
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            // Sort by score (highest first)
            return [2 /*return*/, suggestions.sort((a, b) => b.score - a.score)];
        }
      });
    });
  };
  AllocationEngine.prototype.calculateResourceScore = function (resource, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var score,
        req,
        resourceSkills_1,
        matchedSkills,
        skillScore,
        resourceEquipment_1,
        matchedEquipment,
        equipmentScore,
        pref,
        costFactor,
        currentUtilization,
        workload,
        maintenanceDate,
        appointmentDate,
        daysUntilMaintenance;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            score = 100;
            // Factor 1: Resource type match (perfect match = no penalty)
            if (resource.type !== criteria.resourceType) {
              score -= 50;
            }
            // Factor 2: Requirements matching
            if (criteria.requirements) {
              req = criteria.requirements;
              // Category match
              if (req.category && resource.category !== req.category) {
                score -= 20;
              }
              // Capacity requirements
              if (req.capacity && resource.capacity < req.capacity) {
                score -= 30;
              }
              // Skills matching (for staff)
              if (req.skills && resource.type === "staff") {
                resourceSkills_1 = resource.skills || [];
                matchedSkills = req.skills.filter((skill) => resourceSkills_1.includes(skill));
                skillScore = (matchedSkills.length / req.skills.length) * 20;
                score += skillScore;
              }
              // Equipment requirements (for rooms)
              if (req.equipment && resource.type === "room") {
                resourceEquipment_1 = resource.equipment_ids || [];
                matchedEquipment = req.equipment.filter((eq) => resourceEquipment_1.includes(eq));
                equipmentScore = (matchedEquipment.length / req.equipment.length) * 15;
                score += equipmentScore;
              }
            }
            // Factor 3: Preferences
            if (criteria.preferences) {
              pref = criteria.preferences;
              // Preferred resources bonus
              if (
                (_a = pref.preferredResources) === null || _a === void 0
                  ? void 0
                  : _a.includes(resource.id)
              ) {
                score += 25;
              }
              // Avoided resources penalty
              if (
                (_b = pref.avoidResources) === null || _b === void 0
                  ? void 0
                  : _b.includes(resource.id)
              ) {
                score -= 40;
              }
              // Cost optimization
              if (pref.costOptimization && resource.cost_per_hour) {
                costFactor = Math.max(0, 100 - resource.cost_per_hour);
                score += costFactor * 0.1;
              }
            }
            return [4 /*yield*/, this.getCurrentUtilization(resource.id)];
          case 1:
            currentUtilization = _c.sent();
            if (currentUtilization < 50) {
              score += 10; // Bonus for underutilized resources
            } else if (currentUtilization > 90) {
              score -= 15; // Penalty for overutilized resources
            }
            if (!(resource.type === "staff")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.getStaffWorkload(resource.id, criteria.startTime)];
          case 2:
            workload = _c.sent();
            if (workload.fatigue_score > 80) {
              score -= 25; // High fatigue penalty
            } else if (workload.fatigue_score < 30) {
              score += 15; // Well-rested bonus
            }
            _c.label = 3;
          case 3:
            // Factor 6: Equipment maintenance status
            if (resource.type === "equipment" && resource.next_maintenance) {
              maintenanceDate = new Date(resource.next_maintenance);
              appointmentDate = new Date(criteria.startTime);
              daysUntilMaintenance = Math.ceil(
                (maintenanceDate.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24),
              );
              if (daysUntilMaintenance <= 3) {
                score -= 30; // Close to maintenance
              } else if (daysUntilMaintenance <= 7) {
                score -= 10; // Moderate risk
              }
            }
            return [2 /*return*/, Math.max(0, Math.min(100, score))];
        }
      });
    });
  };
  AllocationEngine.prototype.calculateConfidence = (resource, criteria) => {
    var confidence = 100;
    // Reduce confidence based on missing information
    if (!resource.specifications) confidence -= 5;
    if (!resource.usage_instructions) confidence -= 5;
    // Reduce confidence for complex requirements
    if (criteria.requirements) {
      var reqCount = Object.keys(criteria.requirements).length;
      if (reqCount > 3) confidence -= reqCount * 3;
    }
    // Reduce confidence for strict business rules
    if (criteria.businessRules) {
      var ruleCount = Object.keys(criteria.businessRules).length;
      confidence -= ruleCount * 5;
    }
    return Math.max(60, Math.min(100, confidence));
  };
  AllocationEngine.prototype.generateReasoning = (resource, criteria, score) => {
    var _a;
    var reasoning = [];
    if (score >= 90) {
      reasoning.push("Excellent match for all requirements");
    } else if (score >= 75) {
      reasoning.push("Good match with minor considerations");
    } else if (score >= 60) {
      reasoning.push("Adequate match with some limitations");
    } else {
      reasoning.push("Marginal match with significant considerations");
    }
    // Add specific reasoning based on resource characteristics
    if (
      resource.type === "staff" &&
      ((_a = resource.skills) === null || _a === void 0 ? void 0 : _a.length)
    ) {
      reasoning.push("Staff has ".concat(resource.skills.length, " relevant skills"));
    }
    if (resource.type === "room" && resource.amenities) {
      reasoning.push("Room has required amenities available");
    }
    if (resource.type === "equipment" && resource.last_maintenance) {
      reasoning.push("Equipment recently maintained and operational");
    }
    // Add cost consideration
    if (resource.cost_per_hour) {
      reasoning.push("Estimated cost: $".concat(resource.cost_per_hour, "/hour"));
    }
    return reasoning;
  };
  AllocationEngine.prototype.calculateEstimatedCost = (resource, criteria) => {
    var startTime = new Date(criteria.startTime);
    var endTime = new Date(criteria.endTime);
    var hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return (resource.cost_per_hour || 0) * hours;
  };
  AllocationEngine.prototype.calculateUtilizationImpact = function (resource, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var currentUtilization, startTime, endTime, hours, dailyHours, utilizationIncrease, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getCurrentUtilization(resource.id)];
          case 1:
            currentUtilization = _a.sent();
            startTime = new Date(criteria.startTime);
            endTime = new Date(criteria.endTime);
            hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
            dailyHours = 8;
            utilizationIncrease = (hours / dailyHours) * 100;
            return [2 /*return*/, currentUtilization + utilizationIncrease];
          case 2:
            error_2 = _a.sent();
            console.error("Error calculating utilization impact:", error_2);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================
  // Business Rules and Validation
  // =====================================================
  AllocationEngine.prototype.validateBusinessRules = function (allocation, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var violations,
        resource,
        rules,
        workload,
        workload,
        lastBreak,
        appointmentStart,
        minutesSinceBreak,
        workload,
        appointmentHours,
        appointmentDate,
        isHoliday,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            violations = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 11, , 12]);
            return [4 /*yield*/, this.resourceManager.getResourceById(allocation.resource_id)];
          case 2:
            resource = _a.sent();
            if (!resource) {
              violations.push("Resource not found");
              return [2 /*return*/, { valid: false, violations: violations }];
            }
            if (!criteria.businessRules) return [3 /*break*/, 10];
            rules = criteria.businessRules;
            if (!(rules.maxConsecutiveHours && resource.type === "staff")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getStaffWorkload(resource.id, allocation.start_time)];
          case 3:
            workload = _a.sent();
            if (workload.consecutive_hours >= rules.maxConsecutiveHours) {
              violations.push(
                "Exceeds maximum consecutive hours (".concat(rules.maxConsecutiveHours, ")"),
              );
            }
            _a.label = 4;
          case 4:
            if (!(rules.minimumBreak && resource.type === "staff")) return [3 /*break*/, 6];
            return [4 /*yield*/, this.getStaffWorkload(resource.id, allocation.start_time)];
          case 5:
            workload = _a.sent();
            if (workload.last_break) {
              lastBreak = new Date(workload.last_break);
              appointmentStart = new Date(allocation.start_time);
              minutesSinceBreak = (appointmentStart.getTime() - lastBreak.getTime()) / (1000 * 60);
              if (minutesSinceBreak < rules.minimumBreak) {
                violations.push(
                  "Insufficient break time (minimum ".concat(rules.minimumBreak, " minutes)"),
                );
              }
            }
            _a.label = 6;
          case 6:
            if (!(rules.maxDailyHours && resource.type === "staff")) return [3 /*break*/, 8];
            return [4 /*yield*/, this.getStaffWorkload(resource.id, allocation.start_time)];
          case 7:
            workload = _a.sent();
            appointmentHours =
              (new Date(allocation.end_time).getTime() -
                new Date(allocation.start_time).getTime()) /
              (1000 * 60 * 60);
            if (workload.total_hours + appointmentHours > rules.maxDailyHours) {
              violations.push("Exceeds maximum daily hours (".concat(rules.maxDailyHours, ")"));
            }
            _a.label = 8;
          case 8:
            if (!rules.holidayRestrictions) return [3 /*break*/, 10];
            appointmentDate = new Date(allocation.start_time);
            return [4 /*yield*/, this.isHoliday(appointmentDate)];
          case 9:
            isHoliday = _a.sent();
            if (isHoliday) {
              violations.push("Appointment scheduled on holiday");
            }
            _a.label = 10;
          case 10:
            return [2 /*return*/, { valid: violations.length === 0, violations: violations }];
          case 11:
            error_3 = _a.sent();
            console.error("Error validating business rules:", error_3);
            violations.push("Error validating business rules");
            return [2 /*return*/, { valid: false, violations: violations }];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================
  // Conflict Analysis
  // =====================================================
  AllocationEngine.prototype.analyzeSystemConflicts = function (clinicId, startTime, endTime) {
    return __awaiter(this, void 0, void 0, function () {
      var conflicts, resources, _i, resources_2, resource, resourceConflicts, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            conflicts = [];
            return [4 /*yield*/, this.resourceManager.getResources(clinicId)];
          case 1:
            resources = _a.sent();
            (_i = 0), (resources_2 = resources);
            _a.label = 2;
          case 2:
            if (!(_i < resources_2.length)) return [3 /*break*/, 5];
            resource = resources_2[_i];
            return [
              4 /*yield*/,
              this.resourceManager.detectConflicts(resource.id, startTime, endTime),
            ];
          case 3:
            resourceConflicts = _a.sent();
            if (resourceConflicts.length > 0) {
              conflicts.push({
                resource_id: resource.id,
                conflict_type: "scheduling_overlap",
                severity: resourceConflicts.length > 2 ? "high" : "medium",
                resolution_options: [
                  "Find alternative resource",
                  "Reschedule appointment",
                  "Extend appointment duration",
                  "Split into multiple sessions",
                ],
              });
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, conflicts];
          case 6:
            error_4 = _a.sent();
            console.error("Error analyzing system conflicts:", error_4);
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================
  // Optimization Metrics
  // =====================================================
  AllocationEngine.prototype.calculateOptimizationMetrics = function (clinicId, suggestions) {
    return __awaiter(this, void 0, void 0, function () {
      var totalScore, totalCost, totalUtilization, _i, suggestions_1, suggestion, count;
      return __generator(this, (_a) => {
        try {
          totalScore = 0;
          totalCost = 0;
          totalUtilization = 0;
          for (_i = 0, suggestions_1 = suggestions; _i < suggestions_1.length; _i++) {
            suggestion = suggestions_1[_i];
            totalScore += suggestion.score;
            totalCost += suggestion.estimatedCost || 0;
            totalUtilization += suggestion.utilizationImpact || 0;
          }
          count = suggestions.length || 1;
          return [
            2 /*return*/,
            {
              overall_efficiency: Math.round(totalScore / count),
              cost_efficiency: Math.round(100 - totalCost / count), // Inverse of cost
              utilization_balance: Math.round(100 - Math.abs(50 - totalUtilization / count)), // Closer to 50% = better balance
            },
          ];
        } catch (error) {
          console.error("Error calculating optimization metrics:", error);
          return [
            2 /*return*/,
            {
              overall_efficiency: 0,
              cost_efficiency: 0,
              utilization_balance: 0,
            },
          ];
        }
        return [2 /*return*/];
      });
    });
  };
  // =====================================================
  // Helper Methods
  // =====================================================
  AllocationEngine.prototype.getCurrentUtilization = function (resourceId) {
    return __awaiter(this, void 0, void 0, function () {
      var today, allocations, totalMinutes, allocatedMinutes, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            today = new Date().toISOString().split("T")[0];
            return [
              4 /*yield*/,
              this.resourceManager.getAllocations(
                resourceId,
                "".concat(today, "T00:00:00Z"),
                "".concat(today, "T23:59:59Z"),
              ),
            ];
          case 1:
            allocations = _a.sent();
            totalMinutes = 8 * 60;
            allocatedMinutes = allocations.reduce((sum, allocation) => {
              var start = new Date(allocation.start_time);
              var end = new Date(allocation.end_time);
              return sum + (end.getTime() - start.getTime()) / (1000 * 60);
            }, 0);
            return [2 /*return*/, (allocatedMinutes / totalMinutes) * 100];
          case 2:
            error_5 = _a.sent();
            console.error("Error getting current utilization:", error_5);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AllocationEngine.prototype.getStaffWorkload = function (staffId, appointmentTime) {
    return __awaiter(this, void 0, void 0, function () {
      var appointmentDate,
        allocations,
        totalHours,
        consecutiveHours,
        lastBreak,
        _i,
        allocations_1,
        allocation,
        start,
        end,
        hours,
        fatigueScore,
        staff,
        error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            appointmentDate = new Date(appointmentTime).toISOString().split("T")[0];
            return [
              4 /*yield*/,
              this.resourceManager.getAllocations(
                staffId,
                "".concat(appointmentDate, "T00:00:00Z"),
                "".concat(appointmentDate, "T23:59:59Z"),
              ),
            ];
          case 1:
            allocations = _a.sent();
            totalHours = 0;
            consecutiveHours = 0;
            lastBreak = null;
            for (_i = 0, allocations_1 = allocations; _i < allocations_1.length; _i++) {
              allocation = allocations_1[_i];
              start = new Date(allocation.start_time);
              end = new Date(allocation.end_time);
              hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
              totalHours += hours;
              // Simplified consecutive hours calculation
              if (allocation.status === "completed" || allocation.status === "in_use") {
                consecutiveHours += hours;
              }
            }
            fatigueScore = Math.min(100, (totalHours / 8) * 100);
            return [4 /*yield*/, this.resourceManager.getResourceById(staffId)];
          case 2:
            staff = _a.sent();
            return [
              2 /*return*/,
              {
                staff_id: staffId,
                name: (staff === null || staff === void 0 ? void 0 : staff.name) || "Unknown Staff",
                total_hours: totalHours,
                consecutive_hours: consecutiveHours,
                last_break: lastBreak,
                fatigue_score: fatigueScore,
                efficiency_rating: Math.max(0, 100 - fatigueScore),
                available_skills:
                  (staff === null || staff === void 0 ? void 0 : staff.skills) || [],
              },
            ];
          case 3:
            error_6 = _a.sent();
            console.error("Error getting staff workload:", error_6);
            return [
              2 /*return*/,
              {
                staff_id: staffId,
                name: "Unknown Staff",
                total_hours: 0,
                consecutive_hours: 0,
                last_break: null,
                fatigue_score: 0,
                efficiency_rating: 100,
                available_skills: [],
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AllocationEngine.prototype.isHoliday = function (date) {
    return __awaiter(this, void 0, void 0, function () {
      var dayOfWeek;
      return __generator(this, (_a) => {
        dayOfWeek = date.getDay();
        return [2 /*return*/, dayOfWeek === 0 || dayOfWeek === 6]; // Weekend
      });
    });
  };
  // =====================================================
  // Advanced Allocation Strategies
  // =====================================================
  AllocationEngine.prototype.optimizeStaffWorkload = function (clinicId, date) {
    return __awaiter(this, void 0, void 0, function () {
      var staffResources,
        recommendations,
        totalImprovement,
        _i,
        staffResources_1,
        staff,
        workload,
        optimalWorkload,
        currentWorkload,
        actions,
        error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.resourceManager.getResources(clinicId, { type: "staff" })];
          case 1:
            staffResources = _a.sent();
            recommendations = [];
            totalImprovement = 0;
            (_i = 0), (staffResources_1 = staffResources);
            _a.label = 2;
          case 2:
            if (!(_i < staffResources_1.length)) return [3 /*break*/, 5];
            staff = staffResources_1[_i];
            return [4 /*yield*/, this.getStaffWorkload(staff.id, "".concat(date, "T09:00:00Z"))];
          case 3:
            workload = _a.sent();
            optimalWorkload = 7;
            currentWorkload = workload.total_hours;
            actions = [];
            if (currentWorkload < 5) {
              actions.push("Add more appointments to increase utilization");
              actions.push("Consider cross-training for additional services");
              totalImprovement += (optimalWorkload - currentWorkload) * 10;
            } else if (currentWorkload > 8) {
              actions.push("Redistribute appointments to other staff");
              actions.push("Consider adding break time");
              totalImprovement += (currentWorkload - optimalWorkload) * 5;
            } else {
              actions.push("Workload is optimal");
            }
            recommendations.push({
              staff_id: staff.id,
              current_workload: currentWorkload,
              optimal_workload: optimalWorkload,
              rebalancing_actions: actions,
            });
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [
              2 /*return*/,
              {
                recommendations: recommendations,
                efficiency_improvement: Math.round(totalImprovement / staffResources.length),
              },
            ];
          case 6:
            error_7 = _a.sent();
            console.error("Error optimizing staff workload:", error_7);
            throw new Error("Failed to optimize staff workload");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return AllocationEngine;
})();
exports.AllocationEngine = AllocationEngine;
