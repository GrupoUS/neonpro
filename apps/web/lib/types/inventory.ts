/**
 * Inventory Management Types
 * TypeScript definitions for real-time stock tracking system
 * Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
 */

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  qr_code?: string;
  category_id: string;
  supplier_id?: string;
  location_id: string;

  // Stock Information
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  unit_cost: number;
  selling_price?: number;
  unit_of_measure: string;

  // Tracking Information
  batch_number?: string;
  expiration_date?: string;
  manufactured_date?: string;
  lot_number?: string;

  // Status
  status: InventoryStatus;
  is_active: boolean;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  description?: string;
  location_type: LocationType;
  parent_location_id?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  location_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost?: number;

  // Reference Information
  reference_type?: ReferenceType;
  reference_id?: string;
  batch_number?: string;
  expiration_date?: string;

  // Tracking
  notes?: string;
  created_at: string;
  created_by: string;

  // Related Data
  inventory_item?: InventoryItem;
  location?: InventoryLocation;
}

export interface StockAlert {
  id: string;
  inventory_item_id: string;
  alert_type: AlertType;
  threshold_value: number;
  current_value: number;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;

  // Notification
  notified_users: string[];
  notification_sent_at?: string;

  // Resolution
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;

  created_at: string;
  updated_at: string;
}

export interface BarcodeSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  location_id: string;
  status: SessionStatus;

  // Scanned Items
  scanned_items: ScannedItem[];
  total_items_scanned: number;

  // Session Metadata
  started_at: string;
  ended_at?: string;
  notes?: string;
}

export interface ScannedItem {
  id: string;
  session_id: string;
  inventory_item_id?: string;
  barcode_value: string;
  scan_timestamp: string;
  scan_result: ScanResult;

  // Manual Override
  manual_quantity?: number;
  manual_notes?: string;

  // Error Handling
  error_message?: string;
  needs_manual_review: boolean;
}

// Enums
export enum InventoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORAGE_ROOM = 'storage_room',
  SHELF = 'shelf',
  CABINET = 'cabinet',
  REFRIGERATOR = 'refrigerator',
  TREATMENT_ROOM = 'treatment_room',
  RECEPTION = 'reception',
}

export enum MovementType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  WASTE = 'waste',
  RETURN = 'return',
  USAGE = 'usage',
  STOCKTAKE = 'stocktake',
}

export enum ReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  SALES_ORDER = 'sales_order',
  APPOINTMENT = 'appointment',
  PROCEDURE = 'procedure',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  STOCKTAKE = 'stocktake',
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCKED = 'overstocked',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  REORDER_POINT = 'reorder_point',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum SessionType {
  RECEIVING = 'receiving',
  SHIPPING = 'shipping',
  STOCKTAKE = 'stocktake',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  USAGE_TRACKING = 'usage_tracking',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ScanResult {
  SUCCESS = 'success',
  ITEM_NOT_FOUND = 'item_not_found',
  INVALID_BARCODE = 'invalid_barcode',
  DUPLICATE_SCAN = 'duplicate_scan',
  ERROR = 'error',
}

// Real-time Inventory State
export interface InventoryState {
  items: InventoryItem[];
  locations: InventoryLocation[];
  categories: InventoryCategory[];
  movements: StockMovement[];
  alerts: StockAlert[];
  activeSessions: BarcodeSession[];

  // UI State
  loading: boolean;
  error: string | null;
  selectedLocation?: string;
  selectedCategory?: string;
  searchQuery?: string;

  // Real-time Updates
  lastUpdated: string;
  isRealTimeEnabled: boolean;
  connectionStatus: ConnectionStatus;
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// API Response Types
export interface InventoryApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  total_count?: number;
  page?: number;
  per_page?: number;
}

export interface StockLevelUpdate {
  inventory_item_id: string;
  location_id: string;
  new_quantity: number;
  previous_quantity: number;
  change_reason: MovementType;
  timestamp: string;
}

// Barcode Scanner Types
export interface BarcodeResult {
  data: string;
  format: BarcodeFormat;
  timestamp: string;
  confidence?: number;
  sessionId?: string;
}

export type BarcodeFormat =
  | 'qr_code'
  | 'code_128'
  | 'code_39'
  | 'ean_13'
  | 'ean_8'
  | 'upc_a'
  | 'upc_e'
  | 'data_matrix'
  | 'pdf417'
  | 'aztec'
  | 'unknown';

export interface ScannerConfig {
  formats?: BarcodeFormat[];
  continuous?: boolean;
  audio?: boolean;
  vibration?: boolean;
  flashlight?: boolean;
  constraints?: MediaTrackConstraints;
}

// Scanner State and Error Types
export interface ScannerError {
  type:
    | 'PERMISSION_DENIED'
    | 'INITIALIZATION_ERROR'
    | 'NO_VIDEO_ELEMENT'
    | 'NO_CAMERA_AVAILABLE'
    | 'START_ERROR'
    | 'CHECKSUM_ERROR'
    | 'FORMAT_ERROR'
    | 'SCAN_ERROR';
  message: string;
  timestamp: string;
}

export interface ScannerState {
  isScanning: boolean;
  isInitialized: boolean;
  hasPermission: boolean;
  error: ScannerError | null;
  lastResult: BarcodeResult | null;
  scanHistory: BarcodeResult[];
  availableCameras: MediaDeviceInfo[];
  currentCamera: MediaDeviceInfo | null;
}

export interface ScanConfiguration {
  enableContinuous: boolean;
  beepOnScan: boolean;
  vibrationOnScan: boolean;
  saveScanHistory: boolean;
  autoFocus: boolean;
  preferredCameraFacing: 'user' | 'environment';
  scanDelay: number;
  maxHistorySize: number;
}

// Component Props
export interface InventoryItemProps {
  item: InventoryItem;
  onUpdate?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface BarcodeSessionProps {
  session: BarcodeSession;
  onComplete?: (session: BarcodeSession) => void;
  onCancel?: (sessionId: string) => void;
  onItemScanned?: (item: ScannedItem) => void;
}

export interface StockAlertProps {
  alert: StockAlert;
  onResolve?: (alertId: string, notes?: string) => void;
  onDismiss?: (alertId: string) => void;
  compact?: boolean;
}
