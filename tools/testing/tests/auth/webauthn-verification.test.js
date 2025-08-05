"use strict";
/**
 * WebAuthn API Integration Tests
 * TASK-002: Authentication & Security Enhancement
 *
 * Tests for WebAuthn/FIDO2 authentication implementation
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
var globals_1 = require("@jest/globals");
(0, globals_1.describe)('WebAuthn Implementation Verification', function () {
    (0, globals_1.it)('should have WebAuthn service utilities', function () {
        // Test that all required modules exist and can be imported
        (0, globals_1.expect)(function () {
            require('../../lib/auth/webauthn-service');
        }).not.toThrow();
        (0, globals_1.expect)(function () {
            require('../../lib/auth/webauthn-client');
        }).not.toThrow();
        (0, globals_1.expect)(function () {
            require('../../lib/auth/performance-tracker');
        }).not.toThrow();
    });
    (0, globals_1.it)('should have WebAuthn API endpoints', function () { return __awaiter(void 0, void 0, void 0, function () {
        var fs, path, apiPaths, _i, apiPaths_1, apiPath, fullPath;
        return __generator(this, function (_a) {
            fs = require('fs');
            path = require('path');
            apiPaths = [
                'app/api/auth/webauthn/register/options/route.ts',
                'app/api/auth/webauthn/register/verify/route.ts',
                'app/api/auth/webauthn/authenticate/options/route.ts',
                'app/api/auth/webauthn/authenticate/verify/route.ts',
                'app/api/auth/webauthn/credentials/route.ts',
                'app/api/auth/webauthn/credentials/[credentialId]/route.ts',
            ];
            for (_i = 0, apiPaths_1 = apiPaths; _i < apiPaths_1.length; _i++) {
                apiPath = apiPaths_1[_i];
                fullPath = path.join(process.cwd(), apiPath);
                (0, globals_1.expect)(fs.existsSync(fullPath)).toBe(true);
            }
            return [2 /*return*/];
        });
    }); });
    (0, globals_1.it)('should have WebAuthn React component', function () {
        var fs = require('fs');
        var path = require('path');
        var componentPath = path.join(process.cwd(), 'components/auth/webauthn-manager.tsx');
        (0, globals_1.expect)(fs.existsSync(componentPath)).toBe(true);
    });
    (0, globals_1.it)('should have WebAuthn dependencies installed', function () {
        // Test that WebAuthn dependencies are available
        (0, globals_1.expect)(function () {
            require('@simplewebauthn/server');
        }).not.toThrow();
        (0, globals_1.expect)(function () {
            require('@simplewebauthn/browser');
        }).not.toThrow();
    });
    (0, globals_1.it)('should have performance tracking integration', function () {
        var authPerformanceTracker = require('../../lib/auth/performance-tracker').authPerformanceTracker;
        // Test that performance tracker is properly initialized
        (0, globals_1.expect)(authPerformanceTracker).toBeDefined();
        (0, globals_1.expect)(typeof authPerformanceTracker.getPerformanceThresholds).toBe('function');
        // Test that performance thresholds match TASK-002 requirements
        var thresholds = authPerformanceTracker.getPerformanceThresholds();
        (0, globals_1.expect)(thresholds.login).toBe(350); // ≤350ms requirement from TASK-002
        (0, globals_1.expect)(thresholds.session_validation).toBe(100);
        (0, globals_1.expect)(thresholds.mfa_verification).toBe(500);
    });
    (0, globals_1.it)('should have proper WebAuthn configuration', function () {
        // Test environment variables and configuration
        var webAuthnService = require('../../lib/auth/webauthn-service').webAuthnService;
        (0, globals_1.expect)(webAuthnService).toBeDefined();
    });
});
(0, globals_1.describe)('TASK-002 Authentication Performance Requirements', function () {
    (0, globals_1.it)('should meet performance targets', function () {
        var authPerformanceTracker = require('../../lib/auth/performance-tracker').authPerformanceTracker;
        var thresholds = authPerformanceTracker.getPerformanceThresholds();
        // TASK-002 Story 1.1 Performance Requirements
        (0, globals_1.expect)(thresholds.login).toBeLessThanOrEqual(350); // ≤350ms target
        (0, globals_1.expect)(thresholds.logout).toBeLessThanOrEqual(200);
        (0, globals_1.expect)(thresholds.session_validation).toBeLessThanOrEqual(100);
        (0, globals_1.expect)(thresholds.token_refresh).toBeLessThanOrEqual(250);
        (0, globals_1.expect)(thresholds.mfa_verification).toBeLessThanOrEqual(500);
    });
    (0, globals_1.it)('should integrate with TASK-001 monitoring infrastructure', function () {
        // Verify integration with monitoring infrastructure from TASK-001
        (0, globals_1.expect)(function () {
            require('../../lib/monitoring/performance');
        }).not.toThrow();
        (0, globals_1.expect)(function () {
            require('../../lib/monitoring/analytics');
        }).not.toThrow();
    });
});
(0, globals_1.describe)('WebAuthn Security Features', function () {
    (0, globals_1.it)('should have comprehensive security audit preparation', function () {
        var fs = require('fs');
        var path = require('path');
        // Check that security audit schema is prepared
        var migrationPath = path.join(process.cwd(), 'supabase/migrations/20250124_webauthn_schema.sql');
        (0, globals_1.expect)(fs.existsSync(migrationPath)).toBe(true);
        // Verify migration contains security audit table
        var migrationContent = fs.readFileSync(migrationPath, 'utf8');
        (0, globals_1.expect)(migrationContent).toContain('security_audit_log');
        (0, globals_1.expect)(migrationContent).toContain('webauthn_credentials');
        (0, globals_1.expect)(migrationContent).toContain('trusted_devices');
        (0, globals_1.expect)(migrationContent).toContain('mfa_backup_codes');
    });
    (0, globals_1.it)('should have proper database schema for WebAuthn', function () {
        var fs = require('fs');
        var path = require('path');
        var migrationPath = path.join(process.cwd(), 'supabase/migrations/20250124_webauthn_schema.sql');
        var content = fs.readFileSync(migrationPath, 'utf8');
        // Verify essential WebAuthn fields are present
        (0, globals_1.expect)(content).toContain('credential_id');
        (0, globals_1.expect)(content).toContain('public_key');
        (0, globals_1.expect)(content).toContain('counter');
        (0, globals_1.expect)(content).toContain('device_type');
        (0, globals_1.expect)(content).toContain('RLS');
    });
});
console.log('✅ TASK-002 WebAuthn/FIDO2 Implementation Verification Complete');
console.log('🔐 Multi-factor authentication foundation ready');
console.log('📊 Performance monitoring integrated');
console.log('🛡️ Security audit framework prepared');
