-- =====================================================
-- NEONPRO ROW LEVEL SECURITY (RLS) POLICIES
-- Sistema de Clínicas Estéticas - Conformidade LGPD/ANVISA
-- =====================================================

-- Habilitar RLS em todas as tabelas sensíveis
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA PACIENTES (PATIENTS)
-- =====================================================

-- Política: Pacientes podem ver apenas seus próprios dados
CREATE POLICY "patients_select_own_data" ON patients
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
      -- Staff da clínica pode ver todos os pacientes do tenant
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.tenant_id = current_setting('app.current_tenant_id')::uuid
        AND up.role IN ('admin', 'doctor', 'nurse', 'receptionist')
      )
      OR 
      -- Paciente pode ver apenas seus próprios dados
      (
        user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM user_profiles up
          WHERE up.user_id = auth.uid()
          AND up.role = 'patient'
        )
      )
    )
  );

-- Política: Apenas staff autorizado pode inserir pacientes
CREATE POLICY "patients_insert_staff_only" ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.tenant_id = current_setting('app.current_tenant_id')::uuid
      AND up.role IN ('admin', 'doctor', 'receptionist')
    )
  );

-- =====================================================
-- POLÍTICAS PARA CONSULTAS (APPOINTMENTS)
-- =====================================================

-- Política: Ver consultas baseado no papel do usuário
CREATE POLICY "appointments_select_by_role" ON appointments
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
      -- Staff pode ver todas as consultas
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.tenant_id = current_setting('app.current_tenant_id')::uuid
        AND up.role IN ('admin', 'doctor', 'nurse', 'receptionist')
      )
      OR
      -- Paciente pode ver apenas suas consultas
      (
        patient_id IN (
          SELECT p.id FROM patients p
          WHERE p.user_id = auth.uid()
          AND p.tenant_id = current_setting('app.current_tenant_id')::uuid
        )
      )
    )
  );

-- =====================================================
-- POLÍTICAS PARA FATURAS (INVOICES)
-- =====================================================

-- Política: Faturas - acesso por papel
CREATE POLICY "invoices_select_by_role" ON invoices
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    AND (
      -- Staff financeiro pode ver todas as faturas
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.tenant_id = current_setting('app.current_tenant_id')::uuid
        AND up.role IN ('admin', 'receptionist')
      )
      OR
      -- Paciente pode ver apenas suas faturas
      (
        patient_id IN (
          SELECT p.id FROM patients p
          WHERE p.user_id = auth.uid()
          AND p.tenant_id = current_setting('app.current_tenant_id')::uuid
        )
      )
    )
  );

-- =====================================================
-- CONFIGURAÇÕES DE AUDITORIA LGPD/ANVISA
-- =====================================================

-- Função para log automático de acesso
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    tenant_id,
    action,
    resource_type,
    resource_id,
    timestamp,
    ip_address
  ) VALUES (
    auth.uid(),
    current_setting('app.current_tenant_id')::uuid,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    NOW(),
    current_setting('app.client_ip', true)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para auditoria
CREATE TRIGGER audit_patients_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION log_data_access();

CREATE TRIGGER audit_appointments_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_data_access();