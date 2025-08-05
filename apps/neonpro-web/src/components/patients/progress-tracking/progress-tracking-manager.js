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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProgressTrackingManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var progress_1 = require("@/components/ui/progress");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
// Mock data generator
var generateMockProgressEntries = function () {
  var entries = [];
  var entryTypes = ["photo", "measurement", "note", "video"];
  var categories = ["clinical", "aesthetic", "functional", "patient_reported"];
  var statuses = ["active", "completed"];
  for (var i = 0; i < 15; i++) {
    var entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 30));
    entries.push({
      id: "progress_".concat(i + 1),
      patientId: "patient_001",
      treatmentPlanId: "treatment_001",
      entryDate: entryDate,
      entryType: entryTypes[Math.floor(Math.random() * entryTypes.length)],
      title: "Progress Entry ".concat(i + 1),
      description: "Detailed description of progress entry ".concat(i + 1),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: "medium",
      category: categories[Math.floor(Math.random() * categories.length)],
      attachments: [],
      measurements: [],
      clinicalNotes: "Clinical notes for entry ".concat(i + 1),
      painLevel: Math.floor(Math.random() * 11),
      satisfactionLevel: Math.floor(Math.random() * 11),
      functionalScore: Math.floor(Math.random() * 101),
      progressPercentage: Math.floor(Math.random() * 101),
      milestoneAchieved: Math.random() > 0.7,
      nextSteps: ["Next step ".concat(i + 1, "A"), "Next step ".concat(i + 1, "B")],
      createdBy: "Dr. Silva",
      createdAt: entryDate,
      updatedAt: entryDate,
      tags: ["tag".concat((i % 3) + 1), "category".concat((i % 2) + 1)],
      isPrivate: false,
      consentGiven: true,
      anonymizationLevel: "none",
    });
  }
  return entries;
};
var generateMockComparisons = function () {
  return [
    {
      id: "comp_1",
      name: "Before vs After Treatment",
      baselineEntry: generateMockProgressEntries()[0],
      currentEntry: generateMockProgressEntries()[1],
      comparisonType: "before_after",
      metrics: {
        improvementPercentage: 75,
        significantChanges: ["Reduced swelling", "Improved alignment"],
        concerns: ["Minor discomfort"],
        recommendations: ["Continue current protocol", "Monitor progress weekly"],
      },
      generatedAt: new Date(),
    },
  ];
};
function ProgressTrackingManager() {
  var _a = (0, react_1.useState)([]),
    progressEntries = _a[0],
    setProgressEntries = _a[1];
  var _b = (0, react_1.useState)([]),
    comparisons = _b[0],
    setComparisons = _b[1];
  var _c = (0, react_1.useState)(null),
    selectedEntry = _c[0],
    setSelectedEntry = _c[1];
  var _d = (0, react_1.useState)(false),
    isAddingEntry = _d[0],
    setIsAddingEntry = _d[1];
  var _e = (0, react_1.useState)("timeline"),
    activeTab = _e[0],
    setActiveTab = _e[1];
  var _f = (0, react_1.useState)("all"),
    filterCategory = _f[0],
    setFilterCategory = _f[1];
  var _g = (0, react_1.useState)("all"),
    filterStatus = _g[0],
    setFilterStatus = _g[1];
  var _h = (0, react_1.useState)(""),
    searchTerm = _h[0],
    setSearchTerm = _h[1];
  var _j = (0, react_1.useState)(new Date()),
    selectedDate = _j[0],
    setSelectedDate = _j[1];
  // Form state for new entry
  var _k = (0, react_1.useState)({
      entryType: "photo",
      title: "",
      description: "",
      category: "clinical",
      priority: "medium",
      status: "active",
      painLevel: 0,
      satisfactionLevel: 0,
      functionalScore: 0,
      progressPercentage: 0,
      clinicalNotes: "",
      nextSteps: [],
      tags: [],
      isPrivate: false,
      consentGiven: true,
      anonymizationLevel: "none",
    }),
    newEntry = _k[0],
    setNewEntry = _k[1];
  (0, react_1.useEffect)(function () {
    // Load mock data
    setProgressEntries(generateMockProgressEntries());
    setComparisons(generateMockComparisons());
  }, []);
  var filteredEntries = progressEntries.filter(function (entry) {
    var _a;
    var matchesCategory = filterCategory === "all" || entry.category === filterCategory;
    var matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    var matchesSearch =
      searchTerm === "" ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((_a = entry.description) === null || _a === void 0
        ? void 0
        : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });
  var handleAddEntry = function () {
    if (!newEntry.title) return;
    var entry = {
      id: "progress_".concat(Date.now()),
      patientId: "patient_001",
      treatmentPlanId: "treatment_001",
      entryDate: selectedDate || new Date(),
      entryType: newEntry.entryType || "photo",
      title: newEntry.title,
      description: newEntry.description,
      status: newEntry.status || "active",
      priority: newEntry.priority || "medium",
      category: newEntry.category || "clinical",
      attachments: [],
      measurements: [],
      clinicalNotes: newEntry.clinicalNotes || "",
      painLevel: newEntry.painLevel,
      satisfactionLevel: newEntry.satisfactionLevel,
      functionalScore: newEntry.functionalScore,
      progressPercentage: newEntry.progressPercentage || 0,
      milestoneAchieved: false,
      nextSteps: newEntry.nextSteps || [],
      createdBy: "Current User",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newEntry.tags || [],
      isPrivate: newEntry.isPrivate || false,
      consentGiven: newEntry.consentGiven || true,
      anonymizationLevel: newEntry.anonymizationLevel || "none",
    };
    setProgressEntries(__spreadArray([entry], progressEntries, true));
    setIsAddingEntry(false);
    setNewEntry({
      entryType: "photo",
      title: "",
      description: "",
      category: "clinical",
      priority: "medium",
      status: "active",
      painLevel: 0,
      satisfactionLevel: 0,
      functionalScore: 0,
      progressPercentage: 0,
      clinicalNotes: "",
      nextSteps: [],
      tags: [],
      isPrivate: false,
      consentGiven: true,
      anonymizationLevel: "none",
    });
  };
  var getEntryIcon = function (type) {
    switch (type) {
      case "photo":
        return <lucide_react_1.Camera className="h-4 w-4" />;
      case "video":
        return <lucide_react_1.Video className="h-4 w-4" />;
      case "audio":
        return <lucide_react_1.Mic className="h-4 w-4" />;
      case "measurement":
        return <lucide_react_1.BarChart3 className="h-4 w-4" />;
      case "note":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "document":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      default:
        return <lucide_react_1.FileText className="h-4 w-4" />;
    }
  };
  var getStatusIcon = function (status) {
    switch (status) {
      case "completed":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case "active":
        return <lucide_react_1.Activity className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <lucide_react_1.Info className="h-4 w-4 text-gray-500" />;
    }
  };
  var getPriorityColor = function (priority) {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">
            Monitor treatment progress with photos, measurements, and clinical notes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Export
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Print className="h-4 w-4 mr-2" />
            Print Report
          </button_1.Button>
          <dialog_1.Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Add Entry
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-2xl">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Add Progress Entry</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Document treatment progress with photos, measurements, or clinical notes
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="entry-type">Entry Type</label_1.Label>
                    <select_1.Select
                      value={newEntry.entryType}
                      onValueChange={function (value) {
                        return setNewEntry(__assign(__assign({}, newEntry), { entryType: value }));
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="photo">Photo</select_1.SelectItem>
                        <select_1.SelectItem value="video">Video</select_1.SelectItem>
                        <select_1.SelectItem value="audio">Audio</select_1.SelectItem>
                        <select_1.SelectItem value="measurement">Measurement</select_1.SelectItem>
                        <select_1.SelectItem value="note">Clinical Note</select_1.SelectItem>
                        <select_1.SelectItem value="document">Document</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="category">Category</label_1.Label>
                    <select_1.Select
                      value={newEntry.category}
                      onValueChange={function (value) {
                        return setNewEntry(__assign(__assign({}, newEntry), { category: value }));
                      }}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="clinical">Clinical</select_1.SelectItem>
                        <select_1.SelectItem value="aesthetic">Aesthetic</select_1.SelectItem>
                        <select_1.SelectItem value="functional">Functional</select_1.SelectItem>
                        <select_1.SelectItem value="patient_reported">
                          Patient Reported
                        </select_1.SelectItem>
                        <select_1.SelectItem value="objective">Objective</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="title">Title</label_1.Label>
                  <input_1.Input
                    id="title"
                    value={newEntry.title}
                    onChange={function (e) {
                      return setNewEntry(
                        __assign(__assign({}, newEntry), { title: e.target.value }),
                      );
                    }}
                    placeholder="Enter entry title"
                  />
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="description">Description</label_1.Label>
                  <textarea_1.Textarea
                    id="description"
                    value={newEntry.description}
                    onChange={function (e) {
                      return setNewEntry(
                        __assign(__assign({}, newEntry), { description: e.target.value }),
                      );
                    }}
                    placeholder="Enter detailed description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="pain-level">Pain Level (0-10)</label_1.Label>
                    <input_1.Input
                      id="pain-level"
                      type="number"
                      min="0"
                      max="10"
                      value={newEntry.painLevel}
                      onChange={function (e) {
                        return setNewEntry(
                          __assign(__assign({}, newEntry), { painLevel: parseInt(e.target.value) }),
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="satisfaction">Satisfaction (0-10)</label_1.Label>
                    <input_1.Input
                      id="satisfaction"
                      type="number"
                      min="0"
                      max="10"
                      value={newEntry.satisfactionLevel}
                      onChange={function (e) {
                        return setNewEntry(
                          __assign(__assign({}, newEntry), {
                            satisfactionLevel: parseInt(e.target.value),
                          }),
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label_1.Label htmlFor="progress">Progress %</label_1.Label>
                    <input_1.Input
                      id="progress"
                      type="number"
                      min="0"
                      max="100"
                      value={newEntry.progressPercentage}
                      onChange={function (e) {
                        return setNewEntry(
                          __assign(__assign({}, newEntry), {
                            progressPercentage: parseInt(e.target.value),
                          }),
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="clinical-notes">Clinical Notes</label_1.Label>
                  <textarea_1.Textarea
                    id="clinical-notes"
                    value={newEntry.clinicalNotes}
                    onChange={function (e) {
                      return setNewEntry(
                        __assign(__assign({}, newEntry), { clinicalNotes: e.target.value }),
                      );
                    }}
                    placeholder="Enter clinical observations and notes"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return setIsAddingEntry(false);
                    }}
                  >
                    Cancel
                  </button_1.Button>
                  <button_1.Button onClick={handleAddEntry}>Add Entry</button_1.Button>
                </div>
              </div>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input_1.Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={function (e) {
                    return setSearchTerm(e.target.value);
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            <select_1.Select value={filterCategory} onValueChange={setFilterCategory}>
              <select_1.SelectTrigger className="w-[180px]">
                <select_1.SelectValue placeholder="Category" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Categories</select_1.SelectItem>
                <select_1.SelectItem value="clinical">Clinical</select_1.SelectItem>
                <select_1.SelectItem value="aesthetic">Aesthetic</select_1.SelectItem>
                <select_1.SelectItem value="functional">Functional</select_1.SelectItem>
                <select_1.SelectItem value="patient_reported">Patient Reported</select_1.SelectItem>
                <select_1.SelectItem value="objective">Objective</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
              <select_1.SelectTrigger className="w-[150px]">
                <select_1.SelectValue placeholder="Status" />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                <select_1.SelectItem value="active">Active</select_1.SelectItem>
                <select_1.SelectItem value="completed">Completed</select_1.SelectItem>
                <select_1.SelectItem value="cancelled">Cancelled</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <button_1.Button variant="outline" size="sm">
              <lucide_react_1.RefreshCw className="h-4 w-4" />
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="timeline">Timeline</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="gallery">Photo Gallery</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="measurements">Measurements</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="comparisons">Comparisons</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Reports</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-4">
            {filteredEntries.map(function (entry) {
              return (
                <card_1.Card
                  key={entry.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={function () {
                    return setSelectedEntry(entry);
                  }}
                >
                  <card_1.CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {getEntryIcon(entry.entryType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{entry.title}</h3>
                            {getStatusIcon(entry.status)}
                            <badge_1.Badge className={getPriorityColor(entry.priority)}>
                              {entry.priority}
                            </badge_1.Badge>
                            <badge_1.Badge variant="outline">{entry.category}</badge_1.Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <lucide_react_1.Calendar className="h-4 w-4 mr-1" />
                              {(0, date_fns_1.format)(entry.entryDate, "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center">
                              <lucide_react_1.Clock className="h-4 w-4 mr-1" />
                              {(0, date_fns_1.format)(entry.entryDate, "HH:mm")}
                            </span>
                            <span className="flex items-center">
                              <lucide_react_1.Target className="h-4 w-4 mr-1" />
                              {entry.progressPercentage}% Progress
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Eye className="h-4 w-4" />
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Edit className="h-4 w-4" />
                        </button_1.Button>
                      </div>
                    </div>

                    {entry.progressPercentage > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Treatment Progress</span>
                          <span>{entry.progressPercentage}%</span>
                        </div>
                        <progress_1.Progress value={entry.progressPercentage} className="h-2" />
                      </div>
                    )}

                    {entry.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        {entry.tags.map(function (tag) {
                          return (
                            <badge_1.Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </badge_1.Badge>
                          );
                        })}
                      </div>
                    )}
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="gallery" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEntries
              .filter(function (entry) {
                return entry.entryType === "photo" || entry.entryType === "video";
              })
              .map(function (entry) {
                return (
                  <card_1.Card
                    key={entry.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <card_1.CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {entry.entryType === "photo"
                          ? <lucide_react_1.Image className="h-8 w-8 text-gray-400" />
                          : <lucide_react_1.Video className="h-8 w-8 text-gray-400" />}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {(0, date_fns_1.format)(entry.entryDate, "MMM dd, yyyy")}
                      </p>
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="measurements" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Measurement Tracking</card_1.CardTitle>
              <card_1.CardDescription>
                Track quantitative progress metrics over time
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <card_1.Card>
                    <card_1.CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Avg Pain Level
                          </p>
                          <p className="text-2xl font-bold">3.2/10</p>
                        </div>
                        <lucide_react_1.TrendingDown className="h-8 w-8 text-green-500" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                  <card_1.Card>
                    <card_1.CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                          <p className="text-2xl font-bold">8.5/10</p>
                        </div>
                        <lucide_react_1.TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                  <card_1.Card>
                    <card_1.CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Functional Score
                          </p>
                          <p className="text-2xl font-bold">85/100</p>
                        </div>
                        <lucide_react_1.TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>

                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <lucide_react_1.LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Measurement charts will be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="comparisons" className="space-y-4">
          <div className="grid gap-4">
            {comparisons.map(function (comparison) {
              return (
                <card_1.Card key={comparison.id}>
                  <card_1.CardHeader>
                    <card_1.CardTitle>{comparison.name}</card_1.CardTitle>
                    <card_1.CardDescription>
                      {comparison.comparisonType.replace("_", " ")} comparison
                    </card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Baseline</h4>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <lucide_react_1.Image className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {(0, date_fns_1.format)(
                            comparison.baselineEntry.entryDate,
                            "MMM dd, yyyy",
                          )}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Current</h4>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <lucide_react_1.Image className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {(0, date_fns_1.format)(
                            comparison.currentEntry.entryDate,
                            "MMM dd, yyyy",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Improvement</h4>
                        <div className="flex items-center space-x-2">
                          <progress_1.Progress
                            value={comparison.metrics.improvementPercentage}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {comparison.metrics.improvementPercentage}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Significant Changes</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {comparison.metrics.significantChanges.map(function (change, index) {
                              return (
                                <li key={index} className="flex items-center">
                                  <lucide_react_1.CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  {change}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {comparison.metrics.recommendations.map(function (rec, index) {
                              return (
                                <li key={index} className="flex items-center">
                                  <lucide_react_1.Star className="h-3 w-3 text-blue-500 mr-2" />
                                  {rec}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Progress Reports</card_1.CardTitle>
              <card_1.CardDescription>
                Generate comprehensive progress reports for patients and providers
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button_1.Button variant="outline" className="h-24 flex-col">
                    <lucide_react_1.FileText className="h-8 w-8 mb-2" />
                    <span>Weekly Report</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-24 flex-col">
                    <lucide_react_1.BarChart3 className="h-8 w-8 mb-2" />
                    <span>Monthly Summary</span>
                  </button_1.Button>
                  <button_1.Button variant="outline" className="h-24 flex-col">
                    <lucide_react_1.PieChart className="h-8 w-8 mb-2" />
                    <span>Final Report</span>
                  </button_1.Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Reports</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">
                          Monthly Progress Report - January 2024
                        </p>
                        <p className="text-xs text-muted-foreground">Generated on Jan 31, 2024</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Eye className="h-4 w-4" />
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm">
                          <lucide_react_1.Download className="h-4 w-4" />
                        </button_1.Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <dialog_1.Dialog
          open={!!selectedEntry}
          onOpenChange={function () {
            return setSelectedEntry(null);
          }}
        >
          <dialog_1.DialogContent className="max-w-4xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="flex items-center space-x-2">
                {getEntryIcon(selectedEntry.entryType)}
                <span>{selectedEntry.title}</span>
              </dialog_1.DialogTitle>
              <dialog_1.DialogDescription>{selectedEntry.description}</dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium">Entry Date</label_1.Label>
                  <p className="text-sm text-muted-foreground">
                    {(0, date_fns_1.format)(selectedEntry.entryDate, "MMMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Category</label_1.Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.category}</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Status</label_1.Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEntry.status)}
                    <span className="text-sm text-muted-foreground">{selectedEntry.status}</span>
                  </div>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Priority</label_1.Label>
                  <badge_1.Badge className={getPriorityColor(selectedEntry.priority)}>
                    {selectedEntry.priority}
                  </badge_1.Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium">Pain Level</label_1.Label>
                  <p className="text-2xl font-bold">{selectedEntry.painLevel}/10</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Satisfaction</label_1.Label>
                  <p className="text-2xl font-bold">{selectedEntry.satisfactionLevel}/10</p>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">Progress</label_1.Label>
                  <p className="text-2xl font-bold">{selectedEntry.progressPercentage}%</p>
                </div>
              </div>

              {selectedEntry.clinicalNotes && (
                <div>
                  <label_1.Label className="text-sm font-medium">Clinical Notes</label_1.Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEntry.clinicalNotes}
                  </p>
                </div>
              )}

              {selectedEntry.nextSteps.length > 0 && (
                <div>
                  <label_1.Label className="text-sm font-medium">Next Steps</label_1.Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {selectedEntry.nextSteps.map(function (step, index) {
                      return (
                        <li key={index} className="flex items-center">
                          <lucide_react_1.Target className="h-3 w-3 mr-2" />
                          {step}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      )}
    </div>
  );
}
