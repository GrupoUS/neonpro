/**
 * Barcode Scanner Hook for NeonPro Inventory Management
 *
 * Provides barcode/QR code scanning functionality with healthcare compliance.
 * Supports multiple scanning methods and automatic validation.
 *
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
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
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBarcodeScanner = useBarcodeScanner;
var react_1 = require("react");
/**
 * Custom hook for barcode scanning with healthcare compliance
 *
 * Features:
 * - Multiple input methods (camera, keyboard, mobile scanner)
 * - Real-time barcode validation against inventory database
 * - ANVISA code verification
 * - Batch/lot number validation
 * - Expiration date checking
 * - Product existence verification
 * - Scan history tracking
 * - Audio/haptic feedback
 *
 * @param config Scanner configuration options
 * @param callbacks Event callbacks for scan results
 * @returns Scanner state and control functions
 */
function useBarcodeScanner(config, callbacks) {
  if (config === void 0) {
    config = {};
  }
  var defaultConfig = __assign(
    {
      enableCamera: true,
      enableKeyboard: true,
      enableMobile: true,
      soundEnabled: true,
      vibrationEnabled: true,
      continuousScanning: false,
    },
    config,
  );
  var _a = (0, react_1.useState)({
      isScanning: false,
      isInitialized: false,
      error: null,
      lastScanResult: null,
      scanHistory: [],
      cameraPermission: null,
    }),
    state = _a[0],
    setState = _a[1];
  var videoRef = (0, react_1.useRef)(null);
  var streamRef = (0, react_1.useRef)(null);
  var scannerWorkerRef = (0, react_1.useRef)(null);
  var keyboardBufferRef = (0, react_1.useRef)("");
  var keyboardTimeoutRef = (0, react_1.useRef)();
  // Initialize scanner on mount
  (0, react_1.useEffect)(() => {
    initializeScanner();
    return () => cleanup();
  }, []);
  // Keyboard input handler
  (0, react_1.useEffect)(() => {
    if (!defaultConfig.enableKeyboard) return;
    var handleKeyDown = (event) => {
      if (state.isScanning && !event.ctrlKey && !event.altKey && !event.metaKey) {
        handleKeyboardInput(event);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.isScanning, defaultConfig.enableKeyboard]);
  /**
   * Initialize the barcode scanner
   */
  var initializeScanner = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var permissionStatus_1, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              if (!defaultConfig.enableCamera) return [3 /*break*/, 2];
              return [4 /*yield*/, checkCameraPermission()];
            case 1:
              permissionStatus_1 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), { cameraPermission: permissionStatus_1 }),
              );
              _a.label = 2;
            case 2:
              // Initialize barcode scanning worker
              if (typeof Worker !== "undefined") {
                try {
                  // In a real implementation, this would use a barcode scanning library like QuaggaJS or ZXing
                  // For now, we'll simulate the worker initialization
                  scannerWorkerRef.current = new Worker("/workers/barcode-scanner.js");
                  scannerWorkerRef.current.onmessage = handleWorkerMessage;
                } catch (error) {
                  console.warn("Barcode scanner worker not available:", error);
                }
              }
              setState((prev) =>
                __assign(__assign({}, prev), { isInitialized: true, error: null }),
              );
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: "Scanner initialization failed: ".concat(
                    error_1 instanceof Error ? error_1.message : "Unknown error",
                  ),
                  isInitialized: false,
                }),
              );
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [defaultConfig.enableCamera],
  );
  /**
   * Check camera permission status
   */
  var checkCameraPermission = () =>
    __awaiter(this, void 0, void 0, function () {
      var permission, _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            if (!("permissions" in navigator)) return [3 /*break*/, 2];
            return [4 /*yield*/, navigator.permissions.query({ name: "camera" })];
          case 1:
            permission = _b.sent();
            return [2 /*return*/, permission.state];
          case 2:
            return [2 /*return*/, "prompt"];
          case 3:
            _a = _b.sent();
            return [2 /*return*/, "prompt"];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  /**
   * Start camera scanning
   */
  var startCameraScanning = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var stream, error_2, errorMessage_1;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              if (!defaultConfig.enableCamera || !videoRef.current) return [2 /*return*/];
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                navigator.mediaDevices.getUserMedia({
                  video: {
                    facingMode: "environment", // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  },
                }),
              ];
            case 2:
              stream = _b.sent();
              streamRef.current = stream;
              videoRef.current.srcObject = stream;
              setState((prev) =>
                __assign(__assign({}, prev), {
                  isScanning: true,
                  error: null,
                  cameraPermission: "granted",
                }),
              );
              // Start the scanning process
              if (scannerWorkerRef.current) {
                scannerWorkerRef.current.postMessage({ command: "start", stream: stream });
              }
              return [3 /*break*/, 4];
            case 3:
              error_2 = _b.sent();
              errorMessage_1 = error_2 instanceof Error ? error_2.message : "Camera access failed";
              setState((prev) =>
                __assign(__assign({}, prev), {
                  error: errorMessage_1,
                  cameraPermission: "denied",
                }),
              );
              (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onScanError) ===
                null || _a === void 0
                ? void 0
                : _a.call(callbacks, errorMessage_1);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [defaultConfig.enableCamera, callbacks],
  );
  /**
   * Stop camera scanning
   */
  var stopCameraScanning = (0, react_1.useCallback)(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (scannerWorkerRef.current) {
      scannerWorkerRef.current.postMessage({ command: "stop" });
    }
    setState((prev) => __assign(__assign({}, prev), { isScanning: false }));
  }, []);
  /**
   * Handle keyboard input for barcode scanning
   */
  var handleKeyboardInput = (0, react_1.useCallback)((event) => {
    var key = event.key;
    // Clear timeout on new input
    if (keyboardTimeoutRef.current) {
      clearTimeout(keyboardTimeoutRef.current);
    }
    if (key === "Enter") {
      // Process the accumulated barcode
      var barcode = keyboardBufferRef.current.trim();
      if (barcode.length > 0) {
        processBarcodeInput(barcode, "keyboard");
        keyboardBufferRef.current = "";
      }
    } else if (key.length === 1 && /[0-9A-Za-z]/.test(key)) {
      // Accumulate barcode characters
      keyboardBufferRef.current += key;
      // Set timeout to auto-process if no Enter key
      keyboardTimeoutRef.current = setTimeout(() => {
        var barcode = keyboardBufferRef.current.trim();
        if (barcode.length >= 8) {
          // Minimum barcode length
          processBarcodeInput(barcode, "keyboard");
          keyboardBufferRef.current = "";
        }
      }, 100); // 100ms timeout for barcode scanners
    }
  }, []);
  /**
   * Process barcode input from any source
   */
  var processBarcodeInput = (0, react_1.useCallback)(
    (rawData_1) => {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        this,
        __spreadArray([rawData_1], args_1, true),
        void 0,
        function (rawData, source) {
          var parsedData, scanResult_1, error_3, errorMessage_2;
          var _a, _b;
          if (source === void 0) {
            source = "keyboard";
          }
          return __generator(this, (_c) => {
            switch (_c.label) {
              case 0:
                _c.trys.push([0, 3, , 4]);
                parsedData = parseBarcodeData(rawData);
                scanResult_1 = {
                  success: true,
                  format: detectBarcodeFormat(rawData),
                  rawData: rawData,
                  parsedData: parsedData,
                  confidence: source === "camera" ? 0.95 : 1.0, // Camera scanning might have confidence < 1
                  timestamp: new Date().toISOString(),
                  deviceId: getDeviceId(),
                  userId: getCurrentUserId(),
                  validation: {
                    productExists: false,
                    batchValid: false,
                    notExpired: false,
                    anvisaValid: false,
                    errors: [],
                    warnings: [],
                  },
                };
                if (!(defaultConfig.validationEndpoint && parsedData)) return [3 /*break*/, 2];
                return [4 /*yield*/, validateBarcodeData(scanResult_1)];
              case 1:
                _c.sent();
                _c.label = 2;
              case 2:
                // Update state
                setState((prev) =>
                  __assign(__assign({}, prev), {
                    lastScanResult: scanResult_1,
                    scanHistory: __spreadArray(
                      __spreadArray([], prev.scanHistory.slice(-49), true),
                      [scanResult_1],
                      false,
                    ),
                  }),
                );
                // Provide feedback
                if (scanResult_1.success) {
                  playSuccessSound();
                  triggerHapticFeedback();
                  (_a =
                    callbacks === null || callbacks === void 0
                      ? void 0
                      : callbacks.onScanSuccess) === null || _a === void 0
                    ? void 0
                    : _a.call(callbacks, scanResult_1);
                }
                // Continue scanning if enabled
                if (!defaultConfig.continuousScanning && source === "camera") {
                  stopCameraScanning();
                }
                return [3 /*break*/, 4];
              case 3:
                error_3 = _c.sent();
                errorMessage_2 =
                  error_3 instanceof Error ? error_3.message : "Scan processing failed";
                setState((prev) => __assign(__assign({}, prev), { error: errorMessage_2 }));
                (_b =
                  callbacks === null || callbacks === void 0 ? void 0 : callbacks.onScanError) ===
                  null || _b === void 0
                  ? void 0
                  : _b.call(callbacks, errorMessage_2);
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [defaultConfig.validationEndpoint, defaultConfig.continuousScanning, callbacks],
  );
  /**
   * Parse barcode data into structured format
   */
  var parseBarcodeData = (rawData) => {
    // This is a simplified parser - in a real implementation, you'd handle multiple formats
    // Try to parse as product barcode with batch info
    var productMatch = rawData.match(/^(\w+)(?:-(\w+))?(?:-(\d{6}))?/);
    if (productMatch) {
      return {
        productId: productMatch[1],
        batchNumber: productMatch[2],
        expirationDate: productMatch[3]
          ? "20"
              .concat(productMatch[3].slice(0, 2), "-")
              .concat(productMatch[3].slice(2, 4), "-")
              .concat(productMatch[3].slice(4, 6))
          : undefined,
      };
    }
    // Try to parse as GTIN
    if (/^\d{13,14}$/.test(rawData)) {
      return {
        gtin: rawData,
        productId: rawData, // Would be resolved via API
      };
    }
    // Return raw data if no specific format detected
    return {
      productId: rawData,
    };
  };
  /**
   * Detect barcode format from raw data
   */
  var detectBarcodeFormat = (rawData) => {
    if (/^\d{13}$/.test(rawData)) return "EAN13";
    if (/^[\w\s\-.$/+%]+$/.test(rawData)) return "CODE128";
    if (rawData.includes("{") || rawData.includes("http")) return "QR_CODE";
    return "CODE128"; // Default
  };
  /**
   * Validate barcode data against inventory database
   */
  var validateBarcodeData = (scanResult) =>
    __awaiter(this, void 0, void 0, function () {
      var response, validation, error_4;
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            if (!defaultConfig.validationEndpoint || !scanResult.parsedData) return [2 /*return*/];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              fetch(defaultConfig.validationEndpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  barcodeData: scanResult.parsedData,
                  timestamp: scanResult.timestamp,
                }),
              }),
            ];
          case 2:
            response = _b.sent();
            return [
              4 /*yield*/,
              response.json(),
              // Update scan result with validation
            ];
          case 3:
            validation = _b.sent();
            // Update scan result with validation
            scanResult.validation = {
              productExists: validation.productExists || false,
              batchValid: validation.batchValid || false,
              notExpired: validation.notExpired || false,
              anvisaValid: validation.anvisaValid || false,
              errors: validation.errors || [],
              warnings: validation.warnings || [],
            };
            (_a =
              callbacks === null || callbacks === void 0
                ? void 0
                : callbacks.onValidationComplete) === null || _a === void 0
              ? void 0
              : _a.call(callbacks, scanResult);
            return [3 /*break*/, 5];
          case 4:
            error_4 = _b.sent();
            scanResult.validation.errors.push("Validation service unavailable");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  /**
   * Handle messages from barcode scanner worker
   */
  var handleWorkerMessage = (0, react_1.useCallback)(
    (event) => {
      var _a;
      var _b = event.data,
        type = _b.type,
        data = _b.data;
      switch (type) {
        case "barcode_detected":
          processBarcodeInput(data.code, "camera");
          break;
        case "error":
          setState((prev) => __assign(__assign({}, prev), { error: data.message }));
          (_a = callbacks === null || callbacks === void 0 ? void 0 : callbacks.onScanError) ===
            null || _a === void 0
            ? void 0
            : _a.call(callbacks, data.message);
          break;
      }
    },
    [processBarcodeInput, callbacks],
  );
  /**
   * Play success sound
   */
  var playSuccessSound = () => {
    if (!defaultConfig.soundEnabled) return;
    try {
      var audio = new Audio("/sounds/barcode-scan-success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Audio play failed - likely due to browser restrictions
      });
    } catch (_a) {
      // Audio not supported
    }
  };
  /**
   * Trigger haptic feedback on mobile devices
   */
  var triggerHapticFeedback = () => {
    if (!defaultConfig.vibrationEnabled) return;
    try {
      if ("vibrate" in navigator) {
        navigator.vibrate(100); // 100ms vibration
      }
    } catch (_a) {
      // Vibration not supported
    }
  };
  /**
   * Get device ID for audit trail
   */
  var getDeviceId = () => {
    // In a real implementation, this would generate or retrieve a persistent device ID
    return localStorage.getItem("neonpro-device-id") || "unknown-device";
  };
  /**
   * Get current user ID
   */
  var getCurrentUserId = () => {
    // In a real implementation, this would get the current authenticated user
    return localStorage.getItem("neonpro-user-id") || "anonymous";
  };
  /**
   * Manual barcode input for testing or manual entry
   */
  var manualScan = (0, react_1.useCallback)(
    (barcode) => {
      processBarcodeInput(barcode, "keyboard");
    },
    [processBarcodeInput],
  );
  /**
   * Clear scan history
   */
  var clearHistory = (0, react_1.useCallback)(() => {
    setState((prev) => __assign(__assign({}, prev), { scanHistory: [], lastScanResult: null }));
  }, []);
  /**
   * Cleanup function
   */
  var cleanup = (0, react_1.useCallback)(() => {
    stopCameraScanning();
    if (scannerWorkerRef.current) {
      scannerWorkerRef.current.terminate();
      scannerWorkerRef.current = null;
    }
    if (keyboardTimeoutRef.current) {
      clearTimeout(keyboardTimeoutRef.current);
    }
  }, [stopCameraScanning]);
  return __assign(__assign({}, state), {
    // Configuration
    config: defaultConfig,
    // Camera controls
    startCameraScanning: startCameraScanning,
    stopCameraScanning: stopCameraScanning,
    videoRef: videoRef,
    // Manual controls
    manualScan: manualScan,
    clearHistory: clearHistory,
    // Utilities
    cleanup: cleanup,
    reinitialize: initializeScanner,
  });
}
