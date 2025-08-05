/**
 * Insights Panel Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Displays AI-generated insights and recommendations including:
 * - Key performance insights and trends
 * - Automated recommendations for improvement
 * - Pattern recognition and anomaly detection
 * - Predictive insights and forecasting
 * - Clinical outcome analysis
 * - Business intelligence recommendations
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightsPanel = InsightsPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
function InsightsPanel(_a) {
    var insights = _a.insights, isLoading = _a.isLoading, timeframe = _a.timeframe;
    var _b = (0, react_1.useState)('all'), selectedCategory = _b[0], setSelectedCategory = _b[1];
    var _c = (0, react_1.useState)('priority'), sortBy = _c[0], setSortBy = _c[1];
    /**
     * Process insights with additional metadata
     */
    var processedInsights = (0, react_1.useMemo)(function () {
        return insights.map(function (insight) {
            var _a;
            // Determine category icon
            var categoryIcon;
            switch (insight.category) {
                case 'performance':
                    categoryIcon = <lucide_react_1.BarChart3 className="w-4 h-4"/>;
                    break;
                case 'clinical':
                    categoryIcon = <lucide_react_1.Activity className="w-4 h-4"/>;
                    break;
                case 'business':
                    categoryIcon = <lucide_react_1.Target className="w-4 h-4"/>;
                    break;
                case 'ai_model':
                    categoryIcon = <lucide_react_1.Brain className="w-4 h-4"/>;
                    break;
                case 'compliance':
                    categoryIcon = <lucide_react_1.Shield className="w-4 h-4"/>;
                    break;
                case 'user_experience':
                    categoryIcon = <lucide_react_1.Users className="w-4 h-4"/>;
                    break;
                default:
                    categoryIcon = <lucide_react_1.Lightbulb className="w-4 h-4"/>;
            }
            // Determine priority color
            var priorityColor;
            switch (insight.priority) {
                case 'critical':
                    priorityColor = 'text-red-600 bg-red-50 border-red-200';
                    break;
                case 'high':
                    priorityColor = 'text-orange-600 bg-orange-50 border-orange-200';
                    break;
                case 'medium':
                    priorityColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
                    break;
                case 'low':
                    priorityColor = 'text-blue-600 bg-blue-50 border-blue-200';
                    break;
                default:
                    priorityColor = 'text-gray-600 bg-gray-50 border-gray-200';
            }
            // Determine if actionable
            var actionable = !!(insight.recommendations && insight.recommendations.length > 0);
            // Estimate impact based on confidence and business value
            var estimatedImpact;
            var impactScore = (insight.confidence / 100) * (((_a = insight.businessImpact) === null || _a === void 0 ? void 0 : _a.efficiency) || 50);
            if (impactScore >= 70) {
                estimatedImpact = 'high';
            }
            else if (impactScore >= 40) {
                estimatedImpact = 'medium';
            }
            else {
                estimatedImpact = 'low';
            }
            return __assign(__assign({}, insight), { categoryIcon: categoryIcon, priorityColor: priorityColor, actionable: actionable, estimatedImpact: estimatedImpact });
        });
    }, [insights]);
    /**
     * Group insights by category
     */
    var insightCategories = (0, react_1.useMemo)(function () {
        var categories = new Map();
        processedInsights.forEach(function (insight) {
            var category = insight.category;
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(insight);
        });
        var categoryList = [];
        categories.forEach(function (insights, categoryId) {
            var label;
            var icon;
            switch (categoryId) {
                case 'performance':
                    label = 'Performance';
                    icon = <lucide_react_1.BarChart3 className="w-4 h-4"/>;
                    break;
                case 'clinical':
                    label = 'Clinical';
                    icon = <lucide_react_1.Activity className="w-4 h-4"/>;
                    break;
                case 'business':
                    label = 'Business';
                    icon = <lucide_react_1.Target className="w-4 h-4"/>;
                    break;
                case 'ai_model':
                    label = 'AI Models';
                    icon = <lucide_react_1.Brain className="w-4 h-4"/>;
                    break;
                case 'compliance':
                    label = 'Compliance';
                    icon = <lucide_react_1.Shield className="w-4 h-4"/>;
                    break;
                case 'user_experience':
                    label = 'User Experience';
                    icon = <lucide_react_1.Users className="w-4 h-4"/>;
                    break;
                default:
                    label = 'General';
                    icon = <lucide_react_1.Lightbulb className="w-4 h-4"/>;
            }
            var averageConfidence = insights.reduce(function (sum, insight) { return sum + insight.confidence; }, 0) / insights.length;
            var totalImpact = insights.reduce(function (sum, insight) { var _a; return sum + (((_a = insight.businessImpact) === null || _a === void 0 ? void 0 : _a.efficiency) || 0); }, 0);
            categoryList.push({
                id: categoryId,
                label: label,
                icon: icon,
                insights: insights,
                averageConfidence: averageConfidence,
                totalImpact: totalImpact
            });
        });
        return categoryList.sort(function (a, b) { return b.totalImpact - a.totalImpact; });
    }, [processedInsights]);
    /**
     * Sort insights
     */
    var sortedInsights = (0, react_1.useMemo)(function () {
        var insightsToSort = selectedCategory === 'all'
            ? processedInsights
            : processedInsights.filter(function (insight) { return insight.category === selectedCategory; });
        return insightsToSort.sort(function (a, b) {
            var _a, _b;
            switch (sortBy) {
                case 'priority':
                    var priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'confidence':
                    return b.confidence - a.confidence;
                case 'impact':
                    return (((_a = b.businessImpact) === null || _a === void 0 ? void 0 : _a.efficiency) || 0) - (((_b = a.businessImpact) === null || _b === void 0 ? void 0 : _b.efficiency) || 0);
                case 'timestamp':
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                default:
                    return 0;
            }
        });
    }, [processedInsights, selectedCategory, sortBy]);
    /**
     * Get insight trend icon
     */
    var getTrendIcon = function (trend) {
        switch (trend) {
            case 'improving':
                return <lucide_react_1.TrendingUp className="w-4 h-4 text-green-600"/>;
            case 'declining':
                return <lucide_react_1.TrendingDown className="w-4 h-4 text-red-600"/>;
            case 'stable':
                return <lucide_react_1.Activity className="w-4 h-4 text-blue-600"/>;
            default:
                return <lucide_react_1.Activity className="w-4 h-4 text-gray-600"/>;
        }
    };
    /**
     * Get impact badge
     */
    var getImpactBadge = function (impact) {
        var colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-green-100 text-green-800'
        };
        return (<badge_1.Badge className={colors[impact]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </badge_1.Badge>);
    };
    /**
     * Insight card component
     */
    var InsightCard = function (_a) {
        var _b, _c;
        var insight = _a.insight, _d = _a.showCategory, showCategory = _d === void 0 ? true : _d;
        return (<card_1.Card className={"border-l-4 ".concat(insight.priorityColor)}>
      <card_1.CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showCategory && insight.categoryIcon}
            <card_1.CardTitle className="text-base">{insight.title}</card_1.CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(insight.trend)}
            <badge_1.Badge variant={insight.priority === 'critical' ? 'destructive' : 'secondary'}>
              {insight.priority}
            </badge_1.Badge>
          </div>
        </div>
        <card_1.CardDescription className="text-sm">
          {insight.description}
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Confidence</div>
            <div className="flex items-center gap-2">
              <progress_1.Progress value={insight.confidence} className="flex-1"/>
              <span className="text-sm font-mono">{insight.confidence}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Business Impact</div>
            <div className="flex items-center gap-2">
              <progress_1.Progress value={((_b = insight.businessImpact) === null || _b === void 0 ? void 0 : _b.efficiency) || 0} className="flex-1"/>
              <span className="text-sm font-mono">{((_c = insight.businessImpact) === null || _c === void 0 ? void 0 : _c.efficiency) || 0}%</span>
            </div>
          </div>
        </div>

        {/* Impact Badge */}
        <div className="flex items-center justify-between">
          {getImpactBadge(insight.estimatedImpact)}
          <div className="text-xs text-gray-500">
            <lucide_react_1.Clock className="w-3 h-3 inline mr-1"/>
            {new Date(insight.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Data Points */}
        {insight.dataPoints && insight.dataPoints.length > 0 && (<div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Key Data Points</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {insight.dataPoints.slice(0, 4).map(function (point, index) { return (<div key={index} className="flex justify-between">
                  <span className="text-gray-600">{point.label}:</span>
                  <span className="font-mono">{point.value}</span>
                </div>); })}
            </div>
          </div>)}

        {/* Recommendations */}
        {insight.recommendations && insight.recommendations.length > 0 && (<div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <lucide_react_1.Lightbulb className="w-4 h-4 text-yellow-600"/>
              Recommendations
            </div>
            <div className="space-y-1">
              {insight.recommendations.slice(0, 3).map(function (rec, index) { return (<div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <lucide_react_1.ArrowRight className="w-3 h-3 mt-0.5 text-blue-600"/>
                  <span>{rec}</span>
                </div>); })}
            </div>
          </div>)}

        {/* Action Button */}
        {insight.actionable && (<button_1.Button size="sm" variant="outline" className="w-full">
            <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
            Take Action
          </button_1.Button>)}
      </card_1.CardContent>
    </card_1.Card>);
    };
    if (isLoading) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Eye className="w-5 h-5 text-blue-600"/>
            AI Insights
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="animate-pulse space-y-4">
            {__spreadArray([], Array(3), true).map(function (_, i) { return (<div key={i} className="h-32 bg-gray-200 rounded"></div>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (insights.length === 0) {
        return (<card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Eye className="w-5 h-5 text-blue-600"/>
            AI Insights
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="text-center py-8">
            <lucide_react_1.Brain className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
            <p className="text-gray-600">
              AI insights will appear here as data is processed and patterns are identified.
            </p>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="w-5 h-5 text-blue-600"/>
              AI Insights
            </card_1.CardTitle>
            <card_1.CardDescription>
              {insights.length} insights generated from {timeframe} data analysis
            </card_1.CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={function (e) { return setSortBy(e.target.value); }} className="text-sm border rounded px-2 py-1">
              <option value="priority">Sort by Priority</option>
              <option value="confidence">Sort by Confidence</option>
              <option value="impact">Sort by Impact</option>
              <option value="timestamp">Sort by Date</option>
            </select>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <tabs_1.TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <tabs_1.TabsTrigger value="all">All</tabs_1.TabsTrigger>
            {insightCategories.map(function (category) { return (<tabs_1.TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                {category.icon}
                <span className="hidden lg:inline">{category.label}</span>
                <badge_1.Badge variant="secondary" className="ml-1">
                  {category.insights.length}
                </badge_1.Badge>
              </tabs_1.TabsTrigger>); })}
          </tabs_1.TabsList>

          <tabs_1.TabsContent value={selectedCategory} className="space-y-4 mt-6">
            {/* Category Summary */}
            {selectedCategory !== 'all' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(function () {
                var category = insightCategories.find(function (cat) { return cat.id === selectedCategory; });
                if (!category)
                    return null;
                return (<>
                      <card_1.Card>
                        <card_1.CardContent className="pt-6">
                          <div className="text-2xl font-bold">{category.insights.length}</div>
                          <p className="text-sm text-muted-foreground">Total Insights</p>
                        </card_1.CardContent>
                      </card_1.Card>
                      <card_1.Card>
                        <card_1.CardContent className="pt-6">
                          <div className="text-2xl font-bold">{category.averageConfidence.toFixed(0)}%</div>
                          <p className="text-sm text-muted-foreground">Avg Confidence</p>
                        </card_1.CardContent>
                      </card_1.Card>
                      <card_1.Card>
                        <card_1.CardContent className="pt-6">
                          <div className="text-2xl font-bold">{category.totalImpact.toFixed(0)}%</div>
                          <p className="text-sm text-muted-foreground">Total Impact</p>
                        </card_1.CardContent>
                      </card_1.Card>
                    </>);
            })()}
              </div>)}

            {/* Insights List */}
            <div className="space-y-4">
              {sortedInsights.map(function (insight, index) { return (<InsightCard key={"".concat(insight.id, "-").concat(index)} insight={insight} showCategory={selectedCategory === 'all'}/>); })}
            </div>

            {sortedInsights.length === 0 && (<div className="text-center py-8">
                <lucide_react_1.Brain className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Insights in This Category
                </h3>
                <p className="text-gray-600">
                  Try selecting a different category or timeframe.
                </p>
              </div>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>);
}
