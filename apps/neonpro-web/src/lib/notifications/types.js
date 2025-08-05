"use strict";
// Notification Types
// Generated for NeonPro - FASE 4
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryStatus =
  exports.NotificationStatus =
  exports.NotificationPriority =
  exports.NotificationChannel =
  exports.NotificationType =
    void 0;
var NotificationType;
(function (NotificationType) {
  NotificationType["ALERT"] = "alert";
  NotificationType["REMINDER"] = "reminder";
  NotificationType["SYSTEM"] = "system";
  NotificationType["APPOINTMENT"] = "appointment";
  NotificationType["MARKETING"] = "marketing";
  NotificationType["COMPLIANCE"] = "compliance";
  NotificationType["SECURITY"] = "security";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
  NotificationChannel["EMAIL"] = "email";
  NotificationChannel["SMS"] = "sms";
  NotificationChannel["PUSH"] = "push";
  NotificationChannel["IN_APP"] = "in_app";
  NotificationChannel["WHATSAPP"] = "whatsapp";
  NotificationChannel["PHONE"] = "phone";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationPriority;
(function (NotificationPriority) {
  NotificationPriority["LOW"] = "low";
  NotificationPriority["MEDIUM"] = "medium";
  NotificationPriority["HIGH"] = "high";
  NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
  NotificationStatus["PENDING"] = "pending";
  NotificationStatus["SENT"] = "sent";
  NotificationStatus["DELIVERED"] = "delivered";
  NotificationStatus["FAILED"] = "failed";
  NotificationStatus["READ"] = "read";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
  DeliveryStatus["PENDING"] = "pending";
  DeliveryStatus["SENT"] = "sent";
  DeliveryStatus["DELIVERED"] = "delivered";
  DeliveryStatus["FAILED"] = "failed";
  DeliveryStatus["BOUNCED"] = "bounced";
  DeliveryStatus["OPENED"] = "opened";
  DeliveryStatus["CLICKED"] = "clicked";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
