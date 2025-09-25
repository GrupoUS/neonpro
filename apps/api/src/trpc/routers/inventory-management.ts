/**
 * Inventory Management tRPC Router
 * Complete inventory management for aesthetic clinics with Brazilian regulatory compliance
 */

import { InventoryManagementService } from '@neonpro/core-services'
import { z } from 'zod'
import { router } from '../trpc'

// Input schemas
const ProductInput = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  unitOfMeasure: z.enum(['un', 'ml', 'g', 'mg', 'kit', 'cx', 'frasco']),
  requiresRefrigeration: z.boolean().default(false),
  isControlledSubstance: z.boolean().default(false),
  minStockLevel: z.number().min(0, 'Minimum stock level must be non-negative'),
  maxStockLevel: z.number().min(0, 'Maximum stock level must be positive'),
  reorderPoint: z.number().min(0, 'Reorder point must be non-negative'),
  leadTimeDays: z.number().min(0, 'Lead time must be non-negative').max(
    365,
    'Lead time cannot exceed 365 days',
  ),
  supplierId: z.string().uuid().optional(),
  costPrice: z.number().min(0, 'Cost price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  anvisaRegistration: z.string().optional(),
  expiryRequired: z.boolean().default(true),
  batchTrackingRequired: z.boolean().default(true),
  storageConditions: z.string().optional(),
  usageInstructions: z.string().optional(),
  contraindications: z.array(z.string()).default([]),
})

const BatchInput = z.object({
  productId: z.string().uuid('Invalid product ID'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.date().optional(),
  manufacturingDate: z.date().optional(),
  initialQuantity: z.number().positive('Initial quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  supplierId: z.string().uuid().optional(),
  anvisaBatchNumber: z.string().optional(),
  qualityCheckDate: z.date().optional(),
  storageLocation: z.string().optional(),
  notes: z.string().optional(),
})

const _InventoryTransactionInput = z.object({
  productId: z.string().uuid('Invalid product ID'),
  batchId: z.string().uuid().optional(),
  quantity: z.number().nonzero('Quantity cannot be zero'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative').optional(),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
  notes: z.string().optional(),
})

const ProductUsageInput = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  productId: z.string().uuid('Invalid product ID'),
  batchId: z.string().uuid().optional(),
  quantityUsed: z.number().positive('Quantity used must be positive'),
  professionalId: z.string().uuid('Invalid professional ID').optional(),
  notes: z.string().optional(),
})

const PurchaseOrderInput = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  orderNumber: z.string().optional(),
  expectedDeliveryDate: z.date().optional(),
  notes: z.string().optional(),
})

const _PurchaseOrderItemInput = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantityOrdered: z.number().positive('Quantity ordered must be positive'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  notes: z.string().optional(),
})

// Update schemas
const UpdateProductInput = ProductInput.partial().extend({
  id: z.string().uuid('Invalid product ID'),
})

const _UpdateBatchInput = z.object({
  id: z.string().uuid('Invalid batch ID'),
  currentQuantity: z.number().min(0, 'Current quantity must be non-negative'),
  notes: z.string().optional(),
})

export const inventoryManagementRouter = router({
  // === Product Management ===

  createProduct: {
    input: ProductInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const product = await inventoryService.createProduct({
          ...input,
          clinic_id: ctx.clinicId,
        })

        return {
          success: true,
          message: 'Produto criado com sucesso',
          data: product,
        }
      } catch (error) {
        console.error('Error creating product:', error)
        return {
          success: false,
          message: 'Erro ao criar produto',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  updateProduct: {
    input: UpdateProductInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const { id, ...updates } = input
        const product = await inventoryService.updateProduct(id, updates)

        return {
          success: true,
          message: 'Produto atualizado com sucesso',
          data: product,
        }
      } catch {
        console.error('Error updating product:', error)
        return {
          success: false,
          message: 'Erro ao atualizar produto',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  getProducts: {
    input: z.object({
      category: z.string().optional(),
      requiresRefrigeration: z.boolean().optional(),
      isLowStock: z.boolean().optional(),
      isExpiringSoon: z.boolean().optional(),
      search: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const products = await inventoryService.getProducts(input)

        return {
          success: true,
          message: 'Produtos recuperados com sucesso',
          data: products,
        }
      } catch {
        console.error('Error getting products:', error)
        return {
          success: false,
          message: 'Erro ao recuperar produtos',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Batch Management ===

  createInventoryBatch: {
    input: BatchInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const batch = await inventoryService.createInventoryBatch({
          ...input,
          received_date: new Date(),
          current_quantity: input.initialQuantity,
        })

        return {
          success: true,
          message: 'Lote de inventário criado com sucesso',
          data: batch,
        }
      } catch {
        console.error('Error creating inventory batch:', error)
        return {
          success: false,
          message: 'Erro ao criar lote de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  getInventoryBatches: {
    input: z.object({
      productId: z.string().uuid().optional(),
      expiringSoon: z.boolean().default(false),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const batches = await inventoryService.getInventoryBatches(
          input.productId,
          input.expiringSoon,
        )

        return {
          success: true,
          message: 'Lotes de inventário recuperados com sucesso',
          data: batches,
        }
      } catch {
        console.error('Error getting inventory batches:', error)
        return {
          success: false,
          message: 'Erro ao recuperar lotes de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  checkBatchExpiry: {
    input: z.object({
      productId: z.string().uuid('Invalid product ID'),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.object({
        valid: z.array(z.any()),
        expiringSoon: z.array(z.any()),
        expired: z.array(z.any()),
      }).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const expiryInfo = await inventoryService.checkBatchExpiry(input.productId)

        return {
          success: true,
          message: 'Verificação de validade do lote concluída',
          data: expiryInfo,
        }
      } catch {
        console.error('Error checking batch expiry:', error)
        return {
          success: false,
          message: 'Erro ao verificar validade do lote',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Stock Management ===

  updateStockLevel: {
    input: z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantityChange: z.number().nonzero('Quantity change cannot be zero'),
      transactionType: z.enum(['purchase', 'sale', 'adjustment', 'waste']),
      referenceId: z.string().uuid().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        await inventoryService.updateStockLevel(
          input.productId,
          input.quantityChange,
          input.transactionType,
          input.referenceId,
        )

        return {
          success: true,
          message: 'Nível de estoque atualizado com sucesso',
        }
      } catch {
        console.error('Error updating stock level:', error)
        return {
          success: false,
          message: 'Erro ao atualizar nível de estoque',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Product Usage Tracking ===

  recordProductUsage: {
    input: ProductUsageInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        await inventoryService.recordProductUsage({
          ...input,
          usage_date: new Date(),
        })

        return {
          success: true,
          message: 'Uso de produto registrado com sucesso',
        }
      } catch {
        console.error('Error recording product usage:', error)
        return {
          success: false,
          message: 'Erro ao registrar uso de produto',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  getProductUsageStats: {
    input: z.object({
      productId: z.string().uuid('Invalid product ID'),
      days: z.number().min(1).max(365).default(90),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const stats = await inventoryService.getProductUsageStats(input.productId, input.days)

        return {
          success: true,
          message: 'Estatísticas de uso recuperadas com sucesso',
          data: stats,
        }
      } catch {
        console.error('Error getting product usage stats:', error)
        return {
          success: false,
          message: 'Erro ao recuperar estatísticas de uso',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Alerts and Notifications ===

  getInventoryAlerts: {
    input: z.object({
      alertType: z.string().optional(),
      severity: z.string().optional(),
      isResolved: z.boolean().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const alerts = await inventoryService.getInventoryAlerts(input)

        return {
          success: true,
          message: 'Alertas de inventário recuperados com sucesso',
          data: alerts,
        }
      } catch {
        console.error('Error getting inventory alerts:', error)
        return {
          success: false,
          message: 'Erro ao recuperar alertas de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  checkLowStockAlerts: {
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const alerts = await inventoryService.checkLowStockAlerts()

        return {
          success: true,
          message: 'Alertas de baixo estoque verificados com sucesso',
          data: alerts,
        }
      } catch {
        console.error('Error checking low stock alerts:', error)
        return {
          success: false,
          message: 'Erro ao verificar alertas de baixo estoque',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  checkExpiryAlerts: {
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const alerts = await inventoryService.checkExpiryAlerts()

        return {
          success: true,
          message: 'Alertas de validade verificados com sucesso',
          data: alerts,
        }
      } catch {
        console.error('Error checking expiry alerts:', error)
        return {
          success: false,
          message: 'Erro ao verificar alertas de validade',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Purchase Order Management ===

  createPurchaseOrder: {
    input: PurchaseOrderInput,
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const order = await inventoryService.createPurchaseOrder({
          ...input,
          clinic_id: ctx.clinicId,
          status: 'draft',
          total_amount: 0,
        })

        return {
          success: true,
          message: 'Ordem de compra criada com sucesso',
          data: order,
        }
      } catch {
        console.error('Error creating purchase order:', error)
        return {
          success: false,
          message: 'Erro ao criar ordem de compra',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  getPurchaseOrders: {
    input: z.object({
      status: z.string().optional(),
      supplierId: z.string().uuid().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const orders = await inventoryService.getPurchaseOrders(input)

        return {
          success: true,
          message: 'Ordens de compra recuperadas com sucesso',
          data: orders,
        }
      } catch {
        console.error('Error getting purchase orders:', error)
        return {
          success: false,
          message: 'Erro ao recuperar ordens de compra',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Reporting and Analytics ===

  getInventorySummary: {
    input: z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const summary = await inventoryService.getInventorySummary(input.dateFrom, input.dateTo)

        return {
          success: true,
          message: 'Resumo de inventário recuperado com sucesso',
          data: summary,
        }
      } catch {
        console.error('Error getting inventory summary:', error)
        return {
          success: false,
          message: 'Erro ao recuperar resumo de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  generateInventoryReport: {
    input: z.object({
      category: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      includeUsage: z.boolean().default(true),
    }),
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.any().optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ input, ctx: _ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const report = await inventoryService.generateInventoryReport(input)

        return {
          success: true,
          message: 'Relatório de inventário gerado com sucesso',
          data: report,
        }
      } catch {
        console.error('Error generating inventory report:', error)
        return {
          success: false,
          message: 'Erro ao gerar relatório de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  // === Automated Processes ===

  processDailyInventoryChecks: {
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      error: z.string().optional(),
    }),
    resolve: async ({ ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        await inventoryService.processDailyInventoryChecks()

        return {
          success: true,
          message: 'Verificações diárias de inventário processadas com sucesso',
        }
      } catch {
        console.error('Error processing daily inventory checks:', error)
        return {
          success: false,
          message: 'Erro ao processar verificações diárias de inventário',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },

  calculateReorderQuantities: {
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      data: z.array(z.any()).optional(),
      error: z.string().optional(),
    }),
    resolve: async ({ ctx }) => {
      try {
        const inventoryService = new InventoryManagementService({
          clinicId: ctx.clinicId,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        })

        const recommendations = await inventoryService.calculateReorderQuantities()

        return {
          success: true,
          message: 'Quantidades de reposição calculadas com sucesso',
          data: recommendations,
        }
      } catch {
        console.error('Error calculating reorder quantities:', error)
        return {
          success: false,
          message: 'Erro ao calcular quantidades de reposição',
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
  },
})
