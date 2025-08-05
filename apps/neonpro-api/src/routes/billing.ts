import type { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  calculateBrazilianTaxes,
  formatCurrency,
  validateCNPJ,
  validateCPF,
} from "../utils/healthcare";

// Schemas para validação de cobrança brasileira
const InvoiceSchema = z.object({
  patientId: z.string().min(1),
  treatmentId: z.string().min(1).optional(),
  appointmentId: z.string().min(1).optional(),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        serviceName: z.string().min(1),
        description: z.string().optional(),
        quantity: z.number().min(1).default(1),
        unitPrice: z.number().min(0),
        discount: z.number().min(0).max(100).default(0), // Porcentagem
        taxable: z.boolean().default(true),
      }),
    )
    .min(1),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "pix",
    "bank_transfer",
    "cash",
    "insurance",
    "installments",
  ]),
  installments: z.number().min(1).max(24).optional(),
  dueDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
  discounts: z
    .array(
      z.object({
        type: z.enum(["percentage", "fixed_amount", "promotional", "insurance_coverage"]),
        value: z.number().min(0),
        description: z.string().min(1),
      }),
    )
    .default([]),
  taxes: z.object({
    includeISS: z.boolean().default(true), // Imposto sobre Serviços
    includeIR: z.boolean().default(false), // Imposto de Renda (para valores altos)
    municipality: z.string().min(1), // Município para cálculo do ISS
  }),
  insuranceInfo: z
    .object({
      hasInsurance: z.boolean().default(false),
      insuranceProvider: z.string().optional(),
      policyNumber: z.string().optional(),
      coveragePercentage: z.number().min(0).max(100).optional(),
      preAuthorizationCode: z.string().optional(),
    })
    .optional(),
});

const PaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01),
  paymentMethod: z.enum(["credit_card", "debit_card", "pix", "bank_transfer", "cash"]),
  installmentNumber: z.number().min(1).optional(),
  totalInstallments: z.number().min(1).optional(),
  cardInfo: z
    .object({
      holderName: z.string().min(1),
      holderDocument: z.string().min(11), // CPF ou CNPJ
      lastFourDigits: z.string().length(4),
      brand: z.enum(["visa", "mastercard", "elo", "amex", "hipercard"]),
      installments: z.number().min(1).max(24).optional(),
    })
    .optional(),
  pixInfo: z
    .object({
      pixKey: z.string().min(1),
      qrCode: z.string().optional(),
      expirationTime: z.string().datetime().optional(),
    })
    .optional(),
  bankTransferInfo: z
    .object({
      bankCode: z.string().length(3),
      agency: z.string().min(1),
      account: z.string().min(1),
      transferId: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(500).optional(),
});

const PaymentPlanSchema = z.object({
  patientId: z.string().min(1),
  treatmentId: z.string().min(1),
  totalAmount: z.number().min(0.01),
  downPayment: z.number().min(0).default(0),
  numberOfInstallments: z.number().min(1).max(24),
  interestRate: z.number().min(0).max(30).default(0), // % ao mês
  firstDueDate: z.string().datetime(),
  dayOfMonth: z.number().min(1).max(31).default(10), // Dia do vencimento
  lateFeePercentage: z.number().min(0).max(20).default(2), // % ao mês
  description: z.string().max(500).optional(),
});

export default async function billingRoutes(fastify: FastifyInstance) {
  // Criar fatura
  fastify.post(
    "/invoices",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin", "receptionist", "doctor"])],
      schema: {
        body: InvoiceSchema,
        response: {
          201: z.object({
            success: z.boolean(),
            invoiceId: z.string(),
            totalAmount: z.number(),
            taxAmount: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = request.body as z.infer<typeof InvoiceSchema>;
      const { tenantId, userId } = request.user;

      try {
        const invoiceId = uuidv4();

        // Calcular valores
        let subtotal = 0;
        let totalDiscount = 0;

        // Calcular subtotal dos serviços
        for (const service of data.services) {
          const serviceTotal = service.quantity * service.unitPrice;
          const serviceDiscount = (serviceTotal * service.discount) / 100;
          subtotal += serviceTotal - serviceDiscount;
          totalDiscount += serviceDiscount;
        }

        // Aplicar descontos adicionais
        for (const discount of data.discounts) {
          if (discount.type === "percentage") {
            totalDiscount += (subtotal * discount.value) / 100;
          } else {
            totalDiscount += discount.value;
          }
        }

        const discountedAmount = subtotal - totalDiscount;

        // Calcular impostos brasileiros
        const taxInfo = calculateBrazilianTaxes(discountedAmount, {
          includeISS: data.taxes.includeISS,
          includeIR: data.taxes.includeIR,
          municipality: data.taxes.municipality,
          serviceType: "healthcare",
        });

        const totalAmount = discountedAmount + taxInfo.totalTax;

        // Verificar cobertura do plano de saúde
        let insuranceCoverage = 0;
        if (data.insuranceInfo?.hasInsurance && data.insuranceInfo.coveragePercentage) {
          insuranceCoverage = (totalAmount * data.insuranceInfo.coveragePercentage) / 100;
        }

        const finalAmount = totalAmount - insuranceCoverage;

        // Criar fatura no banco
        const invoice = await fastify.supabase
          .from("invoices")
          .insert({
            id: invoiceId,
            tenant_id: tenantId,
            patient_id: data.patientId,
            treatment_id: data.treatmentId,
            appointment_id: data.appointmentId,
            services: data.services,
            subtotal,
            total_discount: totalDiscount,
            tax_amount: taxInfo.totalTax,
            tax_details: taxInfo,
            insurance_coverage: insuranceCoverage,
            total_amount: finalAmount,
            payment_method: data.paymentMethod,
            installments: data.installments,
            due_date: data.dueDate,
            status: "pending",
            notes: data.notes,
            created_by: userId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (invoice.error) {
          throw new Error(`Erro ao criar fatura: ${invoice.error.message}`);
        }

        // Se for parcelado, criar as parcelas
        if (data.paymentMethod === "installments" && data.installments && data.installments > 1) {
          await createInstallments(
            fastify,
            invoiceId,
            finalAmount,
            data.installments,
            data.dueDate,
            tenantId,
          );
        }

        // Audit log
        await fastify.auditLog({
          action: "invoice_created",
          userId,
          tenantId,
          resourceId: invoiceId,
          metadata: {
            patientId: data.patientId,
            totalAmount: finalAmount,
            paymentMethod: data.paymentMethod,
          },
        });

        reply.code(201).send({
          success: true,
          invoiceId,
          totalAmount: finalAmount,
          taxAmount: taxInfo.totalTax,
          message: "Fatura criada com sucesso",
        });
      } catch (error) {
        fastify.log.error("Erro ao criar fatura:", error);
        reply.code(500).send({
          error: "Erro interno do servidor",
          message: "Não foi possível criar a fatura",
        });
      }
    },
  );

  // Processar pagamento
  fastify.post(
    "/payments",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin", "receptionist"])],
      schema: {
        body: PaymentSchema,
        response: {
          201: z.object({
            success: z.boolean(),
            paymentId: z.string(),
            transactionId: z.string().optional(),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = request.body as z.infer<typeof PaymentSchema>;
      const { tenantId, userId } = request.user;

      try {
        // Verificar se a fatura existe
        const invoice = await fastify.supabase
          .from("invoices")
          .select("*")
          .eq("id", data.invoiceId)
          .eq("tenant_id", tenantId)
          .single();

        if (invoice.error || !invoice.data) {
          return reply.code(404).send({
            error: "Fatura não encontrada",
          });
        }

        // Verificar se já foi paga
        if (invoice.data.status === "paid") {
          return reply.code(400).send({
            error: "Fatura já foi paga",
          });
        }

        const paymentId = uuidv4();
        let transactionId: string | undefined;

        // Processar pagamento baseado no método
        switch (data.paymentMethod) {
          case "credit_card":
          case "debit_card":
            transactionId = await processCardPayment(data, invoice.data);
            break;
          case "pix":
            transactionId = await processPixPayment(data, invoice.data);
            break;
          case "bank_transfer":
            transactionId = await processBankTransfer(data, invoice.data);
            break;
          case "cash":
            transactionId = `CASH_${Date.now()}`;
            break;
        }

        // Salvar pagamento
        const payment = await fastify.supabase
          .from("payments")
          .insert({
            id: paymentId,
            tenant_id: tenantId,
            invoice_id: data.invoiceId,
            amount: data.amount,
            payment_method: data.paymentMethod,
            installment_number: data.installmentNumber || 1,
            total_installments: data.totalInstallments || 1,
            transaction_id: transactionId,
            card_info: data.cardInfo,
            pix_info: data.pixInfo,
            bank_transfer_info: data.bankTransferInfo,
            status: "completed",
            processed_by: userId,
            processed_at: new Date().toISOString(),
            notes: data.notes,
          })
          .select()
          .single();

        if (payment.error) {
          throw new Error(`Erro ao registrar pagamento: ${payment.error.message}`);
        }

        // Atualizar status da fatura
        const remainingAmount = invoice.data.total_amount - data.amount;
        const newStatus = remainingAmount <= 0 ? "paid" : "partially_paid";

        await fastify.supabase
          .from("invoices")
          .update({
            status: newStatus,
            paid_amount: (invoice.data.paid_amount || 0) + data.amount,
            paid_at: newStatus === "paid" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.invoiceId);

        // Audit log
        await fastify.auditLog({
          action: "payment_processed",
          userId,
          tenantId,
          resourceId: paymentId,
          metadata: {
            invoiceId: data.invoiceId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            transactionId,
          },
        });

        // Notificar pagamento recebido
        if (newStatus === "paid") {
          await notifyPaymentCompleted(fastify, invoice.data, payment.data);
        }

        reply.code(201).send({
          success: true,
          paymentId,
          transactionId,
          message:
            newStatus === "paid"
              ? "Pagamento realizado com sucesso"
              : "Pagamento parcial realizado",
        });
      } catch (error) {
        fastify.log.error("Erro ao processar pagamento:", error);
        reply.code(500).send({
          error: "Erro interno do servidor",
          message: "Não foi possível processar o pagamento",
        });
      }
    },
  );

  // Criar plano de pagamento
  fastify.post(
    "/payment-plans",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin", "receptionist", "doctor"])],
      schema: {
        body: PaymentPlanSchema,
        response: {
          201: z.object({
            success: z.boolean(),
            paymentPlanId: z.string(),
            installments: z.array(
              z.object({
                installmentNumber: z.number(),
                amount: z.number(),
                dueDate: z.string(),
              }),
            ),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = request.body as z.infer<typeof PaymentPlanSchema>;
      const { tenantId, userId } = request.user;

      try {
        const paymentPlanId = uuidv4();

        // Calcular parcelas com juros
        const financedAmount = data.totalAmount - data.downPayment;
        const monthlyRate = data.interestRate / 100;

        let installmentAmount: number;
        if (monthlyRate > 0) {
          // Fórmula Price para financiamento com juros
          installmentAmount =
            (financedAmount * (monthlyRate * (1 + monthlyRate) ** data.numberOfInstallments)) /
            ((1 + monthlyRate) ** data.numberOfInstallments - 1);
        } else {
          // Sem juros
          installmentAmount = financedAmount / data.numberOfInstallments;
        }

        // Criar plano de pagamento
        const paymentPlan = await fastify.supabase
          .from("payment_plans")
          .insert({
            id: paymentPlanId,
            tenant_id: tenantId,
            patient_id: data.patientId,
            treatment_id: data.treatmentId,
            total_amount: data.totalAmount,
            down_payment: data.downPayment,
            financed_amount: financedAmount,
            number_of_installments: data.numberOfInstallments,
            installment_amount: installmentAmount,
            interest_rate: data.interestRate,
            first_due_date: data.firstDueDate,
            day_of_month: data.dayOfMonth,
            late_fee_percentage: data.lateFeePercentage,
            status: "active",
            description: data.description,
            created_by: userId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (paymentPlan.error) {
          throw new Error(`Erro ao criar plano de pagamento: ${paymentPlan.error.message}`);
        }

        // Criar parcelas individuais
        const installments = [];
        const firstDueDate = new Date(data.firstDueDate);

        for (let i = 1; i <= data.numberOfInstallments; i++) {
          const dueDate = new Date(firstDueDate);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          dueDate.setDate(data.dayOfMonth);

          const installmentId = uuidv4();

          await fastify.supabase.from("payment_installments").insert({
            id: installmentId,
            tenant_id: tenantId,
            payment_plan_id: paymentPlanId,
            installment_number: i,
            amount: installmentAmount,
            due_date: dueDate.toISOString(),
            status: "pending",
            created_at: new Date().toISOString(),
          });

          installments.push({
            installmentNumber: i,
            amount: Math.round(installmentAmount * 100) / 100,
            dueDate: dueDate.toISOString(),
          });
        }

        // Audit log
        await fastify.auditLog({
          action: "payment_plan_created",
          userId,
          tenantId,
          resourceId: paymentPlanId,
          metadata: {
            patientId: data.patientId,
            totalAmount: data.totalAmount,
            installments: data.numberOfInstallments,
          },
        });

        reply.code(201).send({
          success: true,
          paymentPlanId,
          installments,
          message: "Plano de pagamento criado com sucesso",
        });
      } catch (error) {
        fastify.log.error("Erro ao criar plano de pagamento:", error);
        reply.code(500).send({
          error: "Erro interno do servidor",
          message: "Não foi possível criar o plano de pagamento",
        });
      }
    },
  );
}

// Listar faturas com filtros
fastify.get(
  "/invoices",
  {
    preHandler: [fastify.authenticate, fastify.requireRole(["admin", "receptionist", "doctor"])],
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(20),
        status: z.enum(["pending", "paid", "partially_paid", "overdue", "cancelled"]).optional(),
        patientId: z.string().optional(),
        paymentMethod: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
    },
  },
  async (request, reply) => {
    const { tenantId } = request.user;
    const { page, limit, status, patientId, paymentMethod, startDate, endDate } =
      request.query as any;

    try {
      let query = fastify.supabase
        .from("invoices")
        .select(`
        *,
        patients:patient_id (
          id,
          full_name,
          cpf,
          email,
          phone
        ),
        payments (
          id,
          amount,
          payment_method,
          processed_at,
          status
        )
      `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (status) query = query.eq("status", status);
      if (patientId) query = query.eq("patient_id", patientId);
      if (paymentMethod) query = query.eq("payment_method", paymentMethod);
      if (startDate) query = query.gte("created_at", startDate);
      if (endDate) query = query.lte("created_at", endDate);

      // Paginação
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const result = await query;

      if (result.error) {
        throw new Error(`Erro ao buscar faturas: ${result.error.message}`);
      }

      // Contar total de registros
      let countQuery = fastify.supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if (status) countQuery = countQuery.eq("status", status);
      if (patientId) countQuery = countQuery.eq("patient_id", patientId);
      if (paymentMethod) countQuery = countQuery.eq("payment_method", paymentMethod);
      if (startDate) countQuery = countQuery.gte("created_at", startDate);
      if (endDate) countQuery = countQuery.lte("created_at", endDate);

      const countResult = await countQuery;
      const totalCount = countResult.count || 0;

      reply.send({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      fastify.log.error("Erro ao listar faturas:", error);
      reply.code(500).send({
        error: "Erro interno do servidor",
        message: "Não foi possível listar as faturas",
      });
    }
  },
);

// Obter fatura específica
fastify.get(
  "/invoices/:invoiceId",
  {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole(["admin", "receptionist", "doctor", "patient"]),
    ],
  },
  async (request, reply) => {
    const { tenantId, role, userId } = request.user;
    const { invoiceId } = request.params as { invoiceId: string };

    try {
      const query = fastify.supabase
        .from("invoices")
        .select(`
        *,
        patients:patient_id (
          id,
          full_name,
          cpf,
          email,
          phone,
          user_id
        ),
        treatments:treatment_id (
          id,
          name,
          description
        ),
        appointments:appointment_id (
          id,
          scheduled_at,
          type
        ),
        payments (
          id,
          amount,
          payment_method,
          installment_number,
          total_installments,
          processed_at,
          status,
          notes
        )
      `)
        .eq("id", invoiceId)
        .eq("tenant_id", tenantId);

      const result = await query.single();

      if (result.error) {
        return reply.code(404).send({
          error: "Fatura não encontrada",
        });
      }

      // Pacientes só podem ver suas próprias faturas
      if (role === "patient" && result.data.patients?.user_id !== userId) {
        return reply.code(403).send({
          error: "Acesso negado",
        });
      }

      reply.send({
        success: true,
        data: result.data,
      });
    } catch (error) {
      fastify.log.error("Erro ao obter fatura:", error);
      reply.code(500).send({
        error: "Erro interno do servidor",
        message: "Não foi possível obter a fatura",
      });
    }
  },
);

// Gerar relatório financeiro
fastify.get(
  "/reports/financial",
  {
    preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
    schema: {
      querystring: z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        groupBy: z.enum(["day", "week", "month"]).default("month"),
      }),
    },
  },
  async (request, reply) => {
    const { tenantId } = request.user;
    const { startDate, endDate, groupBy } = request.query as any;

    try {
      // Relatório de receitas
      const revenueQuery = await fastify.supabase
        .from("invoices")
        .select("total_amount, paid_amount, created_at, status, payment_method")
        .eq("tenant_id", tenantId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (revenueQuery.error) {
        throw new Error(`Erro ao gerar relatório: ${revenueQuery.error.message}`);
      }

      const invoices = revenueQuery.data || [];

      // Calcular métricas
      const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
      const totalPending = invoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + inv.total_amount, 0);
      const totalOverdue = invoices
        .filter((inv) => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Agrupar por período
      const groupedData = groupInvoicesByPeriod(invoices, groupBy);

      // Relatório por método de pagamento
      const paymentMethodStats = getPaymentMethodStats(invoices);

      // Top serviços/tratamentos
      const topServices = await getTopServices(fastify, tenantId, startDate, endDate);

      reply.send({
        success: true,
        data: {
          summary: {
            totalInvoiced: formatCurrency(totalInvoiced),
            totalPaid: formatCurrency(totalPaid),
            totalPending: formatCurrency(totalPending),
            totalOverdue: formatCurrency(totalOverdue),
            collectionRate:
              totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(2) : "0.00",
          },
          timeline: groupedData,
          paymentMethods: paymentMethodStats,
          topServices,
          period: {
            startDate,
            endDate,
            groupBy,
          },
        },
      });
    } catch (error) {
      fastify.log.error("Erro ao gerar relatório financeiro:", error);
      reply.code(500).send({
        error: "Erro interno do servidor",
        message: "Não foi possível gerar o relatório financeiro",
      });
    }
  },
);

// Processar PIX
fastify.post(
  "/pix/generate",
  {
    preHandler: [fastify.authenticate, fastify.requireRole(["admin", "receptionist"])],
    schema: {
      body: z.object({
        invoiceId: z.string().min(1),
        amount: z.number().min(0.01),
        expirationMinutes: z.number().min(1).max(1440).default(60), // Máximo 24h
      }),
    },
  },
  async (request, reply) => {
    const { tenantId } = request.user;
    const { invoiceId, amount, expirationMinutes } = request.body as any;

    try {
      // Verificar fatura
      const invoice = await fastify.supabase
        .from("invoices")
        .select("*, patients:patient_id (full_name, cpf)")
        .eq("id", invoiceId)
        .eq("tenant_id", tenantId)
        .single();

      if (invoice.error || !invoice.data) {
        return reply.code(404).send({
          error: "Fatura não encontrada",
        });
      }

      // Gerar PIX (simulação - em produção usar API do banco)
      const pixKey = generatePixKey();
      const qrCode = generatePixQRCode(amount, pixKey, invoice.data.patients.full_name);
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + expirationMinutes);

      // Salvar informações do PIX
      await fastify.supabase.from("pix_payments").insert({
        id: uuidv4(),
        tenant_id: tenantId,
        invoice_id: invoiceId,
        amount,
        pix_key: pixKey,
        qr_code: qrCode,
        expires_at: expirationTime.toISOString(),
        status: "pending",
        created_at: new Date().toISOString(),
      });

      reply.send({
        success: true,
        pixKey,
        qrCode,
        amount: formatCurrency(amount),
        expiresAt: expirationTime.toISOString(),
        message: "PIX gerado com sucesso",
      });
    } catch (error) {
      fastify.log.error("Erro ao gerar PIX:", error);
      reply.code(500).send({
        error: "Erro interno do servidor",
        message: "Não foi possível gerar o PIX",
      });
    }
  },
);

// Funções auxiliares
async function createInstallments(
  fastify: FastifyInstance,
  invoiceId: string,
  totalAmount: number,
  installments: number,
  firstDueDate: string,
  tenantId: string,
) {
  const installmentAmount = totalAmount / installments;
  const dueDate = new Date(firstDueDate);

  for (let i = 1; i <= installments; i++) {
    const currentDueDate = new Date(dueDate);
    currentDueDate.setMonth(currentDueDate.getMonth() + (i - 1));

    await fastify.supabase.from("invoice_installments").insert({
      id: uuidv4(),
      tenant_id: tenantId,
      invoice_id: invoiceId,
      installment_number: i,
      amount: installmentAmount,
      due_date: currentDueDate.toISOString(),
      status: "pending",
      created_at: new Date().toISOString(),
    });
  }
}

async function processCardPayment(paymentData: any, invoice: any): Promise<string> {
  // Simulação de processamento de cartão
  // Em produção, integrar com gateway de pagamento (Stone, PagSeguro, etc.)

  // Validar dados do cartão
  if (!validateCPF(paymentData.cardInfo.holderDocument)) {
    throw new Error("CPF do portador inválido");
  }

  // Simular processamento
  const transactionId = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Aqui seria feita a chamada para o gateway de pagamento
  console.log("Processando pagamento com cartão:", {
    amount: paymentData.amount,
    holderName: paymentData.cardInfo.holderName,
    lastFourDigits: paymentData.cardInfo.lastFourDigits,
    brand: paymentData.cardInfo.brand,
  });

  return transactionId;
}

async function processPixPayment(paymentData: any, invoice: any): Promise<string> {
  // Simulação de processamento PIX
  // Em produção, integrar com API do banco ou PSP

  const transactionId = `PIX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log("Processando pagamento PIX:", {
    amount: paymentData.amount,
    pixKey: paymentData.pixInfo?.pixKey,
  });

  return transactionId;
}

async function processBankTransfer(paymentData: any, invoice: any): Promise<string> {
  // Simulação de transferência bancária
  const transactionId = `TED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log("Processando transferência bancária:", {
    amount: paymentData.amount,
    bankCode: paymentData.bankTransferInfo?.bankCode,
    agency: paymentData.bankTransferInfo?.agency,
  });

  return transactionId;
}

async function notifyPaymentCompleted(fastify: FastifyInstance, invoice: any, payment: any) {
  // Enviar notificação de pagamento concluído
  console.log("Enviando notificação de pagamento concluído:", {
    invoiceId: invoice.id,
    patientId: invoice.patient_id,
    amount: payment.amount,
  });

  // Aqui seria integrado com sistema de notificações
  // SMS, email, WhatsApp, etc.
}

function groupInvoicesByPeriod(invoices: any[], groupBy: string) {
  const grouped: Record<string, any> = {};

  invoices.forEach((invoice) => {
    const date = new Date(invoice.created_at);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "week": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split("T")[0];
        break;
      }
      case "month":
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        totalInvoiced: 0,
        totalPaid: 0,
        totalPending: 0,
        invoiceCount: 0,
      };
    }

    grouped[key].totalInvoiced += invoice.total_amount;
    grouped[key].totalPaid += invoice.paid_amount || 0;
    if (invoice.status === "pending") {
      grouped[key].totalPending += invoice.total_amount;
    }
    grouped[key].invoiceCount++;
  });

  return Object.values(grouped);
}

function getPaymentMethodStats(invoices: any[]) {
  const stats: Record<string, any> = {};

  invoices.forEach((invoice) => {
    const method = invoice.payment_method;
    if (!stats[method]) {
      stats[method] = {
        method,
        count: 0,
        totalAmount: 0,
        paidAmount: 0,
      };
    }

    stats[method].count++;
    stats[method].totalAmount += invoice.total_amount;
    stats[method].paidAmount += invoice.paid_amount || 0;
  });

  return Object.values(stats);
}

async function getTopServices(
  fastify: FastifyInstance,
  tenantId: string,
  startDate: string,
  endDate: string,
) {
  // Buscar top serviços do período
  const result = await fastify.supabase
    .from("invoices")
    .select("services")
    .eq("tenant_id", tenantId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (result.error) return [];

  const serviceStats: Record<string, any> = {};

  result.data?.forEach((invoice) => {
    invoice.services?.forEach((service: any) => {
      const key = service.serviceName;
      if (!serviceStats[key]) {
        serviceStats[key] = {
          serviceName: key,
          count: 0,
          totalRevenue: 0,
        };
      }

      serviceStats[key].count += service.quantity;
      serviceStats[key].totalRevenue += service.quantity * service.unitPrice;
    });
  });

  return Object.values(serviceStats)
    .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);
}

function generatePixKey(): string {
  // Gerar chave PIX aleatória (simulação)
  return `pix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generatePixQRCode(amount: number, pixKey: string, payerName: string): string {
  // Gerar QR Code PIX (simulação)
  // Em produção, usar biblioteca específica para PIX QR Code
  const pixData = {
    amount,
    pixKey,
    payerName,
    timestamp: Date.now(),
  };

  return btoa(JSON.stringify(pixData));
}
