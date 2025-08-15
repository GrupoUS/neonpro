import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EmailProviderConfigSchema } from '@/app/types/email';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(_request: NextRequest) {
  try {
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

    // Buscar configurações de email
    const { data: configs } = await supabase
      .from('email_provider_configs')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .order('created_at', { ascending: false });

    return NextResponse.json(configs || []);
  } catch (error) {
    console.error('Get email config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validar dados de configuração
    const validatedConfig = EmailProviderConfigSchema.parse(body);

    // Inserir nova configuração
    const { data: config, error } = await supabase
      .from('email_provider_configs')
      .insert({
        clinic_id: profile.clinic_id,
        provider: validatedConfig.provider,
        config: validatedConfig.config,
        is_active: validatedConfig.is_active,
        priority: validatedConfig.priority,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Create email config error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
