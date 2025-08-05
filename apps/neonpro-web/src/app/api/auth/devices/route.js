"use strict";
// =====================================================
// Device Management API Routes
// Story 1.4: Session Management & Security
// =====================================================
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var session_1 = require("@/lib/auth/session");
var zod_1 = require("zod");
// =====================================================
// VALIDATION SCHEMAS
// =====================================================
var registerDeviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    type: zod_1.z.enum(['desktop', 'mobile', 'tablet', 'unknown']),
    fingerprint: zod_1.z.string().min(1),
    userAgent: zod_1.z.string().min(1),
    location: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var trustDeviceSchema = zod_1.z.object({
    deviceId: zod_1.z.string().uuid(),
    trusted: zod_1.z.boolean()
});
var reportDeviceSchema = zod_1.z.object({
    deviceId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(1).max(500),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function getClientIP(request) {
    var forwarded = request.headers.get('x-forwarded-for');
    var realIP = request.headers.get('x-real-ip');
    var cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    return '127.0.0.1';
}
function getUserAgent(request) {
    return request.headers.get('user-agent') || 'Unknown';
}
function initializeSessionSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
            return [2 /*return*/, new session_1.UnifiedSessionSystem(supabase)];
        });
    });
}
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 1:
                    _a = _b.sent(), user = _a.data.user, error = _a.error;
                    if (error || !user) {
                        throw new Error('Unauthorized');
                    }
                    return [2 /*return*/, user];
            }
        });
    });
}
// =====================================================
// GET - List User Devices
// =====================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, devices, clientIP, userAgent, currentDeviceFingerprint_1, devicesWithCurrent, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, initializeSessionSystem()
                        // Get user devices
                    ];
                case 2:
                    sessionSystem = _a.sent();
                    return [4 /*yield*/, sessionSystem.deviceManager.getUserDevices(user.id)
                        // Get current device info
                    ];
                case 3:
                    devices = _a.sent();
                    clientIP = getClientIP(request);
                    userAgent = getUserAgent(request);
                    return [4 /*yield*/, sessionSystem.deviceManager.generateFingerprint({
                            userAgent: userAgent,
                            ipAddress: clientIP
                        })
                        // Mark current device
                    ];
                case 4:
                    currentDeviceFingerprint_1 = _a.sent();
                    devicesWithCurrent = devices.map(function (device) { return (__assign(__assign({}, device), { isCurrentDevice: device.fingerprint === currentDeviceFingerprint_1 })); });
                    return [2 /*return*/, server_1.NextResponse.json({
                            devices: devicesWithCurrent,
                            total: devices.length,
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    error_1 = _a.sent();
                    console.error('Devices GET error:', error_1);
                    if (error_1 instanceof Error && error_1.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// POST - Register or Manage Device
// =====================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, body, action, clientIP, userAgent, _a, deviceInfo, _b, validation, device, validation, _c, deviceId, trusted, device, success, _d, validation, _e, deviceId, reason, metadata, device, error_2;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 22, , 23]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _g.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _g.sent();
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _g.sent();
                    action = body.action;
                    clientIP = getClientIP(request);
                    userAgent = getUserAgent(request);
                    _a = action;
                    switch (_a) {
                        case 'register': return [3 /*break*/, 4];
                        case 'trust': return [3 /*break*/, 9];
                        case 'report': return [3 /*break*/, 16];
                    }
                    return [3 /*break*/, 20];
                case 4:
                    _f = {
                        name: body.name || "Device ".concat(new Date().toLocaleDateString()),
                        type: body.type || 'unknown'
                    };
                    _b = body.fingerprint;
                    if (_b) return [3 /*break*/, 6];
                    return [4 /*yield*/, sessionSystem.deviceManager.generateFingerprint({
                            userAgent: userAgent,
                            ipAddress: clientIP
                        })];
                case 5:
                    _b = (_g.sent());
                    _g.label = 6;
                case 6:
                    deviceInfo = (_f.fingerprint = _b,
                        _f.userAgent = userAgent,
                        _f.location = body.location,
                        _f.metadata = __assign(__assign({}, body.metadata), { registeredAt: new Date().toISOString(), registrationIP: clientIP }),
                        _f);
                    validation = registerDeviceSchema.safeParse(deviceInfo);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid device data', details: validation.error.errors }, { status: 400 })];
                    }
                    return [4 /*yield*/, sessionSystem.deviceManager.registerDevice(user.id, validation.data)
                        // Log security event
                    ];
                case 7:
                    device = _g.sent();
                    // Log security event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'device_registered',
                            severity: 'low',
                            description: "New device registered: ".concat(device.name),
                            userId: user.id,
                            deviceId: device.id,
                            ipAddress: clientIP,
                            userAgent: userAgent,
                            metadata: { deviceInfo: validation.data }
                        })];
                case 8:
                    // Log security event
                    _g.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            device: device,
                            message: 'Device registered successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 9:
                    validation = trustDeviceSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 })];
                    }
                    _c = validation.data, deviceId = _c.deviceId, trusted = _c.trusted;
                    return [4 /*yield*/, sessionSystem.deviceManager.getDevice(deviceId)];
                case 10:
                    device = _g.sent();
                    if (!device || device.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found or access denied' }, { status: 404 })];
                    }
                    if (!trusted) return [3 /*break*/, 12];
                    return [4 /*yield*/, sessionSystem.deviceManager.trustDevice(deviceId)];
                case 11:
                    _d = _g.sent();
                    return [3 /*break*/, 14];
                case 12: return [4 /*yield*/, sessionSystem.deviceManager.untrustDevice(deviceId)];
                case 13:
                    _d = _g.sent();
                    _g.label = 14;
                case 14:
                    success = _d;
                    if (!success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update device trust status' }, { status: 400 })];
                    }
                    // Log security event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: trusted ? 'device_trusted' : 'device_untrusted',
                            severity: 'medium',
                            description: "Device ".concat(trusted ? 'trusted' : 'untrusted', ": ").concat(device.name),
                            userId: user.id,
                            deviceId: deviceId,
                            ipAddress: clientIP,
                            userAgent: userAgent
                        })];
                case 15:
                    // Log security event
                    _g.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "Device ".concat(trusted ? 'trusted' : 'untrusted', " successfully"),
                            timestamp: new Date().toISOString()
                        })];
                case 16:
                    validation = reportDeviceSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid request data', details: validation.error.errors }, { status: 400 })];
                    }
                    _e = validation.data, deviceId = _e.deviceId, reason = _e.reason, metadata = _e.metadata;
                    return [4 /*yield*/, sessionSystem.deviceManager.getDevice(deviceId)];
                case 17:
                    device = _g.sent();
                    if (!device || device.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found or access denied' }, { status: 404 })];
                    }
                    // Report suspicious device
                    return [4 /*yield*/, sessionSystem.deviceManager.reportSuspiciousDevice(deviceId, reason)
                        // Log security event
                    ];
                case 18:
                    // Report suspicious device
                    _g.sent();
                    // Log security event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'device_reported_suspicious',
                            severity: 'high',
                            description: "Device reported as suspicious: ".concat(device.name, ". Reason: ").concat(reason),
                            userId: user.id,
                            deviceId: deviceId,
                            ipAddress: clientIP,
                            userAgent: userAgent,
                            metadata: __assign({ reason: reason }, metadata)
                        })];
                case 19:
                    // Log security event
                    _g.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Device reported successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 20: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 21: return [3 /*break*/, 23];
                case 22:
                    error_2 = _g.sent();
                    console.error('Devices POST error:', error_2);
                    if (error_2 instanceof Error && error_2.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 23: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// PUT - Update Device
// =====================================================
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, body, deviceId, updates, device, success, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _a.sent();
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _a.sent();
                    deviceId = body.deviceId, updates = body.updates;
                    if (!deviceId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, sessionSystem.deviceManager.getDevice(deviceId)];
                case 4:
                    device = _a.sent();
                    if (!device || device.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found or access denied' }, { status: 404 })];
                    }
                    return [4 /*yield*/, sessionSystem.deviceManager.updateDevice(deviceId, __assign(__assign({}, updates), { updatedAt: new Date().toISOString() }))];
                case 5:
                    success = _a.sent();
                    if (!success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update device' }, { status: 400 })];
                    }
                    // Log security event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'device_updated',
                            severity: 'low',
                            description: "Device updated: ".concat(device.name),
                            userId: user.id,
                            deviceId: deviceId,
                            ipAddress: getClientIP(request),
                            userAgent: getUserAgent(request),
                            metadata: { updates: updates }
                        })];
                case 6:
                    // Log security event
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Device updated successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 7:
                    error_3 = _a.sent();
                    console.error('Devices PUT error:', error_3);
                    if (error_3 instanceof Error && error_3.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// DELETE - Remove Device
// =====================================================
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, searchParams, deviceId, device, clientIP, userAgent, currentFingerprint, success, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _a.sent();
                    searchParams = new URL(request.url).searchParams;
                    deviceId = searchParams.get('deviceId');
                    if (!deviceId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, sessionSystem.deviceManager.getDevice(deviceId)];
                case 3:
                    device = _a.sent();
                    if (!device || device.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found or access denied' }, { status: 404 })];
                    }
                    clientIP = getClientIP(request);
                    userAgent = getUserAgent(request);
                    return [4 /*yield*/, sessionSystem.deviceManager.generateFingerprint({
                            userAgent: userAgent,
                            ipAddress: clientIP
                        })];
                case 4:
                    currentFingerprint = _a.sent();
                    if (device.fingerprint === currentFingerprint) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot remove current device' }, { status: 400 })];
                    }
                    return [4 /*yield*/, sessionSystem.deviceManager.removeDevice(deviceId)];
                case 5:
                    success = _a.sent();
                    if (!success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to remove device' }, { status: 400 })];
                    }
                    // Log security event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'device_removed',
                            severity: 'medium',
                            description: "Device removed: ".concat(device.name),
                            userId: user.id,
                            deviceId: deviceId,
                            ipAddress: clientIP,
                            userAgent: userAgent
                        })];
                case 6:
                    // Log security event
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Device removed successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 7:
                    error_4 = _a.sent();
                    console.error('Devices DELETE error:', error_4);
                    if (error_4 instanceof Error && error_4.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
