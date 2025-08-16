'use client';

/**
 * Statistical Insights Component for NeonPro
 *
 * Advanced statistical analysis and insights dashboard providing
 * correlation analysis, significance testing, predictive modeling,
 * and data quality assessments for business intelligence.
 */

import {
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
  PieChart,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types for statistical data
type CorrelationData = {
  variable1: string;
  variable2: string;
  correlation: number;
  pValue: number;
  significance: 'high' | 'medium' | 'low' | 'none';
  sampleSize: number;
};

type RegressionResult = {
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
};

type StatisticalTest = {
  testName: string;
  hypothesis: string;
  testStatistic: number;
  pValue: number;
  criticalValue: number;
  result: 'reject' | 'fail_to_reject';
  interpretation: string;
  confidenceLevel: number;
};

type DataQualityMetrics = {
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
};

type PredictiveModel = {
  modelType: 'linear' | 'polynomial' | 'exponential' | 'seasonal';
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
};

type StatisticalInsightsProps = {
  correlations: CorrelationData[];
  regressionResults?: RegressionResult;
  statisticalTests: StatisticalTest[];
  dataQuality: DataQualityMetrics;
  predictiveModels: PredictiveModel[];
  rawData: Record<string, number>[];
  loading?: boolean;
  className?: string;
  onModelRetrain?: (modelType: string) => void;
  onDataRefresh?: () => void;
  onExportResults?: (format: 'csv' | 'pdf') => void;
};

// Utility functions
const getCorrelationStrength = (correlation: number) => {
  const abs = Math.abs(correlation);
  if (abs >= 0.8) {
    return { strength: 'Very Strong', color: 'text-red-600' };
  }
  if (abs >= 0.6) {
    return { strength: 'Strong', color: 'text-orange-600' };
  }
  if (abs >= 0.4) {
    return { strength: 'Moderate', color: 'text-yellow-600' };
  }
  if (abs >= 0.2) {
    return { strength: 'Weak', color: 'text-blue-600' };
  }
  return { strength: 'Very Weak', color: 'text-gray-600' };
};

const getSignificanceLevel = (pValue: number) => {
  if (pValue < 0.001) {
    return {
      level: '***',
      color: 'text-green-600',
      description: 'Highly Significant',
    };
  }
  if (pValue < 0.01) {
    return {
      level: '**',
      color: 'text-green-500',
      description: 'Very Significant',
    };
  }
  if (pValue < 0.05) {
    return { level: '*', color: 'text-green-400', description: 'Significant' };
  }
  if (pValue < 0.1) {
    return {
      level: '†',
      color: 'text-yellow-500',
      description: 'Marginally Significant',
    };
  }
  return {
    level: 'ns',
    color: 'text-gray-500',
    description: 'Not Significant',
  };
};

const getQualityColor = (score: number) => {
  if (score >= 90) {
    return 'text-green-600';
  }
  if (score >= 75) {
    return 'text-blue-600';
  }
  if (score >= 60) {
    return 'text-yellow-600';
  }
  return 'text-red-600';
};

const calculateCorrelationMatrix = (data: Record<string, number>[]) => {
  if (data.length === 0) {
    return [];
  }

  const keys = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] === 'number',
  );
  const matrix: Array<{ x: string; y: string; value: number }> = [];

  keys.forEach((key1) => {
    keys.forEach((key2) => {
      const values1 = data.map((d) => d[key1]).filter((v) => !Number.isNaN(v));
      const values2 = data.map((d) => d[key2]).filter((v) => !Number.isNaN(v));

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
  if (n < 2) {
    return 0;
  }

  const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
  const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
  const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

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
  className = '',
  onModelRetrain,
  onDataRefresh,
  onExportResults,
}: StatisticalInsightsProps) {
  const [selectedView, setSelectedView] = useState<
    'correlations' | 'regression' | 'tests' | 'quality' | 'models'
  >('correlations');
  const [selectedCorrelation, setSelectedCorrelation] = useState<string | null>(
    null,
  );
  const [_confidenceLevel, _setConfidenceLevel] = useState<number>(95);
  const [showOnlySignificant, setShowOnlySignificant] = useState(false);

  // Calculate correlation matrix from raw data
  const correlationMatrix = useMemo(() => {
    return calculateCorrelationMatrix(rawData);
  }, [rawData]);

  // Filter significant correlations
  const significantCorrelations = useMemo(() => {
    return correlations
      .filter((c) => !showOnlySignificant || c.significance !== 'none')
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [correlations, showOnlySignificant]);

  // Calculate overall statistics
  const statisticalSummary = useMemo(() => {
    const strongCorrelations = correlations.filter(
      (c) => Math.abs(c.correlation) >= 0.6,
    ).length;
    const significantTests = statisticalTests.filter(
      (t) => t.result === 'reject',
    ).length;
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
    if (!(active && payload && payload.length)) {
      return null;
    }

    const data = payload[0].payload;
    const strength = getCorrelationStrength(data.value);

    return (
      <div className="max-w-xs rounded-lg border bg-white p-4 shadow-lg">
        <p className="mb-2 font-semibold text-gray-900">
          {data.x} vs {data.y}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Correlation:</span>
            <span className="font-medium">{data.value.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Strength:</span>
            <span className={`font-medium ${strength.color}`}>
              {strength.strength}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-8 rounded bg-gray-200" />
                <div className="h-3 rounded bg-gray-100" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 rounded bg-gray-100" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Statistical Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-600 text-sm">
                  Strong Correlations
                </p>
                <p className="font-bold text-2xl text-purple-900">
                  {statisticalSummary.strongCorrelations}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-600 text-sm">
                  Significant Tests
                </p>
                <p className="font-bold text-2xl text-green-900">
                  {statisticalSummary.significantTests}/
                  {statisticalTests.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-600 text-sm">
                  Data Quality
                </p>
                <p className="font-bold text-2xl text-blue-900">
                  {statisticalSummary.overallDataQuality.toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-600 text-sm">
                  Best Model
                </p>
                <p className="font-bold text-lg text-orange-900">
                  {(statisticalSummary.bestModel?.accuracy || 0).toFixed(1)}%
                </p>
                <p className="text-orange-700 text-xs capitalize">
                  {statisticalSummary.bestModel?.modelType || 'N/A'}
                </p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Statistical Analysis Tabs */}
      <Tabs
        onValueChange={(value: any) => setSelectedView(value)}
        value={selectedView}
      >
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
              onClick={() => setShowOnlySignificant(!showOnlySignificant)}
              size="sm"
              variant={showOnlySignificant ? 'default' : 'outline'}
            >
              <Filter className="mr-1 h-4 w-4" />
              Significant Only
            </Button>
            <Button onClick={onDataRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => onExportResults?.('csv')}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent className="mt-6" value="correlations">
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
                  <ResponsiveContainer height="100%" width="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" type="category" />
                      <YAxis dataKey="y" type="category" />
                      <Tooltip content={<CorrelationTooltip />} />
                      <Scatter data={correlationMatrix} fill="#8884d8">
                        {correlationMatrix.map((entry, index) => (
                          <Cell
                            fill={
                              entry.value > 0
                                ? `rgba(34, 197, 94, ${Math.abs(entry.value)})`
                                : `rgba(239, 68, 68, ${Math.abs(entry.value)})`
                            }
                            key={index}
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
                  {significantCorrelations.map((correlation, _index) => {
                    const strength = getCorrelationStrength(
                      correlation.correlation,
                    );
                    const significance = getSignificanceLevel(
                      correlation.pValue,
                    );

                    return (
                      <div
                        className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
                        key={`${correlation.variable1}-${correlation.variable2}`}
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
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                              <span>
                                r = {correlation.correlation.toFixed(3)}
                              </span>
                              <span>p = {correlation.pValue.toFixed(4)}</span>
                              <span>n = {correlation.sampleSize}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={strength.color} variant="outline">
                              {strength.strength}
                            </Badge>
                            <Badge
                              className={significance.color}
                              variant={
                                significance.level === 'ns'
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {significance.level}
                            </Badge>
                          </div>
                        </div>

                        {selectedCorrelation ===
                          `${correlation.variable1}-${correlation.variable2}` && (
                          <div className="mt-4 border-t pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Interpretation:</strong>
                                <p className="mt-1 text-gray-600">
                                  {Math.abs(correlation.correlation) < 0.3
                                    ? 'Little to no linear relationship between variables.'
                                    : correlation.correlation > 0
                                      ? 'Positive relationship: as one variable increases, the other tends to increase.'
                                      : 'Negative relationship: as one variable increases, the other tends to decrease.'}
                                </p>
                              </div>
                              <div>
                                <strong>Statistical Significance:</strong>
                                <p className="mt-1 text-gray-600">
                                  {significance.description}.{' '}
                                  {correlation.pValue < 0.05
                                    ? 'The relationship is statistically significant.'
                                    : 'The relationship may be due to chance.'}
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

        <TabsContent className="mt-6" value="regression">
          {regressionResults ? (
            <div className="space-y-6">
              {/* Regression Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Regression Analysis
                  </CardTitle>
                  <CardDescription>
                    {regressionResults.equation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-700 text-sm">
                          R-Squared
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-2xl text-blue-900">
                        {(regressionResults.rSquared * 100).toFixed(1)}%
                      </p>
                      <p className="mt-1 text-blue-700 text-xs">
                        Variance Explained
                      </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700 text-sm">
                          Significant Coefficients
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-2xl text-green-900">
                        {
                          regressionResults.coefficients.filter(
                            (c) => c.significance,
                          ).length
                        }
                      </p>
                      <p className="mt-1 text-green-700 text-xs">
                        of {regressionResults.coefficients.length} total
                      </p>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-purple-700 text-sm">
                          Model Fit
                        </span>
                      </div>
                      <p className="mt-1 font-bold text-2xl text-purple-900">
                        {regressionResults.rSquared >= 0.8
                          ? 'Excellent'
                          : regressionResults.rSquared >= 0.6
                            ? 'Good'
                            : regressionResults.rSquared >= 0.4
                              ? 'Fair'
                              : 'Poor'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coefficients Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Regression Coefficients</CardTitle>
                  <CardDescription>
                    Variable contributions to the model
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regressionResults.coefficients.map((coeff, _index) => {
                      const significance = getSignificanceLevel(coeff.pValue);

                      return (
                        <div
                          className="flex items-center justify-between rounded border p-3"
                          key={coeff.variable}
                        >
                          <div>
                            <h4 className="font-medium">{coeff.variable}</h4>
                            <p className="text-gray-600 text-sm">
                              Coefficient: {coeff.coefficient.toFixed(4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={significance.color}
                              variant={
                                coeff.significance ? 'default' : 'secondary'
                              }
                            >
                              {significance.level}
                            </Badge>
                            <p className="mt-1 text-gray-600 text-xs">
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
                  <CardDescription>
                    Model fit assessment through residual patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer height="100%" width="100%">
                      <ScatterChart data={regressionResults.predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="predicted"
                          label={{
                            value: 'Predicted Values',
                            position: 'insideBottom',
                            offset: -5,
                          }}
                          name="Predicted"
                        />
                        <YAxis
                          dataKey="residual"
                          label={{
                            value: 'Residuals',
                            angle: -90,
                            position: 'insideLeft',
                          }}
                          name="Residual"
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value.toFixed(3),
                            name === 'residual' ? 'Residual' : 'Predicted',
                          ]}
                        />
                        <ReferenceLine
                          stroke="#666"
                          strokeDasharray="2 2"
                          y={0}
                        />
                        <Scatter dataKey="residual" fill="#3b82f6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 font-medium text-gray-900 text-lg">
                  No Regression Analysis Available
                </h3>
                <p className="text-gray-600">
                  Run a regression analysis to see detailed model results and
                  diagnostics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent className="mt-6" value="tests">
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
                      className={
                        test.result === 'reject'
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }
                      variant={
                        test.result === 'reject' ? 'default' : 'secondary'
                      }
                    >
                      {test.result === 'reject'
                        ? 'Significant'
                        : 'Not Significant'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Test Statistic</p>
                      <p className="font-bold text-xl">
                        {test.testStatistic.toFixed(3)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">P-Value</p>
                      <p className="font-bold text-xl">
                        {test.pValue.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Critical Value</p>
                      <p className="font-bold text-xl">
                        {test.criticalValue.toFixed(3)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Confidence Level</p>
                      <p className="font-bold text-xl">
                        {test.confidenceLevel}%
                      </p>
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
                <CardContent className="py-12 text-center">
                  <Calculator className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No Statistical Tests Available
                  </h3>
                  <p className="text-gray-600">
                    Configure and run statistical tests to validate your
                    hypotheses.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="quality">
          <div className="space-y-6">
            {/* Data Quality Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              {[
                {
                  name: 'Completeness',
                  value: dataQuality.completeness,
                  icon: CheckCircle,
                },
                { name: 'Accuracy', value: dataQuality.accuracy, icon: Target },
                {
                  name: 'Consistency',
                  value: dataQuality.consistency,
                  icon: Layers,
                },
                { name: 'Validity', value: dataQuality.validity, icon: Shield },
                {
                  name: 'Uniqueness',
                  value: dataQuality.uniqueness,
                  icon: Zap,
                },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.name}>
                    <CardContent className="p-6">
                      <div className="mb-2 flex items-center justify-between">
                        <Icon
                          className={`h-5 w-5 ${getQualityColor(metric.value)}`}
                        />
                        <span
                          className={`font-bold text-2xl ${getQualityColor(metric.value)}`}
                        >
                          {metric.value.toFixed(0)}%
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        {metric.name}
                      </p>
                      <Progress className="mt-2 h-2" value={metric.value} />
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
                <CardDescription>
                  Statistical outliers that may require attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dataQuality.outliers.length > 0 ? (
                  <div className="space-y-3">
                    {dataQuality.outliers
                      .filter((outlier) => outlier.isOutlier)
                      .map((outlier, index) => (
                        <div
                          className="flex items-center justify-between rounded border p-3"
                          key={index}
                        >
                          <div>
                            <h4 className="font-medium">{outlier.metric}</h4>
                            <p className="text-gray-600 text-sm">
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
                  <div className="py-8 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                    <h3 className="mb-2 font-medium text-gray-900 text-lg">
                      No Outliers Detected
                    </h3>
                    <p className="text-gray-600">
                      All data points fall within expected statistical ranges.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="mt-6" value="models">
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
                    <div className="rounded-lg border p-4" key={index}>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize">
                            {model.modelType} Model
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Features: {model.features.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              model.accuracy >= 80 ? 'default' : 'secondary'
                            }
                          >
                            {model.accuracy.toFixed(1)}% Accuracy
                          </Badge>
                          <p className="mt-1 text-gray-600 text-xs">
                            CV Score: {model.crossValidationScore.toFixed(3)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-gray-600 text-sm">
                            Model Performance
                          </span>
                          <span className="font-medium text-sm">
                            {model.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <Progress className="h-2" value={model.accuracy} />
                      </div>

                      {/* Feature Importance */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-700 text-sm">
                          Feature Importance
                        </h5>
                        {model.featureImportance
                          .slice(0, 3)
                          .map((feature, idx) => (
                            <div
                              className="flex items-center justify-between text-sm"
                              key={idx}
                            >
                              <span className="text-gray-600">
                                {feature.feature}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 rounded bg-gray-200">
                                  <div
                                    className="h-full rounded bg-blue-500"
                                    style={{
                                      width: `${feature.importance * 100}%`,
                                    }}
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
                          onClick={() => onModelRetrain?.(model.modelType)}
                          size="sm"
                          variant="outline"
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
                <CardContent className="py-12 text-center">
                  <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No Predictive Models Available
                  </h3>
                  <p className="text-gray-600">
                    Train machine learning models to generate predictions and
                    insights.
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
            <strong>Key Finding:</strong>{' '}
            {statisticalSummary.strongCorrelations} strong correlation(s)
            detected and {statisticalSummary.significantTests} statistical
            test(s) show significant results. Data quality is{' '}
            {statisticalSummary.overallDataQuality >= 80
              ? 'excellent'
              : 'adequate'}{' '}
            at {statisticalSummary.overallDataQuality.toFixed(0)}%.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
