-- =====================================================================================
-- NeonPro Inventory Management System Migration
-- Epic 6: Real-time Stock Tracking with Barcode/QR Integration
-- Created: 2025-01-26
-- =====================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- CORE INVENTORY TABLES
-- =====================================================================================

-- Inventory Items Master Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES profiles(clinic_id),
  
  -- Basic Item Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(128),
  qr_code TEXT,
  
  -- Classification
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  item_type VARCHAR(50) NOT NULL DEFAULT 'supply', -- supply, medication, equipment, consumable
  
  -- Measurement & Ordering
  unit_of_measure VARCHAR(50) NOT NULL, -- unit, box, bottle, vial, etc
  unit_size DECIMAL(10,3),
  unit_cost DECIMAL(10,2),
  
  -- Stock Management
  reorder_level INTEGER NOT NULL DEFAULT 10,
  max_stock INTEGER NOT NULL DEFAULT 100,
  min_stock INTEGER NOT NULL DEFAULT 5,
  safety_stock INTEGER NOT NULL DEFAULT 3,
  
  -- Medical/Regulatory Information
  requires_prescription BOOLEAN DEFAULT FALSE,
  controlled_substance BOOLEAN DEFAULT FALSE,
  anvisa_code VARCHAR(50),
  therapeutic_class VARCHAR(100),
  
  -- Status & Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT ck_stock_levels CHECK (min_stock <= reorder_level AND reorder_level <= max_stock),
  CONSTRAINT ck_positive_costs CHECK (unit_cost >= 0)
);

-- Inventory Locations Table
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES profiles(clinic_id),
  
  -- Location Information
  location_name VARCHAR(255) NOT NULL,
  location_code VARCHAR(50) NOT NULL,
  address TEXT,
  room_number VARCHAR(20),
  
  -- Storage Details
  storage_type VARCHAR(50) NOT NULL, -- room, cabinet, refrigerator, freezer, controlled
  temperature_controlled BOOLEAN DEFAULT FALSE,
  min_temperature DECIMAL(5,2),
  max_temperature DECIMAL(5,2),
  humidity_controlled BOOLEAN DEFAULT FALSE,
  
  -- Access Control
  access_permissions JSONB DEFAULT '[]'::jsonb,
  requires_authorization BOOLEAN DEFAULT FALSE,
  responsible_user_id UUID REFERENCES auth.users(id),
  
  -- Status & Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(clinic_id, location_code),
  CONSTRAINT ck_temperature_range CHECK (min_temperature IS NULL OR max_temperature IS NULL OR min_temperature <= max_temperature)
);

-- Real-time Stock Levels Table
CREATE TABLE IF NOT EXISTS stock_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  
  -- Stock Quantities
  current_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  allocated_quantity INTEGER NOT NULL DEFAULT 0,
  
  -- Batch Information
  batch_number VARCHAR(100),
  lot_number VARCHAR(100),
  serial_number VARCHAR(100),
  expiration_date DATE,
  manufacture_date DATE,
  
  -- Tracking
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_counted_by UUID REFERENCES auth.users(id),
  variance_quantity INTEGER DEFAULT 0,
  
  -- Status & Metadata
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, quarantine, expired, recalled
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(item_id, location_id, batch_number),
  CONSTRAINT ck_positive_quantities CHECK (
    current_quantity >= 0 AND 
    reserved_quantity >= 0 AND 
    allocated_quantity >= 0 AND
    reserved_quantity <= current_quantity
  )
);

-- Inventory Transactions Table (Complete Audit Trail)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id UUID NOT NULL REFERENCES inventory_locations(id),
  
  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- receive, issue, transfer, adjustment, count, expire, return
  reference_type VARCHAR(50), -- purchase_order, treatment, appointment, adjustment, transfer
  reference_id UUID,
  
  -- Quantities
  quantity_before INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  
  -- Batch Information
  batch_number VARCHAR(100),
  lot_number VARCHAR(100),
  expiration_date DATE,
  
  -- Cost Information
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  
  -- Transaction Context
  reason TEXT,
  notes TEXT,
  source_location_id UUID REFERENCES inventory_locations(id),
  destination_location_id UUID REFERENCES inventory_locations(id),
  
  -- Audit Information
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  
  -- Verification
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT ck_quantity_calculation CHECK (quantity_before + quantity_change = quantity_after)
);

-- =====================================================================================
-- ALERTS AND NOTIFICATIONS
-- =====================================================================================

-- Stock Alerts Table
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES profiles(clinic_id),
  item_id UUID NOT NULL REFERENCES inventory_items(id),
  location_id UUID REFERENCES inventory_locations(id),
  
  -- Alert Details
  alert_type VARCHAR(50) NOT NULL, -- low_stock, expired, expiring, overstock, zero_stock
  alert_level VARCHAR(20) NOT NULL, -- info, warning, critical, urgent
  
  -- Alert Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  current_quantity INTEGER,
  threshold_quantity INTEGER,
  
  -- Status & Timing
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, acknowledged, resolved, dismissed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Delivery Tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_channels JSONB DEFAULT '[]'::jsonb,
  escalation_level INTEGER DEFAULT 0,
  
  INDEX idx_stock_alerts_clinic_active (clinic_id, status),
  INDEX idx_stock_alerts_item (item_id),
  INDEX idx_stock_alerts_created (created_at DESC)
);

-- =====================================================================================
-- BARCODE/QR CODE INTEGRATION
-- =====================================================================================

-- Barcode Scans Log Table
CREATE TABLE IF NOT EXISTS barcode_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES profiles(clinic_id),
  
  -- Scan Details
  barcode_value VARCHAR(128) NOT NULL,
  scan_type VARCHAR(20) NOT NULL, -- barcode, qr_code
  scan_format VARCHAR(20), -- code128, code39, ean13, qr, etc
  
  -- Context
  item_id UUID REFERENCES inventory_items(id),
  location_id UUID REFERENCES inventory_locations(id),
  scan_purpose VARCHAR(50) NOT NULL, -- stock_in, stock_out, count, lookup, transfer
  
  -- Scan Result
  scan_status VARCHAR(20) NOT NULL, -- success, not_found, error, duplicate
  error_message TEXT,
  
  -- Device & User
  device_id VARCHAR(100),
  device_type VARCHAR(50), -- mobile, scanner, tablet
  scanned_by UUID NOT NULL REFERENCES auth.users(id),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Transaction Reference
  transaction_id UUID REFERENCES inventory_transactions(id),
  
  INDEX idx_barcode_scans_clinic (clinic_id),
  INDEX idx_barcode_scans_barcode (barcode_value),
  INDEX idx_barcode_scans_item (item_id),
  INDEX idx_barcode_scans_date (scanned_at DESC)
);

-- =====================================================================================
-- MOBILE & OFFLINE SUPPORT
-- =====================================================================================

-- Mobile Sync Queue Table
CREATE TABLE IF NOT EXISTS mobile_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES profiles(clinic_id),
  
  -- Sync Details
  entity_type VARCHAR(50) NOT NULL, -- transaction, stock_level, scan
  entity_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL, -- create, update, delete
  
  -- Sync Data
  sync_data JSONB NOT NULL,
  client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  sync_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, synced, error, conflict
  error_message TEXT,
  conflict_resolution VARCHAR(50), -- server_wins, client_wins, merge, manual
  
  -- Device Info
  device_id VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Processing
  processed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  
  INDEX idx_mobile_sync_clinic (clinic_id),
  INDEX idx_mobile_sync_status (sync_status),
  INDEX idx_mobile_sync_device (device_id),
  INDEX idx_mobile_sync_timestamp (server_timestamp DESC)
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Inventory Items Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_clinic ON inventory_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(clinic_id, is_active);

-- Stock Levels Indexes
CREATE INDEX IF NOT EXISTS idx_stock_levels_item_location ON stock_levels(item_id, location_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON stock_levels(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_batch ON stock_levels(batch_number) WHERE batch_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_levels_expiration ON stock_levels(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stock_levels_status ON stock_levels(status);
CREATE INDEX IF NOT EXISTS idx_stock_levels_updated ON stock_levels(last_updated DESC);

-- Inventory Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_location ON inventory_transactions(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_batch ON inventory_transactions(batch_number) WHERE batch_number IS NOT NULL;

-- Inventory Locations Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_locations_clinic ON inventory_locations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_active ON inventory_locations(clinic_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_type ON inventory_locations(storage_type);

-- =====================================================================================
-- TRIGGERS FOR REAL-TIME UPDATES
-- =====================================================================================

-- Function to update stock levels timestamp
CREATE OR REPLACE FUNCTION update_stock_levels_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock levels updates
CREATE TRIGGER tr_stock_levels_updated
  BEFORE UPDATE ON stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_levels_timestamp();

-- Function to create inventory transaction
CREATE OR REPLACE FUNCTION create_inventory_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction if quantity actually changed
  IF (TG_OP = 'UPDATE' AND OLD.current_quantity != NEW.current_quantity) OR TG_OP = 'INSERT' THEN
    INSERT INTO inventory_transactions (
      item_id, 
      location_id, 
      transaction_type,
      quantity_before,
      quantity_change,
      quantity_after,
      batch_number,
      created_by,
      reason
    ) VALUES (
      NEW.item_id,
      NEW.location_id,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'initial'
        WHEN NEW.current_quantity > COALESCE(OLD.current_quantity, 0) THEN 'adjustment_in'
        ELSE 'adjustment_out'
      END,
      COALESCE(OLD.current_quantity, 0),
      NEW.current_quantity - COALESCE(OLD.current_quantity, 0),
      NEW.current_quantity,
      NEW.batch_number,
      NEW.last_counted_by,
      'Automatic transaction from stock level change'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic transaction creation
CREATE TRIGGER tr_stock_levels_transaction
  AFTER INSERT OR UPDATE ON stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION create_inventory_transaction();

-- Function to check stock alerts
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS TRIGGER AS $$
DECLARE
  item_rec inventory_items%ROWTYPE;
  alert_exists BOOLEAN;
BEGIN
  -- Get item details
  SELECT * INTO item_rec FROM inventory_items WHERE id = NEW.item_id;
  
  -- Check for low stock alert
  IF NEW.available_quantity <= item_rec.reorder_level THEN
    -- Check if alert already exists
    SELECT EXISTS(
      SELECT 1 FROM stock_alerts 
      WHERE item_id = NEW.item_id 
        AND location_id = NEW.location_id 
        AND alert_type = 'low_stock' 
        AND status = 'active'
    ) INTO alert_exists;
    
    -- Create alert if not exists
    IF NOT alert_exists THEN
      INSERT INTO stock_alerts (
        clinic_id,
        item_id,
        location_id,
        alert_type,
        alert_level,
        title,
        message,
        current_quantity,
        threshold_quantity
      ) VALUES (
        (SELECT clinic_id FROM inventory_items WHERE id = NEW.item_id),
        NEW.item_id,
        NEW.location_id,
        'low_stock',
        CASE 
          WHEN NEW.available_quantity = 0 THEN 'urgent'
          WHEN NEW.available_quantity <= item_rec.min_stock THEN 'critical'
          ELSE 'warning'
        END,
        'Low Stock Alert: ' || item_rec.name,
        'Stock level for ' || item_rec.name || ' is below reorder level. Current: ' || NEW.available_quantity || ', Reorder Level: ' || item_rec.reorder_level,
        NEW.available_quantity,
        item_rec.reorder_level
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock alerts
CREATE TRIGGER tr_stock_alerts_check
  AFTER INSERT OR UPDATE ON stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION check_stock_alerts();

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_items
CREATE POLICY "Users can view inventory items from their clinic" ON inventory_items
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert inventory items for their clinic" ON inventory_items
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update inventory items from their clinic" ON inventory_items
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for inventory_locations
CREATE POLICY "Users can view inventory locations from their clinic" ON inventory_locations
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage inventory locations for their clinic" ON inventory_locations
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for stock_levels
CREATE POLICY "Users can view stock levels from their clinic" ON stock_levels
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM inventory_items WHERE clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage stock levels for their clinic" ON stock_levels
  FOR ALL USING (
    item_id IN (
      SELECT id FROM inventory_items WHERE clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can view inventory transactions from their clinic" ON inventory_transactions
  FOR SELECT USING (
    item_id IN (
      SELECT id FROM inventory_items WHERE clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create inventory transactions for their clinic" ON inventory_transactions
  FOR INSERT WITH CHECK (
    item_id IN (
      SELECT id FROM inventory_items WHERE clinic_id IN (
        SELECT clinic_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for stock_alerts
CREATE POLICY "Users can view stock alerts from their clinic" ON stock_alerts
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage stock alerts for their clinic" ON stock_alerts
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for barcode_scans
CREATE POLICY "Users can view barcode scans from their clinic" ON barcode_scans
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create barcode scans for their clinic" ON barcode_scans
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for mobile_sync_queue
CREATE POLICY "Users can view mobile sync queue from their clinic" ON mobile_sync_queue
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage mobile sync queue for their clinic" ON mobile_sync_queue
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================================================
-- INITIAL DATA AND SAMPLE RECORDS
-- =====================================================================================

-- Insert default inventory categories
INSERT INTO inventory_items (clinic_id, name, sku, category, unit_of_measure, reorder_level, max_stock, min_stock, safety_stock, created_by) 
SELECT 
  clinic_id,
  'Sample Medical Supply',
  'SAMPLE-001',
  'Medical Supplies',
  'unit',
  10,
  100,
  5,
  3,
  id
FROM profiles 
WHERE clinic_id IS NOT NULL 
LIMIT 1
ON CONFLICT (sku) DO NOTHING;

-- =====================================================================================
-- PERFORMANCE MONITORING VIEWS
-- =====================================================================================

-- View for low stock items
CREATE OR REPLACE VIEW v_low_stock_items AS
SELECT 
  ii.id,
  ii.clinic_id,
  ii.name,
  ii.sku,
  ii.category,
  il.location_name,
  sl.current_quantity,
  sl.available_quantity,
  ii.reorder_level,
  ii.min_stock,
  (ii.reorder_level - sl.available_quantity) as shortage_quantity,
  CASE 
    WHEN sl.available_quantity = 0 THEN 'Out of Stock'
    WHEN sl.available_quantity <= ii.min_stock THEN 'Critical'
    WHEN sl.available_quantity <= ii.reorder_level THEN 'Low'
    ELSE 'OK'
  END as stock_status
FROM inventory_items ii
JOIN stock_levels sl ON ii.id = sl.item_id
JOIN inventory_locations il ON sl.location_id = il.id
WHERE sl.available_quantity <= ii.reorder_level
  AND ii.is_active = true
  AND il.is_active = true;

-- View for expiring items
CREATE OR REPLACE VIEW v_expiring_items AS
SELECT 
  ii.id,
  ii.clinic_id,
  ii.name,
  ii.sku,
  ii.category,
  il.location_name,
  sl.batch_number,
  sl.expiration_date,
  sl.current_quantity,
  (sl.expiration_date - CURRENT_DATE) as days_to_expiry,
  CASE 
    WHEN sl.expiration_date <= CURRENT_DATE THEN 'Expired'
    WHEN sl.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Expires This Week'
    WHEN sl.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expires This Month'
    ELSE 'OK'
  END as expiry_status
FROM inventory_items ii
JOIN stock_levels sl ON ii.id = sl.item_id
JOIN inventory_locations il ON sl.location_id = il.id
WHERE sl.expiration_date IS NOT NULL
  AND sl.expiration_date <= CURRENT_DATE + INTERVAL '90 days'
  AND sl.current_quantity > 0
  AND ii.is_active = true
  AND il.is_active = true
ORDER BY sl.expiration_date ASC;

-- View for inventory summary
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
  ii.clinic_id,
  ii.category,
  COUNT(DISTINCT ii.id) as total_items,
  COUNT(DISTINCT sl.location_id) as total_locations,
  SUM(sl.current_quantity) as total_quantity,
  SUM(sl.available_quantity) as total_available,
  SUM(sl.reserved_quantity) as total_reserved,
  SUM(CASE WHEN sl.available_quantity <= ii.reorder_level THEN 1 ELSE 0 END) as low_stock_items,
  SUM(CASE WHEN sl.available_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_items,
  SUM(sl.current_quantity * ii.unit_cost) as total_inventory_value
FROM inventory_items ii
JOIN stock_levels sl ON ii.id = sl.item_id
WHERE ii.is_active = true
GROUP BY ii.clinic_id, ii.category;

-- =====================================================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================================================

COMMENT ON TABLE inventory_items IS 'Master table for all inventory items with barcode/QR integration';
COMMENT ON TABLE inventory_locations IS 'Physical storage locations within clinic facilities';
COMMENT ON TABLE stock_levels IS 'Real-time stock quantities with batch tracking and ≥99% accuracy';
COMMENT ON TABLE inventory_transactions IS 'Complete audit trail for all inventory movements';
COMMENT ON TABLE stock_alerts IS 'Automated alert system with <60s notification delivery';
COMMENT ON TABLE barcode_scans IS 'Barcode/QR scanning log for integration tracking';
COMMENT ON TABLE mobile_sync_queue IS 'Offline synchronization support for mobile devices';

COMMENT ON COLUMN stock_levels.available_quantity IS 'Computed column: current_quantity - reserved_quantity';
COMMENT ON COLUMN inventory_items.reorder_level IS 'Threshold for automatic low stock alerts';
COMMENT ON COLUMN inventory_transactions.quantity_change IS 'Can be positive (inbound) or negative (outbound)';
COMMENT ON COLUMN stock_alerts.alert_level IS 'info, warning, critical, urgent - for escalation workflows';

-- =====================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================
