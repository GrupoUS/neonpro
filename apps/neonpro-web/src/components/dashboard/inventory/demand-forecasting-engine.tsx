"use client";

import type { useDemandForecasting } from "@/app/hooks/useDemandForecasting";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { useEffect, useState } from "react";

interface DemandForecastingEngineProps {
  clinicId: string;
  inventoryItems: Array<{
    id: string;
    name: string;
    category: string;
    current_stock: number;
  }>;
}

export function DemandForecastingEngine({
  clinicId,
  inventoryItems,
}: DemandForecastingEngineProps) {
  const {
    isLoading,
    forecast,
    bulkForecasts,
    seasonalAnalysis,
    accuracyAnalysis,
    capabilities,
    generateForecast,
    generateBulkForecast,
    analyzeSeasonalPatterns,
    getAccuracyAnalysis,
    getCapabilities,
    clearForecast,
    clearBulkForecasts,
    clearSeasonalAnalysis,
    calculateConfidenceScore,
    getForecastRecommendations,
  } = useDemandForecasting();

  // Form states
  const [selectedItem, setSelectedItem] = useState("");
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [bulkItems, setBulkItems] = useState<string[]>([]);
  const [analysisPeriod, setAnalysisPeriod] = useState(365);

  useEffect(() => {
    getCapabilities(clinicId);
  }, [clinicId, getCapabilities]);

  const handleSingleForecast = async () => {
    if (!selectedItem) return;

    await generateForecast({
      itemId: selectedItem,
      clinicId,
      forecastPeriod,
      confidenceLevel,
    });
  };

  const handleBulkForecast = async () => {
    if (bulkItems.length === 0) return;

    await generateBulkForecast({
      items: bulkItems.map((itemId) => ({ itemId, forecastPeriod })),
      clinicId,
      confidenceLevel,
    });
  };

  const handleSeasonalAnalysis = async () => {
    if (!selectedItem) return;

    await analyzeSeasonalPatterns(selectedItem, clinicId, analysisPeriod);
  };

  const handleAccuracyAnalysis = async (period: string = "30d") => {
    await getAccuracyAnalysis(clinicId, undefined, period);
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case "exponential_smoothing":
        return <TrendingUp className="h-4 w-4" />;
      case "seasonal_decomposition":
        return <Calendar className="h-4 w-4" />;
      case "linear_regression":
        return <BarChart3 className="h-4 w-4" />;
      case "moving_average":
        return <Activity className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getModelName = (model: string) => {
    switch (model) {
      case "exponential_smoothing":
        return "Exponential Smoothing";
      case "seasonal_decomposition":
        return "Seasonal Decomposition";
      case "linear_regression":
        return "Linear Regression";
      case "moving_average":
        return "Moving Average";
      default:
        return "Unknown Model";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatPeriod = (days: number) => {
    if (days === 1) return "1 day";
    if (days === 7) return "1 week";
    if (days === 30) return "1 month";
    if (days === 90) return "3 months";
    if (days === 365) return "1 year";
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Demand Forecasting Engine</h2>
          <p className="text-muted-foreground">
            AI-powered demand prediction and seasonal analysis
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Advanced Analytics
        </Badge>
      </div>

      <Tabs defaultValue="single-forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single-forecast">Single Forecast</TabsTrigger>
          <TabsTrigger value="bulk-forecast">Bulk Forecast</TabsTrigger>
          <TabsTrigger value="seasonal-analysis">Seasonal Analysis</TabsTrigger>
          <TabsTrigger value="accuracy-tracking">Accuracy Tracking</TabsTrigger>
        </TabsList>

        {/* Single Forecast */}
        <TabsContent value="single-forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Single Item Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-select">Select Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item to forecast" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forecast-period">Forecast Period (days)</Label>
                  <Select
                    value={forecastPeriod.toString()}
                    onValueChange={(value) => setForecastPeriod(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence-level">Confidence Level</Label>
                  <Select
                    value={confidenceLevel.toString()}
                    onValueChange={(value) => setConfidenceLevel(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.80">80%</SelectItem>
                      <SelectItem value="0.90">90%</SelectItem>
                      <SelectItem value="0.95">95%</SelectItem>
                      <SelectItem value="0.99">99%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSingleForecast}
                  disabled={!selectedItem || isLoading}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Generate Forecast
                </Button>
                {forecast && (
                  <Button variant="outline" onClick={clearForecast}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Single Forecast Results */}
          {forecast && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Forecast Results: {forecast.itemName}</span>
                  <div className="flex items-center gap-2">
                    {getModelIcon(forecast.modelUsed)}
                    <Badge variant="secondary">{getModelName(forecast.modelUsed)}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {forecast.predictedDemand}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Predicted Demand ({formatPeriod(forecast.forecastPeriod)})
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {forecast.confidenceInterval.lower} - {forecast.confidenceInterval.upper}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(forecast.confidenceInterval.level * 100)}% Confidence Interval
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getConfidenceColor(calculateConfidenceScore(forecast))}`}
                          />
                          <span className="text-lg font-semibold">
                            {Math.round(calculateConfidenceScore(forecast) * 100)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">Forecast Confidence</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Accuracy Metrics */}
                <div>
                  <h4 className="font-semibold mb-3">Model Accuracy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>MAPE</span>
                        <span>{Math.round(forecast.accuracy.mape * 100)}%</span>
                      </div>
                      <Progress value={Math.max(0, 100 - forecast.accuracy.mape * 100)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>RMSE</span>
                        <span>{forecast.accuracy.rmse.toFixed(2)}</span>
                      </div>
                      <Progress value={Math.max(0, 100 - forecast.accuracy.rmse)} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Last Period Accuracy</span>
                        <span>{Math.round(forecast.accuracy.lastPeriodAccuracy * 100)}%</span>
                      </div>
                      <Progress value={forecast.accuracy.lastPeriodAccuracy * 100} />
                    </div>
                  </div>
                </div>

                {/* Trend Analysis */}
                {forecast.trendComponent !== 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Trend Analysis</h4>
                    <div className="flex items-center gap-2">
                      {forecast.trendComponent > 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">
                        {forecast.trendComponent > 0 ? "Increasing" : "Decreasing"} trend detected (
                        {Math.abs(forecast.trendComponent * 100).toFixed(1)}% change)
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {forecast.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {getForecastRecommendations(forecast, seasonalAnalysis || undefined).map(
                        (rec, index) => (
                          <Alert key={index}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bulk Forecast */}
        <TabsContent value="bulk-forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Bulk Forecast Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Items (hold Ctrl for multiple)</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`bulk-${item.id}`}
                          checked={bulkItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkItems([...bulkItems, item.id]);
                            } else {
                              setBulkItems(bulkItems.filter((id) => id !== item.id));
                            }
                          }}
                        />
                        <label htmlFor={`bulk-${item.id}`} className="text-sm">
                          {item.name} ({item.category})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-period">Forecast Period</Label>
                    <Select
                      value={forecastPeriod.toString()}
                      onValueChange={(value) => setForecastPeriod(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk-confidence">Confidence Level</Label>
                    <Select
                      value={confidenceLevel.toString()}
                      onValueChange={(value) => setConfidenceLevel(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.80">80%</SelectItem>
                        <SelectItem value="0.90">90%</SelectItem>
                        <SelectItem value="0.95">95%</SelectItem>
                        <SelectItem value="0.99">99%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleBulkForecast}
                  disabled={bulkItems.length === 0 || isLoading}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Generate Bulk Forecasts ({bulkItems.length} items)
                </Button>
                {bulkForecasts.length > 0 && (
                  <Button variant="outline" onClick={clearBulkForecasts}>
                    Clear Results
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bulk Forecast Results */}
          {bulkForecasts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Forecast Results ({bulkForecasts.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bulkForecasts.map((forecast) => (
                    <div key={forecast.itemId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{forecast.itemName}</h4>
                        <div className="flex items-center gap-2">
                          {getModelIcon(forecast.modelUsed)}
                          <Badge variant="outline">{getModelName(forecast.modelUsed)}</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Predicted Demand:</span>
                          <div className="font-semibold text-blue-600">
                            {forecast.predictedDemand}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence Range:</span>
                          <div className="font-semibold">
                            {forecast.confidenceInterval.lower} -{" "}
                            {forecast.confidenceInterval.upper}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Model Accuracy:</span>
                          <div className="font-semibold">
                            {Math.round((1 - forecast.accuracy.mape) * 100)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence Score:</span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${getConfidenceColor(calculateConfidenceScore(forecast))}`}
                            />
                            <span className="font-semibold">
                              {Math.round(calculateConfidenceScore(forecast) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Seasonal Analysis */}
        <TabsContent value="seasonal-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seasonal Pattern Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasonal-item">Select Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an item to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis-period">Analysis Period</Label>
                  <Select
                    value={analysisPeriod.toString()}
                    onValueChange={(value) => setAnalysisPeriod(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSeasonalAnalysis}
                  disabled={!selectedItem || isLoading}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Analyze Patterns
                </Button>
                {seasonalAnalysis && (
                  <Button variant="outline" onClick={clearSeasonalAnalysis}>
                    Clear Analysis
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Analysis Results */}
          {seasonalAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Statistics */}
                <div>
                  <h4 className="font-semibold mb-3">Consumption Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {seasonalAnalysis.statistics.totalConsumption}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Consumption</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {seasonalAnalysis.statistics.averageDailyConsumption.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Daily Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(seasonalAnalysis.statistics.coefficientOfVariation * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Variability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {seasonalAnalysis.dataPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">Data Points</div>
                    </div>
                  </div>
                </div>

                {/* Seasonal Patterns */}
                {seasonalAnalysis.seasonalPatterns.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Detected Patterns</h4>
                    <div className="space-y-3">
                      {seasonalAnalysis.seasonalPatterns.map((pattern, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold capitalize">
                              {pattern.pattern} Pattern
                            </span>
                            <Badge
                              variant={
                                pattern.strength > 0.7
                                  ? "default"
                                  : pattern.strength > 0.4
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {Math.round(pattern.strength * 100)}% strength
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pattern.peaks.length > 0 && (
                              <div>Peak periods: {pattern.peaks.join(", ")}</div>
                            )}
                            {pattern.valleys.length > 0 && (
                              <div>Low periods: {pattern.valleys.join(", ")}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Demand Drivers */}
                <div>
                  <h4 className="font-semibold mb-3">Demand Drivers</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${seasonalAnalysis.demandDrivers.appointmentBased ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-sm">Appointment-Based</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${seasonalAnalysis.demandDrivers.seasonalInfluenced ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-sm">Seasonal Influence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${seasonalAnalysis.demandDrivers.highVariability ? "bg-red-500" : "bg-gray-300"}`}
                      />
                      <span className="text-sm">High Variability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${seasonalAnalysis.demandDrivers.steadyDemand ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className="text-sm">Steady Demand</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {seasonalAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Analysis Recommendations</h4>
                    <div className="space-y-2">
                      {seasonalAnalysis.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Accuracy Tracking */}
        <TabsContent value="accuracy-tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Forecast Accuracy Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handleAccuracyAnalysis("7d")} disabled={isLoading}>
                  Last 7 Days
                </Button>
                <Button onClick={() => handleAccuracyAnalysis("30d")} disabled={isLoading}>
                  Last 30 Days
                </Button>
                <Button onClick={() => handleAccuracyAnalysis("90d")} disabled={isLoading}>
                  Last 90 Days
                </Button>
                <Button onClick={() => handleAccuracyAnalysis("1y")} disabled={isLoading}>
                  Last Year
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accuracy Results */}
          {accuracyAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Analysis - {accuracyAnalysis.period}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Statistics */}
                <div>
                  <h4 className="font-semibold mb-3">Overall Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(accuracyAnalysis.overallStatistics.averageAccuracy * 100)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(
                          accuracyAnalysis.overallStatistics.confidenceIntervalHitRate * 100,
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">CI Hit Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {(accuracyAnalysis.overallStatistics.averageMAPE * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average MAPE</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {accuracyAnalysis.totalForecasts}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Forecasts</div>
                    </div>
                  </div>
                </div>

                {/* Model Performance */}
                <div>
                  <h4 className="font-semibold mb-3">Model Performance</h4>
                  <div className="space-y-3">
                    {Object.entries(accuracyAnalysis.byModel).map(
                      ([model, data]: [string, any]) => (
                        <div key={model} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getModelIcon(model)}
                              <span className="font-semibold">{getModelName(model)}</span>
                            </div>
                            <Badge variant="outline">{data.usage} forecasts</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Accuracy:</span>
                              <div className="font-semibold">
                                {Math.round(data.statistics.averageAccuracy * 100)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">MAPE:</span>
                              <div className="font-semibold">
                                {(data.statistics.averageMAPE * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">CI Hit Rate:</span>
                              <div className="font-semibold">
                                {Math.round(data.statistics.confidenceIntervalHitRate * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Trend Analysis */}
                {accuracyAnalysis.trends && (
                  <div>
                    <h4 className="font-semibold mb-3">Accuracy Trends</h4>
                    <div className="flex items-center gap-2 mb-4">
                      {accuracyAnalysis.trends.trend.direction === "improving" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm">
                        Accuracy is {accuracyAnalysis.trends.trend.direction}
                        {accuracyAnalysis.trends.trend.isSignificant && (
                          <Badge variant="outline" className="ml-2">
                            Significant
                          </Badge>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {accuracyAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Improvement Recommendations</h4>
                    <div className="space-y-2">
                      {accuracyAnalysis.recommendations.map((rec, index) => (
                        <Alert key={index}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Generating forecast analysis...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
