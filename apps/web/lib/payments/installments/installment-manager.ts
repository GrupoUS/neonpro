// Installment Manager - Mock implementation for build compatibility

class InstallmentManager {
  getPaymentPlan(planId: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      amount: 1000,
      installments: 12,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  createPaymentPlan(data: unknown) {
    // Mock implementation for build compatibility
    return {
      id: `plan_${Math.random().toString(36).slice(2, 9)}`,
      ...data,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  updatePaymentPlan(planId: string, data: unknown) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      ...data,
      updated_at: new Date().toISOString(),
    };
  }

  deletePaymentPlan(planId: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      deleted: true,
      deleted_at: new Date().toISOString(),
    };
  }

  getInstallments(planId: string) {
    // Mock implementation for build compatibility
    return [
      {
        id: "inst_1",
        payment_plan_id: planId,
        amount: 100,
        due_date: new Date().toISOString(),
        status: "pending",
      },
    ];
  }

  getPaymentPlanStats(planId: string) {
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

  modifyPaymentPlan(planId: string, data: unknown) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      ...data,
      modified_at: new Date().toISOString(),
    };
  }

  cancelPaymentPlan(planId: string, reason: string) {
    // Mock implementation for build compatibility
    return {
      id: planId,
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    };
  }

  regenerateInstallments(planId: string) {
    // Mock implementation for build compatibility
    return {
      payment_plan_id: planId,
      regenerated_at: new Date().toISOString(),
      installments_count: 12,
      success: true,
    };
  }

  recalculateInstallmentAmounts(planId: string) {
    // Mock implementation for build compatibility
    return {
      payment_plan_id: planId,
      recalculated_at: new Date().toISOString(),
      new_amount_per_installment: 100,
      success: true,
    };
  }

  markAsDefaulted(planId: string, reason: string) {
    // Mock implementation for build compatibility
    return {
      payment_plan_id: planId,
      status: "defaulted",
      defaulted_at: new Date().toISOString(),
      reason: reason,
      success: true,
    };
  }

  reactivatePaymentPlan(planId: string) {
    // Mock implementation for build compatibility
    return {
      payment_plan_id: planId,
      status: "active",
      reactivated_at: new Date().toISOString(),
      success: true,
    };
  }
}

const getInstallmentManager = function getInstallmentManager(): InstallmentManager {
  return new InstallmentManager();
};

export { getInstallmentManager };
