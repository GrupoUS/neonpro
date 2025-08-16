// SMS Providers API for NeonPro
// Manage SMS provider configurations

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { smsService } from '@/app/lib/services/sms-service';
import { createClient } from '@/app/utils/supabase/server';

// Schema for provider configuration
const ProviderConfigSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  provider: z.enum(['twilio', 'sms_dev', 'zenvia', 'movile', 'custom']),
  enabled: z.boolean().default(false),
  config: z.object({}).passthrough(), // Allow any config structure
  webhook_url: z.string().url().optional(),
});

/**
 * Get all SMS providers
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let providers;
    if (activeOnly) {
      providers = await smsService.getActiveProvider();
      providers = providers ? [providers] : [];
    } else {
      providers = await smsService.getProviders();
    }

    return NextResponse.json(
      {
        success: true,
        data: providers,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `providers_${Date.now()}`,
          count: Array.isArray(providers)
            ? providers.length
            : providers
              ? 1
              : 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch SMS providers',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Create or update SMS provider
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ProviderConfigSchema.parse(body);

    // Create or update provider
    const provider = await smsService.upsertProvider(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: provider,
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `provider_upsert_${Date.now()}`,
          user_id: session.user.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid provider configuration',
            details: error.errors,
          },
        },
        { status: 400 },
      );
    }

    // Handle SMS service errors
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message || 'Provider configuration error',
            details: process.env.NODE_ENV === 'development' ? error : undefined,
          },
        },
        { status: 400 },
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Test SMS provider connection
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { provider_id, test_phone } = body;

    if (!(provider_id && test_phone)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider ID and test phone number are required',
          },
        },
        { status: 400 },
      );
    }

    // Test provider connection
    const testResult = await smsService.testProvider(provider_id, test_phone);

    return NextResponse.json(
      {
        success: true,
        data: {
          provider_id,
          test_phone,
          connection_successful: testResult,
          test_timestamp: new Date().toISOString(),
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `provider_test_${Date.now()}`,
          user_id: session.user.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Failed to test SMS provider connection',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * Delete SMS provider
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 },
      );
    }

    // Get provider ID from query params
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('id');

    if (!providerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Provider ID is required',
          },
        },
        { status: 400 },
      );
    }

    // Check if provider has active messages
    const { data: activeMessages } = await supabase
      .from('sms_messages')
      .select('id')
      .eq('provider_id', providerId)
      .in('status', ['queued', 'sending'])
      .limit(1);

    if (activeMessages && activeMessages.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROVIDER_IN_USE',
            message: 'Cannot delete provider with active messages',
          },
        },
        { status: 409 },
      );
    }

    // Delete provider
    const { error } = await supabase
      .from('sms_providers')
      .delete()
      .eq('id', providerId);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          provider_id: providerId,
          deleted_at: new Date().toISOString(),
        },
        metadata: {
          timestamp: new Date().toISOString(),
          request_id: `provider_delete_${Date.now()}`,
          user_id: session.user.id,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete SMS provider',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      },
      { status: 500 },
    );
  }
}
