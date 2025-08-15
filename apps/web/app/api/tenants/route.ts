import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para query parameters
const querySchema = z.object({
  include_products: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
});

/**
 * GET /api/tenants
 * Lista todos os tenants com opção de incluir produtos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const tenants = await prisma.tenant.findMany({
      take: query.limit,
      skip: query.offset,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        products: query.include_products ? {
          where: {
            is_active: true,
          },
          orderBy: {
            name: 'asc',
          },
        } : false,
        _count: {
          select: {
            products: true,
            profiles: true,
          },
        },
      },
    });

    // Transformar dados para formato mais amigável
    const transformedTenants = tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      logo_url: tenant.logo_url,
      website_url: tenant.website_url,
      contact_email: tenant.contact_email,
      contact_phone: tenant.contact_phone,
      subscription_plan: tenant.subscription_plan,
      subscription_status: tenant.subscription_status,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
      products: query.include_products ? tenant.products : undefined,
      stats: {
        total_products: tenant._count.products,
        total_users: tenant._count.profiles,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedTenants,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: transformedTenants.length,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar tenants:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants
 * Cria um novo tenant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const tenantSchema = z.object({
      name: z.string().min(1, 'Nome é obrigatório'),
      slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
      description: z.string().optional(),
      logo_url: z.string().url().optional(),
      website_url: z.string().url().optional(),
      contact_email: z.string().email().optional(),
      contact_phone: z.string().optional(),
      subscription_plan: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
    });

    const validatedData = tenantSchema.parse(body);

    const tenant = await prisma.tenant.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            products: true,
            profiles: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...tenant,
          stats: {
            total_products: tenant._count.products,
            total_users: tenant._count.profiles,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar tenant:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Erro de slug duplicado
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug já existe',
          message: 'Este slug já está sendo usado por outro tenant',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}