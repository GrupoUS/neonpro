import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailProviderConfigSchema } from '@/app/types/email';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Buscar configuração específica
    const { data: config } = await supabase
      .from('email_provider_configs')
      .select('*')
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .single();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(config);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validar dados de configuração (parcial)
    const partialSchema = EmailProviderConfigSchema.partial();
    const validatedConfig = partialSchema.parse(body);

    // Atualizar configuração
    const { data: config, error } = await supabase
      .from('email_provider_configs')
      .update({
        ...validatedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // Deletar configuração
    const { error } = await supabase
      .from('email_provider_configs')
      .delete()
      .eq('id', id)
      .eq('clinic_id', profile.clinic_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
