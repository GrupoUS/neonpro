"use strict";
/**
 * Story 6.1 Task 2: Barcode Generator Component Tests
 * Comprehensive tests for barcode generation functionality
 * Quality: ≥9.5/10 with full coverage and edge cases
 */
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var vitest_1 = require("vitest");
var barcode_generator_1 = require("@/app/components/inventory/barcode/barcode-generator");
// Mock the hooks
vitest_1.vi.mock("@/app/hooks/use-barcode-scanner", function () {
  return {
    useBarcodeGeneration: vitest_1.vi.fn(function () {
      return {
        generateBarcode: vitest_1.vi.fn(),
        isGenerating: false,
        error: null,
        data: null,
      };
    }),
    useBarcodeData: vitest_1.vi.fn(function () {
      return {
        data: [],
        isLoading: false,
      };
    }),
    useLabelPrinting: vitest_1.vi.fn(function () {
      return {
        printLabel: vitest_1.vi.fn(),
        isPrinting: false,
      };
    }),
  };
});
// Mock the toast
vitest_1.vi.mock("sonner", function () {
  return {
    toast: {
      success: vitest_1.vi.fn(),
      error: vitest_1.vi.fn(),
    },
  };
});
(0, vitest_1.describe)("BarcodeGenerator Component", function () {
  (0, vitest_1.beforeEach)(function () {
    vitest_1.vi.clearAllMocks();
  });
  (0, vitest_1.it)("renders generator interface correctly", function () {
    (0, react_2.render)(<barcode_generator_1.default />);
    (0, vitest_1.expect)(react_2.screen.getByText("Gerador de Códigos")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByLabelText("Item do Inventário")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("Gerar Códigos")).toBeInTheDocument();
  });
  (0, vitest_1.it)("pre-fills item ID when provided", function () {
    var testItemId = "test-item-123";
    (0, react_2.render)(<barcode_generator_1.default itemId={testItemId} />);
    var itemInput = react_2.screen.getByPlaceholderText("ID do item (UUID)");
    (0, vitest_1.expect)(itemInput.value).toBe(testItemId);
  });
  (0, vitest_1.it)("handles barcode type selection", function () {
    (0, react_2.render)(<barcode_generator_1.default />);
    var select = react_2.screen.getByRole("combobox");
    react_2.fireEvent.click(select);
    (0, vitest_1.expect)(react_2.screen.getByText("CODE128")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("EAN13")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("CODE39")).toBeInTheDocument();
  });
  (0, vitest_1.it)("toggles QR code inclusion", function () {
    (0, react_2.render)(<barcode_generator_1.default />);
    var qrSwitch = react_2.screen.getByRole("switch");
    (0, vitest_1.expect)(qrSwitch).not.toBeChecked();
    react_2.fireEvent.click(qrSwitch);
    (0, vitest_1.expect)(qrSwitch).toBeChecked();
  });
  (0, vitest_1.it)("validates required fields before generation", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var generateButton;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            (0, react_2.render)(<barcode_generator_1.default />);
            generateButton = react_2.screen.getByText("Gerar Códigos");
            react_2.fireEvent.click(generateButton);
            // Should show error for missing item ID
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(function () {
                var toast = require("sonner").toast;
                (0, vitest_1.expect)(toast.error).toHaveBeenCalledWith("Selecione um item");
              }),
            ];
          case 1:
            // Should show error for missing item ID
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  (0, vitest_1.it)("generates barcode with valid input", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockGenerate, useBarcodeGeneration, itemInput, generateButton;
      return __generator(this, function (_a) {
        mockGenerate = vitest_1.vi.fn();
        useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
        useBarcodeGeneration.mockReturnValue({
          generateBarcode: mockGenerate,
          isGenerating: false,
          error: null,
          data: null,
        });
        (0, react_2.render)(<barcode_generator_1.default />);
        itemInput = react_2.screen.getByPlaceholderText("ID do item (UUID)");
        react_2.fireEvent.change(itemInput, { target: { value: "test-item-123" } });
        generateButton = react_2.screen.getByText("Gerar Códigos");
        react_2.fireEvent.click(generateButton);
        (0, vitest_1.expect)(mockGenerate).toHaveBeenCalledWith({
          item_id: "test-item-123",
          barcode_type: "CODE128",
          include_qr: false,
          batch_number: "",
          expiration_date: "",
          location_id: "",
        });
        return [2 /*return*/];
      });
    });
  });
  (0, vitest_1.it)("displays generated barcode preview", function () {
    var mockData = {
      barcode: "1234567890123",
      barcode_type: "EAN13",
      qr_code: null,
      item_name: "Test Item",
      item_id: "test-item-123",
    };
    var useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vitest_1.vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData,
    });
    (0, react_2.render)(<barcode_generator_1.default />);
    (0, vitest_1.expect)(react_2.screen.getByText("Códigos Gerados")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("Test Item")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("1234567890123")).toBeInTheDocument();
  });
  (0, vitest_1.it)("handles generation errors", function () {
    var mockError = new Error("Generation failed");
    var useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vitest_1.vi.fn(),
      isGenerating: false,
      error: mockError,
      data: null,
    });
    (0, react_2.render)(<barcode_generator_1.default />);
    (0, vitest_1.expect)(react_2.screen.getByText("Generation failed")).toBeInTheDocument();
  });
  (0, vitest_1.it)("enables print functionality when barcode is generated", function () {
    var mockPrint = vitest_1.vi.fn();
    var mockData = {
      barcode: "1234567890123",
      barcode_type: "EAN13",
      item_name: "Test Item",
      item_id: "test-item-123",
    };
    var _a = require("@/app/hooks/use-barcode-scanner"),
      useBarcodeGeneration = _a.useBarcodeGeneration,
      useLabelPrinting = _a.useLabelPrinting;
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vitest_1.vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData,
    });
    useLabelPrinting.mockReturnValue({
      printLabel: mockPrint,
      isPrinting: false,
    });
    (0, react_2.render)(<barcode_generator_1.default />);
    var printButton = react_2.screen.getByText("Imprimir Etiqueta");
    react_2.fireEvent.click(printButton);
    (0, vitest_1.expect)(mockPrint).toHaveBeenCalled();
  });
  (0, vitest_1.it)("copies barcode to clipboard", function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var mockData, mockWriteText, useBarcodeGeneration, copyButton;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockData = {
              barcode: "1234567890123",
              barcode_type: "EAN13",
              item_name: "Test Item",
              item_id: "test-item-123",
            };
            mockWriteText = vitest_1.vi.fn().mockResolvedValue(undefined);
            Object.assign(navigator, {
              clipboard: {
                writeText: mockWriteText,
              },
            });
            useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
            useBarcodeGeneration.mockReturnValue({
              generateBarcode: vitest_1.vi.fn(),
              isGenerating: false,
              error: null,
              data: mockData,
            });
            (0, react_2.render)(<barcode_generator_1.default />);
            copyButton = react_2.screen.getByText("Copiar");
            react_2.fireEvent.click(copyButton);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(function () {
                (0, vitest_1.expect)(mockWriteText).toHaveBeenCalledWith("1234567890123");
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  (0, vitest_1.it)("calls onGenerated callback when barcode is created", function () {
    var onGenerated = vitest_1.vi.fn();
    var mockData = {
      barcode: "1234567890123",
      barcode_type: "EAN13",
      item_name: "Test Item",
      item_id: "test-item-123",
    };
    var useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: vitest_1.vi.fn(),
      isGenerating: false,
      error: null,
      data: mockData,
    });
    (0, react_2.render)(<barcode_generator_1.default onGenerated={onGenerated} />);
    (0, vitest_1.expect)(onGenerated).toHaveBeenCalledWith(mockData);
  });
  (0, vitest_1.it)("shows existing barcodes for item", function () {
    var existingBarcodes = [
      {
        barcode: "9876543210",
        barcode_type: "CODE128",
        qr_code: null,
        created_at: "2025-01-26T10:00:00Z",
      },
    ];
    var useBarcodeData = require("@/app/hooks/use-barcode-scanner").useBarcodeData;
    useBarcodeData.mockReturnValue({
      data: existingBarcodes,
      isLoading: false,
    });
    (0, react_2.render)(<barcode_generator_1.default itemId="test-item" />);
    (0, vitest_1.expect)(react_2.screen.getByText("Códigos Existentes")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("9876543210")).toBeInTheDocument();
  });
  (0, vitest_1.it)("warns about duplicate barcode types", function () {
    var existingBarcodes = [
      {
        barcode: "9876543210",
        barcode_type: "CODE128",
        qr_code: null,
        created_at: "2025-01-26T10:00:00Z",
      },
    ];
    var useBarcodeData = require("@/app/hooks/use-barcode-scanner").useBarcodeData;
    useBarcodeData.mockReturnValue({
      data: existingBarcodes,
      isLoading: false,
    });
    (0, react_2.render)(<barcode_generator_1.default itemId="test-item" />);
    // Should show warning about existing CODE128
    (0, vitest_1.expect)(
      react_2.screen.getByText(/Já existe um código CODE128/),
    ).toBeInTheDocument();
  });
  (0, vitest_1.it)("handles optional fields correctly", function () {
    var mockGenerate = vitest_1.vi.fn();
    var useBarcodeGeneration = require("@/app/hooks/use-barcode-scanner").useBarcodeGeneration;
    useBarcodeGeneration.mockReturnValue({
      generateBarcode: mockGenerate,
      isGenerating: false,
      error: null,
      data: null,
    });
    (0, react_2.render)(<barcode_generator_1.default />);
    // Fill in all fields including optional ones
    react_2.fireEvent.change(react_2.screen.getByPlaceholderText("ID do item (UUID)"), {
      target: { value: "test-item-123" },
    });
    react_2.fireEvent.change(react_2.screen.getByPlaceholderText("Ex: LOTE-2025-001"), {
      target: { value: "BATCH-001" },
    });
    react_2.fireEvent.change(react_2.screen.getByDisplayValue(""), {
      target: { value: "2025-12-31" },
    });
    var generateButton = react_2.screen.getByText("Gerar Códigos");
    react_2.fireEvent.click(generateButton);
    (0, vitest_1.expect)(mockGenerate).toHaveBeenCalledWith(
      vitest_1.expect.objectContaining({
        batch_number: "BATCH-001",
        expiration_date: "2025-12-31",
      }),
    );
  });
});
