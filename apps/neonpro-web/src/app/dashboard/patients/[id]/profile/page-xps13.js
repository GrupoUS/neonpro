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
exports.default = PatientProfilePage;
var navigation_1 = require("next/navigation");
var server_1 = require("@/app/utils/supabase/server");
var dashboard_layout_1 = require("@/components/navigation/dashboard-layout");
var profile_edit_form_1 = require("@/components/dashboard/patients/profile-edit-form");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
function getPatientProfile(patientId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, patient, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from('patients')
                        .select("\n      *,\n      profiles:patient_profiles(*),\n      emergency_contacts(*),\n      lgpd_consents(*)\n    ")
                        .eq('id', patientId)
                        .single()];
                case 1:
                    _a = _b.sent(), patient = _a.data, error = _a.error;
                    if (error || !patient) {
                        console.error('Error fetching patient:', error);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, patient];
            }
        });
    });
}
function PatientProfilePage(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var supabase, session, user, patient, breadcrumbs;
        var _c, _d, _e;
        var params = _b.params;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, server_1.createClient)()
                    // Verify authentication
                ];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_f.sent()).data.session;
                    if (!session)
                        (0, navigation_1.redirect)('/login');
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    user = (_f.sent()).data.user;
                    if (!user)
                        (0, navigation_1.redirect)('/login');
                    return [4 /*yield*/, getPatientProfile(params.id, supabase)];
                case 4:
                    patient = _f.sent();
                    if (!patient) {
                        (0, navigation_1.notFound)();
                    }
                    breadcrumbs = [
                        { title: "Dashboard", href: "/dashboard" },
                        { title: "Pacientes", href: "/dashboard/patients" },
                        { title: patient.full_name || 'Paciente', href: "/dashboard/patients/".concat(params.id) },
                        { title: "Perfil" }
                    ];
                    return [2 /*return*/, (<dashboard_layout_1.DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Patient Overview Header */}
        <card_1.Card>
          <card_1.CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <lucide_react_1.User className="h-6 w-6 text-blue-600"/>
                </div>
                <div>
                  <card_1.CardTitle className="flex items-center gap-2">
                    {patient.full_name || 'Paciente sem nome'}
                    {((_d = (_c = patient.lgpd_consents) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.sensitive_data_consent) && (<badge_1.Badge variant="secondary" className="text-xs">
                        <lucide_react_1.Shield className="h-3 w-3 mr-1"/>
                        LGPD Compliant
                      </badge_1.Badge>)}
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    {patient.email && "".concat(patient.email, " \u2022 ")}
                    {patient.mobile || patient.phone}
                  </card_1.CardDescription>
                </div>
              </div>              <div className="text-right">
                <badge_1.Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </badge_1.Badge>
                {patient.created_at && (<p className="text-xs text-muted-foreground mt-1">
                    <lucide_react_1.Clock className="h-3 w-3 inline mr-1"/>
                    Cadastrado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                  </p>)}
              </div>
            </div>
          </card_1.CardHeader>
          
          {patient.emergency_contacts && patient.emergency_contacts.length > 0 && (<card_1.CardContent>
              <separator_1.Separator className="mb-4"/>
              <div className="flex items-center gap-2 mb-2">
                <lucide_react_1.Heart className="h-4 w-4 text-red-500"/>
                <span className="text-sm font-medium">Contatos de Emergência</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {patient.emergency_contacts.slice(0, 2).map(function (contact, index) { return (<span key={index}>
                    {contact.name} ({contact.relationship}) - {contact.phone}
                  </span>); })}
                {patient.emergency_contacts.length > 2 && (<span>+{patient.emergency_contacts.length - 2} mais</span>)}
              </div>
            </card_1.CardContent>)}
        </card_1.Card>

        {/* Profile Edit Form */}
        <profile_edit_form_1.PatientProfileEditForm patientId={params.id} initialData={((_e = patient.profiles) === null || _e === void 0 ? void 0 : _e[0]) || patient} onSuccess={function () {
                                // Redirect or refresh as needed
                                window.location.reload();
                            }} onCancel={function () {
                                window.history.back();
                            }}/>
      </div>
    </dashboard_layout_1.DashboardLayout>)];
            }
        });
    });
}
