-- =============================================================================
-- NeonPro Appointments System Database Schema
-- Created: ${new Date().toISOString()}
-- Purpose: Complete appointment booking system for patient portal
-- =============================================================================

-- Drop existing objects if they exist (for development)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.appointment_services CASCADE;
DROP TABLE IF EXISTS public.professionals CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.time_slots CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS professional_specialty CASCADE;

-- =============================================================================
-- ENUMS AND TYPES
-- =============================================================================

-- Appointment status enum
CREATE TYPE appointment_status AS ENUM (
  'pending',        -- Aguardando confirmação
  'confirmed',      -- Confirmado
  'in_progress',    -- Em andamento
  'completed',      -- Concluído
  'cancelled',      -- Cancelado
  'no_show'         -- Faltou
);

-- Professional specialty enum  
CREATE TYPE professional_specialty AS ENUM (
  'dermatologist',     -- Dermatologista
  'aesthetician',      -- Esteticista
  'cosmetologist',     -- Cosmetólogo
  'plastic_surgeon',   -- Cirurgião Plástico
  'nutritionist',      -- Nutricionista
  'physiotherapist'    -- Fisioterapeuta
);

-- =============================================================================
-- SERVICES TABLE
-- =============================================================================
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- facial, corporal, capilar, etc.
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  requires_evaluation BOOLEAN DEFAULT false, -- Requer avaliação prévia
  preparation_instructions TEXT, -- Instruções de preparo
  post_care_instructions TEXT,   -- Cuidados pós-procedimento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT services_name_check CHECK (length(name) >= 2),
  CONSTRAINT services_duration_check CHECK (duration_minutes > 0),
  CONSTRAINT services_price_check CHECK (price >= 0)
);

-- =============================================================================
-- PROFESSIONALS TABLE
-- =============================================================================
CREATE TABLE public.professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  specialty professional_specialty NOT NULL,
  license_number VARCHAR(50), -- CRM, COREN, etc.
  bio TEXT,
  photo_url TEXT,
  years_experience INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  accepts_new_patients BOOLEAN DEFAULT true,
  working_hours JSONB, -- Horários de trabalho flexíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT professionals_name_check CHECK (length(name) >= 2),
  CONSTRAINT professionals_experience_check CHECK (years_experience >= 0)
);-- =============================================================================
-- TIME SLOTS TABLE
-- =============================================================================
CREATE TABLE public.time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false, -- Para horários recorrentes
  recurrence_pattern JSONB, -- Padrão de recorrência (semanal, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT time_slots_time_check CHECK (end_time > start_time),
  CONSTRAINT time_slots_future_check CHECK (start_time > CURRENT_TIMESTAMP - INTERVAL '1 day')
);

-- =============================================================================
-- APPOINTMENTS TABLE  
-- =============================================================================
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  -- Scheduling Information
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  
  -- Status and Notes
  status appointment_status DEFAULT 'pending',
  patient_notes TEXT, -- Observações do paciente
  professional_notes TEXT, -- Observações do profissional
  internal_notes TEXT, -- Notas internas da clínica
  
  -- Booking Information
  booking_source VARCHAR(50) DEFAULT 'patient_portal', -- origem do agendamento
  confirmation_code VARCHAR(20) UNIQUE, -- código de confirmação
  reminder_sent_at TIMESTAMP WITH TIME ZONE, -- controle de lembrete
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT appointments_future_check CHECK (scheduled_at > CURRENT_TIMESTAMP - INTERVAL '1 day'),
  CONSTRAINT appointments_duration_check CHECK (duration_minutes > 0),
  CONSTRAINT appointments_notes_check CHECK (length(patient_notes) <= 1000)
);

-- =============================================================================
-- APPOINTMENT SERVICES JUNCTION TABLE (For multiple services per appointment)
-- =============================================================================
CREATE TABLE public.appointment_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL DEFAULT 1, -- Ordem dos serviços
  estimated_duration INTEGER NOT NULL,
  actual_duration INTEGER, -- Duração real (preenchida após o atendimento)
  
  UNIQUE(appointment_id, service_id),
  CONSTRAINT appointment_services_duration_check CHECK (estimated_duration > 0)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Services indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_price ON services(price);

-- Professionals indexes
CREATE INDEX idx_professionals_specialty ON professionals(specialty);
CREATE INDEX idx_professionals_active ON professionals(is_active, accepts_new_patients);
CREATE INDEX idx_professionals_user_id ON professionals(user_id);-- Time slots indexes
CREATE INDEX idx_time_slots_professional ON time_slots(professional_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_time_slots_available ON time_slots(is_available, start_time);

-- Appointments indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);  
CREATE INDEX idx_appointments_service ON appointments(service_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_confirmation ON appointments(confirmation_code);

-- Appointment services indexes
CREATE INDEX idx_appointment_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service ON appointment_services(service_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Services policies (public read for active services)
CREATE POLICY "Services are publicly readable" ON services
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.user_id = auth.uid() 
      AND patient_profiles.role = 'admin'
    )
  );

-- Professionals policies (public read for active professionals)  
CREATE POLICY "Active professionals are publicly readable" ON professionals
  FOR SELECT TO authenticated USING (is_active = true AND accepts_new_patients = true);

CREATE POLICY "Professionals can update their own profile" ON professionals
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage professionals" ON professionals
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.user_id = auth.uid() 
      AND patient_profiles.role = 'admin'
    )
  );

-- Time slots policies
CREATE POLICY "Available time slots are publicly readable" ON time_slots
  FOR SELECT TO authenticated USING (
    is_available = true AND start_time > CURRENT_TIMESTAMP
  );

CREATE POLICY "Professionals can manage their time slots" ON time_slots
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM professionals 
      WHERE professionals.id = time_slots.professional_id 
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all time slots" ON time_slots
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.user_id = auth.uid() 
      AND patient_profiles.role = 'admin'
    )
  );-- Appointments policies
CREATE POLICY "Patients can view their own appointments" ON appointments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = appointments.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their own appointments" ON appointments
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = appointments.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update their own appointments" ON appointments
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = appointments.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.id = appointments.patient_id 
      AND patient_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their appointments" ON appointments
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM professionals 
      WHERE professionals.id = appointments.professional_id 
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update their appointments" ON appointments
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM professionals 
      WHERE professionals.id = appointments.professional_id 
      AND professionals.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all appointments" ON appointments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM patient_profiles 
      WHERE patient_profiles.user_id = auth.uid() 
      AND patient_profiles.role = 'admin'
    )
  );

-- Appointment services policies
CREATE POLICY "Appointment services inherit appointment policies" ON appointment_services
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN patient_profiles p ON (p.id = a.patient_id)
      WHERE a.id = appointment_services.appointment_id
      AND (
        p.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM professionals pr 
          WHERE pr.id = a.professional_id AND pr.user_id = auth.uid()
        ) OR
        p.role = 'admin'
      )
    )
  );

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON professionals  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate confirmation code function
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL THEN
    NEW.confirmation_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply confirmation code trigger
CREATE TRIGGER generate_appointment_confirmation_code
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION generate_confirmation_code();

-- =============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- =============================================================================

-- Insert sample services
INSERT INTO services (name, description, category, duration_minutes, price) VALUES
('Limpeza de Pele Profunda', 'Procedimento completo de limpeza facial com extração', 'facial', 90, 150.00),
('Peeling Químico', 'Renovação celular com ácidos específicos', 'facial', 60, 200.00),
('Massagem Relaxante', 'Massagem corporal para alívio do estresse', 'corporal', 60, 120.00),
('Drenagem Linfática', 'Técnica para redução de inchaço e retenção', 'corporal', 90, 180.00),
('Botox', 'Aplicação de toxina botulínica para rugas de expressão', 'facial', 30, 800.00),
('Preenchimento Labial', 'Aumento e contorno dos lábios com ácido hialurônico', 'facial', 45, 600.00);

-- Note: Professional data will be inserted when actual professionals register

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Available appointments view
CREATE VIEW available_time_slots AS
SELECT 
  ts.id,
  ts.professional_id,
  p.name AS professional_name,
  p.specialty,
  ts.start_time,
  ts.end_time,
  EXTRACT(EPOCH FROM (ts.end_time - ts.start_time))/60 AS duration_minutes
FROM time_slots ts
JOIN professionals p ON p.id = ts.professional_id
WHERE ts.is_available = true 
  AND ts.start_time > CURRENT_TIMESTAMP
  AND p.is_active = true
  AND p.accepts_new_patients = true
ORDER BY ts.start_time;

-- Appointment details view
CREATE VIEW appointment_details AS
SELECT 
  a.id,
  a.confirmation_code,
  a.scheduled_at,
  a.status,
  a.duration_minutes,
  a.patient_notes,
  
  -- Patient info
  pp.name AS patient_name,
  pp.phone AS patient_phone,
  pp.email AS patient_email,
  
  -- Professional info  
  pr.name AS professional_name,
  pr.specialty AS professional_specialty,
  
  -- Service info
  s.name AS service_name,
  s.category AS service_category,
  s.price AS service_price,
  
  a.created_at,
  a.updated_at
FROM appointments a
JOIN patient_profiles pp ON pp.id = a.patient_id
JOIN professionals pr ON pr.id = a.professional_id  
JOIN services s ON s.id = a.service_id;

COMMIT;

-- =============================================================================
-- END OF APPOINTMENTS SYSTEM SCHEMA
-- =============================================================================