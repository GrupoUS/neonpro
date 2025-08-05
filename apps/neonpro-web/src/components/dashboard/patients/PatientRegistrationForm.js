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
exports.PatientRegistrationForm = PatientRegistrationForm;
/**
 * Patient Registration Form Component
 *
 * FHIR-compliant patient registration with LGPD consent management.
 * Implements HL7 FHIR R4 Patient resource structure and Brazilian
 * data protection requirements.
 */
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var form_1 = require("@/components/ui/form");
var patient_1 = require("@/lib/validations/patient");
var patients_1 = require("@/lib/supabase/patients");
var auth_context_1 = require("@/contexts/auth-context");
function PatientRegistrationForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var user = (0, auth_context_1.useAuth)().user;
    var _b = (0, react_1.useState)(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(patient_1.PatientRegistrationSchema),
        defaultValues: {
            given_names: [''],
            family_name: '',
            medical_record_number: '',
            gender: 'unknown',
            birth_date: '',
            phone_primary: '',
            address_line1: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'BR',
            emergency_contact_name: '',
            emergency_contact_relationship: '',
            emergency_contact_phone: '',
            preferred_language: 'pt-BR',
            lgpd_consent_general: false,
            lgpd_consent_marketing: false,
            lgpd_consent_research: false,
            lgpd_consent_third_party: false,
        },
    });
    var _c = (0, react_hook_form_1.useFieldArray)({
        control: form.control,
        name: 'given_names',
    }), givenNameFields = _c.fields, appendGivenName = _c.append, removeGivenName = _c.remove;
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id)) {
                        sonner_1.toast.error('User not authenticated');
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, patients_1.createPatient)(data, user.id)];
                case 2:
                    result = _a.sent();
                    sonner_1.toast.success('Patient registered successfully');
                    form.reset();
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(result.patient.id);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error creating patient:', error_1);
                    if (error_1 instanceof Error) {
                        sonner_1.toast.error(error_1.message);
                    }
                    else {
                        sonner_1.toast.error('Failed to register patient');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<form_1.Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Patient Registration</h2>
          <p className="text-muted-foreground">
            Register a new patient with FHIR-compliant data structure and LGPD consent management.
          </p>
        </div>

        {/* Medical Record Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.FileText className="h-5 w-5"/>
              Medical Record Information
            </card_1.CardTitle>
            <card_1.CardDescription>
              Basic patient identification following HL7 FHIR Patient resource structure.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <form_1.FormField control={form.control} name="medical_record_number" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Medical Record Number *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="MR-2024-001" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Unique identifier for this patient within the clinic.
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Personal Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Personal Information</card_1.CardTitle>
            <card_1.CardDescription>
              Patient demographics and contact information.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Name Fields */}
            <div className="space-y-4">
              <form_1.FormField control={form.control} name="family_name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Family Name (Last Name) *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Silva" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <div className="space-y-2">
                <label_1.Label>Given Names (First Names) *</label_1.Label>
                {givenNameFields.map(function (field, index) { return (<div key={field.id} className="flex gap-2">
                    <form_1.FormField control={form.control} name={"given_names.".concat(index)} render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem className="flex-1">
                          <form_1.FormControl>
                            <input_1.Input placeholder={index === 0 ? "João" : "Middle name"} {...field}/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
            }}/>
                    {index > 0 && (<button_1.Button type="button" variant="outline" size="sm" onClick={function () { return removeGivenName(index); }}>
                        <lucide_react_1.Trash2 className="h-4 w-4"/>
                      </button_1.Button>)}
                  </div>); })}
                <button_1.Button type="button" variant="outline" size="sm" onClick={function () { return appendGivenName(''); }} className="w-full">
                  <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                  Add Middle Name
                </button_1.Button>
              </div>

              <form_1.FormField control={form.control} name="preferred_name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Preferred Name</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="How the patient likes to be called" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <separator_1.Separator />

            {/* Identity Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="cpf" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>CPF</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="000.000.000-00" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Brazilian individual taxpayer registry
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="rg" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>RG</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="00.000.000-0" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Brazilian general registry
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <separator_1.Separator />

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form_1.FormField control={form.control} name="gender" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Gender *</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select gender"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="male">Male</select_1.SelectItem>
                        <select_1.SelectItem value="female">Female</select_1.SelectItem>
                        <select_1.SelectItem value="other">Other</select_1.SelectItem>
                        <select_1.SelectItem value="unknown">Prefer not to say</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="birth_date" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Birth Date *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input type="date" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="marital_status" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Marital Status</form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Select status"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="single">Single</select_1.SelectItem>
                        <select_1.SelectItem value="married">Married</select_1.SelectItem>
                        <select_1.SelectItem value="divorced">Divorced</select_1.SelectItem>
                        <select_1.SelectItem value="widowed">Widowed</select_1.SelectItem>
                        <select_1.SelectItem value="separated">Separated</select_1.SelectItem>
                        <select_1.SelectItem value="domestic_partner">Domestic Partner</select_1.SelectItem>
                        <select_1.SelectItem value="unknown">Unknown</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>
          </card_1.CardContent>
        </card_1.Card>        {/* Contact Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Contact Information</card_1.CardTitle>
            <card_1.CardDescription>
              Phone numbers and email addresses for patient communication.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="phone_primary" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Primary Phone *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="+55 (11) 99999-9999" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Main contact number with area code
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="phone_secondary" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Secondary Phone</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="+55 (11) 3333-4444" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Alternative contact number
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <form_1.FormField control={form.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Email Address</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input type="email" placeholder="patient@example.com" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Primary email for appointment confirmations and communications
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Address Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Address Information</card_1.CardTitle>
            <card_1.CardDescription>
              Patient's residential address for contact and billing purposes.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <form_1.FormField control={form.control} name="address_line1" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Address Line 1 *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="Rua das Flores, 123" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Street address, apartment, suite, unit, building, floor, etc.
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="address_line2" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Address Line 2</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="Apartment 45, Building B" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Additional address information (optional)
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form_1.FormField control={form.control} name="city" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>City *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="São Paulo" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="state" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>State *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="SP" maxLength={2} {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Two-letter state code
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="postal_code" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>CEP *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="01234-567" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Brazilian postal code
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Emergency Contact */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Emergency Contact</card_1.CardTitle>
            <card_1.CardDescription>
              Primary emergency contact person for medical situations.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="emergency_contact_name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Contact Name *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Maria Silva" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="emergency_contact_relationship" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Relationship *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Mother, Father, Spouse, etc." {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="emergency_contact_phone" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Contact Phone *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="+55 (11) 99999-9999" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="emergency_contact_email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Contact Email</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input type="email" placeholder="contact@example.com" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Insurance Information */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Insurance Information</card_1.CardTitle>
            <card_1.CardDescription>
              Health insurance details for billing and coverage verification.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="insurance_provider" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Insurance Provider</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Unimed, Bradesco Saúde, etc." {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="insurance_plan" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Plan Name</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Plan name or type" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="insurance_policy_number" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Policy Number</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Insurance policy number" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="insurance_group_number" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Group Number</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input placeholder="Group or employer code" {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Medical History */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Basic Medical History</card_1.CardTitle>
            <card_1.CardDescription>
              Initial medical information for safety and treatment planning.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <form_1.FormField control={form.control} name="known_allergies" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Known Allergies</form_1.FormLabel>
                  <form_1.FormControl>
                    <textarea_1.Textarea placeholder="List any known allergies to medications, foods, or materials..." rows={3} {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Include allergies to medications, foods, latex, or other substances
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="current_medications" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Current Medications</form_1.FormLabel>
                  <form_1.FormControl>
                    <textarea_1.Textarea placeholder="List current medications, dosages, and frequency..." rows={3} {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Include prescription medications, over-the-counter drugs, and supplements
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>

            <form_1.FormField control={form.control} name="medical_conditions" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Medical Conditions</form_1.FormLabel>
                  <form_1.FormControl>
                    <textarea_1.Textarea placeholder="List any chronic conditions, previous surgeries, or significant medical history..." rows={3} {...field}/>
                  </form_1.FormControl>
                  <form_1.FormDescription>
                    Include chronic conditions, previous surgeries, and significant medical events
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </card_1.CardContent>
        </card_1.Card>        {/* LGPD Consent Management */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5"/>
              LGPD Consent Management
            </card_1.CardTitle>
            <card_1.CardDescription>
              Data processing consent in compliance with Brazilian General Data Protection Law (LGPD).
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-6">
            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                <strong>LGPD Compliance:</strong> As required by Brazilian law, we need your explicit consent 
                for processing your health data. You can withdraw consent at any time by contacting our clinic.
              </alert_1.AlertDescription>
            </alert_1.Alert>

            {/* Required Consent */}
            <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-semibold text-blue-900">Required Consent</h4>
              <form_1.FormField control={form.control} name="lgpd_consent_general" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-sm font-medium">
                        Healthcare Service Provision *
                      </form_1.FormLabel>
                      <form_1.FormDescription className="text-xs">
                        I consent to the processing of my personal health data for healthcare service provision, 
                        medical record management, appointment scheduling, and emergency contact purposes. 
                        <strong>Legal basis:</strong> LGPD Article 11, Item I. 
                        <strong>Retention:</strong> 20 years minimum for medical records.
                      </form_1.FormDescription>
                    </div>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            {/* Optional Consents */}
            <div className="space-y-4">
              <h4 className="font-semibold">Optional Consents</h4>
              
              <form_1.FormField control={form.control} name="lgpd_consent_marketing" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-sm font-medium">
                        Marketing Communications
                      </form_1.FormLabel>
                      <form_1.FormDescription className="text-xs">
                        I consent to receive marketing communications, promotional materials, and service updates. 
                        <strong>Legal basis:</strong> LGPD Article 7, Item I. 
                        <strong>Retention:</strong> 5 years or until consent withdrawal.
                      </form_1.FormDescription>
                    </div>
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="lgpd_consent_research" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-sm font-medium">
                        Medical Research (Anonymized)
                      </form_1.FormLabel>
                      <form_1.FormDescription className="text-xs">
                        I consent to the use of my anonymized health data for medical research and clinical studies 
                        to improve healthcare services. 
                        <strong>Legal basis:</strong> LGPD Article 7, Item I. 
                        <strong>Retention:</strong> 10 years.
                      </form_1.FormDescription>
                    </div>
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="lgpd_consent_third_party" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <form_1.FormControl>
                      <checkbox_1.Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                    </form_1.FormControl>
                    <div className="space-y-1 leading-none">
                      <form_1.FormLabel className="text-sm font-medium">
                        Third-Party Sharing
                      </form_1.FormLabel>
                      <form_1.FormDescription className="text-xs">
                        I consent to sharing my data with healthcare partners, insurance providers, and authorized 
                        third parties for care coordination. 
                        <strong>Legal basis:</strong> LGPD Article 7, Item I. 
                        <strong>Retention:</strong> 5 years.
                      </form_1.FormDescription>
                    </div>
                  </form_1.FormItem>);
        }}/>
            </div>

            <alert_1.Alert>
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription className="text-xs">
                <strong>Your Rights:</strong> You have the right to access, correct, delete, or request portability 
                of your data. You can also withdraw consent at any time by contacting our Data Protection Officer. 
                For more information, please review our Privacy Policy.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </card_1.CardContent>
        </card_1.Card>

        {/* Language Preference */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Communication Preferences</card_1.CardTitle>
            <card_1.CardDescription>
              Language and communication preferences for patient care.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form_1.FormField control={form.control} name="preferred_language" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Preferred Language</form_1.FormLabel>
                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Select preferred language"/>
                      </select_1.SelectTrigger>
                    </form_1.FormControl>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="pt-BR">Portuguese (Brazil)</select_1.SelectItem>
                      <select_1.SelectItem value="en-US">English (US)</select_1.SelectItem>
                      <select_1.SelectItem value="es-ES">Spanish</select_1.SelectItem>
                      <select_1.SelectItem value="fr-FR">French</select_1.SelectItem>
                      <select_1.SelectItem value="it-IT">Italian</select_1.SelectItem>
                      <select_1.SelectItem value="de-DE">German</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormDescription>
                    Language for appointments, communications, and documentation
                  </form_1.FormDescription>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </card_1.CardContent>
        </card_1.Card>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button_1.Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {isSubmitting ? 'Registering Patient...' : 'Register Patient'}
          </button_1.Button>
          
          {onCancel && (<button_1.Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1 sm:flex-none">
              Cancel
            </button_1.Button>)}
        </div>

        {/* Form Validation Summary */}
        {Object.keys(form.formState.errors).length > 0 && (<alert_1.Alert variant="destructive">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Please fix the following errors before submitting:
              <ul className="mt-2 list-disc list-inside space-y-1">
                {Object.entries(form.formState.errors).map(function (_a) {
                var field = _a[0], error = _a[1];
                return (<li key={field} className="text-xs">
                    <strong>{field.replace(/_/g, ' ')}:</strong> {error === null || error === void 0 ? void 0 : error.message}
                  </li>);
            })}
              </ul>
            </alert_1.AlertDescription>
          </alert_1.Alert>)}
      </form>
    </form_1.Form>);
}
