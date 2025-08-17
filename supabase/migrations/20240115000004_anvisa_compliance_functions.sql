-- ANVISA Compliance Helper Functions
-- Migration: 20240115000004_anvisa_compliance_functions
-- Description: Helper functions for ANVISA regulatory compliance operations

-- ============================================================================
-- PRODUCT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to check product registration validity
CREATE OR REPLACE FUNCTION check_product_registration_validity(p_product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_expiry_date DATE;
    v_status anvisa_regulatory_status;
BEGIN
    SELECT registration_expiry_date, regulatory_status
    INTO v_expiry_date, v_status
    FROM anvisa_products
    WHERE id = p_product_id;
    
    IF v_status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    IF v_expiry_date IS NOT NULL AND v_expiry_date < CURRENT_DATE THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products nearing expiry
CREATE OR REPLACE FUNCTION get_products_nearing_expiry(p_clinic_id UUID, p_days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR,
    anvisa_registration_number VARCHAR,
    registration_expiry_date DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.product_name,
        ap.anvisa_registration_number,
        ap.registration_expiry_date,
        (ap.registration_expiry_date - CURRENT_DATE)::INTEGER
    FROM anvisa_products ap
    WHERE ap.clinic_id = p_clinic_id
        AND ap.regulatory_status = 'active'
        AND ap.registration_expiry_date IS NOT NULL
        AND ap.registration_expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    ORDER BY ap.registration_expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id UUID,
    p_quantity_change INTEGER,
    p_operation_type VARCHAR DEFAULT 'usage'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_stock INTEGER;
    v_new_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT current_stock_quantity INTO v_current_stock
    FROM anvisa_products
    WHERE id = p_product_id;
    
    IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'Product not found';
    END IF;
    
    -- Calculate new stock
    v_new_stock := v_current_stock + p_quantity_change;
    
    -- Ensure stock doesn't go negative
    IF v_new_stock < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, ABS(p_quantity_change);
    END IF;
    
    -- Update stock
    UPDATE anvisa_products
    SET current_stock_quantity = v_new_stock,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Log stock movement
    INSERT INTO anvisa_stock_movements (
        product_id,
        quantity_change,
        operation_type,
        previous_stock,
        new_stock,
        created_at
    ) VALUES (
        p_product_id,
        p_quantity_change,
        p_operation_type,
        v_current_stock,
        v_new_stock,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADVERSE EVENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create adverse event with automatic classification
CREATE OR REPLACE FUNCTION create_adverse_event(
    p_clinic_id UUID,
    p_patient_id UUID,
    p_procedure_id UUID,
    p_product_id UUID DEFAULT NULL,
    p_event_description TEXT,
    p_severity_level anvisa_severity_level,
    p_onset_date_time TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_event_code VARCHAR(50);
    v_requires_notification BOOLEAN := FALSE;
BEGIN
    -- Generate unique event ID
    v_event_code := 'AE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('adverse_event_sequence')::TEXT, 4, '0');
    
    -- Determine if ANVISA notification is required based on severity
    IF p_severity_level IN ('severe', 'critical', 'fatal') THEN
        v_requires_notification := TRUE;
    END IF;
    
    -- Create adverse event record
    INSERT INTO anvisa_adverse_events (
        clinic_id,
        event_id,
        patient_id,
        procedure_id,
        product_id,
        event_type,
        severity_level,
        event_category,
        event_description,
        onset_date_time,
        discovery_date_time,
        anvisa_notification_required,
        status,
        created_at
    ) VALUES (
        p_clinic_id,
        v_event_code,
        p_patient_id,
        p_procedure_id,
        p_product_id,
        'adverse_reaction', -- Default, can be updated later
        p_severity_level,
        'procedure_related', -- Default, can be updated later
        p_event_description,
        p_onset_date_time,
        NOW(),
        v_requires_notification,
        'reported',
        NOW()
    ) RETURNING id INTO v_event_id;
    
    -- Create notification if required
    IF v_requires_notification THEN
        PERFORM create_anvisa_notification(v_event_id, 'adverse_event');
    END IF;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update adverse event status
CREATE OR REPLACE FUNCTION update_adverse_event_status(
    p_event_id UUID,
    p_new_status anvisa_event_status,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE anvisa_adverse_events
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_event_id;
    
    -- Log status change
    INSERT INTO anvisa_event_status_log (
        event_id,
        previous_status,
        new_status,
        change_notes,
        created_at
    ) VALUES (
        p_event_id,
        (SELECT status FROM anvisa_adverse_events WHERE id = p_event_id),
        p_new_status,
        p_notes,
        NOW()
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get adverse events requiring ANVISA notification
CREATE OR REPLACE FUNCTION get_pending_anvisa_notifications(p_clinic_id UUID)
RETURNS TABLE(
    event_id UUID,
    event_code VARCHAR,
    patient_id UUID,
    procedure_name VARCHAR,
    product_name VARCHAR,
    severity_level anvisa_severity_level,
    onset_date_time TIMESTAMPTZ,
    days_since_onset INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ae.id,
        ae.event_id,
        ae.patient_id,
        ap.procedure_name,
        prod.product_name,
        ae.severity_level,
        ae.onset_date_time,
        (EXTRACT(DAY FROM NOW() - ae.onset_date_time))::INTEGER
    FROM anvisa_adverse_events ae
    LEFT JOIN anvisa_procedures ap ON ae.procedure_id = ap.id
    LEFT JOIN anvisa_products prod ON ae.product_id = prod.id
    WHERE ae.clinic_id = p_clinic_id
        AND ae.anvisa_notification_required = TRUE
        AND ae.anvisa_notification_sent = FALSE
        AND ae.status IN ('reported', 'under_investigation')
    ORDER BY ae.onset_date_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFESSIONAL COMPLIANCE FUNCTIONS
-- ============================================================================

-- Function to verify professional authorization for procedure
CREATE OR REPLACE FUNCTION verify_professional_authorization(
    p_professional_id UUID,
    p_procedure_code VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    v_authorized_procedures TEXT[];
    v_license_status anvisa_license_status;
    v_procedure_requirements anvisa_professional_level;
    v_professional_level anvisa_professional_level;
BEGIN
    -- Get professional information
    SELECT 
        authorized_procedures,
        license_status
    INTO v_authorized_procedures, v_license_status
    FROM anvisa_professionals
    WHERE user_id = p_professional_id;
    
    -- Check if license is active
    IF v_license_status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Get procedure requirements
    SELECT minimum_professional_qualification
    INTO v_procedure_requirements
    FROM anvisa_procedures
    WHERE procedure_code = p_procedure_code;
    
    -- Check if procedure is in authorized list
    IF p_procedure_code = ANY(v_authorized_procedures) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update professional compliance score
CREATE OR REPLACE FUNCTION update_professional_compliance_score(p_professional_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_procedures INTEGER;
    v_adverse_events INTEGER;
    v_compliance_score DECIMAL;
    v_license_status anvisa_license_status;
    v_certification_expired BOOLEAN;
BEGIN
    -- Get professional statistics
    SELECT 
        procedures_performed_count,
        adverse_events_count,
        license_status,
        CASE WHEN certification_expiry_date < CURRENT_DATE THEN TRUE ELSE FALSE END
    INTO v_total_procedures, v_adverse_events, v_license_status, v_certification_expired
    FROM anvisa_professionals
    WHERE user_id = p_professional_id;
    
    -- Initialize base score
    v_compliance_score := 100.0;
    
    -- Deduct points for adverse events
    IF v_total_procedures > 0 THEN
        v_compliance_score := v_compliance_score - ((v_adverse_events::DECIMAL / v_total_procedures) * 20);
    END IF;
    
    -- Deduct points for license issues
    IF v_license_status != 'active' THEN
        v_compliance_score := v_compliance_score - 50;
    END IF;
    
    -- Deduct points for expired certification
    IF v_certification_expired THEN
        v_compliance_score := v_compliance_score - 25;
    END IF;
    
    -- Ensure score doesn't go below 0
    v_compliance_score := GREATEST(v_compliance_score, 0);
    
    -- Update professional record
    UPDATE anvisa_professionals
    SET compliance_score = v_compliance_score,
        updated_at = NOW()
    WHERE user_id = p_professional_id;
    
    RETURN v_compliance_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- BATCH MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to check batch expiry and update status
CREATE OR REPLACE FUNCTION check_batch_expiry()
RETURNS INTEGER AS $$
DECLARE
    v_expired_count INTEGER := 0;
BEGIN
    -- Update expired batches
    UPDATE anvisa_product_batches
    SET status = 'expired',
        updated_at = NOW()
    WHERE expiry_date < CURRENT_DATE
        AND status = 'available';
        
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get batches nearing expiry
CREATE OR REPLACE FUNCTION get_batches_nearing_expiry(
    p_clinic_id UUID,
    p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE(
    batch_id UUID,
    product_name VARCHAR,
    batch_number VARCHAR,
    expiry_date DATE,
    current_quantity INTEGER,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        apb.id,
        ap.product_name,
        apb.batch_number,
        apb.expiry_date,
        apb.current_quantity,
        (apb.expiry_date - CURRENT_DATE)::INTEGER
    FROM anvisa_product_batches apb
    JOIN anvisa_products ap ON apb.product_id = ap.id
    WHERE apb.clinic_id = p_clinic_id
        AND apb.status = 'available'
        AND apb.current_quantity > 0
        AND apb.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    ORDER BY apb.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use product from batch
CREATE OR REPLACE FUNCTION use_product_from_batch(
    p_batch_id UUID,
    p_quantity INTEGER,
    p_procedure_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_quantity INTEGER;
    v_new_quantity INTEGER;
BEGIN
    -- Get current quantity
    SELECT current_quantity INTO v_current_quantity
    FROM anvisa_product_batches
    WHERE id = p_batch_id;
    
    IF v_current_quantity IS NULL THEN
        RAISE EXCEPTION 'Batch not found';
    END IF;
    
    -- Check if there's enough quantity
    IF v_current_quantity < p_quantity THEN
        RAISE EXCEPTION 'Insufficient quantity in batch. Available: %, Requested: %', v_current_quantity, p_quantity;
    END IF;
    
    -- Calculate new quantity
    v_new_quantity := v_current_quantity - p_quantity;
    
    -- Update batch quantity
    UPDATE anvisa_product_batches
    SET current_quantity = v_new_quantity,
        last_use_date = CURRENT_DATE,
        procedures_used_count = procedures_used_count + 1,
        updated_at = NOW()
    WHERE id = p_batch_id;
    
    -- Log usage
    INSERT INTO anvisa_batch_usage_log (
        batch_id,
        procedure_id,
        quantity_used,
        remaining_quantity,
        used_at
    ) VALUES (
        p_batch_id,
        p_procedure_id,
        p_quantity,
        v_new_quantity,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLIANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to calculate clinic compliance score
CREATE OR REPLACE FUNCTION calculate_clinic_compliance_score(p_clinic_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_products_compliance DECIMAL;
    v_procedures_compliance DECIMAL;
    v_professionals_compliance DECIMAL;
    v_adverse_events_rate DECIMAL;
    v_overall_score DECIMAL;
BEGIN
    -- Products compliance (based on valid registrations)
    SELECT 
        (COUNT(CASE WHEN regulatory_status = 'active' AND 
                     (registration_expiry_date IS NULL OR registration_expiry_date >= CURRENT_DATE)
               THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100
    INTO v_products_compliance
    FROM anvisa_products
    WHERE clinic_id = p_clinic_id;
    
    -- Procedures compliance (based on authorized professionals)
    WITH procedure_stats AS (
        SELECT 
            COUNT(*) as total_procedures,
            COUNT(CASE WHEN EXISTS(
                SELECT 1 FROM anvisa_professionals ap 
                WHERE ap.clinic_id = p_clinic_id 
                AND ap.license_status = 'active'
                AND anvisa_procedures.procedure_code = ANY(ap.authorized_procedures)
            ) THEN 1 END) as authorized_procedures
        FROM anvisa_procedures
        WHERE clinic_id = p_clinic_id AND is_active = true
    )
    SELECT (authorized_procedures::DECIMAL / NULLIF(total_procedures, 0)) * 100
    INTO v_procedures_compliance
    FROM procedure_stats;
    
    -- Professionals compliance (average compliance score)
    SELECT AVG(compliance_score)
    INTO v_professionals_compliance
    FROM anvisa_professionals
    WHERE clinic_id = p_clinic_id AND is_active = true;
    
    -- Adverse events rate (last 12 months)
    WITH event_stats AS (
        SELECT 
            COUNT(*) as total_events,
            COUNT(CASE WHEN severity_level IN ('severe', 'critical', 'fatal') THEN 1 END) as serious_events
        FROM anvisa_adverse_events
        WHERE clinic_id = p_clinic_id 
        AND onset_date_time >= NOW() - INTERVAL '12 months'
    )
    SELECT 
        CASE 
            WHEN total_events = 0 THEN 100
            ELSE GREATEST(0, 100 - (serious_events::DECIMAL / NULLIF(total_events, 0) * 100))
        END
    INTO v_adverse_events_rate
    FROM event_stats;
    
    -- Calculate overall score (weighted average)
    v_overall_score := (
        COALESCE(v_products_compliance, 0) * 0.25 +
        COALESCE(v_procedures_compliance, 0) * 0.25 +
        COALESCE(v_professionals_compliance, 0) * 0.25 +
        COALESCE(v_adverse_events_rate, 0) * 0.25
    );
    
    -- Build result JSON
    v_result := jsonb_build_object(
        'overall_score', ROUND(v_overall_score, 2),
        'products_compliance', ROUND(COALESCE(v_products_compliance, 0), 2),
        'procedures_compliance', ROUND(COALESCE(v_procedures_compliance, 0), 2),
        'professionals_compliance', ROUND(COALESCE(v_professionals_compliance, 0), 2),
        'adverse_events_score', ROUND(COALESCE(v_adverse_events_rate, 0), 2),
        'calculated_at', NOW()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(
    p_clinic_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
    v_report JSONB;
    v_products_summary JSONB;
    v_adverse_events_summary JSONB;
    v_professionals_summary JSONB;
    v_compliance_score JSONB;
BEGIN
    -- Get compliance score
    v_compliance_score := calculate_clinic_compliance_score(p_clinic_id);
    
    -- Products summary
    SELECT jsonb_build_object(
        'total_products', COUNT(*),
        'active_products', COUNT(CASE WHEN regulatory_status = 'active' THEN 1 END),
        'expired_products', COUNT(CASE WHEN regulatory_status = 'expired' THEN 1 END),
        'products_nearing_expiry', (
            SELECT COUNT(*) FROM anvisa_products ap
            WHERE ap.clinic_id = p_clinic_id
            AND ap.registration_expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
        )
    ) INTO v_products_summary
    FROM anvisa_products
    WHERE clinic_id = p_clinic_id;
    
    -- Adverse events summary
    SELECT jsonb_build_object(
        'total_events', COUNT(*),
        'mild_events', COUNT(CASE WHEN severity_level = 'mild' THEN 1 END),
        'moderate_events', COUNT(CASE WHEN severity_level = 'moderate' THEN 1 END),
        'severe_events', COUNT(CASE WHEN severity_level = 'severe' THEN 1 END),
        'critical_events', COUNT(CASE WHEN severity_level = 'critical' THEN 1 END),
        'pending_notifications', COUNT(CASE WHEN anvisa_notification_required = true AND anvisa_notification_sent = false THEN 1 END)
    ) INTO v_adverse_events_summary
    FROM anvisa_adverse_events
    WHERE clinic_id = p_clinic_id
    AND onset_date_time::DATE BETWEEN p_start_date AND p_end_date;
    
    -- Professionals summary
    SELECT jsonb_build_object(
        'total_professionals', COUNT(*),
        'active_professionals', COUNT(CASE WHEN license_status = 'active' THEN 1 END),
        'professionals_with_expired_certification', COUNT(CASE WHEN certification_expiry_date < CURRENT_DATE THEN 1 END),
        'average_compliance_score', ROUND(AVG(compliance_score), 2)
    ) INTO v_professionals_summary
    FROM anvisa_professionals
    WHERE clinic_id = p_clinic_id AND is_active = true;
    
    -- Build final report
    v_report := jsonb_build_object(
        'clinic_id', p_clinic_id,
        'report_period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'compliance_score', v_compliance_score,
        'products_summary', v_products_summary,
        'adverse_events_summary', v_adverse_events_summary,
        'professionals_summary', v_professionals_summary,
        'generated_at', NOW()
    );
    
    RETURN v_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTIFICATION AND ALERT FUNCTIONS
-- ============================================================================

-- Function to create ANVISA notification
CREATE OR REPLACE FUNCTION create_anvisa_notification(
    p_event_id UUID,
    p_notification_type VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO anvisa_notifications (
        event_id,
        notification_type,
        status,
        created_at
    ) VALUES (
        p_event_id,
        p_notification_type,
        'pending',
        NOW()
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send pending alerts
CREATE OR REPLACE FUNCTION send_pending_alerts()
RETURNS INTEGER AS $$
DECLARE
    v_alerts_sent INTEGER := 0;
BEGIN
    -- Process expiry alerts for products
    INSERT INTO anvisa_alerts (
        alert_type,
        clinic_id,
        subject,
        message,
        priority,
        created_at
    )
    SELECT 
        'product_expiry',
        clinic_id,
        'Product Registration Expiring Soon',
        FORMAT('Product %s (ANVISA: %s) expires on %s', product_name, anvisa_registration_number, registration_expiry_date),
        'high',
        NOW()
    FROM anvisa_products
    WHERE regulatory_status = 'active'
    AND registration_expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30
    AND NOT EXISTS (
        SELECT 1 FROM anvisa_alerts aa
        WHERE aa.alert_type = 'product_expiry'
        AND aa.reference_id = anvisa_products.id::TEXT
        AND aa.created_at > CURRENT_DATE - 7
    );
    
    GET DIAGNOSTICS v_alerts_sent = ROW_COUNT;
    
    -- Process batch expiry alerts
    INSERT INTO anvisa_alerts (
        alert_type,
        clinic_id,
        subject,
        message,
        priority,
        created_at
    )
    SELECT 
        'batch_expiry',
        apb.clinic_id,
        'Product Batch Expiring Soon',
        FORMAT('Batch %s of %s expires on %s (Quantity: %s)', apb.batch_number, ap.product_name, apb.expiry_date, apb.current_quantity),
        'medium',
        NOW()
    FROM anvisa_product_batches apb
    JOIN anvisa_products ap ON apb.product_id = ap.id
    WHERE apb.status = 'available'
    AND apb.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 14
    AND NOT EXISTS (
        SELECT 1 FROM anvisa_alerts aa
        WHERE aa.alert_type = 'batch_expiry'
        AND aa.reference_id = apb.id::TEXT
        AND aa.created_at > CURRENT_DATE - 3
    );
    
    RETURN v_alerts_sent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADDITIONAL HELPER TABLES FOR LOGGING
-- ============================================================================

-- Stock movements log table
CREATE TABLE IF NOT EXISTS anvisa_stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES anvisa_products(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event status log table
CREATE TABLE IF NOT EXISTS anvisa_event_status_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES anvisa_adverse_events(id) ON DELETE CASCADE,
    previous_status anvisa_event_status,
    new_status anvisa_event_status NOT NULL,
    change_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Batch usage log table
CREATE TABLE IF NOT EXISTS anvisa_batch_usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID NOT NULL REFERENCES anvisa_product_batches(id) ON DELETE CASCADE,
    procedure_id UUID REFERENCES anvisa_procedures(id),
    quantity_used INTEGER NOT NULL,
    remaining_quantity INTEGER NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    used_by UUID REFERENCES users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS anvisa_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES anvisa_adverse_events(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    anvisa_reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,
    response_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS anvisa_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    reference_id TEXT,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS adverse_event_sequence START 1;

-- Create indexes for helper tables
CREATE INDEX IF NOT EXISTS idx_anvisa_stock_movements_product_id ON anvisa_stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_event_status_log_event_id ON anvisa_event_status_log(event_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_batch_usage_log_batch_id ON anvisa_batch_usage_log(batch_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_notifications_event_id ON anvisa_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_alerts_clinic_id ON anvisa_alerts(clinic_id);
CREATE INDEX IF NOT EXISTS idx_anvisa_alerts_created_at ON anvisa_alerts(created_at);

-- Enable RLS on helper tables
ALTER TABLE anvisa_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_event_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_batch_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE anvisa_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for helper tables
CREATE POLICY "Users can access stock movements from their clinic" ON anvisa_stock_movements
    FOR ALL USING (
        product_id IN (
            SELECT id FROM anvisa_products 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access event status logs from their clinic" ON anvisa_event_status_log
    FOR ALL USING (
        event_id IN (
            SELECT id FROM anvisa_adverse_events 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access batch usage logs from their clinic" ON anvisa_batch_usage_log
    FOR ALL USING (
        batch_id IN (
            SELECT id FROM anvisa_product_batches 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access notifications from their clinic" ON anvisa_notifications
    FOR ALL USING (
        event_id IN (
            SELECT id FROM anvisa_adverse_events 
            WHERE clinic_id IN (
                SELECT clinic_id FROM user_clinic_access 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access alerts from their clinic" ON anvisa_alerts
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM user_clinic_access 
            WHERE user_id = auth.uid()
        )
    );