// =====================================================
// DeviceManagement Component - Trusted Device Management
// Story 1.4: Session Management & Security
// =====================================================
'use client';
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
exports.DeviceManagement = DeviceManagement;
var react_1 = require("react");
var auth_1 = require("@/hooks/auth");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// =====================================================
// MAIN COMPONENT
// =====================================================
function DeviceManagement(_a) {
    var _this = this;
    var className = _a.className, _b = _a.showAddDevice, showAddDevice = _b === void 0 ? true : _b, _c = _a.showRemoveDevice, showRemoveDevice = _c === void 0 ? true : _c, _d = _a.maxDevices, maxDevices = _d === void 0 ? 5 : _d;
    var _e = (0, auth_1.useDeviceManagement)(), devices = _e.devices, currentDevice = _e.currentDevice, isLoading = _e.isLoading, registerDevice = _e.registerDevice, trustDevice = _e.trustDevice, untrustDevice = _e.untrustDevice, removeDevice = _e.removeDevice, reportSuspiciousDevice = _e.reportSuspiciousDevice, refreshDevices = _e.refreshDevices;
    var _f = (0, react_1.useState)(null), selectedDevice = _f[0], setSelectedDevice = _f[1];
    var _g = (0, react_1.useState)(false), showRemoveDialog = _g[0], setShowRemoveDialog = _g[1];
    var _h = (0, react_1.useState)(false), showTrustDialog = _h[0], setShowTrustDialog = _h[1];
    var _j = (0, react_1.useState)(false), isRegistering = _j[0], setIsRegistering = _j[1];
    (0, react_1.useEffect)(function () {
        refreshDevices();
    }, []);
    // Device type icon mapping
    var getDeviceIcon = function (type) {
        switch (type) {
            case 'desktop': return lucide_react_1.Monitor;
            case 'mobile': return lucide_react_1.Smartphone;
            case 'tablet': return lucide_react_1.Tablet;
            case 'laptop': return lucide_react_1.Laptop;
            default: return lucide_react_1.Monitor;
        }
    };
    // Risk level colors
    var getRiskColor = function (level) {
        switch (level) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    // Risk level badge variant
    var getRiskBadgeVariant = function (level) {
        switch (level) {
            case 'low': return 'default';
            case 'medium': return 'secondary';
            case 'high': return 'destructive';
            default: return 'outline';
        }
    };
    // Handle device registration
    var handleRegisterDevice = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRegistering(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, registerDevice()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshDevices()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error('Failed to register device:', error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setIsRegistering(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle device trust toggle
    var handleTrustToggle = function (device) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!device.isTrusted) return [3 /*break*/, 2];
                    return [4 /*yield*/, untrustDevice(device.id)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, trustDevice(device.id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, refreshDevices()];
                case 5:
                    _a.sent();
                    setShowTrustDialog(false);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('Failed to toggle device trust:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Handle device removal
    var handleRemoveDevice = function (device) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, removeDevice(device.id)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshDevices()];
                case 2:
                    _a.sent();
                    setShowRemoveDialog(false);
                    setSelectedDevice(null);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Failed to remove device:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Handle suspicious device report
    var handleReportSuspicious = function (device) { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, reportSuspiciousDevice(device.id, 'User reported as suspicious')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshDevices()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Failed to report device:', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (isLoading) {
        return (<card_1.Card className={(0, utils_1.cn)('w-full', className)}>
        <card_1.CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<>
      <card_1.Card className={(0, utils_1.cn)('w-full', className)}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <lucide_react_1.Shield className="h-5 w-5"/>
              Device Management
            </div>
            <badge_1.Badge variant="outline">
              {devices.length}/{maxDevices} devices
            </badge_1.Badge>
          </card_1.CardTitle>
        </card_1.CardHeader>
        
        <card_1.CardContent className="space-y-4">
          {/* Current Device Alert */}
          {currentDevice && (<alert_1.Alert>
              <lucide_react_1.CheckCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                Current device: <strong>{currentDevice.name}</strong> 
                {currentDevice.isTrusted ? ' (Trusted)' : ' (Not trusted)'}
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Add Device Button */}
          {showAddDevice && devices.length < maxDevices && (<button_1.Button onClick={handleRegisterDevice} disabled={isRegistering} className="w-full">
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              {isRegistering ? 'Registering...' : 'Register This Device'}
            </button_1.Button>)}

          {/* Device List */}
          <div className="space-y-3">
            {devices.map(function (device) {
            var DeviceIcon = getDeviceIcon(device.type);
            return (<div key={device.id} className={(0, utils_1.cn)('p-4 rounded-lg border transition-colors', device.isCurrentDevice
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-card hover:bg-muted/50')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <DeviceIcon className="h-5 w-5 mt-0.5 text-muted-foreground"/>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{device.name}</span>
                          {device.isCurrentDevice && (<badge_1.Badge variant="outline" className="text-xs">
                              Current
                            </badge_1.Badge>)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.MapPin className="h-3 w-3"/>
                            <span>{device.location || 'Unknown location'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Wifi className="h-3 w-3"/>
                            <span>{device.ipAddress}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-3 w-3"/>
                            <span>
                              {new Date(device.lastSeen).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Trust Status */}
                      <div className="flex items-center gap-1">
                        {device.isTrusted ? (<lucide_react_1.ShieldCheck className="h-4 w-4 text-green-600"/>) : (<lucide_react_1.ShieldAlert className="h-4 w-4 text-orange-600"/>)}
                        <span className={(0, utils_1.cn)('text-xs font-medium', device.isTrusted ? 'text-green-600' : 'text-orange-600')}>
                          {device.isTrusted ? 'Trusted' : 'Untrusted'}
                        </span>
                      </div>
                      
                      {/* Risk Level */}
                      <badge_1.Badge variant={getRiskBadgeVariant(device.riskLevel)} className="text-xs">
                        {device.riskLevel.toUpperCase()}
                      </badge_1.Badge>
                    </div>
                  </div>
                  
                  {/* Device Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <button_1.Button size="sm" variant="outline" onClick={function () {
                    setSelectedDevice(device);
                    setShowTrustDialog(true);
                }}>
                      {device.isTrusted ? 'Untrust' : 'Trust'}
                    </button_1.Button>
                    
                    {!device.isCurrentDevice && (<>
                        <button_1.Button size="sm" variant="outline" onClick={function () { return handleReportSuspicious(device); }}>
                          <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1"/>
                          Report
                        </button_1.Button>
                        
                        {showRemoveDevice && (<button_1.Button size="sm" variant="destructive" onClick={function () {
                            setSelectedDevice(device);
                            setShowRemoveDialog(true);
                        }}>
                            <lucide_react_1.Trash2 className="h-3 w-3 mr-1"/>
                            Remove
                          </button_1.Button>)}
                      </>)}
                  </div>
                </div>);
        })}
          </div>
          
          {devices.length === 0 && (<div className="text-center py-8 text-muted-foreground">
              <lucide_react_1.Shield className="h-12 w-12 mx-auto mb-4 opacity-50"/>
              <p>No devices registered</p>
              <p className="text-sm">Register this device to get started</p>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Trust Dialog */}
      <dialog_1.Dialog open={showTrustDialog} onOpenChange={setShowTrustDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {(selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.isTrusted) ? 'Untrust Device' : 'Trust Device'}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {(selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.isTrusted)
            ? "Are you sure you want to untrust \"".concat(selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.name, "\"? This device will require additional verification for future logins.")
            : "Are you sure you want to trust \"".concat(selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.name, "\"? This device will be allowed to access your account with reduced security checks.")}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowTrustDialog(false); }}>
              Cancel
            </button_1.Button>
            <button_1.Button onClick={function () { return selectedDevice && handleTrustToggle(selectedDevice); }}>
              {(selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.isTrusted) ? 'Untrust' : 'Trust'}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Remove Dialog */}
      <dialog_1.Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Remove Device</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Are you sure you want to remove "<strong>{selectedDevice === null || selectedDevice === void 0 ? void 0 : selectedDevice.name}</strong>"? 
              This action cannot be undone and the device will need to be re-registered.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowRemoveDialog(false); }}>
              Cancel
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={function () { return selectedDevice && handleRemoveDevice(selectedDevice); }}>
              Remove Device
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>);
}
// =====================================================
// EXPORT DEFAULT
// =====================================================
exports.default = DeviceManagement;
