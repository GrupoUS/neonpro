"use strict";
/**
 * WebAuthn Registration Verification API
 * TASK-002: Multi-Factor Authentication Enhancement
 *
 * Verifies and stores WebAuthn credential after registration
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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var webauthn_service_1 = require("@/lib/auth/webauthn-service");
var performance_tracker_1 = require("@/lib/auth/performance-tracker");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, performance_tracker_1.trackLoginPerformance)(function () { return __awaiter(_this, void 0, void 0, function () {
                    var supabase, _a, session, sessionError, _b, response, deviceName, verification, error_1;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 5, , 6]);
                                return [4 /*yield*/, (0, server_2.createClient)()];
                            case 1:
                                supabase = _c.sent();
                                return [4 /*yield*/, supabase.auth.getSession()];
                            case 2:
                                _a = _c.sent(), session = _a.data.session, sessionError = _a.error;
                                if (sessionError || !(session === null || session === void 0 ? void 0 : session.user)) {
                                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                                }
                                return [4 /*yield*/, request.json()];
                            case 3:
                                _b = _c.sent(), response = _b.response, deviceName = _b.deviceName;
                                if (!response) {
                                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Registration response required' }, { status: 400 })];
                                }
                                return [4 /*yield*/, (0, webauthn_service_1.createwebAuthnService)().verifyRegistrationResponse(session.user.id, response, deviceName)];
                            case 4:
                                verification = _c.sent();
                                if (!verification.verified) {
                                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Registration verification failed' }, { status: 400 })];
                                }
                                return [2 /*return*/, server_1.NextResponse.json({
                                        success: true,
                                        verified: verification.verified,
                                        message: 'WebAuthn credential registered successfully',
                                    })];
                            case 5:
                                error_1 = _c.sent();
                                console.error('WebAuthn registration verification error:', error_1);
                                return [2 /*return*/, server_1.NextResponse.json({ error: error_1 instanceof Error ? error_1.message : 'Registration verification failed' }, { status: 500 })];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); }, {
                    method: 'webauthn',
                    additionalData: { operation: 'registration_verification' },
                })];
        });
    });
}
