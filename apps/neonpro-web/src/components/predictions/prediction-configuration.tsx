/**
 * Story 11.2: Prediction Configuration Component
 * Configure no-show prediction models, thresholds, and system parameters
 */

"use client";

import type {
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  Download,
  Info,
  Pause,
  Play,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Target,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Slider } from "@/components/ui/slider";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

interface ModelConfiguration {
  id: string;
  name: string;
  type: "ENSEMBLE" | "NEURAL_NETWORK" | "RANDOM_FOREST" | "GRADIENT_BOOSTING";
  version: string;
  accuracy: number;
  isActive: boolean;
  lastTrained: Date;
  parameters: {
    learningRate: number;
    maxDepth: number;
    minSamplesLeaf: number;
    nEstimators: number;
  };
}

interface RiskThresholds {
  low: number;
  medium: number;
  high: number;
}

interface PredictionSettings {
  enabled: boolean;
  autoRetraining: boolean;
  retrainingInterval: number; // days
  predictionWindow: number; // hours before appointment
  minimumConfidence: number;
  riskThresholds: RiskThresholds;
  features: {
    historicalData: boolean;
    demographicInfo: boolean;
    appointmentCharacteristics: boolean;
    externalFactors: boolean;
    communicationPatterns: boolean;
  };
  notifications: {
    highRiskPatients: boolean;
    modelPerformanceDrop: boolean;
    retrainingRequired: boolean;
    predictionErrors: boolean;
  };
}

interface PredictionConfigurationProps {
  currentConfiguration: PredictionSettings;
  availableModels: ModelConfiguration[];
  onSaveConfiguration: (config: PredictionSettings) => void;
  onActivateModel: (modelId: string) => void;
  onRetrainModel: (modelId: string) => void;
}

export function PredictionConfiguration({
  currentConfiguration,
  availableModels,
  onSaveConfiguration,
  onActivateModel,
  onRetrainModel,
}: PredictionConfigurationProps) {
  const [config, setConfig] = useState<PredictionSettings>(currentConfiguration);
  const [activeTab, setActiveTab] = useState<
    "general" | "models" | "thresholds" | "features" | "notifications"
  >("general");
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Update configuration and mark as changed
   */
  const updateConfig = (updates: Partial<PredictionSettings>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  /**
   * Update nested configuration properties
   */
  const updateNestedConfig = <T extends keyof PredictionSettings>(
    key: T,
    updates: Partial<PredictionSettings[T]>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
    setHasChanges(true);
  };

  /**
   * Save configuration
   */
  const handleSaveConfiguration = () => {
    onSaveConfiguration(config);
    setHasChanges(false);
  };

  /**
   * Reset to original configuration
   */
  const handleResetConfiguration = () => {
    setConfig(currentConfiguration);
    setHasChanges(false);
  };

  /**
   * Get model type display info
   */
  const getModelTypeInfo = (type: ModelConfiguration["type"]) => {
    const typeMap = {
      ENSEMBLE: { label: "Ensemble", color: "bg-purple-100 text-purple-800" },
      NEURAL_NETWORK: { label: "Neural Network", color: "bg-blue-100 text-blue-800" },
      RANDOM_FOREST: { label: "Random Forest", color: "bg-green-100 text-green-800" },
      GRADIENT_BOOSTING: { label: "Gradient Boosting", color: "bg-orange-100 text-orange-800" },
    };
    return typeMap[type];
  };

  /**
   * Get accuracy color
   */
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  /**
   * Format threshold display
   */
  const formatThreshold = (value: number): string => {
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prediction Configuration</h2>
          <p className="text-muted-foreground">
            Configure no-show prediction models, thresholds, and system parameters
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Alert className="py-2 px-3">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">You have unsaved changes</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={handleResetConfiguration} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveConfiguration} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${config.enabled ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="font-medium">
                  Prediction System: {config.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <Badge variant={config.enabled ? "default" : "secondary"}>
                {availableModels.filter((m) => m.isActive).length} models active
              </Badge>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Prediction Window (hours before appointment)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[config.predictionWindow]}
                      onValueChange={([value]) => updateConfig({ predictionWindow: value })}
                      max={168}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 hour</span>
                      <span className="font-medium">{config.predictionWindow} hours</span>
                      <span>7 days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Confidence Level (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[config.minimumConfidence]}
                      onValueChange={([value]) => updateConfig({ minimumConfidence: value })}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50%</span>
                      <span className="font-medium">{config.minimumConfidence}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatic Model Retraining</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retrain models based on performance and new data
                    </p>
                  </div>
                  <Switch
                    checked={config.autoRetraining}
                    onCheckedChange={(autoRetraining) => updateConfig({ autoRetraining })}
                  />
                </div>

                {config.autoRetraining && (
                  <div className="space-y-2 ml-4">
                    <Label>Retraining Interval (days)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[config.retrainingInterval]}
                        onValueChange={([value]) => updateConfig({ retrainingInterval: value })}
                        max={90}
                        min={7}
                        step={7}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Weekly</span>
                        <span className="font-medium">{config.retrainingInterval} days</span>
                        <span>Quarterly</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {availableModels.find((m) => m.isActive)?.accuracy.toFixed(1) || 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Model Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{config.predictionWindow}h</div>
                  <div className="text-xs text-muted-foreground">Prediction Window</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {config.minimumConfidence}%
                  </div>
                  <div className="text-xs text-muted-foreground">Min Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {availableModels.filter((m) => m.isActive).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Models</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          {/* Available Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Prediction Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableModels.map((model) => {
                  const typeInfo = getModelTypeInfo(model.type);

                  return (
                    <Card
                      key={model.id}
                      className={`p-4 ${model.isActive ? "border-green-200 bg-green-50/50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            {model.isActive && <Badge variant="default">Active</Badge>}
                          </div>
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                          <span className="text-sm text-muted-foreground">v{model.version}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getAccuracyColor(model.accuracy)}`}>
                            {model.accuracy.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Learning Rate</div>
                          <div className="text-sm font-medium">{model.parameters.learningRate}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Max Depth</div>
                          <div className="text-sm font-medium">{model.parameters.maxDepth}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Min Samples</div>
                          <div className="text-sm font-medium">
                            {model.parameters.minSamplesLeaf}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Estimators</div>
                          <div className="text-sm font-medium">{model.parameters.nEstimators}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Last trained: {model.lastTrained.toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetrainModel(model.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Retrain
                          </Button>
                          {!model.isActive ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => onActivateModel(model.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Active
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Model Management */}
          <Card>
            <CardHeader>
              <CardTitle>Model Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Model
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </Button>
                <Button variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Train New Model
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-6">
          {/* Risk Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Risk Level Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Low Risk Threshold</Label>
                    <span className="text-sm font-medium text-green-600">
                      0% - {formatThreshold(config.riskThresholds.low)}
                    </span>
                  </div>
                  <Slider
                    value={[config.riskThresholds.low]}
                    onValueChange={([value]) =>
                      updateNestedConfig("riskThresholds", { low: value })
                    }
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Medium Risk Threshold</Label>
                    <span className="text-sm font-medium text-yellow-600">
                      {formatThreshold(config.riskThresholds.low + 1)} -{" "}
                      {formatThreshold(config.riskThresholds.medium)}
                    </span>
                  </div>
                  <Slider
                    value={[config.riskThresholds.medium]}
                    onValueChange={([value]) =>
                      updateNestedConfig("riskThresholds", { medium: value })
                    }
                    max={80}
                    min={config.riskThresholds.low + 5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>High Risk Threshold</Label>
                    <span className="text-sm font-medium text-red-600">
                      {formatThreshold(config.riskThresholds.medium + 1)} -{" "}
                      {formatThreshold(config.riskThresholds.high)}
                    </span>
                  </div>
                  <Slider
                    value={[config.riskThresholds.high]}
                    onValueChange={([value]) =>
                      updateNestedConfig("riskThresholds", { high: value })
                    }
                    max={95}
                    min={config.riskThresholds.medium + 5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Very High Risk</Label>
                    <span className="text-sm font-medium text-red-800">
                      {formatThreshold(config.riskThresholds.high + 1)} - 100%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Automatic threshold based on High Risk setting
                  </div>
                </div>
              </div>

              {/* Threshold Preview */}
              <div className="mt-6">
                <Label className="text-base">Risk Level Preview</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm">Low Risk: 0% - {config.riskThresholds.low}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded" />
                    <span className="text-sm">
                      Medium Risk: {config.riskThresholds.low + 1}% - {config.riskThresholds.medium}
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span className="text-sm">
                      High Risk: {config.riskThresholds.medium + 1}% - {config.riskThresholds.high}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-800 rounded" />
                    <span className="text-sm">
                      Very High Risk: {config.riskThresholds.high + 1}% - 100%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threshold Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Threshold Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">65%</div>
                  <div className="text-xs text-muted-foreground">Low Risk Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">25%</div>
                  <div className="text-xs text-muted-foreground">Medium Risk Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">8%</div>
                  <div className="text-xs text-muted-foreground">High Risk Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800">2%</div>
                  <div className="text-xs text-muted-foreground">Very High Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Feature Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Prediction Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Historical Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Patient's past appointment history, no-show patterns, and attendance trends
                    </p>
                  </div>
                  <Switch
                    checked={config.features.historicalData}
                    onCheckedChange={(historicalData) =>
                      updateNestedConfig("features", { historicalData })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Demographic Information</Label>
                    <p className="text-sm text-muted-foreground">
                      Age, gender, location, insurance type, and socioeconomic factors
                    </p>
                  </div>
                  <Switch
                    checked={config.features.demographicInfo}
                    onCheckedChange={(demographicInfo) =>
                      updateNestedConfig("features", { demographicInfo })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Appointment Characteristics</Label>
                    <p className="text-sm text-muted-foreground">
                      Time of day, day of week, appointment type, duration, and specialty
                    </p>
                  </div>
                  <Switch
                    checked={config.features.appointmentCharacteristics}
                    onCheckedChange={(appointmentCharacteristics) =>
                      updateNestedConfig("features", { appointmentCharacteristics })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">External Factors</Label>
                    <p className="text-sm text-muted-foreground">
                      Weather conditions, traffic patterns, holidays, and seasonal effects
                    </p>
                  </div>
                  <Switch
                    checked={config.features.externalFactors}
                    onCheckedChange={(externalFactors) =>
                      updateNestedConfig("features", { externalFactors })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Communication Patterns</Label>
                    <p className="text-sm text-muted-foreground">
                      Response rates to reminders, preferred contact methods, and engagement history
                    </p>
                  </div>
                  <Switch
                    checked={config.features.communicationPatterns}
                    onCheckedChange={(communicationPatterns) =>
                      updateNestedConfig("features", { communicationPatterns })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    feature: "Historical Data",
                    importance: 42,
                    enabled: config.features.historicalData,
                  },
                  {
                    feature: "Appointment Characteristics",
                    importance: 28,
                    enabled: config.features.appointmentCharacteristics,
                  },
                  {
                    feature: "Communication Patterns",
                    importance: 18,
                    enabled: config.features.communicationPatterns,
                  },
                  {
                    feature: "Demographic Information",
                    importance: 8,
                    enabled: config.features.demographicInfo,
                  },
                  {
                    feature: "External Factors",
                    importance: 4,
                    enabled: config.features.externalFactors,
                  },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${item.enabled ? "" : "text-muted-foreground"}`}
                      >
                        {item.feature}
                      </span>
                      <span
                        className={`text-sm ${item.enabled ? "font-medium" : "text-muted-foreground"}`}
                      >
                        {item.importance}%
                      </span>
                    </div>
                    <Progress
                      value={item.enabled ? item.importance : 0}
                      className={`h-2 ${item.enabled ? "" : "opacity-50"}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alert Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">High Risk Patient Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when patients exceed high risk thresholds
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.highRiskPatients}
                    onCheckedChange={(highRiskPatients) =>
                      updateNestedConfig("notifications", { highRiskPatients })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Model Performance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when model accuracy drops below acceptable levels
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.modelPerformanceDrop}
                    onCheckedChange={(modelPerformanceDrop) =>
                      updateNestedConfig("notifications", { modelPerformanceDrop })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Retraining Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when models need retraining based on performance or data drift
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.retrainingRequired}
                    onCheckedChange={(retrainingRequired) =>
                      updateNestedConfig("notifications", { retrainingRequired })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Prediction Errors</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert on prediction system errors or failures
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.predictionErrors}
                    onCheckedChange={(predictionErrors) =>
                      updateNestedConfig("notifications", { predictionErrors })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Email Recipients</Label>
                  <Textarea
                    placeholder="admin@neonpro.com, manager@neonpro.com"
                    value="admin@neonpro.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>

                <div>
                  <Label>Slack Webhook (Optional)</Label>
                  <Input placeholder="https://hooks.slack.com/services/..." className="mt-1" />
                </div>

                <div>
                  <Label>SMS Recipients (Optional)</Label>
                  <Input placeholder="+55 11 9999-9999" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
