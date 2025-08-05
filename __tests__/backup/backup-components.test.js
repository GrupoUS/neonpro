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
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var globals_1 = require("@jest/globals");
var backup_dashboard_1 = require("@/components/backup/backup-dashboard");
var backup_config_form_1 = require("@/components/backup/backup-config-form");
var BackupHistory_1 = require("@/components/backup/BackupHistory");
// Mock fetch globally
global.fetch = globals_1.jest.fn();
// Mock toast
globals_1.jest.mock('sonner', function () { return ({
    toast: {
        success: globals_1.jest.fn(),
        error: globals_1.jest.fn(),
        info: globals_1.jest.fn(),
    },
}); });
// Mock router
globals_1.jest.mock('next/navigation', function () { return ({
    useRouter: function () { return ({
        push: globals_1.jest.fn(),
        replace: globals_1.jest.fn(),
        back: globals_1.jest.fn(),
    }); },
}); });
describe('BackupDashboard', function () {
    beforeEach(function () {
        fetch.mockClear();
    });
    it('renders backup dashboard correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock API responses
                    fetch
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: {
                                            total_backups: 15,
                                            successful_backups: 12,
                                            failed_backups: 2,
                                            pending_backups: 1,
                                            storage_used: 1073741824, // 1GB
                                            last_backup: new Date().toISOString(),
                                        },
                                    })];
                            });
                        }); },
                    })
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: [
                                            {
                                                id: 'job-1',
                                                config_name: 'Daily Backup',
                                                status: 'COMPLETED',
                                                start_time: new Date().toISOString(),
                                                end_time: new Date().toISOString(),
                                                size: 536870912, // 512MB
                                            },
                                        ],
                                    })];
                            });
                        }); },
                    })
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: [
                                            {
                                                id: 'config-1',
                                                name: 'Daily Database Backup',
                                                type: 'FULL',
                                                enabled: true,
                                                last_backup: new Date().toISOString(),
                                            },
                                        ],
                                    })];
                            });
                        }); },
                    });
                    (0, react_2.render)(<backup_dashboard_1.default />);
                    // Wait for data to load
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Painel de Backup')).toBeInTheDocument();
                        })];
                case 1:
                    // Wait for data to load
                    _a.sent();
                    // Check if metrics are displayed
                    expect(react_2.screen.getByText('15')).toBeInTheDocument(); // total_backups
                    expect(react_2.screen.getByText('12')).toBeInTheDocument(); // successful_backups
                    expect(react_2.screen.getByText('2')).toBeInTheDocument(); // failed_backups
                    return [2 /*return*/];
            }
        });
    }); });
    it('handles API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetch.mockRejectedValue(new Error('API Error'));
                    (0, react_2.render)(<backup_dashboard_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Painel de Backup')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Should show loading or error state
                    expect(react_2.screen.getByText(/carregando/i) || react_2.screen.getByText(/erro/i)).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('BackupConfigForm', function () {
    var mockOnSave = globals_1.jest.fn();
    var mockOnCancel = globals_1.jest.fn();
    beforeEach(function () {
        mockOnSave.mockClear();
        mockOnCancel.mockClear();
        fetch.mockClear();
    });
    it('renders form fields correctly', function () {
        (0, react_2.render)(<backup_config_form_1.default onSave={mockOnSave} onCancel={mockOnCancel}/>);
        expect(react_2.screen.getByLabelText(/nome da configuração/i)).toBeInTheDocument();
        expect(react_2.screen.getByLabelText(/tipo de backup/i)).toBeInTheDocument();
        expect(react_2.screen.getByLabelText(/provedor de armazenamento/i)).toBeInTheDocument();
    });
    it('validates required fields', function () { return __awaiter(void 0, void 0, void 0, function () {
        var saveButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_2.render)(<backup_config_form_1.default onSave={mockOnSave} onCancel={mockOnCancel}/>);
                    saveButton = react_2.screen.getByRole('button', { name: /salvar/i });
                    react_2.fireEvent.click(saveButton);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    expect(mockOnSave).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    it('submits form with valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var saveButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_2.render)(<backup_config_form_1.default onSave={mockOnSave} onCancel={mockOnCancel}/>);
                    // Fill form fields
                    react_2.fireEvent.change(react_2.screen.getByLabelText(/nome da configuração/i), {
                        target: { value: 'Test Backup Config' },
                    });
                    react_2.fireEvent.change(react_2.screen.getByLabelText(/tipo de backup/i), {
                        target: { value: 'FULL' },
                    });
                    saveButton = react_2.screen.getByRole('button', { name: /salvar/i });
                    react_2.fireEvent.click(saveButton);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
                                name: 'Test Backup Config',
                                type: 'FULL',
                            }));
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('edits existing configuration', function () {
        var existingConfig = {
            id: 'config-1',
            name: 'Existing Config',
            type: 'INCREMENTAL',
            storage_provider: 'local',
            schedule: {
                enabled: true,
                frequency: 'DAILY',
                time: '02:00',
            },
            retention: {
                daily: 7,
                weekly: 4,
                monthly: 12,
            },
            data_sources: ['database'],
            encryption: {
                enabled: true,
                algorithm: 'AES-256',
            },
            compression: {
                enabled: true,
                algorithm: 'gzip',
                level: 6,
            },
            created_at: new Date(),
            updated_at: new Date(),
        };
        (0, react_2.render)(<backup_config_form_1.default config={existingConfig} onSave={mockOnSave} onCancel={mockOnCancel}/>);
        expect(react_2.screen.getByDisplayValue('Existing Config')).toBeInTheDocument();
        expect(react_2.screen.getByDisplayValue('INCREMENTAL')).toBeInTheDocument();
    });
});
describe('BackupHistory', function () {
    beforeEach(function () {
        fetch.mockClear();
    });
    it('renders backup history table', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockBackups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockBackups = [
                        {
                            id: 'backup-1',
                            config_id: 'config-1',
                            config_name: 'Daily Backup',
                            status: 'COMPLETED',
                            type: 'FULL',
                            start_time: new Date().toISOString(),
                            end_time: new Date().toISOString(),
                            duration: 300000, // 5 minutes
                            size: 1073741824, // 1GB
                        },
                        {
                            id: 'backup-2',
                            config_id: 'config-1',
                            config_name: 'Daily Backup',
                            status: 'FAILED',
                            type: 'INCREMENTAL',
                            start_time: new Date().toISOString(),
                            error_message: 'Connection timeout',
                        },
                    ];
                    fetch.mockResolvedValue({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: mockBackups,
                                        total: 2,
                                    })];
                            });
                        }); },
                    });
                    (0, react_2.render)(<BackupHistory_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Histórico de Backups')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Check if backup entries are displayed
                    expect(react_2.screen.getByText('Daily Backup')).toBeInTheDocument();
                    expect(react_2.screen.getByText('COMPLETED')).toBeInTheDocument();
                    expect(react_2.screen.getByText('FAILED')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('filters backups by status', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockBackups, statusFilter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockBackups = [
                        {
                            id: 'backup-1',
                            config_id: 'config-1',
                            config_name: 'Daily Backup',
                            status: 'COMPLETED',
                            type: 'FULL',
                            start_time: new Date().toISOString(),
                        },
                    ];
                    fetch.mockResolvedValue({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: mockBackups,
                                        total: 1,
                                    })];
                            });
                        }); },
                    });
                    (0, react_2.render)(<BackupHistory_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Histórico de Backups')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    statusFilter = react_2.screen.getByRole('combobox', { name: /status/i });
                    react_2.fireEvent.click(statusFilter);
                    // Select "Concluído"
                    react_2.fireEvent.click(react_2.screen.getByText('Concluído'));
                    // Verify filtering is applied
                    expect(react_2.screen.getByText('COMPLETED')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('searches backups by name', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockBackups, searchInput;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockBackups = [
                        {
                            id: 'backup-1',
                            config_id: 'config-1',
                            config_name: 'Daily Database Backup',
                            status: 'COMPLETED',
                            type: 'FULL',
                            start_time: new Date().toISOString(),
                        },
                    ];
                    fetch.mockResolvedValue({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: mockBackups,
                                        total: 1,
                                    })];
                            });
                        }); },
                    });
                    (0, react_2.render)(<BackupHistory_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Histórico de Backups')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    searchInput = react_2.screen.getByPlaceholderText(/nome ou id/i);
                    react_2.fireEvent.change(searchInput, { target: { value: 'Database' } });
                    // Verify search results
                    expect(react_2.screen.getByText('Daily Database Backup')).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    it('handles backup deletion', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockBackups, actionsButton, deleteButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockBackups = [
                        {
                            id: 'backup-1',
                            config_id: 'config-1',
                            config_name: 'Daily Backup',
                            status: 'COMPLETED',
                            type: 'FULL',
                            start_time: new Date().toISOString(),
                        },
                    ];
                    fetch
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: mockBackups,
                                        total: 1,
                                    })];
                            });
                        }); },
                    })
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ success: true })];
                        }); }); },
                    });
                    (0, react_2.render)(<BackupHistory_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Daily Backup')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    actionsButton = react_2.screen.getByRole('button', { name: /more/i });
                    react_2.fireEvent.click(actionsButton);
                    deleteButton = react_2.screen.getByText(/remover/i);
                    react_2.fireEvent.click(deleteButton);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(fetch).toHaveBeenCalledWith('/api/backup/jobs/backup-1', expect.objectContaining({
                                method: 'DELETE',
                            }));
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Backup Components Integration', function () {
    it('allows creating backup from dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
        var createButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mock API calls for dashboard
                    fetch
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        data: {
                                            total_backups: 0,
                                            successful_backups: 0,
                                            failed_backups: 0,
                                            pending_backups: 0,
                                            storage_used: 0,
                                        },
                                    })];
                            });
                        }); },
                    })
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ data: [] })];
                        }); }); },
                    })
                        .mockResolvedValueOnce({
                        ok: true,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ data: [] })];
                        }); }); },
                    });
                    (0, react_2.render)(<backup_dashboard_1.default />);
                    return [4 /*yield*/, (0, react_2.waitFor)(function () {
                            expect(react_2.screen.getByText('Painel de Backup')).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    createButton = react_2.screen.getByRole('button', { name: /nova configuração/i });
                    expect(createButton).toBeInTheDocument();
                    react_2.fireEvent.click(createButton);
                    return [2 /*return*/];
            }
        });
    }); });
});
