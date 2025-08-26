// Installment Manager - Mock implementation for build compatibility

class InstallmentManager {
  async getPaymentPlan(planId: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      amount: 1000,
      installments: 12,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  async createPaymentPlan(data: any) {
    // Mock implementation for build compatibility
    return {
      id: "plan_" + Math.random().toString(36).substr(2, 9),
      ...data,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  async updatePaymentPlan(planId: string, data: any) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  async deletePaymentPlan(planId: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  async getInstallments(planId: string) {
    // Mock implementation for build compatibility
    return [
      {
        id: 'inst_1',
        payment_plan_id: planId,
        amount: 100,
        due_date: new Date().toISOString(),
        status: 'pending',
      },
    ];
  }

  async getPaymentPlanStats(planId: string) {
    // Mock implementation for build compatibility
    return {
      payment_plan_id: planId,
      total_amount: 1200,
      paid_amount: 300,
      remaining_amount: 900,
      overdue_count: 0,
      completed_count: 3,
      pending_count: 9,
    };
  }

  async modifyPaymentPlan(planId: string, data: any) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      ...data,
      modified_at: new Date().toISOString(),
    };
  }

  async cancelPaymentPlan(planId: string, reason: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    };
  }
}

export function getInstallmentManager(): InstallmentManager {
  return new InstallmentManager();
}
