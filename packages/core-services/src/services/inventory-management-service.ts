/**
 * Comprehensive Inventory Management Service for Aesthetic Clinics
 * Handles product tracking, batch management, automated reordering, and regulatory compliance
 */

import { createClient } from '@supabase/supabase-js';
import type { 
  InventoryCategory, 
  Product, 
  InventoryBatch, 
  InventoryTransaction, 
  InventoryStockLevel,
  ProductUsageRecord,
  InventoryAlert,
  PurchaseOrder,
  PurchaseOrderItem
} from '@neonpro/types';

export interface InventoryManagementConfig {
  clinicId: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface InventoryStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  daysOfStock: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendedOrderQuantity: number;
}

export interface ProductUsageStats {
  productId: string;
  productName: string;
  monthlyUsage: number;
  quarterlyUsage: number;
  averageDailyUsage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: number;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockItems: number;
  criticalStockItems: number;
  expiringSoonItems: number;
  expiredItems: number;
  totalInventoryValue: number;
  monthlyUsageValue: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantityUsed: number;
    revenue: number;
  }>;
}

export class InventoryManagementService {
  private supabase;
  private config: InventoryManagementConfig;

  constructor(config: InventoryManagementConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  // === Product Management ===

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert([{
        ...productData,
        clinic_id: this.config.clinicId,
        profit_margin: ((productData.selling_price - productData.cost_price) / productData.cost_price) * 100
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create product: ${error.message}`);
    
    // Initialize stock level
    await this.initializeStockLevel(data.id);
    
    return data;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update product: ${error.message}`);
    return data;
  }

  async getProducts(filters?: {
    category?: string;
    requiresRefrigeration?: boolean;
    isLowStock?: boolean;
    isExpiringSoon?: boolean;
    search?: string;
  }): Promise<Product[]> {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        inventory_categories(name, color),
        inventory_stock_levels!left(
          current_stock,
          reserved_stock,
          available_stock,
          stock_status,
          days_of_stock
        )
      `)
      .eq('clinic_id', this.config.clinicId)
      .eq('is_active', true);

    if (filters?.category) {
      query = query.eq('inventory_categories.name', filters.category);
    }

    if (filters?.requiresRefrigeration !== undefined) {
      query = query.eq('requires_refrigeration', filters.requiresRefrigeration);
    }

    if (filters?.isLowStock) {
      query = query.eq('inventory_stock_levels.stock_status', 'low');
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get products: ${error.message}`);
    return data || [];
  }

  // === Batch Management ===

  async createInventoryBatch(batchData: Omit<InventoryBatch, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryBatch> {
    const { data, error } = await this.supabase
      .from('inventory_batches')
      .insert([batchData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create inventory batch: ${error.message}`);
    
    // Update stock level
    await this.updateStockLevel(batchData.product_id, batchData.current_quantity, 'purchase');
    
    return data;
  }

  async getInventoryBatches(productId?: string, expiringSoon?: boolean): Promise<InventoryBatch[]> {
    let query = this.supabase
      .from('inventory_batches')
      .select('*')
      .eq('is_active', true);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow);
    }

    query = query.order('expiry_date', { ascending: true });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get inventory batches: ${error.message}`);
    return data || [];
  }

  async checkBatchExpiry(productId: string): Promise<{ valid: InventoryBatch[]; expiringSoon: InventoryBatch[]; expired: InventoryBatch[] }> {
    const batches = await this.getInventoryBatches(productId);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return {
      valid: batches.filter(batch => !batch.expiry_date || batch.expiry_date > thirtyDaysFromNow),
      expiringSoon: batches.filter(batch => batch.expiry_date && batch.expiry_date <= thirtyDaysFromNow && batch.expiry_date > now),
      expired: batches.filter(batch => batch.expiry_date && batch.expiry_date <= now)
    };
  }

  // === Stock Management ===

  async updateStockLevel(productId: string, quantityChange: number, transactionType: 'purchase' | 'sale' | 'adjustment' | 'waste', referenceId?: string): Promise<void> {
    const { data: stockLevel, error: fetchError } = await this.supabase
      .from('inventory_stock_levels')
      .select('*')
      .eq('product_id', productId)
      .eq('clinic_id', this.config.clinicId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch stock level: ${fetchError.message}`);

    const newStock = Math.max(0, stockLevel.current_stock + quantityChange);
    
    const { error: updateError } = await this.supabase
      .from('inventory_stock_levels')
      .update({
        current_stock: newStock,
        available_stock: newStock - stockLevel.reserved_stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', stockLevel.id);

    if (updateError) throw new Error(`Failed to update stock level: ${updateError.message}`);

    // Record transaction
    await this.recordInventoryTransaction({
      product_id: productId,
      quantity: quantityChange,
      transaction_type: transactionType,
      reference_id: referenceId,
      clinic_id: this.config.clinicId
    });

    // Update stock status
    await this.updateStockStatus(productId);
  }

  async initializeStockLevel(productId: string): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_stock_levels')
      .insert([{
        product_id: productId,
        clinic_id: this.config.clinicId,
        current_stock: 0,
        reserved_stock: 0,
        available_stock: 0,
        stock_status: 'normal'
      }]);

    if (error && !error.message.includes('duplicate key')) {
      throw new Error(`Failed to initialize stock level: ${error.message}`);
    }
  }

  async updateStockStatus(productId: string): Promise<void> {
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('min_stock_level, max_stock_level')
      .eq('id', productId)
      .single();

    if (productError) throw new Error(`Failed to fetch product: ${productError.message}`);

    const { data: stockLevel, error: stockError } = await this.supabase
      .from('inventory_stock_levels')
      .select('*')
      .eq('product_id', productId)
      .eq('clinic_id', this.config.clinicId)
      .single();

    if (stockError) throw new Error(`Failed to fetch stock level: ${stockError.message}`);

    let status: 'normal' | 'low' | 'critical' | 'excess' = 'normal';
    
    if (stockLevel.current_stock <= product.min_stock_level * 0.5) {
      status = 'critical';
    } else if (stockLevel.current_stock <= product.min_stock_level) {
      status = 'low';
    } else if (stockLevel.current_stock >= product.max_stock_level) {
      status = 'excess';
    }

    const { error: updateError } = await this.supabase
      .from('inventory_stock_levels')
      .update({ stock_status: status })
      .eq('id', stockLevel.id);

    if (updateError) throw new Error(`Failed to update stock status: ${updateError.message}`);

    // Create alert if stock is low or critical
    if (status === 'low' || status === 'critical') {
      await this.createInventoryAlert({
        clinic_id: this.config.clinicId,
        product_id: productId,
        alert_type: 'low_stock',
        severity: status === 'critical' ? 'critical' : 'medium',
        message: `Product stock is ${status}: ${stockLevel.current_stock} units remaining`
      });
    }
  }

  async recordInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'transaction_date' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_transactions')
      .insert([transaction]);

    if (error) throw new Error(`Failed to record inventory transaction: ${error.message}`);
  }

  // === Product Usage Tracking ===

  async recordProductUsage(usage: Omit<ProductUsageRecord, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('product_usage_records')
      .insert([usage]);

    if (error) throw new Error(`Failed to record product usage: ${error.message}`);

    // Update stock level
    await this.updateStockLevel(usage.product_id, -usage.quantity_used, 'sale', usage.appointment_id);
  }

  async getProductUsageStats(productId: string, days: number = 90): Promise<ProductUsageStats> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('product_usage_records')
      .select('quantity_used, usage_date')
      .eq('product_id', productId)
      .gte('usage_date', startDate.toISOString())
      .lte('usage_date', endDate.toISOString());

    if (error) throw new Error(`Failed to get product usage stats: ${error.message}`);

    const usage = data || [];
    const totalUsage = usage.reduce((sum, record) => sum + record.quantity_used, 0);
    const dailyUsage = totalUsage / days;

    // Simple trend analysis
    const firstHalf = usage.slice(0, Math.floor(usage.length / 2));
    const secondHalf = usage.slice(Math.floor(usage.length / 2));
    const firstHalfUsage = firstHalf.reduce((sum, record) => sum + record.quantity_used, 0);
    const secondHalfUsage = secondHalf.reduce((sum, record) => sum + record.quantity_used, 0);
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfUsage > firstHalfUsage * 1.1) trend = 'increasing';
    else if (secondHalfUsage < firstHalfUsage * 0.9) trend = 'decreasing';

    return {
      productId,
      productName: '', // Would need to fetch from products table
      monthlyUsage: (totalUsage / days) * 30,
      quarterlyUsage: totalUsage,
      averageDailyUsage: dailyUsage,
      trend,
      forecast: dailyUsage * 30 // Simple 30-day forecast
    };
  }

  // === Alerts and Notifications ===

  async createInventoryAlert(alert: Omit<InventoryAlert, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_alerts')
      .insert([alert]);

    if (error && !error.message.includes('duplicate key')) {
      console.error(`Failed to create inventory alert: ${error.message}`);
    }
  }

  async getInventoryAlerts(filters?: {
    alertType?: string;
    severity?: string;
    isResolved?: boolean;
  }): Promise<InventoryAlert[]> {
    let query = this.supabase
      .from('inventory_alerts')
      .select('*')
      .eq('clinic_id', this.config.clinicId);

    if (filters?.alertType) {
      query = query.eq('alert_type', filters.alertType);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.isResolved !== undefined) {
      query = query.eq('is_resolved', filters.isResolved);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get inventory alerts: ${error.message}`);
    return data || [];
  }

  async checkLowStockAlerts(): Promise<InventoryStockAlert[]> {
    const { data, error } = await this.supabase
      .from('inventory_stock_levels')
      .select(`
        current_stock,
        days_of_stock,
        products!inner(
          id,
          name,
          min_stock_level,
          reorder_point,
          lead_time_days
        )
      `)
      .eq('clinic_id', this.config.clinicId)
      .in('stock_status', ['low', 'critical']);

    if (error) throw new Error(`Failed to check low stock alerts: ${error.message}`);

    return (data || []).map(item => {
      const product = item.products as any;
      const severity = item.days_of_stock < 7 ? 'critical' : item.days_of_stock < 14 ? 'high' : 'medium';
      
      return {
        productId: product.id,
        productName: product.name,
        currentStock: item.current_stock,
        minStockLevel: product.min_stock_level,
        daysOfStock: item.days_of_stock,
        severity,
        recommendedOrderQuantity: product.reorder_point - item.current_stock
      };
    });
  }

  async checkExpiryAlerts(): Promise<InventoryBatch[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await this.supabase
      .from('inventory_batches')
      .select(`
        *,
        products(name, sku)
      `)
      .eq('is_active', true)
      .lte('expiry_date', thirtyDaysFromNow)
      .order('expiry_date', { ascending: true });

    if (error) throw new Error(`Failed to check expiry alerts: ${error.message}`);
    return data || [];
  }

  // === Purchase Order Management ===

  async createPurchaseOrder(orderData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data, error } = await this.supabase
      .from('purchase_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create purchase order: ${error.message}`);
    return data;
  }

  async getPurchaseOrders(filters?: {
    status?: string;
    supplierId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PurchaseOrder[]> {
    let query = this.supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers(name),
        purchase_order_items(
          *,
          products(name, sku)
        )
      `)
      .eq('clinic_id', this.config.clinicId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.supplierId) {
      query = query.eq('supplier_id', filters.supplierId);
    }

    if (filters?.dateFrom) {
      query = query.gte('order_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('order_date', filters.dateTo);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get purchase orders: ${error.message}`);
    return data || [];
  }

  // === Reporting and Analytics ===

  async getInventorySummary(dateFrom?: string, dateTo?: string): Promise<InventorySummary> {
    // Get basic counts
    const { data: products } = await this.supabase
      .from('products')
      .select('id, cost_price, selling_price')
      .eq('clinic_id', this.config.clinicId)
      .eq('is_active', true);

    const { data: stockLevels } = await this.supabase
      .from('inventory_stock_levels')
      .select('current_stock, stock_status')
      .eq('clinic_id', this.config.clinicId);

    // Get usage data
    let usageQuery = this.supabase
      .from('product_usage_records')
      .select('quantity_used, product_id');

    if (dateFrom) usageQuery = usageQuery.gte('usage_date', dateFrom);
    if (dateTo) usageQuery = usageQuery.lte('usage_date', dateTo);

    const { data: usage } = await usageQuery;

    // Calculate summary
    const totalProducts = products?.length || 0;
    const lowStockItems = stockLevels?.filter(s => s.stock_status === 'low').length || 0;
    const criticalStockItems = stockLevels?.filter(s => s.stock_status === 'critical').length || 0;
    
    const totalInventoryValue = products?.reduce((sum, product) => {
      const stock = stockLevels?.find(s => s.product_id === product.id);
      return sum + (product.cost_price * (stock?.current_stock || 0));
    }, 0) || 0;

    const monthlyUsageValue = usage?.reduce((sum, record) => {
      const product = products?.find(p => p.id === record.product_id);
      return sum + (product?.cost_price || 0) * record.quantity_used;
    }, 0) || 0;

    // Get top selling products
    const productUsage = usage?.reduce((acc, record) => {
      const product = products?.find(p => p.id === record.product_id);
      if (!product) return acc;
      
      if (!acc[record.product_id]) {
        acc[record.product_id] = {
          productId: record.product_id,
          productName: product.name || 'Unknown',
          quantityUsed: 0,
          revenue: 0
        };
      }
      
      acc[record.product_id].quantityUsed += record.quantity_used;
      acc[record.product_id].revenue += product.selling_price * record.quantity_used;
      
      return acc;
    }, {} as Record<string, any>);

    const topSellingProducts = Object.values(productUsage || {})
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalProducts,
      lowStockItems,
      criticalStockItems,
      expiringSoonItems: 0, // Would need to calculate from batches
      expiredItems: 0, // Would need to calculate from batches
      totalInventoryValue,
      monthlyUsageValue,
      topSellingProducts: topSellingProducts as any
    };
  }

  async generateInventoryReport(filters?: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    includeUsage?: boolean;
  }): Promise<any> {
    const summary = await this.getInventorySummary(filters?.dateFrom, filters?.dateTo);
    const products = await this.getProducts(filters ? { category: filters.category } : undefined);
    const alerts = await this.getInventoryAlerts({ isResolved: false });

    return {
      summary,
      products: products.map(p => ({
        ...p,
        inventoryValue: (p as any).inventory_stock_levels?.[0]?.current_stock * p.cost_price || 0
      })),
      alerts,
      generatedAt: new Date().toISOString()
    };
  }

  // === Automated Processes ===

  async processDailyInventoryChecks(): Promise<void> {
    try {
      // Check low stock
      const lowStockAlerts = await this.checkLowStockAlerts();
      for (const alert of lowStockAlerts) {
        await this.createInventoryAlert({
          clinic_id: this.config.clinicId,
          product_id: alert.productId,
          alert_type: 'low_stock',
          severity: alert.severity,
          message: `Low stock alert: ${alert.productName} - ${alert.currentStock} units remaining (${alert.daysOfStock} days)`
        });
      }

      // Check expiry
      const expiringBatches = await this.checkExpiryAlerts();
      for (const batch of expiringBatches) {
        const daysUntilExpiry = Math.ceil((batch.expiry_date!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const severity = daysUntilExpiry < 7 ? 'critical' : daysUntilExpiry < 14 ? 'high' : 'medium';
        
        await this.createInventoryAlert({
          clinic_id: this.config.clinicId,
          product_id: batch.product_id,
          alert_type: 'expiring_soon',
          severity,
          message: `Batch expiring soon: ${batch.batch_number} - ${daysUntilExpiry} days remaining`
        });
      }

      console.log(`Processed ${lowStockAlerts.length} low stock alerts and ${expiringBatches.length} expiry alerts`);
    } catch (error) {
      console.error('Error in daily inventory checks:', error);
    }
  }

  async calculateReorderQuantities(): Promise<Array<{ productId: string; recommendedQuantity: number; reason: string }>> {
    const products = await this.getProducts();
    const recommendations: Array<{ productId: string; recommendedQuantity: number; reason: string }> = [];

    for (const product of products) {
      const stockLevel = (product as any).inventory_stock_levels?.[0];
      if (!stockLevel) continue;

      const { data: usage } = await this.supabase
        .from('product_usage_records')
        .select('quantity_used')
        .eq('product_id', product.id)
        .gte('usage_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const monthlyUsage = usage?.reduce((sum, record) => sum + record.quantity_used, 0) || 0;
      const dailyUsage = monthlyUsage / 30;

      if (stockLevel.current_stock <= product.reorder_point) {
        const leadTimeDemand = dailyUsage * product.lead_time_days;
        const safetyStock = product.min_stock_level;
        const recommendedQuantity = leadTimeDemand + safetyStock - stockLevel.current_stock;

        recommendations.push({
          productId: product.id,
          recommendedQuantity: Math.max(0, recommendedQuantity),
          reason: `Current stock ${stockLevel.current_stock} is below reorder point ${product.reorder_point}. Lead time demand: ${leadTimeDemand.toFixed(1)}`
        });
      }
    }

    return recommendations;
  }
}