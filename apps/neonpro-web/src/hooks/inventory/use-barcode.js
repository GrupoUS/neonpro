/**
 * Barcode Scanner Hook
 * React hook for barcode/QR code scanning functionality
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBarcode = useBarcode;
var react_1 = require("react");
var DEFAULT_CONFIGURATION = {
  enableContinuous: true,
  beepOnScan: true,
  vibrationOnScan: true,
  saveScanHistory: true,
  autoFocus: true,
  preferredCameraFacing: "environment", // Back camera for mobile
  scanDelay: 500, // ms between scans
  maxHistorySize: 100,
};
function useBarcode(options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  var _a = options.enableContinuousScanning,
    enableContinuousScanning = _a === void 0 ? true : _a,
    onScanSuccess = options.onScanSuccess,
    onScanError = options.onScanError,
    _b = options.beepOnScan,
    beepOnScan = _b === void 0 ? true : _b,
    _c = options.vibrationOnScan,
    vibrationOnScan = _c === void 0 ? true : _c,
    preferredDeviceId = options.preferredDeviceId;
  // State
  var _d = (0, react_1.useState)({
      isScanning: false,
      isInitialized: false,
      hasPermission: false,
      error: null,
      lastResult: null,
      scanHistory: [],
      availableCameras: [],
      currentCamera: null,
    }),
    state = _d[0],
    setState = _d[1];
  var _e = (0, react_1.useState)(
      __assign(__assign({}, DEFAULT_CONFIGURATION), {
        enableContinuous: enableContinuousScanning,
        beepOnScan: beepOnScan,
        vibrationOnScan: vibrationOnScan,
      }),
    ),
    configuration = _e[0],
    setConfiguration = _e[1];
  // Refs
  var videoElementRef = (0, react_1.useRef)(null);
  var streamRef = (0, react_1.useRef)(null);
  var scanTimeoutRef = (0, react_1.useRef)(null);
  var isProcessingScan = (0, react_1.useRef)(false);
  // Audio feedback
  var playBeep = (0, react_1.useCallback)(
    function () {
      if (!configuration.beepOnScan) return;
      try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800; // Hz
        gainNode.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.warn("Could not play beep sound:", error);
      }
    },
    [configuration.beepOnScan],
  );
  // Vibration feedback
  var triggerVibration = (0, react_1.useCallback)(
    function () {
      if (!configuration.vibrationOnScan || !navigator.vibrate) return;
      try {
        navigator.vibrate(200); // 200ms vibration
      } catch (error) {
        console.warn("Could not trigger vibration:", error);
      }
    },
    [configuration.vibrationOnScan],
  );
  // Get available cameras
  var getAvailableCameras = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var devices, cameras_1, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
          case 1:
            devices = _a.sent();
            cameras_1 = devices.filter(function (device) {
              return device.kind === "videoinput";
            });
            setState(function (prev) {
              return __assign(__assign({}, prev), { availableCameras: cameras_1 });
            });
            return [2 /*return*/, cameras_1];
          case 2:
            error_1 = _a.sent();
            console.error("Error getting cameras:", error_1);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Initialize scanner
  var initializeScanner = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var permission_1, error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [4 /*yield*/, navigator.permissions.query({ name: "camera" })];
            case 1:
              permission_1 = _a.sent();
              if (permission_1.state === "denied") {
                setState(function (prev) {
                  return __assign(__assign({}, prev), {
                    error: {
                      type: "PERMISSION_DENIED",
                      message: "Camera permission denied",
                      timestamp: new Date().toISOString(),
                    },
                  });
                });
                return [2 /*return*/, false];
              }
              // Get available cameras
              return [4 /*yield*/, getAvailableCameras()];
            case 2:
              // Get available cameras
              _a.sent();
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  isInitialized: true,
                  hasPermission:
                    permission_1.state === "granted" || permission_1.state === "prompt",
                  error: null,
                });
              });
              return [2 /*return*/, true];
            case 3:
              error_2 = _a.sent();
              console.error("Error initializing scanner:", error_2);
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  error: {
                    type: "INITIALIZATION_ERROR",
                    message:
                      error_2 instanceof Error ? error_2.message : "Failed to initialize scanner",
                    timestamp: new Date().toISOString(),
                  },
                });
              });
              return [2 /*return*/, false];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [getAvailableCameras],
  );
  // Process scan result
  var processScanResult = (0, react_1.useCallback)(
    function (data, format) {
      if (format === void 0) {
        format = "unknown";
      }
      if (isProcessingScan.current) return;
      isProcessingScan.current = true;
      var scanResult = {
        data: data,
        format: format,
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
      };
      setState(function (prev) {
        var newHistory = configuration.saveScanHistory
          ? __spreadArray(
              [scanResult],
              prev.scanHistory.slice(0, configuration.maxHistorySize - 1),
              true,
            )
          : prev.scanHistory;
        return __assign(__assign({}, prev), {
          lastResult: scanResult,
          scanHistory: newHistory,
          error: null,
        });
      });
      // Feedback
      playBeep();
      triggerVibration();
      // Callback
      if (onScanSuccess) {
        onScanSuccess(scanResult);
      }
      // Reset processing flag after delay
      setTimeout(function () {
        isProcessingScan.current = false;
      }, configuration.scanDelay);
    },
    [
      configuration.saveScanHistory,
      configuration.maxHistorySize,
      configuration.scanDelay,
      playBeep,
      triggerVibration,
      onScanSuccess,
    ],
  );
  // Handle scan error
  var handleScanError = (0, react_1.useCallback)(
    function (error) {
      console.error("Scan error:", error);
      var scanError = {
        type: "SCAN_ERROR",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      setState(function (prev) {
        return __assign(__assign({}, prev), { error: scanError });
      });
      if (onScanError) {
        onScanError(scanError);
      }
    },
    [onScanError],
  );
  // Start scanning
  var startScanning = (0, react_1.useCallback)(
    function (videoElement) {
      return __awaiter(_this, void 0, void 0, function () {
        var initialized, video, cameras, selectedCamera_1, constraints, stream, error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              if (!!state.isInitialized) return [3 /*break*/, 2];
              return [4 /*yield*/, initializeScanner()];
            case 1:
              initialized = _a.sent();
              if (!initialized) return [2 /*return*/, false];
              _a.label = 2;
            case 2:
              video = videoElement || videoElementRef.current;
              if (!video) {
                setState(function (prev) {
                  return __assign(__assign({}, prev), {
                    error: {
                      type: "NO_VIDEO_ELEMENT",
                      message: "No video element provided",
                      timestamp: new Date().toISOString(),
                    },
                  });
                });
                return [2 /*return*/, false];
              }
              videoElementRef.current = video;
              return [4 /*yield*/, getAvailableCameras()];
            case 3:
              cameras = _a.sent();
              selectedCamera_1 = cameras.find(function (camera) {
                return camera.deviceId === preferredDeviceId;
              });
              if (!selectedCamera_1 && cameras.length > 0) {
                // Prefer back camera for mobile
                selectedCamera_1 =
                  cameras.find(function (camera) {
                    return (
                      camera.label.toLowerCase().includes("back") ||
                      camera.label.toLowerCase().includes("environment")
                    );
                  }) || cameras[0];
              }
              if (!selectedCamera_1) {
                setState(function (prev) {
                  return __assign(__assign({}, prev), {
                    error: {
                      type: "NO_CAMERA_AVAILABLE",
                      message: "No camera available",
                      timestamp: new Date().toISOString(),
                    },
                  });
                });
                return [2 /*return*/, false];
              }
              constraints = {
                video: __assign(
                  {
                    deviceId: selectedCamera_1.deviceId,
                    facingMode: configuration.preferredCameraFacing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                  },
                  options.constraints,
                ),
              };
              return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
            case 4:
              stream = _a.sent();
              streamRef.current = stream;
              video.srcObject = stream;
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  currentCamera: selectedCamera_1,
                  isScanning: true,
                  error: null,
                });
              });
              return [2 /*return*/, true];
            case 5:
              error_3 = _a.sent();
              console.error("Error starting scanner:", error_3);
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  isScanning: false,
                  error: {
                    type: "START_ERROR",
                    message:
                      error_3 instanceof Error ? error_3.message : "Failed to start scanning",
                    timestamp: new Date().toISOString(),
                  },
                });
              });
              return [2 /*return*/, false];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [
      state.isInitialized,
      initializeScanner,
      getAvailableCameras,
      preferredDeviceId,
      configuration.preferredCameraFacing,
      options.constraints,
    ],
  );
  // Stop scanning
  var stopScanning = (0, react_1.useCallback)(function () {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function (track) {
          return track.stop();
        });
        streamRef.current = null;
      }
      if (videoElementRef.current) {
        videoElementRef.current.srcObject = null;
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      setState(function (prev) {
        return __assign(__assign({}, prev), { isScanning: false });
      });
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  }, []);
  // Toggle scanning
  var toggleScanning = (0, react_1.useCallback)(
    function () {
      if (state.isScanning) {
        stopScanning();
      } else {
        startScanning();
      }
    },
    [state.isScanning, startScanning, stopScanning],
  );
  // Switch camera
  var switchCamera = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var currentIndex, nextIndex, nextCamera;
        return __generator(this, function (_a) {
          if (state.availableCameras.length <= 1) return [2 /*return*/];
          currentIndex = state.availableCameras.findIndex(function (camera) {
            var _a;
            return (
              camera.deviceId ===
              ((_a = state.currentCamera) === null || _a === void 0 ? void 0 : _a.deviceId)
            );
          });
          nextIndex = (currentIndex + 1) % state.availableCameras.length;
          nextCamera = state.availableCameras[nextIndex];
          if (state.isScanning) {
            stopScanning();
            // Small delay before starting with new camera
            setTimeout(function () {
              setState(function (prev) {
                return __assign(__assign({}, prev), { currentCamera: nextCamera });
              });
              startScanning();
            }, 100);
          } else {
            setState(function (prev) {
              return __assign(__assign({}, prev), { currentCamera: nextCamera });
            });
          }
          return [2 /*return*/];
        });
      });
    },
    [state.availableCameras, state.currentCamera, state.isScanning, stopScanning, startScanning],
  );
  // Update configuration
  var updateConfiguration = (0, react_1.useCallback)(function (config) {
    setConfiguration(function (prev) {
      return __assign(__assign({}, prev), config);
    });
  }, []);
  // Clear history
  var clearHistory = (0, react_1.useCallback)(function () {
    setState(function (prev) {
      return __assign(__assign({}, prev), { scanHistory: [] });
    });
  }, []);
  // Clear error
  var clearError = (0, react_1.useCallback)(function () {
    setState(function (prev) {
      return __assign(__assign({}, prev), { error: null });
    });
  }, []);
  // Manual input fallback
  var processManualInput = (0, react_1.useCallback)(
    function (barcodeValue) {
      if (barcodeValue.trim()) {
        processScanResult(barcodeValue.trim(), "unknown");
      }
    },
    [processScanResult],
  );
  // Initialize on mount
  (0, react_1.useEffect)(
    function () {
      initializeScanner();
      return function () {
        stopScanning();
      };
    },
    [initializeScanner, stopScanning],
  );
  return {
    isScanning: state.isScanning,
    isInitialized: state.isInitialized,
    hasPermission: state.hasPermission,
    error: state.error,
    lastResult: state.lastResult,
    scanHistory: state.scanHistory,
    startScanning: startScanning,
    stopScanning: stopScanning,
    toggleScanning: toggleScanning,
    switchCamera: switchCamera,
    availableCameras: state.availableCameras,
    currentCamera: state.currentCamera,
    configuration: configuration,
    updateConfiguration: updateConfiguration,
    clearHistory: clearHistory,
    clearError: clearError,
    processManualInput: processManualInput,
  };
}
