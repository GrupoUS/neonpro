-- =====================================================
-- Inventory Management Database Schema
-- Story 6.1: Real-time Stock Tracking + Barcode/QR Integration
-- Created: July 29, 2025
-- =====================================================

-- =====================================================
-- 1. INVENTORY CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_category_name UNIQUE (name),
    CONSTRAINT no_self_reference CHECK (id != parent_category_id)
);

-- RLS Policies for inventory_categories
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_categories_select" ON inventory_categories
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_categories_insert" ON inventory_categories
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_categories_update" ON inventory_categories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_categories_delete" ON inventory_categories
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. INVENTORY LOCATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_type VARCHAR(50) NOT NULL CHECK (location_type IN (
        'warehouse', 'storage_room', 'shelf', 'cabinet', 
        'refrigerator', 'treatment_room', 'reception'
    )),
    parent_location_id UUID REFERENCES inventory_locations(id) ON DELETE SET NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_location_name UNIQUE (name),
    CONSTRAINT no_self_location_reference CHECK (id != parent_location_id)
);

-- RLS Policies for inventory_locations
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_locations_select" ON inventory_locations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_locations_insert" ON inventory_locations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_locations_update" ON inventory_locations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_locations_delete" ON inventory_locations
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. INVENTORY ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(255),
    qr_code VARCHAR(255),
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    supplier_id UUID, -- References suppliers table (to be created later)
    location_id UUID REFERENCES inventory_locations(id) ON DELETE SET NULL,
    
    -- Stock Information
    current_stock DECIMAL(12, 3) DEFAULT 0,
    minimum_stock DECIMAL(12, 3) DEFAULT 0,
    maximum_stock DECIMAL(12, 3) DEFAULT 999999,
    reorder_point DECIMAL(12, 3) DEFAULT 0,
    unit_cost DECIMAL(12, 2) DEFAULT 0,
    selling_price DECIMAL(12, 2),
    unit_of_measure VARCHAR(50) DEFAULT 'unit',
    
    -- Tracking Information
    batch_number VARCHAR(100),
    expiration_date DATE,
    manufactured_date DATE,
    lot_number VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
        'active', 'inactive', 'discontinued', 'out_of_stock', 'reserved', 'damaged'
    )),
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT unique_sku UNIQUE (sku),
    CONSTRAINT unique_barcode UNIQUE (barcode),
    CONSTRAINT unique_qr_code UNIQUE (qr_code),
    CONSTRAINT positive_stock CHECK (current_stock >= 0),
    CONSTRAINT positive_minimum_stock CHECK (minimum_stock >= 0),
    CONSTRAINT positive_maximum_stock CHECK (maximum_stock >= 0),
    CONSTRAINT positive_reorder_point CHECK (reorder_point >= 0),
    CONSTRAINT positive_unit_cost CHECK (unit_cost >= 0),
    CONSTRAINT positive_selling_price CHECK (selling_price IS NULL OR selling_price >= 0),
    CONSTRAINT valid_expiration_date CHECK (expiration_date IS NULL OR expiration_date > manufactured_date)
);

-- RLS Policies for inventory_items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_items_select" ON inventory_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_items_insert" ON inventory_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_items_update" ON inventory_items
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "inventory_items_delete" ON inventory_items
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 4. STOCK MOVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'purchase', 'sale', 'adjustment', 'transfer', 'waste', 'return', 'usage', 'stocktake'
    )),
    quantity DECIMAL(12, 3) NOT NULL,
    unit_cost DECIMAL(12, 2),
    
    -- Reference Information
    reference_type VARCHAR(50) CHECK (reference_type IN (
        'purchase_order', 'sales_order', 'appointment', 'procedure', 'adjustment', 'transfer', 'stocktake'
    )),
    reference_id UUID,
    batch_number VARCHAR(100),
    expiration_date DATE,
    
    -- Tracking
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT non_zero_quantity CHECK (quantity != 0)
);

-- RLS Policies for stock_movements
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_movements_select" ON stock_movements
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "stock_movements_insert" ON stock_movements
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "stock_movements_update" ON stock_movements
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "stock_movements_delete" ON stock_movements
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. STOCK ALERTS
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'low_stock', 'out_of_stock', 'overstocked', 'expiring_soon', 'expired', 'reorder_point'
    )),
    threshold_value DECIMAL(12, 3) NOT NULL,
    current_value DECIMAL(12, 3) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    message TEXT NOT NULL,
    
    -- Notification
    notified_users TEXT[], -- Array of user IDs
    notification_sent_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for stock_alerts
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_alerts_select" ON stock_alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "stock_alerts_insert" ON stock_alerts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "stock_alerts_update" ON stock_alerts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "stock_alerts_delete" ON stock_alerts
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. BARCODE SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS barcode_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN (
        'receiving', 'shipping', 'stocktake', 'adjustment', 'transfer', 'usage_tracking'
    )),
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    
    -- Session Metadata
    total_items_scanned INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    notes TEXT
);

-- RLS Policies for barcode_sessions
ALTER TABLE barcode_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "barcode_sessions_select" ON barcode_sessions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "barcode_sessions_insert" ON barcode_sessions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "barcode_sessions_update" ON barcode_sessions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "barcode_sessions_delete" ON barcode_sessions
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 7. SCANNED ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS scanned_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES barcode_sessions(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    barcode_value VARCHAR(255) NOT NULL,
    scan_timestamp TIMESTAMPTZ DEFAULT NOW(),
    scan_result VARCHAR(50) DEFAULT 'success' CHECK (scan_result IN (
        'success', 'item_not_found', 'invalid_barcode', 'duplicate_scan', 'error'
    )),
    
    -- Manual Override
    manual_quantity DECIMAL(12, 3),
    manual_notes TEXT,
    
    -- Error Handling
    error_message TEXT,
    needs_manual_review BOOLEAN DEFAULT false
);

-- RLS Policies for scanned_items
ALTER TABLE scanned_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scanned_items_select" ON scanned_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "scanned_items_insert" ON scanned_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "scanned_items_update" ON scanned_items
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "scanned_items_delete" ON scanned_items
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Inventory Items Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_qr_code ON inventory_items(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_current_stock ON inventory_items(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiration ON inventory_items(expiration_date) WHERE expiration_date IS NOT NULL;

-- Stock Movements Indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- Stock Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_stock_alerts_item ON stock_alerts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at);

-- Barcode Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_barcode_sessions_user ON barcode_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_barcode_sessions_location ON barcode_sessions(location_id);
CREATE INDEX IF NOT EXISTS idx_barcode_sessions_status ON barcode_sessions(status);
CREATE INDEX IF NOT EXISTS idx_barcode_sessions_started_at ON barcode_sessions(started_at);

-- Scanned Items Indexes
CREATE INDEX IF NOT EXISTS idx_scanned_items_session ON scanned_items(session_id);
CREATE INDEX IF NOT EXISTS idx_scanned_items_inventory_item ON scanned_items(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_scanned_items_barcode ON scanned_items(barcode_value);
CREATE INDEX IF NOT EXISTS idx_scanned_items_scan_result ON scanned_items(scan_result);
CREATE INDEX IF NOT EXISTS idx_scanned_items_scan_timestamp ON scanned_items(scan_timestamp);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_inventory_categories_updated_at
    BEFORE UPDATE ON inventory_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_locations_updated_at
    BEFORE UPDATE ON inventory_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_alerts_updated_at
    BEFORE UPDATE ON stock_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR STOCK MANAGEMENT
-- =====================================================

-- Function to update stock levels
CREATE OR REPLACE FUNCTION update_stock_level(
    p_inventory_item_id UUID,
    p_quantity DECIMAL(12, 3),
    p_movement_type VARCHAR(50),
    p_location_id UUID,
    p_user_id UUID,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock DECIMAL(12, 3);
    v_new_stock DECIMAL(12, 3);
BEGIN
    -- Get current stock
    SELECT current_stock INTO v_current_stock
    FROM inventory_items
    WHERE id = p_inventory_item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory item not found: %', p_inventory_item_id;
    END IF;
    
    -- Calculate new stock based on movement type
    CASE p_movement_type
        WHEN 'purchase', 'return', 'adjustment' THEN
            v_new_stock := v_current_stock + p_quantity;
        WHEN 'sale', 'usage', 'waste', 'transfer' THEN
            v_new_stock := v_current_stock - p_quantity;
        WHEN 'stocktake' THEN
            v_new_stock := p_quantity; -- Set absolute value
        ELSE
            RAISE EXCEPTION 'Invalid movement type: %', p_movement_type;
    END CASE;
    
    -- Ensure stock doesn't go negative
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, p_quantity;
    END IF;
    
    -- Update inventory item stock
    UPDATE inventory_items
    SET current_stock = v_new_stock,
        last_updated_by = p_user_id
    WHERE id = p_inventory_item_id;
    
    -- Record stock movement
    INSERT INTO stock_movements (
        inventory_item_id, location_id, movement_type, quantity,
        reference_type, reference_id, notes, created_by
    ) VALUES (
        p_inventory_item_id, p_location_id, p_movement_type, p_quantity,
        p_reference_type, p_reference_id, p_notes, p_user_id
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and create stock alerts
CREATE OR REPLACE FUNCTION check_stock_alerts(p_inventory_item_id UUID)
RETURNS VOID AS $$
DECLARE
    v_item RECORD;
    v_alert_exists BOOLEAN;
BEGIN
    -- Get inventory item details
    SELECT * INTO v_item
    FROM inventory_items
    WHERE id = p_inventory_item_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Check for low stock alert
    IF v_item.current_stock <= v_item.minimum_stock AND v_item.current_stock > 0 THEN
        -- Check if alert already exists
        SELECT EXISTS(
            SELECT 1 FROM stock_alerts
            WHERE inventory_item_id = p_inventory_item_id
            AND alert_type = 'low_stock'
            AND status = 'active'
        ) INTO v_alert_exists;
        
        IF NOT v_alert_exists THEN
            INSERT INTO stock_alerts (
                inventory_item_id, alert_type, threshold_value, current_value,
                severity, message
            ) VALUES (
                p_inventory_item_id, 'low_stock', v_item.minimum_stock, v_item.current_stock,
                'medium', 'Stock level is below minimum threshold for ' || v_item.name
            );
        END IF;
    END IF;
    
    -- Check for out of stock alert
    IF v_item.current_stock = 0 THEN
        -- Check if alert already exists
        SELECT EXISTS(
            SELECT 1 FROM stock_alerts
            WHERE inventory_item_id = p_inventory_item_id
            AND alert_type = 'out_of_stock'
            AND status = 'active'
        ) INTO v_alert_exists;
        
        IF NOT v_alert_exists THEN
            INSERT INTO stock_alerts (
                inventory_item_id, alert_type, threshold_value, current_value,
                severity, message
            ) VALUES (
                p_inventory_item_id, 'out_of_stock', 0, 0,
                'high', 'Item is out of stock: ' || v_item.name
            );
        END IF;
    END IF;
    
    -- Check for reorder point alert
    IF v_item.current_stock <= v_item.reorder_point AND v_item.reorder_point > 0 THEN
        -- Check if alert already exists
        SELECT EXISTS(
            SELECT 1 FROM stock_alerts
            WHERE inventory_item_id = p_inventory_item_id
            AND alert_type = 'reorder_point'
            AND status = 'active'
        ) INTO v_alert_exists;
        
        IF NOT v_alert_exists THEN
            INSERT INTO stock_alerts (
                inventory_item_id, alert_type, threshold_value, current_value,
                severity, message
            ) VALUES (
                p_inventory_item_id, 'reorder_point', v_item.reorder_point, v_item.current_stock,
                'medium', 'Reorder point reached for ' || v_item.name
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to check alerts after stock updates
CREATE OR REPLACE FUNCTION trigger_check_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_stock_alerts(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_items_stock_alert_trigger
    AFTER UPDATE OF current_stock ON inventory_items
    FOR EACH ROW
    WHEN (OLD.current_stock IS DISTINCT FROM NEW.current_stock)
    EXECUTE FUNCTION trigger_check_stock_alerts();

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================

-- Insert sample categories
INSERT INTO inventory_categories (name, description) VALUES
('Medical Supplies', 'General medical supplies and equipment'),
('Aesthetic Products', 'Products for aesthetic treatments'),
('Medications', 'Prescription and over-the-counter medications'),
('Equipment', 'Medical and aesthetic equipment'),
('Office Supplies', 'General office and administrative supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample locations
INSERT INTO inventory_locations (name, description, location_type) VALUES
('Main Storage', 'Primary storage room', 'storage_room'),
('Treatment Room 1', 'First treatment room', 'treatment_room'),
('Treatment Room 2', 'Second treatment room', 'treatment_room'),
('Reception Area', 'Front desk and waiting area', 'reception'),
('Refrigerator', 'Temperature-controlled storage', 'refrigerator')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE inventory_categories IS 'Categories for organizing inventory items';
COMMENT ON TABLE inventory_locations IS 'Physical locations where inventory is stored';
COMMENT ON TABLE inventory_items IS 'Main inventory items with stock levels and tracking';
COMMENT ON TABLE stock_movements IS 'Record of all stock level changes with audit trail';
COMMENT ON TABLE stock_alerts IS 'Automated alerts for stock level issues';
COMMENT ON TABLE barcode_sessions IS 'Sessions for batch barcode scanning operations';
COMMENT ON TABLE scanned_items IS 'Individual items scanned during barcode sessions';

COMMENT ON FUNCTION update_stock_level IS 'Updates inventory stock levels and records movements';
COMMENT ON FUNCTION check_stock_alerts IS 'Checks and creates stock alerts based on thresholds';
