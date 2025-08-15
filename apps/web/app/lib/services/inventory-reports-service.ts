import type {
  ExpiringItemsReportData,
  ExpiringItemsSummary,
  LocationPerformanceData,
  LocationPerformanceSummary,
  MovementType,
  ReportDashboardStats,
  ReportDefinition,
  ReportFilters,
  ReportParameters,
  ReportResult,
  StockMovementReportData,
  StockMovementSummary,
  StockValuationReportData,
  StockValuationSummary,
  TransferReportData,
  TransferReportSummary,
} from '@/app/lib/types/inventory-reports';
import { createClient } from '@/app/utils/supabase/client';

class InventoryReportsService {
  private readonly supabase = createClient();

  // =============================================================================
  // STOCK MOVEMENT REPORTS
  // =============================================================================

  async generateStockMovementReport(
    filters: ReportFilters
  ): Promise<ReportResult<'stock_movement'>> {
    const startTime = Date.now();

    // Build query for stock movements
    let query = this.supabase.from('stock_transactions').select(`
        id,
        item_id,
        inventory_items!inner(name, sku, category),
        transaction_type,
        quantity_change,
        unit_cost,
        clinic_id,
        room_id,
        clinics!inner(name),
        rooms(name),
        created_at,
        user_id,
        reference_document,
        notes,
        batch_number
      `);

    // Apply filters
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }
    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id);
    }
    if (filters.category) {
      query = query.eq('inventory_items.category', filters.category);
    }
    if (filters.item_id) {
      query = query.eq('item_id', filters.item_id);
    }
    if (filters.movement_type) {
      query = query.eq('transaction_type', filters.movement_type);
    }

    query = query.order('created_at', { ascending: false });

    const { data: movements, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch stock movements: ${error.message}`);
    }

    // Transform data to report format
    const reportData: StockMovementReportData[] =
      movements?.map((movement: any) => ({
        movement_id: movement.id,
        item_id: movement.item_id,
        item_name: movement.inventory_items.name,
        item_sku: movement.inventory_items.sku,
        category: movement.inventory_items.category,
        movement_type: movement.transaction_type as MovementType,
        quantity: Math.abs(movement.quantity_change),
        unit_cost: movement.unit_cost || 0,
        total_cost:
          Math.abs(movement.quantity_change) * (movement.unit_cost || 0),
        clinic_name: movement.clinics.name,
        room_name: movement.rooms?.name || 'N/A',
        movement_date: movement.created_at,
        reference_document: movement.reference_document,
        notes: movement.notes,
        batch_number: movement.batch_number,
      })) || [];

    // Calculate summary
    const summary = this.calculateStockMovementSummary(reportData);

    return {
      data: reportData,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        parameters: { type: 'stock_movement', filters, format: 'json' },
        total_records: reportData.length,
        execution_time: Date.now() - startTime,
      },
    };
  }

  private calculateStockMovementSummary(
    data: StockMovementReportData[]
  ): StockMovementSummary {
    const summary: StockMovementSummary = {
      total_movements: data.length,
      total_in: 0,
      total_out: 0,
      total_value_in: 0,
      total_value_out: 0,
      net_movement: 0,
      net_value: 0,
      by_type: {} as any,
      by_category: {} as any,
      by_location: {} as any,
    };

    data.forEach((movement) => {
      const isInbound = ['in', 'return', 'adjustment'].includes(
        movement.movement_type
      );

      if (isInbound) {
        summary.total_in += movement.quantity;
        summary.total_value_in += movement.total_cost;
      } else {
        summary.total_out += movement.quantity;
        summary.total_value_out += movement.total_cost;
      }

      // By type
      if (!summary.by_type[movement.movement_type]) {
        summary.by_type[movement.movement_type] = {
          count: 0,
          quantity: 0,
          value: 0,
        };
      }
      summary.by_type[movement.movement_type].count++;
      summary.by_type[movement.movement_type].quantity += movement.quantity;
      summary.by_type[movement.movement_type].value += movement.total_cost;

      // By category
      if (!summary.by_category[movement.category]) {
        summary.by_category[movement.category] = {
          count: 0,
          quantity: 0,
          value: 0,
        };
      }
      summary.by_category[movement.category].count++;
      summary.by_category[movement.category].quantity += movement.quantity;
      summary.by_category[movement.category].value += movement.total_cost;

      // By location
      const locationKey = `${movement.clinic_name} - ${movement.room_name}`;
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = { count: 0, quantity: 0, value: 0 };
      }
      summary.by_location[locationKey].count++;
      summary.by_location[locationKey].quantity += movement.quantity;
      summary.by_location[locationKey].value += movement.total_cost;
    });

    summary.net_movement = summary.total_in - summary.total_out;
    summary.net_value = summary.total_value_in - summary.total_value_out;

    return summary;
  }

  // =============================================================================
  // STOCK VALUATION REPORTS
  // =============================================================================

  async generateStockValuationReport(
    filters: ReportFilters
  ): Promise<ReportResult<'stock_valuation'>> {
    const startTime = Date.now();

    let query = this.supabase.from('inventory_stock').select(`
        item_id,
        inventory_items!inner(name, sku, category, minimum_quantity),
        clinic_id,
        room_id,
        clinics!inner(name),
        rooms(name),
        current_quantity,
        cost_per_unit,
        last_updated
      `);

    // Apply filters
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }
    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id);
    }
    if (filters.category) {
      query = query.eq('inventory_items.category', filters.category);
    }
    if (filters.item_id) {
      query = query.eq('item_id', filters.item_id);
    }
    if (!filters.include_zero_stock) {
      query = query.gt('current_quantity', 0);
    }

    const { data: stockData, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch stock valuation data: ${error.message}`);
    }

    // Transform data to report format
    const reportData: StockValuationReportData[] =
      stockData?.map((stock: any) => {
        const daysSinceMovement = stock.last_updated
          ? Math.floor(
              (Date.now() - new Date(stock.last_updated).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        const minimumQuantity = stock.inventory_items.minimum_quantity || 0;
        let stockStatus: 'adequate' | 'low' | 'critical' | 'overstock' =
          'adequate';

        if (stock.current_quantity === 0) {
          stockStatus = 'critical';
        } else if (stock.current_quantity <= minimumQuantity * 0.5) {
          stockStatus = 'critical';
        } else if (stock.current_quantity <= minimumQuantity) {
          stockStatus = 'low';
        } else if (stock.current_quantity > minimumQuantity * 3) {
          stockStatus = 'overstock';
        }

        return {
          item_id: stock.item_id,
          item_name: stock.inventory_items.name,
          item_sku: stock.inventory_items.sku,
          category: stock.inventory_items.category,
          clinic_name: stock.clinics.name,
          room_name: stock.rooms?.name || 'N/A',
          current_quantity: stock.current_quantity,
          unit_cost: stock.cost_per_unit || 0,
          total_value: stock.current_quantity * (stock.cost_per_unit || 0),
          last_movement_date: stock.last_updated,
          days_since_movement: daysSinceMovement,
          stock_status: stockStatus,
        };
      }) || [];

    // Calculate summary
    const summary = this.calculateStockValuationSummary(reportData);

    return {
      data: reportData,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        parameters: { type: 'stock_valuation', filters, format: 'json' },
        total_records: reportData.length,
        execution_time: Date.now() - startTime,
      },
    };
  }

  private calculateStockValuationSummary(
    data: StockValuationReportData[]
  ): StockValuationSummary {
    const summary: StockValuationSummary = {
      total_items: data.length,
      total_quantity: 0,
      total_value: 0,
      average_unit_cost: 0,
      by_category: {} as any,
      by_location: {} as any,
      by_status: {} as any,
    };

    let totalCostSum = 0;
    let itemsWithCost = 0;

    data.forEach((item) => {
      summary.total_quantity += item.current_quantity;
      summary.total_value += item.total_value;

      if (item.unit_cost > 0) {
        totalCostSum += item.unit_cost;
        itemsWithCost++;
      }

      // By category
      if (!summary.by_category[item.category]) {
        summary.by_category[item.category] = {
          items: 0,
          quantity: 0,
          value: 0,
          percentage: 0,
        };
      }
      summary.by_category[item.category].items++;
      summary.by_category[item.category].quantity += item.current_quantity;
      summary.by_category[item.category].value += item.total_value;

      // By location
      const locationKey = `${item.clinic_name} - ${item.room_name}`;
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = {
          items: 0,
          quantity: 0,
          value: 0,
          percentage: 0,
        };
      }
      summary.by_location[locationKey].items++;
      summary.by_location[locationKey].quantity += item.current_quantity;
      summary.by_location[locationKey].value += item.total_value;

      // By status
      if (!summary.by_status[item.stock_status]) {
        summary.by_status[item.stock_status] = {
          items: 0,
          quantity: 0,
          value: 0,
          percentage: 0,
        };
      }
      summary.by_status[item.stock_status].items++;
      summary.by_status[item.stock_status].quantity += item.current_quantity;
      summary.by_status[item.stock_status].value += item.total_value;
    });

    summary.average_unit_cost =
      itemsWithCost > 0 ? totalCostSum / itemsWithCost : 0;

    // Calculate percentages
    Object.values(summary.by_category).forEach((cat) => {
      cat.percentage =
        summary.total_value > 0 ? (cat.value / summary.total_value) * 100 : 0;
    });
    Object.values(summary.by_location).forEach((loc) => {
      loc.percentage =
        summary.total_value > 0 ? (loc.value / summary.total_value) * 100 : 0;
    });
    Object.values(summary.by_status).forEach((status) => {
      status.percentage =
        summary.total_value > 0
          ? (status.value / summary.total_value) * 100
          : 0;
    });

    return summary;
  }

  // =============================================================================
  // EXPIRING ITEMS REPORTS
  // =============================================================================

  async generateExpiringItemsReport(
    filters: ReportFilters
  ): Promise<ReportResult<'expiring_items'>> {
    const startTime = Date.now();

    // For this example, we'll assume expiry dates are stored in inventory_stock
    // In a real implementation, you might have a separate batch tracking system
    let query = this.supabase
      .from('inventory_stock')
      .select(`
        item_id,
        inventory_items!inner(name, sku, category),
        clinic_id,
        room_id,
        clinics!inner(name),
        rooms(name),
        current_quantity,
        cost_per_unit,
        expiry_date,
        batch_number
      `)
      .not('expiry_date', 'is', null)
      .gt('current_quantity', 0);

    // Apply filters
    if (filters.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }
    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id);
    }
    if (filters.category) {
      query = query.eq('inventory_items.category', filters.category);
    }

    // Filter for items expiring within next 90 days
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    query = query.lte('expiry_date', futureDate.toISOString());

    const { data: expiringData, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch expiring items: ${error.message}`);
    }

    // Transform data to report format
    const reportData: ExpiringItemsReportData[] =
      expiringData?.map((item: any) => {
        const expiryDate = new Date(item.expiry_date);
        const today = new Date();
        const daysToExpiry = Math.ceil(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        let urgencyLevel: 'immediate' | 'urgent' | 'warning' | 'watch' =
          'watch';
        let suggestedAction:
          | 'use_immediately'
          | 'transfer'
          | 'discount'
          | 'dispose' = 'dispose';

        if (daysToExpiry <= 0) {
          urgencyLevel = 'immediate';
          suggestedAction = 'dispose';
        } else if (daysToExpiry <= 7) {
          urgencyLevel = 'urgent';
          suggestedAction = 'use_immediately';
        } else if (daysToExpiry <= 30) {
          urgencyLevel = 'warning';
          suggestedAction = 'discount';
        } else {
          urgencyLevel = 'watch';
          suggestedAction = 'transfer';
        }

        return {
          item_id: item.item_id,
          item_name: item.inventory_items.name,
          item_sku: item.inventory_items.sku,
          category: item.inventory_items.category,
          clinic_name: item.clinics.name,
          room_name: item.rooms?.name || 'N/A',
          batch_number: item.batch_number || 'N/A',
          expiry_date: item.expiry_date,
          days_to_expiry: daysToExpiry,
          current_quantity: item.current_quantity,
          unit_cost: item.cost_per_unit || 0,
          total_value: item.current_quantity * (item.cost_per_unit || 0),
          urgency_level: urgencyLevel,
          suggested_action: suggestedAction,
        };
      }) || [];

    // Sort by urgency and days to expiry
    reportData.sort((a, b) => {
      const urgencyOrder = { immediate: 0, urgent: 1, warning: 2, watch: 3 };
      const urgencyDiff =
        urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level];
      if (urgencyDiff !== 0) {
        return urgencyDiff;
      }
      return a.days_to_expiry - b.days_to_expiry;
    });

    // Calculate summary
    const summary = this.calculateExpiringItemsSummary(reportData);

    return {
      data: reportData,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        parameters: { type: 'expiring_items', filters, format: 'json' },
        total_records: reportData.length,
        execution_time: Date.now() - startTime,
      },
    };
  }

  private calculateExpiringItemsSummary(
    data: ExpiringItemsReportData[]
  ): ExpiringItemsSummary {
    const summary: ExpiringItemsSummary = {
      total_expiring_items: data.length,
      total_expiring_value: 0,
      by_urgency: {} as any,
      by_category: {} as any,
      by_location: {} as any,
      upcoming_expirations_30_days: 0,
      upcoming_expirations_60_days: 0,
      upcoming_expirations_90_days: 0,
    };

    data.forEach((item) => {
      summary.total_expiring_value += item.total_value;

      // Count by time periods
      if (item.days_to_expiry <= 30) {
        summary.upcoming_expirations_30_days++;
      }
      if (item.days_to_expiry <= 60) {
        summary.upcoming_expirations_60_days++;
      }
      if (item.days_to_expiry <= 90) {
        summary.upcoming_expirations_90_days++;
      }

      // By urgency
      if (!summary.by_urgency[item.urgency_level]) {
        summary.by_urgency[item.urgency_level] = {
          items: 0,
          quantity: 0,
          value: 0,
        };
      }
      summary.by_urgency[item.urgency_level].items++;
      summary.by_urgency[item.urgency_level].quantity += item.current_quantity;
      summary.by_urgency[item.urgency_level].value += item.total_value;

      // By category
      if (!summary.by_category[item.category]) {
        summary.by_category[item.category] = {
          items: 0,
          quantity: 0,
          value: 0,
        };
      }
      summary.by_category[item.category].items++;
      summary.by_category[item.category].quantity += item.current_quantity;
      summary.by_category[item.category].value += item.total_value;

      // By location
      const locationKey = `${item.clinic_name} - ${item.room_name}`;
      if (!summary.by_location[locationKey]) {
        summary.by_location[locationKey] = { items: 0, quantity: 0, value: 0 };
      }
      summary.by_location[locationKey].items++;
      summary.by_location[locationKey].quantity += item.current_quantity;
      summary.by_location[locationKey].value += item.total_value;
    });

    return summary;
  }

  // =============================================================================
  // TRANSFER REPORTS
  // =============================================================================

  async generateTransferReport(
    filters: ReportFilters
  ): Promise<ReportResult<'transfers'>> {
    const startTime = Date.now();

    let query = this.supabase.from('stock_transfers').select(`
        id,
        item_id,
        inventory_items!inner(name, sku, category),
        from_clinic_id,
        to_clinic_id,
        from_room_id,
        to_room_id,
        from_clinics:clinics!from_clinic_id(name),
        to_clinics:clinics!to_clinic_id(name),
        from_rooms:rooms!from_room_id(name),
        to_rooms:rooms!to_room_id(name),
        quantity,
        unit_cost,
        status,
        reason,
        created_at,
        completed_at,
        notes
      `);

    // Apply filters
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.clinic_id) {
      query = query.or(
        `from_clinic_id.eq.${filters.clinic_id},to_clinic_id.eq.${filters.clinic_id}`
      );
    }
    if (filters.category) {
      query = query.eq('inventory_items.category', filters.category);
    }

    query = query.order('created_at', { ascending: false });

    const { data: transfers, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch transfer data: ${error.message}`);
    }

    // Transform data to report format
    const reportData: TransferReportData[] =
      transfers?.map((transfer: any) => ({
        transfer_id: transfer.id,
        item_id: transfer.item_id,
        item_name: transfer.inventory_items.name,
        item_sku: transfer.inventory_items.sku,
        category: transfer.inventory_items.category,
        from_clinic_name: transfer.from_clinics.name,
        from_room_name: transfer.from_rooms?.name || 'N/A',
        to_clinic_name: transfer.to_clinics.name,
        to_room_name: transfer.to_rooms?.name || 'N/A',
        quantity: transfer.quantity,
        unit_cost: transfer.unit_cost || 0,
        total_value: transfer.quantity * (transfer.unit_cost || 0),
        transfer_date: transfer.created_at,
        status: transfer.status,
        reason: transfer.reason,
        notes: transfer.notes,
      })) || [];

    // Calculate summary
    const summary = this.calculateTransferSummary(reportData);

    return {
      data: reportData,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        parameters: { type: 'transfers', filters, format: 'json' },
        total_records: reportData.length,
        execution_time: Date.now() - startTime,
      },
    };
  }

  private calculateTransferSummary(
    data: TransferReportData[]
  ): TransferReportSummary {
    const summary: TransferReportSummary = {
      total_transfers: data.length,
      completed_transfers: 0,
      pending_transfers: 0,
      total_value_transferred: 0,
      average_transfer_value: 0,
      by_status: {} as any,
      by_route: {} as any,
      by_category: {} as any,
      most_transferred_items: [],
    };

    const itemCounts: Record<
      string,
      { name: string; count: number; total_quantity: number }
    > = {};

    data.forEach((transfer) => {
      summary.total_value_transferred += transfer.total_value;

      if (transfer.status === 'completed') {
        summary.completed_transfers++;
      } else if (transfer.status === 'pending') {
        summary.pending_transfers++;
      }

      // By status
      if (!summary.by_status[transfer.status]) {
        summary.by_status[transfer.status] = { count: 0, value: 0 };
      }
      summary.by_status[transfer.status].count++;
      summary.by_status[transfer.status].value += transfer.total_value;

      // By route
      const route = `${transfer.from_clinic_name} → ${transfer.to_clinic_name}`;
      if (!summary.by_route[route]) {
        summary.by_route[route] = { count: 0, value: 0, avg_time: 0 };
      }
      summary.by_route[route].count++;
      summary.by_route[route].value += transfer.total_value;

      // By category
      if (!summary.by_category[transfer.category]) {
        summary.by_category[transfer.category] = { count: 0, value: 0 };
      }
      summary.by_category[transfer.category].count++;
      summary.by_category[transfer.category].value += transfer.total_value;

      // Track item counts
      if (!itemCounts[transfer.item_name]) {
        itemCounts[transfer.item_name] = {
          name: transfer.item_name,
          count: 0,
          total_quantity: 0,
        };
      }
      itemCounts[transfer.item_name].count++;
      itemCounts[transfer.item_name].total_quantity += transfer.quantity;
    });

    summary.average_transfer_value =
      summary.total_transfers > 0
        ? summary.total_value_transferred / summary.total_transfers
        : 0;

    // Get most transferred items
    summary.most_transferred_items = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return summary;
  }

  // =============================================================================
  // LOCATION PERFORMANCE REPORTS
  // =============================================================================

  async generateLocationPerformanceReport(
    filters: ReportFilters
  ): Promise<ReportResult<'location_performance'>> {
    const startTime = Date.now();

    // Get all locations
    let locationsQuery = this.supabase.from('clinics').select('id, name');

    if (filters.clinic_id) {
      locationsQuery = locationsQuery.eq('id', filters.clinic_id);
    }

    const { data: clinics, error: clinicsError } = await locationsQuery;

    if (clinicsError) {
      throw new Error(`Failed to fetch clinics: ${clinicsError.message}`);
    }

    const reportData: LocationPerformanceData[] = [];

    // Calculate performance for each clinic
    for (const clinic of clinics || []) {
      const performance = await this.calculateLocationPerformance(
        clinic.id,
        filters
      );
      reportData.push({
        clinic_id: clinic.id,
        clinic_name: clinic.name,
        ...performance,
      });
    }

    // Calculate summary
    const summary = this.calculateLocationPerformanceSummary(reportData);

    return {
      data: reportData,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        parameters: { type: 'location_performance', filters, format: 'json' },
        total_records: reportData.length,
        execution_time: Date.now() - startTime,
      },
    };
  }

  private async calculateLocationPerformance(
    clinicId: string,
    filters: ReportFilters
  ) {
    // Get stock data for clinic
    const { data: stockData } = await this.supabase
      .from('inventory_stock')
      .select(
        'current_quantity, cost_per_unit, inventory_items!inner(minimum_quantity)'
      )
      .eq('clinic_id', clinicId);

    // Get movement data for clinic
    let movementQuery = this.supabase
      .from('stock_transactions')
      .select('transaction_type, quantity_change, unit_cost, created_at')
      .eq('clinic_id', clinicId);

    if (filters.start_date) {
      movementQuery = movementQuery.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      movementQuery = movementQuery.lte('created_at', filters.end_date);
    }

    const { data: movements } = await movementQuery;

    // Get transfer data
    const { data: transfersOut } = await this.supabase
      .from('stock_transfers')
      .select('id')
      .eq('from_clinic_id', clinicId);

    const { data: transfersIn } = await this.supabase
      .from('stock_transfers')
      .select('id')
      .eq('to_clinic_id', clinicId);

    // Calculate metrics
    const totalItems = stockData?.length || 0;
    const totalValue =
      stockData?.reduce(
        (sum, item) => sum + item.current_quantity * (item.cost_per_unit || 0),
        0
      ) || 0;

    const totalMovements = movements?.length || 0;
    const movementsIn =
      movements?.filter(
        (m) =>
          ['in', 'return', 'adjustment'].includes(m.transaction_type) &&
          m.quantity_change > 0
      ).length || 0;
    const movementsOut =
      movements?.filter(
        (m) =>
          ['out', 'transfer', 'waste'].includes(m.transaction_type) &&
          m.quantity_change < 0
      ).length || 0;

    const valueIn =
      movements
        ?.filter((m) => m.quantity_change > 0)
        .reduce(
          (sum, m) => sum + Math.abs(m.quantity_change) * (m.unit_cost || 0),
          0
        ) || 0;
    const valueOut =
      movements
        ?.filter((m) => m.quantity_change < 0)
        .reduce(
          (sum, m) => sum + Math.abs(m.quantity_change) * (m.unit_cost || 0),
          0
        ) || 0;

    const lowStockItems =
      stockData?.filter(
        (item) =>
          item.current_quantity <= (item.inventory_items.minimum_quantity || 0)
      ).length || 0;

    // Calculate performance metrics
    const turnoverRate = totalValue > 0 ? (valueOut / totalValue) * 100 : 0;
    const stockAccuracy =
      totalItems > 0 ? ((totalItems - lowStockItems) / totalItems) * 100 : 100;
    const transferRequests =
      (transfersOut?.length || 0) + (transfersIn?.length || 0);
    const utilizationRate =
      totalItems > 0 ? (movementsOut / totalItems) * 100 : 0;

    // Calculate composite performance score
    const performanceScore = Math.min(
      100,
      turnoverRate * 0.3 +
        stockAccuracy * 0.3 +
        utilizationRate * 0.2 +
        Math.min(100, (totalMovements / Math.max(1, totalItems)) * 20) * 0.2
    );

    return {
      total_items: totalItems,
      total_value: totalValue,
      total_movements: totalMovements,
      movements_in: movementsIn,
      movements_out: movementsOut,
      value_in: valueIn,
      value_out: valueOut,
      turnover_rate: turnoverRate,
      stock_accuracy: stockAccuracy,
      low_stock_items: lowStockItems,
      expiring_items: 0, // Would need separate query
      transfer_requests: transferRequests,
      utilization_rate: utilizationRate,
      performance_score: performanceScore,
    };
  }

  private calculateLocationPerformanceSummary(
    data: LocationPerformanceData[]
  ): LocationPerformanceSummary {
    if (data.length === 0) {
      return {
        total_locations: 0,
        average_performance_score: 0,
        best_performing_location: '',
        worst_performing_location: '',
        total_system_value: 0,
        total_system_movements: 0,
        average_turnover_rate: 0,
        locations_needing_attention: 0,
      };
    }

    const bestLocation = data.reduce((best, location) =>
      location.performance_score > best.performance_score ? location : best
    );
    const worstLocation = data.reduce((worst, location) =>
      location.performance_score < worst.performance_score ? location : worst
    );

    return {
      total_locations: data.length,
      average_performance_score:
        data.reduce((sum, loc) => sum + loc.performance_score, 0) / data.length,
      best_performing_location: bestLocation.clinic_name,
      worst_performing_location: worstLocation.clinic_name,
      total_system_value: data.reduce((sum, loc) => sum + loc.total_value, 0),
      total_system_movements: data.reduce(
        (sum, loc) => sum + loc.total_movements,
        0
      ),
      average_turnover_rate:
        data.reduce((sum, loc) => sum + loc.turnover_rate, 0) / data.length,
      locations_needing_attention: data.filter(
        (loc) => loc.performance_score < 70
      ).length,
    };
  }

  // =============================================================================
  // UNIFIED REPORT GENERATION
  // =============================================================================

  async generateReport(parameters: ReportParameters): Promise<any> {
    switch (parameters.type) {
      case 'stock_movement':
        return this.generateStockMovementReport(parameters.filters);
      case 'stock_valuation':
        return this.generateStockValuationReport(parameters.filters);
      case 'expiring_items':
        return this.generateExpiringItemsReport(parameters.filters);
      case 'transfers':
        return this.generateTransferReport(parameters.filters);
      case 'location_performance':
        return this.generateLocationPerformanceReport(parameters.filters);
      case 'low_stock': {
        // Low stock is a subset of stock valuation
        const result = await this.generateStockValuationReport(
          parameters.filters
        );
        result.data = result.data.filter(
          (item) =>
            item.stock_status === 'low' || item.stock_status === 'critical'
        );
        return result;
      }
      default:
        throw new Error(`Unsupported report type: ${parameters.type}`);
    }
  }

  // =============================================================================
  // REPORT MANAGEMENT
  // =============================================================================

  async saveReportDefinition(
    definition: Omit<ReportDefinition, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ReportDefinition> {
    const { data, error } = await this.supabase
      .from('report_definitions')
      .insert([
        {
          ...definition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save report definition: ${error.message}`);
    }

    return data;
  }

  async getReportDefinitions(filters?: {
    created_by?: string;
    is_active?: boolean;
  }): Promise<ReportDefinition[]> {
    let query = this.supabase
      .from('report_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch report definitions: ${error.message}`);
    }

    return data || [];
  }

  async getDashboardStats(): Promise<ReportDashboardStats> {
    // This would typically query report execution history
    // For now, return mock data
    return {
      total_reports_generated: 150,
      scheduled_reports: 12,
      active_executions: 2,
      failed_executions_today: 0,
      storage_used: 2.3, // GB
      most_generated_type: 'stock_valuation',
      average_generation_time: 3.2, // seconds
    };
  }
}

export const inventoryReportsService = new InventoryReportsService();
