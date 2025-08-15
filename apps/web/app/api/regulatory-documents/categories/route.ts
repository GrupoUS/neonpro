import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/app/utils/supabase/server';

// Request validation schemas
const ListCategoriesSchema = z.object({
  authority: z.string().optional(),
  search: z.string().optional(),
});

// GET /api/regulatory-documents/categories - List regulation categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { authority, search } = ListCategoriesSchema.parse(queryParams);

    // Build query with filters
    let query = supabase
      .from('regulation_categories')
      .select('*')
      .eq('is_active', true)
      .order('authority_name', { ascending: true })
      .order('name', { ascending: true });

    // Apply filters
    if (authority) {
      query = query.eq('authority_name', authority);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,authority_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching regulation categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Group categories by authority for better UX
    const groupedCategories = categories?.reduce(
      (acc, category) => {
        const authority = category.authority_name;
        if (!acc[authority]) {
          acc[authority] = [];
        }
        acc[authority].push(category);
        return acc;
      },
      {} as Record<string, typeof categories>
    );

    return NextResponse.json({
      categories: categories || [],
      groupedCategories: groupedCategories || {},
    });
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/regulatory-documents/categories/authorities - List unique authorities
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authorities, error } = await supabase
      .from('regulation_categories')
      .select('authority_name, authority_code')
      .eq('is_active', true)
      .order('authority_name');

    if (error) {
      console.error('Error fetching authorities:', error);
      return NextResponse.json(
        { error: 'Failed to fetch authorities' },
        { status: 500 }
      );
    }

    // Get unique authorities
    const uniqueAuthorities = authorities?.reduce(
      (acc, item) => {
        const existing = acc.find(
          (a) => a.authority_name === item.authority_name
        );
        if (!existing) {
          acc.push({
            authority_name: item.authority_name,
            authority_code: item.authority_code,
          });
        }
        return acc;
      },
      [] as { authority_name: string; authority_code: string }[]
    );

    return NextResponse.json({
      authorities: uniqueAuthorities || [],
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
