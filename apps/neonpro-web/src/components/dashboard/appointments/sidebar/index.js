"use strict";
// components/dashboard/appointments/sidebar/index.ts
// Sidebar components export file
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentHistory = exports.AppointmentEditForm = exports.AppointmentDetails = exports.AppointmentDetailsSidebar = void 0;
var appointment_details_sidebar_1 = require("./appointment-details-sidebar");
Object.defineProperty(exports, "AppointmentDetailsSidebar", { enumerable: true, get: function () { return appointment_details_sidebar_1.default; } });
var appointment_details_1 = require("./appointment-details");
Object.defineProperty(exports, "AppointmentDetails", { enumerable: true, get: function () { return appointment_details_1.default; } });
var appointment_edit_form_1 = require("./appointment-edit-form");
Object.defineProperty(exports, "AppointmentEditForm", { enumerable: true, get: function () { return appointment_edit_form_1.default; } });
var appointment_history_1 = require("./appointment-history");
Object.defineProperty(exports, "AppointmentHistory", { enumerable: true, get: function () { return appointment_history_1.default; } });
