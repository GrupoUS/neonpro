"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientProfileView;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var avatar_1 = require("@/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
function PatientProfileView(_a) {
  var patientId = _a.patientId,
    onProfileUpdate = _a.onProfileUpdate;
  var _b = (0, react_1.useState)(null),
    profile = _b[0],
    setProfile = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  (0, react_1.useEffect)(() => {
    fetchPatientProfile();
  }, [patientId]);
  var fetchPatientProfile = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/patients/".concat(patientId))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch patient profile");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProfile(data.profile);
            setError(null);
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "An error occurred");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  var getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var calculateAge = (dateOfBirth) => {
    var today = new Date();
    var birthDate = new Date(dateOfBirth);
    var age = today.getFullYear() - birthDate.getFullYear();
    var monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error) {
    return (
      <card_1.Card className="p-6">
        <div className="text-center text-red-600">
          <lucide_react_1.AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <button_1.Button onClick={fetchPatientProfile} className="mt-4">
            Try Again
          </button_1.Button>
        </div>
      </card_1.Card>
    );
  }
  if (!profile) {
    return (
      <card_1.Card className="p-6">
        <div className="text-center text-gray-500">
          <lucide_react_1.FileText className="h-8 w-8 mx-auto mb-2" />
          <p>Patient profile not found</p>
        </div>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <avatar_1.Avatar className="h-16 w-16">
                <avatar_1.AvatarImage src="" alt={profile.demographics.name} />
                <avatar_1.AvatarFallback className="text-lg">
                  {profile.demographics.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div>
                <card_1.CardTitle className="text-2xl">
                  {profile.demographics.name}
                </card_1.CardTitle>
                <card_1.CardDescription className="text-lg">
                  {calculateAge(profile.demographics.date_of_birth)} years old •{" "}
                  {profile.demographics.gender}
                </card_1.CardDescription>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.Phone className="h-4 w-4" />
                    <span>{profile.demographics.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.Mail className="h-4 w-4" />
                    <span>{profile.demographics.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              {profile.risk_level && (
                <badge_1.Badge className={getRiskBadgeColor(profile.risk_level)}>
                  {profile.risk_level.toUpperCase()} RISK
                </badge_1.Badge>
              )}
              <div className="text-sm text-gray-500">
                Profile: {Math.round(profile.profile_completeness_score * 100)}% complete
              </div>
            </div>
          </div>
        </card_1.CardHeader>
      </card_1.Card>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medical">Medical History</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="medications">Medications</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="contacts">Contacts</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights">AI Insights</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vital Stats */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Vital Statistics
                </card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2 text-sm">
                  {profile.bmi && (
                    <div className="flex justify-between">
                      <span>BMI:</span>
                      <span className="font-medium">{profile.bmi}</span>
                    </div>
                  )}
                  {profile.blood_type && (
                    <div className="flex justify-between">
                      <span>Blood Type:</span>
                      <span className="font-medium">{profile.blood_type}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-medium">
                      {profile.risk_score
                        ? "".concat(Math.round(profile.risk_score * 100), "%")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Chronic Conditions */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Chronic Conditions
                </card_1.CardTitle>
                <lucide_react_1.Heart className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {profile.chronic_conditions.length > 0
                    ? profile.chronic_conditions.map((condition, index) => (
                        <badge_1.Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </badge_1.Badge>
                      ))
                    : <p className="text-sm text-gray-500">No chronic conditions recorded</p>}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Allergies */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Allergies</card_1.CardTitle>
                <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {profile.allergies.length > 0
                    ? profile.allergies.map((allergy, index) => (
                        <badge_1.Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </badge_1.Badge>
                      ))
                    : <p className="text-sm text-gray-500">No known allergies</p>}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Medical History Tab */}
        <tabs_1.TabsContent value="medical" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Medical History</card_1.CardTitle>
              <card_1.CardDescription>Past medical events and conditions</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {profile.medical_history.length > 0
                  ? profile.medical_history.map((event, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="text-sm">{event}</p>
                      </div>
                    ))
                  : <p className="text-gray-500">No medical history recorded</p>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Medications Tab */}
        <tabs_1.TabsContent value="medications" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Current Medications</card_1.CardTitle>
              <card_1.CardDescription>Active prescriptions and supplements</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {profile.current_medications.length > 0
                  ? profile.current_medications.map((medication, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-gray-600">
                            {medication.dosage} • {medication.frequency}
                          </p>
                        </div>
                      </div>
                    ))
                  : <p className="text-gray-500">No current medications</p>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Contacts Tab */}
        <tabs_1.TabsContent value="contacts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Emergency Contacts</card_1.CardTitle>
              <card_1.CardDescription>
                People to contact in case of emergency
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {profile.emergency_contacts && profile.emergency_contacts.length > 0
                  ? profile.emergency_contacts.map((contact, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-gray-600">{contact.relationship}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p>{contact.phone}</p>
                            {contact.email && <p>{contact.email}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  : <p className="text-gray-500">No emergency contacts recorded</p>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* AI Insights Tab */}
        <tabs_1.TabsContent value="insights" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>AI-Powered Insights</card_1.CardTitle>
              <card_1.CardDescription>
                Intelligent analysis and recommendations based on patient data
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {profile.ai_insights
                ? <div className="space-y-4">
                    <div className="text-center">
                      <button_1.Button
                        onClick={() =>
                          (window.location.href = "/patients/".concat(patientId, "/insights"))
                        }
                      >
                        View Full AI Analysis
                      </button_1.Button>
                    </div>
                  </div>
                : <div className="text-center text-gray-500">
                    <lucide_react_1.TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p>AI insights not yet generated</p>
                    <button_1.Button
                      className="mt-4"
                      onClick={() => {
                        // Generate insights
                        fetch("/api/patients/".concat(patientId, "/insights")).then(() =>
                          fetchPatientProfile(),
                        );
                      }}
                    >
                      Generate AI Insights
                    </button_1.Button>
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
