"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
function hasPermission(userPermissions, resource, action, conditions) {
    // Check direct permissions
    var directPermission = userPermissions.directPermissions.find(function (p) { return p.resource === resource && p.action === action; });
    if (directPermission && checkConditions(directPermission.conditions, conditions)) {
        return true;
    }
    // Check role permissions
    for (var _i = 0, _a = userPermissions.roles; _i < _a.length; _i++) {
        var role = _a[_i];
        var rolePermission = role.permissions.find(function (p) { return p.resource === resource && p.action === action; });
        if (rolePermission && checkConditions(rolePermission.conditions, conditions)) {
            return true;
        }
    }
    return false;
}
function checkConditions(permissionConditions, requestConditions) {
    if (!permissionConditions)
        return true;
    if (!requestConditions)
        return false;
    return Object.entries(permissionConditions).every(function (_a) {
        var key = _a[0], value = _a[1];
        return requestConditions[key] === value;
    });
}
exports.PERMISSIONS = {
    COMPLIANCE: {
        READ: 'compliance:read',
        WRITE: 'compliance:write',
        DELETE: 'compliance:delete',
        AUDIT: 'compliance:audit'
    },
    REPORTS: {
        GENERATE: 'reports:generate',
        VIEW: 'reports:view',
        EXPORT: 'reports:export'
    }
};
