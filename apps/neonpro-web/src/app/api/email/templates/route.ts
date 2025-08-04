import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import EmailService from '@/app/lib/services/email-service';
import { EmailTemplateSchema } from '@/app/types/email';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const isActive = url.searchParams.get('isActive');
    const search = url.searchParams.get('search');

    const emailService = new EmailService(supabase, profile.clinic_id);
    
    const filters: any = {};
    if (category) filters.category = category;
    if (isActive !== null) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    const templates = await emailService.getTemplates(filters);

    return NextResponse.json(templates);

  } catch (error) {
    console.error('Get email templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('clinic_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    try {
      EmailTemplateSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed',
            details: validationError.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    const emailService = new EmailService(supabase, profile.clinic_id);
    
    const template = await emailService.createTemplate({
      ...body,
      clinicId: profile.clinic_id,
      createdBy: session.user.id,
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('Create email template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}