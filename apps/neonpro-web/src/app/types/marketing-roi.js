// Marketing ROI Types
// Generated for NeonPro - FASE 4
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreatmentROIFiltersSchema =
  exports.CreateMarketingCampaignSchema =
  exports.MarketingROIFiltersSchema =
  exports.CreateROIAlertSchema =
  exports.AlertType =
  exports.ROIMetricType =
  exports.MarketingChannel =
  exports.CampaignStatus =
    void 0;
var zod_1 = require("zod");
var CampaignStatus;
((CampaignStatus) => {
  CampaignStatus["DRAFT"] = "draft";
  CampaignStatus["ACTIVE"] = "active";
  CampaignStatus["PAUSED"] = "paused";
  CampaignStatus["COMPLETED"] = "completed";
  CampaignStatus["CANCELLED"] = "cancelled";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var MarketingChannel;
((MarketingChannel) => {
  MarketingChannel["EMAIL"] = "email";
  MarketingChannel["SOCIAL"] = "social";
  MarketingChannel["SEARCH"] = "search";
  MarketingChannel["DISPLAY"] = "display";
  MarketingChannel["DIRECT"] = "direct";
  MarketingChannel["REFERRAL"] = "referral";
  MarketingChannel["PAID_SOCIAL"] = "paid_social";
  MarketingChannel["ORGANIC"] = "organic";
})(MarketingChannel || (exports.MarketingChannel = MarketingChannel = {}));
var ROIMetricType;
((ROIMetricType) => {
  ROIMetricType["REVENUE"] = "revenue";
  ROIMetricType["CONVERSION"] = "conversion";
  ROIMetricType["COST_PER_ACQUISITION"] = "cost_per_acquisition";
  ROIMetricType["LIFETIME_VALUE"] = "lifetime_value";
  ROIMetricType["RETURN_ON_AD_SPEND"] = "return_on_ad_spend";
})(ROIMetricType || (exports.ROIMetricType = ROIMetricType = {}));
var AlertType;
((AlertType) => {
  AlertType["PERFORMANCE"] = "performance";
  AlertType["BUDGET"] = "budget";
  AlertType["CONVERSION"] = "conversion";
  AlertType["COST"] = "cost";
  AlertType["ROI_THRESHOLD"] = "roi_threshold";
})(AlertType || (exports.AlertType = AlertType = {}));
// Additional schemas for marketing ROI
exports.CreateROIAlertSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  threshold: zod_1.z.number().min(0),
  metric: zod_1.z.enum(["roi", "roas", "cac", "ltv"]),
  condition: zod_1.z.enum(["above", "below"]),
  isActive: zod_1.z.boolean().default(true),
});
exports.MarketingROIFiltersSchema = zod_1.z.object({
  startDate: zod_1.z.string().optional(),
  endDate: zod_1.z.string().optional(),
  campaignId: zod_1.z.string().optional(),
  channel: zod_1.z.string().optional(),
});
exports.CreateMarketingCampaignSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  channel: zod_1.z.string().min(1),
  budget: zod_1.z.number().min(0),
  startDate: zod_1.z.string(),
  endDate: zod_1.z.string().optional(),
  targetAudience: zod_1.z.string().optional(),
});
exports.TreatmentROIFiltersSchema = zod_1.z.object({
  treatmentType: zod_1.z.string().optional(),
  dateRange: zod_1.z
    .object({
      start: zod_1.z.string(),
      end: zod_1.z.string(),
    })
    .optional(),
  providerId: zod_1.z.string().optional(),
});
