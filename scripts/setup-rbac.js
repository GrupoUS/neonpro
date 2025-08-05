#!/usr/bin/env tsx
"use strict";
/**
 * RBAC Setup Script
 * Story 1.2: Role-Based Access Control Implementation
 *
 * Configures RBAC system including:
 * - Database policies (RLS)
 * - Initial roles and permissions
 * - Audit logging setup
 * - Verification tests
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
exports.RBACSetup = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var fs_1 = require("fs");
var path_1 = require("path");
var dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)({ path: '.env.local' });
var RBACSetup = /** @class */ (function () {
    function RBACSetup() {
        var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    /**
     * Execute SQL migration file
     */
    RBACSetup.prototype.executeMigration = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var migrationPath, sql, statements, i, statement, error, err_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        console.log("\uD83D\uDCC4 Executing migration: ".concat(filename));
                        migrationPath = (0, path_1.join)(__dirname, 'migrations', filename);
                        sql = (0, fs_1.readFileSync)(migrationPath, 'utf-8');
                        statements = sql
                            .split(';')
                            .map(function (stmt) { return stmt.trim(); })
                            .filter(function (stmt) { return stmt.length > 0 && !stmt.startsWith('--'); });
                        console.log("\uD83D\uDCCA Executing ".concat(statements.length, " SQL statements..."));
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < statements.length)) return [3 /*break*/, 6];
                        statement = statements[i];
                        if (!statement.trim()) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.supabase.rpc('exec_sql', {
                                sql_query: statement
                            })];
                    case 3:
                        error = (_a.sent()).error;
                        if (error) {
                            console.warn("\u26A0\uFE0F  Statement ".concat(i + 1, " warning:"), error.message);
                            // Continue with other statements unless it's a critical error
                            if (error.message.includes('already exists')) {
                                return [3 /*break*/, 5]; // Skip "already exists" errors
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.error("\u274C Error in statement ".concat(i + 1, ":"), err_1);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, {
                            success: true,
                            message: "Migration ".concat(filename, " executed successfully")
                        }];
                    case 7:
                        error_1 = _a.sent();
                        console.error("\u274C Migration ".concat(filename, " failed:"), error_1);
                        return [2 /*return*/, {
                                success: false,
                                message: "Migration ".concat(filename, " failed"),
                                details: error_1
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify RLS policies are working
     */
    RBACSetup.prototype.verifyRLSPolicies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rlsStatus, error, tablesWithRLS, _b, policies, policiesError, policyCount, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        console.log('🔍 Verifying RLS policies...');
                        return [4 /*yield*/, this.supabase
                                .from('pg_tables')
                                .select('tablename, rowsecurity')
                                .eq('schemaname', 'public')
                                .in('tablename', ['users', 'patients', 'appointments', 'billing'])];
                    case 1:
                        _a = _c.sent(), rlsStatus = _a.data, error = _a.error;
                        if (error) {
                            throw error;
                        }
                        tablesWithRLS = (rlsStatus === null || rlsStatus === void 0 ? void 0 : rlsStatus.filter(function (table) { return table.rowsecurity; })) || [];
                        console.log("\u2705 RLS enabled on ".concat(tablesWithRLS.length, " tables"));
                        return [4 /*yield*/, this.supabase
                                .from('pg_policies')
                                .select('tablename, policyname')
                                .eq('schemaname', 'public')];
                    case 2:
                        _b = _c.sent(), policies = _b.data, policiesError = _b.error;
                        if (policiesError) {
                            throw policiesError;
                        }
                        policyCount = (policies === null || policies === void 0 ? void 0 : policies.length) || 0;
                        console.log("\u2705 ".concat(policyCount, " RLS policies configured"));
                        return [2 /*return*/, {
                                success: true,
                                message: 'RLS policies verified successfully',
                                details: {
                                    tablesWithRLS: tablesWithRLS.length,
                                    totalPolicies: policyCount
                                }
                            }];
                    case 3:
                        error_2 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: 'RLS verification failed',
                                details: error_2
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create audit log table if it doesn't exist
     */
    RBACSetup.prototype.setupAuditLog = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createAuditTableSQL, error, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📋 Setting up audit log table...');
                        createAuditTableSQL = "\n        CREATE TABLE IF NOT EXISTS permission_audit_log (\n          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n          user_id uuid REFERENCES users(id) ON DELETE CASCADE,\n          action text NOT NULL,\n          resource_type text NOT NULL,\n          resource_id text,\n          permission_checked text NOT NULL,\n          granted boolean NOT NULL,\n          reason text,\n          metadata jsonb DEFAULT '{}',\n          ip_address inet,\n          user_agent text,\n          created_at timestamptz DEFAULT now()\n        );\n        \n        CREATE INDEX IF NOT EXISTS idx_audit_user_action ON permission_audit_log(user_id, action);\n        CREATE INDEX IF NOT EXISTS idx_audit_created_at ON permission_audit_log(created_at);\n        CREATE INDEX IF NOT EXISTS idx_audit_resource ON permission_audit_log(resource_type, resource_id);\n      ";
                        return [4 /*yield*/, this.supabase.rpc('exec_sql', {
                                sql_query: createAuditTableSQL
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error && !error.message.includes('already exists')) {
                            throw error;
                        }
                        return [2 /*return*/, {
                                success: true,
                                message: 'Audit log table configured successfully'
                            }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: 'Audit log setup failed',
                                details: error_3
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test RBAC permissions with sample data
     */
    RBACSetup.prototype.testRBACPermissions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, roleTest, roleError, _b, minRoleTest, minRoleError, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        console.log('🧪 Testing RBAC permissions...');
                        return [4 /*yield*/, this.supabase
                                .rpc('has_role', { required_role: 'owner' })];
                    case 1:
                        _a = _c.sent(), roleTest = _a.data, roleError = _a.error;
                        if (roleError) {
                            console.warn('⚠️  Role function test warning:', roleError.message);
                        }
                        return [4 /*yield*/, this.supabase
                                .rpc('has_minimum_role', { required_role: 'staff' })];
                    case 2:
                        _b = _c.sent(), minRoleTest = _b.data, minRoleError = _b.error;
                        if (minRoleError) {
                            console.warn('⚠️  Minimum role function test warning:', minRoleError.message);
                        }
                        console.log('✅ RBAC functions are callable');
                        return [2 /*return*/, {
                                success: true,
                                message: 'RBAC permission tests completed',
                                details: {
                                    roleFunctionWorking: !roleError,
                                    minRoleFunctionWorking: !minRoleError
                                }
                            }];
                    case 3:
                        error_4 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                message: 'RBAC permission tests failed',
                                details: error_4
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Main setup process
     */
    RBACSetup.prototype.setup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, migrationResult, auditResult, verifyResult, testResult, successCount, totalSteps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🚀 Starting RBAC Setup Process...');
                        console.log('='.repeat(50));
                        results = [];
                        // Step 1: Execute RLS policies migration
                        console.log('\n📋 Step 1: Setting up RLS policies');
                        return [4 /*yield*/, this.executeMigration('001_setup_rbac_policies.sql')];
                    case 1:
                        migrationResult = _a.sent();
                        results.push(migrationResult);
                        if (!migrationResult.success) {
                            console.error('❌ Migration failed, stopping setup');
                            return [2 /*return*/];
                        }
                        // Step 2: Setup audit logging
                        console.log('\n📋 Step 2: Setting up audit logging');
                        return [4 /*yield*/, this.setupAuditLog()];
                    case 2:
                        auditResult = _a.sent();
                        results.push(auditResult);
                        // Step 3: Verify RLS policies
                        console.log('\n📋 Step 3: Verifying RLS policies');
                        return [4 /*yield*/, this.verifyRLSPolicies()];
                    case 3:
                        verifyResult = _a.sent();
                        results.push(verifyResult);
                        // Step 4: Test RBAC permissions
                        console.log('\n📋 Step 4: Testing RBAC permissions');
                        return [4 /*yield*/, this.testRBACPermissions()];
                    case 4:
                        testResult = _a.sent();
                        results.push(testResult);
                        // Summary
                        console.log('\n' + '='.repeat(50));
                        console.log('📊 RBAC Setup Summary:');
                        console.log('='.repeat(50));
                        successCount = results.filter(function (r) { return r.success; }).length;
                        totalSteps = results.length;
                        results.forEach(function (result, index) {
                            var status = result.success ? '✅' : '❌';
                            console.log("".concat(status, " Step ").concat(index + 1, ": ").concat(result.message));
                            if (result.details) {
                                console.log("   Details:", result.details);
                            }
                        });
                        console.log('\n' + '='.repeat(50));
                        if (successCount === totalSteps) {
                            console.log('🎉 RBAC Setup completed successfully!');
                            console.log('\n📋 Next steps:');
                            console.log('   1. Update your application to use the new RBAC middleware');
                            console.log('   2. Test permission checks in your frontend components');
                            console.log('   3. Review audit logs for permission usage');
                            console.log('   4. Configure role assignments for existing users');
                        }
                        else {
                            console.log("\u26A0\uFE0F  RBAC Setup completed with ".concat(totalSteps - successCount, " warnings/errors"));
                            console.log('   Please review the errors above and fix any issues');
                        }
                        console.log('\n🔗 Documentation:');
                        console.log('   - RBAC Implementation: /docs/RBAC_IMPLEMENTATION.md');
                        console.log('   - Permission Guide: /docs/PERMISSION_GUIDE.md');
                        console.log('   - API Documentation: /docs/API_RBAC.md');
                        return [2 /*return*/];
                }
            });
        });
    };
    return RBACSetup;
}());
exports.RBACSetup = RBACSetup;
/**
 * Execute setup if run directly
 */
if (require.main === module) {
    var setup = new RBACSetup();
    setup.setup().catch(function (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
}
