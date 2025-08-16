// lib/payments/payment-processor.ts
export type PaymentProcessorConfig = {
  stripeSecretKey: string;
  webhookSecret: string;
};

export class PaymentProcessor {
  async processPayment(
    _amount: number,
    _paymentMethodId: string
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    // Mock implementation for build
    return {
      success: true,
      paymentId: `payment_${Math.random().toString(36)}`,
    };
  }

  async refundPayment(
    _paymentId: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    // Mock implementation for build
    return {
      success: true,
      refundId: `refund_${Math.random().toString(36)}`,
    };
  }
}
