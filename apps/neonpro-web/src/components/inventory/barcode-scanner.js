/**
 * Barcode Scanner Component
 * Real-time barcode/QR code scanner with manual input fallback
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */
"use client";
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
exports.BarcodeScanner = BarcodeScanner;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var use_barcode_1 = require("@/hooks/inventory/use-barcode");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function BarcodeScanner(_a) {
    var _this = this;
    var onScan = _a.onScan, onError = _a.onError, _b = _a.continuous, continuous = _b === void 0 ? true : _b, _c = _a.showHistory, showHistory = _c === void 0 ? true : _c, _d = _a.showManualInput, showManualInput = _d === void 0 ? true : _d, _e = _a.autoStart, autoStart = _e === void 0 ? false : _e, _f = _a.className, className = _f === void 0 ? "" : _f, style = _a.style, _g = _a.beepOnScan, beepOnScan = _g === void 0 ? true : _g, _h = _a.vibrationOnScan, vibrationOnScan = _h === void 0 ? true : _h, _j = _a.preferredCameraFacing, preferredCameraFacing = _j === void 0 ? "environment" : _j, _k = _a.height, height = _k === void 0 ? 300 : _k, _l = _a.width, width = _l === void 0 ? 400 : _l, _m = _a.borderRadius, borderRadius = _m === void 0 ? 8 : _m, _o = _a.showControls, showControls = _o === void 0 ? true : _o, _p = _a.showPreview, showPreview = _p === void 0 ? true : _p;
    var videoRef = (0, react_1.useRef)(null);
    var _q = (0, react_1.useState)(""), manualInput = _q[0], setManualInput = _q[1];
    var _r = (0, react_1.useState)(false), showManualEntry = _r[0], setShowManualEntry = _r[1];
    var _s = (0, react_1.useState)(false), flashlightOn = _s[0], setFlashlightOn = _s[1];
    var _t = (0, use_barcode_1.useBarcode)({
        enableContinuousScanning: continuous,
        onScanSuccess: onScan,
        onScanError: onError,
        beepOnScan: beepOnScan,
        vibrationOnScan: vibrationOnScan,
    }), isScanning = _t.isScanning, isInitialized = _t.isInitialized, hasPermission = _t.hasPermission, error = _t.error, lastResult = _t.lastResult, scanHistory = _t.scanHistory, startScanning = _t.startScanning, stopScanning = _t.stopScanning, toggleScanning = _t.toggleScanning, switchCamera = _t.switchCamera, availableCameras = _t.availableCameras, currentCamera = _t.currentCamera, configuration = _t.configuration, updateConfiguration = _t.updateConfiguration, clearHistory = _t.clearHistory, clearError = _t.clearError, processManualInput = _t.processManualInput;
    // Initialize scanner configuration
    (0, react_1.useEffect)(function () {
        updateConfiguration({
            preferredCameraFacing: preferredCameraFacing,
        });
    }, [preferredCameraFacing, updateConfiguration]);
    // Auto-start scanner
    (0, react_1.useEffect)(function () {
        if (autoStart && isInitialized && hasPermission && videoRef.current) {
            startScanning(videoRef.current);
        }
    }, [autoStart, isInitialized, hasPermission, startScanning]);
    // Handle manual input submission
    var handleManualSubmit = function () {
        if (manualInput.trim()) {
            processManualInput(manualInput.trim());
            setManualInput("");
            setShowManualEntry(false);
        }
    };
    // Handle flashlight toggle
    var toggleFlashlight = function () { return __awaiter(_this, void 0, void 0, function () {
        var stream, track, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(isScanning && ((_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.srcObject))) return [3 /*break*/, 4];
                    stream = videoRef.current.srcObject;
                    track = stream.getVideoTracks()[0];
                    if (!(track && "torch" in track.getCapabilities())) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, track.applyConstraints({
                            advanced: [{ torch: !flashlightOn }],
                        })];
                case 2:
                    _b.sent();
                    setFlashlightOn(!flashlightOn);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.warn("Flashlight not supported or failed:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Start scanning with video element
    var handleStartScanning = function () {
        if (videoRef.current) {
            startScanning(videoRef.current);
        }
    };
    // Format timestamp for display
    var formatTimestamp = function (timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    };
    return (<div className={"barcode-scanner ".concat(className)} style={style}>
      <card_1.Card className="w-full max-w-2xl mx-auto">
        <card_1.CardHeader className="pb-3">
          <card_1.CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <lucide_react_1.Camera className="h-5 w-5"/>
              Barcode Scanner
            </span>

            {isScanning && (<badge_1.Badge variant="secondary" className="animate-pulse">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Scanning
              </badge_1.Badge>)}
          </card_1.CardTitle>
        </card_1.CardHeader>

        <card_1.CardContent className="space-y-4">
          {/* Error Display */}
          {error && (<alert_1.Alert variant="destructive">
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription className="flex items-center justify-between">
                {error.message}
                <button_1.Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Video Preview */}
          {showPreview && (<div className="relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border-2 border-dashed border-gray-300" style={{
                height: "".concat(height, "px"),
                maxWidth: "".concat(width, "px"),
                borderRadius: "".concat(borderRadius, "px"),
                objectFit: "cover",
            }}/>

              {/* Scanning Overlay */}
              {isScanning && (<div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"/>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-48 border-2 border-red-500 rounded-lg">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse mt-24"/>
                    </div>
                  </div>
                </div>)}

              {/* Last Scan Result Overlay */}
              {lastResult && (<div className="absolute top-2 left-2 right-2">
                  <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <lucide_react_1.CheckCircle className="h-4 w-4"/>
                    <span className="text-sm font-medium truncate">
                      {lastResult.data}
                    </span>
                  </div>
                </div>)}
            </div>)}

          {/* Controls */}
          {showControls && (<div className="flex flex-wrap gap-2 justify-center">
              <button_1.Button onClick={isScanning ? stopScanning : handleStartScanning} variant={isScanning ? "destructive" : "default"} disabled={!isInitialized || !hasPermission}>
                {isScanning ? (<>
                    <lucide_react_1.CameraOff className="h-4 w-4 mr-2"/>
                    Stop
                  </>) : (<>
                    <lucide_react_1.Camera className="h-4 w-4 mr-2"/>
                    Start
                  </>)}
              </button_1.Button>

              {availableCameras.length > 1 && (<button_1.Button onClick={switchCamera} variant="outline" disabled={!isInitialized}>
                  <lucide_react_1.RotateCw className="h-4 w-4 mr-2"/>
                  Switch Camera
                </button_1.Button>)}

              <button_1.Button onClick={toggleFlashlight} variant="outline" disabled={!isScanning}>
                {flashlightOn ? (<>
                    <lucide_react_1.FlashlightOff className="h-4 w-4 mr-2"/>
                    Flash Off
                  </>) : (<>
                    <lucide_react_1.Flashlight className="h-4 w-4 mr-2"/>
                    Flash On
                  </>)}
              </button_1.Button>

              {showManualInput && (<button_1.Button onClick={function () { return setShowManualEntry(!showManualEntry); }} variant="outline">
                  <lucide_react_1.Keyboard className="h-4 w-4 mr-2"/>
                  Manual Entry
                </button_1.Button>)}

              {showHistory && scanHistory.length > 0 && (<button_1.Button onClick={clearHistory} variant="outline" size="sm">
                  Clear History
                </button_1.Button>)}
            </div>)}

          {/* Manual Input */}
          {showManualEntry && (<card_1.Card>
              <card_1.CardContent className="pt-6">
                <div className="flex gap-2">
                  <input_1.Input value={manualInput} onChange={function (e) { return setManualInput(e.target.value); }} placeholder="Enter barcode manually..." onKeyPress={function (e) {
                return e.key === "Enter" && handleManualSubmit();
            }} className="flex-1"/>
                  <button_1.Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                    Submit
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Scan History */}
          {showHistory && scanHistory.length > 0 && (<card_1.Card>
              <card_1.CardHeader className="pb-3">
                <card_1.CardTitle className="text-sm">
                  Recent Scans ({scanHistory.length})
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scanHistory.slice(0, 10).map(function (scan, index) { return (<div key={"".concat(scan.timestamp, "-").concat(index)} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant="outline" className="text-xs">
                          {scan.format}
                        </badge_1.Badge>
                        <span className="font-mono truncate max-w-48">
                          {scan.data}
                        </span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatTimestamp(scan.timestamp)}
                      </span>
                    </div>); })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Camera Info */}
          {currentCamera && (<div className="text-xs text-gray-500 text-center">
              Camera: {currentCamera.label || "Unknown Camera"}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.default = BarcodeScanner;
