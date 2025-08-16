// Purchase Order Service - Automated Purchase Order Generation
// Part of Epic 6: Inventory Management - Story 6.2 Task 3
import { createClient } from '@/app/utils/supabase/server';

// Purchase Order Data Types
type SupplierInfo = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  leadTime: number; // dias
  minimumOrder?: number;
  preferredPaymentTerms?: string;
  reliability_score?: number;
  cost_rating?: number;
};

type PurchaseOrderItem = {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_sku?: string;
};

type PurchaseOrder = {
  id: string;
  order_number: string;
  supplier_id: string;
  clinic_id: string;
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'sent'
    | 'received'
    | 'cancelled';
  total_amount: number;
  expected_delivery_date: Date;
  items: PurchaseOrderItem[];
  created_at: Date;
  created_by: string;
};

// EOQ Calculation Input
type EOQInput = {
  annualDemand: number;
  orderingCost: number;
  holdingCost: number;
  unitCost: number;
};

type EOQResult = {
  optimalOrderQuantity: number;
  totalCost: number;
  orderingCostComponent: number;
  holdingCostComponent: number;
  reorderPoint: number;
  timeBetweenOrders: number; // dias
};

export class PurchaseOrderService {
  private async getSupabase() {
    return await createClient();
  }

  // ===============================================================================
  // SUPPLIER MANAGEMENT
  // ===============================================================================

  /**
   * Get preferred suppliers for an item
   */
  async getPreferredSuppliers(itemId: string): Promise<SupplierInfo[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('supplier_items')
      .select(
        `
        supplier_id,
        unit_cost,
        lead_time_days,
        minimum_order_quantity,
        suppliers (
          id,
          name,
          contact_email,
          contact_phone,
          payment_terms,
          reliability_score,
          cost_rating
        )
      `
      )
      .eq('item_id', itemId)
      .order('cost_rating', { ascending: false });

    if (error) {
      throw error;
    }

    return (
      data?.map((item: any) => ({
        id: item.suppliers.id,
        name: item.suppliers.name,
        email: item.suppliers.contact_email,
        phone: item.suppliers.contact_phone,
        leadTime: item.lead_time_days,
        minimumOrder: item.minimum_order_quantity,
        preferredPaymentTerms: item.suppliers.payment_terms,
        reliability_score: item.suppliers.reliability_score,
        cost_rating: item.suppliers.cost_rating,
      })) || []
    );
  }

  /**
   * Select best supplier based on criteria
   */
  async selectOptimalSupplier(
    itemId: string,
    _quantity: number,
    priorityFactors: {
      costWeight: number; // 0-1
      reliabilityWeight: number; // 0-1
      leadTimeWeight: number; // 0-1
    } = { costWeight: 0.5, reliabilityWeight: 0.3, leadTimeWeight: 0.2 }
  ): Promise<SupplierInfo | null> {
    const suppliers = await this.getPreferredSuppliers(itemId);

    if (suppliers.length === 0) {
      return null;
    }

    // Calcular score ponderado para cada supplier
    const scoredSuppliers = suppliers.map((supplier) => {
      // Normalizar métricas (0-1, onde 1 é melhor)
      const costScore = 1 - (supplier.cost_rating || 0) / 10; // Inverte pois menor custo é melhor
      const reliabilityScore = (supplier.reliability_score || 0) / 10;
      const leadTimeScore = 1 - Math.min(supplier.leadTime / 30, 1); // Normaliza para 30 dias máx

      const totalScore =
        costScore * priorityFactors.costWeight +
        reliabilityScore * priorityFactors.reliabilityWeight +
        leadTimeScore * priorityFactors.leadTimeWeight;

      return { ...supplier, score: totalScore };
    });

    // Retornar supplier com maior score
    return scoredSuppliers.reduce((best, current) =>
      current.score > best.score ? current : best
    );
  }

  // ===============================================================================
  // EOQ CALCULATIONS
  // ===============================================================================

  /**
   * Calculate Economic Order Quantity
   */
  calculateEOQ(input: EOQInput): EOQResult {
    const { annualDemand, orderingCost, holdingCost, unitCost } = input;

    // EOQ = √(2 × D × S / H)
    // D = Annual demand, S = Ordering cost, H = Holding cost per unit
    const optimalOrderQuantity = Math.sqrt(
      (2 * annualDemand * orderingCost) / holdingCost
    );

    // Total cost = Ordering cost + Holding cost
    const numberOfOrders = annualDemand / optimalOrderQuantity;
    const orderingCostComponent = numberOfOrders * orderingCost;
    const holdingCostComponent = (optimalOrderQuantity / 2) * holdingCost;
    const totalCost = orderingCostComponent + holdingCostComponent;

    // Reorder point (assumindo demanda constante)
    const dailyDemand = annualDemand / 365;
    const reorderPoint = dailyDemand * 7; // 7 dias de lead time padrão

    // Time between orders
    const timeBetweenOrders = optimalOrderQuantity / dailyDemand;

    return {
      optimalOrderQuantity: Math.round(optimalOrderQuantity),
      totalCost,
      orderingCostComponent,
      holdingCostComponent,
      reorderPoint: Math.round(reorderPoint),
      timeBetweenOrders: Math.round(timeBetweenOrders),
    };
  }

  /**
   * Get historical data for EOQ calculation
   */
  async getEOQParameters(itemId: string, clinicId: string): Promise<EOQInput> {
    const supabase = await this.getSupabase();

    // Obter demanda anual (últimos 12 meses)
    const { data: consumptionData } = await supabase
      .from('inventory_transactions')
      .select('quantity')
      .eq('item_id', itemId)
      .eq('clinic_id', clinicId)
      .eq('transaction_type', 'consumption')
      .gte(
        'created_at',
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      );

    const annualDemand =
      consumptionData?.reduce((sum, tx) => sum + Math.abs(tx.quantity), 0) || 0;

    // Obter dados do item
    const { data: itemData } = await supabase
      .from('inventory_items')
      .select('unit_cost, storage_cost_percentage')
      .eq('id', itemId)
      .single();

    const unitCost = itemData?.unit_cost || 0;
    const storageCostPercentage = itemData?.storage_cost_percentage || 0.25; // 25% padrão

    return {
      annualDemand,
      orderingCost: 50, // Custo fixo padrão por pedido
      holdingCost: unitCost * storageCostPercentage,
      unitCost,
    };
  }

  // ===============================================================================
  // PURCHASE ORDER GENERATION
  // ===============================================================================

  /**
   * Generate automated purchase order
   */
  async generatePurchaseOrder(
    clinicId: string,
    items: Array<{ itemId: string; requiredQuantity: number }>,
    userId: string
  ): Promise<PurchaseOrder> {
    const supabase = await this.getSupabase();

    // Agrupar itens por supplier preferido
    const supplierGroups = new Map<
      string,
      Array<{
        itemId: string;
        itemName: string;
        quantity: number;
        unitPrice: number;
        supplierSku?: string;
      }>
    >();

    for (const item of items) {
      const supplier = await this.selectOptimalSupplier(
        item.itemId,
        item.requiredQuantity
      );
      if (!supplier) {
        continue;
      }

      // Obter dados do item
      const { data: itemData } = await supabase
        .from('inventory_items')
        .select('name, unit_cost')
        .eq('id', item.itemId)
        .single();

      if (!itemData) {
        continue;
      }

      // Aplicar EOQ para otimizar quantidade
      const eoqParams = await this.getEOQParameters(item.itemId, clinicId);
      const eoqResult = this.calculateEOQ(eoqParams);

      // Usar maior entre quantidade necessária e EOQ (para otimização)
      const optimizedQuantity = Math.max(
        item.requiredQuantity,
        eoqResult.optimalOrderQuantity
      );

      if (!supplierGroups.has(supplier.id)) {
        supplierGroups.set(supplier.id, []);
      }

      supplierGroups.get(supplier.id)?.push({
        itemId: item.itemId,
        itemName: itemData.name,
        quantity: optimizedQuantity,
        unitPrice: itemData.unit_cost,
        supplierSku: `SUP-${item.itemId.slice(-6)}`,
      });
    }

    // Criar purchase orders (um por supplier)
    const purchaseOrders: PurchaseOrder[] = [];

    for (const [supplierId, orderItems] of supplierGroups) {
      const orderNumber = await this.generateOrderNumber(clinicId);
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      // Obter lead time do supplier
      const supplierInfo = await this.getPreferredSuppliers(
        orderItems[0].itemId
      );
      const supplier = supplierInfo.find((s) => s.id === supplierId);
      const leadTime = supplier?.leadTime || 7;

      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + leadTime);

      const purchaseOrder: PurchaseOrder = {
        id: `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_number: orderNumber,
        supplier_id: supplierId,
        clinic_id: clinicId,
        status: totalAmount > 5000 ? 'pending_approval' : 'approved', // Auto-approve se < R$ 5000
        total_amount: totalAmount,
        expected_delivery_date: expectedDeliveryDate,
        items: orderItems.map((item) => ({
          item_id: item.itemId,
          item_name: item.itemName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice,
          supplier_sku: item.supplierSku,
        })),
        created_at: new Date(),
        created_by: userId,
      };

      purchaseOrders.push(purchaseOrder);
    }

    return purchaseOrders[0]; // Retornar primeiro PO por simplicidade
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(_clinicId: string): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();

    return `PO-${year}${month}${day}-${random}`;
  }

  // ===============================================================================
  // BULK ORDERING OPTIMIZATION
  // ===============================================================================

  /**
   * Optimize bulk ordering for cost savings
   */
  async optimizeBulkOrder(
    clinicId: string,
    itemIds: string[]
  ): Promise<{
    recommendations: Array<{
      itemId: string;
      currentQuantity: number;
      recommendedQuantity: number;
      costSavings: number;
      reasoning: string;
    }>;
    totalSavings: number;
  }> {
    const recommendations = [];
    let totalSavings = 0;

    for (const itemId of itemIds) {
      const eoqParams = await this.getEOQParameters(itemId, clinicId);
      const eoqResult = this.calculateEOQ(eoqParams);

      // Simular pedido atual vs otimizado
      const currentQuantity = Math.max(eoqParams.annualDemand / 12, 1); // Mensal
      const currentCost = this.calculateOrderCost(currentQuantity, eoqParams);
      const optimizedCost = eoqResult.totalCost;

      const savings = Math.max(0, currentCost - optimizedCost);

      if (savings > 0) {
        recommendations.push({
          itemId,
          currentQuantity,
          recommendedQuantity: eoqResult.optimalOrderQuantity,
          costSavings: savings,
          reasoning: `EOQ optimization reduces total cost from $${currentCost.toFixed(2)} to $${optimizedCost.toFixed(2)}`,
        });

        totalSavings += savings;
      }
    }

    return { recommendations, totalSavings };
  }

  /**
   * Calculate total order cost for given quantity
   */
  private calculateOrderCost(quantity: number, eoqParams: EOQInput): number {
    const numberOfOrders = eoqParams.annualDemand / quantity;
    const orderingCost = numberOfOrders * eoqParams.orderingCost;
    const holdingCost = (quantity / 2) * eoqParams.holdingCost;

    return orderingCost + holdingCost;
  }

  // ===============================================================================
  // PURCHASE ORDER TEMPLATES
  // ===============================================================================

  /**
   * Generate purchase order template
   */
  async generatePOTemplate(
    purchaseOrder: PurchaseOrder,
    templateType: 'standard' | 'medical' | 'urgent' = 'standard'
  ): Promise<{
    html: string;
    subject: string;
    totalItems: number;
  }> {
    const supabase = await this.getSupabase();

    // Obter dados da clínica
    const { data: clinicData } = await supabase
      .from('clinics')
      .select('name, address, phone, email')
      .eq('id', purchaseOrder.clinic_id)
      .single();

    // Obter dados do supplier
    const { data: supplierData } = await supabase
      .from('suppliers')
      .select('name, contact_email, contact_phone')
      .eq('id', purchaseOrder.supplier_id)
      .single();

    const templateConfig = {
      standard: {
        subject: `Purchase Order ${purchaseOrder.order_number}`,
        priority: 'Normal',
        urgencyNote: '',
      },
      medical: {
        subject: `MEDICAL SUPPLIES - Purchase Order ${purchaseOrder.order_number}`,
        priority: 'High',
        urgencyNote: 'Medical supplies required for patient care.',
      },
      urgent: {
        subject: `URGENT - Purchase Order ${purchaseOrder.order_number}`,
        priority: 'Urgent',
        urgencyNote: 'Emergency order - expedited delivery required.',
      },
    };

    const config = templateConfig[templateType];

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <header style="background: #f8f9fa; padding: 20px; border-bottom: 2px solid #007bff;">
          <h1 style="color: #007bff; margin: 0;">Purchase Order</h1>
          <p style="margin: 5px 0; font-size: 18px; font-weight: bold;">${purchaseOrder.order_number}</p>
          ${config.urgencyNote ? `<p style="color: #dc3545; font-weight: bold;">${config.urgencyNote}</p>` : ''}
        </header>
        
        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
            <div>
              <h3>From:</h3>
              <p><strong>${clinicData?.name || 'Clinic'}</strong><br>
              ${clinicData?.address || ''}<br>
              ${clinicData?.phone || ''}<br>
              ${clinicData?.email || ''}</p>
            </div>
            <div>
              <h3>To:</h3>
              <p><strong>${supplierData?.name || 'Supplier'}</strong><br>
              ${supplierData?.contact_email || ''}<br>
              ${supplierData?.contact_phone || ''}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p><strong>Order Date:</strong> ${purchaseOrder.created_at.toLocaleDateString()}</p>
            <p><strong>Expected Delivery:</strong> ${purchaseOrder.expected_delivery_date.toLocaleDateString()}</p>
            <p><strong>Priority:</strong> ${config.priority}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Item</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">SKU</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">Qty</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Unit Price</th>
                <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${purchaseOrder.items
                .map(
                  (item) => `
                <tr>
                  <td style="border: 1px solid #dee2e6; padding: 12px;">${item.item_name}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${item.supplier_sku || '-'}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">R$ ${item.unit_price.toFixed(2)}</td>
                  <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">R$ ${item.total_price.toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="4" style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Total:</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">R$ ${purchaseOrder.total_amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-left: 4px solid #007bff;">
            <h4>Terms & Conditions:</h4>
            <ul>
              <li>Payment terms: Net 30 days</li>
              <li>Delivery address: As specified in clinic information</li>
              <li>All items must meet medical grade standards</li>
              <li>Please confirm receipt and expected delivery date</li>
              ${templateType === 'urgent' ? '<li><strong>URGENT: Expedited delivery required</strong></li>' : ''}
            </ul>
          </div>
        </div>
        
        <footer style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p>This is an automated purchase order generated by NeonPro Inventory Management System</p>
          <p>Order ID: ${purchaseOrder.id}</p>
        </footer>
      </div>
    `;

    return {
      html,
      subject: config.subject,
      totalItems: purchaseOrder.items.length,
    };
  }
}

export const purchaseOrderService = new PurchaseOrderService();
