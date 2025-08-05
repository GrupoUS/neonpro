// ============================================================================
// Supplier Form Component - Epic 6, Story 6.3
// ============================================================================
// Comprehensive supplier creation and editing form with validation,
// multi-step wizard, and real-time validation for NeonPro
// ============================================================================
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
exports.SupplierForm = SupplierForm;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var form_1 = require("@/components/ui/form");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var supplier_1 = require("@/lib/types/supplier");
var use_supplier_1 = require("@/lib/hooks/use-supplier");
var utils_1 = require("@/lib/utils");
// ============================================================================
// VALIDATION HELPERS
// ============================================================================
var validateCNPJ = function (cnpj) {
    var cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    if (cleanCNPJ.length !== 14)
        return false;
    // Basic CNPJ validation algorithm
    var sum = 0;
    var multiplier = 5;
    for (var i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
        multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }
    var remainder = sum % 11;
    var firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cleanCNPJ.charAt(12)) !== firstDigit)
        return false;
    sum = 0;
    multiplier = 6;
    for (var i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * multiplier;
        multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }
    var remainder2 = sum % 11;
    var secondDigit = remainder2 < 2 ? 0 : 11 - remainder2;
    return parseInt(cleanCNPJ.charAt(13)) === secondDigit;
};
var validateCPF = function (cpf) {
    var cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11)
        return false;
    // Check for same digits
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    // Validate first digit
    var sum = 0;
    for (var i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    var remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9)))
        return false;
    // Validate second digit
    sum = 0;
    for (var i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10)))
        return false;
    return true;
};
// ============================================================================
// FORM STEPS CONFIGURATION
// ============================================================================
var FORM_STEPS = [
    {
        id: 'basic',
        title: 'Informações Básicas',
        description: 'Nome, categoria e informações legais',
        icon: <lucide_react_1.Building2 className="h-5 w-5"/>,
        fields: ['name', 'legal_name', 'cnpj', 'cpf', 'category', 'subcategories']
    },
    {
        id: 'contact',
        title: 'Contatos',
        description: 'Contatos principais e secundários',
        icon: <lucide_react_1.User className="h-5 w-5"/>,
        fields: ['primary_contact', 'secondary_contacts']
    },
    {
        id: 'address',
        title: 'Endereços',
        description: 'Endereço principal e de cobrança',
        icon: <lucide_react_1.MapPin className="h-5 w-5"/>,
        fields: ['address', 'billing_address']
    },
    {
        id: 'business',
        title: 'Negócios',
        description: 'Termos comerciais e financeiros',
        icon: <lucide_react_1.TrendingUp className="h-5 w-5"/>,
        fields: ['payment_terms', 'currency', 'early_payment_discount', 'credit_rating']
    },
    {
        id: 'compliance',
        title: 'Compliance',
        description: 'Certificações e conformidade',
        icon: <lucide_react_1.Shield className="h-5 w-5"/>,
        fields: ['certifications', 'regulatory_compliance', 'anvisa_registration']
    }
];
// ============================================================================
// MAIN COMPONENT
// ============================================================================
function SupplierForm(_a) {
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    var _this = this;
    var supplier = _a.supplier, clinicId = _a.clinicId, open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess, _b = _a.mode, mode = _b === void 0 ? 'create' : _b;
    var _c = (0, react_1.useState)(0), currentStep = _c[0], setCurrentStep = _c[1];
    var _d = (0, react_1.useState)([]), completedSteps = _d[0], setCompletedSteps = _d[1];
    var _e = (0, react_1.useState)(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    // Data management
    var _f = (0, use_supplier_1.useSuppliers)(clinicId), createSupplier = _f.createSupplier, updateSupplier = _f.updateSupplier, isCreating = _f.isCreating, isUpdating = _f.isUpdating;
    // Form setup
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(supplier_1.SupplierSchemas.Supplier),
        defaultValues: {
            name: (supplier === null || supplier === void 0 ? void 0 : supplier.name) || '',
            legal_name: (supplier === null || supplier === void 0 ? void 0 : supplier.legal_name) || '',
            cnpj: (supplier === null || supplier === void 0 ? void 0 : supplier.cnpj) || '',
            cpf: (supplier === null || supplier === void 0 ? void 0 : supplier.cpf) || '',
            category: (supplier === null || supplier === void 0 ? void 0 : supplier.category) || supplier_1.SupplierCategory.MEDICAL_EQUIPMENT,
            subcategories: (supplier === null || supplier === void 0 ? void 0 : supplier.subcategories) || [],
            status: (supplier === null || supplier === void 0 ? void 0 : supplier.status) || supplier_1.SupplierStatus.PENDING_VERIFICATION,
            primary_contact: (supplier === null || supplier === void 0 ? void 0 : supplier.primary_contact) || {
                id: '',
                name: '',
                email: '',
                phone: '',
                is_primary: true,
                preferred_contact_method: 'email'
            },
            secondary_contacts: (supplier === null || supplier === void 0 ? void 0 : supplier.secondary_contacts) || [],
            website: (supplier === null || supplier === void 0 ? void 0 : supplier.website) || '',
            registration_number: (supplier === null || supplier === void 0 ? void 0 : supplier.registration_number) || '',
            tax_id: (supplier === null || supplier === void 0 ? void 0 : supplier.tax_id) || '',
            address: (supplier === null || supplier === void 0 ? void 0 : supplier.address) || {
                street: '',
                number: '',
                neighborhood: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'Brasil'
            },
            billing_address: supplier === null || supplier === void 0 ? void 0 : supplier.billing_address,
            performance_score: (supplier === null || supplier === void 0 ? void 0 : supplier.performance_score) || 0,
            quality_rating: (supplier === null || supplier === void 0 ? void 0 : supplier.quality_rating) || 0,
            reliability_score: (supplier === null || supplier === void 0 ? void 0 : supplier.reliability_score) || 0,
            cost_competitiveness: (supplier === null || supplier === void 0 ? void 0 : supplier.cost_competitiveness) || 0,
            credit_rating: (supplier === null || supplier === void 0 ? void 0 : supplier.credit_rating) || '',
            payment_terms: (supplier === null || supplier === void 0 ? void 0 : supplier.payment_terms) || supplier_1.PaymentTerms.NET_30,
            currency: (supplier === null || supplier === void 0 ? void 0 : supplier.currency) || 'BRL',
            early_payment_discount: (supplier === null || supplier === void 0 ? void 0 : supplier.early_payment_discount) || 0,
            risk_level: (supplier === null || supplier === void 0 ? void 0 : supplier.risk_level) || supplier_1.RiskLevel.MEDIUM,
            risk_factors: (supplier === null || supplier === void 0 ? void 0 : supplier.risk_factors) || [],
            certifications: (supplier === null || supplier === void 0 ? void 0 : supplier.certifications) || [],
            regulatory_compliance: (supplier === null || supplier === void 0 ? void 0 : supplier.regulatory_compliance) || false,
            anvisa_registration: (supplier === null || supplier === void 0 ? void 0 : supplier.anvisa_registration) || '',
            created_by: (supplier === null || supplier === void 0 ? void 0 : supplier.created_by) || '',
            clinic_id: clinicId,
            tags: (supplier === null || supplier === void 0 ? void 0 : supplier.tags) || [],
            notes: (supplier === null || supplier === void 0 ? void 0 : supplier.notes) || ''
        }
    });
    var control = form.control, handleSubmit = form.handleSubmit, formState = form.formState, watch = form.watch, setValue = form.setValue, trigger = form.trigger;
    var errors = formState.errors, isValid = formState.isValid;
    // Field arrays for dynamic forms
    var _g = (0, react_hook_form_1.useFieldArray)({
        control: control,
        name: 'secondary_contacts'
    }), secondaryContactFields = _g.fields, appendSecondaryContact = _g.append, removeSecondaryContact = _g.remove;
    var _h = (0, react_hook_form_1.useFieldArray)({
        control: control,
        name: 'certifications'
    }), certificationFields = _h.fields, appendCertification = _h.append, removeCertification = _h.remove;
    var _j = (0, react_hook_form_1.useFieldArray)({
        control: control,
        name: 'risk_factors'
    }), riskFactorFields = _j.fields, appendRiskFactor = _j.append, removeRiskFactor = _j.remove;
    // Watch form values for validation
    var watchedValues = watch();
    // ============================================================================
    // COMPUTED VALUES
    // ============================================================================
    var currentStepConfig = FORM_STEPS[currentStep];
    var isLastStep = currentStep === FORM_STEPS.length - 1;
    var canProceed = completedSteps.includes(currentStep) || validateCurrentStep();
    var formProgress = ((completedSteps.length + (canProceed ? 1 : 0)) / FORM_STEPS.length) * 100;
    // ============================================================================
    // VALIDATION HELPERS
    // ============================================================================
    function validateCurrentStep() {
        var stepFields = FORM_STEPS[currentStep].fields;
        var currentStepErrors = Object.keys(errors).filter(function (field) {
            return stepFields.some(function (stepField) { return field.startsWith(stepField); });
        });
        return currentStepErrors.length === 0;
    }
    function validateBusinessRules() {
        var _a, _b, _c, _d;
        var validationErrors = [];
        // CNPJ validation
        if (watchedValues.cnpj && !validateCNPJ(watchedValues.cnpj)) {
            validationErrors.push('CNPJ inválido');
        }
        // CPF validation
        if (watchedValues.cpf && !validateCPF(watchedValues.cpf)) {
            validationErrors.push('CPF inválido');
        }
        // Primary contact validation
        if (!((_a = watchedValues.primary_contact) === null || _a === void 0 ? void 0 : _a.name) || !((_b = watchedValues.primary_contact) === null || _b === void 0 ? void 0 : _b.email)) {
            validationErrors.push('Contato principal é obrigatório');
        }
        // Address validation
        if (!((_c = watchedValues.address) === null || _c === void 0 ? void 0 : _c.street) || !((_d = watchedValues.address) === null || _d === void 0 ? void 0 : _d.city)) {
            validationErrors.push('Endereço principal é obrigatório');
        }
        return validationErrors;
    }
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    var handleStepChange = function (stepIndex) { return __awaiter(_this, void 0, void 0, function () {
        var stepFields, isStepValid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (stepIndex < currentStep || completedSteps.includes(stepIndex)) {
                        setCurrentStep(stepIndex);
                        return [2 /*return*/];
                    }
                    stepFields = FORM_STEPS[currentStep].fields;
                    return [4 /*yield*/, trigger(stepFields)];
                case 1:
                    isStepValid = _a.sent();
                    if (isStepValid) {
                        setCompletedSteps(function (prev) { return __spreadArray(__spreadArray([], prev, true), [currentStep], false); });
                        setCurrentStep(stepIndex);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handleNext = function () { return __awaiter(_this, void 0, void 0, function () {
        var stepFields, isStepValid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stepFields = FORM_STEPS[currentStep].fields;
                    return [4 /*yield*/, trigger(stepFields)];
                case 1:
                    isStepValid = _a.sent();
                    if (isStepValid) {
                        setCompletedSteps(function (prev) { return __spreadArray(__spreadArray([], prev, true), [currentStep], false); });
                        if (!isLastStep) {
                            setCurrentStep(function (prev) { return prev + 1; });
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var handlePrevious = function () {
        if (currentStep > 0) {
            setCurrentStep(function (prev) { return prev - 1; });
        }
    };
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var businessErrors, submissionData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    businessErrors = validateBusinessRules();
                    if (businessErrors.length > 0) {
                        businessErrors.forEach(function (error) { return sonner_1.toast.error(error); });
                        return [2 /*return*/];
                    }
                    submissionData = __assign(__assign(__assign({}, data), { updated_at: new Date().toISOString() }), (mode === 'create' && {
                        created_at: new Date().toISOString(),
                        created_by: 'current_user_id' // This should come from auth context
                    }));
                    if (!(mode === 'create')) return [3 /*break*/, 3];
                    return [4 /*yield*/, createSupplier(submissionData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!supplier) return [3 /*break*/, 5];
                    return [4 /*yield*/, updateSupplier(__assign({ id: supplier.id }, submissionData))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    sonner_1.toast.success(mode === 'create'
                        ? 'Fornecedor criado com sucesso!'
                        : 'Fornecedor atualizado com sucesso!');
                    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(submissionData);
                    onOpenChange(false);
                    return [3 /*break*/, 8];
                case 6:
                    error_1 = _a.sent();
                    console.error('Erro ao salvar fornecedor:', error_1);
                    sonner_1.toast.error('Erro ao salvar fornecedor. Tente novamente.');
                    return [3 /*break*/, 8];
                case 7:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var addSecondaryContact = function () {
        appendSecondaryContact({
            id: "temp_".concat(Date.now()),
            name: '',
            email: '',
            phone: '',
            is_primary: false,
            preferred_contact_method: 'email'
        });
    };
    var addCertification = function () {
        appendCertification({
            id: "temp_".concat(Date.now()),
            name: '',
            issuing_authority: '',
            certificate_number: '',
            issue_date: '',
            verification_status: 'pending'
        });
    };
    var addRiskFactor = function () {
        appendRiskFactor('');
    };
    // ============================================================================
    // EFFECTS
    // ============================================================================
    (0, react_1.useEffect)(function () {
        if (open) {
            setCurrentStep(0);
            setCompletedSteps([]);
        }
    }, [open]);
    // ============================================================================
    // RENDER HELPERS
    // ============================================================================
    var renderStepIndicator = function () { return (<div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
        </h2>
        <badge_1.Badge variant="secondary" className="text-xs">
          Etapa {currentStep + 1} de {FORM_STEPS.length}
        </badge_1.Badge>
      </div>
      
      <progress_1.Progress value={formProgress} className="mb-4"/>
      
      <div className="flex items-center justify-between">
        {FORM_STEPS.map(function (step, index) {
            var isComplete = completedSteps.includes(index);
            var isActive = index === currentStep;
            return (<div key={step.id} className={(0, utils_1.cn)("flex items-center cursor-pointer transition-colors", isActive && "text-blue-600", isComplete && "text-green-600", !isActive && !isComplete && "text-gray-400")} onClick={function () { return handleStepChange(index); }}>
              <div className={(0, utils_1.cn)("flex items-center justify-center w-8 h-8 rounded-full border-2 mr-2", isActive && "border-blue-600 bg-blue-50", isComplete && "border-green-600 bg-green-50", !isActive && !isComplete && "border-gray-300")}>
                {isComplete ? (<lucide_react_1.Check className="h-4 w-4"/>) : (step.icon)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>);
        })}
      </div>
    </div>); };
    var renderBasicInfoStep = function () { return (<div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form_1.FormField control={control} name="name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>Nome do Fornecedor *</form_1.FormLabel>
              <form_1.FormControl>
                <input_1.Input {...field} placeholder="Ex: Empresa Médica Ltda"/>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
        
        <form_1.FormField control={control} name="legal_name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>Razão Social *</form_1.FormLabel>
              <form_1.FormControl>
                <input_1.Input {...field} placeholder="Ex: Empresa Médica Ltda"/>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form_1.FormField control={control} name="cnpj" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>CNPJ</form_1.FormLabel>
              <form_1.FormControl>
                <input_1.Input {...field} placeholder="00.000.000/0000-00" onChange={function (e) {
                    var value = e.target.value.replace(/\D/g, '');
                    var formatted = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
                    field.onChange(formatted);
                }}/>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
        
        <form_1.FormField control={control} name="cpf" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>CPF</form_1.FormLabel>
              <form_1.FormControl>
                <input_1.Input {...field} placeholder="000.000.000-00" onChange={function (e) {
                    var value = e.target.value.replace(/\D/g, '');
                    var formatted = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
                    field.onChange(formatted);
                }}/>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form_1.FormField control={control} name="category" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>Categoria *</form_1.FormLabel>
              <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                <form_1.FormControl>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Selecione uma categoria"/>
                  </select_1.SelectTrigger>
                </form_1.FormControl>
                <select_1.SelectContent>
                  {Object.values(supplier_1.SupplierCategory).map(function (category) { return (<select_1.SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').toLowerCase()}
                    </select_1.SelectItem>); })}
                </select_1.SelectContent>
              </select_1.Select>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
        
        <form_1.FormField control={control} name="website" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
              <form_1.FormLabel>Website</form_1.FormLabel>
              <form_1.FormControl>
                <input_1.Input {...field} placeholder="https://exemplo.com" type="url"/>
              </form_1.FormControl>
              <form_1.FormMessage />
            </form_1.FormItem>);
        }}/>
      </div>

      <form_1.FormField control={control} name="notes" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
            <form_1.FormLabel>Observações</form_1.FormLabel>
            <form_1.FormControl>
              <textarea_1.Textarea {...field} placeholder="Informações adicionais sobre o fornecedor..." rows={3}/>
            </form_1.FormControl>
            <form_1.FormMessage />
          </form_1.FormItem>);
        }}/>
    </div>); };
    var renderContactStep = function () { return (<div className="space-y-6">
      {/* Primary Contact */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.User className="h-5 w-5"/>
            Contato Principal
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={control} name="primary_contact.name" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Nome *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="Ex: João Silva"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="primary_contact.title" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Cargo</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="Ex: Gerente Comercial"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={control} name="primary_contact.email" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Email *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="contato@empresa.com" type="email"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="primary_contact.phone" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Telefone *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="(11) 99999-9999" onChange={function (e) {
                    var value = e.target.value.replace(/\D/g, '');
                    var formatted = value.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
                    field.onChange(formatted);
                }}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>

          <form_1.FormField control={control} name="primary_contact.preferred_contact_method" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                <form_1.FormLabel>Método de Contato Preferido</form_1.FormLabel>
                <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                  <form_1.FormControl>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                  </form_1.FormControl>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="email">Email</select_1.SelectItem>
                    <select_1.SelectItem value="phone">Telefone</select_1.SelectItem>
                    <select_1.SelectItem value="whatsapp">WhatsApp</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
                <form_1.FormMessage />
              </form_1.FormItem>);
        }}/>
        </card_1.CardContent>
      </card_1.Card>

      {/* Secondary Contacts */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between">
          <card_1.CardTitle className="text-lg">Contatos Secundários</card_1.CardTitle>
          <button_1.Button type="button" variant="outline" size="sm" onClick={addSecondaryContact}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            Adicionar Contato
          </button_1.Button>
        </card_1.CardHeader>
        <card_1.CardContent>
          {secondaryContactFields.length === 0 ? (<p className="text-gray-500 text-sm">Nenhum contato secundário adicionado.</p>) : (<div className="space-y-4">
              {secondaryContactFields.map(function (contact, index) { return (<card_1.Card key={contact.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Contato {index + 1}</h4>
                    <button_1.Button type="button" variant="ghost" size="sm" onClick={function () { return removeSecondaryContact(index); }}>
                      <lucide_react_1.Trash2 className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField control={control} name={"secondary_contacts.".concat(index, ".name")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                          <form_1.FormLabel>Nome</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Nome do contato"/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
                }}/>
                    
                    <form_1.FormField control={control} name={"secondary_contacts.".concat(index, ".email")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                          <form_1.FormLabel>Email</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="email@empresa.com" type="email"/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
                }}/>
                  </div>
                </card_1.Card>); })}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderAddressStep = function () { return (<div className="space-y-6">
      {/* Main Address */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.MapPin className="h-5 w-5"/>
            Endereço Principal
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form_1.FormField control={control} name="address.street" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Rua *</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input {...field} placeholder="Ex: Rua das Flores"/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>
            
            <form_1.FormField control={control} name="address.number" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Número *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="123"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={control} name="address.complement" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Complemento</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="Apto 101, Bloco A"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="address.neighborhood" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Bairro *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="Centro"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form_1.FormField control={control} name="address.city" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Cidade *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="São Paulo"/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="address.state" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Estado *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="SP" maxLength={2}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="address.postal_code" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>CEP *</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} placeholder="01234-567" onChange={function (e) {
                    var value = e.target.value.replace(/\D/g, '');
                    var formatted = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
                    field.onChange(formatted);
                }}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderBusinessStep = function () { return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-5 w-5"/>
            Informações Comerciais
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={control} name="payment_terms" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Prazo de Pagamento</form_1.FormLabel>
                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                    </form_1.FormControl>
                    <select_1.SelectContent>
                      {Object.values(supplier_1.PaymentTerms).map(function (term) { return (<select_1.SelectItem key={term} value={term}>
                          {term.replace(/_/g, ' ')}
                        </select_1.SelectItem>); })}
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="currency" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Moeda</form_1.FormLabel>
                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                    </form_1.FormControl>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="BRL">Real (BRL)</select_1.SelectItem>
                      <select_1.SelectItem value="USD">Dólar (USD)</select_1.SelectItem>
                      <select_1.SelectItem value="EUR">Euro (EUR)</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form_1.FormField control={control} name="early_payment_discount" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Desconto Pgto Antecipado (%)</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input {...field} type="number" min="0" max="100" step="0.1" onChange={function (e) { return field.onChange(Number(e.target.value)); }}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
            
            <form_1.FormField control={control} name="risk_level" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                  <form_1.FormLabel>Nível de Risco</form_1.FormLabel>
                  <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                    <form_1.FormControl>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                    </form_1.FormControl>
                    <select_1.SelectContent>
                      {Object.values(supplier_1.RiskLevel).map(function (level) { return (<select_1.SelectItem key={level} value={level}>
                          {level}
                        </select_1.SelectItem>); })}
                    </select_1.SelectContent>
                  </select_1.Select>
                  <form_1.FormMessage />
                </form_1.FormItem>);
        }}/>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    var renderComplianceStep = function () { return (<div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.Shield className="h-5 w-5"/>
            Conformidade e Certificações
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <form_1.FormField control={control} name="regulatory_compliance" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <form_1.FormControl>
                    <switch_1.Switch checked={field.value} onCheckedChange={field.onChange}/>
                  </form_1.FormControl>
                  <div className="space-y-1 leading-none">
                    <form_1.FormLabel>Conformidade Regulatória</form_1.FormLabel>
                    <form_1.FormDescription>
                      Indica se o fornecedor está em conformidade com as regulamentações
                    </form_1.FormDescription>
                  </div>
                </form_1.FormItem>);
        }}/>
          </div>

          <form_1.FormField control={control} name="anvisa_registration" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                <form_1.FormLabel>Registro ANVISA</form_1.FormLabel>
                <form_1.FormControl>
                  <input_1.Input {...field} placeholder="Número do registro na ANVISA"/>
                </form_1.FormControl>
                <form_1.FormDescription>
                  Necessário para fornecedores de produtos médicos e farmacêuticos
                </form_1.FormDescription>
                <form_1.FormMessage />
              </form_1.FormItem>);
        }}/>
        </card_1.CardContent>
      </card_1.Card>

      {/* Certifications */}
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between">
          <card_1.CardTitle className="text-lg">Certificações</card_1.CardTitle>
          <button_1.Button type="button" variant="outline" size="sm" onClick={addCertification}>
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            Adicionar Certificação
          </button_1.Button>
        </card_1.CardHeader>
        <card_1.CardContent>
          {certificationFields.length === 0 ? (<p className="text-gray-500 text-sm">Nenhuma certificação adicionada.</p>) : (<div className="space-y-4">
              {certificationFields.map(function (cert, index) { return (<card_1.Card key={cert.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Certificação {index + 1}</h4>
                    <button_1.Button type="button" variant="ghost" size="sm" onClick={function () { return removeCertification(index); }}>
                      <lucide_react_1.Trash2 className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <form_1.FormField control={control} name={"certifications.".concat(index, ".name")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                          <form_1.FormLabel>Nome da Certificação</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Ex: ISO 9001"/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
                }}/>
                    
                    <form_1.FormField control={control} name={"certifications.".concat(index, ".issuing_authority")} render={function (_a) {
                    var field = _a.field;
                    return (<form_1.FormItem>
                          <form_1.FormLabel>Autoridade Emissora</form_1.FormLabel>
                          <form_1.FormControl>
                            <input_1.Input {...field} placeholder="Ex: ABNT"/>
                          </form_1.FormControl>
                          <form_1.FormMessage />
                        </form_1.FormItem>);
                }}/>
                  </div>
                </card_1.Card>); })}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>); };
    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            {mode === 'create'
            ? 'Preencha as informações para criar um novo fornecedor.'
            : 'Edite as informações do fornecedor selecionado.'}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepIndicator()}

            <div className="min-h-[400px]">
              {currentStepConfig.id === 'basic' && renderBasicInfoStep()}
              {currentStepConfig.id === 'contact' && renderContactStep()}
              {currentStepConfig.id === 'address' && renderAddressStep()}
              {currentStepConfig.id === 'business' && renderBusinessStep()}
              {currentStepConfig.id === 'compliance' && renderComplianceStep()}
            </div>

            <separator_1.Separator />

            <dialog_1.DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {currentStep > 0 && (<button_1.Button type="button" variant="outline" onClick={handlePrevious}>
                    Anterior
                  </button_1.Button>)}
                
                {!isLastStep ? (<button_1.Button type="button" onClick={handleNext} disabled={!canProceed}>
                    Próximo
                  </button_1.Button>) : (<button_1.Button type="submit" disabled={isSubmitting || isCreating || isUpdating || !isValid}>
                    {isSubmitting || isCreating || isUpdating ? (<>
                        <span className="mr-2">Salvando...</span>
                      </>) : (<>
                        <lucide_react_1.Save className="h-4 w-4 mr-2"/>
                        {mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações'}
                      </>)}
                  </button_1.Button>)}
              </div>
              
              <button_1.Button type="button" variant="ghost" onClick={function () { return onOpenChange(false); }}>
                <lucide_react_1.X className="h-4 w-4 mr-2"/>
                Cancelar
              </button_1.Button>
            </dialog_1.DialogFooter>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
