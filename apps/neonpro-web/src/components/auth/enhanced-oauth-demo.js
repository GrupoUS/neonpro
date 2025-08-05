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
exports.default = EnhancedOAuthDemo;
var react_1 = require("react");
var auth_context_1 = require("@/contexts/auth-context");
var security_audit_logger_1 = require("@/lib/auth/security-audit-logger");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
function EnhancedOAuthDemo() {
    var _this = this;
    var _a, _b, _c;
    var _d = (0, auth_context_1.useAuth)(), user = _d.user, session = _d.session, signInWithGoogle = _d.signInWithGoogle, signOut = _d.signOut, checkPermission = _d.checkPermission, getUserPermissions = _d.getUserPermissions, hasRole = _d.hasRole;
    var _e = (0, react_1.useState)([]), auditLogs = _e[0], setAuditLogs = _e[1];
    var _f = (0, react_1.useState)(null), permissions = _f[0], setPermissions = _f[1];
    var _g = (0, react_1.useState)([]), permissionChecks = _g[0], setPermissionChecks = _g[1];
    var _h = (0, react_1.useState)(null), sessionInfo = _h[0], setSessionInfo = _h[1];
    var _j = (0, react_1.useState)(false), loading = _j[0], setLoading = _j[1];
    // Load audit logs
    var loadAuditLogs = function () { return __awaiter(_this, void 0, void 0, function () {
        var logs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, security_audit_logger_1.securityAuditLogger.getAuditLogs({
                            userId: user.id,
                            limit: 10,
                            eventTypes: ['oauth_attempt', 'oauth_success', 'oauth_error', 'session_created', 'session_logout']
                        })];
                case 2:
                    logs = _a.sent();
                    setAuditLogs(logs);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error loading audit logs:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Load user permissions
    var loadPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var userPerms, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getUserPermissions()];
                case 2:
                    userPerms = _a.sent();
                    setPermissions(userPerms);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error loading permissions:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Load session information
    var loadSessionInfo = function () { return __awaiter(_this, void 0, void 0, function () {
        var info, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!session)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, SessionManager_1.sessionManager.getActiveSessions(user.id)];
                case 2:
                    info = _a.sent();
                    setSessionInfo(info);
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error loading session info:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Test permission checks
    var testPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var tests, results, _i, tests_1, test, granted, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    tests = [
                        { resource: 'patients', action: 'read' },
                        { resource: 'patients', action: 'write' },
                        { resource: 'appointments', action: 'create' },
                        { resource: 'reports', action: 'generate' },
                        { resource: 'admin', action: 'manage' }
                    ];
                    results = [];
                    _i = 0, tests_1 = tests;
                    _a.label = 1;
                case 1:
                    if (!(_i < tests_1.length)) return [3 /*break*/, 6];
                    test = tests_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, checkPermission(test.resource, test.action)];
                case 3:
                    granted = _a.sent();
                    results.push(__assign(__assign({}, test), { granted: granted }));
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error("Error checking permission ".concat(test.resource, ":").concat(test.action, ":"), error_4);
                    results.push(__assign(__assign({}, test), { granted: false }));
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    setPermissionChecks(results);
                    return [2 /*return*/];
            }
        });
    }); };
    // Handle Google OAuth login
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signInWithGoogle()];
                case 2:
                    result = _a.sent();
                    if (result.error) {
                        console.error('OAuth error:', result.error);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_5 = _a.sent();
                    console.error('Unexpected OAuth error:', error_5);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle logout
    var handleLogout = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, signOut()];
                case 2:
                    _a.sent();
                    setAuditLogs([]);
                    setPermissions(null);
                    setPermissionChecks([]);
                    setSessionInfo(null);
                    return [3 /*break*/, 5];
                case 3:
                    error_6 = _a.sent();
                    console.error('Logout error:', error_6);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Load data when user changes
    (0, react_1.useEffect)(function () {
        if (user && session) {
            loadAuditLogs();
            loadPermissions();
            loadSessionInfo();
            testPermissions();
        }
    }, [user, session]);
    if (!user) {
        return (<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Enhanced OAuth Google Integration Demo
        </h2>
        
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Demonstra as funcionalidades aprimoradas de OAuth, incluindo:
          </p>
          
          <ul className="text-left text-gray-700 mb-8 space-y-2">
            <li>• 🔐 Autenticação Google OAuth otimizada</li>
            <li>• 📊 Auditoria de segurança em tempo real</li>
            <li>• 🛡️ Sistema de permissões granular</li>
            <li>• ⚡ Gerenciamento de sessão aprimorado</li>
            <li>• 🚨 Tratamento inteligente de erros</li>
            <li>• 📋 Conformidade com LGPD</li>
          </ul>
          
          <button onClick={handleGoogleLogin} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
            {loading ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>) : (<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>)}
            {loading ? 'Conectando...' : 'Entrar com Google'}
          </button>
        </div>
      </div>);
    }
    return (<div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Enhanced OAuth Dashboard
          </h2>
          <button onClick={handleLogout} disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Usuário Autenticado</h3>
            <p className="text-green-700">Email: {user.email}</p>
            <p className="text-green-700">ID: {user.id}</p>
            <p className="text-green-700">Nome: {((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.name) || 'N/A'}</p>
          </div>
          
          {sessionInfo && (<div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Informações da Sessão</h3>
              <p className="text-blue-700">Criada: {new Date(sessionInfo.created_at).toLocaleString()}</p>
              <p className="text-blue-700">Última atividade: {new Date(sessionInfo.last_activity).toLocaleString()}</p>
              <p className="text-blue-700">IP: {sessionInfo.ip_address || 'N/A'}</p>
            </div>)}
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Sistema de Permissões</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Permissões do Usuário</h4>
            {permissions ? (<div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Roles:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {((_b = permissions.roles) === null || _b === void 0 ? void 0 : _b.map(function (role, index) { return (<li key={index}>{role.name} - {role.description}</li>); })) || <li>Nenhuma role encontrada</li>}
                  </ul>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-medium">Permissões Diretas:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {((_c = permissions.directPermissions) === null || _c === void 0 ? void 0 : _c.map(function (perm, index) { return (<li key={index}>{perm.resource}:{perm.action}</li>); })) || <li>Nenhuma permissão direta</li>}
                  </ul>
                </div>
              </div>) : (<p className="text-gray-500">Carregando permissões...</p>)}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Teste de Permissões</h4>
            <div className="space-y-2">
              {permissionChecks.map(function (check, index) { return (<div key={index} className={"p-2 rounded text-sm ".concat(check.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                  <span className={check.granted ? '✅' : '❌'}></span>
                  {' '}{check.resource}:{check.action}
                </div>); })}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Logs de Auditoria de Segurança</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Timestamp</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Evento</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Severidade</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(function (log, index) { return (<tr key={index} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">
                    {log.event_type}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={"px-2 py-1 rounded text-xs ".concat(log.severity === 'high' ? 'bg-red-100 text-red-800' :
                log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800')}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {JSON.stringify(log.details, null, 2).substring(0, 100)}...
                  </td>
                </tr>); })}
            </tbody>
          </table>
          
          {auditLogs.length === 0 && (<p className="text-center text-gray-500 py-4">Nenhum log de auditoria encontrado</p>)}
        </div>
      </div>
    </div>);
}
