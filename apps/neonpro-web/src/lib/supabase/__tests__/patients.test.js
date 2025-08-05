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
var client_1 = require("@/lib/supabase/client");
var patients_1 = require("../patients");
// Mock the Supabase client
jest.mock('@/lib/supabase/client');
var mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn()
};
client_1.createClient.mockReturnValue(mockSupabase);
var mockPatientData = {
    name: 'João Silva Santos',
    cpf: '12345678901',
    rg: '123456789',
    birthDate: '1990-01-15',
    gender: 'male',
    phone: '11987654321',
    email: 'joao@email.com',
    address: {
        zipCode: '01234567',
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        neighborhood: 'Centro',
        number: '123',
        complement: 'Apt 45'
    },
    emergencyContact: {
        name: 'Maria Silva',
        relationship: 'spouse',
        phone: '11987654322'
    },
    medicalInfo: {
        allergies: ['Penicilina'],
        conditions: ['Hipertensão'],
        medications: ['Losartana 50mg'],
        bloodType: 'O+',
        observations: 'Paciente com histórico familiar de diabetes'
    },
    insuranceInfo: {
        hasInsurance: true,
        provider: 'Unimed',
        planType: 'particular',
        cardNumber: '123456789',
        validUntil: '2025-12-31'
    },
    consents: {
        basic: true,
        marketing: false,
        healthCommunication: true,
        analytics: false,
        surveys: true
    }
};
var mockFHIRPatient = {
    resourceType: 'Patient',
    id: '123',
    identifier: [
        {
            type: {
                coding: [{
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: 'TAX',
                        display: 'Tax ID number'
                    }]
            },
            system: 'http://rnds.saude.gov.br/fhir/r4/NamingSystem/cpf',
            value: '12345678901'
        }
    ],
    name: [
        {
            use: 'official',
            text: 'João Silva Santos',
            family: 'Santos',
            given: ['João', 'Silva']
        }
    ],
    gender: 'male',
    birthDate: '1990-01-15'
};
describe('Patient Supabase Functions', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('createPatient', function () {
        it('successfully creates a patient with valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockInsertResult, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockInsertResult = {
                            data: [{ id: 123, medical_record_number: 'MR001' }],
                            error: null
                        };
                        mockSupabase.from.mockReturnValue({
                            insert: jest.fn().mockResolvedValue(mockInsertResult),
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        result = _a.sent();
                        expect(mockSupabase.from).toHaveBeenCalledWith('patients');
                        expect(result).toEqual({
                            success: true,
                            data: { id: 123, medical_record_number: 'MR001' }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('handles database errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockError, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockError = { message: 'Duplicate CPF', code: '23505' };
                        mockSupabase.from.mockReturnValue({
                            insert: jest.fn().mockResolvedValue({
                                data: null,
                                error: mockError
                            }),
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            success: false,
                            error: 'Duplicate CPF'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('transforms data to FHIR-compliant format', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockInsertResult, insertMock, insertedData, cpfIdentifier;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockInsertResult = {
                            data: [{ id: 123, medical_record_number: 'MR001' }],
                            error: null
                        };
                        insertMock = jest.fn().mockResolvedValue(mockInsertResult);
                        mockSupabase.from.mockReturnValue({
                            insert: insertMock,
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        _a.sent();
                        insertedData = insertMock.mock.calls[0][0];
                        // Check FHIR structure
                        expect(insertedData.fhir_data.resourceType).toBe('Patient');
                        expect(insertedData.fhir_data.name[0].text).toBe('João Silva Santos');
                        expect(insertedData.fhir_data.gender).toBe('male');
                        expect(insertedData.fhir_data.birthDate).toBe('1990-01-15');
                        // Check identifiers
                        expect(insertedData.fhir_data.identifier).toHaveLength(2); // CPF and RG
                        cpfIdentifier = insertedData.fhir_data.identifier.find(function (id) { return id.system === 'http://rnds.saude.gov.br/fhir/r4/NamingSystem/cpf'; });
                        expect(cpfIdentifier.value).toBe('12345678901');
                        return [2 /*return*/];
                }
            });
        }); });
        it('includes LGPD consent data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockInsertResult, insertMock, insertedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockInsertResult = {
                            data: [{ id: 123, medical_record_number: 'MR001' }],
                            error: null
                        };
                        insertMock = jest.fn().mockResolvedValue(mockInsertResult);
                        mockSupabase.from.mockReturnValue({
                            insert: insertMock,
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        _a.sent();
                        insertedData = insertMock.mock.calls[0][0];
                        // Check LGPD consent mapping
                        expect(insertedData.lgpd_consents.basic_processing).toBe(true);
                        expect(insertedData.lgpd_consents.marketing_communication).toBe(false);
                        expect(insertedData.lgpd_consents.health_communication).toBe(true);
                        expect(insertedData.lgpd_consents.analytics_processing).toBe(false);
                        expect(insertedData.lgpd_consents.surveys_research).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPatient', function () {
        it('retrieves patient by ID successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPatientRecord, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPatientRecord = {
                            id: 123,
                            medical_record_number: 'MR001',
                            fhir_data: mockFHIRPatient,
                            lgpd_consents: {
                                basic_processing: true,
                                marketing_communication: false
                            },
                            created_at: '2024-01-15T10:00:00Z',
                            updated_at: '2024-01-15T10:00:00Z'
                        };
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            single: jest.fn().mockResolvedValue({
                                data: mockPatientRecord,
                                error: null
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.getPatient)(123)];
                    case 1:
                        result = _a.sent();
                        expect(mockSupabase.from).toHaveBeenCalledWith('patients');
                        expect(result).toEqual({
                            success: true,
                            data: mockPatientRecord
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('handles patient not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            single: jest.fn().mockResolvedValue({
                                data: null,
                                error: { code: 'PGRST116', message: 'The result contains 0 rows' }
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.getPatient)(999)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            success: false,
                            error: 'Patient not found'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updatePatient', function () {
        it('updates patient data successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var updatedData, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatedData = __assign(__assign({}, mockPatientData), { name: 'João Silva Santos Jr.' });
                        mockSupabase.from.mockReturnValue({
                            update: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            select: jest.fn().mockResolvedValue({
                                data: [{ id: 123, medical_record_number: 'MR001' }],
                                error: null
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.updatePatient)(123, updatedData)];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        expect(result.data).toEqual({ id: 123, medical_record_number: 'MR001' });
                        return [2 /*return*/];
                }
            });
        }); });
        it('handles update errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            update: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            select: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Update failed' }
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.updatePatient)(123, mockPatientData)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            success: false,
                            error: 'Update failed'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('deletePatient', function () {
        it('soft deletes patient successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            update: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockResolvedValue({
                                data: [{ id: 123 }],
                                error: null
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.deletePatient)(123)];
                    case 1:
                        result = _a.sent();
                        expect(result.success).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('handles deletion errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            update: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Patient not found' }
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.deletePatient)(999)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            success: false,
                            error: 'Patient not found'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('searchPatients', function () {
        it('searches patients by name successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockResults, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        mockResults = [
                            { id: 1, medical_record_number: 'MR001', fhir_data: { name: [{ text: 'João Silva' }] } },
                            { id: 2, medical_record_number: 'MR002', fhir_data: { name: [{ text: 'João Santos' }] } }
                        ];
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnThis(),
                            or: jest.fn().mockReturnThis(),
                            ilike: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            order: jest.fn().mockReturnThis(),
                            range: jest.fn().mockResolvedValue({
                                data: mockResults,
                                error: null,
                                count: 2
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.searchPatients)({
                                query: 'João',
                                page: 1,
                                limit: 10
                            })];
                    case 1:
                        result = _c.sent();
                        expect(result.success).toBe(true);
                        expect((_a = result.data) === null || _a === void 0 ? void 0 : _a.patients).toHaveLength(2);
                        expect((_b = result.data) === null || _b === void 0 ? void 0 : _b.total).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('filters by status correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockCalls;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.from.mockReturnValue({
                            select: jest.fn().mockReturnThis(),
                            or: jest.fn().mockReturnThis(),
                            ilike: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockReturnThis(),
                            order: jest.fn().mockReturnThis(),
                            range: jest.fn().mockResolvedValue({
                                data: [],
                                error: null,
                                count: 0
                            })
                        });
                        return [4 /*yield*/, (0, patients_1.searchPatients)({
                                query: 'João',
                                status: 'active',
                                page: 1,
                                limit: 10
                            })];
                    case 1:
                        _a.sent();
                        mockCalls = mockSupabase.from().eq.mock.calls;
                        expect(mockCalls.some(function (call) { return call[0] === 'status' && call[1] === 'active'; })).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPatientStats', function () {
        it('retrieves patient statistics successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockStats, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockStats = {
                            total_patients: 150,
                            active_patients: 140,
                            new_this_month: 15,
                            avg_age: 35.5
                        };
                        mockSupabase.rpc.mockResolvedValue({
                            data: mockStats,
                            error: null
                        });
                        return [4 /*yield*/, (0, patients_1.getPatientStats)()];
                    case 1:
                        result = _a.sent();
                        expect(mockSupabase.rpc).toHaveBeenCalledWith('get_patient_statistics');
                        expect(result).toEqual({
                            success: true,
                            data: mockStats
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('handles statistics retrieval errors', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockSupabase.rpc.mockResolvedValue({
                            data: null,
                            error: { message: 'Function not found' }
                        });
                        return [4 /*yield*/, (0, patients_1.getPatientStats)()];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            success: false,
                            error: 'Function not found'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('FHIR Data Transformation', function () {
        it('correctly transforms Brazilian address to FHIR format', function () { return __awaiter(void 0, void 0, void 0, function () {
            var insertMock, fhirData, address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        insertMock = jest.fn().mockResolvedValue({
                            data: [{ id: 123 }],
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            insert: insertMock,
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        _a.sent();
                        fhirData = insertMock.mock.calls[0][0].fhir_data;
                        address = fhirData.address[0];
                        expect(address.use).toBe('home');
                        expect(address.type).toBe('physical');
                        expect(address.line).toContain('Rua das Flores, 123');
                        expect(address.city).toBe('São Paulo');
                        expect(address.state).toBe('SP');
                        expect(address.postalCode).toBe('01234567');
                        expect(address.country).toBe('BR');
                        return [2 /*return*/];
                }
            });
        }); });
        it('correctly transforms emergency contact to FHIR RelatedPerson', function () { return __awaiter(void 0, void 0, void 0, function () {
            var insertMock, fhirData, contact;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        insertMock = jest.fn().mockResolvedValue({
                            data: [{ id: 123 }],
                            error: null
                        });
                        mockSupabase.from.mockReturnValue({
                            insert: insertMock,
                            select: jest.fn().mockReturnThis()
                        });
                        return [4 /*yield*/, (0, patients_1.createPatient)(mockPatientData)];
                    case 1:
                        _a.sent();
                        fhirData = insertMock.mock.calls[0][0].fhir_data;
                        contact = fhirData.contact[0];
                        expect(contact.relationship[0].coding[0].code).toBe('C');
                        expect(contact.name.text).toBe('Maria Silva');
                        expect(contact.telecom[0].value).toBe('11987654322');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
