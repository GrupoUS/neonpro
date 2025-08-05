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
exports.default = PatientProfileManager;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var progress_1 = require("@/components/ui/progress");
var avatar_1 = require("@/components/ui/avatar");
var separator_1 = require("@/components/ui/separator");
var alert_1 = require("@/components/ui/alert");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
// Import our custom components
var medical_history_manager_1 = require("./medical-history/medical-history-manager");
var treatment_plan_manager_1 = require("./treatment-plans/treatment-plan-manager");
var progress_tracking_manager_1 = require("./progress-tracking/progress-tracking-manager");
// Mock data generator
var generateMockPatientProfile = function () {
  return {
    id: "patient_001",
    identifier: [
      {
        system: "http://www.saude.gov.br/fhir/r4/NamingSystem/cpf",
        value: "123.456.789-00",
        type: "CPF",
      },
      {
        system: "http://clinic.example.com/fhir/r4/NamingSystem/medical-record",
        value: "MR-2024-001",
        type: "medical_record",
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        family: "Silva",
        given: ["Maria", "José"],
        prefix: ["Sra."],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "+55 11 99999-9999",
        use: "mobile",
        rank: 1,
      },
      {
        system: "email",
        value: "maria.silva@email.com",
        use: "home",
        rank: 2,
      },
    ],
    gender: "female",
    birthDate: new Date("1985-03-15"),
    address: [
      {
        use: "home",
        type: "physical",
        line: ["Rua das Flores, 123", "Apto 45"],
        city: "São Paulo",
        district: "Vila Madalena",
        state: "SP",
        postalCode: "05435-000",
        country: "BR",
      },
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "C",
                display: "Emergency Contact",
              },
            ],
          },
        ],
        name: {
          family: "Silva",
          given: ["João"],
        },
        telecom: [
          {
            system: "phone",
            value: "+55 11 88888-8888",
            use: "mobile",
          },
        ],
        gender: "male",
      },
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: "urn:ietf:bcp:47",
              code: "pt-BR",
              display: "Portuguese (Brazil)",
            },
          ],
        },
        preferred: true,
      },
    ],
    clinicalSummary: {
      riskLevel: "medium",
      chronicConditions: ["Diabetes Type 2", "Hypertension"],
      allergies: ["Penicillin", "Latex"],
      currentMedications: ["Metformin 500mg", "Lisinopril 10mg"],
      lastVisit: new Date("2024-01-15"),
      nextAppointment: new Date("2024-02-15"),
      treatmentStatus: "active",
      progressPercentage: 75,
    },
    insurance: [
      {
        sequence: 1,
        focal: true,
        coverage: {
          reference: "Coverage/insurance-001",
          display: "Unimed São Paulo",
        },
      },
    ],
    preferences: {
      communicationMethod: "email",
      appointmentReminders: true,
      marketingCommunications: false,
      dataSharing: true,
      researchParticipation: false,
    },
    lgpdConsent: {
      consentGiven: true,
      consentDate: new Date("2024-01-01"),
      consentVersion: "1.0",
      dataProcessingPurposes: ["Healthcare delivery", "Treatment planning", "Quality improvement"],
      dataRetentionPeriod: 60,
      rightToWithdraw: true,
      rightToPortability: true,
      rightToErasure: true,
    },
    meta: {
      versionId: "1",
      lastUpdated: new Date(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "Dr. Silva",
    isArchived: false,
  };
};
var generateMockPatientStats = function () {
  return {
    totalAppointments: 24,
    completedTreatments: 3,
    activeTreatments: 2,
    averageSatisfaction: 8.5,
    lastVisit: new Date("2024-01-15"),
    nextAppointment: new Date("2024-02-15"),
    totalSpent: 15750.0,
    outstandingBalance: 2500.0,
    loyaltyPoints: 1250,
    referrals: 3,
  };
};
var generateMockPatientActivity = function () {
  var activities = [];
  var types = ["appointment", "treatment", "payment", "communication", "document", "progress"];
  var statuses = ["completed", "pending", "in_progress"];
  var categories = ["clinical", "administrative", "financial", "communication"];
  for (var i = 0; i < 10; i++) {
    var timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
    activities.push({
      id: "activity_".concat(i + 1),
      type: types[Math.floor(Math.random() * types.length)],
      title: "Activity ".concat(i + 1),
      description: "Description for activity ".concat(i + 1),
      timestamp: timestamp,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: "medium",
      category: categories[Math.floor(Math.random() * categories.length)],
      performedBy: "Dr. Silva",
      notes: "Notes for activity ".concat(i + 1),
    });
  }
  return activities.sort(function (a, b) {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
};
function PatientProfileManager() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
  var _l = (0, react_1.useState)(null),
    patientProfile = _l[0],
    setPatientProfile = _l[1];
  var _m = (0, react_1.useState)(null),
    patientStats = _m[0],
    setPatientStats = _m[1];
  var _o = (0, react_1.useState)([]),
    patientActivity = _o[0],
    setPatientActivity = _o[1];
  var _p = (0, react_1.useState)("overview"),
    activeTab = _p[0],
    setActiveTab = _p[1];
  var _q = (0, react_1.useState)(false),
    isEditing = _q[0],
    setIsEditing = _q[1];
  var _r = (0, react_1.useState)({}),
    editedProfile = _r[0],
    setEditedProfile = _r[1];
  var _s = (0, react_1.useState)(false),
    showLGPDDialog = _s[0],
    setShowLGPDDialog = _s[1];
  var _t = (0, react_1.useState)(false),
    showContactDialog = _t[0],
    setShowContactDialog = _t[1];
  (0, react_1.useEffect)(function () {
    // Load mock data
    setPatientProfile(generateMockPatientProfile());
    setPatientStats(generateMockPatientStats());
    setPatientActivity(generateMockPatientActivity());
  }, []);
  var handleSaveProfile = function () {
    if (patientProfile && editedProfile) {
      var updatedProfile = __assign(__assign(__assign({}, patientProfile), editedProfile), {
        updatedAt: new Date(),
        updatedBy: "Current User",
      });
      setPatientProfile(updatedProfile);
      setIsEditing(false);
      setEditedProfile({});
    }
  };
  var getRiskLevelColor = function (riskLevel) {
    switch (riskLevel) {
      case "critical":
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
  var getActivityIcon = function (type) {
    switch (type) {
      case "appointment":
        return <lucide_react_1.Calendar className="h-4 w-4" />;
      case "treatment":
        return <lucide_react_1.Stethoscope className="h-4 w-4" />;
      case "payment":
        return <lucide_react_1.Target className="h-4 w-4" />;
      case "communication":
        return <lucide_react_1.MessageSquare className="h-4 w-4" />;
      case "document":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "progress":
        return <lucide_react_1.TrendingUp className="h-4 w-4" />;
      default:
        return <lucide_react_1.Info className="h-4 w-4" />;
    }
  };
  var getStatusIcon = function (status) {
    switch (status) {
      case "completed":
        return <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <lucide_react_1.Activity className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <lucide_react_1.Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <lucide_react_1.XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <lucide_react_1.Info className="h-4 w-4 text-gray-500" />;
    }
  };
  if (!patientProfile || !patientStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading patient profile...</p>
        </div>
      </div>
    );
  }
  var primaryName =
    patientProfile.name.find(function (n) {
      return n.use === "official";
    }) || patientProfile.name[0];
  var primaryPhone = patientProfile.telecom.find(function (t) {
    return t.system === "phone" && t.use === "mobile";
  });
  var primaryEmail = patientProfile.telecom.find(function (t) {
    return t.system === "email";
  });
  var primaryAddress =
    patientProfile.address.find(function (a) {
      return a.use === "home";
    }) || patientProfile.address[0];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <avatar_1.Avatar className="h-16 w-16">
            <avatar_1.AvatarImage
              src={
                (_b = (_a = patientProfile.photo) === null || _a === void 0 ? void 0 : _a[0]) ===
                  null || _b === void 0
                  ? void 0
                  : _b.url
              }
            />
            <avatar_1.AvatarFallback>
              {(_c = primaryName.given[0]) === null || _c === void 0 ? void 0 : _c[0]}
              {primaryName.family[0]}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {(_d = primaryName.prefix) === null || _d === void 0 ? void 0 : _d[0]}{" "}
              {primaryName.given.join(" ")} {primaryName.family}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span className="flex items-center">
                <lucide_react_1.User className="h-4 w-4 mr-1" />
                {(_e = patientProfile.identifier.find(function (i) {
                  return i.type === "medical_record";
                })) === null || _e === void 0
                  ? void 0
                  : _e.value}
              </span>
              <span className="flex items-center">
                <lucide_react_1.Calendar className="h-4 w-4 mr-1" />
                {(0, date_fns_1.format)(patientProfile.birthDate, "MMM dd, yyyy")}
              </span>
              <badge_1.Badge
                className={getRiskLevelColor(patientProfile.clinicalSummary.riskLevel)}
              >
                {patientProfile.clinicalSummary.riskLevel} risk
              </badge_1.Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={function () {
              return setShowContactDialog(true);
            }}
          >
            <lucide_react_1.Phone className="h-4 w-4 mr-2" />
            Contact
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Video className="h-4 w-4 mr-2" />
            Video Call
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
            Schedule
          </button_1.Button>
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={function () {
              return setShowLGPDDialog(true);
            }}
          >
            <lucide_react_1.Shield className="h-4 w-4 mr-2" />
            Privacy
          </button_1.Button>
          <button_1.Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={
              isEditing
                ? handleSaveProfile
                : function () {
                    return setIsEditing(true);
                  }
            }
          >
            {isEditing
              ? <>
                  <lucide_react_1.Save className="h-4 w-4 mr-2" />
                  Save
                </>
              : <>
                  <lucide_react_1.Edit className="h-4 w-4 mr-2" />
                  Edit
                </>}
          </button_1.Button>
          {isEditing && (
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={function () {
                setIsEditing(false);
                setEditedProfile({});
              }}
            >
              <lucide_react_1.X className="h-4 w-4" />
            </button_1.Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{patientStats.totalAppointments}</p>
              </div>
              <lucide_react_1.Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Treatments</p>
                <p className="text-2xl font-bold">{patientStats.activeTreatments}</p>
              </div>
              <lucide_react_1.Activity className="h-8 w-8 text-green-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{patientStats.averageSatisfaction}/10</p>
              </div>
              <lucide_react_1.Star className="h-8 w-8 text-yellow-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {patientProfile.clinicalSummary.progressPercentage}%
                </p>
              </div>
              <lucide_react_1.TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-6">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical-history">Medical History</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="treatment-plans">Treatment Plans</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="progress">Progress</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="documents">Documents</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="activity">Activity</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="lg:col-span-2 space-y-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Patient Information</card_1.CardTitle>
                  <card_1.CardDescription>
                    Basic demographic and contact information
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label_1.Label className="text-sm font-medium">Full Name</label_1.Label>
                      {isEditing
                        ? <input_1.Input
                            value={
                              ((_g =
                                (_f = editedProfile.name) === null || _f === void 0
                                  ? void 0
                                  : _f[0]) === null || _g === void 0
                                ? void 0
                                : _g.given.join(" ")) +
                                " " +
                                ((_j =
                                  (_h = editedProfile.name) === null || _h === void 0
                                    ? void 0
                                    : _h[0]) === null || _j === void 0
                                  ? void 0
                                  : _j.family) ||
                              primaryName.given.join(" ") + " " + primaryName.family
                            }
                            onChange={function (e) {
                              var _a = e.target.value.split(" "),
                                given = _a[0],
                                family = _a.slice(1);
                              setEditedProfile(
                                __assign(__assign({}, editedProfile), {
                                  name: [
                                    __assign(__assign({}, primaryName), {
                                      given: [given],
                                      family: family.join(" ") || primaryName.family,
                                    }),
                                  ],
                                }),
                              );
                            }}
                          />
                        : <p className="text-sm text-muted-foreground">
                            {primaryName.given.join(" ")} {primaryName.family}
                          </p>}
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">Gender</label_1.Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {patientProfile.gender}
                      </p>
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">Date of Birth</label_1.Label>
                      <p className="text-sm text-muted-foreground">
                        {(0, date_fns_1.format)(patientProfile.birthDate, "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">CPF</label_1.Label>
                      <p className="text-sm text-muted-foreground">
                        {(_k = patientProfile.identifier.find(function (i) {
                          return i.type === "CPF";
                        })) === null || _k === void 0
                          ? void 0
                          : _k.value}
                      </p>
                    </div>
                  </div>

                  <separator_1.Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label_1.Label className="text-sm font-medium">Phone</label_1.Label>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <lucide_react_1.Phone className="h-4 w-4 mr-2" />
                          {primaryPhone === null || primaryPhone === void 0
                            ? void 0
                            : primaryPhone.value}
                        </p>
                      </div>
                      <div>
                        <label_1.Label className="text-sm font-medium">Email</label_1.Label>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <lucide_react_1.Mail className="h-4 w-4 mr-2" />
                          {primaryEmail === null || primaryEmail === void 0
                            ? void 0
                            : primaryEmail.value}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">Address</label_1.Label>
                      <p className="text-sm text-muted-foreground flex items-start">
                        <lucide_react_1.MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          {primaryAddress === null || primaryAddress === void 0
                            ? void 0
                            : primaryAddress.line.join(", ")}
                          <br />
                          {primaryAddress === null || primaryAddress === void 0
                            ? void 0
                            : primaryAddress.city}
                          ,{" "}
                          {primaryAddress === null || primaryAddress === void 0
                            ? void 0
                            : primaryAddress.state}{" "}
                          {primaryAddress === null || primaryAddress === void 0
                            ? void 0
                            : primaryAddress.postalCode}
                        </span>
                      </p>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Clinical Summary */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Clinical Summary</card_1.CardTitle>
                  <card_1.CardDescription>
                    Current health status and treatment overview
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label_1.Label className="text-sm font-medium">Risk Level</label_1.Label>
                      <badge_1.Badge
                        className={getRiskLevelColor(patientProfile.clinicalSummary.riskLevel)}
                      >
                        {patientProfile.clinicalSummary.riskLevel}
                      </badge_1.Badge>
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">
                        Treatment Status
                      </label_1.Label>
                      <badge_1.Badge variant="outline">
                        {patientProfile.clinicalSummary.treatmentStatus}
                      </badge_1.Badge>
                    </div>
                  </div>

                  <div>
                    <label_1.Label className="text-sm font-medium">
                      Treatment Progress
                    </label_1.Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <progress_1.Progress
                        value={patientProfile.clinicalSummary.progressPercentage}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {patientProfile.clinicalSummary.progressPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label_1.Label className="text-sm font-medium">
                        Chronic Conditions
                      </label_1.Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientProfile.clinicalSummary.chronicConditions.map(function (condition) {
                          return (
                            <badge_1.Badge key={condition} variant="secondary" className="text-xs">
                              {condition}
                            </badge_1.Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label_1.Label className="text-sm font-medium">Allergies</label_1.Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patientProfile.clinicalSummary.allergies.map(function (allergy) {
                          return (
                            <badge_1.Badge key={allergy} variant="destructive" className="text-xs">
                              <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
                              {allergy}
                            </badge_1.Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">Recent Activity</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {patientActivity.slice(0, 5).map(function (activity) {
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {(0, date_fns_1.format)(activity.timestamp, "MMM dd, HH:mm")}
                            </p>
                          </div>
                          {getStatusIcon(activity.status)}
                        </div>
                      );
                    })}
                  </div>
                  <button_1.Button variant="ghost" className="w-full mt-3" size="sm">
                    View All Activity
                    <lucide_react_1.ChevronRight className="h-4 w-4 ml-1" />
                  </button_1.Button>
                </card_1.CardContent>
              </card_1.Card>

              {/* Quick Actions */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">Quick Actions</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-2">
                    <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                      <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                      <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                      Add Clinical Note
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                      <lucide_react_1.Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                      <lucide_react_1.Pill className="h-4 w-4 mr-2" />
                      Update Medications
                    </button_1.Button>
                    <button_1.Button variant="outline" className="w-full justify-start" size="sm">
                      <lucide_react_1.MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </button_1.Button>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </div>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="medical-history">
          <medical_history_manager_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="treatment-plans">
          <treatment_plan_manager_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="progress">
          <progress_tracking_manager_1.default />
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="documents" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Documents & Files</card_1.CardTitle>
              <card_1.CardDescription>
                Patient documents, reports, and attachments
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8">
                <lucide_react_1.FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Document management will be implemented here
                </p>
                <button_1.Button variant="outline" className="mt-4">
                  <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="activity" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Activity Timeline</card_1.CardTitle>
              <card_1.CardDescription>
                Complete history of patient interactions and events
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {patientActivity.map(function (activity) {
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(activity.status)}
                            <span className="text-xs text-muted-foreground">
                              {(0, date_fns_1.format)(activity.timestamp, "MMM dd, yyyy HH:mm")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        <div className="flex items-center space-x-2">
                          <badge_1.Badge variant="outline" className="text-xs">
                            {activity.category}
                          </badge_1.Badge>
                          <span className="text-xs text-muted-foreground">
                            by {activity.performedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* LGPD Privacy Dialog */}
      <dialog_1.Dialog open={showLGPDDialog} onOpenChange={setShowLGPDDialog}>
        <dialog_1.DialogContent className="max-w-2xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center">
              <lucide_react_1.Shield className="h-5 w-5 mr-2" />
              Privacy & Data Protection (LGPD)
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Patient data protection and consent management
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <alert_1.Alert>
              <lucide_react_1.Shield className="h-4 w-4" />
              <alert_1.AlertTitle>LGPD Compliance Status</alert_1.AlertTitle>
              <alert_1.AlertDescription>
                This patient has provided consent for data processing under LGPD regulations.
              </alert_1.AlertDescription>
            </alert_1.Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label_1.Label className="text-sm font-medium">Consent Date</label_1.Label>
                <p className="text-sm text-muted-foreground">
                  {(0, date_fns_1.format)(patientProfile.lgpdConsent.consentDate, "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <label_1.Label className="text-sm font-medium">Consent Version</label_1.Label>
                <p className="text-sm text-muted-foreground">
                  {patientProfile.lgpdConsent.consentVersion}
                </p>
              </div>
              <div>
                <label_1.Label className="text-sm font-medium">Data Retention</label_1.Label>
                <p className="text-sm text-muted-foreground">
                  {patientProfile.lgpdConsent.dataRetentionPeriod} months
                </p>
              </div>
              <div>
                <label_1.Label className="text-sm font-medium">Rights Status</label_1.Label>
                <div className="flex items-center space-x-2">
                  {patientProfile.lgpdConsent.rightToWithdraw && (
                    <badge_1.Badge variant="outline" className="text-xs">
                      <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                      Withdraw
                    </badge_1.Badge>
                  )}
                  {patientProfile.lgpdConsent.rightToPortability && (
                    <badge_1.Badge variant="outline" className="text-xs">
                      <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                      Portability
                    </badge_1.Badge>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label_1.Label className="text-sm font-medium">
                Data Processing Purposes
              </label_1.Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {patientProfile.lgpdConsent.dataProcessingPurposes.map(function (purpose) {
                  return (
                    <badge_1.Badge key={purpose} variant="secondary" className="text-xs">
                      {purpose}
                    </badge_1.Badge>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button_1.Button
                variant="outline"
                onClick={function () {
                  return setShowLGPDDialog(false);
                }}
              >
                Close
              </button_1.Button>
              <button_1.Button variant="outline">
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Export Data
              </button_1.Button>
              <button_1.Button variant="destructive">
                <lucide_react_1.AlertTriangle className="h-4 w-4 mr-2" />
                Revoke Consent
              </button_1.Button>
            </div>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Contact Dialog */}
      <dialog_1.Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Contact Patient</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>Choose a communication method</dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            <button_1.Button variant="outline" className="w-full justify-start">
              <lucide_react_1.Phone className="h-4 w-4 mr-2" />
              Call {primaryPhone === null || primaryPhone === void 0 ? void 0 : primaryPhone.value}
            </button_1.Button>
            <button_1.Button variant="outline" className="w-full justify-start">
              <lucide_react_1.Mail className="h-4 w-4 mr-2" />
              Email {primaryEmail === null || primaryEmail === void 0 ? void 0 : primaryEmail.value}
            </button_1.Button>
            <button_1.Button variant="outline" className="w-full justify-start">
              <lucide_react_1.MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </button_1.Button>
            <button_1.Button variant="outline" className="w-full justify-start">
              <lucide_react_1.Video className="h-4 w-4 mr-2" />
              Video Call
            </button_1.Button>
          </div>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
