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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.default = ProfessionalSelection;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var avatar_1 = require("@/components/ui/avatar");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
var client_1 = require("@/app/utils/supabase/client");
function ProfessionalSelection(_a) {
    var _this = this;
    var serviceId = _a.serviceId, selectedProfessional = _a.selectedProfessional, onProfessionalSelect = _a.onProfessionalSelect, isLoading = _a.isLoading;
    var t = (0, use_translation_1.useTranslation)().t;
    var _b = (0, react_1.useState)([]), professionals = _b[0], setProfessionals = _b[1];
    var _c = (0, react_1.useState)(true), isLoadingProfessionals = _c[0], setIsLoadingProfessionals = _c[1];
    var _d = (0, react_1.useState)('all'), selectedSpecialty = _d[0], setSelectedSpecialty = _d[1];
    var _e = (0, react_1.useState)(null), selectedProfessionalForModal = _e[0], setSelectedProfessionalForModal = _e[1];
    var _f = (0, react_1.useState)(false), isMobile = _f[0], setIsMobile = _f[1];
    // Check if device is mobile
    (0, react_1.useEffect)(function () {
        var checkMobile = function () {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return function () {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);
    // Specialty translations mapping
    var specialtyNames = {
        dermatologist: t('professionals.specialties.dermatologist'),
        aesthetician: t('professionals.specialties.aesthetician'),
        cosmetologist: t('professionals.specialties.cosmetologist'),
        plastic_surgeon: t('professionals.specialties.plastic_surgeon'),
        nutritionist: t('professionals.specialties.nutritionist'),
        physiotherapist: t('professionals.specialties.physiotherapist')
    };
    // Load professionals based on service
    (0, react_1.useEffect)(function () {
        var loadProfessionals = function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, _a, data, error, mockProfessionals, cleanedData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!serviceId)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        setIsLoadingProfessionals(true);
                        supabase = (0, client_1.createClient)();
                        return [4 /*yield*/, supabase
                                .from('professionals')
                                .select("\n            *,\n            professional_services!inner(\n              service_id,\n              is_primary_service\n            )\n          ")
                                .eq('is_active', true)
                                .eq('accepts_new_patients', true)
                                .eq('professional_services.service_id', serviceId)
                                .order('name', { ascending: true })];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error loading professionals:', error);
                            mockProfessionals = [
                                {
                                    id: '1',
                                    user_id: 'user-1',
                                    name: 'Dra. Maria Silva',
                                    specialty: 'dermatologist',
                                    license_number: 'CRM-12345',
                                    bio: 'Especialista em dermatologia estética com mais de 15 anos de experiência. Formada pela USP com especialização em procedimentos minimamente invasivos.',
                                    photo_url: '/avatars/maria-silva.jpg',
                                    years_experience: 15,
                                    is_active: true,
                                    accepts_new_patients: true,
                                    working_hours: {
                                        monday: { start: '08:00', end: '18:00' },
                                        tuesday: { start: '08:00', end: '18:00' },
                                        wednesday: { start: '08:00', end: '16:00' },
                                        thursday: { start: '08:00', end: '18:00' },
                                        friday: { start: '08:00', end: '16:00' }
                                    },
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '2',
                                    user_id: 'user-2',
                                    name: 'Ana Santos',
                                    specialty: 'aesthetician',
                                    license_number: 'COREN-54321',
                                    bio: 'Esteticista certificada especializada em tratamentos faciais e corporais. Atualização constante em novas técnicas e tecnologias.',
                                    photo_url: '/avatars/ana-santos.jpg',
                                    years_experience: 8,
                                    is_active: true,
                                    accepts_new_patients: true,
                                    working_hours: {
                                        tuesday: { start: '09:00', end: '17:00' },
                                        wednesday: { start: '09:00', end: '17:00' },
                                        thursday: { start: '09:00', end: '17:00' },
                                        friday: { start: '09:00', end: '17:00' },
                                        saturday: { start: '08:00', end: '14:00' }
                                    },
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '3',
                                    user_id: 'user-3',
                                    name: 'Dr. João Oliveira',
                                    specialty: 'plastic_surgeon',
                                    license_number: 'CRM-67890',
                                    bio: 'Cirurgião plástico membro da SBCP com foco em harmonização facial e procedimentos estéticos minimamente invasivos.',
                                    photo_url: '/avatars/joao-oliveira.jpg',
                                    years_experience: 12,
                                    is_active: true,
                                    accepts_new_patients: true,
                                    working_hours: {
                                        monday: { start: '14:00', end: '20:00' },
                                        tuesday: { start: '14:00', end: '20:00' },
                                        wednesday: { start: '08:00', end: '12:00' },
                                        thursday: { start: '14:00', end: '20:00' },
                                        friday: { start: '08:00', end: '12:00' }
                                    },
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                }
                            ];
                            setProfessionals(mockProfessionals);
                        }
                        else {
                            cleanedData = (data || []).map(function (_a) {
                                var professional_services = _a.professional_services, professional = __rest(_a, ["professional_services"]);
                                return professional;
                            });
                            setProfessionals(cleanedData);
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error loading professionals:', error_1);
                        // Set empty array on error
                        setProfessionals([]);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoadingProfessionals(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        loadProfessionals();
    }, [serviceId]);
    // Filter professionals by specialty and availability
    var filteredProfessionals = (0, react_1.useMemo)(function () {
        var filtered = professionals;
        // Filter by specialty
        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(function (prof) { return prof.specialty === selectedSpecialty; });
        }
        // Keep all professionals for now - availability is shown in the status
        // This allows users to see unavailable professionals but with clear status
        return filtered;
    }, [professionals, selectedSpecialty]);
    // Get unique specialties for filter
    var availableSpecialties = (0, react_1.useMemo)(function () {
        var specialties = __spreadArray([], new Set(professionals.map(function (p) { return p.specialty; })), true);
        return __spreadArray([
            { id: 'all', name: t('common.all') }
        ], specialties.map(function (specialty) { return ({
            id: specialty,
            name: specialtyNames[specialty]
        }); }), true);
    }, [professionals, specialtyNames, t]);
    var handleProfessionalSelect = function (professional) {
        if (isLoading)
            return;
        // Check availability before selection
        var availability = getAvailabilityStatus(professional);
        if (!availability.available) {
            // Optionally show a toast or alert here
            console.warn('Professional is not available for selection:', availability.message);
            return;
        }
        if (isMobile && professional.bio) {
            // Show modal with details on mobile for professionals with bio/detailed info
            setSelectedProfessionalForModal(professional);
        }
        else {
            onProfessionalSelect(professional);
        }
    };
    var handleModalProfessionalSelect = function (professional) {
        // Check availability before selection
        var availability = getAvailabilityStatus(professional);
        if (!availability.available) {
            // Optionally show a toast or alert here
            console.warn('Professional is not available for selection:', availability.message);
            return;
        }
        setSelectedProfessionalForModal(null);
        onProfessionalSelect(professional);
    };
    var getInitials = function (name) {
        return name
            .split(' ')
            .map(function (part) { return part.charAt(0); })
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };
    var formatWorkingHours = function (workingHours) {
        if (!workingHours)
            return t('professionals.working_hours.not_available');
        var days = Object.keys(workingHours);
        if (days.length === 0)
            return t('professionals.working_hours.not_available');
        // Simple format for now - could be enhanced
        return t('professionals.working_hours.available', { count: days.length });
    };
    // Check if professional is available on current day (basic availability logic)
    var isProfessionalAvailable = function (professional) {
        if (!professional.working_hours)
            return false;
        var today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        var dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        var todayName = dayNames[today];
        return !!professional.working_hours[todayName];
    };
    // Get availability status for display
    var getAvailabilityStatus = function (professional) {
        if (!professional.accepts_new_patients) {
            return {
                available: false,
                message: t('professionals.not_accepting_patients'),
                color: 'text-red-600 dark:text-red-400'
            };
        }
        if (!isProfessionalAvailable(professional)) {
            return {
                available: false,
                message: t('professionals.unavailable_today'),
                color: 'text-orange-600 dark:text-orange-400'
            };
        }
        return {
            available: true,
            message: t('professionals.accepting_patients'),
            color: 'text-green-600 dark:text-green-400'
        };
    };
    if (isLoadingProfessionals) {
        return (<div className="space-y-6">
        <div className="space-y-4">
          <skeleton_1.Skeleton className="h-6 w-48"/>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map(function (i) { return (<skeleton_1.Skeleton key={i} className="h-9 w-32"/>); })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(function (i) { return (<skeleton_1.Skeleton key={i} className="h-64 w-full"/>); })}
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {t('booking.steps.professional.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('booking.steps.professional.subtitle')}
        </p>
      </div>

      {/* Specialty Filters */}
      {availableSpecialties.length > 2 && (<div className="flex gap-2 flex-wrap justify-center">
          {availableSpecialties.map(function (specialty) {
                var isSelected = selectedSpecialty === specialty.id;
                return (<button_1.Button key={specialty.id} variant={isSelected ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedSpecialty(specialty.id); }} className="flex items-center gap-2">
                <lucide_react_1.Award className="h-4 w-4"/>
                {specialty.name}
              </button_1.Button>);
            })}
        </div>)}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('professionals.results', { count: filteredProfessionals.length })}
        </p>
        {selectedProfessional && (<badge_1.Badge variant="secondary" className="flex items-center gap-1">
            <span>{t('professionals.selected')}</span>
            <span className="font-medium">{selectedProfessional.name}</span>
          </badge_1.Badge>)}
      </div>      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfessionals.map(function (professional, index) {
            var isSelected = (selectedProfessional === null || selectedProfessional === void 0 ? void 0 : selectedProfessional.id) === professional.id;
            return (<framer_motion_1.motion.div key={professional.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <card_1.Card className={"cursor-pointer transition-all duration-200 hover:shadow-lg ".concat(isSelected
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md', " ").concat(isLoading ? 'pointer-events-none opacity-50' : '')} onClick={function () { return handleProfessionalSelect(professional); }}>
                <card_1.CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <avatar_1.Avatar className="h-16 w-16">
                      <avatar_1.AvatarImage src={professional.photo_url} alt={professional.name}/>
                      <avatar_1.AvatarFallback className="text-lg font-medium">
                        {getInitials(professional.name)}
                      </avatar_1.AvatarFallback>
                    </avatar_1.Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <card_1.CardTitle className="text-lg line-clamp-1">
                        {professional.name}
                      </card_1.CardTitle>
                      <badge_1.Badge variant="secondary" className="mt-1">
                        {specialtyNames[professional.specialty]}
                      </badge_1.Badge>
                      
                      {professional.license_number && (<p className="text-xs text-muted-foreground mt-1">
                          {professional.license_number}
                        </p>)}
                    </div>
                  </div>
                </card_1.CardHeader>
                
                <card_1.CardContent className="space-y-4">
                  {professional.bio && (<p className="text-sm text-muted-foreground line-clamp-3">
                      {professional.bio}
                    </p>)}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <lucide_react_1.Award className="h-4 w-4"/>
                      <span>
                        {t('professionals.experience', {
                    years: professional.years_experience
                })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <lucide_react_1.Clock className="h-4 w-4"/>
                      <span className="text-xs">
                        {formatWorkingHours(professional.working_hours)}
                      </span>
                    </div>
                  </div>

                  {/* Rating placeholder - could be enhanced with real ratings */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(function (star) { return (<lucide_react_1.Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>); })}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      5.0 (24 avaliações)
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(function () {
                    var availability = getAvailabilityStatus(professional);
                    return (<div className={"flex items-center gap-1 ".concat(availability.color)}>
                          <lucide_react_1.Calendar className="h-4 w-4"/>
                          <span className="text-sm font-medium">
                            {availability.message}
                          </span>
                        </div>);
                })()}
                  </div>
                  
                  <div className="flex gap-2">
                    {(function () {
                    var availability = getAvailabilityStatus(professional);
                    return (<button_1.Button className="flex-1" variant={isSelected ? 'default' : 'outline'} disabled={isLoading || !availability.available} onClick={function (e) {
                            e.stopPropagation();
                            if (!isMobile || !professional.bio) {
                                handleProfessionalSelect(professional);
                            }
                        }}>
                          {isSelected
                            ? t('professionals.selected')
                            : availability.available
                                ? t('professionals.select')
                                : t('professionals.unavailable')}
                        </button_1.Button>);
                })()}
                    {isMobile && professional.bio && (<button_1.Button variant="outline" size="icon" onClick={function (e) {
                        e.stopPropagation();
                        setSelectedProfessionalForModal(professional);
                    }}>
                        <lucide_react_1.Info className="h-4 w-4"/>
                      </button_1.Button>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </framer_motion_1.motion.div>);
        })}
      </div>

      {/* Empty State */}
      {filteredProfessionals.length === 0 && (<div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <lucide_react_1.User className="h-6 w-6 text-muted-foreground"/>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {t('professionals.no_results.title')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('professionals.no_results.description')}
            </p>
          </div>
          <button_1.Button variant="outline" onClick={function () { return setSelectedSpecialty('all'); }}>
            {t('professionals.show_all')}
          </button_1.Button>
        </div>)}

      {/* Professional Details Modal for Mobile */}
      <dialog_1.Dialog open={!!selectedProfessionalForModal} onOpenChange={function (open) { return !open && setSelectedProfessionalForModal(null); }}>
        <dialog_1.DialogContent className="max-w-md mx-4">
          {selectedProfessionalForModal && (<>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle className="flex items-center gap-3">
                  <avatar_1.Avatar className="h-12 w-12">
                    <avatar_1.AvatarImage src={selectedProfessionalForModal.photo_url} alt={selectedProfessionalForModal.name}/>
                    <avatar_1.AvatarFallback className="text-lg font-medium">
                      {getInitials(selectedProfessionalForModal.name)}
                    </avatar_1.AvatarFallback>
                  </avatar_1.Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{selectedProfessionalForModal.name}</div>
                    <badge_1.Badge variant="secondary" className="mt-1">
                      {specialtyNames[selectedProfessionalForModal.specialty]}
                    </badge_1.Badge>
                  </div>
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription className="text-left">
                  {selectedProfessionalForModal.bio}
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  {selectedProfessionalForModal.license_number && (<div className="text-sm text-muted-foreground">
                      <strong>Registro:</strong> {selectedProfessionalForModal.license_number}
                    </div>)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <lucide_react_1.Award className="h-4 w-4"/>
                    <span>
                      {t('professionals.experience', {
                years: selectedProfessionalForModal.years_experience
            })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <lucide_react_1.Clock className="h-4 w-4"/>
                    <span className="text-xs">
                      {formatWorkingHours(selectedProfessionalForModal.working_hours)}
                    </span>
                  </div>
                </div>
                
                {/* Rating display */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(function (star) { return (<lucide_react_1.Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>); })}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    5.0 (24 avaliações)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {(function () {
                var availability = getAvailabilityStatus(selectedProfessionalForModal);
                return (<div className={"flex items-center gap-1 ".concat(availability.color)}>
                        <lucide_react_1.Calendar className="h-4 w-4"/>
                        <span className="text-sm font-medium">
                          {availability.message}
                        </span>
                      </div>);
            })()}
                </div>
                
                <button_1.Button className="w-full" onClick={function () { return handleModalProfessionalSelect(selectedProfessionalForModal); }} disabled={isLoading || !getAvailabilityStatus(selectedProfessionalForModal).available}>
                  {(function () {
                var availability = getAvailabilityStatus(selectedProfessionalForModal);
                if ((selectedProfessional === null || selectedProfessional === void 0 ? void 0 : selectedProfessional.id) === selectedProfessionalForModal.id) {
                    return t('professionals.selected');
                }
                return availability.available
                    ? t('professionals.select')
                    : t('professionals.unavailable');
            })()}
                </button_1.Button>
              </div>
            </>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
