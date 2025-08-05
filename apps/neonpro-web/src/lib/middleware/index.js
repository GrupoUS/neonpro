"use strict";
/**
 * Middleware Module Export
 * Centralized exports for middleware functionality
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessClinic =
  exports.hasRoleLevel =
  exports.hasPermission =
  exports.hasRole =
  exports.requireAuth =
  exports.getSupabaseUser =
  exports.verifyAuthToken =
  exports.authenticateRequest =
    void 0;
__exportStar(require("./auth"), exports);
// Re-export commonly used items
var auth_1 = require("./auth");
Object.defineProperty(exports, "authenticateRequest", {
  enumerable: true,
  get: function () {
    return auth_1.authenticateRequest;
  },
});
Object.defineProperty(exports, "verifyAuthToken", {
  enumerable: true,
  get: function () {
    return auth_1.verifyAuthToken;
  },
});
Object.defineProperty(exports, "getSupabaseUser", {
  enumerable: true,
  get: function () {
    return auth_1.getSupabaseUser;
  },
});
Object.defineProperty(exports, "requireAuth", {
  enumerable: true,
  get: function () {
    return auth_1.requireAuth;
  },
});
Object.defineProperty(exports, "hasRole", {
  enumerable: true,
  get: function () {
    return auth_1.hasRole;
  },
});
Object.defineProperty(exports, "hasPermission", {
  enumerable: true,
  get: function () {
    return auth_1.hasPermission;
  },
});
Object.defineProperty(exports, "hasRoleLevel", {
  enumerable: true,
  get: function () {
    return auth_1.hasRoleLevel;
  },
});
Object.defineProperty(exports, "canAccessClinic", {
  enumerable: true,
  get: function () {
    return auth_1.canAccessClinic;
  },
});
