"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticalInsights = StatisticalInsights;
/**
 * Statistical Insights Component for NeonPro
 *
 * Advanced statistical analysis and insights dashboard providing
 * correlation analysis, significance testing, predictive modeling,
 * and data quality assessments for business intelligence.
 */
var react_1 = require("react");
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
// Utility functions
var getCorrelationStrength = (correlation) => {
  var abs = Math.abs(correlation);
  if (abs >= 0.8) return { strength: "Very Strong", color: "text-red-600" };
  if (abs >= 0.6) return { strength: "Strong", color: "text-orange-600" };
  if (abs >= 0.4) return { strength: "Moderate", color: "text-yellow-600" };
  if (abs >= 0.2) return { strength: "Weak", color: "text-blue-600" };
  return { strength: "Very Weak", color: "text-gray-600" };
};
var getSignificanceLevel = (pValue) => {
  if (pValue < 0.001)
    return { level: "***", color: "text-green-600", description: "Highly Significant" };
  if (pValue < 0.01)
    return { level: "**", color: "text-green-500", description: "Very Significant" };
  if (pValue < 0.05) return { level: "*", color: "text-green-400", description: "Significant" };
  if (pValue < 0.1)
    return { level: "†", color: "text-yellow-500", description: "Marginally Significant" };
  return { level: "ns", color: "text-gray-500", description: "Not Significant" };
};
var getQualityColor = (score) => {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};
var calculateCorrelationMatrix = (data) => {
  if (data.length === 0) return [];
  var keys = Object.keys(data[0]).filter((key) => typeof data[0][key] === "number");
  var matrix = [];
  keys.forEach((key1) => {
    keys.forEach((key2) => {
      var values1 = data.map((d) => d[key1]).filter((v) => !isNaN(v));
      var values2 = data.map((d) => d[key2]).filter((v) => !isNaN(v));
      if (values1.length > 1 && values2.length > 1) {
        var correlation = calculatePearsonCorrelation(values1, values2);
        matrix.push({ x: key1, y: key2, value: correlation });
      }
    });
  });
  return matrix;
};
var calculatePearsonCorrelation = (x, y) => {
  var n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  var sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
  var sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
  var sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
  var sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
  var sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);
  var numerator = n * sumXY - sumX * sumY;
  var denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
};
function StatisticalInsights(_a) {
  var _b, _c;
  var correlations = _a.correlations,
    regressionResults = _a.regressionResults,
    statisticalTests = _a.statisticalTests,
    dataQuality = _a.dataQuality,
    predictiveModels = _a.predictiveModels,
    rawData = _a.rawData,
    _d = _a.loading,
    loading = _d === void 0 ? false : _d,
    _e = _a.className,
    className = _e === void 0 ? "" : _e,
    onModelRetrain = _a.onModelRetrain,
    onDataRefresh = _a.onDataRefresh,
    onExportResults = _a.onExportResults;
  var _f = (0, react_1.useState)("correlations"),
    selectedView = _f[0],
    setSelectedView = _f[1];
  var _g = (0, react_1.useState)(null),
    selectedCorrelation = _g[0],
    setSelectedCorrelation = _g[1];
  var _h = (0, react_1.useState)(95),
    confidenceLevel = _h[0],
    setConfidenceLevel = _h[1];
  var _j = (0, react_1.useState)(false),
    showOnlySignificant = _j[0],
    setShowOnlySignificant = _j[1];
  // Calculate correlation matrix from raw data
  var correlationMatrix = (0, react_1.useMemo)(
    () => calculateCorrelationMatrix(rawData),
    [rawData],
  );
  // Filter significant correlations
  var significantCorrelations = (0, react_1.useMemo)(
    () =>
      correlations
        .filter((c) => !showOnlySignificant || c.significance !== "none")
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
    [correlations, showOnlySignificant],
  );
  // Calculate overall statistics
  var statisticalSummary = (0, react_1.useMemo)(() => {
    var strongCorrelations = correlations.filter((c) => Math.abs(c.correlation) >= 0.6).length;
    var significantTests = statisticalTests.filter((t) => t.result === "reject").length;
    var overallDataQuality =
      (dataQuality.completeness +
        dataQuality.accuracy +
        dataQuality.consistency +
        dataQuality.validity +
        dataQuality.uniqueness) /
      5;
    var bestModel = predictiveModels.reduce(
      (best, model) =>
        model.accuracy > ((best === null || best === void 0 ? void 0 : best.accuracy) || 0)
          ? model
          : best,
      predictiveModels[0],
    );
    return {
      strongCorrelations: strongCorrelations,
      significantTests: significantTests,
      overallDataQuality: overallDataQuality,
      bestModel: bestModel,
      totalOutliers: dataQuality.outliers.filter((o) => o.isOutlier).length,
    };
  }, [correlations, statisticalTests, dataQuality, predictiveModels]);
  // Custom tooltip for correlation heatmap
  var CorrelationTooltip = (_a) => {
    var active = _a.active,
      payload = _a.payload;
    if (!active || !payload || !payload.length) return null;
    var data = payload[0].payload;
    var strength = getCorrelationStrength(data.value);
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg max-w-xs">
        <p className="font-semibold text-gray-900 mb-2">
          {data.x} vs {data.y}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Correlation:</span>
            <span className="font-medium">{data.value.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Strength:</span>
            <span className={"font-medium ".concat(strength.color)}>{strength.strength}</span>
          </div>
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className={"w-full space-y-6 ".concat(className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded" />
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
        <card_1.Card className="animate-pulse">
          <card_1.CardContent className="p-6">
            <div className="h-96 bg-gray-100 rounded" />
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  return (
    <div className={"w-full space-y-6 ".concat(className)}>
      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Strong Correlations</p>
                <p className="text-2xl font-bold text-purple-900">
                  {statisticalSummary.strongCorrelations}
                </p>
              </div>
              <lucide_react_1.BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Significant Tests</p>
                <p className="text-2xl font-bold text-green-900">
                  {statisticalSummary.significantTests}/{statisticalTests.length}
                </p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Data Quality</p>
                <p className="text-2xl font-bold text-blue-900">
                  {statisticalSummary.overallDataQuality.toFixed(0)}%
                </p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Best Model</p>
                <p className="text-lg font-bold text-orange-900">
                  {(
                    ((_b = statisticalSummary.bestModel) === null || _b === void 0
                      ? void 0
                      : _b.accuracy) || 0
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-orange-700 capitalize">
                  {((_c = statisticalSummary.bestModel) === null || _c === void 0
                    ? void 0
                    : _c.modelType) || "N/A"}
                </p>
              </div>
              <lucide_react_1.Brain className="h-8 w-8 text-orange-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Statistical Analysis Tabs */}
      <tabs_1.Tabs value={selectedView} onValueChange={(value) => setSelectedView(value)}>
        <div className="flex items-center justify-between">
          <tabs_1.TabsList className="grid w-fit grid-cols-5">
            <tabs_1.TabsTrigger value="correlations">Correlations</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="regression">Regression</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="tests">Statistical Tests</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="quality">Data Quality</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="models">Models</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <div className="flex items-center gap-2">
            <button_1.Button
              variant={showOnlySignificant ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlySignificant(!showOnlySignificant)}
            >
              <lucide_react_1.Filter className="h-4 w-4 mr-1" />
              Significant Only
            </button_1.Button>
            <button_1.Button variant="outline" size="sm" onClick={onDataRefresh}>
              <lucide_react_1.RefreshCw className="h-4 w-4" />
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={() =>
                onExportResults === null || onExportResults === void 0
                  ? void 0
                  : onExportResults("csv")
              }
            >
              <lucide_react_1.Download className="h-4 w-4" />
            </button_1.Button>
          </div>
        </div>

        <tabs_1.TabsContent value="correlations" className="mt-6">
          <div className="space-y-6">
            {/* Correlation Matrix Visualization */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.PieChart className="h-5 w-5" />
                  Correlation Matrix
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Visual representation of relationships between variables
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-96">
                  <recharts_1.ResponsiveContainer width="100%" height="100%">
                    <recharts_1.ScatterChart>
                      <recharts_1.CartesianGrid strokeDasharray="3 3" />
                      <recharts_1.XAxis type="category" dataKey="x" />
                      <recharts_1.YAxis type="category" dataKey="y" />
                      <recharts_1.Tooltip content={<CorrelationTooltip />} />
                      <recharts_1.Scatter data={correlationMatrix} fill="#8884d8">
                        {correlationMatrix.map((entry, index) => (
                          <recharts_1.Cell
                            key={index}
                            fill={
                              entry.value > 0
                                ? "rgba(34, 197, 94, ".concat(Math.abs(entry.value), ")")
                                : "rgba(239, 68, 68, ".concat(Math.abs(entry.value), ")")
                            }
                          />
                        ))}
                      </recharts_1.Scatter>
                    </recharts_1.ScatterChart>
                  </recharts_1.ResponsiveContainer>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Detailed Correlation List */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Correlation Analysis</card_1.CardTitle>
                <card_1.CardDescription>
                  Detailed correlation coefficients with significance testing
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {significantCorrelations.map((correlation, index) => {
                    var strength = getCorrelationStrength(correlation.correlation);
                    var significance = getSignificanceLevel(correlation.pValue);
                    return (
                      <div
                        key={"".concat(correlation.variable1, "-").concat(correlation.variable2)}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setSelectedCorrelation(
                            selectedCorrelation ===
                              "".concat(correlation.variable1, "-").concat(correlation.variable2)
                              ? null
                              : "".concat(correlation.variable1, "-").concat(correlation.variable2),
                          )
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              {correlation.variable1} ↔ {correlation.variable2}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>r = {correlation.correlation.toFixed(3)}</span>
                              <span>p = {correlation.pValue.toFixed(4)}</span>
                              <span>n = {correlation.sampleSize}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <badge_1.Badge variant="outline" className={strength.color}>
                              {strength.strength}
                            </badge_1.Badge>
                            <badge_1.Badge
                              variant={significance.level === "ns" ? "secondary" : "default"}
                              className={significance.color}
                            >
                              {significance.level}
                            </badge_1.Badge>
                          </div>
                        </div>

                        {selectedCorrelation ===
                          "".concat(correlation.variable1, "-").concat(correlation.variable2) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Interpretation:</strong>
                                <p className="text-gray-600 mt-1">
                                  {Math.abs(correlation.correlation) < 0.3
                                    ? "Little to no linear relationship between variables."
                                    : correlation.correlation > 0
                                      ? "Positive relationship: as one variable increases, the other tends to increase."
                                      : "Negative relationship: as one variable increases, the other tends to decrease."}
                                </p>
                              </div>
                              <div>
                                <strong>Statistical Significance:</strong>
                                <p className="text-gray-600 mt-1">
                                  {significance.description}.{" "}
                                  {correlation.pValue < 0.05
                                    ? "The relationship is statistically significant."
                                    : "The relationship may be due to chance."}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="regression" className="mt-6">
          {regressionResults
            ? <div className="space-y-6">
                {/* Regression Summary */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-5 w-5" />
                      Regression Analysis
                    </card_1.CardTitle>
                    <card_1.CardDescription>{regressionResults.equation}</card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">R-Squared</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 mt-1">
                          {(regressionResults.rSquared * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-blue-700 mt-1">Variance Explained</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Significant Coefficients
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {regressionResults.coefficients.filter((c) => c.significance).length}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          of {regressionResults.coefficients.length} total
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <lucide_react_1.Activity className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Model Fit</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                          {regressionResults.rSquared >= 0.8
                            ? "Excellent"
                            : regressionResults.rSquared >= 0.6
                              ? "Good"
                              : regressionResults.rSquared >= 0.4
                                ? "Fair"
                                : "Poor"}
                        </p>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Coefficients Table */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Regression Coefficients</card_1.CardTitle>
                    <card_1.CardDescription>
                      Variable contributions to the model
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-3">
                      {regressionResults.coefficients.map((coeff, index) => {
                        var significance = getSignificanceLevel(coeff.pValue);
                        return (
                          <div
                            key={coeff.variable}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <h4 className="font-medium">{coeff.variable}</h4>
                              <p className="text-sm text-gray-600">
                                Coefficient: {coeff.coefficient.toFixed(4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <badge_1.Badge
                                variant={coeff.significance ? "default" : "secondary"}
                                className={significance.color}
                              >
                                {significance.level}
                              </badge_1.Badge>
                              <p className="text-xs text-gray-600 mt-1">
                                p = {coeff.pValue.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Residual Analysis */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Residual Analysis</card_1.CardTitle>
                    <card_1.CardDescription>
                      Model fit assessment through residual patterns
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="h-80">
                      <recharts_1.ResponsiveContainer width="100%" height="100%">
                        <recharts_1.ScatterChart data={regressionResults.predictions}>
                          <recharts_1.CartesianGrid strokeDasharray="3 3" />
                          <recharts_1.XAxis
                            dataKey="predicted"
                            name="Predicted"
                            label={{
                              value: "Predicted Values",
                              position: "insideBottom",
                              offset: -5,
                            }}
                          />
                          <recharts_1.YAxis
                            dataKey="residual"
                            name="Residual"
                            label={{ value: "Residuals", angle: -90, position: "insideLeft" }}
                          />
                          <recharts_1.Tooltip
                            formatter={(value, name) => [
                              value.toFixed(3),
                              name === "residual" ? "Residual" : "Predicted",
                            ]}
                          />
                          <recharts_1.ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                          <recharts_1.Scatter dataKey="residual" fill="#3b82f6" />
                        </recharts_1.ScatterChart>
                      </recharts_1.ResponsiveContainer>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>
            : <card_1.Card>
                <card_1.CardContent className="text-center py-12">
                  <lucide_react_1.Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Regression Analysis Available
                  </h3>
                  <p className="text-gray-600">
                    Run a regression analysis to see detailed model results and diagnostics.
                  </p>
                </card_1.CardContent>
              </card_1.Card>}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="tests" className="mt-6">
          <div className="space-y-6">
            {statisticalTests.map((test, index) => (
              <card_1.Card key={index}>
                <card_1.CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <card_1.CardTitle className="text-lg">{test.testName}</card_1.CardTitle>
                      <card_1.CardDescription>{test.hypothesis}</card_1.CardDescription>
                    </div>
                    <badge_1.Badge
                      variant={test.result === "reject" ? "default" : "secondary"}
                      className={test.result === "reject" ? "text-green-600" : "text-gray-600"}
                    >
                      {test.result === "reject" ? "Significant" : "Not Significant"}
                    </badge_1.Badge>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Test Statistic</p>
                      <p className="text-xl font-bold">{test.testStatistic.toFixed(3)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">P-Value</p>
                      <p className="text-xl font-bold">{test.pValue.toFixed(4)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Critical Value</p>
                      <p className="text-xl font-bold">{test.criticalValue.toFixed(3)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Confidence Level</p>
                      <p className="text-xl font-bold">{test.confidenceLevel}%</p>
                    </div>
                  </div>

                  <alert_1.Alert>
                    <lucide_react_1.Info className="h-4 w-4" />
                    <alert_1.AlertDescription>
                      <strong>Interpretation:</strong> {test.interpretation}
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                </card_1.CardContent>
              </card_1.Card>
            ))}

            {statisticalTests.length === 0 && (
              <card_1.Card>
                <card_1.CardContent className="text-center py-12">
                  <lucide_react_1.Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Statistical Tests Available
                  </h3>
                  <p className="text-gray-600">
                    Configure and run statistical tests to validate your hypotheses.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            )}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="quality" className="mt-6">
          <div className="space-y-6">
            {/* Data Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  name: "Completeness",
                  value: dataQuality.completeness,
                  icon: lucide_react_1.CheckCircle,
                },
                { name: "Accuracy", value: dataQuality.accuracy, icon: lucide_react_1.Target },
                {
                  name: "Consistency",
                  value: dataQuality.consistency,
                  icon: lucide_react_1.Layers,
                },
                { name: "Validity", value: dataQuality.validity, icon: Shield },
                { name: "Uniqueness", value: dataQuality.uniqueness, icon: lucide_react_1.Zap },
              ].map((metric) => {
                var Icon = metric.icon;
                return (
                  <card_1.Card key={metric.name}>
                    <card_1.CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={"h-5 w-5 ".concat(getQualityColor(metric.value))} />
                        <span
                          className={"text-2xl font-bold ".concat(getQualityColor(metric.value))}
                        >
                          {metric.value.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                      <progress_1.Progress value={metric.value} className="mt-2 h-2" />
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
            </div>

            {/* Outlier Analysis */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-5 w-5" />
                  Outlier Analysis
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Statistical outliers that may require attention
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {dataQuality.outliers.length > 0
                  ? <div className="space-y-3">
                      {dataQuality.outliers
                        .filter((outlier) => outlier.isOutlier)
                        .map((outlier, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <h4 className="font-medium">{outlier.metric}</h4>
                              <p className="text-sm text-gray-600">
                                Value: {outlier.value.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <badge_1.Badge variant="destructive">
                                Z-Score: {outlier.zScore.toFixed(2)}
                              </badge_1.Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  : <div className="text-center py-8">
                      <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Outliers Detected
                      </h3>
                      <p className="text-gray-600">
                        All data points fall within expected statistical ranges.
                      </p>
                    </div>}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="models" className="mt-6">
          <div className="space-y-6">
            {/* Model Comparison */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Brain className="h-5 w-5" />
                  Predictive Models Comparison
                </card_1.CardTitle>
                <card_1.CardDescription>
                  Performance comparison across different modeling approaches
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {predictiveModels.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium capitalize">{model.modelType} Model</h4>
                          <p className="text-sm text-gray-600">
                            Features: {model.features.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <badge_1.Badge variant={model.accuracy >= 80 ? "default" : "secondary"}>
                            {model.accuracy.toFixed(1)}% Accuracy
                          </badge_1.Badge>
                          <p className="text-xs text-gray-600 mt-1">
                            CV Score: {model.crossValidationScore.toFixed(3)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Model Performance</span>
                          <span className="text-sm font-medium">{model.accuracy.toFixed(1)}%</span>
                        </div>
                        <progress_1.Progress value={model.accuracy} className="h-2" />
                      </div>

                      {/* Feature Importance */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Feature Importance</h5>
                        {model.featureImportance.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{feature.feature}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded">
                                <div
                                  className="h-full bg-blue-500 rounded"
                                  style={{ width: "".concat(feature.importance * 100, "%") }}
                                />
                              </div>
                              <span className="font-medium">
                                {(feature.importance * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button_1.Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onModelRetrain === null || onModelRetrain === void 0
                              ? void 0
                              : onModelRetrain(model.modelType)
                          }
                        >
                          Retrain Model
                        </button_1.Button>
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {predictiveModels.length === 0 && (
              <card_1.Card>
                <card_1.CardContent className="text-center py-12">
                  <lucide_react_1.Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Predictive Models Available
                  </h3>
                  <p className="text-gray-600">
                    Train machine learning models to generate predictions and insights.
                  </p>
                </card_1.CardContent>
              </card_1.Card>
            )}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Statistical Insights Summary */}
      {statisticalSummary.strongCorrelations > 0 && (
        <alert_1.Alert>
          <lucide_react_1.BarChart3 className="h-4 w-4" />
          <alert_1.AlertDescription>
            <strong>Key Finding:</strong> {statisticalSummary.strongCorrelations} strong
            correlation(s) detected and {statisticalSummary.significantTests} statistical test(s)
            show significant results. Data quality is{" "}
            {statisticalSummary.overallDataQuality >= 80 ? "excellent" : "adequate"} at{" "}
            {statisticalSummary.overallDataQuality.toFixed(0)}%.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}
    </div>
  );
}
