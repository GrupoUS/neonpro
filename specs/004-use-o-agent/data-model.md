# Data Model & Architecture Design

## Database Schema Design

### Core Tables Structure

#### 1. clinics (Multi-tenant root)
```sql
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    -- Clinic configuration
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    language TEXT DEFAULT 'pt-BR',
    currency TEXT DEFAULT 'BRL',
    -- Compliance fields
    lgpd_consent_date TIMESTAMPTZ,
    anvisa_registration TEXT,
    professional_council_number TEXT
);

-- RLS: Clinic management
CREATE POLICY clinic_management ON clinics
    FOR ALL TO authenticated
    USING (id IN (
        SELECT clinic_id FROM user_clinics 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ));
```

#### 2. users (with multi-tenant relationships)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Professional information
    professional_license TEXT,
    specialization TEXT[],
    -- Compliance
    lgpd_consent_date TIMESTAMPTZ,
    phone_number TEXT
);

-- Junction table for multi-tenant user-clinic relationships
CREATE TABLE user_clinics (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'professional', 'staff', 'receptionist')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, clinic_id)
);

-- RLS: User access control
CREATE POLICY user_access ON users
    FOR SELECT TO authenticated
    USING (id = auth.uid() OR id IN (
        SELECT user_id FROM user_clinics 
        WHERE clinic_id = auth.jwt() ->> 'clinic_id'::uuid
    ));
```

#### 3. appointments (Real-time scheduling)
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    service_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Optimistic concurrency
    version INTEGER DEFAULT 1,
    -- Compliance
    lgpd_processing_consent BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX appointments_clinic_time ON appointments(clinic_id, start_time);
CREATE INDEX appointments_patient ON appointments(patient_id);
CREATE INDEX appointments_professional ON appointments(professional_id);

-- RLS: Multi-tenant isolation
CREATE POLICY appointment_isolation ON appointments
    FOR ALL TO authenticated
    USING (clinic_id = auth.jwt() ->> 'clinic_id'::uuid)
    WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id'::uuid);
```

#### 4. leads (Potential patient management)
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'new' 
        CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- AI-powered follow-up
    next_follow_up TIMESTAMPTZ,
    ai_predictions JSONB DEFAULT '{}'
);

-- RLS: Multi-tenant isolation
CREATE POLICY lead_isolation ON leads
    FOR ALL TO authenticated
    USING (clinic_id = auth.jwt() ->> 'clinic_id'::uuid)
    WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id'::uuid);
```

#### 5. messages (Real-time communication)
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' 
        CHECK (type IN ('text', 'system', 'appointment_update', 'lead_update')),
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX messages_clinic_time ON messages(clinic_id, created_at);
CREATE INDEX messages_conversation ON messages(sender_id, recipient_id);

-- RLS: Multi-tenant isolation
CREATE POLICY message_isolation ON messages
    FOR ALL TO authenticated
    USING (clinic_id = auth.jwt() ->> 'clinic_id'::uuid)
    WITH CHECK (clinic_id = auth.jwt() ->> 'clinic_id'::uuid);
```

## Realtime Strategy

### Supabase Realtime Subscriptions

#### Table Subscription Strategy
```typescript
// Realtime subscription setup
const realtimeConfig = {
  appointments: {
    filter: `clinic_id=eq.${clinicId}`,
    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
    callback: handleAppointmentChange
  },
  messages: {
    filter: `clinic_id=eq.${clinicId}`,
    event: 'INSERT', // Only new messages for real-time chat
    callback: handleNewMessage
  },
  leads: {
    filter: `clinic_id=eq.${clinicId}`,
    event: '*',
    callback: handleLeadChange
  }
};
```

#### TanStack Query Integration
```typescript
// Cache patching strategy
const handleAppointmentChange = (payload: RealtimePayload) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      queryClient.setQueryData(['appointments'], (old) => [...old, newRecord]);
      break;
    case 'UPDATE':
      queryClient.setQueryData(['appointments'], (old) => 
        old.map(app => app.id === newRecord.id ? newRecord : app)
      );
      break;
    case 'DELETE':
      queryClient.setQueryData(['appointments'], (old) => 
        old.filter(app => app.id !== oldRecord.id)
      );
      break;
  }
};
```

### Optimistic Updates
```typescript
// Optimistic update pattern with rollback
const useUpdateAppointment = () => {
  return useMutation({
    mutationFn: updateAppointment,
    onMutate: async (newAppointment) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['appointments']);
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(['appointments']);
      
      // Optimistically update
      queryClient.setQueryData(['appointments'], (old) =>
        old.map(app => app.id === newAppointment.id ? newAppointment : app)
      );
      
      return { previousAppointments };
    },
    onError: (err, newAppointment, context) => {
      // Rollback on error
      queryClient.setQueryData(['appointments'], context.previousAppointments);
    },
    onSettled: () => {
      // Refetch on completion
      queryClient.invalidateQueries(['appointments']);
    }
  });
};
```

## Security Model

### JWT Claims Structure
```typescript
interface JWTPayload {
  sub: string;           // User ID
  clinic_id: string;      // Current clinic context
  role: string;          // User role
  permissions: string[];  // Granular permissions
  iat: number;           // Issued at
  exp: number;           // Expiration
}
```

### RLS Policy Examples
```sql
-- Professional can only see their appointments
CREATE POLICY professional_appointments ON appointments
    FOR SELECT TO authenticated
    USING (
        clinic_id = auth.jwt() ->> 'clinic_id'::uuid
        AND professional_id = auth.uid()
    );

-- Admin can see all clinic appointments
CREATE POLICY admin_appointments ON appointments
    FOR ALL TO authenticated
    USING (
        clinic_id = auth.jwt() ->> 'clinic_id'::uuid
        AND EXISTS (
            SELECT 1 FROM user_clinics 
            WHERE user_id = auth.uid() 
            AND clinic_id = auth.jwt() ->> 'clinic_id'::uuid
            AND role = 'admin'
        )
    );
```

## Data Validation

### Zod Schema Integration
```typescript
// Generated types from Supabase
export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          start_time: string;
          end_time: string;
          service_type: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
          version: number;
          lgpd_processing_consent: boolean;
        };
        Insert: {
          id?: string;
          clinic_id: string;
          patient_id: string;
          professional_id: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          start_time: string;
          end_time: string;
          service_type: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
          lgpd_processing_consent?: boolean;
        };
        Update: {
          id?: string;
          clinic_id?: string;
          patient_id?: string;
          professional_id?: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          start_time?: string;
          end_time?: string;
          service_type?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          version?: number;
          lgpd_processing_consent?: boolean;
        };
      };
      // ... other tables
    };
  };
}
```

### Zod DTOs
```typescript
import { z } from 'zod';

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  service_type: z.string().min(1),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  version: z.number().positive(),
  lgpd_processing_consent: z.boolean(),
});

export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  version: true,
}).extend({
  // Additional validation for creation
  start_time: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), 'Start time must be in the future'),
  end_time: z.string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), 'End time must be in the future'),
});

export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointment = z.infer<typeof CreateAppointmentSchema>;
```

## Performance Optimization

### Database Indexes
```sql
-- Multi-tenant query optimization
CREATE INDEX appointments_clinic_status_time 
    ON appointments(clinic_id, status, start_time);

-- Realtime subscription optimization
CREATE INDEX messages_clinic_recipient 
    ON messages(clinic_id, recipient_id, created_at);

-- Lead management optimization
CREATE INDEX leads_clinic_status_assigned 
    ON leads(clinic_id, status, assigned_to);
```

### Query Optimization
```typescript
// Efficient multi-tenant queries
const getAppointments = async (clinicId: string, filters: AppointmentFilters) => {
  return supabase
    .from('appointments')
    .select(`
      *,
      patient:users(name, email),
      professional:users(name, specialization)
    `)
    .eq('clinic_id', clinicId)
    .gte('start_time', filters.startDate)
    .lte('start_time', filters.endDate)
    .order('start_time', { ascending: true });
};
```

## Migration Strategy

### Schema Migration Order
1. **Phase 1**: Core tables (clinics, users, user_clinics)
2. **Phase 2**: Business tables (appointments, leads, messages)
3. **Phase 3**: RLS policies and security
4. **Phase 4**: Indexes and performance optimization

### Data Migration
```typescript
// Migration script example
const migrateData = async () => {
  // Migrate clinics first
  const clinics = await prisma.clinic.findMany();
  for (const clinic of clinics) {
    await supabase.from('clinics').insert({
      id: clinic.id,
      name: clinic.name,
      slug: clinic.slug,
      // ... other fields
    });
  }
  
  // Then migrate users and relationships
  const users = await prisma.user.findMany();
  for (const user of users) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      // ... other fields
    });
  }
};
```

This data model provides a solid foundation for the NeonPro refactoring with proper multi-tenant isolation, realtime capabilities, and performance optimization.