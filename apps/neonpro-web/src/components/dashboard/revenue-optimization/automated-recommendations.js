/**
 * Automated Recommendations Component
 *
 * Displays AI-powered revenue optimization recommendations
 * with implementation priorities and impact projections
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedRecommendations = AutomatedRecommendations;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
  critical: "bg-purple-100 text-purple-800 border-purple-200",
};
var effortColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
};
function AutomatedRecommendations(_a) {
  var recommendations = _a.recommendations,
    implementationPlan = _a.implementationPlan;
  var sortedRecommendations = recommendations.sort(function (a, b) {
    var priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  var totalImpact = recommendations.reduce(function (sum, rec) {
    return sum + rec.expectedImpact;
  }, 0);
  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <lucide_react_1.Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Total Projected Impact</span>
        </div>
        <badge_1.Badge variant="outline" className="text-lg px-3 py-1">
          +{totalImpact.toFixed(1)}% Revenue
        </badge_1.Badge>
      </div>

      <separator_1.Separator />

      {/* Recommendations List */}
      <div className="space-y-3">
        {sortedRecommendations.map(function (recommendation, index) {
          return (
            <card_1.Card key={index} className="border-l-4 border-l-blue-500">
              <card_1.CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <badge_1.Badge
                        variant="outline"
                        className={priorityColors[recommendation.priority]}
                      >
                        {recommendation.priority.toUpperCase()}
                      </badge_1.Badge>
                      <span className="text-sm text-muted-foreground">
                        {recommendation.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm font-medium leading-relaxed">
                      {recommendation.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <lucide_react_1.TrendingUp className="h-3 w-3" />
                        <span>+{recommendation.expectedImpact.toFixed(1)}% impact</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Target
                          className={"h-3 w-3 ".concat(
                            effortColors[recommendation.implementationEffort],
                          )}
                        />
                        <span className={effortColors[recommendation.implementationEffort]}>
                          {recommendation.implementationEffort} effort
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="h-3 w-3" />
                        <span>{recommendation.timeframe}</span>
                      </div>
                    </div>

                    {/* Impact Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Expected Impact</span>
                        <span>{recommendation.expectedImpact.toFixed(1)}%</span>
                      </div>
                      <progress_1.Progress
                        value={Math.min(recommendation.expectedImpact * 5, 100)}
                        className="h-2"
                      />
                    </div>
                  </div>

                  <button_1.Button size="sm" variant="outline">
                    <lucide_react_1.ArrowRight className="h-3 w-3" />
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      <separator_1.Separator />

      {/* Implementation Plan */}
      <card_1.Card>
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="text-base flex items-center gap-2">
            <lucide_react_1.CheckCircle className="h-4 w-4" />
            Implementation Roadmap
          </card_1.CardTitle>
          <card_1.CardDescription>
            Phased approach for maximum impact and minimal disruption
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {implementationPlan.map(function (step, index) {
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{step}</p>
                </div>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button_1.Button className="flex-1" size="sm">
          <lucide_react_1.Lightbulb className="h-4 w-4 mr-1" />
          Start Implementation
        </button_1.Button>
        <button_1.Button variant="outline" size="sm">
          Export Report
        </button_1.Button>
      </div>
    </div>
  );
}
