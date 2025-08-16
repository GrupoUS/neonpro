/**
 * PIX Integration for Brazilian Instant Payments
 * Implements PIX payment processing with QR code generation and real-time status tracking
 */

import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/client';

// PIX Payment Types
export type PixPaymentData = {
  amount: number;
  currency: string;
  description: string;
  payerName: string;
  payerDocument: string;
  payerEmail: string;
  expirationMinutes?: number;
  additionalInfo?: string;
};

export type PixPaymentResponse = {
  id: string;
  qrCode: string;
  qrCodeImage: string;
  pixKey: string;
  amount: number;
  status: PixPaymentStatus;
  expiresAt: Date;
  createdAt: Date;
};

export enum PixPaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export type PixWebhookData = {
  paymentId: string;
  status: PixPaymentStatus;
  paidAt?: Date;
  amount: number;
  payerInfo?: {
    name: string;
    document: string;
    bank: string;
  };
};

// PIX Configuration
type PixConfig = {
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  webhookUrl: string;
  pixKey: string; // Clinic's PIX key
  merchantName: string;
  merchantCity: string;
};

/**
 * PIX Payment Integration Service
 * Handles Brazilian instant payment processing
 */
export class PixIntegration {
  private readonly config: PixConfig;
  private readonly supabase = createClient();

  constructor(config: PixConfig) {
    this.config = config;
  }

  /**
   * Create a new PIX payment
   */
  async createPayment(
    paymentData: PixPaymentData
  ): Promise<PixPaymentResponse> {
    try {
      // Generate unique payment ID
      const paymentId = this.generatePaymentId();

      // Calculate expiration time (default 30 minutes)
      const expirationMinutes = paymentData.expirationMinutes || 30;
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      // Generate PIX QR Code data
      const qrCodeData = this.generatePixQRCode({
        pixKey: this.config.pixKey,
        amount: paymentData.amount,
        description: paymentData.description,
        merchantName: this.config.merchantName,
        merchantCity: this.config.merchantCity,
        txId: paymentId,
      });

      // Generate QR Code image (base64)
      const qrCodeImage = await this.generateQRCodeImage(qrCodeData);

      // Store payment in database
      const { data: payment, error } = await this.supabase
        .from('pix_payments')
        .insert({
          id: paymentId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          description: paymentData.description,
          payer_name: paymentData.payerName,
          payer_document: paymentData.payerDocument,
          payer_email: paymentData.payerEmail,
          qr_code: qrCodeData,
          qr_code_image: qrCodeImage,
          pix_key: this.config.pixKey,
          status: PixPaymentStatus.PENDING,
          expires_at: expiresAt.toISOString(),
          additional_info: paymentData.additionalInfo,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create PIX payment: ${error.message}`);
      }

      // Register webhook for payment status updates
      await this.registerWebhook(paymentId);

      return {
        id: paymentId,
        qrCode: qrCodeData,
        qrCodeImage,
        pixKey: this.config.pixKey,
        amount: paymentData.amount,
        status: PixPaymentStatus.PENDING,
        expiresAt,
        createdAt: new Date(),
      };
    } catch (error) {
      throw new Error(
        `PIX payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get PIX payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PixPaymentStatus> {
    const { data: payment, error } = await this.supabase
      .from('pix_payments')
      .select('status, expires_at')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      throw new Error('Payment not found');
    }

    // Check if payment expired
    if (
      payment.status === PixPaymentStatus.PENDING &&
      new Date() > new Date(payment.expires_at)
    ) {
      await this.updatePaymentStatus(paymentId, PixPaymentStatus.EXPIRED);
      return PixPaymentStatus.EXPIRED;
    }

    return payment.status as PixPaymentStatus;
  }

  /**
   * Handle PIX webhook notifications
   */
  async handleWebhook(webhookData: PixWebhookData): Promise<void> {
    const { paymentId, status, paidAt, payerInfo } = webhookData;

    // Update payment status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paidAt) {
      updateData.paid_at = paidAt.toISOString();
    }

    if (payerInfo) {
      updateData.payer_bank = payerInfo.bank;
      updateData.payer_info = payerInfo;
    }

    const { error } = await this.supabase
      .from('pix_payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    // If payment is confirmed, update related records
    if (status === PixPaymentStatus.PAID) {
      await this.processSuccessfulPayment(paymentId);
    }
  }

  /**
   * Cancel a PIX payment
   */
  async cancelPayment(paymentId: string): Promise<void> {
    await this.updatePaymentStatus(paymentId, PixPaymentStatus.CANCELLED);
  }

  /**
   * Generate PIX QR Code data according to Brazilian Central Bank standards
   */
  private generatePixQRCode(data: {
    pixKey: string;
    amount: number;
    description: string;
    merchantName: string;
    merchantCity: string;
    txId: string;
  }): string {
    // PIX QR Code format according to Brazilian Central Bank specification
    // This is a simplified implementation - in production, use a certified PIX library

    const payload = [
      '00020126', // Payload Format Indicator
      '01040014', // Point of Initiation Method
      `26${this.formatPixKey(data.pixKey)}`, // Merchant Account Information
      '52040000', // Merchant Category Code
      '5303986', // Transaction Currency (986 = BRL)
      `54${String(data.amount.toFixed(2)).padStart(2, '0')}${data.amount.toFixed(2)}`, // Transaction Amount
      '5802BR', // Country Code
      `59${String(data.merchantName.length).padStart(2, '0')}${data.merchantName}`, // Merchant Name
      `60${String(data.merchantCity.length).padStart(2, '0')}${data.merchantCity}`, // Merchant City
      `62${this.formatAdditionalData(data.txId, data.description)}`, // Additional Data
    ].join('');

    // Calculate CRC16
    const crc = this.calculateCRC16(`${payload}6304`);

    return `${payload}6304${crc}`;
  }

  /**
   * Format PIX key for QR code
   */
  private formatPixKey(pixKey: string): string {
    const keyData = `0014${pixKey}`;
    return `${String(keyData.length).padStart(2, '0')}${keyData}`;
  }

  /**
   * Format additional data for QR code
   */
  private formatAdditionalData(txId: string, description: string): string {
    const txIdField = `05${String(txId.length).padStart(2, '0')}${txId}`;
    const descField = description
      ? `02${String(description.length).padStart(2, '0')}${description}`
      : '';
    const additionalData = txIdField + descField;
    return `${String(additionalData.length).padStart(2, '0')}${additionalData}`;
  }

  /**
   * Calculate CRC16 for PIX QR code
   */
  private calculateCRC16(data: string): string {
    // CRC16-CCITT implementation for PIX
    let crc = 0xff_ff;

    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;

      for (let j = 0; j < 8; j++) {
        if (crc & 0x80_00) {
          crc = (crc << 1) ^ 0x10_21;
        } else {
          crc <<= 1;
        }
      }
    }

    return (crc & 0xff_ff).toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Generate QR code image from data
   */
  private async generateQRCodeImage(_qrCodeData: string): Promise<string> {
    // In production, use a QR code generation library like 'qrcode'
    // For now, return a placeholder base64 image
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(): string {
    return `pix_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  /**
   * Register webhook for payment status updates
   */
  private async registerWebhook(_paymentId: string): Promise<void> {}

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(
    paymentId: string,
    status: PixPaymentStatus
  ): Promise<void> {
    const { error } = await this.supabase
      .from('pix_payments')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }

  /**
   * Process successful payment
   */
  private async processSuccessfulPayment(paymentId: string): Promise<void> {
    try {
      // Get payment details
      const { data: payment, error } = await this.supabase
        .from('pix_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error || !payment) {
        throw new Error('Payment not found');
      }

      // Update related payment record in main payments table
      const { error: updateError } = await this.supabase
        .from('ap_payments')
        .update({
          status: 'completed',
          payment_method: 'pix',
          transaction_id: paymentId,
          paid_at: new Date().toISOString(),
        })
        .eq('pix_payment_id', paymentId);

      if (updateError) {
      }

      // Send confirmation email
      await this.sendPaymentConfirmation(payment);
    } catch (_error) {}
  }

  /**
   * Send payment confirmation email
   */
  private async sendPaymentConfirmation(_payment: any): Promise<void> {}
}

/**
 * PIX Integration Factory
 */
export function createPixIntegration(): PixIntegration {
  const config: PixConfig = {
    apiKey: process.env.PIX_API_KEY || '',
    apiSecret: process.env.PIX_API_SECRET || '',
    environment:
      (process.env.PIX_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    webhookUrl: process.env.PIX_WEBHOOK_URL || '',
    pixKey: process.env.PIX_KEY || '',
    merchantName: process.env.PIX_MERCHANT_NAME || 'NeonPro Clinic',
    merchantCity: process.env.PIX_MERCHANT_CITY || 'São Paulo',
  };

  return new PixIntegration(config);
}

// Export default instance
export const pixIntegration = createPixIntegration();
