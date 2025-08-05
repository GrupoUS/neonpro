"use strict";
// Session Management Types
// Comprehensive TypeScript definitions for the session management system
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_TYPES = exports.DEVICE_TYPES = exports.USER_ROLES = exports.SECURITY_LEVELS = exports.DEVICE_EVENTS = exports.SESSION_EVENTS = exports.ValidationError = exports.SecurityError = exports.SessionError = void 0;
// Error Types
var SessionError = /** @class */ (function (_super) {
    __extends(SessionError, _super);
    function SessionError(message, code, statusCode, metadata) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.statusCode = statusCode;
        _this.metadata = metadata;
        _this.name = 'SessionError';
        return _this;
    }
    return SessionError;
}(Error));
exports.SessionError = SessionError;
var SecurityError = /** @class */ (function (_super) {
    __extends(SecurityError, _super);
    function SecurityError(message, securityCode, severity, metadata) {
        if (severity === void 0) { severity = 'medium'; }
        var _this = _super.call(this, message, "SECURITY_".concat(securityCode), 403, metadata) || this;
        _this.securityCode = securityCode;
        _this.severity = severity;
        _this.name = 'SecurityError';
        return _this;
    }
    return SecurityError;
}(SessionError));
exports.SecurityError = SecurityError;
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, field, metadata) {
        var _this = _super.call(this, message, 'VALIDATION_ERROR', 400, metadata) || this;
        _this.field = field;
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(SessionError));
exports.ValidationError = ValidationError;
// Constants
exports.SESSION_EVENTS = {
    CREATED: 'session_created',
    REFRESHED: 'session_refreshed',
    EXTENDED: 'session_extended',
    TERMINATED: 'session_terminated',
    EXPIRED: 'session_expired',
    VALIDATED: 'session_validated'
};
exports.DEVICE_EVENTS = {
    REGISTERED: 'device_registered',
    TRUSTED: 'device_trusted',
    UNTRUSTED: 'device_untrusted',
    REMOVED: 'device_removed',
    UPDATED: 'device_updated'
};
exports.SECURITY_LEVELS = {
    STANDARD: 'standard',
    ELEVATED: 'elevated',
    HIGH_SECURITY: 'high_security'
};
exports.USER_ROLES = {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    GUEST: 'guest'
};
exports.DEVICE_TYPES = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
    TABLET: 'tablet',
    UNKNOWN: 'unknown'
};
exports.SESSION_TYPES = {
    WEB: 'web',
    MOBILE: 'mobile',
    API: 'api',
    ADMIN: 'admin'
};
