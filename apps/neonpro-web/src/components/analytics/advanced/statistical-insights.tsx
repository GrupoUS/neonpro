"use client";

/**
 * Statistical Insights Component for NeonPro
 *
 * Advanced statistical analysis and insights dashboard providing
 * correlation analysis, significance testing, predictive modeling,
 * and data quality assessments for business intelligence.
 */

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Calculator,
  CheckCircle,
  Download,
  Filter,
  Info,
  Layers,
  LineChart as LineChartIcon,
  PieChart,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import type {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for statistical data
interface CorrelationData {
  variable1: string;
  variable2: string;
  correlation: number;
  pValue: number;
  significance: "high" | "medium" | "low" | "none";
  sampleSize: number;
}

interface RegressionResult {
  equation: string;
  rSquared: number;
  coefficients: Array<{
    variable: string;
    coefficient: number;
    pValue: number;
    significance: boolean;
  }>;
  residuals: number[];
  predictions: Array<{
    actual: number;
    predicted: number;
    residual: number;
  }>;
}

interface StatisticalTest {
  testName: string;
  hypothesis: string;
  testStatistic: number;
  pValue: number;
  criticalValue: number;
  result: "reject" | "fail_to_reject";
  interpretation: string;
  confidenceLevel: number;
}

interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  outliers: Array<{
    metric: string;
    value: number;
    zScore: number;
    isOutlier: boolean;
  }>;
}

interface PredictiveModel {
  modelType: "linear" | "polynomial" | "exponential" | "seasonal";
  accuracy: number;
  features: string[];
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
  crossValidationScore: number;
  predictions: Array<{
    date: string;
    predicted: number;
    confidence: number;
  }>;
}

interface StatisticalInsightsProps {
  correlations: CorrelationData[];
  regressionResults?: RegressionResult;
  statisticalTests: StatisticalTest[];
  dataQuality: DataQualityMetrics;
  predictiveModels: PredictiveModel[];
  rawData: Array<Record<string, number>>;
  loading?: boolean;
  className?: string;
  onModelRetrain?: (modelType: string) => void;
  onDataRefresh?: () => void;
  onExportResults?: (format: "csv" | "pdf") => void;
}

// Utility functions
const getCorrelationStrength = (correlation: number) => {
  const abs = Math.abs(correlation);
  if (abs >= 0.8) return { strength: "Very Strong", color: "text-red-600" };
  if (abs >= 0.6) return { strength: "Strong", color: "text-orange-600" };
  if (abs >= 0.4) return { strength: "Moderate", color: "text-yellow-600" };
  if (abs >= 0.2) return { strength: "Weak", color: "text-blue-600" };
  return { strength: "Very Weak", color: "text-gray-600" };
};

const getSignificanceLevel = (pValue: number) => {
  if (pValue < 0.001)
    return { level: "***", color: "text-green-600", description: "Highly Significant" };
  if (pValue < 0.01)
    return { level: "**", color: "text-green-500", description: "Very Significant" };
  if (pValue < 0.05) return { level: "*", color: "text-green-400", description: "Significant" };
  if (pValue < 0.1)
    return { level: "†", color: "text-yellow-500", description: "Marginally Significant" };
  return { level: "ns", color: "text-gray-500", description: "Not Significant" };
};

const getQualityColor = (score: number) => {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const calculateCorrelationMatrix = (data: Array<Record<string, number>>) => {
  if (data.length === 0) return [];

  const keys = Object.keys(data[0]).filter((key) => typeof data[0][key] === "number");
  const matrix: Array<{ x: string; y: string; value: number }> = [];

  keys.forEach((key1) => {
    keys.forEach((key2) => {
      const values1 = data.map((d) => d[key1]).filter((v) => !isNaN(v));
      const values2 = data.map((d) => d[key2]).filter((v) => !isNaN(v));

      if (values1.length > 1 && values2.length > 1) {
        const correlation = calculatePearsonCorrelation(values1, values2);
        matrix.push({ x: key1, y: key2, value: correlation });
      }
    });
  });

  return matrix;
};

const calculatePearsonCorrelation = (x: number[], y: number[]) => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;

  const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
  const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
  const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export function StatisticalInsights({
  correlations,
  regressionResults,
  statisticalTests,
  dataQuality,
  predictiveModels,
  rawData,
  loading = false,
  className = "",
  onModelRetrain,
  onDataRefresh,
  onExportResults,
}: StatisticalInsightsProps) {
  const [selectedView, setSelectedView] = useState<
    "correlations" | "regression" | "tests" | "quality" | "models"
  >("correlations");
  const [selectedCorrelation, setSelectedCorrelation] = useState<string | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [showOnlySignificant, setShowOnlySignificant] = useState(false);

  // Calculate correlation matrix from raw data
  const correlationMatrix = useMemo(() => {
    return calculateCorrelationMatrix(rawData);
  }, [rawData]);

  // Filter significant correlations
  const significantCorrelations = useMemo(() => {
    return correlations
      .filter((c) => !showOnlySignificant || c.significance !== "none")
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [correlations, showOnlySignificant]);

  // Calculate overall statistics
  const statisticalSummary = useMemo(() => {
    const strongCorrelations = correlations.filter((c) => Math.abs(c.correlation) >= 0.6).length;
    const significantTests = statisticalTests.filter((t) => t.result === "reject").length;
    const overallDataQuality =
      (dataQuality.completeness +
        dataQuality.accuracy +
        dataQuality.consistency +
        dataQuality.validity +
        dataQuality.uniqueness) /
      5;

    const bestModel = predictiveModels.reduce(
      (best, model) => (model.accuracy > (best?.accuracy || 0) ? model : best),
      predictiveModels[0],
    );

    return {
      strongCorrelations,
      significantTests,
      overallDataQuality,
      bestModel,
      totalOutliers: dataQuality.outliers.filter((o) => o.isOutlier).length,
    };
  }, [correlations, statisticalTests, dataQuality, predictiveModels]);

  // Custom tooltip for correlation heatmap
  const CorrelationTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const strength = getCorrelationStrength(data.value);

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
            <span className={`font-medium ${strength.color}`}>{strength.strength}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Strong Correlations</p>
                <p className="text-2xl font-bold text-purple-900">
                  {statisticalSummary.strongCorrelations}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Significant Tests</p>
                <p className="text-2xl font-bold text-green-900">
                  {statisticalSummary.significantTests}/{statisticalTests.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Data Quality</p>
                <p className="text-2xl font-bold text-blue-900">
                  {statisticalSummary.overallDataQuality.toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Best Model</p>
                <p className="text-lg font-bold text-orange-900">
                  {(statisticalSummary.bestModel?.accuracy || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-orange-700 capitalize">
                  {statisticalSummary.bestModel?.modelType || "N/A"}
                </p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Statistical Analysis Tabs */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="regression">Regression</TabsTrigger>
            <TabsTrigger value="tests">Statistical Tests</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={showOnlySignificant ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlySignificant(!showOnlySignificant)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Significant Only
            </Button>
            <Button variant="outline" size="sm" onClick={onDataRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExportResults?.("csv")}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="correlations" className="mt-6">
          <div className="space-y-6">
            {/* Correlation Matrix Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Correlation Matrix
                </CardTitle>
                <CardDescription>
                  Visual representation of relationships between variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="category" dataKey="x" />
                      <YAxis type="category" dataKey="y" />
                      <Tooltip content={<CorrelationTooltip />} />
                      <Scatter data={correlationMatrix} fill="#8884d8">
                        {correlationMatrix.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              entry.value > 0
                                ? `rgba(34, 197, 94, ${Math.abs(entry.value)})`
                                : `rgba(239, 68, 68, ${Math.abs(entry.value)})`
                            }
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Correlation List */}
            <Card>
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
                <CardDescription>
                  Detailed correlation coefficients with significance testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {significantCorrelations.map((correlation, index) => {
                    const strength = getCorrelationStrength(correlation.correlation);
                    const significance = getSignificanceLevel(correlation.pValue);

                    return (
                      <div
                        key={`${correlation.variable1}-${correlation.variable2}`}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          setSelectedCorrelation(
                            selectedCorrelation ===
                              `${correlation.variable1}-${correlation.variable2}`
                              ? null
                              : `${correlation.variable1}-${correlation.variable2}`,
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
                            <Badge variant="outline" className={strength.color}>
                              {strength.strength}
                            </Badge>
                            <Badge
                              variant={significance.level === "ns" ? "secondary" : "default"}
                              className={significance.color}
                            >
                              {significance.level}
                            </Badge>
                          </div>
                        </div>

                        {selectedCorrelation ===
                          `${correlation.variable1}-${correlation.variable2}` && (
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regression" className="mt-6">
          {regressionResults ? (
            <div className="space-y-6">
              {/* Regression Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Regression Analysis
                  </CardTitle>
                  <CardDescription>{regressionResults.equation}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">R-Squared</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        {(regressionResults.rSquared * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-blue-700 mt-1">Variance Explained</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
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
                        <Activity className="h-4 w-4 text-purple-600" />
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
                </CardContent>
              </Card>

              {/* Coefficients Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Regression Coefficients</CardTitle>
                  <CardDescription>Variable contributions to the model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regressionResults.coefficients.map((coeff, index) => {
                      const significance = getSignificanceLevel(coeff.pValue);

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
                            <Badge
                              variant={coeff.significance ? "default" : "secondary"}
                              className={significance.color}
                            >
                              {significance.level}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              p = {coeff.pValue.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Residual Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Residual Analysis</CardTitle>
                  <CardDescription>Model fit assessment through residual patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={regressionResults.predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="predicted"
                          name="Predicted"
                          label={{
                            value: "Predicted Values",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          dataKey="residual"
                          name="Residual"
                          label={{ value: "Residuals", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value.toFixed(3),
                            name === "residual" ? "Residual" : "Predicted",
                          ]}
                        />
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                        <Scatter dataKey="residual" fill="#3b82f6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Regression Analysis Available
                </h3>
                <p className="text-gray-600">
                  Run a regression analysis to see detailed model results and diagnostics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <div className="space-y-6">
            {statisticalTests.map((test, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.testName}</CardTitle>
                      <CardDescription>{test.hypothesis}</CardDescription>
                    </div>
                    <Badge
                      variant={test.result === "reject" ? "default" : "secondary"}
                      className={test.result === "reject" ? "text-green-600" : "text-gray-600"}
                    >
                      {test.result === "reject" ? "Significant" : "Not Significant"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
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

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Interpretation:</strong> {test.interpretation}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}

            {statisticalTests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Statistical Tests Available
                  </h3>
                  <p className="text-gray-600">
                    Configure and run statistical tests to validate your hypotheses.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <div className="space-y-6">
            {/* Data Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { name: "Completeness", value: dataQuality.completeness, icon: CheckCircle },
                { name: "Accuracy", value: dataQuality.accuracy, icon: Target },
                { name: "Consistency", value: dataQuality.consistency, icon: Layers },
                { name: "Validity", value: dataQuality.validity, icon: Shield },
                { name: "Uniqueness", value: dataQuality.uniqueness, icon: Zap },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-5 w-5 ${getQualityColor(metric.value)}`} />
                        <span className={`text-2xl font-bold ${getQualityColor(metric.value)}`}>
                          {metric.value.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                      <Progress value={metric.value} className="mt-2 h-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Outlier Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Outlier Analysis
                </CardTitle>
                <CardDescription>Statistical outliers that may require attention</CardDescription>
              </CardHeader>
              <CardContent>
                {dataQuality.outliers.length > 0 ? (
                  <div className="space-y-3">
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
                            <Badge variant="destructive">
                              Z-Score: {outlier.zScore.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Outliers Detected</h3>
                    <p className="text-gray-600">
                      All data points fall within expected statistical ranges.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <div className="space-y-6">
            {/* Model Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Predictive Models Comparison
                </CardTitle>
                <CardDescription>
                  Performance comparison across different modeling approaches
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                          <Badge variant={model.accuracy >= 80 ? "default" : "secondary"}>
                            {model.accuracy.toFixed(1)}% Accuracy
                          </Badge>
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
                        <Progress value={model.accuracy} className="h-2" />
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
                                  style={{ width: `${feature.importance * 100}%` }}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onModelRetrain?.(model.modelType)}
                        >
                          Retrain Model
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {predictiveModels.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Predictive Models Available
                  </h3>
                  <p className="text-gray-600">
                    Train machine learning models to generate predictions and insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Statistical Insights Summary */}
      {statisticalSummary.strongCorrelations > 0 && (
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertDescription>
            <strong>Key Finding:</strong> {statisticalSummary.strongCorrelations} strong
            correlation(s) detected and {statisticalSummary.significantTests} statistical test(s)
            show significant results. Data quality is{" "}
            {statisticalSummary.overallDataQuality >= 80 ? "excellent" : "adequate"} at{" "}
            {statisticalSummary.overallDataQuality.toFixed(0)}%.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
