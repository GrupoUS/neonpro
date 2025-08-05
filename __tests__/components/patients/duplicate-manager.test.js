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
Object.defineProperty(exports, "__esModule", { value: true });
var duplicate_manager_1 = require("@/components/patients/duplicate-manager");
var duplicate_detection_1 = require("@/lib/patients/duplicate-detection");
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
// Mock do sistema de detecção de duplicatas
jest.mock("@/lib/patients/duplicate-detection", function () { return ({
    duplicateDetectionSystem: {
        detectDuplicates: jest.fn(),
        comparePatients: jest.fn(),
        confirmDuplicate: jest.fn(),
        rejectDuplicate: jest.fn(),
        previewMerge: jest.fn(),
        mergePatients: jest.fn(),
    },
}); });
// Mock dos componentes UI
jest.mock("@/components/ui/card", function () { return ({
    Card: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="card" {...props}>
      {children}
    </div>);
    },
    CardHeader: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="card-header" {...props}>
      {children}
    </div>);
    },
    CardContent: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="card-content" {...props}>
      {children}
    </div>);
    },
    CardTitle: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<h2 data-testid="card-title" {...props}>
      {children}
    </h2>);
    },
}); });
jest.mock("@/components/ui/button", function () { return ({
    Button: function (_a) {
        var children = _a.children, onClick = _a.onClick, props = __rest(_a, ["children", "onClick"]);
        return (<button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>);
    },
}); });
jest.mock("@/components/ui/badge", function () { return ({
    Badge: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<span data-testid="badge" {...props}>
      {children}
    </span>);
    },
}); });
jest.mock("@/components/ui/alert", function () { return ({
    Alert: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="alert" {...props}>
      {children}
    </div>);
    },
    AlertDescription: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<p data-testid="alert-description" {...props}>
      {children}
    </p>);
    },
}); });
jest.mock("@/components/ui/progress", function () { return ({
    Progress: function (_a) {
        var value = _a.value, props = __rest(_a, ["value"]);
        return (<div data-testid="progress" data-value={value} {...props}/>);
    },
}); });
jest.mock("@/components/ui/dialog", function () { return ({
    Dialog: function (_a) {
        var children = _a.children, open = _a.open, onOpenChange = _a.onOpenChange, props = __rest(_a, ["children", "open", "onOpenChange"]);
        return open ? (<div data-testid="dialog" {...props}>
        {children}
      </div>) : null;
    },
    DialogContent: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="dialog-content" {...props}>
      {children}
    </div>);
    },
    DialogDescription: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<p data-testid="dialog-description" {...props}>
      {children}
    </p>);
    },
    DialogFooter: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="dialog-footer" {...props}>
      {children}
    </div>);
    },
    DialogHeader: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="dialog-header" {...props}>
      {children}
    </div>);
    },
    DialogTitle: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<h3 data-testid="dialog-title" {...props}>
      {children}
    </h3>);
    },
    DialogTrigger: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="dialog-trigger" {...props}>
      {children}
    </div>);
    },
}); });
jest.mock("@/components/ui/tooltip", function () { return ({
    TooltipProvider: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="tooltip-provider" {...props}>
      {children}
    </div>);
    },
    Tooltip: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="tooltip" {...props}>
      {children}
    </div>);
    },
    TooltipContent: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="tooltip-content" {...props}>
      {children}
    </div>);
    },
    TooltipTrigger: function (_a) {
        var children = _a.children, props = __rest(_a, ["children"]);
        return (<div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>);
    },
}); });
var mockDuplicates = [
    {
        id: "dup-1",
        primaryPatientId: "patient-1",
        duplicatePatientId: "patient-2",
        confidenceScore: 0.95,
        status: "pending",
        matchingFields: ["name", "email", "phone"],
        potentialIssues: ["Different birthdates"],
        createdAt: new Date(),
        lastUpdated: new Date(),
    },
    {
        id: "dup-2",
        primaryPatientId: "patient-3",
        duplicatePatientId: "patient-4",
        confidenceScore: 0.75,
        status: "confirmed",
        matchingFields: ["email", "phone"],
        potentialIssues: [],
        createdAt: new Date(),
        lastUpdated: new Date(),
    },
];
var mockComparisons = [
    {
        field: "name",
        primaryValue: "João Silva",
        duplicateValue: "João da Silva",
        similarity: 0.9,
    },
    {
        field: "email",
        primaryValue: "joao@email.com",
        duplicateValue: "joao@email.com",
        similarity: 1.0,
    },
];
var mockMergePreview = {
    strategy: {
        patientData: "merge_intelligent",
        medicalHistory: "combine",
        appointments: "combine",
    },
    estimatedDataTransfer: {
        appointments: 5,
        documents: 10,
        medicalRecords: 8,
        financialRecords: 3,
    },
    potentialConflicts: ["Different birthdates"],
    recommendations: ["Review birthdate manually before merge"],
};
describe("DuplicateManager", function () {
    var user = user_event_1.default.setup();
    beforeEach(function () {
        jest.clearAllMocks();
        duplicate_detection_1.duplicateDetectionSystem.detectDuplicates.mockResolvedValue(mockDuplicates);
    });
    test("renderiza componente corretamente", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Duplicatas Pendentes de Revisão")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    // Verifica se os cards de summary são renderizados
                    expect(react_1.screen.getByText("Pendentes")).toBeInTheDocument();
                    expect(react_1.screen.getByText("Confirmadas")).toBeInTheDocument();
                    expect(react_1.screen.getByText("Mescladas")).toBeInTheDocument();
                    expect(react_1.screen.getByText("Confiança Média")).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    test("carrega duplicatas no mount", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.detectDuplicates).toHaveBeenCalled();
                        })];
                case 1:
                    _a.sent();
                    expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                    return [2 /*return*/];
            }
        });
    }); });
    test("exibe estado de loading", function () {
        duplicate_detection_1.duplicateDetectionSystem.detectDuplicates.mockReturnValue(new Promise(function () { }) // Promise que nunca resolve para simular loading
        );
        (0, react_1.render)(<duplicate_manager_1.default />);
        expect(react_1.screen.getByText("Carregando duplicatas...")).toBeInTheDocument();
        expect(react_1.screen.getByTestId("progress")).toBeInTheDocument();
    });
    test("exibe alerta quando não há duplicatas pendentes", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duplicate_detection_1.duplicateDetectionSystem.detectDuplicates.mockResolvedValue([]);
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Nenhuma duplicata pendente encontrada!")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("abre dialog de comparação", function () { return __awaiter(void 0, void 0, void 0, function () {
        var compareButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duplicate_detection_1.duplicateDetectionSystem.comparePatients.mockResolvedValue(mockComparisons);
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    compareButton = react_1.screen.getAllByTestId("button")[0];
                    return [4 /*yield*/, user.click(compareButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.comparePatients).toHaveBeenCalledWith("patient-1", "patient-2");
                            expect(react_1.screen.getByText("Comparação Detalhada")).toBeInTheDocument();
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("confirma duplicata", function () { return __awaiter(void 0, void 0, void 0, function () {
        var confirmButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duplicate_detection_1.duplicateDetectionSystem.confirmDuplicate.mockResolvedValue({});
                    duplicate_detection_1.duplicateDetectionSystem.detectDuplicates
                        .mockResolvedValueOnce(mockDuplicates)
                        .mockResolvedValueOnce([]); // Após confirmação, não há mais duplicatas
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    confirmButton = react_1.screen.getByText("Confirmar");
                    return [4 /*yield*/, user.click(confirmButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.confirmDuplicate).toHaveBeenCalledWith("dup-1", "current_user");
                            expect(duplicate_detection_1.duplicateDetectionSystem.detectDuplicates).toHaveBeenCalledTimes(2); // Mount + reload
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("rejeita duplicata", function () { return __awaiter(void 0, void 0, void 0, function () {
        var rejectButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duplicate_detection_1.duplicateDetectionSystem.rejectDuplicate.mockResolvedValue({});
                    duplicate_detection_1.duplicateDetectionSystem.detectDuplicates
                        .mockResolvedValueOnce(mockDuplicates)
                        .mockResolvedValueOnce([]); // Após rejeição, não há mais duplicatas
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    rejectButton = react_1.screen.getByText("Rejeitar");
                    return [4 /*yield*/, user.click(rejectButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.rejectDuplicate).toHaveBeenCalledWith("dup-1", "current_user", "Não são o mesmo paciente");
                            expect(duplicate_detection_1.duplicateDetectionSystem.detectDuplicates).toHaveBeenCalledTimes(2); // Mount + reload
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("abre preview de merge", function () { return __awaiter(void 0, void 0, void 0, function () {
        var mergePreviewButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    duplicate_detection_1.duplicateDetectionSystem.previewMerge.mockResolvedValue(mockMergePreview);
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    mergePreviewButton = react_1.screen.getAllByTestId("button")[1];
                    return [4 /*yield*/, user.click(mergePreviewButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.previewMerge).toHaveBeenCalledWith("patient-1", "patient-2", {
                                patientData: "merge_intelligent",
                                medicalHistory: "combine",
                                appointments: "combine",
                                documents: "combine",
                                financialData: "keep_primary",
                            });
                            expect(react_1.screen.getByText("Preview do Merge")).toBeInTheDocument();
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("executa merge", function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockOnMergeComplete, mergePreviewButton, executeMergeButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockOnMergeComplete = jest.fn();
                    duplicate_detection_1.duplicateDetectionSystem.previewMerge.mockResolvedValue(mockMergePreview);
                    duplicate_detection_1.duplicateDetectionSystem.mergePatients.mockResolvedValue({
                        success: true,
                    });
                    duplicate_detection_1.duplicateDetectionSystem.detectDuplicates
                        .mockResolvedValueOnce(mockDuplicates)
                        .mockResolvedValueOnce([]); // Após merge, não há mais duplicatas
                    (0, react_1.render)(<duplicate_manager_1.default onMergeComplete={mockOnMergeComplete}/>);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    mergePreviewButton = react_1.screen.getAllByTestId("button")[1];
                    return [4 /*yield*/, user.click(mergePreviewButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Preview do Merge")).toBeInTheDocument();
                        })];
                case 3:
                    _a.sent();
                    executeMergeButton = react_1.screen.getByText("Executar Merge");
                    return [4 /*yield*/, user.click(executeMergeButton)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(duplicate_detection_1.duplicateDetectionSystem.mergePatients).toHaveBeenCalledWith("patient-1", "patient-2", {
                                patientData: "merge_intelligent",
                                medicalHistory: "combine",
                                appointments: "combine",
                                documents: "combine",
                                financialData: "keep_primary",
                            }, "current_user");
                            expect(mockOnMergeComplete).toHaveBeenCalledWith({ success: true });
                        })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("exibe badges de confiança corretas", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("95%")).toBeInTheDocument(); // Alta confiança
                            expect(react_1.screen.getByText("75%")).toBeInTheDocument(); // Média confiança
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("calcula estatísticas corretamente", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("1")).toBeInTheDocument(); // 1 pendente
                            expect(react_1.screen.getByText("1")).toBeInTheDocument(); // 1 confirmada
                            expect(react_1.screen.getByText("0")).toBeInTheDocument(); // 0 mescladas
                            expect(react_1.screen.getByText("85%")).toBeInTheDocument(); // Confiança média: (95+75)/2 = 85%
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("trata erros ao carregar duplicatas", function () { return __awaiter(void 0, void 0, void 0, function () {
        var consoleSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consoleSpy = jest.spyOn(console, "error").mockImplementation();
                    duplicate_detection_1.duplicateDetectionSystem.detectDuplicates.mockRejectedValue(new Error("API Error"));
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(consoleSpy).toHaveBeenCalledWith("Erro ao carregar duplicatas:", expect.any(Error));
                        })];
                case 1:
                    _a.sent();
                    consoleSpy.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    test("trata erros na comparação de pacientes", function () { return __awaiter(void 0, void 0, void 0, function () {
        var consoleSpy, compareButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consoleSpy = jest.spyOn(console, "error").mockImplementation();
                    duplicate_detection_1.duplicateDetectionSystem.comparePatients.mockRejectedValue(new Error("Compare Error"));
                    (0, react_1.render)(<duplicate_manager_1.default />);
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(react_1.screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
                        })];
                case 1:
                    _a.sent();
                    compareButton = react_1.screen.getAllByTestId("button")[0];
                    return [4 /*yield*/, user.click(compareButton)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, react_1.waitFor)(function () {
                            expect(consoleSpy).toHaveBeenCalledWith("Erro ao comparar pacientes:", expect.any(Error));
                        })];
                case 3:
                    _a.sent();
                    consoleSpy.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
});
