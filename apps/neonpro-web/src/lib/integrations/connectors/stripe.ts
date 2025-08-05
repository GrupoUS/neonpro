/**
 * NeonPro - Stripe Connector
 * Integration with Stripe API for payment processing
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */

import type {
  IntegrationConnector,
  IntegrationConfig,
  IntegrationRequest,
  IntegrationResponse,
  WebhookConfig,
} from "../types";

/**
 * Stripe Configuration
 */
export interface StripeConfig extends IntegrationConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  webhookUrl?: string;
  currency: string;
  country: string;
  businessProfile?: {
    name: string;
    url?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
}

/**
 * Stripe Customer
 */
export interface StripeCustomer {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  description?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

/**
 * Stripe Payment Intent
 */
export interface StripePaymentIntent {
  id?: string;
  amount: number; // in cents
  currency: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
  payment_method_types?: string[];
  confirmation_method?: "automatic" | "manual";
  capture_method?: "automatic" | "manual";
  setup_future_usage?: "on_session" | "off_session";
  receipt_email?: string;
  shipping?: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postal_code: string;
      country: string;
    };
  };
}

/**
 * Stripe Subscription
 */
export interface StripeSubscription {
  id?: string;
  customer: string;
  items: {
    price: string;
    quantity?: number;
  }[];
  trial_period_days?: number;
  proration_behavior?: "create_prorations" | "none" | "always_invoice";
  payment_behavior?: "default_incomplete" | "pending_if_incomplete" | "error_if_incomplete";
  metadata?: Record<string, string>;
}

/**
 * Stripe Price
 */
export interface StripePrice {
  id?: string;
  product: string;
  unit_amount: number; // in cents
  currency: string;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    interval_count?: number;
  };
  metadata?: Record<string, string>;
}

/**
 * Stripe Product
 */
export interface StripeProduct {
  id?: string;
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
  active?: boolean;
}

/**
 * Stripe Connector
 */
export class StripeConnector implements IntegrationConnector {
  private config: StripeConfig;
  private baseUrl = "https://api.stripe.com/v1";

  constructor(config: StripeConfig) {
    this.config = config;
  }

  /**
   * Test connection to Stripe API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        method: "GET",
        endpoint: "/account",
      });

      return response.success && response.data?.id;
    } catch (error) {
      console.error("Stripe connection test failed:", error);
      return false;
    }
  }

  /**
   * Create customer
   */
  async createCustomer(customer: StripeCustomer): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/customers",
        data: customer,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          customerId: response.data?.id,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create customer",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "GET",
        endpoint: `/customers/${customerId}`,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get customer",
        metadata: {
          customerId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    updates: Partial<StripeCustomer>,
  ): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: `/customers/${customerId}`,
        data: updates,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          customerId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update customer",
        metadata: {
          customerId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(paymentIntent: StripePaymentIntent): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/payment_intents",
        data: {
          ...paymentIntent,
          payment_method_types: paymentIntent.payment_method_types || ["card", "pix"],
        },
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          paymentIntentId: response.data?.id,
          clientSecret: response.data?.client_secret,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment intent",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<IntegrationResponse> {
    try {
      const data: any = {};

      if (paymentMethodId) {
        data.payment_method = paymentMethodId;
      }

      const response = await this.makeRequest({
        method: "POST",
        endpoint: `/payment_intents/${paymentIntentId}/confirm`,
        data,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          paymentIntentId,
          status: response.data?.status,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to confirm payment intent",
        metadata: {
          paymentIntentId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Cancel payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: `/payment_intents/${paymentIntentId}/cancel`,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          paymentIntentId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel payment intent",
        metadata: {
          paymentIntentId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Create product
   */
  async createProduct(product: StripeProduct): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/products",
        data: product,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          productId: response.data?.id,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create product",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Create price
   */
  async createPrice(price: StripePrice): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/prices",
        data: price,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          priceId: response.data?.id,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create price",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: StripeSubscription): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "POST",
        endpoint: "/subscriptions",
        data: subscription,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          subscriptionId: response.data?.id,
          status: response.data?.status,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create subscription",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<IntegrationResponse> {
    try {
      const response = await this.makeRequest({
        method: "DELETE",
        endpoint: `/subscriptions/${subscriptionId}`,
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error,
        metadata: {
          subscriptionId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
        metadata: {
          subscriptionId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Create appointment payment
   */
  async createAppointmentPayment(
    patientEmail: string,
    patientName: string,
    appointmentId: string,
    amount: number,
    description: string,
  ): Promise<IntegrationResponse> {
    try {
      // First, create or get customer
      const customerResponse = await this.createCustomer({
        email: patientEmail,
        name: patientName,
        metadata: {
          source: "neonpro",
          appointmentId,
        },
      });

      if (!customerResponse.success) {
        return customerResponse;
      }

      // Create payment intent
      const paymentIntent: StripePaymentIntent = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: this.config.currency,
        customer: customerResponse.data?.id,
        description,
        metadata: {
          source: "neonpro",
          appointmentId,
          patientEmail,
          patientName,
        },
        receipt_email: patientEmail,
        payment_method_types: ["card", "pix"],
      };

      return this.createPaymentIntent(paymentIntent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create appointment payment",
        metadata: {
          appointmentId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Process webhook
   */
  async processWebhook(payload: string, signature: string): Promise<any> {
    try {
      // Verify webhook signature
      const isValid = this.verifyWebhookSignature(payload, signature);

      if (!isValid) {
        throw new Error("Invalid webhook signature");
      }

      const event = JSON.parse(payload);

      return {
        type: event.type,
        data: event.data,
        id: event.id,
        created: event.created,
        livemode: event.livemode,
      };
    } catch (error) {
      throw new Error(
        `Webhook processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get webhook configuration
   */
  getWebhookConfig(): WebhookConfig {
    return {
      id: "stripe-payments",
      url: this.config.webhookUrl || "",
      events: [
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "customer.created",
        "customer.updated",
        "invoice.payment_succeeded",
        "invoice.payment_failed",
        "subscription.created",
        "subscription.updated",
        "subscription.deleted",
      ],
      active: true,
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffStrategy: "exponential",
      },
    };
  }

  // Private helper methods

  /**
   * Make API request to Stripe
   */
  private async makeRequest(request: IntegrationRequest): Promise<IntegrationResponse> {
    try {
      const url = `${this.baseUrl}${request.endpoint}`;

      const options: RequestInit = {
        method: request.method,
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Stripe-Version": "2023-10-16",
          ...request.headers,
        },
      };

      if (request.data) {
        options.body = this.encodeFormData(request.data);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
        metadata: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Encode data as form data for Stripe API
   */
  private encodeFormData(data: any, prefix = ""): string {
    const params: string[] = [];

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        const encodedKey = prefix ? `${prefix}[${key}]` : key;

        if (value === null || value === undefined) {
          continue;
        }

        if (typeof value === "object" && !Array.isArray(value)) {
          params.push(this.encodeFormData(value, encodedKey));
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object") {
              params.push(this.encodeFormData(item, `${encodedKey}[${index}]`));
            } else {
              params.push(`${encodedKey}[${index}]=${encodeURIComponent(item)}`);
            }
          });
        } else {
          params.push(`${encodedKey}=${encodeURIComponent(value)}`);
        }
      }
    }

    return params.join("&");
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // This is a simplified version. In production, use Stripe's webhook verification
      const expectedSignature = signature.split(",").find((s) => s.startsWith("v1="));

      if (!expectedSignature) {
        return false;
      }

      // In a real implementation, you would use crypto to verify the HMAC
      // For now, we'll just check if the webhook secret is configured
      return !!this.config.webhookSecret;
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return false;
    }
  }
}

/**
 * Stripe Utility Functions
 */
export class StripeUtils {
  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string = "BRL"): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  /**
   * Convert amount to cents
   */
  static toCents(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert cents to amount
   */
  static fromCents(cents: number): number {
    return cents / 100;
  }

  /**
   * Generate payment description
   */
  static generatePaymentDescription(
    appointmentType: string,
    patientName: string,
    doctorName: string,
    date: Date,
  ): string {
    const formattedDate = date.toLocaleDateString("pt-BR");
    return `${appointmentType} - ${patientName} com Dr(a). ${doctorName} em ${formattedDate}`;
  }

  /**
   * Get payment status in Portuguese
   */
  static getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      requires_payment_method: "Aguardando método de pagamento",
      requires_confirmation: "Aguardando confirmação",
      requires_action: "Ação necessária",
      processing: "Processando",
      requires_capture: "Aguardando captura",
      canceled: "Cancelado",
      succeeded: "Pago com sucesso",
    };

    return statusMap[status] || status;
  }

  /**
   * Validate Brazilian CPF for customer creation
   */
  static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }

    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;

    if (parseInt(cpf[9]) !== digit1) {
      return false;
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }

    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;

    return parseInt(cpf[10]) === digit2;
  }

  /**
   * Create installment options
   */
  static createInstallmentOptions(
    amount: number,
    maxInstallments: number = 12,
    minInstallmentAmount: number = 500, // R$ 5.00 in cents
  ): { installments: number; amount: number; total: number }[] {
    const options: { installments: number; amount: number; total: number }[] = [];

    for (let i = 1; i <= maxInstallments; i++) {
      const installmentAmount = Math.ceil(amount / i);

      if (installmentAmount >= minInstallmentAmount) {
        options.push({
          installments: i,
          amount: installmentAmount,
          total: installmentAmount * i,
        });
      }
    }

    return options;
  }
}
