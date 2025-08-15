// Multi-location Inventory System Types
export interface InventoryItem {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  category?: 'medication' | 'equipment' | 'supplies' | 'cosmetics';
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  qr_code?: string;
  unit_of_measure: string;
  cost_price?: number;
  selling_price?: number;
  supplier_info?: Record<string, any>;
  expiry_tracking: boolean;
  batch_tracking: boolean;
  minimum_stock_alert: number;
  maximum_stock_limit?: number;
  is_controlled_substance: boolean;
  anvisa_registration?: string;
  storage_requirements?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface InventoryStock {
  id: string;
  inventory_item_id: string;
  clinic_id: string;
  room_id?: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number; // Generated column
  batch_number?: string;
  expiry_date?: string;
  location_notes?: string;
  last_counted_at?: string;
  last_counted_by?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  inventory_item?: InventoryItem;
  clinic?: {
    id: string;
    clinic_name: string;
    clinic_code: string;
  };
  room?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  inventory_item_id: string;
  from_clinic_id?: string;
  from_room_id?: string;
  to_clinic_id?: string;
  to_room_id?: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string;
  transfer_type: 'internal' | 'inter_clinic' | 'supplier_delivery' | 'disposal';
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes?: string;
  requested_by: string;
  approved_by?: string;
  sent_by?: string;
  received_by?: string;
  requested_at: string;
  approved_at?: string;
  sent_at?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;

  // Joined data
  inventory_item?: InventoryItem;
  from_clinic?: { id: string; clinic_name: string; clinic_code: string };
  from_room?: { id: string; name: string };
  to_clinic?: { id: string; clinic_name: string; clinic_code: string };
  to_room?: { id: string; name: string };
  requester?: { id: string; full_name: string };
}

export interface StockTransaction {
  id: string;
  inventory_item_id: string;
  clinic_id: string;
  room_id?: string;
  transaction_type:
    | 'adjustment'
    | 'purchase'
    | 'sale'
    | 'transfer_in'
    | 'transfer_out'
    | 'disposal'
    | 'consumption';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  batch_number?: string;
  expiry_date?: string;
  unit_cost?: number;
  total_cost?: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  performed_by: string;
  created_at: string;

  // Joined data
  inventory_item?: InventoryItem;
  clinic?: { id: string; clinic_name: string; clinic_code: string };
  room?: { id: string; name: string };
  performer?: { id: string; full_name: string };
}

// Create/Update types
export type CreateInventoryItem = Omit<
  InventoryItem,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateInventoryItem = Partial<CreateInventoryItem> & { id: string };

export type CreateInventoryStock = Omit<
  InventoryStock,
  'id' | 'available_quantity' | 'created_at' | 'updated_at'
>;
export type UpdateInventoryStock = Partial<CreateInventoryStock> & {
  id: string;
};

export type CreateStockTransfer = Omit<
  StockTransfer,
  | 'id'
  | 'transfer_number'
  | 'status'
  | 'created_at'
  | 'updated_at'
  | 'requested_at'
>;
export type UpdateStockTransfer = Partial<
  Omit<StockTransfer, 'id' | 'transfer_number' | 'created_at' | 'updated_at'>
> & { id: string };

export type CreateStockTransaction = Omit<
  StockTransaction,
  'id' | 'created_at'
>;

// Query filters
export interface InventoryFilters {
  clinic_id?: string;
  room_id?: string;
  category?: string;
  low_stock?: boolean;
  expiring_soon?: boolean;
  batch_number?: string;
  active_only?: boolean;
}

export interface StockTransferFilters {
  clinic_id?: string;
  status?: string;
  transfer_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface StockTransactionFilters {
  clinic_id?: string;
  room_id?: string;
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
  inventory_item_id?: string;
}

// Dashboard aggregates
export interface LocationStockSummary {
  clinic_id: string;
  clinic_name: string;
  room_id?: string;
  room_name?: string;
  total_items: number;
  total_value: number;
  low_stock_count: number;
  expiring_soon_count: number;
  last_updated: string;
}

export interface InventoryMovementSummary {
  date: string;
  transfers_in: number;
  transfers_out: number;
  adjustments: number;
  consumption: number;
  total_value_change: number;
}
