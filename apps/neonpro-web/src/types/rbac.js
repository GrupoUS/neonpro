"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.DEFAULT_ROLES = void 0;
// RBAC types and defaults
exports.DEFAULT_ROLES = ["user", "admin", "moderator"];
var Role;
(function (Role) {
  Role["USER"] = "user";
  Role["ADMIN"] = "admin";
  Role["MODERATOR"] = "moderator";
})(Role || (exports.Role = Role = {}));
