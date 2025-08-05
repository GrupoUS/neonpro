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
exports.PatientManagementDashboard = PatientManagementDashboard;
/**
 * Patient Management Dashboard Component
 *
 * Main dashboard for patient management with search, filtering,
 * and FHIR-compliant patient records display.
 */
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var PatientRegistrationForm_1 = require("./PatientRegistrationForm");
var PatientSearch_1 = require("./PatientSearch");
var PatientTable_1 = require("./PatientTable");
var PatientStatsCards_1 = require("./PatientStatsCards");
var auth_context_1 = require("@/contexts/auth-context");
var patients_1 = require("@/lib/supabase/patients");
function PatientManagementDashboard() {
    var _this = this;
    var user = (0, auth_context_1.useAuth)().user;
    var _a = (0, react_1.useState)([]), patients = _a[0], setPatients = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(0), totalCount = _c[0], setTotalCount = _c[1];
    var _d = (0, react_1.useState)(false), hasNextPage = _d[0], setHasNextPage = _d[1];
    var _e = (0, react_1.useState)(false), isRegistrationOpen = _e[0], setIsRegistrationOpen = _e[1];
    var _f = (0, react_1.useState)({
        limit: 25,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc'
    }), searchParams = _f[0], setSearchParams = _f[1];
    // Load patients data
    var loadPatients = (0, react_1.useCallback)(function (params) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, patients_1.searchPatients)(params, user.id)];
                case 2:
                    result = _a.sent();
                    setPatients(result.patients);
                    setTotalCount(result.total_count);
                    setHasNextPage(result.has_next_page);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading patients:', error_1);
                    sonner_1.toast.error('Failed to load patients');
                    return [3 /*break*/, 5];
                case 4:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.id]);
    // Initial load
    (0, react_1.useEffect)(function () {
        loadPatients(searchParams);
    }, [loadPatients, searchParams]);
    // Handle search
    var handleSearch = function (newParams) {
        var updatedParams = __assign(__assign(__assign({}, searchParams), newParams), { offset: 0 // Reset to first page when searching
         });
        setSearchParams(updatedParams);
    };
    // Handle pagination
    var handlePageChange = function (newOffset) {
        var updatedParams = __assign(__assign({}, searchParams), { offset: newOffset });
        setSearchParams(updatedParams);
    };
    // Handle successful patient registration
    var handleRegistrationSuccess = function (patientId) {
        setIsRegistrationOpen(false);
        loadPatients(searchParams); // Reload patients list
        sonner_1.toast.success('Patient registered successfully');
    };
    // Stats data (calculated from current patients)
    var stats = {
        total_patients: totalCount,
        active_patients: patients.filter(function (p) { return p.active; }).length,
        new_this_month: patients.filter(function (p) {
            var createdDate = new Date(p.created_at);
            var now = new Date();
            var firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return createdDate >= firstOfMonth;
        }).length,
        with_consents: patients.filter(function (p) { return p.consents_count > 0; }).length
    };
    return (<div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <dialog_1.Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button>
                <lucide_react_1.UserPlus className="mr-2 h-4 w-4"/>
                Register New Patient
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Register New Patient</dialog_1.DialogTitle>
              </dialog_1.DialogHeader>
              <PatientRegistrationForm_1.PatientRegistrationForm onSuccess={handleRegistrationSuccess} onCancel={function () { return setIsRegistrationOpen(false); }}/>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>

          <button_1.Button variant="outline">
            <lucide_react_1.Download className="mr-2 h-4 w-4"/>
            Export Data
          </button_1.Button>
        </div>

        <div className="flex items-center gap-2">
          <badge_1.Badge variant="secondary" className="flex items-center gap-1">
            <lucide_react_1.Users className="h-3 w-3"/>
            {totalCount} Total Patients
          </badge_1.Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <PatientStatsCards_1.PatientStatsCards stats={stats}/>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="patients" className="space-y-6">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="patients" className="flex items-center gap-2">
            <lucide_react_1.Users className="h-4 w-4"/>
            Patient Records
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="appointments" className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4"/>
            Appointments
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports" className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-4 w-4"/>
            Reports
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="patients" className="space-y-6">
          {/* Search and Filters */}
          <PatientSearch_1.PatientSearch onSearch={handleSearch} searchParams={searchParams} isLoading={isLoading}/>

          {/* Patient Table */}
          <PatientTable_1.PatientTable patients={patients} isLoading={isLoading} searchParams={searchParams} totalCount={totalCount} hasNextPage={hasNextPage} onPageChange={handlePageChange} onSort={function (field, order) { return handleSearch({ sort_by: field, sort_order: order }); }}/>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="appointments" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Patient Appointments</card_1.CardTitle>
              <card_1.CardDescription>
                View and manage patient appointments integrated with patient records.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <lucide_react_1.Calendar className="h-12 w-12 mx-auto"/>
                  <p>Appointment management coming soon</p>
                  <p className="text-sm">This will integrate with the existing appointment system</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="reports" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Patient Reports</card_1.CardTitle>
              <card_1.CardDescription>
                Generate LGPD-compliant reports and analytics for patient data.
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center space-y-2">
                  <lucide_react_1.FileText className="h-12 w-12 mx-auto"/>
                  <p>Report generation coming soon</p>
                  <p className="text-sm">FHIR-compliant and LGPD-compliant reporting</p>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
