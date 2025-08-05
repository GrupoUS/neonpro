'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientPreferenceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var alert_1 = require("@/components/ui/alert");
function PatientPreferenceDashboard() {
    var _this = this;
    var _a = (0, react_1.useState)(''), patientId = _a[0], setPatientId = _a[1];
    var _b = (0, react_1.useState)(false), includeHistory = _b[0], setIncludeHistory = _b[1];
    var _c = (0, react_1.useState)(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(null), preferences = _e[0], setPreferences = _e[1];
    var _f = (0, react_1.useState)(null), confidenceMetrics = _f[0], setConfidenceMetrics = _f[1];
    var _g = (0, react_1.useState)(null), learnedPatterns = _g[0], setLearnedPatterns = _g[1];
    var _h = (0, react_1.useState)([]), learningHistory = _h[0], setLearningHistory = _h[1];
    var _j = (0, react_1.useState)(false), isUpdatingPreferences = _j[0], setIsUpdatingPreferences = _j[1];
    var _k = (0, react_1.useState)(null), updateError = _k[0], setUpdateError = _k[1];
    var _l = (0, react_1.useState)(false), updateSuccess = _l[0], setUpdateSuccess = _l[1];
    var loadPatientPreferences = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!patientId) {
                        setError('Please enter a patient ID');
                        return [2 /*return*/];
                    }
                    setIsLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/ai/scheduling/preferences?patient_id=".concat(patientId, "&include_history=").concat(includeHistory))];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to load patient preferences');
                    }
                    setPreferences(data.data.patient_preferences);
                    setConfidenceMetrics(data.data.confidence_metrics);
                    setLearnedPatterns(data.data.learned_patterns);
                    if (includeHistory && data.data.learning_history) {
                        setLearningHistory(data.data.learning_history);
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'Failed to load patient preferences');
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var updatePatientPreferences = function (learningData) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsUpdatingPreferences(true);
                    setUpdateError(null);
                    setUpdateSuccess(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, fetch('/api/ai/scheduling/preferences', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                patient_id: patientId,
                                learning_data: learningData
                            }),
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to update preferences');
                    }
                    setUpdateSuccess(true);
                    // Reload preferences to see updates
                    return [4 /*yield*/, loadPatientPreferences()];
                case 4:
                    // Reload preferences to see updates
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    err_2 = _a.sent();
                    setUpdateError(err_2 instanceof Error ? err_2.message : 'Failed to update preferences');
                    return [3 /*break*/, 7];
                case 6:
                    setIsUpdatingPreferences(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getConfidenceColor = function (score) {
        if (score >= 0.8)
            return 'text-green-600';
        if (score >= 0.6)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    var getProgressColor = function (score) {
        if (score >= 80)
            return 'bg-green-500';
        if (score >= 60)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BrainIcon className="h-5 w-5"/>
            Patient Preference Learning Dashboard
          </card_1.CardTitle>
          <card_1.CardDescription>
            View and manage AI-learned patient scheduling preferences and behavioral patterns
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="patient-id">Patient ID</label_1.Label>
              <input_1.Input id="patient-id" value={patientId} onChange={function (e) { return setPatientId(e.target.value); }} placeholder="Enter patient ID"/>
            </div>
            <div className="space-y-2">
              <label_1.Label>Options</label_1.Label>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="include-history" checked={includeHistory} onChange={function (e) { return setIncludeHistory(e.target.checked); }}/>
                <label_1.Label htmlFor="include-history" className="text-sm">Include learning history</label_1.Label>
              </div>
            </div>
            <div className="space-y-2">
              <label_1.Label>&nbsp;</label_1.Label>
              <button_1.Button onClick={loadPatientPreferences} disabled={isLoading} className="w-full">
                {isLoading ? 'Loading...' : 'Load Preferences'}
              </button_1.Button>
            </div>
          </div>

          {error && (<alert_1.Alert className="border-red-200 bg-red-50">
              <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
            </alert_1.Alert>)}

          {updateSuccess && (<alert_1.Alert className="border-green-200 bg-green-50">
              <alert_1.AlertDescription>Patient preferences updated successfully!</alert_1.AlertDescription>
            </alert_1.Alert>)}

          {updateError && (<alert_1.Alert className="border-red-200 bg-red-50">
              <alert_1.AlertDescription>{updateError}</alert_1.AlertDescription>
            </alert_1.Alert>)}
        </card_1.CardContent>
      </card_1.Card>

      {preferences && confidenceMetrics && learnedPatterns && (<div className="space-y-6">
          {/* Confidence Metrics Overview */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.TargetIcon className="h-5 w-5"/>
                AI Learning Confidence Metrics
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Confidence</span>
                    <span className={"text-sm font-bold ".concat(getConfidenceColor(confidenceMetrics.overall_confidence))}>
                      {Math.round(confidenceMetrics.overall_confidence * 100)}%
                    </span>
                  </div>
                  <progress_1.Progress value={confidenceMetrics.overall_confidence * 100} className="h-2"/>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Preference Reliability</span>
                    <span className={"text-sm font-bold ".concat(getConfidenceColor(confidenceMetrics.preference_reliability))}>
                      {Math.round(confidenceMetrics.preference_reliability * 100)}%
                    </span>
                  </div>
                  <progress_1.Progress value={confidenceMetrics.preference_reliability * 100} className="h-2"/>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span className={"text-sm font-bold ".concat(getConfidenceColor(confidenceMetrics.data_completeness))}>
                      {Math.round(confidenceMetrics.data_completeness * 100)}%
                    </span>
                  </div>
                  <progress_1.Progress value={confidenceMetrics.data_completeness * 100} className="h-2"/>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Learned Patterns */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.TrendingUpIcon className="h-5 w-5"/>
                Learned Behavioral Patterns
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <tabs_1.Tabs defaultValue="time" className="space-y-4">
                <tabs_1.TabsList className="grid w-full grid-cols-4">
                  <tabs_1.TabsTrigger value="time">Time Preferences</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="staff">Staff Preferences</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="treatment">Treatment Patterns</tabs_1.TabsTrigger>
                  <tabs_1.TabsTrigger value="behavior">Scheduling Behaviors</tabs_1.TabsTrigger>
                </tabs_1.TabsList>

                <tabs_1.TabsContent value="time" className="space-y-3">
                  {learnedPatterns.time_preferences.map(function (pattern, index) { return (<div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{pattern.pattern}</div>
                        <div className="text-sm text-gray-600">Observed {pattern.frequency} times</div>
                      </div>
                      <badge_1.Badge className={getConfidenceColor(pattern.confidence)}>
                        {Math.round(pattern.confidence * 100)}% confidence
                      </badge_1.Badge>
                    </div>); })}
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="staff" className="space-y-3">
                  {learnedPatterns.staff_preferences.map(function (staff, index) { return (<div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <lucide_react_1.UserIcon className="h-4 w-4 text-gray-500"/>
                        <div>
                          <div className="font-medium">{staff.staff_name}</div>
                          <div className="text-sm text-gray-600">{staff.interaction_count} interactions</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Preference: {Math.round(staff.preference_strength * 100)}%</div>
                        <div className="text-sm text-gray-600">ID: {staff.staff_id}</div>
                      </div>
                    </div>); })}
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="treatment" className="space-y-3">
                  {learnedPatterns.treatment_preferences.map(function (treatment, index) { return (<div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{treatment.treatment_type}</div>
                        <div className="text-sm text-gray-600">Optimal timing: {treatment.optimal_timing}</div>
                      </div>
                      <badge_1.Badge className={getConfidenceColor(treatment.preference_score)}>
                        {Math.round(treatment.preference_score * 100)}% preference
                      </badge_1.Badge>
                    </div>); })}
                </tabs_1.TabsContent>

                <tabs_1.TabsContent value="behavior" className="space-y-3">
                  {learnedPatterns.scheduling_behaviors.map(function (behavior, index) { return (<div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{behavior.behavior}</div>
                        <div className="text-sm text-gray-600">Frequency: {behavior.frequency}%</div>
                      </div>
                      <badge_1.Badge className={getConfidenceColor(behavior.reliability)}>
                        {Math.round(behavior.reliability * 100)}% reliable
                      </badge_1.Badge>
                    </div>); })}
                </tabs_1.TabsContent>
              </tabs_1.Tabs>
            </card_1.CardContent>
          </card_1.Card>

          {/* Learning History */}
          {includeHistory && learningHistory.length > 0 && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.HistoryIcon className="h-5 w-5"/>
                  Learning History
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Timeline of AI learning updates and preference changes
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {learningHistory.map(function (entry, index) { return (<div key={index} className="flex justify-between items-start p-3 border-l-4 border-l-blue-500 bg-blue-50">
                      <div>
                        <div className="font-medium">{entry.learning_type}</div>
                        <div className="text-sm text-gray-600">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                      </div>
                      <badge_1.Badge variant="outline">{entry.impact_level}</badge_1.Badge>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>)}
    </div>);
}
