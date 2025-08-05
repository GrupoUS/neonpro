Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientAuthProvider = exports.usePatientAuth = void 0;
var use_patient_auth_1 = require("@/lib/hooks/use-patient-auth");
Object.defineProperty(exports, "usePatientAuth", {
  enumerable: true,
  get: () => use_patient_auth_1.usePatientAuth,
});
Object.defineProperty(exports, "PatientAuthProvider", {
  enumerable: true,
  get: () => use_patient_auth_1.PatientAuthProvider,
});
