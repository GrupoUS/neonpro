# Services Table

## Schema

| Column           | Type        | Constraints           | Default           | Description                         | LGPD Classification |
| ---------------- | ----------- | --------------------- | ----------------- | ----------------------------------- | ------------------- |
| id               | uuid        | PRIMARY KEY, NOT NULL | gen_random_uuid() | Unique service identifier           | Public              |
| name             | text        | NOT NULL              | -                 | Service/procedure name              | Business Data       |
| description      | text        | -                     | -                 | Detailed service description        | Business Data       |
| duration_minutes | integer     | -                     | 60                | Default service duration in minutes | Business Data       |
| price            | numeric     | NOT NULL              | -                 | Service price in default currency   | Business Data       |
| category         | text        | -                     | -                 | Service category classification     | Business Data       |
| is_active        | boolean     | -                     | true              | Active service status               | Metadata            |
| created_at       | timestamptz | -                     | now()             | Record creation timestamp           | Metadata            |

## Advanced Aesthetic Compliance

**LGPD Status**: ✅ **Compliant** - Contains business and service data
**ANVISA Requirements**: Advanced aesthetic procedure classification for aesthetic medical services
**CFM Classification**: Advanced aesthetic medical service categorization for professional oversight
**Data Retention**: Indefinite (business catalog data)

## Relationships

- `service_types.id` ← `services.service_type_id` (RESTRICT - preserve service categorization)
- `appointments.service_id` → `services.id` (RESTRICT - maintain appointment service history)
- `professionals.service_type_ids` → `services.id` (ARRAY FK - professional service capabilities)
- `treatment_plans.service_id` → `services.id` (RESTRICT - preserve treatment plan integrity)

## Row Level Security (RLS)

**Status**: ✅ **Enabled** - Service catalog protection

### Current Policies

```sql
-- Public read access for active services (patient portal)
CREATE POLICY "public_view_active_services" ON services
  FOR SELECT USING (is_active = true);

-- Staff full access to clinic services
CREATE POLICY "staff_clinic_services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.is_active = true
    )
  );

-- Admin management access
CREATE POLICY "admin_manage_services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.role IN ('admin', 'manager')
    )
  );
```

## Service Categories

### Advanced Aesthetic Medical Services

- **Consultation** - Advanced aesthetic medical consultations and evaluations
- **Diagnostic** - Diagnostic procedures and tests
- **Therapeutic** - Treatment and therapy services
- **Surgical** - Surgical procedures and interventions
- **Preventive** - Preventive care and screenings

### Aesthetic Services

- **Facial** - Facial treatments and procedures
- **Body** - Body contouring and treatments
- **Dermatological** - Skin treatments and procedures
- **Cosmetic** - Cosmetic enhancements and procedures
- **Wellness** - Wellness and spa treatments

### Specialized Services

- **Laser** - Laser-based treatments
- **Injectable** - Injectable treatments (botox, fillers)
- **Radiofrequency** - RF-based procedures
- **Cryotherapy** - Cryogenic treatments
- **Phototherapy** - Light-based treatments

## Business Logic & Features

### Service Pricing

- **Dynamic Pricing**: Support for variable pricing based on professional, time, or patient
- **Package Deals**: Bundled services with discounted pricing
- **Insurance Integration**: Integration with advanced aesthetic health insurance coverage
- **Payment Plans**: Installment payment options

### Duration Management

- **Flexible Duration**: Base duration with professional-specific adjustments
- **Preparation Time**: Include setup and cleanup time in scheduling
- **Buffer Time**: Automatic buffer between appointments
- **Overtime Handling**: Managing services that run over scheduled time

### Professional Assignment

- **Skill Matching**: Services matched to professional capabilities
- **Certification Requirements**: Services requiring specific certifications
- **Experience Levels**: Different professionals for different complexity levels
- **Training Requirements**: Professional training validation for services

## Performance Optimizations

### Indexes

```sql
-- Core service queries
CREATE INDEX idx_services_active ON services (is_active);
CREATE INDEX idx_services_category ON services (category);
CREATE INDEX idx_services_price ON services (price);

-- Search functionality
CREATE INDEX idx_services_name_search ON services USING GIN (to_tsvector('portuguese', name));
CREATE INDEX idx_services_description_search ON services USING GIN (to_tsvector('portuguese', description));

-- Duration-based queries
CREATE INDEX idx_services_duration ON services (duration_minutes);
```

### Service Search

```sql
-- Full-text search for services
SELECT * FROM services
WHERE to_tsvector('portuguese', name || ' ' || COALESCE(description, ''))
      @@ plainto_tsquery('portuguese', 'laser facial');

-- Category-based filtering
SELECT * FROM services
WHERE category = 'facial' AND is_active = true
ORDER BY price ASC;

-- Duration-based filtering
SELECT * FROM services
WHERE duration_minutes BETWEEN 30 AND 120
  AND is_active = true;
```

## Integration Points

### Appointment System

- **Service Duration**: Automatic appointment slot calculation
- **Professional Availability**: Match services to professional capabilities
- **Resource Requirements**: Room and equipment requirements per service
- **Preparation Protocols**: Service-specific preparation requirements

### Financial System

- **Pricing Engine**: Dynamic pricing based on various factors
- **Tax Calculation**: Service-specific tax rates and classifications
- **Insurance Claims**: Integration with advanced aesthetic health insurance systems
- **Revenue Analytics**: Service-based revenue tracking and analysis

### Inventory Management

- **Material Requirements**: Products and materials used per service
- **Supply Tracking**: Automatic inventory deduction
- **Cost Calculation**: Service profitability analysis
- **Vendor Integration**: Supply chain management for service materials

## Advanced Aesthetic Service Classification

### ANVISA Categories

- **Class I**: Low-risk procedures (basic consultations)
- **Class II**: Medium-risk procedures (diagnostic procedures)
- **Class III**: High-risk procedures (surgical interventions)
- **Class IV**: Critical procedures (life-sustaining treatments)

### CFM Professional Requirements

- **Advanced Aesthetic Medical Only**: Services requiring advanced aesthetic medical doctor oversight
- **Supervised**: Services requiring professional supervision
- **Independent**: Services that can be performed independently
- **Restricted**: Services with specific licensing requirements

### Insurance Classification

- **Covered**: Services covered by advanced aesthetic health insurance
- **Partial**: Services with partial insurance coverage
- **Cosmetic**: Elective cosmetic procedures (not covered)
- **Emergency**: Emergency advanced aesthetic medical services

## Audit & Compliance

### Service Audit Trail

```sql
-- Service modification tracking
CREATE TRIGGER services_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW
  EXECUTE FUNCTION create_audit_log();

-- Price change monitoring
CREATE TRIGGER service_price_change_trigger
  AFTER UPDATE ON services
  FOR EACH ROW
  WHEN (OLD.price != NEW.price)
  EXECUTE FUNCTION log_price_change();

-- Service activation/deactivation tracking
CREATE TRIGGER service_status_change_trigger
  AFTER UPDATE ON services
  FOR EACH ROW
  WHEN (OLD.is_active != NEW.is_active)
  EXECUTE FUNCTION log_service_status_change();
```

### Regulatory Compliance

- **Service Approval**: Required approvals for new advanced aesthetic medical services
- **Professional Validation**: Ensure professionals are qualified for services
- **Safety Protocols**: Service-specific safety and emergency procedures
- **Documentation Requirements**: Service-related documentation and consent forms

### Quality Management

- **Service Standards**: Quality metrics and performance standards
- **Patient Feedback**: Service rating and review system
- **Outcome Tracking**: Service effectiveness and patient satisfaction
- **Continuous Improvement**: Service optimization based on outcomes

---

> **Service Catalog Notice**: This table maintains the core service offerings for advanced aesthetic establishments. All services must comply with regulatory requirements and professional scope of practice.

> **Business Integration**: Services are integrated across scheduling, financial, inventory, and compliance systems to ensure comprehensive advanced aesthetic service management.
