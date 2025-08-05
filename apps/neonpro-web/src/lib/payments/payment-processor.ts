// lib/payments/payment-processor.ts
export interface PaymentProcessorConfig {
  stripeSecretKey: string;
  webhookSecret: string;
}

export class PaymentProcessor {
  constructor(private config: PaymentProcessorConfig) {}

  async processPayment(
    amount: number,
    paymentMethodId: string,
  ): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    // Mock implementation for build
    return {
      success: true,
      paymentId: `payment_${Math.random().toString(36)}`,
    };
  }

  async refundPayment(
    paymentId: string,
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    // Mock implementation for build
    return {
      success: true,
      refundId: `refund_${Math.random().toString(36)}`,
    };
  }
}
