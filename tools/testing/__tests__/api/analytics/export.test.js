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
var node_mocks_http_1 = require("node-mocks-http");
var route_1 = require("@/app/api/analytics/export/route");
var mockData_1 = require("@/../../__tests__/utils/mockData");
// Mock Supabase auth
jest.mock('@/utils/supabase/server', function () { return ({
    createClient: function () { return ({
        auth: {
            getSession: jest.fn().mockResolvedValue({
                data: { session: mockData_1.mockSession },
                error: null,
            }),
        },
    }); },
}); });
// Mock jsPDF
jest.mock('jspdf', function () {
    return jest.fn().mockImplementation(function () { return ({
        text: jest.fn(),
        save: jest.fn(),
        internal: {
            pageSize: {
                getWidth: function () { return 210; },
                getHeight: function () { return 297; },
            },
        },
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        addImage: jest.fn(),
        output: jest.fn().mockReturnValue('mock-pdf-content'),
    }); });
});
// Mock ExcelJS
jest.mock('exceljs', function () { return ({
    Workbook: jest.fn().mockImplementation(function () { return ({
        addWorksheet: jest.fn().mockReturnValue({
            addRow: jest.fn(),
            getColumn: jest.fn().mockReturnValue({
                width: 0,
            }),
            mergeCells: jest.fn(),
            getCell: jest.fn().mockReturnValue({
                font: {},
                alignment: {},
                fill: {},
            }),
        }),
        xlsx: {
            writeBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-excel-content')),
        },
    }); }),
}); });
describe('/api/analytics/export', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    it('should export data to PDF format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'pdf',
                            data: mockData_1.mockExportData,
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(200);
                    expect(res._getHeaders()['content-type']).toBe('application/pdf');
                    expect(res._getHeaders()['content-disposition']).toContain('attachment');
                    expect(res._getData()).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should export data to Excel format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'excel',
                            data: mockData_1.mockExportData,
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(200);
                    expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    expect(res._getHeaders()['content-disposition']).toContain('attachment');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should export data to CSV format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'csv',
                            data: mockData_1.mockExportData,
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(200);
                    expect(res._getHeaders()['content-type']).toBe('text/csv');
                    expect(res._getHeaders()['content-disposition']).toContain('attachment');
                    expect(res._getData()).toContain('Total Patients,Total Revenue');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 400 for invalid format', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'invalid',
                            data: mockData_1.mockExportData,
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(400);
                    data = JSON.parse(res._getData());
                    expect(data.error).toContain('Invalid export format');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 401 for unauthenticated requests', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockSupabase, _a, req, res, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockSupabase = require('@/utils/supabase/server').createClient();
                    mockSupabase.auth.getSession.mockResolvedValueOnce({
                        data: { session: null },
                        error: null,
                    });
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'pdf',
                            data: mockData_1.mockExportData,
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(401);
                    data = JSON.parse(res._getData());
                    expect(data.error).toBe('Unauthorized');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return 405 for non-POST methods', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'GET',
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(405);
                    data = JSON.parse(res._getData());
                    expect(data.error).toBe('Method not allowed');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle missing data gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, req, res, data;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, node_mocks_http_1.createMocks)({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: {
                            format: 'pdf',
                            // Missing data
                        },
                    }), req = _a.req, res = _a.res;
                    return [4 /*yield*/, (0, route_1.default)(req, res)];
                case 1:
                    _b.sent();
                    expect(res._getStatusCode()).toBe(400);
                    data = JSON.parse(res._getData());
                    expect(data.error).toContain('Missing required data');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle rate limiting', function () { return __awaiter(void 0, void 0, void 0, function () {
        var requests, responses, rateLimitedResponses;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requests = Array.from({ length: 10 }, function () {
                        return (0, node_mocks_http_1.createMocks)({
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Forwarded-For': '192.168.1.1',
                            },
                            body: {
                                format: 'pdf',
                                data: mockData_1.mockExportData,
                            },
                        });
                    });
                    return [4 /*yield*/, Promise.all(requests.map(function (_a) {
                            var req = _a.req, res = _a.res;
                            return (0, route_1.default)(req, res);
                        }))
                        // Should have some rate limited responses
                    ];
                case 1:
                    responses = _a.sent();
                    rateLimitedResponses = responses.filter(function (_, index) { return requests[index].res._getStatusCode() === 429; });
                    expect(rateLimitedResponses.length).toBeGreaterThan(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
