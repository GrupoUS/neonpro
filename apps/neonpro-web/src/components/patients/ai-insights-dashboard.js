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
exports.default = AIInsightsDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
function AIInsightsDashboard(_a) {
    var _this = this;
    var patientId = _a.patientId;
    var _b = (0, react_1.useState)(null), insights = _b[0], setInsights = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(false), generating = _e[0], setGenerating = _e[1];
    (0, react_1.useEffect)(function () {
        fetchInsights();
    }, [patientId]);
    var fetchInsights = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    return [4 /*yield*/, fetch("/api/patients/".concat(patientId, "/insights"))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to fetch patient insights');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setInsights(data.insights);
                    setError(null);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : 'An error occurred');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var generateNewInsights = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setGenerating(true);
                    return [4 /*yield*/, fetch("/api/patients/".concat(patientId, "/insights"), {
                            method: 'GET',
                            headers: {
                                'Cache-Control': 'no-cache'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to generate new insights');
                    }
                    return [4 /*yield*/, fetchInsights()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    setError(err_2 instanceof Error ? err_2.message : 'Failed to generate insights');
                    return [3 /*break*/, 5];
                case 4:
                    setGenerating(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getRiskBadgeColor = function (riskLevel) {
        switch (riskLevel) {
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    var getSeverityBadgeColor = function (severity) {
        switch (severity) {
            case 'low': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'high': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'improving': return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600"/>;
            case 'declining': return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600"/>;
            case 'stable': return <lucide_react_1.Minus className="h-4 w-4 text-gray-600"/>;
            default: return <lucide_react_1.Minus className="h-4 w-4 text-gray-600"/>;
        }
    };
    var getEffortColor = function (effort) {
        switch (effort) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>);
    }
    if (error) {
        return (<card_1.Card className="p-6">
        <div className="text-center text-red-600">
          <lucide_react_1.AlertTriangle className="h-8 w-8 mx-auto mb-2"/>
          <p>{error}</p>
          <button_1.Button onClick={fetchInsights} className="mt-4">
            Try Again
          </button_1.Button>
        </div>
      </card_1.Card>);
    }
    if (!insights) {
        return (<card_1.Card className="p-6">
        <div className="text-center">
          <lucide_react_1.Brain className="h-12 w-12 mx-auto mb-4 text-gray-400"/>
          <h3 className="text-lg font-semibold mb-2">Generate AI Insights</h3>
          <p className="text-gray-600 mb-4">
            Analyze patient data to generate personalized insights and recommendations
          </p>
          <button_1.Button onClick={generateNewInsights} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Insights'}
          </button_1.Button>
        </div>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Patient Insights</h2>
          <p className="text-gray-600">
            Last updated: {new Date(insights.risk_assessment.last_updated).toLocaleDateString()}
          </p>
        </div>
        <button_1.Button onClick={generateNewInsights} disabled={generating}>
          {generating ? 'Regenerating...' : 'Refresh Insights'}
        </button_1.Button>
      </div>

      {/* Risk Assessment Overview */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Shield className="h-5 w-5"/>
              <card_1.CardTitle>Risk Assessment</card_1.CardTitle>
            </div>
            <badge_1.Badge className={getRiskBadgeColor(insights.risk_assessment.risk_level)}>
              {insights.risk_assessment.risk_level.toUpperCase()} RISK
            </badge_1.Badge>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <span className="text-sm font-bold">
                  {Math.round(insights.risk_assessment.overall_score * 100)}%
                </span>
              </div>
              <progress_1.Progress value={insights.risk_assessment.overall_score * 100} className="h-2"/>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Assessment Confidence</span>
                <span className="text-sm font-bold">
                  {Math.round(insights.risk_assessment.confidence * 100)}%
                </span>
              </div>
              <progress_1.Progress value={insights.risk_assessment.confidence * 100} className="h-2"/>
            </div>

            {insights.risk_assessment.recommendations.length > 0 && (<div>
                <h4 className="font-medium mb-2">Key Recommendations</h4>
                <ul className="space-y-1">
                  {insights.risk_assessment.recommendations.map(function (rec, index) { return (<li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      {rec}
                    </li>); })}
                </ul>
              </div>)}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Insights Tabs */}
      <tabs_1.Tabs defaultValue="risk-factors" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="risk-factors">Risk Factors</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="trends">Health Trends</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="predictions">Predictions</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Optimization</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Risk Factors Tab */}
        <tabs_1.TabsContent value="risk-factors" className="space-y-4">
          <div className="grid gap-4">
            {insights.risk_assessment.risk_factors.map(function (factor, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle className="text-lg">{factor.factor.replace('_', ' ').toUpperCase()}</card_1.CardTitle>
                    <badge_1.Badge className={getSeverityBadgeColor(factor.severity)}>
                      {factor.severity.toUpperCase()}
                    </badge_1.Badge>
                  </div>
                  <card_1.CardDescription>{factor.description}</card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Impact Score</span>
                        <span className="text-sm font-bold">
                          {Math.round(factor.impact_score * 100)}%
                        </span>
                      </div>
                      <progress_1.Progress value={factor.impact_score * 100} className="h-2"/>
                    </div>
                    
                    {factor.mitigation_strategies.length > 0 && (<div>
                        <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                        <ul className="space-y-1">
                          {factor.mitigation_strategies.map(function (strategy, idx) { return (<li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="mr-2">•</span>
                              {strategy}
                            </li>); })}
                        </ul>
                      </div>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Health Trends Tab */}
        <tabs_1.TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {insights.health_trends.map(function (trend, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle className="flex items-center space-x-2">
                      <lucide_react_1.BarChart3 className="h-5 w-5"/>
                      <span>{trend.metric.replace('_', ' ').toUpperCase()}</span>
                    </card_1.CardTitle>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend)}
                      <span className="text-sm font-medium capitalize">{trend.trend}</span>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Change Rate:</span>
                        <span className="ml-2">{trend.change_rate.toFixed(3)}/month</span>
                      </div>
                      <div>
                        <span className="font-medium">Period:</span>
                        <span className="ml-2">{trend.period_months} months</span>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <span className="ml-2">{Math.round(trend.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Data Points:</span>
                        <span className="ml-2">{trend.data_points.length}</span>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Treatment Predictions Tab */}
        <tabs_1.TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {insights.treatment_predictions.map(function (prediction, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center space-x-2">
                    <lucide_react_1.Target className="h-5 w-5"/>
                    <span>{prediction.treatment_type}</span>
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Success Probability</span>
                        <span className="text-sm font-bold">
                          {Math.round(prediction.success_probability * 100)}%
                        </span>
                      </div>
                      <progress_1.Progress value={prediction.success_probability * 100} className="h-2"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Expected Duration:</span>
                        <span className="ml-2">{prediction.expected_duration}</span>
                      </div>
                      <div>
                        <span className="font-medium">Optimal Frequency:</span>
                        <span className="ml-2">{prediction.optimal_frequency}</span>
                      </div>
                    </div>

                    {prediction.supporting_factors.length > 0 && (<div>
                        <h5 className="font-medium mb-2 text-green-700">Supporting Factors</h5>
                        <ul className="space-y-1">
                          {prediction.supporting_factors.map(function (factor, idx) { return (<li key={idx} className="text-sm text-green-600 flex items-start">
                              <span className="mr-2">✓</span>
                              {factor}
                            </li>); })}
                        </ul>
                      </div>)}

                    {prediction.contraindications.length > 0 && (<div>
                        <h5 className="font-medium mb-2 text-red-700">Contraindications</h5>
                        <ul className="space-y-1">
                          {prediction.contraindications.map(function (contra, idx) { return (<li key={idx} className="text-sm text-red-600 flex items-start">
                              <span className="mr-2">⚠</span>
                              {contra}
                            </li>); })}
                        </ul>
                      </div>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>

        {/* Optimization Suggestions Tab */}
        <tabs_1.TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            {insights.optimization_suggestions.map(function (suggestion, index) { return (<card_1.Card key={index}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle className="flex items-center space-x-2">
                      <lucide_react_1.Lightbulb className="h-5 w-5"/>
                      <span className="capitalize">{suggestion.category} Optimization</span>
                    </card_1.CardTitle>
                    <badge_1.Badge variant="outline" className={getEffortColor(suggestion.implementation_effort)}>
                      {suggestion.implementation_effort.toUpperCase()} EFFORT
                    </badge_1.Badge>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{suggestion.suggestion}</p>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Expected Impact</span>
                        <span className="text-sm font-bold">
                          {Math.round(suggestion.impact_score * 100)}%
                        </span>
                      </div>
                      <progress_1.Progress value={suggestion.impact_score * 100} className="h-2"/>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-1 text-blue-800">Expected Outcome</h5>
                      <p className="text-sm text-blue-700">{suggestion.expected_outcome}</p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
