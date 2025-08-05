"use strict";
/**
 * Role Manager Component for RBAC Administration
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This component provides role and permission management interface for administrators
 */
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
exports.RoleManager = void 0;
var react_1 = require("react");
var rbac_1 = require("@/types/rbac");
var usePermissions_1 = require("@/hooks/usePermissions");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var PermissionGuard_1 = require("./PermissionGuard");
/**
 * Role Manager Component
 */
var RoleManager = function () {
    var _a = (0, usePermissions_1.usePermissions)(), hasPermission = _a.hasPermission, currentUserRole = _a.role;
    var _b = (0, react_1.useState)([]), users = _b[0], setUsers = _b[1];
    var _c = (0, react_1.useState)(null), selectedUser = _c[0], setSelectedUser = _c[1];
    var _d = (0, react_1.useState)({
        userId: '',
        newRole: 'staff',
        reason: ''
    }), roleForm = _d[0], setRoleForm = _d[1];
    var _e = (0, react_1.useState)(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(null), success = _g[0], setSuccess = _g[1];
    var _h = (0, react_1.useState)(false), showRoleDialog = _h[0], setShowRoleDialog = _h[1];
    /**
     * Load users from the system
     */
    var loadUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockUsers;
        return __generator(this, function (_a) {
            setIsLoading(true);
            setError(null);
            try {
                mockUsers = [
                    {
                        id: '1',
                        email: 'admin@clinic.com',
                        name: 'Admin User',
                        role: 'owner',
                        clinicId: 'clinic-1',
                        createdAt: '2024-01-01T00:00:00Z',
                        lastLogin: '2024-01-27T10:00:00Z'
                    },
                    {
                        id: '2',
                        email: 'manager@clinic.com',
                        name: 'Manager User',
                        role: 'manager',
                        clinicId: 'clinic-1',
                        createdAt: '2024-01-02T00:00:00Z',
                        lastLogin: '2024-01-27T09:30:00Z'
                    },
                    {
                        id: '3',
                        email: 'staff@clinic.com',
                        name: 'Staff User',
                        role: 'staff',
                        clinicId: 'clinic-1',
                        createdAt: '2024-01-03T00:00:00Z',
                        lastLogin: '2024-01-27T08:00:00Z'
                    }
                ];
                setUsers(mockUsers);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load users');
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    /**
     * Handle role assignment
     */
    var handleRoleAssignment = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!selectedUser || !roleForm.newRole || !roleForm.reason.trim()) {
                setError('Please fill in all required fields');
                return [2 /*return*/];
            }
            setIsLoading(true);
            setError(null);
            try {
                // In a real implementation, this would call the API
                console.log('Assigning role:', {
                    userId: selectedUser.id,
                    oldRole: selectedUser.role,
                    newRole: roleForm.newRole,
                    reason: roleForm.reason
                });
                // Update local state
                setUsers(function (prev) { return prev.map(function (user) {
                    return user.id === selectedUser.id
                        ? __assign(__assign({}, user), { role: roleForm.newRole }) : user;
                }); });
                setSuccess("Role updated successfully for ".concat(selectedUser.name));
                setShowRoleDialog(false);
                setSelectedUser(null);
                setRoleForm({ userId: '', newRole: 'staff', reason: '' });
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to assign role');
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    /**
     * Open role assignment dialog
     */
    var openRoleDialog = function (user) {
        setSelectedUser(user);
        setRoleForm({
            userId: user.id,
            newRole: user.role,
            reason: ''
        });
        setShowRoleDialog(true);
    };
    /**
     * Get role badge variant
     */
    var getRoleBadgeVariant = function (role) {
        switch (role) {
            case 'owner': return 'default';
            case 'manager': return 'secondary';
            case 'staff': return 'outline';
            case 'patient': return 'destructive';
            default: return 'outline';
        }
    };
    /**
     * Check if current user can modify target user's role
     */
    var canModifyRole = function (targetUser) {
        if (currentUserRole === 'owner')
            return true;
        if (currentUserRole === 'manager' && targetUser.role !== 'owner')
            return true;
        return false;
    };
    /**
     * Load users on component mount
     */
    (0, react_1.useEffect)(function () {
        loadUsers();
    }, []);
    /**
     * Clear messages after delay
     */
    (0, react_1.useEffect)(function () {
        if (success) {
            var timer_1 = setTimeout(function () { return setSuccess(null); }, 5000);
            return function () { return clearTimeout(timer_1); };
        }
    }, [success]);
    return (<PermissionGuard_1.PermissionGuard requiredPermissions={['users.manage']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
            <p className="text-muted-foreground">
              Manage user roles and permissions for your clinic
            </p>
          </div>
          <button_1.Button onClick={loadUsers} disabled={isLoading}>
            <lucide_react_1.Users className="mr-2 h-4 w-4"/>
            Refresh Users
          </button_1.Button>
        </div>

        {/* Messages */}
        {error && (<alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4"/>
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>)}
        
        {success && (<alert_1.Alert className="border-green-200 bg-green-50">
            <lucide_react_1.Shield className="h-4 w-4"/>
            <alert_1.AlertDescription className="text-green-800">{success}</alert_1.AlertDescription>
          </alert_1.Alert>)}

        <tabs_1.Tabs defaultValue="users" className="space-y-4">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="users">User Roles</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="permissions">Role Permissions</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Users Tab */}
          <tabs_1.TabsContent value="users" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>User Role Assignments</card_1.CardTitle>
                <card_1.CardDescription>
                  View and modify user roles within your clinic
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <table_1.Table>
                  <table_1.TableHeader>
                    <table_1.TableRow>
                      <table_1.TableHead>User</table_1.TableHead>
                      <table_1.TableHead>Email</table_1.TableHead>
                      <table_1.TableHead>Current Role</table_1.TableHead>
                      <table_1.TableHead>Last Login</table_1.TableHead>
                      <table_1.TableHead>Actions</table_1.TableHead>
                    </table_1.TableRow>
                  </table_1.TableHeader>
                  <table_1.TableBody>
                    {users.map(function (user) { return (<table_1.TableRow key={user.id}>
                        <table_1.TableCell className="font-medium">{user.name}</table_1.TableCell>
                        <table_1.TableCell>{user.email}</table_1.TableCell>
                        <table_1.TableCell>
                          <badge_1.Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role.toUpperCase()}
                          </badge_1.Badge>
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {user.lastLogin
                ? new Date(user.lastLogin).toLocaleDateString()
                : 'Never'}
                        </table_1.TableCell>
                        <table_1.TableCell>
                          {canModifyRole(user) && (<button_1.Button variant="outline" size="sm" onClick={function () { return openRoleDialog(user); }}>
                              <lucide_react_1.Edit className="mr-2 h-3 w-3"/>
                              Edit Role
                            </button_1.Button>)}
                        </table_1.TableCell>
                      </table_1.TableRow>); })}
                  </table_1.TableBody>
                </table_1.Table>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          {/* Permissions Tab */}
          <tabs_1.TabsContent value="permissions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(rbac_1.DEFAULT_ROLES).map(function (_a) {
            var roleName = _a[0], roleData = _a[1];
            return (<card_1.Card key={roleName}>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <badge_1.Badge variant={getRoleBadgeVariant(roleName)}>
                        {roleName.toUpperCase()}
                      </badge_1.Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        Level {roleData.hierarchy}
                      </span>
                    </card_1.CardTitle>
                    <card_1.CardDescription>{roleData.description}</card_1.CardDescription>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-2">
                      <label_1.Label className="text-sm font-medium">Permissions:</label_1.Label>
                      <div className="grid gap-1">
                        {roleData.permissions.map(function (permission) { return (<div key={permission} className="flex items-center space-x-2">
                            <checkbox_1.Checkbox checked disabled/>
                            <span className="text-sm">{permission}</span>
                          </div>); })}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>);
        })}
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {/* Role Assignment Dialog */}
        <dialog_1.Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Change User Role</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Modify the role for {selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.name} ({selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.email})
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="current-role">Current Role</label_1.Label>
                <input_1.Input id="current-role" value={(selectedUser === null || selectedUser === void 0 ? void 0 : selectedUser.role.toUpperCase()) || ''} disabled/>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="new-role">New Role</label_1.Label>
                <select_1.Select value={roleForm.newRole} onValueChange={function (value) {
            return setRoleForm(function (prev) { return (__assign(__assign({}, prev), { newRole: value })); });
        }}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select new role"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {Object.keys(rbac_1.DEFAULT_ROLES)
            .filter(function (role) {
            // Filter roles based on current user's permissions
            if (currentUserRole === 'owner')
                return true;
            if (currentUserRole === 'manager')
                return role !== 'owner';
            return false;
        })
            .map(function (role) { return (<select_1.SelectItem key={role} value={role}>
                          {role.toUpperCase()}
                        </select_1.SelectItem>); })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="reason">Reason for Change *</label_1.Label>
                <input_1.Input id="reason" placeholder="Enter reason for role change..." value={roleForm.reason} onChange={function (e) {
            return setRoleForm(function (prev) { return (__assign(__assign({}, prev), { reason: e.target.value })); });
        }}/>
              </div>
            </div>
            
            <dialog_1.DialogFooter>
              <button_1.Button variant="outline" onClick={function () { return setShowRoleDialog(false); }}>
                <lucide_react_1.X className="mr-2 h-4 w-4"/>
                Cancel
              </button_1.Button>
              <button_1.Button onClick={handleRoleAssignment} disabled={isLoading || !roleForm.reason.trim()}>
                <lucide_react_1.Save className="mr-2 h-4 w-4"/>
                Save Changes
              </button_1.Button>
            </dialog_1.DialogFooter>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>
    </PermissionGuard_1.PermissionGuard>);
};
exports.RoleManager = RoleManager;
exports.default = exports.RoleManager;
