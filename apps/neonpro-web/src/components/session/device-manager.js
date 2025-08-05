'use client';
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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var use_session_1 = require("@/hooks/use-session");
var lucide_react_1 = require("lucide-react");
var DeviceManager = function (_a) {
    var userId = _a.userId, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, use_session_1.useDeviceManagement)(userId), devices = _c.devices, loading = _c.loading, error = _c.error, trustDevice = _c.trustDevice, untrustDevice = _c.untrustDevice, removeDevice = _c.removeDevice, registerDevice = _c.registerDevice, refreshDevices = _c.refreshDevices;
    var _d = (0, react_1.useState)(false), showAddDialog = _d[0], setShowAddDialog = _d[1];
    var _e = (0, react_1.useState)(false), showRemoveDialog = _e[0], setShowRemoveDialog = _e[1];
    var _f = (0, react_1.useState)(null), selectedDevice = _f[0], setSelectedDevice = _f[1];
    var _g = (0, react_1.useState)({
        name: '',
        type: 'DESKTOP',
        trusted: false
    }), newDevice = _g[0], setNewDevice = _g[1];
    var getDeviceIcon = function (deviceType) {
        switch (deviceType) {
            case 'MOBILE':
                return <lucide_react_1.Smartphone className="h-5 w-5"/>;
            case 'TABLET':
                return <lucide_react_1.Tablet className="h-5 w-5"/>;
            case 'DESKTOP':
            default:
                return <lucide_react_1.Monitor className="h-5 w-5"/>;
        }
    };
    var getDeviceTypeColor = function (deviceType) {
        switch (deviceType) {
            case 'MOBILE': return 'bg-blue-100 text-blue-800';
            case 'TABLET': return 'bg-purple-100 text-purple-800';
            case 'DESKTOP': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    var formatLastSeen = function (timestamp) {
        var now = new Date();
        var lastSeen = new Date(timestamp);
        var diffMs = now.getTime() - lastSeen.getTime();
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMins / 60);
        var diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return "".concat(diffMins, " minutes ago");
        if (diffHours < 24)
            return "".concat(diffHours, " hours ago");
        return "".concat(diffDays, " days ago");
    };
    var handleTrustToggle = function (device) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!device.trusted) return [3 /*break*/, 2];
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
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Failed to toggle device trust:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveDevice = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedDevice)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, removeDevice(selectedDevice.id)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshDevices()];
                case 3:
                    _a.sent();
                    setShowRemoveDialog(false);
                    setSelectedDevice(null);
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Failed to remove device:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleAddDevice = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, registerDevice({
                            user_id: userId,
                            device_name: newDevice.name,
                            device_type: newDevice.type,
                            trusted: newDevice.trusted,
                            ip_address: '0.0.0.0', // Will be set by the API
                            user_agent: navigator.userAgent,
                            last_seen: new Date().toISOString()
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, refreshDevices()];
                case 2:
                    _a.sent();
                    setShowAddDialog(false);
                    setNewDevice({ name: '', type: 'DESKTOP', trusted: false });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Failed to add device:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Monitor className="h-5 w-5"/>
            Device Management
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(function (i) { return (<div key={i} className="h-20 bg-muted rounded"/>); })}
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Monitor className="h-5 w-5"/>
            Device Management
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>
              Failed to load devices: {error}
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<>
      <card_1.Card className={className}>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Monitor className="h-5 w-5"/>
              Device Management
              <badge_1.Badge variant="secondary" className="ml-2">
                {devices.length}
              </badge_1.Badge>
            </card_1.CardTitle>
            <div className="flex gap-2">
              <button_1.Button variant="outline" size="sm" onClick={function () { return setShowAddDialog(true); }}>
                <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
                Add Device
              </button_1.Button>
              <button_1.Button variant="outline" size="sm" onClick={refreshDevices}>
                Refresh
              </button_1.Button>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {devices.length === 0 ? (<div className="text-center py-8 text-muted-foreground">
              <lucide_react_1.Monitor className="h-12 w-12 mx-auto mb-4"/>
              <p className="text-lg font-medium">No Devices Found</p>
              <p className="text-sm">Add a device to get started.</p>
            </div>) : (<div className="space-y-4">
              {devices.map(function (device) { return (<div key={device.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {device.device_name}
                      </h3>
                      <badge_1.Badge className={getDeviceTypeColor(device.device_type)} variant="secondary">
                        {device.device_type}
                      </badge_1.Badge>
                      {device.trusted && (<badge_1.Badge variant="default" className="bg-green-100 text-green-800">
                          <lucide_react_1.ShieldCheck className="h-3 w-3 mr-1"/>
                          Trusted
                        </badge_1.Badge>)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <lucide_react_1.Clock className="h-3 w-3"/>
                        {formatLastSeen(device.last_seen)}
                      </div>
                      
                      {device.ip_address && (<div className="flex items-center gap-1">
                          <lucide_react_1.MapPin className="h-3 w-3"/>
                          {device.ip_address}
                        </div>)}
                      
                      <div className="flex items-center gap-1">
                        <span className={"h-2 w-2 rounded-full ".concat(device.is_active ? 'bg-green-500' : 'bg-gray-400')}/>
                        {device.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button_1.Button variant={device.trusted ? "default" : "outline"} size="sm" onClick={function () { return handleTrustToggle(device); }}>
                      {device.trusted ? (<>
                          <lucide_react_1.ShieldCheck className="h-4 w-4 mr-2"/>
                          Trusted
                        </>) : (<>
                          <lucide_react_1.Shield className="h-4 w-4 mr-2"/>
                          Trust
                        </>)}
                    </button_1.Button>
                    
                    <button_1.Button variant="outline" size="sm" onClick={function () {
                    setSelectedDevice(device);
                    setShowRemoveDialog(true);
                }}>
                      <lucide_react_1.Trash2 className="h-4 w-4"/>
                    </button_1.Button>
                  </div>
                </div>); })}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Add Device Dialog */}
      <dialog_1.Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Add New Device</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Register a new device for this user account.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label_1.Label htmlFor="device-name">Device Name</label_1.Label>
              <input_1.Input id="device-name" value={newDevice.name} onChange={function (e) { return setNewDevice(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); }); }} placeholder="My Laptop"/>
            </div>
            
            <div>
              <label_1.Label htmlFor="device-type">Device Type</label_1.Label>
              <select id="device-type" value={newDevice.type} onChange={function (e) { return setNewDevice(function (prev) { return (__assign(__assign({}, prev), { type: e.target.value })); }); }} className="w-full p-2 border rounded-md">
                <option value="DESKTOP">Desktop</option>
                <option value="MOBILE">Mobile</option>
                <option value="TABLET">Tablet</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="trusted" checked={newDevice.trusted} onChange={function (e) { return setNewDevice(function (prev) { return (__assign(__assign({}, prev), { trusted: e.target.checked })); }); }}/>
              <label_1.Label htmlFor="trusted">Mark as trusted device</label_1.Label>
            </div>
          </div>
          
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowAddDialog(false); }}>
              Cancel
            </button_1.Button>
            <button_1.Button onClick={handleAddDevice} disabled={!newDevice.name.trim()}>
              Add Device
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Remove Device Dialog */}
      <dialog_1.Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Remove Device</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Are you sure you want to remove this device? This action cannot be undone.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          
          {selectedDevice && (<div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getDeviceIcon(selectedDevice.device_type)}
                <div>
                  <h3 className="font-medium">{selectedDevice.device_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDevice.device_type} • Last seen {formatLastSeen(selectedDevice.last_seen)}
                  </p>
                </div>
              </div>
            </div>)}
          
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={function () { return setShowRemoveDialog(false); }}>
              Cancel
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={handleRemoveDevice}>
              Remove Device
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </>);
};
exports.default = DeviceManager;
