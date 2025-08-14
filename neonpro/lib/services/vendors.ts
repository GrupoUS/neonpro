// lib/services/vendors.ts
// Service layer for vendor management

import { createClient } from '@/app/utils/supabase/client'
import { Vendor, VendorFilters, VendorFormData, VendorsResponse } from '@/lib/types/accounts-payable'

const supabase = createClient()

export class VendorService {
  
  /**
   * Get all vendors with optional filtering
   */
  static async getVendors(filters?: VendorFilters, page = 1, pageSize = 20): Promise<VendorsResponse> {
    try {
      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('company_name')

      // Apply filters
      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,vendor_code.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
      }
      
      if (filters?.vendor_type) {
        query = query.eq('vendor_type', filters.vendor_type)
      }
      
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      
      if (filters?.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }
      
      if (filters?.requires_approval !== undefined) {
        query = query.eq('requires_approval', filters.requires_approval)
      }

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: vendors, error, count } = await query

      if (error) {
        console.error('Error fetching vendors:', error)
        throw new Error(`Failed to fetch vendors: ${error.message}`)
      }

      return {
        vendors: vendors || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Error in getVendors:', error)
      throw error
    }
  }

  /**
   * Get vendor by ID
   */
  static async getVendorById(id: string): Promise<Vendor | null> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Vendor not found
        }
        console.error('Error fetching vendor:', error)
        throw new Error(`Failed to fetch vendor: ${error.message}`)
      }

      return vendor
    } catch (error) {
      console.error('Error in getVendorById:', error)
      throw error
    }
  }

  /**
   * Create new vendor
   */
  static async createVendor(vendorData: VendorFormData): Promise<Vendor> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert([{
          ...vendorData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating vendor:', error)
        throw new Error(`Failed to create vendor: ${error.message}`)
      }

      return vendor
    } catch (error) {
      console.error('Error in createVendor:', error)
      throw error
    }
  }

  /**
   * Update existing vendor
   */
  static async updateVendor(id: string, vendorData: Partial<VendorFormData>): Promise<Vendor> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          ...vendorData,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        console.error('Error updating vendor:', error)
        throw new Error(`Failed to update vendor: ${error.message}`)
      }

      return vendor
    } catch (error) {
      console.error('Error in updateVendor:', error)
      throw error
    }
  }

  /**
   * Soft delete vendor
   */
  static async deleteVendor(id: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id,
          deleted_reason: reason || 'Deleted by user',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Error deleting vendor:', error)
        throw new Error(`Failed to delete vendor: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteVendor:', error)
      throw error
    }
  }

  /**
   * Toggle vendor active status
   */
  static async toggleVendorStatus(id: string, isActive: boolean): Promise<Vendor> {
    try {
      const { data: vendor, error } = await supabase
        .from('vendors')
        .update({
          is_active: isActive,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error) {
        console.error('Error toggling vendor status:', error)
        throw new Error(`Failed to toggle vendor status: ${error.message}`)
      }

      return vendor
    } catch (error) {
      console.error('Error in toggleVendorStatus:', error)
      throw error
    }
  }

  /**
   * Check if vendor code is unique
   */
  static async isVendorCodeUnique(vendorCode: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('vendors')
        .select('id')
        .eq('vendor_code', vendorCode)
        .is('deleted_at', null)

      if (excludeId) {
        query = query.neq('id', excludeId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking vendor code uniqueness:', error)
        return false
      }

      return data.length === 0
    } catch (error) {
      console.error('Error in isVendorCodeUnique:', error)
      return false
    }
  }

  /**
   * Generate next vendor code
   */
  static async generateVendorCode(prefix = 'VEND'): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_code')
        .like('vendor_code', `${prefix}%`)
        .is('deleted_at', null)
        .order('vendor_code', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error generating vendor code:', error)
        return `${prefix}001`
      }

      if (!data || data.length === 0) {
        return `${prefix}001`
      }

      const lastCode = data[0].vendor_code
      const numericPart = lastCode.replace(prefix, '')
      const nextNumber = parseInt(numericPart) + 1

      return `${prefix}${nextNumber.toString().padStart(3, '0')}`
    } catch (error) {
      console.error('Error in generateVendorCode:', error)
      return `${prefix}001`
    }
  }

  /**
   * Get active vendors for dropdown selection
   */
  static async getActiveVendorsForSelection(): Promise<{ id: string; label: string; value: string }[]> {
    try {
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, vendor_code, company_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('company_name')

      if (error) {
        console.error('Error fetching active vendors:', error)
        throw new Error(`Failed to fetch active vendors: ${error.message}`)
      }

      return vendors.map(vendor => ({
        id: vendor.id,
        label: `${vendor.vendor_code} - ${vendor.company_name}`,
        value: vendor.id
      }))
    } catch (error) {
      console.error('Error in getActiveVendorsForSelection:', error)
      throw error
    }
  }

  /**
   * Get vendor statistics
   */
  static async getVendorStats() {
    try {
      const [totalResult, activeResult, inactiveResult, typesResult] = await Promise.all([
        supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        
        supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .is('deleted_at', null),
        
        supabase
          .from('vendors')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', false)
          .is('deleted_at', null),
        
        supabase
          .from('vendors')
          .select('vendor_type')
          .is('deleted_at', null)
      ])

      const typeDistribution = typesResult.data?.reduce((acc: Record<string, number>, vendor) => {
        acc[vendor.vendor_type] = (acc[vendor.vendor_type] || 0) + 1
        return acc
      }, {}) || {}

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0,
        typeDistribution
      }
    } catch (error) {
      console.error('Error in getVendorStats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        typeDistribution: {}
      }
    }
  }
}
