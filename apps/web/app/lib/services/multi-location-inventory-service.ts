import type {
  CreateInventoryItem,
  CreateInventoryStock,
  CreateStockTransaction,
  CreateStockTransfer,
  InventoryFilters,
  InventoryItem,
  InventoryMovementSummary,
  InventoryStock,
  LocationStockSummary,
  StockTransaction,
  StockTransactionFilters,
  StockTransfer,
  StockTransferFilters,
  UpdateInventoryItem,
  UpdateInventoryStock,
  UpdateStockTransfer,
} from '@/app/lib/types/inventory';
import { createClient } from '@/app/utils/supabase/client';

export class MultiLocationInventoryService {
  private readonly supabase = createClient();

  // ===== INVENTORY ITEMS =====

  async getInventoryItems(
    filters: InventoryFilters = {}
  ): Promise<InventoryItem[]> {
    let query = this.supabase.from('inventory_items').select('*').order('name');

    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.active_only !== false) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  }

  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createInventoryItem(item: CreateInventoryItem): Promise<InventoryItem> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateInventoryItem(item: UpdateInventoryItem): Promise<InventoryItem> {
    const { id, ...updates } = item;
    const { data, error } = await this.supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ===== INVENTORY STOCK =====

  async getInventoryStock(
    filters: InventoryFilters = {}
  ): Promise<InventoryStock[]> {
    let query = this.supabase
      .from('inventory_stock')
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name, description)
      `
      )
      .order('updated_at', { ascending: false });

    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }

    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id);
    }

    if (filters.low_stock) {
      query = query.lt(
        'available_quantity',
        'inventory_items.minimum_stock_alert'
      );
    }

    if (filters.expiring_soon) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      query = query.lte('expiry_date', nextMonth.toISOString().split('T')[0]);
    }

    if (filters.batch_number) {
      query = query.eq('batch_number', filters.batch_number);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  }

  async getStockByLocation(
    clinic_id: string,
    room_id?: string
  ): Promise<InventoryStock[]> {
    return this.getInventoryStock({ clinic_id, room_id });
  }

  async updateStock(stock: UpdateInventoryStock): Promise<InventoryStock> {
    const { id, ...updates } = stock;
    const { data, error } = await this.supabase
      .from('inventory_stock')
      .update({
        ...updates,
        last_counted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name, description)
      `
      )
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createOrUpdateStock(
    stock: CreateInventoryStock
  ): Promise<InventoryStock> {
    const { data, error } = await this.supabase
      .from('inventory_stock')
      .upsert(stock)
      .select(
        `
        *,
        inventory_item:inventory_items(*),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name, description)
      `
      )
      .single();

    if (error) {
      throw error;
    }
    return data;
  } // ===== STOCK TRANSFERS =====

  async getStockTransfers(
    filters: StockTransferFilters = {}
  ): Promise<StockTransfer[]> {
    let query = this.supabase
      .from('stock_transfers')
      .select(
        `
        *,
        inventory_item:inventory_items(id, name, sku, category),
        from_clinic:from_clinic_id(id, clinic_name, clinic_code),
        from_room:from_room_id(id, name),
        to_clinic:to_clinic_id(id, clinic_name, clinic_code),
        to_room:to_room_id(id, name),
        requester:requested_by(id, full_name)
      `
      )
      .order('created_at', { ascending: false });

    if (filters.clinic_id) {
      query = query.or(
        `from_clinic_id.eq.${filters.clinic_id},to_clinic_id.eq.${filters.clinic_id}`
      );
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.transfer_type) {
      query = query.eq('transfer_type', filters.transfer_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  }

  async createStockTransfer(
    transfer: CreateStockTransfer
  ): Promise<StockTransfer> {
    const { data, error } = await this.supabase
      .from('stock_transfers')
      .insert({
        ...transfer,
        requested_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        inventory_item:inventory_items(id, name, sku, category),
        from_clinic:from_clinic_id(id, clinic_name, clinic_code),
        from_room:from_room_id(id, name),
        to_clinic:to_clinic_id(id, clinic_name, clinic_code),
        to_room:to_room_id(id, name)
      `
      )
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateStockTransfer(
    transfer: UpdateStockTransfer
  ): Promise<StockTransfer> {
    const { id, ...updates } = transfer;

    // Add timestamps based on status changes
    if (updates.status === 'approved' && !updates.approved_at) {
      updates.approved_at = new Date().toISOString();
    }
    if (updates.status === 'in_transit' && !updates.sent_at) {
      updates.sent_at = new Date().toISOString();
    }
    if (updates.status === 'completed' && !updates.received_at) {
      updates.received_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('stock_transfers')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        inventory_item:inventory_items(id, name, sku, category),
        from_clinic:from_clinic_id(id, clinic_name, clinic_code),
        from_room:from_room_id(id, name),
        to_clinic:to_clinic_id(id, clinic_name, clinic_code),
        to_room:to_room_id(id, name)
      `
      )
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // ===== STOCK TRANSACTIONS =====

  async getStockTransactions(
    filters: StockTransactionFilters = {}
  ): Promise<StockTransaction[]> {
    let query = this.supabase
      .from('stock_transactions')
      .select(
        `
        *,
        inventory_item:inventory_items(id, name, sku, category),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name),
        performer:performed_by(id, full_name)
      `
      )
      .order('created_at', { ascending: false });

    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }

    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id);
    }

    if (filters.transaction_type) {
      query = query.eq('transaction_type', filters.transaction_type);
    }

    if (filters.inventory_item_id) {
      query = query.eq('inventory_item_id', filters.inventory_item_id);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  }

  async createStockTransaction(
    transaction: CreateStockTransaction
  ): Promise<StockTransaction> {
    const { data, error } = await this.supabase
      .from('stock_transactions')
      .insert(transaction)
      .select(
        `
        *,
        inventory_item:inventory_items(id, name, sku, category),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name)
      `
      )
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // ===== DASHBOARD & ANALYTICS =====

  async getLocationStockSummary(
    clinic_id?: string
  ): Promise<LocationStockSummary[]> {
    let query = this.supabase.rpc('get_location_stock_summary');

    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  }

  async getInventoryMovementSummary(
    clinic_id?: string,
    days = 30
  ): Promise<InventoryMovementSummary[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await this.supabase.rpc(
      'get_inventory_movement_summary',
      {
        clinic_filter: clinic_id,
        from_date: fromDate.toISOString(),
        to_date: new Date().toISOString(),
      }
    );

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getLowStockAlerts(clinic_id?: string): Promise<InventoryStock[]> {
    return this.getInventoryStock({
      clinic_id,
      low_stock: true,
    });
  }

  async getExpiringItems(
    clinic_id?: string,
    _days = 30
  ): Promise<InventoryStock[]> {
    return this.getInventoryStock({
      clinic_id,
      expiring_soon: true,
    });
  }

  // ===== BULK OPERATIONS =====

  async bulkUpdateStock(
    updates: UpdateInventoryStock[]
  ): Promise<InventoryStock[]> {
    const { data, error } = await this.supabase.from('inventory_stock').upsert(
      updates.map((update) => ({
        ...update,
        last_counted_at: new Date().toISOString(),
      }))
    ).select(`
        *,
        inventory_item:inventory_items(*),
        clinic:clinics(id, clinic_name, clinic_code),
        room:rooms(id, name, description)
      `);

    if (error) {
      throw error;
    }
    return data || [];
  }

  async transferStock(
    inventory_item_id: string,
    from_clinic_id: string,
    to_clinic_id: string,
    quantity: number,
    from_room_id?: string,
    to_room_id?: string,
    notes?: string
  ): Promise<StockTransfer> {
    const transfer: CreateStockTransfer = {
      inventory_item_id,
      from_clinic_id,
      to_clinic_id,
      from_room_id,
      to_room_id,
      quantity,
      transfer_type:
        from_clinic_id === to_clinic_id ? 'internal' : 'inter_clinic',
      notes,
      requested_by: (await this.supabase.auth.getUser()).data.user?.id || '',
    };

    return this.createStockTransfer(transfer);
  }
}
