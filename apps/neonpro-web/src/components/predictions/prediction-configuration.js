/**
 * Story 11.2: Prediction Configuration Component
 * Configure no-show prediction models, thresholds, and system parameters
 */
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionConfiguration = PredictionConfiguration;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var slider_1 = require("@/components/ui/slider");
var tabs_1 = require("@/components/ui/tabs");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function PredictionConfiguration(_a) {
  var _b;
  var currentConfiguration = _a.currentConfiguration,
    availableModels = _a.availableModels,
    onSaveConfiguration = _a.onSaveConfiguration,
    onActivateModel = _a.onActivateModel,
    onRetrainModel = _a.onRetrainModel;
  var _c = (0, react_1.useState)(currentConfiguration),
    config = _c[0],
    setConfig = _c[1];
  var _d = (0, react_1.useState)("general"),
    activeTab = _d[0],
    setActiveTab = _d[1];
  var _e = (0, react_1.useState)(false),
    hasChanges = _e[0],
    setHasChanges = _e[1];
  /**
   * Update configuration and mark as changed
   */
  var updateConfig = function (updates) {
    setConfig(function (prev) {
      return __assign(__assign({}, prev), updates);
    });
    setHasChanges(true);
  };
  /**
   * Update nested configuration properties
   */
  var updateNestedConfig = function (key, updates) {
    setConfig(function (prev) {
      var _a;
      return __assign(
        __assign({}, prev),
        ((_a = {}), (_a[key] = __assign(__assign({}, prev[key]), updates)), _a),
      );
    });
    setHasChanges(true);
  };
  /**
   * Save configuration
   */
  var handleSaveConfiguration = function () {
    onSaveConfiguration(config);
    setHasChanges(false);
  };
  /**
   * Reset to original configuration
   */
  var handleResetConfiguration = function () {
    setConfig(currentConfiguration);
    setHasChanges(false);
  };
  /**
   * Get model type display info
   */
  var getModelTypeInfo = function (type) {
    var typeMap = {
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
  var getAccuracyColor = function (accuracy) {
    if (accuracy >= 90) return "text-green-600";
    if (accuracy >= 80) return "text-yellow-600";
    return "text-red-600";
  };
  /**
   * Format threshold display
   */
  var formatThreshold = function (value) {
    return "".concat(value, "%");
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
            <alert_1.Alert className="py-2 px-3">
              <lucide_react_1.Info className="h-4 w-4" />
              <alert_1.AlertDescription className="text-sm">
                You have unsaved changes
              </alert_1.AlertDescription>
            </alert_1.Alert>
          )}
          <button_1.Button
            variant="outline"
            onClick={handleResetConfiguration}
            disabled={!hasChanges}
          >
            <lucide_react_1.RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button_1.Button>
          <button_1.Button onClick={handleSaveConfiguration} disabled={!hasChanges}>
            <lucide_react_1.Save className="h-4 w-4 mr-2" />
            Save Configuration
          </button_1.Button>
        </div>
      </div>

      {/* System Status */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={"w-3 h-3 rounded-full ".concat(
                    config.enabled ? "bg-green-500" : "bg-red-500",
                  )}
                />
                <span className="font-medium">
                  Prediction System: {config.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <badge_1.Badge variant={config.enabled ? "default" : "secondary"}>
                {
                  availableModels.filter(function (m) {
                    return m.isActive;
                  }).length
                }{" "}
                models active
              </badge_1.Badge>
            </div>
            <switch_1.Switch
              checked={config.enabled}
              onCheckedChange={function (enabled) {
                return updateConfig({ enabled: enabled });
              }}
            />
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Configuration Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="general">General</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="models">Models</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="thresholds">Thresholds</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="features">Features</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="notifications">Notifications</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="general" className="space-y-6">
          {/* Basic Settings */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Settings className="h-5 w-5" />
                Basic Settings
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label_1.Label>Prediction Window (hours before appointment)</label_1.Label>
                  <div className="space-y-2">
                    <slider_1.Slider
                      value={[config.predictionWindow]}
                      onValueChange={function (_a) {
                        var value = _a[0];
                        return updateConfig({ predictionWindow: value });
                      }}
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
                  <label_1.Label>Minimum Confidence Level (%)</label_1.Label>
                  <div className="space-y-2">
                    <slider_1.Slider
                      value={[config.minimumConfidence]}
                      onValueChange={function (_a) {
                        var value = _a[0];
                        return updateConfig({ minimumConfidence: value });
                      }}
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
                    <label_1.Label className="text-base">Automatic Model Retraining</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retrain models based on performance and new data
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.autoRetraining}
                    onCheckedChange={function (autoRetraining) {
                      return updateConfig({ autoRetraining: autoRetraining });
                    }}
                  />
                </div>

                {config.autoRetraining && (
                  <div className="space-y-2 ml-4">
                    <label_1.Label>Retraining Interval (days)</label_1.Label>
                    <div className="space-y-2">
                      <slider_1.Slider
                        value={[config.retrainingInterval]}
                        onValueChange={function (_a) {
                          var value = _a[0];
                          return updateConfig({ retrainingInterval: value });
                        }}
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
            </card_1.CardContent>
          </card_1.Card>

          {/* System Performance */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Current Performance
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {((_b = availableModels.find(function (m) {
                      return m.isActive;
                    })) === null || _b === void 0
                      ? void 0
                      : _b.accuracy.toFixed(1)) || 0}
                    %
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
                    {
                      availableModels.filter(function (m) {
                        return m.isActive;
                      }).length
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Active Models</div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="models" className="space-y-6">
          {/* Available Models */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Brain className="h-5 w-5" />
                Prediction Models
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {availableModels.map(function (model) {
                  var typeInfo = getModelTypeInfo(model.type);
                  return (
                    <card_1.Card
                      key={model.id}
                      className={"p-4 ".concat(
                        model.isActive ? "border-green-200 bg-green-50/50" : "",
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model.name}</span>
                            {model.isActive && (
                              <badge_1.Badge variant="default">Active</badge_1.Badge>
                            )}
                          </div>
                          <badge_1.Badge className={typeInfo.color}>{typeInfo.label}</badge_1.Badge>
                          <span className="text-sm text-muted-foreground">v{model.version}</span>
                        </div>
                        <div className="text-right">
                          <div
                            className={"text-lg font-bold ".concat(
                              getAccuracyColor(model.accuracy),
                            )}
                          >
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
                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return onRetrainModel(model.id);
                            }}
                          >
                            <lucide_react_1.RotateCcw className="h-4 w-4 mr-1" />
                            Retrain
                          </button_1.Button>
                          {!model.isActive
                            ? <button_1.Button
                                variant="default"
                                size="sm"
                                onClick={function () {
                                  return onActivateModel(model.id);
                                }}
                              >
                                <lucide_react_1.Play className="h-4 w-4 mr-1" />
                                Activate
                              </button_1.Button>
                            : <button_1.Button variant="outline" size="sm" disabled>
                                <lucide_react_1.CheckCircle className="h-4 w-4 mr-1" />
                                Active
                              </button_1.Button>}
                        </div>
                      </div>
                    </card_1.Card>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Model Management */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Model Management</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center gap-4">
                <button_1.Button variant="outline">
                  <lucide_react_1.Upload className="h-4 w-4 mr-2" />
                  Import Model
                </button_1.Button>
                <button_1.Button variant="outline">
                  <lucide_react_1.Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </button_1.Button>
                <button_1.Button variant="outline">
                  <lucide_react_1.Brain className="h-4 w-4 mr-2" />
                  Train New Model
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="thresholds" className="space-y-6">
          {/* Risk Thresholds */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Risk Level Thresholds
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label_1.Label>Low Risk Threshold</label_1.Label>
                    <span className="text-sm font-medium text-green-600">
                      0% - {formatThreshold(config.riskThresholds.low)}
                    </span>
                  </div>
                  <slider_1.Slider
                    value={[config.riskThresholds.low]}
                    onValueChange={function (_a) {
                      var value = _a[0];
                      return updateNestedConfig("riskThresholds", { low: value });
                    }}
                    max={50}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label_1.Label>Medium Risk Threshold</label_1.Label>
                    <span className="text-sm font-medium text-yellow-600">
                      {formatThreshold(config.riskThresholds.low + 1)} -{" "}
                      {formatThreshold(config.riskThresholds.medium)}
                    </span>
                  </div>
                  <slider_1.Slider
                    value={[config.riskThresholds.medium]}
                    onValueChange={function (_a) {
                      var value = _a[0];
                      return updateNestedConfig("riskThresholds", { medium: value });
                    }}
                    max={80}
                    min={config.riskThresholds.low + 5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label_1.Label>High Risk Threshold</label_1.Label>
                    <span className="text-sm font-medium text-red-600">
                      {formatThreshold(config.riskThresholds.medium + 1)} -{" "}
                      {formatThreshold(config.riskThresholds.high)}
                    </span>
                  </div>
                  <slider_1.Slider
                    value={[config.riskThresholds.high]}
                    onValueChange={function (_a) {
                      var value = _a[0];
                      return updateNestedConfig("riskThresholds", { high: value });
                    }}
                    max={95}
                    min={config.riskThresholds.medium + 5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label_1.Label>Very High Risk</label_1.Label>
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
                <label_1.Label className="text-base">Risk Level Preview</label_1.Label>
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
            </card_1.CardContent>
          </card_1.Card>

          {/* Threshold Impact */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Threshold Impact Analysis</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
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
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="features" className="space-y-6">
          {/* Feature Selection */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Zap className="h-5 w-5" />
                Prediction Features
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Historical Data</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Patient's past appointment history, no-show patterns, and attendance trends
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.historicalData}
                    onCheckedChange={function (historicalData) {
                      return updateNestedConfig("features", { historicalData: historicalData });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Demographic Information</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Age, gender, location, insurance type, and socioeconomic factors
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.demographicInfo}
                    onCheckedChange={function (demographicInfo) {
                      return updateNestedConfig("features", { demographicInfo: demographicInfo });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Appointment Characteristics</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Time of day, day of week, appointment type, duration, and specialty
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.appointmentCharacteristics}
                    onCheckedChange={function (appointmentCharacteristics) {
                      return updateNestedConfig("features", {
                        appointmentCharacteristics: appointmentCharacteristics,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">External Factors</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Weather conditions, traffic patterns, holidays, and seasonal effects
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.externalFactors}
                    onCheckedChange={function (externalFactors) {
                      return updateNestedConfig("features", { externalFactors: externalFactors });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Communication Patterns</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Response rates to reminders, preferred contact methods, and engagement history
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.features.communicationPatterns}
                    onCheckedChange={function (communicationPatterns) {
                      return updateNestedConfig("features", {
                        communicationPatterns: communicationPatterns,
                      });
                    }}
                  />
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Feature Impact */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Feature Importance</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
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
                ].map(function (item, index) {
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={"text-sm font-medium ".concat(
                            item.enabled ? "" : "text-muted-foreground",
                          )}
                        >
                          {item.feature}
                        </span>
                        <span
                          className={"text-sm ".concat(
                            item.enabled ? "font-medium" : "text-muted-foreground",
                          )}
                        >
                          {item.importance}%
                        </span>
                      </div>
                      <progress_1.Progress
                        value={item.enabled ? item.importance : 0}
                        className={"h-2 ".concat(item.enabled ? "" : "opacity-50")}
                      />
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="notifications" className="space-y-6">
          {/* Notification Settings */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.AlertTriangle className="h-5 w-5" />
                Alert Notifications
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">High Risk Patient Alerts</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when patients exceed high risk thresholds
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.notifications.highRiskPatients}
                    onCheckedChange={function (highRiskPatients) {
                      return updateNestedConfig("notifications", {
                        highRiskPatients: highRiskPatients,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Model Performance Alerts</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when model accuracy drops below acceptable levels
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.notifications.modelPerformanceDrop}
                    onCheckedChange={function (modelPerformanceDrop) {
                      return updateNestedConfig("notifications", {
                        modelPerformanceDrop: modelPerformanceDrop,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Retraining Required</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when models need retraining based on performance or data drift
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.notifications.retrainingRequired}
                    onCheckedChange={function (retrainingRequired) {
                      return updateNestedConfig("notifications", {
                        retrainingRequired: retrainingRequired,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label_1.Label className="text-base">Prediction Errors</label_1.Label>
                    <p className="text-sm text-muted-foreground">
                      Alert on prediction system errors or failures
                    </p>
                  </div>
                  <switch_1.Switch
                    checked={config.notifications.predictionErrors}
                    onCheckedChange={function (predictionErrors) {
                      return updateNestedConfig("notifications", {
                        predictionErrors: predictionErrors,
                      });
                    }}
                  />
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Notification Recipients */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Notification Recipients</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div>
                  <label_1.Label>Email Recipients</label_1.Label>
                  <textarea_1.Textarea
                    placeholder="admin@neonpro.com, manager@neonpro.com"
                    value="admin@neonpro.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>

                <div>
                  <label_1.Label>Slack Webhook (Optional)</label_1.Label>
                  <input_1.Input
                    placeholder="https://hooks.slack.com/services/..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label_1.Label>SMS Recipients (Optional)</label_1.Label>
                  <input_1.Input placeholder="+55 11 9999-9999" className="mt-1" />
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
