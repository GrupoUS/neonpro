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
exports.default = ServiceSelection;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
var client_1 = require("@/app/utils/supabase/client");
function ServiceSelection(_a) {
    var _this = this;
    var selectedService = _a.selectedService, onServiceSelect = _a.onServiceSelect, isLoading = _a.isLoading;
    var t = (0, use_translation_1.useTranslation)().t;
    var _b = (0, react_1.useState)([]), services = _b[0], setServices = _b[1];
    var _c = (0, react_1.useState)(''), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = (0, react_1.useState)('all'), selectedCategory = _d[0], setSelectedCategory = _d[1];
    var _e = (0, react_1.useState)(true), isLoadingServices = _e[0], setIsLoadingServices = _e[1];
    var _f = (0, react_1.useState)(null), selectedServiceForModal = _f[0], setSelectedServiceForModal = _f[1];
    var _g = (0, react_1.useState)(false), isMobile = _g[0], setIsMobile = _g[1];
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
    // Category icons mapping
    var categoryIcons = {
        facial: lucide_react_1.Sparkles,
        corporal: lucide_react_1.User,
        capilar: lucide_react_1.Heart,
        wellness: lucide_react_1.Zap,
        all: lucide_react_1.Star
    };
    // Load services
    (0, react_1.useEffect)(function () {
        var loadServices = function () { return __awaiter(_this, void 0, void 0, function () {
            var supabase, _a, data, error, mockServices, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        setIsLoadingServices(true);
                        supabase = (0, client_1.createClient)();
                        return [4 /*yield*/, supabase
                                .from('services')
                                .select('*')
                                .eq('is_active', true)
                                .order('category', { ascending: true })
                                .order('name', { ascending: true })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.error('Error loading services:', error);
                            mockServices = [
                                {
                                    id: '1',
                                    name: 'Limpeza de Pele Profunda',
                                    description: 'Procedimento completo de limpeza facial com extração de cravos e hidratação',
                                    category: 'facial',
                                    duration_minutes: 90,
                                    price: 150,
                                    is_active: true,
                                    requires_evaluation: false,
                                    preparation_instructions: 'Evitar produtos com ácidos 3 dias antes do procedimento',
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '2',
                                    name: 'Peeling Químico',
                                    description: 'Renovação celular com ácidos específicos para melhorar textura da pele',
                                    category: 'facial',
                                    duration_minutes: 60,
                                    price: 200,
                                    is_active: true,
                                    requires_evaluation: true,
                                    preparation_instructions: 'Consulta prévia obrigatória para avaliação do tipo de pele',
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '3',
                                    name: 'Massagem Relaxante',
                                    description: 'Massagem corporal completa para alívio do estresse e tensões musculares',
                                    category: 'corporal',
                                    duration_minutes: 60,
                                    price: 120,
                                    is_active: true,
                                    requires_evaluation: false,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '4',
                                    name: 'Drenagem Linfática',
                                    description: 'Técnica especializada para redução de inchaço e retenção de líquidos',
                                    category: 'corporal',
                                    duration_minutes: 90,
                                    price: 180,
                                    is_active: true,
                                    requires_evaluation: false,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                },
                                {
                                    id: '5',
                                    name: 'Botox',
                                    description: 'Aplicação de toxina botulínica para suavização de rugas de expressão',
                                    category: 'facial',
                                    duration_minutes: 30,
                                    price: 800,
                                    is_active: true,
                                    requires_evaluation: true,
                                    preparation_instructions: 'Consulta médica obrigatória. Evitar anticoagulantes 7 dias antes',
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                }
                            ];
                            setServices(mockServices);
                        }
                        else {
                            setServices(data || []);
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _b.sent();
                        console.error('Error loading services:', error_1);
                        return [3 /*break*/, 4];
                    case 3:
                        setIsLoadingServices(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadServices();
    }, []);
    // Group services by category
    var serviceCategories = (0, react_1.useMemo)(function () {
        var grouped = services.reduce(function (acc, service) {
            if (!acc[service.category]) {
                acc[service.category] = [];
            }
            acc[service.category].push(service);
            return acc;
        }, {});
        return Object.entries(grouped).map(function (_a) {
            var _b;
            var category = _a[0], services = _a[1];
            return ({
                category: category,
                services: services,
                icon: ((_b = categoryIcons[category]) === null || _b === void 0 ? void 0 : _b.name) || 'Star',
                description: t("booking.categories.".concat(category, ".description"))
            });
        });
    }, [services, t]);
    // Filter services based on search and category
    var filteredServices = (0, react_1.useMemo)(function () {
        var filtered = services;
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(function (service) { return service.category === selectedCategory; });
        }
        // Filter by search term
        if (searchTerm) {
            var term_1 = searchTerm.toLowerCase();
            filtered = filtered.filter(function (service) {
                var _a;
                return service.name.toLowerCase().includes(term_1) ||
                    ((_a = service.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term_1));
            });
        }
        return filtered;
    }, [services, selectedCategory, searchTerm]);
    // Get unique categories for filter buttons
    var categories = (0, react_1.useMemo)(function () {
        var cats = __spreadArray([], new Set(services.map(function (s) { return s.category; })), true);
        return __spreadArray([
            { id: 'all', name: t('booking.categories.all'), icon: lucide_react_1.Star }
        ], cats.map(function (cat) { return ({
            id: cat,
            name: t("booking.categories.".concat(cat, ".name")),
            icon: categoryIcons[cat] || lucide_react_1.Star
        }); }), true);
    }, [services, t]);
    var handleServiceSelect = function (service) {
        if (isLoading)
            return;
        if (isMobile && service.preparation_instructions) {
            // Show modal with details on mobile for services with preparation instructions
            setSelectedServiceForModal(service);
        }
        else {
            onServiceSelect(service);
        }
    };
    var handleModalServiceSelect = function (service) {
        setSelectedServiceForModal(null);
        onServiceSelect(service);
    };
    if (isLoadingServices) {
        return (<div className="space-y-6">
        <div className="space-y-4">
          <skeleton_1.Skeleton className="h-10 w-full"/>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map(function (i) { return (<skeleton_1.Skeleton key={i} className="h-9 w-24"/>); })}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(function (i) { return (<skeleton_1.Skeleton key={i} className="h-48 w-full"/>); })}
        </div>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {t('booking.steps.service.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('booking.steps.service.subtitle')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input_1.Input placeholder={t('booking.service.search.placeholder')} value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10"/>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(function (category) {
            var Icon = category.icon;
            var isSelected = selectedCategory === category.id;
            return (<button_1.Button key={category.id} variant={isSelected ? 'default' : 'outline'} size="sm" onClick={function () { return setSelectedCategory(category.id); }} className="flex items-center gap-2">
                <Icon className="h-4 w-4"/>
                {category.name}
              </button_1.Button>);
        })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('booking.service.results', { count: filteredServices.length })}
        </p>
        {selectedService && (<badge_1.Badge variant="secondary" className="flex items-center gap-1">
            <span>{t('booking.service.selected')}</span>
            <span className="font-medium">{selectedService.name}</span>
          </badge_1.Badge>)}
      </div>      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(function (service, index) {
            var isSelected = (selectedService === null || selectedService === void 0 ? void 0 : selectedService.id) === service.id;
            var Icon = categoryIcons[service.category] || lucide_react_1.Star;
            return (<framer_motion_1.motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
              <card_1.Card className={"cursor-pointer transition-all duration-200 hover:shadow-lg ".concat(isSelected
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md', " ").concat(isLoading ? 'pointer-events-none opacity-50' : '')} onClick={function () { return handleServiceSelect(service); }}>
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={"p-2 rounded-lg ".concat(isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <Icon className="h-5 w-5"/>
                      </div>
                      <div>
                        <card_1.CardTitle className="text-lg line-clamp-1">
                          {service.name}
                        </card_1.CardTitle>
                        <badge_1.Badge variant="outline" className="text-xs mt-1">
                          {t("booking.categories.".concat(service.category, ".name"))}
                        </badge_1.Badge>
                      </div>
                    </div>
                    {service.requires_evaluation && (<badge_1.Badge variant="secondary" className="text-xs">
                        {t('booking.service.evaluation_required')}
                      </badge_1.Badge>)}
                  </div>
                </card_1.CardHeader>
                
                <card_1.CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <lucide_react_1.Clock className="h-4 w-4"/>
                      <span>{service.duration_minutes}min</span>
                    </div>
                    
                    {service.price && (<div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                        <lucide_react_1.DollarSign className="h-4 w-4"/>
                        <span>R$ {service.price.toFixed(2)}</span>
                      </div>)}
                  </div>
                  
                  {service.preparation_instructions && (<div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>{t('booking.service.preparation')}:</strong>
                        {' '}
                        {service.preparation_instructions}
                      </p>
                    </div>)}
                  
                  <div className="flex gap-2">
                    <button_1.Button className="flex-1" variant={isSelected ? 'default' : 'outline'} disabled={isLoading} onClick={function (e) {
                    e.stopPropagation();
                    if (!isMobile || !service.preparation_instructions) {
                        handleServiceSelect(service);
                    }
                }}>
                      {isSelected
                    ? t('booking.service.selected')
                    : t('booking.service.select')}
                    </button_1.Button>
                    {isMobile && service.preparation_instructions && (<button_1.Button variant="outline" size="icon" onClick={function (e) {
                        e.stopPropagation();
                        setSelectedServiceForModal(service);
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
      {filteredServices.length === 0 && (<div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <lucide_react_1.Search className="h-6 w-6 text-muted-foreground"/>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {t('booking.service.no_results.title')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('booking.service.no_results.description')}
            </p>
          </div>
          <button_1.Button variant="outline" onClick={function () {
                setSearchTerm('');
                setSelectedCategory('all');
            }}>
            {t('booking.service.clear_filters')}
          </button_1.Button>
        </div>)}

      {/* Service Details Modal for Mobile */}
      <dialog_1.Dialog open={!!selectedServiceForModal} onOpenChange={function (open) { return !open && setSelectedServiceForModal(null); }}>
        <dialog_1.DialogContent className="max-w-md mx-4">
          {selectedServiceForModal && (<>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle className="flex items-center gap-2">
                  {(function () {
                var Icon = categoryIcons[selectedServiceForModal.category] || lucide_react_1.Star;
                return <Icon className="h-5 w-5"/>;
            })()}
                  {selectedServiceForModal.name}
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  {selectedServiceForModal.description}
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <badge_1.Badge variant="outline">
                    {t("booking.categories.".concat(selectedServiceForModal.category, ".name"))}
                  </badge_1.Badge>
                  {selectedServiceForModal.requires_evaluation && (<badge_1.Badge variant="secondary" className="text-xs">
                      {t('booking.service.evaluation_required')}
                    </badge_1.Badge>)}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <lucide_react_1.Clock className="h-4 w-4"/>
                    <span>{selectedServiceForModal.duration_minutes}min</span>
                  </div>
                  
                  {selectedServiceForModal.price && (<div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                      <lucide_react_1.DollarSign className="h-4 w-4"/>
                      <span>R$ {selectedServiceForModal.price.toFixed(2)}</span>
                    </div>)}
                </div>
                
                {selectedServiceForModal.preparation_instructions && (<div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      {t('booking.service.preparation')}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedServiceForModal.preparation_instructions}
                    </p>
                  </div>)}
                
                {selectedServiceForModal.post_care_instructions && (<div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      {t('booking.service.post_care')}:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedServiceForModal.post_care_instructions}
                    </p>
                  </div>)}
                
                <button_1.Button className="w-full" onClick={function () { return handleModalServiceSelect(selectedServiceForModal); }} disabled={isLoading}>
                  {(selectedService === null || selectedService === void 0 ? void 0 : selectedService.id) === selectedServiceForModal.id
                ? t('booking.service.selected')
                : t('booking.service.select')}
                </button_1.Button>
              </div>
            </>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
