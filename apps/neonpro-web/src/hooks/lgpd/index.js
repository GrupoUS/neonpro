"use strict";
// LGPD Hooks - Sistema de Conformidade LGPD
// Hooks para gerenciamento de dados pessoais e conformidade
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuditTrail =
  exports.useBreachManagement =
  exports.useComplianceAssessment =
  exports.useDataSubjectRights =
  exports.useConsentBanner =
  exports.useConsentManagement =
  exports.useLGPDDashboard =
    void 0;
// Dashboard e métricas
var useLGPDDashboard_1 = require("./useLGPDDashboard");
Object.defineProperty(exports, "useLGPDDashboard", {
  enumerable: true,
  get: function () {
    return useLGPDDashboard_1.useLGPDDashboard;
  },
});
// Gerenciamento de consentimentos
var useConsentManagement_1 = require("./useConsentManagement");
Object.defineProperty(exports, "useConsentManagement", {
  enumerable: true,
  get: function () {
    return useConsentManagement_1.useConsentManagement;
  },
});
var useConsentBanner_1 = require("./useConsentBanner");
Object.defineProperty(exports, "useConsentBanner", {
  enumerable: true,
  get: function () {
    return useConsentBanner_1.useConsentBanner;
  },
});
// Direitos dos titulares
var useDataSubjectRights_1 = require("./useDataSubjectRights");
Object.defineProperty(exports, "useDataSubjectRights", {
  enumerable: true,
  get: function () {
    return useDataSubjectRights_1.useDataSubjectRights;
  },
});
// Avaliações de conformidade
var useComplianceAssessment_1 = require("./useComplianceAssessment");
Object.defineProperty(exports, "useComplianceAssessment", {
  enumerable: true,
  get: function () {
    return useComplianceAssessment_1.useComplianceAssessment;
  },
});
// Gestão de incidentes
var useBreachManagement_1 = require("./useBreachManagement");
Object.defineProperty(exports, "useBreachManagement", {
  enumerable: true,
  get: function () {
    return useBreachManagement_1.useBreachManagement;
  },
});
// Trilha de auditoria
var useAuditTrail_1 = require("./useAuditTrail");
Object.defineProperty(exports, "useAuditTrail", {
  enumerable: true,
  get: function () {
    return useAuditTrail_1.useAuditTrail;
  },
});
