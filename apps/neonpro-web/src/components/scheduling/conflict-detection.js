/**
 * Conflict Detection Component
 * Story 2.2: Intelligent conflict detection and resolution
 *
 * React component for real-time conflict detection in appointment scheduling
 */
"use client";
"use strict";
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
exports.default = ConflictDetection;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
function ConflictDetection(_a) {
  var _this = this;
  var appointmentStart = _a.appointmentStart,
    appointmentEnd = _a.appointmentEnd,
    professionalId = _a.professionalId,
    treatmentType = _a.treatmentType,
    roomId = _a.roomId,
    equipmentIds = _a.equipmentIds,
    onConflictDetected = _a.onConflictDetected,
    onResolutionSelected = _a.onResolutionSelected,
    _b = _a.autoDetect,
    autoDetect = _b === void 0 ? true : _b;
  var _c = (0, react_1.useState)(null),
    detectionResult = _c[0],
    setDetectionResult = _c[1];
  var _d = (0, react_1.useState)(false),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  var _f = (0, react_1.useState)(null),
    selectedResolution = _f[0],
    setSelectedResolution = _f[1];
  var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
  // Auto-detect conflicts when props change
  (0, react_1.useEffect)(
    function () {
      if (autoDetect && appointmentStart && appointmentEnd && professionalId && treatmentType) {
        detectConflicts();
      }
    },
    [
      appointmentStart,
      appointmentEnd,
      professionalId,
      treatmentType,
      roomId,
      equipmentIds,
      autoDetect,
    ],
  );
  var detectConflicts = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, errorData, result, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            setError(null);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            return [
              4 /*yield*/,
              fetch("/api/scheduling/conflicts/detect", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  appointmentStart: appointmentStart.toISOString(),
                  appointmentEnd: appointmentEnd.toISOString(),
                  professionalId: professionalId,
                  treatmentType: treatmentType,
                  roomId: roomId,
                  equipmentIds: equipmentIds,
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            throw new Error(errorData.error || "Failed to detect conflicts");
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            result = _a.sent();
            setDetectionResult(result.data);
            if (onConflictDetected) {
              onConflictDetected(result.data);
            }
            return [3 /*break*/, 8];
          case 6:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "An unexpected error occurred");
            return [3 /*break*/, 8];
          case 7:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleResolutionSelect = function (option) {
    setSelectedResolution(option);
    if (onResolutionSelected) {
      onResolutionSelected(option);
    }
  };
  var getSeverityColor = function (severity) {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getConflictTypeIcon = function (type) {
    switch (type) {
      case "time":
        return <lucide_react_1.Clock className="w-4 h-4" />;
      case "staff":
        return <lucide_react_1.Users className="w-4 h-4" />;
      case "room":
        return <lucide_react_1.MapPin className="w-4 h-4" />;
      case "equipment":
        return <lucide_react_1.AlertTriangle className="w-4 h-4" />;
      case "business_rules":
        return <lucide_react_1.XCircle className="w-4 h-4" />;
      default:
        return <lucide_react_1.AlertTriangle className="w-4 h-4" />;
    }
  };
  var getImpactColor = function (impact) {
    switch (impact) {
      case "minimal":
        return "bg-green-100 text-green-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "significant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="space-y-6">
      {/* Conflict Detection Header */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                {isLoading
                  ? <lucide_react_1.RefreshCw className="w-5 h-5 animate-spin" />
                  : (
                        detectionResult === null || detectionResult === void 0
                          ? void 0
                          : detectionResult.hasConflicts
                      )
                    ? <lucide_react_1.XCircle className="w-5 h-5 text-red-500" />
                    : detectionResult && !detectionResult.hasConflicts
                      ? <lucide_react_1.CheckCircle className="w-5 h-5 text-green-500" />
                      : <lucide_react_1.AlertTriangle className="w-5 h-5 text-gray-500" />}
                Conflict Detection
              </card_1.CardTitle>
              <card_1.CardDescription>
                {isLoading
                  ? "Analyzing potential scheduling conflicts..."
                  : (
                        detectionResult === null || detectionResult === void 0
                          ? void 0
                          : detectionResult.hasConflicts
                      )
                    ? "Found ".concat(
                        detectionResult.conflicts.length,
                        " conflict(s) that require attention",
                      )
                    : detectionResult && !detectionResult.hasConflicts
                      ? "No conflicts detected - appointment can be scheduled"
                      : "Check for scheduling conflicts before confirming appointment"}
              </card_1.CardDescription>
            </div>
            <button_1.Button
              onClick={detectConflicts}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading
                ? <lucide_react_1.RefreshCw className="w-4 h-4 animate-spin mr-2" />
                : <lucide_react_1.RefreshCw className="w-4 h-4 mr-2" />}
              Re-check
            </button_1.Button>
          </div>
        </card_1.CardHeader>

        {detectionResult && (
          <card_1.CardFooter>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Processing time: {detectionResult.processingTimeMs}ms</span>
              <separator_1.Separator orientation="vertical" className="h-4" />
              <span>
                {detectionResult.conflicts.length} conflict
                {detectionResult.conflicts.length !== 1 ? "s" : ""} found
              </span>
              <separator_1.Separator orientation="vertical" className="h-4" />
              <span>
                {detectionResult.resolutionOptions.length} resolution option
                {detectionResult.resolutionOptions.length !== 1 ? "s" : ""} available
              </span>
            </div>
          </card_1.CardFooter>
        )}
      </card_1.Card>

      {/* Error Display */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertTitle>Error</alert_1.AlertTitle>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Conflicts List */}
      {(detectionResult === null || detectionResult === void 0
        ? void 0
        : detectionResult.hasConflicts) && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-red-600">Detected Conflicts</card_1.CardTitle>
            <card_1.CardDescription>
              The following conflicts need to be resolved before scheduling this appointment:
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {detectionResult.conflicts.map(function (conflict) {
                return (
                  <div key={conflict.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getConflictTypeIcon(conflict.type)}
                        <span className="font-medium capitalize">{conflict.type} Conflict</span>
                      </div>
                      <badge_1.Badge className={getSeverityColor(conflict.severity)}>
                        {conflict.severity}
                      </badge_1.Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{conflict.conflictDescription}</p>

                    {conflict.suggestedActions.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Suggested actions:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {conflict.suggestedActions.map(function (action, index) {
                            return (
                              <badge_1.Badge key={index} variant="outline" className="text-xs">
                                {action.replace("_", " ")}
                              </badge_1.Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}

      {/* Resolution Options */}
      {(detectionResult === null || detectionResult === void 0
        ? void 0
        : detectionResult.resolutionOptions) &&
        detectionResult.resolutionOptions.length > 0 && (
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-blue-600">Resolution Options</card_1.CardTitle>
              <card_1.CardDescription>
                Choose from the following AI-recommended solutions:
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {detectionResult.resolutionOptions.map(function (option) {
                  return (
                    <div
                      key={option.id}
                      className={"border rounded-lg p-4 cursor-pointer transition-all ".concat(
                        (selectedResolution === null || selectedResolution === void 0
                          ? void 0
                          : selectedResolution.id) === option.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-300",
                      )}
                      onClick={function () {
                        return handleResolutionSelect(option);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium capitalize">{option.type} Solution</span>
                          <div className="flex items-center gap-2 mt-1">
                            <badge_1.Badge variant="outline">
                              {Math.round(option.confidence * 100)}% confidence
                            </badge_1.Badge>
                            <badge_1.Badge className={getImpactColor(option.impact)}>
                              {option.impact} impact
                            </badge_1.Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          ~{Math.round(option.estimatedResolutionTime / 60)}min to resolve
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>

                      {option.alternativeSlots && option.alternativeSlots.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Alternative times available:</span>
                          <span className="text-gray-600 ml-1">
                            {option.alternativeSlots.length} option
                            {option.alternativeSlots.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {option.resourceAlternatives && option.resourceAlternatives.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Alternative resources available:</span>
                          <span className="text-gray-600 ml-1">
                            {option.resourceAlternatives.length} option
                            {option.resourceAlternatives.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>

            {selectedResolution && (
              <card_1.CardFooter>
                <button_1.Button
                  onClick={function () {
                    return handleResolutionSelect(selectedResolution);
                  }}
                  className="w-full"
                >
                  Apply {selectedResolution.type} Solution
                </button_1.Button>
              </card_1.CardFooter>
            )}
          </card_1.Card>
        )}

      {/* Success State */}
      {detectionResult && !detectionResult.hasConflicts && (
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="text-center">
              <lucide_react_1.CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">No Conflicts Detected</h3>
              <p className="text-sm text-gray-600">
                This appointment can be scheduled without any conflicts. All resources are available
                and business rules are satisfied.
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      )}
    </div>
  );
}
