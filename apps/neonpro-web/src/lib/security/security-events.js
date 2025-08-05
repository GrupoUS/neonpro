"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = logSecurityEvent;
exports.getSecurityEvents = getSecurityEvents;
function logSecurityEvent(event) {
  console.log("Security Event:", event);
  return __assign({ id: Math.random().toString(36), timestamp: new Date() }, event);
}
function getSecurityEvents() {
  return [];
}
