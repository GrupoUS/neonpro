/**
 * Story 11.2: Intervention Management Component
 * Automated intervention strategies and proactive patient engagement
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
exports.InterventionManagement = InterventionManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var INTERVENTION_TYPES = [
    { value: 'SMS_REMINDER', label: 'SMS Reminder', icon: <lucide_react_1.MessageSquare className="h-4 w-4"/> },
    { value: 'PHONE_CALL', label: 'Phone Call', icon: <lucide_react_1.Phone className="h-4 w-4"/> },
    { value: 'EMAIL_REMINDER', label: 'Email Reminder', icon: <lucide_react_1.Mail className="h-4 w-4"/> },
    { value: 'PUSH_NOTIFICATION', label: 'Push Notification', icon: <lucide_react_1.Bell className="h-4 w-4"/> },
    { value: 'PERSONAL_OUTREACH', label: 'Personal Outreach', icon: <lucide_react_1.Users className="h-4 w-4"/> },
    { value: 'AUTOMATED_SEQUENCE', label: 'Automated Sequence', icon: <lucide_react_1.Zap className="h-4 w-4"/> }
];
var COMMUNICATION_CHANNELS = [
    { value: 'SMS', label: 'SMS' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'WHATSAPP', label: 'WhatsApp' },
    { value: 'PUSH', label: 'Push Notification' },
    { value: 'IN_APP', label: 'In-App Message' }
];
var TRIGGER_CONDITIONS = [
    { value: 'HIGH_RISK_SCORE', label: 'High Risk Score (≥70%)' },
    { value: 'HISTORICAL_NO_SHOW', label: 'Historical No-Show Pattern' },
    { value: 'SHORT_NOTICE_BOOKING', label: 'Short Notice Booking (<24h)' },
    { value: 'FIRST_TIME_PATIENT', label: 'First Time Patient' },
    { value: 'MISSED_LAST_APPOINTMENT', label: 'Missed Last Appointment' },
    { value: 'COMMUNICATION_DECLINE', label: 'Communication Response Decline' },
    { value: 'WEATHER_ALERT', label: 'Weather Alert' },
    { value: 'APPOINTMENT_CHANGE', label: 'Appointment Change' }
];
function InterventionManagement(_a) {
    var interventions = _a.interventions, outcomes = _a.outcomes, onCreateIntervention = _a.onCreateIntervention, onUpdateIntervention = _a.onUpdateIntervention, onDeleteIntervention = _a.onDeleteIntervention;
    var _b = (0, react_1.useState)(null), selectedIntervention = _b[0], setSelectedIntervention = _b[1];
    var _c = (0, react_1.useState)(false), showCreateForm = _c[0], setShowCreateForm = _c[1];
    var _d = (0, react_1.useState)('active'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)({
        name: '',
        type: 'SMS_REMINDER',
        triggers: [],
        channels: ['SMS'],
        template: '',
        timing: {
            delay: 24,
            followUp: 2,
            maxAttempts: 3
        },
        conditions: {
            riskThreshold: 50,
            timeWindow: 7,
            excludeRecent: true
        },
        active: true
    }), interventionForm = _e[0], setInterventionForm = _e[1];
    /**
     * Calculate intervention analytics from outcomes
     */
    var interventionAnalytics = (0, react_1.useMemo)(function () {
        // Group outcomes by intervention
        var interventionGroups = outcomes.reduce(function (acc, outcome) {
            if (!acc[outcome.interventionId]) {
                acc[outcome.interventionId] = [];
            }
            acc[outcome.interventionId].push(outcome);
            return acc;
        }, {});
        // Calculate effectiveness metrics
        var effectiveness = Object.entries(interventionGroups).map(function (_a) {
            var interventionId = _a[0], outcomes = _a[1];
            var intervention = interventions.find(function (i) { return i.id === interventionId; });
            var successfulOutcomes = outcomes.filter(function (o) { return o.success; });
            var noShowReduction = outcomes.filter(function (o) { return o.noShowPrevented; }).length;
            return {
                intervention: (intervention === null || intervention === void 0 ? void 0 : intervention.name) || 'Unknown',
                successRate: (successfulOutcomes.length / outcomes.length) * 100,
                totalSent: outcomes.length,
                responseRate: (outcomes.filter(function (o) { return o.patientEngaged; }).length / outcomes.length) * 100,
                noShowReduction: (noShowReduction / outcomes.length) * 100
            };
        });
        // Channel performance analysis
        var channelGroups = outcomes.reduce(function (acc, outcome) {
            var channel = outcome.channel;
            if (!acc[channel]) {
                acc[channel] = [];
            }
            acc[channel].push(outcome);
            return acc;
        }, {});
        var channelPerformance = Object.entries(channelGroups).map(function (_a) {
            var channel = _a[0], outcomes = _a[1];
            return ({
                channel: channel.charAt(0) + channel.slice(1).toLowerCase(),
                deliveryRate: (outcomes.filter(function (o) { return o.delivered; }).length / outcomes.length) * 100,
                responseRate: (outcomes.filter(function (o) { return o.patientEngaged; }).length / outcomes.length) * 100,
                cost: outcomes.reduce(function (sum, o) { return sum + (o.cost || 0); }, 0) / outcomes.length,
                satisfaction: outcomes.reduce(function (sum, o) { return sum + (o.satisfactionScore || 0); }, 0) / outcomes.length
            });
        });
        // Timing analysis (mock data for now)
        var timingAnalysis = [
            { timing: '24h before', effectiveness: 85, volume: 1240 },
            { timing: '2h before', effectiveness: 92, volume: 890 },
            { timing: '30min before', effectiveness: 78, volume: 450 },
            { timing: 'Day after booking', effectiveness: 65, volume: 2100 },
            { timing: 'Weekly reminder', effectiveness: 70, volume: 1800 }
        ];
        // Patient segments (mock data)
        var patientSegments = [
            { segment: 'Young Adults (18-30)', preferredChannel: 'SMS', bestTiming: '2h before', responseRate: 78 },
            { segment: 'Working Adults (31-50)', preferredChannel: 'Email', bestTiming: '24h before', responseRate: 85 },
            { segment: 'Seniors (51+)', preferredChannel: 'Phone', bestTiming: '24h before', responseRate: 92 },
            { segment: 'First-time Patients', preferredChannel: 'SMS + Email', bestTiming: 'Day after booking', responseRate: 68 }
        ];
        return {
            effectiveness: effectiveness,
            channelPerformance: channelPerformance,
            timingAnalysis: timingAnalysis,
            patientSegments: patientSegments
        };
    }, [interventions, outcomes]);
    /**
     * Handle form submission
     */
    var handleSubmitIntervention = function () {
        var newIntervention = {
            name: interventionForm.name,
            type: interventionForm.type,
            triggers: interventionForm.triggers,
            channels: interventionForm.channels,
            template: interventionForm.template,
            timing: interventionForm.timing,
            conditions: {
                riskThreshold: interventionForm.conditions.riskThreshold,
                timeWindow: interventionForm.conditions.timeWindow,
                excludeRecent: interventionForm.conditions.excludeRecent
            },
            active: interventionForm.active
        };
        onCreateIntervention(newIntervention);
        setShowCreateForm(false);
        setInterventionForm({
            name: '',
            type: 'SMS_REMINDER',
            triggers: [],
            channels: ['SMS'],
            template: '',
            timing: { delay: 24, followUp: 2, maxAttempts: 3 },
            conditions: { riskThreshold: 50, timeWindow: 7, excludeRecent: true },
            active: true
        });
    };
    /**
     * Toggle intervention active status
     */
    var toggleInterventionStatus = function (intervention) {
        onUpdateIntervention(intervention.id, { active: !intervention.active });
    };
    /**
     * Get intervention type icon and label
     */
    var getInterventionTypeInfo = function (type) {
        return INTERVENTION_TYPES.find(function (t) { return t.value === type; }) || INTERVENTION_TYPES[0];
    };
    /**
     * Get effectiveness color based on percentage
     */
    var getEffectivenessColor = function (percentage) {
        if (percentage >= 80)
            return 'text-green-600';
        if (percentage >= 60)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    return (<div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intervention Management</h2>
          <p className="text-muted-foreground">
            Manage automated interventions and proactive patient engagement strategies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button_1.Button variant="outline">
            <lucide_react_1.Settings className="h-4 w-4 mr-2"/>
            Settings
          </button_1.Button>
          <dialog_1.Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Zap className="h-4 w-4 mr-2"/>
                New Intervention
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Create New Intervention</dialog_1.DialogTitle>
              </dialog_1.DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Intervention Name</label>
                    <input_1.Input value={interventionForm.name} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} placeholder="e.g., High Risk SMS Reminder"/>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select_1.Select value={interventionForm.type} onValueChange={function (value) {
            return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { type: value })); });
        }}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {INTERVENTION_TYPES.map(function (type) { return (<select_1.SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </select_1.SelectItem>); })}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Communication Channels</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {COMMUNICATION_CHANNELS.map(function (channel) { return (<label key={channel.value} className="flex items-center space-x-2">
                          <input type="checkbox" checked={interventionForm.channels.includes(channel.value)} onChange={function (e) {
                if (e.target.checked) {
                    setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { channels: __spreadArray(__spreadArray([], prev.channels, true), [channel.value], false) })); });
                }
                else {
                    setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { channels: prev.channels.filter(function (c) { return c !== channel.value; }) })); });
                }
            }}/>
                          <span className="text-sm">{channel.label}</span>
                        </label>); })}
                    </div>
                  </div>
                </div>

                {/* Trigger Conditions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Trigger Conditions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {TRIGGER_CONDITIONS.map(function (trigger) { return (<label key={trigger.value} className="flex items-center space-x-2">
                        <input type="checkbox" checked={interventionForm.triggers.includes(trigger.value)} onChange={function (e) {
                if (e.target.checked) {
                    setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { triggers: __spreadArray(__spreadArray([], prev.triggers, true), [trigger.value], false) })); });
                }
                else {
                    setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { triggers: prev.triggers.filter(function (t) { return t !== trigger.value; }) })); });
                }
            }}/>
                        <span className="text-sm">{trigger.label}</span>
                      </label>); })}
                  </div>
                </div>

                {/* Message Template */}
                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <textarea_1.Textarea value={interventionForm.template} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { template: e.target.value })); }); }} placeholder="Olá {patientName}, você tem uma consulta agendada para {appointmentDate} às {appointmentTime}. Para confirmar, responda SIM." rows={3}/>
                  <div className="text-xs text-muted-foreground mt-1">
                    Available variables: {'{patientName}'}, {'{appointmentDate}'}, {'{appointmentTime}'}, {'{doctorName}'}
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Timing Settings</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Delay (hours)</label>
                      <input_1.Input type="number" value={interventionForm.timing.delay} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { timing: __assign(__assign({}, prev.timing), { delay: parseInt(e.target.value) }) })); }); }}/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Follow-up (hours)</label>
                      <input_1.Input type="number" value={interventionForm.timing.followUp} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { timing: __assign(__assign({}, prev.timing), { followUp: parseInt(e.target.value) }) })); }); }}/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Attempts</label>
                      <input_1.Input type="number" value={interventionForm.timing.maxAttempts} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { timing: __assign(__assign({}, prev.timing), { maxAttempts: parseInt(e.target.value) }) })); }); }}/>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Risk Threshold (%)</label>
                      <input_1.Input type="number" value={interventionForm.conditions.riskThreshold} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { conditions: __assign(__assign({}, prev.conditions), { riskThreshold: parseInt(e.target.value) }) })); }); }}/>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time Window (days)</label>
                      <input_1.Input type="number" value={interventionForm.conditions.timeWindow} onChange={function (e) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { conditions: __assign(__assign({}, prev.conditions), { timeWindow: parseInt(e.target.value) }) })); }); }}/>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <switch_1.Switch checked={interventionForm.conditions.excludeRecent} onCheckedChange={function (checked) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { conditions: __assign(__assign({}, prev.conditions), { excludeRecent: checked }) })); }); }}/>
                    <label className="text-sm">Exclude patients contacted in last 24h</label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <switch_1.Switch checked={interventionForm.active} onCheckedChange={function (checked) { return setInterventionForm(function (prev) { return (__assign(__assign({}, prev), { active: checked })); }); }}/>
                    <label className="text-sm font-medium">Active</label>
                  </div>
                  <div className="flex gap-3">
                    <button_1.Button variant="outline" onClick={function () { return setShowCreateForm(false); }}>
                      Cancel
                    </button_1.Button>
                    <button_1.Button onClick={handleSubmitIntervention}>
                      Create Intervention
                    </button_1.Button>
                  </div>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={function (value) { return setActiveTab(value); }}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="active">Active Interventions</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="templates">Templates</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings">Settings</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="active" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.Target className="h-4 w-4"/>
                  Active Interventions
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {interventions.filter(function (i) { return i.active; }).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Of {interventions.length} total
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.Send className="h-4 w-4"/>
                  Messages Sent
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {outcomes.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  This month
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.CheckCircle className="h-4 w-4"/>
                  Success Rate
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {outcomes.length > 0 ?
            Math.round((outcomes.filter(function (o) { return o.success; }).length / outcomes.length) * 100)
            : 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Overall effectiveness
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="pb-2">
                <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                  <lucide_react_1.Shield className="h-4 w-4"/>
                  No-Shows Prevented
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {outcomes.filter(function (o) { return o.noShowPrevented; }).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  This month
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Active Interventions List */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Play className="h-5 w-5"/>
                Active Interventions
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {interventions.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
                    No interventions configured yet. Create your first intervention to start preventing no-shows.
                  </div>) : (interventions.map(function (intervention) {
            var typeInfo = getInterventionTypeInfo(intervention.type);
            var interventionOutcomes = outcomes.filter(function (o) { return o.interventionId === intervention.id; });
            var successRate = interventionOutcomes.length > 0 ?
                (interventionOutcomes.filter(function (o) { return o.success; }).length / interventionOutcomes.length) * 100 : 0;
            return (<card_1.Card key={intervention.id} className={"cursor-pointer transition-colors ".concat(intervention.active ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50')} onClick={function () { return setSelectedIntervention(intervention); }}>
                        <card_1.CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {typeInfo.icon}
                                <span className="font-medium">{intervention.name}</span>
                              </div>
                              <badge_1.Badge variant={intervention.active ? 'default' : 'secondary'}>
                                {intervention.active ? 'Active' : 'Inactive'}
                              </badge_1.Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <button_1.Button variant="outline" size="sm" onClick={function (e) {
                    e.stopPropagation();
                    toggleInterventionStatus(intervention);
                }}>
                                {intervention.active ? (<lucide_react_1.Pause className="h-4 w-4"/>) : (<lucide_react_1.Play className="h-4 w-4"/>)}
                              </button_1.Button>
                              <button_1.Button variant="outline" size="sm" onClick={function (e) {
                    e.stopPropagation();
                    setSelectedIntervention(intervention);
                }}>
                                <lucide_react_1.Eye className="h-4 w-4"/>
                              </button_1.Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground">Type</div>
                              <div className="text-sm font-medium">{typeInfo.label}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Channels</div>
                              <div className="text-sm font-medium">
                                {intervention.channels.join(', ')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Success Rate</div>
                              <div className={"text-sm font-medium ".concat(getEffectivenessColor(successRate))}>
                                {successRate.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Messages Sent</div>
                              <div className="text-sm font-medium">{interventionOutcomes.length}</div>
                            </div>
                          </div>

                          <progress_1.Progress value={successRate} className="h-2"/>

                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-muted-foreground">
                              Triggers: {intervention.triggers.length} conditions
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last updated: {intervention.lastUpdated.toLocaleDateString()}
                            </div>
                          </div>
                        </card_1.CardContent>
                      </card_1.Card>);
        }))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-6">
          {/* Intervention Effectiveness Chart */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.TrendingUp className="h-5 w-5"/>
                Intervention Effectiveness
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.BarChart data={interventionAnalytics.effectiveness}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                  <recharts_1.XAxis dataKey="intervention"/>
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip formatter={function (value, name) { return [
            "".concat(value).concat(name.includes('Rate') || name.includes('Reduction') ? '%' : ''),
            name
        ]; }}/>
                  <recharts_1.Bar dataKey="successRate" name="Success Rate" fill="#10B981"/>
                  <recharts_1.Bar dataKey="responseRate" name="Response Rate" fill="#3B82F6"/>
                  <recharts_1.Bar dataKey="noShowReduction" name="No-Show Reduction" fill="#8B5CF6"/>
                </recharts_1.BarChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>

          {/* Channel Performance and Timing Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.MessageSquare className="h-5 w-5"/>
                  Channel Performance
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {interventionAnalytics.channelPerformance.map(function (channel, index) { return (<div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{channel.channel}</span>
                        <span className="text-sm text-muted-foreground">
                          {channel.deliveryRate.toFixed(0)}% delivery
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Response</div>
                          <div className="font-medium">{channel.responseRate.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Cost</div>
                          <div className="font-medium">R$ {channel.cost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Satisfaction</div>
                          <div className="font-medium">{channel.satisfaction.toFixed(1)}/5</div>
                        </div>
                      </div>
                      <progress_1.Progress value={channel.responseRate} className="h-2"/>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Clock className="h-5 w-5"/>
                  Timing Analysis
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={interventionAnalytics.timingAnalysis}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3"/>
                    <recharts_1.XAxis dataKey="timing"/>
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="effectiveness" name="Effectiveness %" fill="#F59E0B"/>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Patient Segments */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Users className="h-5 w-5"/>
                Patient Segment Preferences
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interventionAnalytics.patientSegments.map(function (segment, index) { return (<div key={segment.segment} className="space-y-3">
                    <div className="font-medium">{segment.segment}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preferred Channel:</span>
                        <span className="font-medium">{segment.preferredChannel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Best Timing:</span>
                        <span className="font-medium">{segment.bestTiming}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Rate:</span>
                        <span className={"font-medium ".concat(getEffectivenessColor(segment.responseRate))}>
                          {segment.responseRate}%
                        </span>
                      </div>
                    </div>
                    <progress_1.Progress value={segment.responseRate} className="h-2"/>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="templates" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Message Templates</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Template management functionality coming soon.
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="settings" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Intervention Settings</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Global settings and configuration options coming soon.
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Selected Intervention Detail Modal */}
      {selectedIntervention && (<dialog_1.Dialog open={!!selectedIntervention} onOpenChange={function () { return setSelectedIntervention(null); }}>
          <dialog_1.DialogContent className="max-w-4xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="flex items-center gap-2">
                {getInterventionTypeInfo(selectedIntervention.type).icon}
                {selectedIntervention.name}
              </dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-6">
              {/* Intervention Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{getInterventionTypeInfo(selectedIntervention.type).label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channels:</span>
                        <span>{selectedIntervention.channels.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <badge_1.Badge variant={selectedIntervention.active ? 'default' : 'secondary'}>
                          {selectedIntervention.active ? 'Active' : 'Inactive'}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Timing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delay:</span>
                        <span>{selectedIntervention.timing.delay}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Follow-up:</span>
                        <span>{selectedIntervention.timing.followUp}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Attempts:</span>
                        <span>{selectedIntervention.timing.maxAttempts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Threshold:</span>
                        <span>{selectedIntervention.conditions.riskThreshold}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Window:</span>
                        <span>{selectedIntervention.conditions.timeWindow} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exclude Recent:</span>
                        <span>{selectedIntervention.conditions.excludeRecent ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Triggers</h4>
                    <div className="space-y-1">
                      {selectedIntervention.triggers.map(function (trigger, index) { return (<badge_1.Badge key={index} variant="outline" className="mr-1 mb-1">
                          {trigger.replace(/_/g, ' ').toLowerCase()}
                        </badge_1.Badge>); })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Template */}
              <div>
                <h4 className="font-medium mb-2">Message Template</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {selectedIntervention.template}
                </div>
              </div>

              {/* Recent Performance */}
              <div>
                <h4 className="font-medium mb-2">Recent Performance</h4>
                {(function () {
                var interventionOutcomes = outcomes.filter(function (o) { return o.interventionId === selectedIntervention.id; });
                var successRate = interventionOutcomes.length > 0 ?
                    (interventionOutcomes.filter(function (o) { return o.success; }).length / interventionOutcomes.length) * 100 : 0;
                return (<div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{interventionOutcomes.length}</div>
                        <div className="text-xs text-muted-foreground">Messages Sent</div>
                      </div>
                      <div className="text-center">
                        <div className={"text-2xl font-bold ".concat(getEffectivenessColor(successRate))}>
                          {successRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {interventionOutcomes.filter(function (o) { return o.noShowPrevented; }).length}
                        </div>
                        <div className="text-xs text-muted-foreground">No-Shows Prevented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {interventionOutcomes.filter(function (o) { return o.patientEngaged; }).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Patient Engaged</div>
                      </div>
                    </div>);
            })()}
              </div>

              <div className="flex justify-end gap-3">
                <button_1.Button variant="outline" onClick={function () { return setSelectedIntervention(null); }}>
                  Close
                </button_1.Button>
                <button_1.Button>
                  Edit Intervention
                </button_1.Button>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>)}
    </div>);
}
