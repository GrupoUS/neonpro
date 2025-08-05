// WhatsApp Business API Integration Types
// Based on Meta's WhatsApp Cloud API documentation
// For NeonPro clinic management system
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppTemplateStatus =
  exports.WhatsAppTemplateCategory =
  exports.WhatsAppMessageStatus =
  exports.WhatsAppMessageType =
    void 0;
var WhatsAppMessageType;
((WhatsAppMessageType) => {
  WhatsAppMessageType["TEXT"] = "text";
  WhatsAppMessageType["TEMPLATE"] = "template";
  WhatsAppMessageType["IMAGE"] = "image";
  WhatsAppMessageType["DOCUMENT"] = "document";
  WhatsAppMessageType["AUDIO"] = "audio";
  WhatsAppMessageType["VIDEO"] = "video";
  WhatsAppMessageType["LOCATION"] = "location";
  WhatsAppMessageType["CONTACT"] = "contact";
  WhatsAppMessageType["INTERACTIVE"] = "interactive";
})(WhatsAppMessageType || (exports.WhatsAppMessageType = WhatsAppMessageType = {}));
var WhatsAppMessageStatus;
((WhatsAppMessageStatus) => {
  WhatsAppMessageStatus["PENDING"] = "pending";
  WhatsAppMessageStatus["SENT"] = "sent";
  WhatsAppMessageStatus["DELIVERED"] = "delivered";
  WhatsAppMessageStatus["READ"] = "read";
  WhatsAppMessageStatus["FAILED"] = "failed";
})(WhatsAppMessageStatus || (exports.WhatsAppMessageStatus = WhatsAppMessageStatus = {}));
var WhatsAppTemplateCategory;
((WhatsAppTemplateCategory) => {
  WhatsAppTemplateCategory["AUTHENTICATION"] = "authentication";
  WhatsAppTemplateCategory["MARKETING"] = "marketing";
  WhatsAppTemplateCategory["UTILITY"] = "utility";
})(WhatsAppTemplateCategory || (exports.WhatsAppTemplateCategory = WhatsAppTemplateCategory = {}));
var WhatsAppTemplateStatus;
((WhatsAppTemplateStatus) => {
  WhatsAppTemplateStatus["PENDING"] = "PENDING";
  WhatsAppTemplateStatus["APPROVED"] = "APPROVED";
  WhatsAppTemplateStatus["REJECTED"] = "REJECTED";
  WhatsAppTemplateStatus["PAUSED"] = "PAUSED";
})(WhatsAppTemplateStatus || (exports.WhatsAppTemplateStatus = WhatsAppTemplateStatus = {}));
