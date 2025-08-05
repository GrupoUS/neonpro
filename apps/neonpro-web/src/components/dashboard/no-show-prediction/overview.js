// Story 11.2: No-Show Prediction Overview Component
// Key metrics and real-time dashboard overview
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
exports.default = NoShowPredictionOverview;
var react_1 = require("react");
var use_toast_1 = require("@/hooks/use-toast");
function NoShowPredictionOverview() {
    var _this = this;
    var _a = (0, react_1.useState)(null), metrics = _a[0], setMetrics = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var toast = (0, use_toast_1.useToast)().toast;
    (0, react_1.useEffect)(function () {
        fetchOverviewMetrics();
    }, []);
    var fetchOverviewMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
        // Key metrics and real-time dashboard overview
        'use client';
        export default function NoShowPredictionOverview() {
            var _this = this;
            var _a = (0, react_2.useState)(null), metrics = _a[0], setMetrics = _a[1];
            var _b = (0, react_2.useState)(true), loading = _b[0], setLoading = _b[1];
            var toast = (0, use_toast_2.useToast)().toast;
            (0, react_2.useEffect)(function () {
                fetchOverviewMetrics();
            }, []);
            var fetchOverviewMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
                var response, data, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, 4, 5]);
                            setLoading(true);
                            return [4 /*yield*/, fetch('/api/no-show-prediction?dashboard=overview')];
                        case 1:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error('Failed to fetch overview metrics');
                            }
                            return [4 /*yield*/, response.json()];
                        case 2:
                            data = _a.sent();
                            setMetrics(data);
                            return [3 /*break*/, 5];
                        case 3:
                            error_1 = _a.sent();
                            console.error('Error fetching overview metrics:', error_1);
                            toast({
                                title: 'Error',
                                description: 'Failed to load overview metrics',
                                variant: 'destructive',
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            if (loading) {
                return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 6 }).map(function (_, i) { return (<card_1.Card key={i}>
          <card_1.CardHeader className="pb-2">
            <div className="h-4 bg-muted animate-pulse rounded"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="h-8 bg-muted animate-pulse rounded mb-2"/>
            <div className="h-3 bg-muted animate-pulse rounded w-2/3"/>
          </card_1.CardContent>
        </card_1.Card>); })}
    </div>;
            }
            if (!metrics) {
                return <div>No data available</div>;
            }
            return (<div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total Predictions</card_1.CardTitle>
            <icons_1.Icons.activity className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.total_predictions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active prediction models
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Accuracy Rate</card_1.CardTitle>
            <icons_1.Icons.target className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(metrics.accuracy_rate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Model prediction accuracy
            </p>
          </card_1.CardContent>
        </card_1.Card>        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">High Risk Patients</card_1.CardTitle>
            <icons_1.Icons.alertTriangle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.high_risk_patients}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring intervention
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Interventions Today</card_1.CardTitle>
            <icons_1.Icons.bell className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{metrics.interventions_today}</div>
            <p className="text-xs text-muted-foreground">
              Proactive actions taken
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Revenue Protected</card_1.CardTitle>
            <icons_1.Icons.dollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.revenue_protected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Cost Savings</card_1.CardTitle>
            <icons_1.Icons.trendingUp className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics.cost_savings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational efficiency
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>      {/* Recent Predictions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Recent High-Risk Predictions</card_1.CardTitle>
          <card_1.CardDescription>
            Latest patients identified as high-risk for no-shows
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {metrics.recent_predictions.map(function (prediction) { return (<div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"/>
                  <div>
                    <p className="font-medium">{prediction.patient_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Appointment: {new Date(prediction.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <badge_1.Badge variant={prediction.risk_score > 0.7 ? "destructive" : "secondary"}>
                    {(prediction.risk_score * 100).toFixed(0)}% risk
                  </badge_1.Badge>
                  <badge_1.Badge variant={prediction.intervention_status === 'completed' ? 'default' :
                        prediction.intervention_status === 'pending' ? 'secondary' : 'outline'}>
                    {prediction.intervention_status}
                  </badge_1.Badge>
                </div>
              </div>); })}
          </div>
          
          {metrics.recent_predictions.length === 0 && (<div className="text-center py-6 text-muted-foreground">
              No high-risk predictions found
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Quick Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Quick Actions</card_1.CardTitle>
          <card_1.CardDescription>
            Common tasks for no-show prediction management
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <button_1.Button variant="outline" className="justify-start">
            <icons_1.Icons.plus className="mr-2 h-4 w-4"/>
            Run New Prediction
          </button_1.Button>
          <button_1.Button variant="outline" className="justify-start">
            <icons_1.Icons.settings className="mr-2 h-4 w-4"/>
            Model Settings
          </button_1.Button>
          <button_1.Button variant="outline" className="justify-start">
            <icons_1.Icons.download className="mr-2 h-4 w-4"/>
            Export Report
          </button_1.Button>
          <button_1.Button variant="outline" className="justify-start">
            <icons_1.Icons.calendar className="mr-2 h-4 w-4"/>
            Schedule Analysis
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
        }
        return __generator(this, function (_a) {
            import { useState, useEffect } from 'react';
            import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
            import { Badge } from '@/components/ui/badge';
            import { Button } from '@/components/ui/button';
            import { Icons } from '@/components/ui/icons';
            import { cn } from '@/lib/utils';
            import { useToast } from '@/hooks/use-toast';
            return [2 /*return*/];
        });
    }); };
}
