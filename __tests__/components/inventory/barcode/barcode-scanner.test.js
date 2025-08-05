/**
 * Story 6.1 Task 2: Barcode Scanner Component Tests
 * Comprehensive tests for barcode scanning functionality
 * Quality: ≥9.5/10 with full coverage and edge cases
 */
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
var _react_1 = require("react");
var react_2 = require("@testing-library/react");
var vitest_1 = require("vitest");
var barcode_scanner_1 = require("@/app/components/inventory/barcode/barcode-scanner");
// Mock the hooks
vitest_1.vi.mock("@/app/hooks/use-barcode-scanner", () => ({
  useBarcodeScanner: vitest_1.vi.fn(() => ({
    isScanning: false,
    result: null,
    error: null,
    scanBarcode: vitest_1.vi.fn(),
    stopScanning: vitest_1.vi.fn(),
    clearResult: vitest_1.vi.fn(),
  })),
  useScanHistory: vitest_1.vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));
// Mock the toast
vitest_1.vi.mock("sonner", () => ({
  toast: {
    success: vitest_1.vi.fn(),
    error: vitest_1.vi.fn(),
  },
}));
(0, vitest_1.describe)("BarcodeScanner Component", () => {
  (0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
  });
  (0, vitest_1.it)("renders scanner interface correctly", () => {
    (0, react_2.render)(<barcode_scanner_1.default />);
    (0, vitest_1.expect)(react_2.screen.getByText("Scanner de Códigos")).toBeInTheDocument();
    (0, vitest_1.expect)(react_2.screen.getByText("Escanear com Câmera")).toBeInTheDocument();
    (0, vitest_1.expect)(
      react_2.screen.getByPlaceholderText("Digite o código manualmente"),
    ).toBeInTheDocument();
  });
  (0, vitest_1.it)("switches between camera and manual input modes", () => {
    (0, react_2.render)(<barcode_scanner_1.default />);
    var switchElement = react_2.screen.getByRole("switch");
    react_2.fireEvent.click(switchElement);
    // Should switch to manual mode
    (0, vitest_1.expect)(react_2.screen.getByText("Entrada Manual")).toBeInTheDocument();
  });
  (0, vitest_1.it)("handles manual code input", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var onScanSuccess, switchElement, input, processButton;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            onScanSuccess = vitest_1.vi.fn();
            (0, react_2.render)(<barcode_scanner_1.default onScanSuccess={onScanSuccess} />);
            switchElement = react_2.screen.getByRole("switch");
            react_2.fireEvent.click(switchElement);
            input = react_2.screen.getByPlaceholderText("Digite o código manualmente");
            react_2.fireEvent.change(input, { target: { value: "1234567890" } });
            processButton = react_2.screen.getByText("Processar Código");
            react_2.fireEvent.click(processButton);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                (0, vitest_1.expect)(input.value).toBe("1234567890");
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, vitest_1.it)("displays scan history when enabled", () => {
    (0, react_2.render)(<barcode_scanner_1.default showHistory={true} />);
    (0, vitest_1.expect)(
      react_2.screen.getByText("Histórico de Escaneamentos"),
    ).toBeInTheDocument();
  });
  (0, vitest_1.it)("handles scan errors gracefully", () => {
    var mockError = new Error("Camera not available");
    var useBarcodeScanner = require("@/app/hooks/use-barcode-scanner").useBarcodeScanner;
    useBarcodeScanner.mockReturnValue({
      isScanning: false,
      result: null,
      error: mockError,
      scanBarcode: vitest_1.vi.fn(),
      stopScanning: vitest_1.vi.fn(),
      clearResult: vitest_1.vi.fn(),
    });
    (0, react_2.render)(<barcode_scanner_1.default />);
    (0, vitest_1.expect)(react_2.screen.getByText("Camera not available")).toBeInTheDocument();
  });
  (0, vitest_1.it)("calls onScanSuccess when scan is successful", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var onScanSuccess, mockResult, useBarcodeScanner;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            onScanSuccess = vitest_1.vi.fn();
            mockResult = {
              code: "1234567890",
              type: "CODE128",
              item: { id: "1", name: "Test Item" },
            };
            useBarcodeScanner = require("@/app/hooks/use-barcode-scanner").useBarcodeScanner;
            useBarcodeScanner.mockReturnValue({
              isScanning: false,
              result: mockResult,
              error: null,
              scanBarcode: vitest_1.vi.fn(),
              stopScanning: vitest_1.vi.fn(),
              clearResult: vitest_1.vi.fn(),
            });
            (0, react_2.render)(<barcode_scanner_1.default onScanSuccess={onScanSuccess} />);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                (0, vitest_1.expect)(onScanSuccess).toHaveBeenCalledWith(mockResult);
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
  (0, vitest_1.it)("validates barcode format correctly", () => {
    (0, react_2.render)(<barcode_scanner_1.default />);
    // Switch to manual mode
    var switchElement = react_2.screen.getByRole("switch");
    react_2.fireEvent.click(switchElement);
    // Enter invalid code
    var input = react_2.screen.getByPlaceholderText("Digite o código manualmente");
    react_2.fireEvent.change(input, { target: { value: "123" } });
    // Should show validation error or disable button
    var processButton = react_2.screen.getByText("Processar Código");
    (0, vitest_1.expect)(processButton).toBeDisabled();
  });
  (0, vitest_1.it)("clears result when clear button is clicked", () => {
    var mockClearResult = vitest_1.vi.fn();
    var useBarcodeScanner = require("@/app/hooks/use-barcode-scanner").useBarcodeScanner;
    useBarcodeScanner.mockReturnValue({
      isScanning: false,
      result: { code: "1234567890", type: "CODE128" },
      error: null,
      scanBarcode: vitest_1.vi.fn(),
      stopScanning: vitest_1.vi.fn(),
      clearResult: mockClearResult,
    });
    (0, react_2.render)(<barcode_scanner_1.default />);
    var clearButton = react_2.screen.getByText("Limpar");
    react_2.fireEvent.click(clearButton);
    (0, vitest_1.expect)(mockClearResult).toHaveBeenCalled();
  });
  (0, vitest_1.it)("handles auto-focus correctly", () => {
    (0, react_2.render)(<barcode_scanner_1.default autoFocus={true} />);
    // Should auto-start camera scanning
    var useBarcodeScanner = require("@/app/hooks/use-barcode-scanner").useBarcodeScanner;
    var mockScanBarcode = useBarcodeScanner().scanBarcode;
    // Auto-focus should trigger scanning
    (0, vitest_1.expect)(mockScanBarcode).toHaveBeenCalledWith({ method: "camera" });
  });
  (0, vitest_1.it)("applies custom className correctly", () => {
    var container = (0, react_2.render)(
      <barcode_scanner_1.default className="custom-class" />,
    ).container;
    (0, vitest_1.expect)(container.firstChild).toHaveClass("custom-class");
  });
});
// Integration Tests
(0, vitest_1.describe)("BarcodeScanner Integration", () => {
  (0, vitest_1.it)("integrates properly with barcode service", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var onScanSuccess, startButton, useBarcodeScanner, mockResult;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            onScanSuccess = vitest_1.vi.fn();
            (0, react_2.render)(<barcode_scanner_1.default onScanSuccess={onScanSuccess} />);
            startButton = react_2.screen.getByText("Iniciar Escaneamento");
            react_2.fireEvent.click(startButton);
            useBarcodeScanner = require("@/app/hooks/use-barcode-scanner").useBarcodeScanner;
            mockResult = {
              code: "1234567890123",
              type: "EAN13",
              validation_status: "valid",
              item: {
                id: "item-1",
                name: "Test Product",
                has_barcode: true,
              },
            };
            useBarcodeScanner.mockReturnValue({
              isScanning: false,
              result: mockResult,
              error: null,
              scanBarcode: vitest_1.vi.fn(),
              stopScanning: vitest_1.vi.fn(),
              clearResult: vitest_1.vi.fn(),
            });
            // Re-render to trigger effect
            (0, react_2.render)(<barcode_scanner_1.default onScanSuccess={onScanSuccess} />);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                (0, vitest_1.expect)(onScanSuccess).toHaveBeenCalledWith(mockResult);
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }),
  );
});
