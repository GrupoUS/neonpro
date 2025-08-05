// NeonPro - Patient Portal Layout
// VIBECODE V1.0 - Healthcare PWA Pattern
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientPortalLayout;
var react_1 = require("react");
var use_patient_auth_1 = require("@/lib/hooks/use-patient-auth");
function PatientPortalLayout(_a) {
  var children = _a.children;
  return (
    <use_patient_auth_1.PatientAuthProvider>{children}</use_patient_auth_1.PatientAuthProvider>
  );
}
