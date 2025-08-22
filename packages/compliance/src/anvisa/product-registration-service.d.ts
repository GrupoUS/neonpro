/**
 * ANVISA Product Registration Service
 * Constitutional healthcare compliance for product registration monitoring
 *
 * @fileoverview ANVISA product registration validation and monitoring
 * @version 1.0.0
 * @since 2025-01-17
 */
type Database = any;
import type { createClient } from '@supabase/supabase-js';
/**
 * ANVISA Product Registration Interface
 * Constitutional validation for aesthetic and medical products
 */
export type ProductRegistration = {
    /** Unique product identifier */
    product_id: string;
    /** ANVISA registration number (constitutional requirement) */
    anvisa_registration_number: string;
    /** Current registration status with ANVISA */
    registration_status: 'active' | 'suspended' | 'cancelled' | 'pending';
    /** Product category for regulatory classification */
    product_category: 'medical_device' | 'cosmetic' | 'pharmaceutical' | 'aesthetic_equipment';
    /** Registration expiry date (constitutional monitoring) */
    registration_expiry: Date;
    /** Constitutional compliance requirements */
    compliance_requirements: string[];
    /** Monitoring alerts enabled status */
    monitoring_alerts: boolean;
    /** Clinic/tenant association */
    tenant_id: string;
    /** Creation timestamp */
    created_at: Date;
    /** Last update timestamp */
    updated_at: Date;
    /** Constitutional audit trail */
    audit_trail: ProductRegistrationAudit[];
}; /**
 * Product Registration Audit Trail
 * Constitutional audit requirements for product registration changes
 */
export type ProductRegistrationAudit = {
    /** Audit entry unique identifier */
    audit_id: string;
    /** Product registration ID being audited */
    product_id: string;
    /** Action performed on registration */
    action: 'created' | 'updated' | 'status_changed' | 'expired' | 'renewed';
    /** Previous values before change */
    previous_values: Partial<ProductRegistration>;
    /** New values after change */
    new_values: Partial<ProductRegistration>;
    /** User who performed the action */
    user_id: string;
    /** Constitutional timestamp */
    timestamp: Date;
    /** Reason for change (constitutional requirement) */
    reason: string;
};
/**
 * Product Registration Query Filters
 * Constitutional search and filtering capabilities
 */
export type ProductRegistrationFilters = {
    /** Filter by registration status */
    status?: ProductRegistration['registration_status'];
    /** Filter by product category */
    category?: ProductRegistration['product_category'];
    /** Filter by expiry date range */
    expiry_date_range?: {
        start: Date;
        end: Date;
    };
    /** Filter by tenant/clinic */
    tenant_id?: string;
    /** Filter by monitoring alerts */
    monitoring_alerts?: boolean;
    /** Constitutional compliance search */
    compliance_search?: string;
}; /**
 * ANVISA Product Registration Service Implementation
 * Constitutional healthcare compliance with ≥9.9/10 quality standards
 */
export declare class ProductRegistrationService {
    private readonly supabase;
    constructor(supabaseClient: ReturnType<typeof createClient<Database>>);
    /**
     * Register new product with ANVISA compliance
     * Constitutional healthcare validation with audit trail
     */
    registerProduct(productData: Omit<ProductRegistration, 'product_id' | 'created_at' | 'updated_at' | 'audit_trail'>, userId: string): Promise<{
        success: boolean;
        data?: ProductRegistration;
        error?: string;
    }>; /**
     * Get product registrations with constitutional filtering
     * LGPD compliant with tenant isolation
     */
    getProductRegistrations(tenantId: string, filters?: ProductRegistrationFilters): Promise<{
        success: boolean;
        data?: ProductRegistration[];
        error?: string;
    }>; /**
     * Update product registration with constitutional audit trail
     * ANVISA compliance with change tracking
     */
    updateProductRegistration(productId: string, updates: Partial<ProductRegistration>, userId: string, reason: string): Promise<{
        success: boolean;
        data?: ProductRegistration;
        error?: string;
    }>; /**
     * Constitutional validation for product registration
     * ANVISA compliance with healthcare standards ≥9.9/10
     */
    private validateProductRegistration; /**
     * Schedule constitutional expiry alerts for product registration
     * ANVISA compliance monitoring with proactive notifications
     */
    private scheduleExpiryAlerts; /**
     * Get products expiring soon for constitutional monitoring
     * ANVISA compliance dashboard integration
     */
    getExpiringProducts(tenantId: string, daysThreshold?: number): Promise<{
        success: boolean;
        data?: ProductRegistration[];
        error?: string;
    }>;
    /**
     * Generate constitutional compliance report for ANVISA products
     * Healthcare audit requirements ≥9.9/10
     */
    generateComplianceReport(tenantId: string): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
}
export default ProductRegistrationService;
