-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Users can view their own services" ON services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services" ON services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON services
    FOR DELETE USING (auth.uid() = user_id);

-- Professionals policies
CREATE POLICY "Users can view their own professionals" ON professionals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own professionals" ON professionals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own professionals" ON professionals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own professionals" ON professionals
    FOR DELETE USING (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Medical records policies
CREATE POLICY "Users can view their own medical records" ON medical_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical records" ON medical_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records" ON medical_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records" ON medical_records
    FOR DELETE USING (auth.uid() = user_id);

-- Financial transactions policies
CREATE POLICY "Users can view their own financial transactions" ON financial_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial transactions" ON financial_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial transactions" ON financial_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial transactions" ON financial_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Clinic settings policies
CREATE POLICY "Users can view their own clinic settings" ON clinic_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clinic settings" ON clinic_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinic settings" ON clinic_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clinic settings" ON clinic_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Appointment settings policies
CREATE POLICY "Users can view their own appointment settings" ON appointment_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointment settings" ON appointment_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointment settings" ON appointment_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointment settings" ON appointment_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view their own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" ON notification_settings
    FOR DELETE USING (auth.uid() = user_id);

-- WhatsApp logs policies
CREATE POLICY "Users can view their own whatsapp logs" ON whatsapp_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whatsapp logs" ON whatsapp_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_settings_updated_at BEFORE UPDATE ON clinic_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_settings_updated_at BEFORE UPDATE ON appointment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
