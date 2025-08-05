/**
 * Inventory Management Types
 * TypeScript definitions for real-time stock tracking system
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatus =
  exports.ScanResult =
  exports.SessionStatus =
  exports.SessionType =
  exports.AlertStatus =
  exports.AlertSeverity =
  exports.AlertType =
  exports.ReferenceType =
  exports.MovementType =
  exports.LocationType =
  exports.InventoryStatus =
    void 0;
// Enums
var InventoryStatus;
((InventoryStatus) => {
  InventoryStatus.ACTIVE = "active";
  InventoryStatus.INACTIVE = "inactive";
  InventoryStatus.DISCONTINUED = "discontinued";
  InventoryStatus.OUT_OF_STOCK = "out_of_stock";
  InventoryStatus.RESERVED = "reserved";
  InventoryStatus.DAMAGED = "damaged";
})(InventoryStatus || (exports.InventoryStatus = InventoryStatus = {}));
var LocationType;
((LocationType) => {
  LocationType.WAREHOUSE = "warehouse";
  LocationType.STORAGE_ROOM = "storage_room";
  LocationType.SHELF = "shelf";
  LocationType.CABINET = "cabinet";
  LocationType.REFRIGERATOR = "refrigerator";
  LocationType.TREATMENT_ROOM = "treatment_room";
  LocationType.RECEPTION = "reception";
})(LocationType || (exports.LocationType = LocationType = {}));
var MovementType;
((MovementType) => {
  MovementType.STOCK_IN = "stock_in";
  MovementType.STOCK_OUT = "stock_out";
  MovementType.PURCHASE = "purchase";
  MovementType.SALE = "sale";
  MovementType.ADJUSTMENT = "adjustment";
  MovementType.TRANSFER = "transfer";
  MovementType.WASTE = "waste";
  MovementType.RETURN = "return";
  MovementType.USAGE = "usage";
  MovementType.STOCKTAKE = "stocktake";
})(MovementType || (exports.MovementType = MovementType = {}));
var ReferenceType;
((ReferenceType) => {
  ReferenceType.PURCHASE_ORDER = "purchase_order";
  ReferenceType.SALES_ORDER = "sales_order";
  ReferenceType.APPOINTMENT = "appointment";
  ReferenceType.PROCEDURE = "procedure";
  ReferenceType.ADJUSTMENT = "adjustment";
  ReferenceType.TRANSFER = "transfer";
  ReferenceType.STOCKTAKE = "stocktake";
})(ReferenceType || (exports.ReferenceType = ReferenceType = {}));
var AlertType;
((AlertType) => {
  AlertType.LOW_STOCK = "low_stock";
  AlertType.OUT_OF_STOCK = "out_of_stock";
  AlertType.OVERSTOCKED = "overstocked";
  AlertType.EXPIRING_SOON = "expiring_soon";
  AlertType.EXPIRED = "expired";
  AlertType.REORDER_POINT = "reorder_point";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
((AlertSeverity) => {
  AlertSeverity.LOW = "low";
  AlertSeverity.MEDIUM = "medium";
  AlertSeverity.HIGH = "high";
  AlertSeverity.CRITICAL = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertStatus;
((AlertStatus) => {
  AlertStatus.ACTIVE = "active";
  AlertStatus.ACKNOWLEDGED = "acknowledged";
  AlertStatus.RESOLVED = "resolved";
  AlertStatus.DISMISSED = "dismissed";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var SessionType;
((SessionType) => {
  SessionType.RECEIVING = "receiving";
  SessionType.SHIPPING = "shipping";
  SessionType.STOCKTAKE = "stocktake";
  SessionType.ADJUSTMENT = "adjustment";
  SessionType.TRANSFER = "transfer";
  SessionType.USAGE_TRACKING = "usage_tracking";
})(SessionType || (exports.SessionType = SessionType = {}));
var SessionStatus;
((SessionStatus) => {
  SessionStatus.ACTIVE = "active";
  SessionStatus.PAUSED = "paused";
  SessionStatus.COMPLETED = "completed";
  SessionStatus.CANCELLED = "cancelled";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var ScanResult;
((ScanResult) => {
  ScanResult.SUCCESS = "success";
  ScanResult.ITEM_NOT_FOUND = "item_not_found";
  ScanResult.INVALID_BARCODE = "invalid_barcode";
  ScanResult.DUPLICATE_SCAN = "duplicate_scan";
  ScanResult.ERROR = "error";
})(ScanResult || (exports.ScanResult = ScanResult = {}));
var ConnectionStatus;
((ConnectionStatus) => {
  ConnectionStatus.CONNECTED = "connected";
  ConnectionStatus.DISCONNECTED = "disconnected";
  ConnectionStatus.RECONNECTING = "reconnecting";
  ConnectionStatus.ERROR = "error";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
