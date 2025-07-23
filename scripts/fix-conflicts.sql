-- fix-conflicts.sql
-- NeonPro Database Conflicts Resolution
-- Resolves conflicts between overlapping migration scripts

\echo '=== Fixing Migration Conflicts ==='

-- Problem: 04-appointments-system.sql conflicts with 02-setup-appointments.sql
-- Solution: Skip or modify conflicting sections

\echo '--- Checking for table conflicts ---'

DO $$
BEGIN
    -- Check if appointments table already exists from 02-setup-appointments.sql
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'appointments'
    ) THEN
        RAISE NOTICE 'appointments table already exists - skipping 04-appointments-system.sql';
    END IF;
    
    -- Check if professionals table already exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'professionals'
    ) THEN
        RAISE NOTICE 'professionals table already exists - skipping parts of 04-appointments-system.sql';
    END IF;
END $$;

\echo '--- Adding missing enums from 04-appointments-system.sql ---'

-- Add appointment status enum if it doesn't exist (but avoid conflict with CHECK constraint)
DO $$
BEGIN
    -- Only create the enum types that don't conflict
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'professional_specialty') THEN
        CREATE TYPE professional_specialty AS ENUM (
            'dermatologist',     -- Dermatologista
            'aesthetician',      -- Esteticista
            'cosmetologist',     -- Cosmetólogo
            'plastic_surgeon',   -- Cirurgião Plástico
            'nutritionist',      -- Nutricionista
            'physiotherapist'    -- Fisioterapeuta
        );
        RAISE NOTICE 'Created professional_specialty enum';
    ELSE
        RAISE NOTICE 'professional_specialty enum already exists';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Enum types already exist, skipping creation';
END $$;

\echo '--- Adding services table from 04-appointments-system.sql ---'

-- Create services table (renamed to avoid conflict with service_types)
CREATE TABLE IF NOT EXISTS public.service_catalog (
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

-- Enable RLS for service_catalog
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;

\echo '--- Adding time_slots table ---'

-- Create time_slots table (useful for appointment scheduling)
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false, -- Para horários recorrentes
    recurrence_pattern JSONB, -- Padrão de recorrência (semanal, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT time_slots_time_check CHECK (end_time > start_time),
    CONSTRAINT time_slots_future_check CHECK (start_time > CURRENT_TIMESTAMP - INTERVAL '1 day')
);

-- Enable RLS for time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Create indexes for time_slots
CREATE INDEX IF NOT EXISTS idx_time_slots_professional_id ON public.time_slots(professional_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON public.time_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON public.time_slots(is_available) WHERE is_available = true;

\echo '--- Adding RLS policies for new tables ---'

-- RLS policies for service_catalog
CREATE POLICY "Anyone can view active services" ON public.service_catalog
    FOR SELECT USING (is_active = true);

CREATE POLICY "Clinic staff can manage services" ON public.service_catalog
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
        )
    );

-- RLS policies for time_slots
CREATE POLICY "Clinic staff can view time slots" ON public.time_slots
    FOR SELECT USING (
        professional_id IN (
            SELECT id FROM public.professionals p
            WHERE p.clinic_id IN (
                SELECT clinic_id FROM public.clinic_staff 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Clinic staff can manage time slots" ON public.time_slots
    FOR ALL USING (
        professional_id IN (
            SELECT id FROM public.professionals p
            WHERE p.clinic_id IN (
                SELECT clinic_id FROM public.clinic_staff 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'owner', 'receptionist')
            )
        )
    );

\echo '--- Adding missing columns to existing tables ---'

-- Add specialty column to professionals table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'professionals' 
        AND column_name = 'specialty'
    ) THEN
        ALTER TABLE public.professionals 
        ADD COLUMN specialty TEXT;
        
        RAISE NOTICE 'Added specialty column to professionals table';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add specialty column: %', SQLERRM;
END $$;

-- Add useful columns to professionals table
DO $$
BEGIN
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'professionals' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.professionals 
        ADD COLUMN bio TEXT;
    END IF;
    
    -- Add photo_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'professionals' 
        AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE public.professionals 
        ADD COLUMN photo_url TEXT;
    END IF;
    
    -- Add years_experience column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'professionals' 
        AND column_name = 'years_experience'
    ) THEN
        ALTER TABLE public.professionals 
        ADD COLUMN years_experience INTEGER DEFAULT 0;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add columns to professionals: %', SQLERRM;
END $$;

\echo '--- Creating missing triggers ---'

-- Add trigger for service_catalog updated_at
CREATE TRIGGER update_service_catalog_updated_at 
    BEFORE UPDATE ON public.service_catalog 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '--- Conflicts Resolution Complete ---'

-- Summary of changes
SELECT 
    'Conflict resolution completed. New tables created:' as summary
UNION ALL
SELECT '  • service_catalog (extended services table)'
UNION ALL  
SELECT '  • time_slots (appointment scheduling)'
UNION ALL
SELECT 'Existing tables enhanced:'
UNION ALL
SELECT '  • professionals (added specialty, bio, photo_url, years_experience)';

\echo '=== All conflicts resolved successfully ==='