// Trial Management Dashboard Component - STORY-SUB-002 Task 4
// Advanced trial management interface with user journey visualization
// Based on research: SaaS trial management best practices + shadcn/ui patterns
// Created: 2025-01-22
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
exports.TrialManagement = TrialManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var tabs_1 = require("@/components/ui/tabs");
var avatar_1 = require("@/components/ui/avatar");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// Stage color mapping
var STAGE_COLORS = {
    onboarding: 'bg-blue-100 text-blue-800 border-blue-200',
    exploring: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    engaged: 'bg-green-100 text-green-800 border-green-200',
    converting: 'bg-purple-100 text-purple-800 border-purple-200',
    churning: 'bg-red-100 text-red-800 border-red-200'
};
// Priority colors
var PRIORITY_COLORS = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
};
function TrialManagement(_a) {
    var _this = this;
    var className = _a.className;
    var _b = (0, react_1.useState)([]), trials = _b[0], setTrials = _b[1];
    var _c = (0, react_1.useState)([]), actions = _c[0], setActions = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = (0, react_1.useState)('all'), stageFilter = _f[0], setStageFilter = _f[1];
    // Fetch trial data
    (0, react_1.useEffect)(function () {
        var fetchTrialData = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, trialsResponse, actionsResponse, trialsData, actionsData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, 5, 6]);
                        setLoading(true);
                        return [4 /*yield*/, Promise.all([
                                fetch('/api/trial-management/active-trials'),
                                fetch('/api/trial-management/recommended-actions')
                            ])];
                    case 1:
                        _a = _b.sent(), trialsResponse = _a[0], actionsResponse = _a[1];
                        return [4 /*yield*/, trialsResponse.json()];
                    case 2:
                        trialsData = _b.sent();
                        return [4 /*yield*/, actionsResponse.json()];
                    case 3:
                        actionsData = _b.sent();
                        setTrials(trialsData);
                        setActions(actionsData);
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Failed to fetch trial data:', error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        fetchTrialData();
    }, []); // Mock data for demonstration
    var mockTrials = [
        {
            id: '1',
            userId: 'usr_123',
            email: 'john.doe@company.com',
            name: 'John Doe',
            stage: 'engaged',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-01-29'),
            daysRemaining: 7,
            conversionProbability: 78,
            lastActivity: new Date('2025-01-21'),
            features: ['Analytics', 'Reports', 'Integrations'],
            source: 'Google Ads',
            plan: 'Professional'
        },
        {
            id: '2',
            userId: 'usr_124',
            email: 'sarah.wilson@startup.com',
            name: 'Sarah Wilson',
            stage: 'churning',
            startDate: new Date('2025-01-10'),
            endDate: new Date('2025-01-24'),
            daysRemaining: 2,
            conversionProbability: 23,
            lastActivity: new Date('2025-01-18'),
            features: ['Basic Features'],
            source: 'Organic',
            plan: 'Starter'
        },
        {
            id: '3',
            userId: 'usr_125',
            email: 'mike.chen@enterprise.com',
            name: 'Mike Chen',
            stage: 'converting',
            startDate: new Date('2025-01-12'),
            endDate: new Date('2025-01-26'),
            daysRemaining: 4,
            conversionProbability: 92,
            lastActivity: new Date('2025-01-22'),
            features: ['All Features', 'Custom Integrations', 'Premium Support'],
            source: 'Referral',
            plan: 'Enterprise'
        }
    ];
    var mockActions = [
        {
            id: '1',
            type: 'email',
            title: 'Send feature discovery email',
            description: 'Help Sarah discover key features she hasn\'t used yet',
            priority: 'high',
            impact: 85
        },
        {
            id: '2',
            type: 'call',
            title: 'Schedule conversion call',
            description: 'Mike shows high conversion probability - time for sales call',
            priority: 'high',
            impact: 92
        },
        {
            id: '3',
            type: 'feature-highlight',
            title: 'Highlight advanced analytics',
            description: 'John is engaged but hasn\'t explored analytics yet',
            priority: 'medium',
            impact: 67
        }
    ];
    // Filter trials based on search and stage
    var filteredTrials = mockTrials.filter(function (trial) {
        var matchesSearch = trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trial.email.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStage = stageFilter === 'all' || trial.stage === stageFilter;
        return matchesSearch && matchesStage;
    }); // Get stage icon
    var getStageIcon = function (stage) {
        switch (stage) {
            case 'onboarding': return <lucide_react_1.Users className="h-4 w-4"/>;
            case 'exploring': return <lucide_react_1.Search className="h-4 w-4"/>;
            case 'engaged': return <lucide_react_1.CheckCircle className="h-4 w-4"/>;
            case 'converting': return <lucide_react_1.TrendingUp className="h-4 w-4"/>;
            case 'churning': return <lucide_react_1.AlertTriangle className="h-4 w-4"/>;
            default: return <lucide_react_1.Clock className="h-4 w-4"/>;
        }
    };
    // Get action icon
    var getActionIcon = function (type) {
        switch (type) {
            case 'email': return <lucide_react_1.Mail className="h-4 w-4"/>;
            case 'call': return <lucide_react_1.Phone className="h-4 w-4"/>;
            case 'message': return <lucide_react_1.MessageSquare className="h-4 w-4"/>;
            case 'feature-highlight': return <lucide_react_1.Zap className="h-4 w-4"/>;
            default: return <lucide_react_1.Target className="h-4 w-4"/>;
        }
    };
    if (loading) {
        return (<div className={(0, utils_1.cn)('space-y-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map(function (_, i) { return (<div key={i} className="h-48 bg-muted rounded"></div>); })}
          </div>
        </div>
      </div>);
    }
    return (<div className={(0, utils_1.cn)('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trial Management</h2>
          <p className="text-muted-foreground">
            Monitor and optimize active trial users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <badge_1.Badge variant="outline">
            {mockTrials.length} Active Trials
          </badge_1.Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder="Search trials by name or email..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>
        <select value={stageFilter} onChange={function (e) { return setStageFilter(e.target.value); }} className="px-3 py-2 border border-input bg-background rounded-md text-sm">
          <option value="all">All Stages</option>
          <option value="onboarding">Onboarding</option>
          <option value="exploring">Exploring</option>
          <option value="engaged">Engaged</option>
          <option value="converting">Converting</option>
          <option value="churning">At Risk</option>
        </select>
      </div>      <tabs_1.Tabs defaultValue="trials" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="trials">Active Trials</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="actions">Recommended Actions</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Active Trials Tab */}
        <tabs_1.TabsContent value="trials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrials.map(function (trial) { return (<card_1.Card key={trial.id} className="relative overflow-hidden">
                {/* Risk indicator */}
                {trial.conversionProbability < 30 && (<div className="absolute top-2 right-2">
                    <badge_1.Badge variant="destructive" className="text-xs">
                      <lucide_react_1.AlertTriangle className="mr-1 h-3 w-3"/>
                      At Risk
                    </badge_1.Badge>
                  </div>)}
                
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <avatar_1.Avatar className="h-10 w-10">
                      <avatar_1.AvatarImage src={trial.avatar}/>
                      <avatar_1.AvatarFallback>
                        {trial.name.split(' ').map(function (n) { return n[0]; }).join('')}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    <div className="flex-1 min-w-0">
                      <card_1.CardTitle className="text-sm font-medium truncate">
                        {trial.name}
                      </card_1.CardTitle>
                      <card_1.CardDescription className="text-xs truncate">
                        {trial.email}
                      </card_1.CardDescription>
                    </div>
                  </div>
                </card_1.CardHeader>

                <card_1.CardContent className="space-y-3">
                  {/* Stage Badge */}
                  <div className="flex items-center justify-between">
                    <badge_1.Badge variant="outline" className={(0, utils_1.cn)('text-xs', STAGE_COLORS[trial.stage])}>
                      {getStageIcon(trial.stage)}
                      <span className="ml-1 capitalize">{trial.stage}</span>
                    </badge_1.Badge>
                    <span className="text-xs text-muted-foreground">
                      {trial.daysRemaining} days left
                    </span>
                  </div>

                  {/* Conversion Probability */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Conversion Probability</span>
                      <span className="font-medium">{trial.conversionProbability}%</span>
                    </div>
                    <progress_1.Progress value={trial.conversionProbability} className="h-2"/>
                  </div>

                  {/* Features Used */}
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Features Used</span>
                    <div className="flex flex-wrap gap-1">
                      {trial.features.slice(0, 2).map(function (feature) { return (<badge_1.Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </badge_1.Badge>); })}
                      {trial.features.length > 2 && (<badge_1.Badge variant="secondary" className="text-xs">
                          +{trial.features.length - 2} more
                        </badge_1.Badge>)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button_1.Button variant="outline" size="sm" className="flex-1 text-xs">
                      <lucide_react_1.Mail className="mr-1 h-3 w-3"/>
                      Contact
                    </button_1.Button>
                    <button_1.Button variant="outline" size="sm" className="flex-1 text-xs">
                      <lucide_react_1.Calendar className="mr-1 h-3 w-3"/>
                      Schedule
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>        {/* Recommended Actions Tab */}
        <tabs_1.TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {mockActions.map(function (action) { return (<card_1.Card key={action.id}>
                <card_1.CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{action.title}</h4>
                        <div className="flex items-center space-x-2">
                          <badge_1.Badge variant="outline" className={(0, utils_1.cn)('text-xs', PRIORITY_COLORS[action.priority])}>
                            {action.priority} priority
                          </badge_1.Badge>
                          <badge_1.Badge variant="secondary" className="text-xs">
                            {action.impact}% impact
                          </badge_1.Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <div className="flex items-center space-x-2 pt-2">
                        <button_1.Button size="sm" className="text-xs">
                          Execute Action
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm" className="text-xs">
                          Schedule Later
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm" className="text-xs">
                          Dismiss
                        </button_1.Button>
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>); })}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
