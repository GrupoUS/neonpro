"use strict";
/**
 * Device Management API Route
 * Manages trusted devices and device registration
 */
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var server_2 = require("@/lib/supabase/server");
var session_1 = require("@/types/session");
// Initialize session manager
var sessionManager = null;
function getSessionManager() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!sessionManager) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    sessionManager = new SessionManager_1.SessionManager(supabase, {
                        defaultTimeout: 30,
                        maxConcurrentSessions: 5,
                        enableDeviceTracking: true,
                        enableSecurityMonitoring: true,
                        enableSuspiciousActivityDetection: true,
                        sessionCleanupInterval: 300000,
                        securityEventRetention: 30 * 24 * 60 * 60 * 1000,
                        encryptionKey: process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production'
                    });
                    _a.label = 2;
                case 2: return [2 /*return*/, sessionManager];
            }
        });
    });
}
// Get user devices
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, userId, manager, devices, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    userId = searchParams.get('userId');
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'User ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 1:
                    manager = _a.sent();
                    return [4 /*yield*/, manager.getUserDevices(userId)];
                case 2:
                    devices = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ devices: devices })];
                case 3:
                    error_1 = _a.sent();
                    console.error('Get devices error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error while fetching devices' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Register new device
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, userId, deviceName, deviceType, _b, trusted, manager, clientIP, userAgent, device, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _c.sent(), userId = _a.userId, deviceName = _a.deviceName, deviceType = _a.deviceType, _b = _a.trusted, trusted = _b === void 0 ? false : _b;
                    if (!userId || !deviceName || !deviceType) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'User ID, device name, and device type are required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 2:
                    manager = _c.sent();
                    clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        '127.0.0.1';
                    userAgent = request.headers.get('user-agent') || 'Unknown';
                    return [4 /*yield*/, manager.registerDevice({
                            user_id: userId,
                            device_name: deviceName,
                            device_type: deviceType,
                            ip_address: clientIP,
                            user_agent: userAgent,
                            trusted: trusted,
                            last_seen: new Date().toISOString()
                        })];
                case 3:
                    device = _c.sent();
                    // Log device registration event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: 'device-registration',
                            event_type: session_1.SecurityEventType.DEVICE_REGISTERED,
                            severity: trusted ? session_1.SecuritySeverity.LOW : session_1.SecuritySeverity.MEDIUM,
                            description: "New device registered: ".concat(deviceName),
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                user_id: userId,
                                device_id: device.id,
                                device_name: deviceName,
                                device_type: deviceType,
                                trusted: trusted,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 4:
                    // Log device registration event
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ device: device })];
                case 5:
                    error_2 = _c.sent();
                    console.error('Device registration error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error during device registration' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Update device (trust/untrust)
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, deviceId, trusted, deviceName, manager, clientIP, userAgent, updatedDevice, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    _a = _b.sent(), deviceId = _a.deviceId, trusted = _a.trusted, deviceName = _a.deviceName;
                    if (!deviceId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 2:
                    manager = _b.sent();
                    clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        '127.0.0.1';
                    userAgent = request.headers.get('user-agent') || 'Unknown';
                    return [4 /*yield*/, manager.updateDevice(deviceId, {
                            trusted: trusted,
                            device_name: deviceName,
                            last_seen: new Date().toISOString()
                        })];
                case 3:
                    updatedDevice = _b.sent();
                    if (!updatedDevice) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found' }, { status: 404 })];
                    }
                    // Log device update event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: 'device-update',
                            event_type: trusted ? session_1.SecurityEventType.DEVICE_TRUSTED : session_1.SecurityEventType.DEVICE_UNTRUSTED,
                            severity: session_1.SecuritySeverity.MEDIUM,
                            description: "Device ".concat(trusted ? 'trusted' : 'untrusted', ": ").concat(deviceName || deviceId),
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                device_id: deviceId,
                                device_name: deviceName,
                                trusted: trusted,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 4:
                    // Log device update event
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ device: updatedDevice })];
                case 5:
                    error_3 = _b.sent();
                    console.error('Device update error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error during device update' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Remove device
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, deviceId, manager, clientIP, userAgent, device, removed, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    searchParams = new URL(request.url).searchParams;
                    deviceId = searchParams.get('deviceId');
                    if (!deviceId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 1:
                    manager = _a.sent();
                    clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        '127.0.0.1';
                    userAgent = request.headers.get('user-agent') || 'Unknown';
                    return [4 /*yield*/, manager.getDevice(deviceId)];
                case 2:
                    device = _a.sent();
                    return [4 /*yield*/, manager.removeDevice(deviceId)];
                case 3:
                    removed = _a.sent();
                    if (!removed) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Device not found or could not be removed' }, { status: 404 })];
                    }
                    // Log device removal event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: 'device-removal',
                            event_type: session_1.SecurityEventType.DEVICE_REMOVED,
                            severity: session_1.SecuritySeverity.MEDIUM,
                            description: "Device removed: ".concat((device === null || device === void 0 ? void 0 : device.device_name) || deviceId),
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                device_id: deviceId,
                                device_name: device === null || device === void 0 ? void 0 : device.device_name,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 4:
                    // Log device removal event
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Device removed successfully'
                        })];
                case 5:
                    error_4 = _a.sent();
                    console.error('Device removal error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error during device removal' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function OPTIONS(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new server_1.NextResponse(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                })];
        });
    });
}
