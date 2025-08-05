"use strict";
// =====================================================
// Resource Management Tests
// Story 2.4: Smart Resource Management - Test Suite
// =====================================================
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
var globals_1 = require("@jest/globals");
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var sonner_1 = require("sonner");
var resource_management_1 = require("@/components/resources/resource-management");
var resource_allocation_form_1 = require("@/components/resources/resource-allocation-form");
var resource_optimization_1 = require("@/components/resources/resource-optimization");
// =====================================================
// Mock Data
// =====================================================
var mockResources = [
    {
        id: 'resource-1',
        clinic_id: 'clinic-1',
        name: 'Treatment Room A',
        type: 'room',
        category: 'treatment_room',
        location: 'Floor 1',
        status: 'available',
        capacity: 2,
        cost_per_hour: 50,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 'resource-2',
        clinic_id: 'clinic-1',
        name: 'Laser Equipment',
        type: 'equipment',
        category: 'laser_equipment',
        location: 'Treatment Room A',
        status: 'maintenance',
        capacity: 1,
        cost_per_hour: 100,
        next_maintenance: '2024-12-31T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    }
];
var mockAllocations = [
    {
        id: 'allocation-1',
        resource_id: 'resource-1',
        appointment_id: 'appointment-1',
        start_time: '2024-01-01T09:00:00Z',
        end_time: '2024-01-01T10:00:00Z',
        status: 'confirmed',
        allocation_type: 'appointment',
        notes: 'Regular treatment session'
    }
];
var mockOptimizationMetrics = {
    utilization_rate: 85,
    efficiency_score: 92,
    cost_effectiveness: 78,
    maintenance_compliance: 95,
    trend_analysis: {
        utilization_trend: 'up',
        efficiency_trend: 'stable',
        cost_trend: 'down'
    }
};
// =====================================================
// Mock Functions
// =====================================================
var mockFetch = globals_1.jest.fn();
global.fetch = mockFetch;
globals_1.jest.mock('sonner', function () { return ({
    toast: {
        success: globals_1.jest.fn(),
        error: globals_1.jest.fn()
    }
}); });
// =====================================================
// Test Utilities
// =====================================================
var renderWithProps = function (component, props) {
    if (props === void 0) { props = {}; }
    var defaultProps = __assign({ clinicId: 'clinic-1', userRole: 'admin' }, props);
    return (0, react_1.render)(React.cloneElement(component, defaultProps));
};
// =====================================================
// Resource Management Component Tests
// =====================================================
(0, globals_1.describe)('ResourceManagement Component', function () {
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: function () { return Promise.resolve({ success: true, data: mockResources }); }
        });
    });
    (0, globals_1.it)('renders resource management dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    (0, globals_1.expect)(react_1.screen.getByText('Resource Management')).toBeInTheDocument();
                    (0, globals_1.expect)(react_1.screen.getByText('Manage clinic resources, allocations, and optimize utilization')).toBeInTheDocument();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Laser Equipment')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('displays resource filters', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
            (0, globals_1.expect)(react_1.screen.getByText('Filters')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Resource Type')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Status')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('Category')).toBeInTheDocument();
            return [2 /*return*/];
        });
    }); });
    (0, globals_1.it)('shows resource cards with correct information', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('room • treatment_room')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Floor 1')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Capacity: 2')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('$50/hour')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('displays resource status badges', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('available')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('maintenance')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('updates resource status when button clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, setMaintenanceButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Mock status update response
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true }); }
                    });
                    setMaintenanceButton = react_1.screen.getByText('Set Maintenance');
                    return [4 /*yield*/, user.click(setMaintenanceButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith('/api/resources', globals_1.expect.objectContaining({
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: 'resource-1', status: 'maintenance' })
                            }));
                            (0, globals_1.expect)(sonner_1.toast.success).toHaveBeenCalledWith('Resource status updated');
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('hides admin buttons for patient users', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="patient"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(react_1.screen.queryByText('Add Resource')).not.toBeInTheDocument();
                    (0, globals_1.expect)(react_1.screen.queryByText('Set Maintenance')).not.toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('handles API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockFetch.mockResolvedValueOnce({
                        ok: false,
                        json: function () { return Promise.resolve({ success: false, error: 'Failed to fetch' }); }
                    });
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(sonner_1.toast.error).toHaveBeenCalledWith('Failed to fetch resources');
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// Resource Allocation Form Tests
// =====================================================
(0, globals_1.describe)('ResourceAllocationForm Component', function () {
    var defaultProps = {
        open: true,
        onOpenChange: globals_1.jest.fn(),
        clinicId: 'clinic-1',
        onSuccess: globals_1.jest.fn()
    };
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        mockFetch.mockResolvedValue({
            ok: true,
            json: function () { return Promise.resolve({ success: true, data: mockResources }); }
        });
    });
    (0, globals_1.it)('renders allocation form when open', function () {
        (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps}/>);
        (0, globals_1.expect)(react_1.screen.getByText('Create Resource Allocation')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Allocate a resource for an appointment or maintenance period')).toBeInTheDocument();
    });
    (0, globals_1.it)('fetches available resources on open', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps}/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith(globals_1.expect.stringContaining('/api/resources?clinic_id=clinic-1&status=available'));
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('displays resource selection dropdown', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps}/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Resource *')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Select a resource')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('shows time selection inputs', function () {
        (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps}/>);
        (0, globals_1.expect)(react_1.screen.getByLabelText('Start Time *')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByLabelText('End Time *')).toBeInTheDocument();
    });
    (0, globals_1.it)('validates required fields before submission', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps}/>);
                    createButton = react_1.screen.getByText('Create Allocation');
                    return [4 /*yield*/, user.click(createButton)];
                case 1:
                    _a.sent();
                    (0, globals_1.expect)(sonner_1.toast.error).toHaveBeenCalledWith('Please fill in all required fields');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('creates allocation successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, onSuccess, onOpenChange, resourceSelect, startTimeInput, endTimeInput, createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    onSuccess = globals_1.jest.fn();
                    onOpenChange = globals_1.jest.fn();
                    // Mock successful creation
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true, data: mockResources }); }
                    });
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true, data: { conflicts: [] } }); }
                    });
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true }); }
                    });
                    (0, react_1.render)(<resource_allocation_form_1.default {...defaultProps} onSuccess={onSuccess} onOpenChange={onOpenChange}/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Select a resource')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    resourceSelect = react_1.screen.getByText('Select a resource');
                    return [4 /*yield*/, user.click(resourceSelect)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            var resourceOption = react_1.screen.getByText(/Treatment Room A/);
                            yield user.click(resourceOption);
                        })];
                case 3:
                    _a.sent();
                    startTimeInput = react_1.screen.getByLabelText('Start Time *');
                    endTimeInput = react_1.screen.getByLabelText('End Time *');
                    return [4 /*yield*/, user.type(startTimeInput, '2024-01-01T09:00')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, user.type(endTimeInput, '2024-01-01T10:00')];
                case 5:
                    _a.sent();
                    // Wait for conflict check to complete
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.queryByText('Checking for conflicts...')).not.toBeInTheDocument();
                        })];
                case 6:
                    // Wait for conflict check to complete
                    _a.sent();
                    createButton = react_1.screen.getByText('Create Allocation');
                    return [4 /*yield*/, user.click(createButton)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith('/api/resources/allocations', globals_1.expect.objectContaining({
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: globals_1.expect.stringContaining('resource-1')
                            }));
                            (0, globals_1.expect)(sonner_1.toast.success).toHaveBeenCalledWith('Resource allocation created successfully');
                            (0, globals_1.expect)(onOpenChange).toHaveBeenCalledWith(false);
                            (0, globals_1.expect)(onSuccess).toHaveBeenCalled();
                        })];
                case 8:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// Resource Optimization Component Tests
// =====================================================
(0, globals_1.describe)('ResourceOptimization Component', function () {
    (0, globals_1.beforeEach)(function () {
        globals_1.jest.clearAllMocks();
        // Mock optimization data responses
        mockFetch
            .mockResolvedValueOnce({
            ok: true,
            json: function () { return Promise.resolve({ success: true, data: mockOptimizationMetrics }); }
        })
            .mockResolvedValueOnce({
            ok: true,
            json: function () { return Promise.resolve({ success: true, data: [] }); }
        })
            .mockResolvedValueOnce({
            ok: true,
            json: function () { return Promise.resolve({ success: true, data: [] }); }
        });
    });
    (0, globals_1.it)('renders optimization dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
            (0, globals_1.expect)(react_1.screen.getByText('Resource Optimization')).toBeInTheDocument();
            (0, globals_1.expect)(react_1.screen.getByText('AI-powered insights and recommendations for optimal resource utilization')).toBeInTheDocument();
            return [2 /*return*/];
        });
    }); });
    (0, globals_1.it)('displays metrics overview cards', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Utilization Rate')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Efficiency Score')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Cost Effectiveness')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Maintenance Compliance')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('shows correct metric values', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('85%')).toBeInTheDocument(); // Utilization rate
                            (0, globals_1.expect)(react_1.screen.getByText('92%')).toBeInTheDocument(); // Efficiency score
                            (0, globals_1.expect)(react_1.screen.getByText('78%')).toBeInTheDocument(); // Cost effectiveness
                            (0, globals_1.expect)(react_1.screen.getByText('95%')).toBeInTheDocument(); // Maintenance compliance
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('displays period selector', function () {
        renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
        (0, globals_1.expect)(react_1.screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
    });
    (0, globals_1.it)('shows run optimization button for non-patient users', function () {
        renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
        (0, globals_1.expect)(react_1.screen.getByText('Run Optimization')).toBeInTheDocument();
    });
    (0, globals_1.it)('hides run optimization button for patient users', function () {
        renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="patient"/>);
        (0, globals_1.expect)(react_1.screen.queryByText('Run Optimization')).not.toBeInTheDocument();
    });
    (0, globals_1.it)('has tabs for different views', function () {
        renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
        (0, globals_1.expect)(react_1.screen.getByText('Utilization Analysis')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Trends')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Suggestions')).toBeInTheDocument();
    });
    (0, globals_1.it)('runs optimization when button clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, optimizeButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
                    // Mock optimization response
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true }); }
                    });
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Run Optimization')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    optimizeButton = react_1.screen.getByText('Run Optimization');
                    return [4 /*yield*/, user.click(optimizeButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith('/api/resources/optimize', globals_1.expect.objectContaining({
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: globals_1.expect.stringContaining('clinic-1')
                            }));
                            (0, globals_1.expect)(sonner_1.toast.success).toHaveBeenCalledWith('Optimization completed successfully');
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('handles API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockFetch.mockReset();
                    mockFetch.mockRejectedValue(new Error('Network error'));
                    renderWithProps(<resource_optimization_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(sonner_1.toast.error).toHaveBeenCalledWith('Error loading optimization data');
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
// =====================================================
// Integration Tests
// =====================================================
(0, globals_1.describe)('Resource Management Integration', function () {
    (0, globals_1.it)('integrates resource management components correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    // Mock all required API responses
                    mockFetch
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true, data: mockResources }); }
                    });
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Resource Management')).toBeInTheDocument();
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Verify that all key components are rendered
                    (0, globals_1.expect)(react_1.screen.getByText('Filters')).toBeInTheDocument();
                    (0, globals_1.expect)(react_1.screen.getByText('Resources (2)')).toBeInTheDocument();
                    (0, globals_1.expect)(react_1.screen.getByText('Resource Details')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.it)('maintains state consistency across components', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, setMaintenanceButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = user_event_1.default.setup();
                    mockFetch.mockResolvedValue({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true, data: mockResources }); }
                    });
                    renderWithProps(<resource_management_1.default clinicId="clinic-1" userRole="admin"/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(react_1.screen.getByText('Treatment Room A')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Status updates should trigger re-fetch
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: function () { return Promise.resolve({ success: true }); }
                    });
                    setMaintenanceButton = react_1.screen.getByText('Set Maintenance');
                    return [4 /*yield*/, user.click(setMaintenanceButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith('/api/resources', globals_1.expect.objectContaining({ method: 'PUT' }));
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
