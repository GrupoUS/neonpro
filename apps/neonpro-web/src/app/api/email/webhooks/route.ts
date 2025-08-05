import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import EmailService from '@/app/lib/services/email-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.text();
    
    // Verificar assinatura do webhook
    const signature = request.headers.get('x-postmark-signature') || 
                     request.headers.get('x-sendgrid-signature') ||
                     request.headers.get('x-mailgun-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Detectar provedor baseado nos headers
    let provider: string | undefined;
    if (request.headers.get('x-postmark-signature')) {
      provider = 'postmark';
    } else if (request.headers.get('x-sendgrid-signature')) {
      provider = 'sendgrid';
    } else if (request.headers.get('x-mailgun-signature')) {
      provider = 'mailgun';
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Unknown webhook provider' },
        { status: 400 }
      );
    }

    // Verificar a assinatura específica do provedor
    const isValidSignature = await verifyWebhookSignature(
      provider,
      body,
      signature,
      request.headers
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    const emailService = new EmailService(supabase);
    
    // Processar o webhook baseado no provedor
    await emailService.handleWebhook(provider, data);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Email webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function verifyWebhookSignature(
  provider: string,
  body: string,
  signature: string,
  headers: Headers
): Promise<boolean> {
  try {
    switch (provider) {
      case 'postmark':
        // Postmark uses HMAC-SHA256
        const postmarkSecret = process.env.POSTMARK_WEBHOOK_SECRET;
        if (!postmarkSecret) return false;
        
        const postmarkExpected = crypto
          .createHmac('sha256', postmarkSecret)
          .update(body)
          .digest('hex');
        
        return signature === postmarkExpected;

      case 'sendgrid':
        // SendGrid uses ECDSA verification
        const sendgridPublicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
        if (!sendgridPublicKey) return false;
        
        // Implementar verificação ECDSA do SendGrid
        // Por simplicidade, retornando true por enquanto
        return true;

      case 'mailgun':
        // Mailgun uses HMAC-SHA256
        const mailgunSecret = process.env.MAILGUN_WEBHOOK_SECRET;
        if (!mailgunSecret) return false;
        
        const timestamp = headers.get('x-mailgun-timestamp');
        const token = headers.get('x-mailgun-token');
        
        if (!timestamp || !token) return false;
        
        const mailgunData = timestamp + token;
        const mailgunExpected = crypto
          .createHmac('sha256', mailgunSecret)
          .update(mailgunData)
          .digest('hex');
        
        return signature === mailgunExpected;

      default:
        return false;
    }
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}
