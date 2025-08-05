/**
 * AI Duration Prediction Component
 *
 * Provides intelligent appointment duration suggestions with confidence indicators
 * and manual override capabilities. Integrates with A/B testing framework.
 */
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
exports.default = AIDurationPrediction;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function AIDurationPrediction(_a) {
    var _this = this;
    var appointmentId = _a.appointmentId, treatmentType = _a.treatmentType, professionalId = _a.professionalId, patientAge = _a.patientAge, _b = _a.isFirstVisit, isFirstVisit = _b === void 0 ? false : _b, historicalDuration = _a.historicalDuration, onDurationSelected = _a.onDurationSelected, onOverride = _a.onOverride, _c = _a.className, className = _c === void 0 ? '' : _c;
    // State
    var _d = (0, react_1.useState)(null), prediction = _d[0], setPrediction = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(0), manualDuration = _g[0], setManualDuration = _g[1];
    var _h = (0, react_1.useState)(''), overrideReason = _h[0], setOverrideReason = _h[1];
    var _j = (0, react_1.useState)(false), useManualOverride = _j[0], setUseManualOverride = _j[1];
    var _k = (0, react_1.useState)(false), showAdvancedOptions = _k[0], setShowAdvancedOptions = _k[1];
    // Advanced options state
    var _l = (0, react_1.useState)('medium'), anxietyLevel = _l[0], setAnxietyLevel = _l[1];
    var _m = (0, react_1.useState)('standard'), treatmentComplexity = _m[0], setTreatmentComplexity = _m[1];
    var _o = (0, react_1.useState)(''), specialRequirements = _o[0], setSpecialRequirements = _o[1];
    // Get current time info
    var now = new Date();
    var timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    var dayOfWeek = now.getDay();
    // Generate prediction on component mount and when key props change
    (0, react_1.useEffect)(function () {
        if (appointmentId && treatmentType && professionalId) {
            generatePrediction();
        }
    }, [appointmentId, treatmentType, professionalId, patientAge, isFirstVisit, historicalDuration]);
    /**
     * Generate AI duration prediction
     */
    var generatePrediction = function () { return __awaiter(_this, void 0, void 0, function () {
        var requestData, response, data, err_1, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    setError(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    requestData = {
                        appointmentId: appointmentId,
                        treatmentType: treatmentType,
                        professionalId: professionalId,
                        patientAge: patientAge,
                        isFirstVisit: isFirstVisit,
                        patientAnxietyLevel: anxietyLevel,
                        treatmentComplexity: treatmentComplexity,
                        timeOfDay: timeOfDay,
                        dayOfWeek: dayOfWeek,
                        historicalDuration: historicalDuration,
                        specialRequirements: specialRequirements ? specialRequirements.split(',').map(function (s) { return s.trim(); }) : []
                    };
                    return [4 /*yield*/, fetch('/api/ai/predict-duration', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(requestData)
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (!data.success) {
                        throw new Error(data.error || 'Failed to generate prediction');
                    }
                    setPrediction(data.prediction || null);
                    if (data.prediction) {
                        setManualDuration(data.prediction.predictedDuration);
                        // Auto-select AI prediction if confidence is high enough
                        if (data.prediction.confidenceScore >= 0.8 && !useManualOverride) {
                            onDurationSelected(data.prediction.predictedDuration, data.prediction.isAIPrediction);
                        }
                    }
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _a.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error occurred';
                    setError(errorMessage);
                    sonner_1.toast.error('Prediction failed', { description: errorMessage });
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    /**
     * Handle duration selection
     */
    var handleDurationSelect = function () {
        var selectedDuration = useManualOverride ? manualDuration : (prediction === null || prediction === void 0 ? void 0 : prediction.predictedDuration) || 30;
        var isAI = !useManualOverride && (prediction === null || prediction === void 0 ? void 0 : prediction.isAIPrediction);
        onDurationSelected(selectedDuration, isAI || false);
        if (useManualOverride && overrideReason && onOverride) {
            onOverride(overrideReason);
        }
        sonner_1.toast.success('Duration selected', {
            description: "".concat(selectedDuration, " minutes ").concat(isAI ? '(AI prediction)' : '(manual)')
        });
    };
    /**
     * Get confidence badge variant
     */
    var getConfidenceBadge = function (confidence) {
        if (confidence >= 0.8)
            return { variant: 'default', icon: lucide_react_1.CheckCircle, color: 'text-green-600' };
        if (confidence >= 0.6)
            return { variant: 'secondary', icon: lucide_react_1.Info, color: 'text-blue-600' };
        return { variant: 'destructive', icon: lucide_react_1.AlertTriangle, color: 'text-orange-600' };
    };
    /**
     * Format confidence percentage
     */
    var formatConfidence = function (confidence) { return "".concat(Math.round(confidence * 100), "%"); };
    return (<card_1.Card className={"w-full ".concat(className)}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Brain className="h-5 w-5 text-blue-600"/>
          AI Duration Prediction
        </card_1.CardTitle>
        <card_1.CardDescription>
          Intelligent appointment duration estimation with confidence scoring
        </card_1.CardDescription>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Loading state */}
        {loading && (<div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Generating prediction...</span>
          </div>)}

        {/* Error state */}
        {error && (<alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>)}

        {/* Prediction results */}
        {prediction && !loading && (<div className="space-y-4">
            {/* Main prediction display */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <lucide_react_1.Clock className="h-6 w-6 text-blue-600"/>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {prediction.predictedDuration} minutes
                  </div>
                  <div className="text-sm text-blue-700">
                    Range: {prediction.uncertaintyRange.min}-{prediction.uncertaintyRange.max} min
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {(function () {
                var _a = getConfidenceBadge(prediction.confidenceScore), variant = _a.variant, Icon = _a.icon, color = _a.color;
                return (<badge_1.Badge variant={variant} className="flex items-center gap-1">
                      <Icon className={"h-3 w-3 ".concat(color)}/>
                      {formatConfidence(prediction.confidenceScore)} confidence
                    </badge_1.Badge>);
            })()}
                <div className="text-xs text-gray-500 mt-1">
                  {prediction.isAIPrediction ? 'AI Model' : 'Baseline'} • {prediction.testGroup}
                </div>
              </div>
            </div>

            {/* Test group info */}
            {prediction.testGroup === 'ai_prediction' && (<alert_1.Alert>
                <lucide_react_1.TrendingUp className="h-4 w-4"/>
                <alert_1.AlertDescription>
                  You're part of our AI prediction testing group. This helps us improve our models!
                </alert_1.AlertDescription>
              </alert_1.Alert>)}

            {/* Manual override option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <switch_1.Switch id="manual-override" checked={useManualOverride} onCheckedChange={setUseManualOverride}/>
                <label_1.Label htmlFor="manual-override" className="text-sm font-medium">
                  Manual override
                </label_1.Label>
              </div>

              {useManualOverride && (<div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label_1.Label htmlFor="manual-duration" className="text-sm font-medium">
                      Custom duration (minutes)
                    </label_1.Label>
                    <input_1.Input id="manual-duration" type="number" min="5" max="300" value={manualDuration} onChange={function (e) { return setManualDuration(parseInt(e.target.value) || 0); }} className="mt-1"/>
                  </div>

                  <div>
                    <label_1.Label htmlFor="override-reason" className="text-sm font-medium">
                      Reason for override
                    </label_1.Label>
                    <textarea_1.Textarea id="override-reason" placeholder="Why are you overriding the AI prediction?" value={overrideReason} onChange={function (e) { return setOverrideReason(e.target.value); }} className="mt-1" rows={2}/>
                  </div>
                </div>)}
            </div>

            {/* Advanced options */}
            <div className="space-y-3">
              <button_1.Button variant="outline" size="sm" onClick={function () { return setShowAdvancedOptions(!showAdvancedOptions); }} className="w-full">
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </button_1.Button>

              {showAdvancedOptions && (<div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label_1.Label htmlFor="anxiety-level" className="text-sm font-medium">
                        Patient Anxiety Level
                      </label_1.Label>
                      <select_1.Select value={anxietyLevel} onValueChange={function (value) { return setAnxietyLevel(value); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="low">Low</select_1.SelectItem>
                          <select_1.SelectItem value="medium">Medium</select_1.SelectItem>
                          <select_1.SelectItem value="high">High</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>

                    <div>
                      <label_1.Label htmlFor="treatment-complexity" className="text-sm font-medium">
                        Treatment Complexity
                      </label_1.Label>
                      <select_1.Select value={treatmentComplexity} onValueChange={function (value) { return setTreatmentComplexity(value); }}>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="simple">Simple</select_1.SelectItem>
                          <select_1.SelectItem value="standard">Standard</select_1.SelectItem>
                          <select_1.SelectItem value="complex">Complex</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                    </div>
                  </div>

                  <div>
                    <label_1.Label htmlFor="special-requirements" className="text-sm font-medium">
                      Special Requirements (comma-separated)
                    </label_1.Label>
                    <input_1.Input id="special-requirements" placeholder="e.g., extensive_buildup, wheelchair_access" value={specialRequirements} onChange={function (e) { return setSpecialRequirements(e.target.value); }} className="mt-1"/>
                  </div>

                  <button_1.Button variant="outline" size="sm" onClick={generatePrediction} disabled={loading} className="w-full">
                    Regenerate Prediction
                  </button_1.Button>
                </div>)}
            </div>
          </div>)}
      </card_1.CardContent>

      <card_1.CardFooter>
        <button_1.Button onClick={handleDurationSelect} disabled={loading || !prediction || (useManualOverride && manualDuration <= 0)} className="w-full">
          {loading ? 'Generating...' : "Select ".concat(useManualOverride ? manualDuration : (prediction === null || prediction === void 0 ? void 0 : prediction.predictedDuration) || 0, " minutes")}
        </button_1.Button>
      </card_1.CardFooter>
    </card_1.Card>);
}
