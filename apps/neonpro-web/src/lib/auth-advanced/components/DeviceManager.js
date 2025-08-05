// Device Manager Component
// Story 1.4: Session Management & Security Implementation
"use client";
"use strict";
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
exports.DeviceManager = DeviceManager;
var react_1 = require("react");
var context_1 = require("../context");
var utils_1 = require("../utils");
var lucide_react_1 = require("lucide-react");
function DeviceManager(_a) {
  var _this = this;
  var _b = _a.className,
    className = _b === void 0 ? "" : _b,
    _c = _a.showCurrentDevice,
    showCurrentDevice = _c === void 0 ? true : _c,
    _d = _a.allowDeviceActions,
    allowDeviceActions = _d === void 0 ? true : _d,
    _e = _a.compact,
    compact = _e === void 0 ? false : _e;
  var _f = (0, context_1.useSessionContext)(),
    currentDevice = _f.currentDevice,
    registeredDevices = _f.registeredDevices,
    trustDevice = _f.trustDevice,
    blockDevice = _f.blockDevice;
  var _g = (0, react_1.useState)(null),
    selectedDevice = _g[0],
    setSelectedDevice = _g[1];
  var _h = (0, react_1.useState)(null),
    actionLoading = _h[0],
    setActionLoading = _h[1];
  var _j = (0, react_1.useState)(new Set()),
    showDetails = _j[0],
    setShowDetails = _j[1];
  // Get device icon based on type
  var getDeviceIcon = function (device) {
    var deviceType = utils_1.AuthUtils.Device.detectDeviceType(device.user_agent);
    var iconClass = "w-5 h-5";
    switch (deviceType) {
      case "mobile":
        return <lucide_react_1.Smartphone className={iconClass} />;
      case "tablet":
        return <lucide_react_1.Tablet className={iconClass} />;
      default:
        return <lucide_react_1.Monitor className={iconClass} />;
    }
  };
  // Get device status color
  var getDeviceStatusColor = function (device) {
    if (device.is_blocked) return "text-red-500";
    if (device.is_trusted) return "text-green-500";
    return "text-yellow-500";
  };
  // Get device status text
  var getDeviceStatusText = function (device) {
    if (device.is_blocked) return "Blocked";
    if (device.is_trusted) return "Trusted";
    return "Untrusted";
  };
  // Get device status icon
  var getDeviceStatusIcon = function (device) {
    if (device.is_blocked) return <lucide_react_1.ShieldX className="w-4 h-4 text-red-500" />;
    if (device.is_trusted) return <lucide_react_1.ShieldCheck className="w-4 h-4 text-green-500" />;
    return <lucide_react_1.Shield className="w-4 h-4 text-yellow-500" />;
  };
  // Handle trust device
  var handleTrustDevice = function (deviceId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setActionLoading(deviceId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, trustDevice(deviceId)];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to trust device:", error_1);
            return [3 /*break*/, 5];
          case 4:
            setActionLoading(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Handle block device
  var handleBlockDevice = function (deviceId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            setActionLoading(deviceId);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, blockDevice(deviceId)];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Failed to block device:", error_2);
            return [3 /*break*/, 5];
          case 4:
            setActionLoading(null);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Toggle device details
  var toggleDetails = function (deviceId) {
    var newShowDetails = new Set(showDetails);
    if (newShowDetails.has(deviceId)) {
      newShowDetails.delete(deviceId);
    } else {
      newShowDetails.add(deviceId);
    }
    setShowDetails(newShowDetails);
  };
  // Format device name
  var formatDeviceName = function (device) {
    return utils_1.AuthUtils.Format.formatDeviceName({
      userAgent: device.user_agent,
      platform: device.platform,
      screenWidth: device.screen_width,
      screenHeight: device.screen_height,
      timezone: device.timezone,
      language: device.language,
    });
  };
  // Get trust score color
  var getTrustScoreColor = function (score) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };
  if (compact) {
    return (
      <div className={"space-y-2 ".concat(className)}>
        {/* Current Device */}
        {showCurrentDevice && currentDevice && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {getDeviceIcon(currentDevice)}
              <div>
                <p className="text-sm font-medium text-gray-900">Current Device</p>
                <p className="text-xs text-gray-600 truncate max-w-48">
                  {formatDeviceName(currentDevice)}
                </p>
              </div>
            </div>
            {getDeviceStatusIcon(currentDevice)}
          </div>
        )}

        {/* Other Devices */}
        {registeredDevices
          .filter(function (device) {
            return (
              device.id !==
              (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id)
            );
          })
          .slice(0, 3)
          .map(function (device) {
            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(device)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {formatDeviceName(device).split(" on ")[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {utils_1.AuthUtils.Format.formatRelativeTime(new Date(device.last_seen))}
                    </p>
                  </div>
                </div>
                {getDeviceStatusIcon(device)}
              </div>
            );
          })}

        {registeredDevices.length > 4 && (
          <p className="text-xs text-gray-500 text-center">
            +{registeredDevices.length - 4} more devices
          </p>
        )}
      </div>
    );
  }
  return (
    <div className={"bg-white rounded-lg border shadow-sm ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <lucide_react_1.Monitor className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Device Management</h3>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
            {registeredDevices.length}
          </span>
        </div>

        <button className="p-2 text-gray-400 hover:text-gray-600 rounded">
          <lucide_react_1.Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Current Device */}
      {showCurrentDevice && currentDevice && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Current Device</h4>
            {getDeviceStatusIcon(currentDevice)}
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">{getDeviceIcon(currentDevice)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{formatDeviceName(currentDevice)}</p>

              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                {currentDevice.location && (
                  <div className="flex items-center space-x-1">
                    <lucide_react_1.MapPin className="w-3 h-3" />
                    <span>
                      {currentDevice.location.city}, {currentDevice.location.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <lucide_react_1.Clock className="w-3 h-3" />
                  <span>
                    {utils_1.AuthUtils.Format.formatRelativeTime(new Date(currentDevice.last_seen))}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className={getTrustScoreColor(currentDevice.trust_score)}>
                    Trust: {currentDevice.trust_score}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registered Devices */}
      <div className="divide-y">
        {registeredDevices
          .filter(function (device) {
            return (
              device.id !==
              (currentDevice === null || currentDevice === void 0 ? void 0 : currentDevice.id)
            );
          })
          .map(function (device) {
            var isSelected = selectedDevice === device.id;
            var isLoading = actionLoading === device.id;
            var showDeviceDetails = showDetails.has(device.id);
            return (
              <div key={device.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">{getDeviceIcon(device)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {formatDeviceName(device)}
                        </h4>
                        {getDeviceStatusIcon(device)}
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        {device.location && (
                          <div className="flex items-center space-x-1">
                            <lucide_react_1.MapPin className="w-3 h-3" />
                            <span>
                              {device.location.city}, {device.location.country}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center space-x-1">
                          <lucide_react_1.Clock className="w-3 h-3" />
                          <span>
                            Last seen{" "}
                            {utils_1.AuthUtils.Format.formatRelativeTime(
                              new Date(device.last_seen),
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <span className={getTrustScoreColor(device.trust_score)}>
                            Trust: {device.trust_score}%
                          </span>
                        </div>
                      </div>

                      {/* Device Actions */}
                      {allowDeviceActions && (
                        <div className="flex items-center space-x-2">
                          {!device.is_trusted && !device.is_blocked && (
                            <button
                              onClick={function () {
                                return handleTrustDevice(device.id);
                              }}
                              disabled={isLoading}
                              className="inline-flex items-center px-2 py-1 border border-green-300 text-xs font-medium rounded text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                            >
                              <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
                              Trust
                            </button>
                          )}

                          {!device.is_blocked && (
                            <button
                              onClick={function () {
                                return handleBlockDevice(device.id);
                              }}
                              disabled={isLoading}
                              className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                            >
                              <lucide_react_1.XCircle className="w-3 h-3 mr-1" />
                              Block
                            </button>
                          )}

                          <button
                            onClick={function () {
                              return toggleDetails(device.id);
                            }}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <lucide_react_1.Eye className="w-3 h-3 mr-1" />
                            {showDeviceDetails ? "Hide" : "Details"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Device Details */}
                {showDeviceDetails && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Device Information</h5>
                        <div className="space-y-1 text-gray-600">
                          <div>
                            <span className="font-medium">Platform:</span> {device.platform}
                          </div>
                          <div>
                            <span className="font-medium">Screen:</span> {device.screen_width}x
                            {device.screen_height}
                          </div>
                          <div>
                            <span className="font-medium">Timezone:</span> {device.timezone}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span> {device.language}
                          </div>
                          <div>
                            <span className="font-medium">Fingerprint:</span> {device.fingerprint}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Security Information</h5>
                        <div className="space-y-1 text-gray-600">
                          <div>
                            <span className="font-medium">Trust Score:</span>
                            <span className={getTrustScoreColor(device.trust_score)}>
                              {device.trust_score}%
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className={getDeviceStatusColor(device)}>
                              {getDeviceStatusText(device)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">First Seen:</span>
                            {new Date(device.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Last Seen:</span>
                            {utils_1.AuthUtils.Format.formatRelativeTime(
                              new Date(device.last_seen),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {device.location && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Location Information</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">City:</span> {device.location.city}
                          </div>
                          <div>
                            <span className="font-medium">Country:</span> {device.location.country}
                          </div>
                          <div>
                            <span className="font-medium">IP:</span> {device.location.ip_address}
                          </div>
                          {device.location.isVPN && (
                            <div className="flex items-center space-x-1">
                              <lucide_react_1.AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-600">VPN Detected</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Empty State */}
      {registeredDevices.length === 0 && (
        <div className="p-8 text-center">
          <lucide_react_1.Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">No devices registered</h3>
          <p className="text-sm text-gray-500">
            Devices will appear here when you sign in from different browsers or devices.
          </p>
        </div>
      )}
    </div>
  );
}
exports.default = DeviceManager;
