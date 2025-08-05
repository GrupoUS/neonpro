"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationDashboard =
  exports.TemplateManager =
  exports.ConsentManager =
  exports.StaffChat =
    void 0;
// Communication Components
var staff_chat_1 = require("./staff-chat");
Object.defineProperty(exports, "StaffChat", {
  enumerable: true,
  get: function () {
    return staff_chat_1.StaffChat;
  },
});
var consent_manager_1 = require("./consent-manager");
Object.defineProperty(exports, "ConsentManager", {
  enumerable: true,
  get: function () {
    return consent_manager_1.ConsentManager;
  },
});
var template_manager_1 = require("./template-manager");
Object.defineProperty(exports, "TemplateManager", {
  enumerable: true,
  get: function () {
    return template_manager_1.TemplateManager;
  },
});
var communication_dashboard_1 = require("./communication-dashboard");
Object.defineProperty(exports, "CommunicationDashboard", {
  enumerable: true,
  get: function () {
    return communication_dashboard_1.CommunicationDashboard;
  },
});
