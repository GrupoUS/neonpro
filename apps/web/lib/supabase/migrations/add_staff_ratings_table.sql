-- Migration: Add staff_ratings table for rating system
-- Date: 2025-08-18
-- Purpose: Support rating functionality in RPC functions

-- Create staff_ratings table
CREATE TABLE IF NOT EXISTS staff_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_ratings_staff_member_id ON staff_ratings(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_ratings_created_at ON staff_ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_ratings_status ON staff_ratings(status);

-- Enable RLS (Row Level Security)
ALTER TABLE staff_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view ratings for their clinic's staff
CREATE POLICY "Users can view staff ratings for their clinic" ON staff_ratings
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM healthcare_professionals hp
        INNER JOIN staff_members sm ON sm.clinic_id = hp.clinic_id
        WHERE hp.user_id = auth.uid()
        AND sm.id = staff_ratings.staff_member_id
    )
);

-- RLS Policy: Patients can create ratings for appointments they attended
CREATE POLICY "Patients can create ratings for their appointments" ON staff_ratings
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.id = staff_ratings.appointment_id
        AND a.patient_id = staff_ratings.patient_id
        AND a.status = 'completed'
    )
);

-- Add audit trail for ratings
CREATE TABLE IF NOT EXISTS staff_ratings_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_rating DECIMAL(2,1),
    new_rating DECIMAL(2,1),
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);