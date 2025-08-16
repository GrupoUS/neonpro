// app/api/search/route.ts

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import {
  type SearchQuery,
  unifiedSearchSystem,
} from '@/lib/search/unified-search';

export async function GET(request: NextRequest) {
  try {
    // Get authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    // Check for NLP/conversational search
    const searchType = searchParams.get('type') || 'traditional';
    const naturalQuery = searchParams.get('q') || searchParams.get('query');

    if (searchType === 'conversational' && naturalQuery) {
      // Use conversational search for natural language queries
      const response = await unifiedSearchSystem.conversationalSearch(
        naturalQuery,
        session.user.id,
        'user',
      );

      return NextResponse.json({
        success: true,
        data: response,
        type: 'conversational',
      });
    }

    if (searchType === 'smart' && naturalQuery) {
      // Use smart search with NLP analysis
      const response = await unifiedSearchSystem.smartSearch(
        naturalQuery,
        {
          userId: session.user.id,
          userRole: 'user',
          recentSearches: [], // Could be loaded from database
        },
        {
          limit: Number.parseInt(searchParams.get('limit') || '20', 10),
        },
      );

      return NextResponse.json({
        success: true,
        data: response,
        type: 'smart',
      });
    }

    // Traditional structured search
    const query: SearchQuery = {
      term: naturalQuery || '',
      filters: {
        types: (searchParams.get('types')?.split(',') as any[]) || undefined,
        dateRange:
          searchParams.get('dateFrom') && searchParams.get('dateTo')
            ? {
                start: new Date(searchParams.get('dateFrom')!),
                end: new Date(searchParams.get('dateTo')!),
              }
            : undefined,
        patientId: searchParams.get('patientId') || undefined,
        status: searchParams.get('status')?.split(',') || undefined,
        priority: searchParams.get('priority')?.split(',') || undefined,
      },
      options: {
        limit: Number.parseInt(searchParams.get('limit') || '20', 10),
        offset: Number.parseInt(searchParams.get('offset') || '0', 10),
        sortBy: searchParams.get('sortBy') || 'relevance',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        fuzzy: searchParams.get('fuzzy') === 'true',
        highlight: searchParams.get('highlight') === 'true',
        useNLP: searchParams.get('nlp') !== 'false', // Enable NLP by default
      },
    };

    const response = await unifiedSearchSystem.search(query);

    // Log search analytics (async, don't wait)
    logSearchAnalytics(
      session.user.id,
      query.term,
      'traditional',
      response.totalCount,
    ).catch((_error: any) => {});

    return NextResponse.json({
      success: true,
      data: response,
      type: 'traditional',
    });
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { action, ...data } = body;

    switch (action) {
      case 'advanced_search': {
        const response = await unifiedSearchSystem.advancedSearch(
          data.criteria,
        );
        return NextResponse.json({
          success: true,
          data: response,
        });
      }

      case 'save_search': {
        const savedId = await unifiedSearchSystem.saveSearch(
          data.name,
          data.query,
          data.userId,
        );
        return NextResponse.json({
          success: true,
          data: { id: savedId },
        });
      }

      case 'get_statistics': {
        const stats = await unifiedSearchSystem.getSearchStatistics(
          data.timeframe,
        );
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação não reconhecida',
          },
          { status: 400 },
        );
    }
  } catch (_error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}

/**
 * Log search analytics for performance monitoring and insights
 */
async function logSearchAnalytics(
  userId: string,
  query: string,
  searchType: string,
  resultCount: number,
): Promise<void> {
  try {
    const supabase = await createClient();

    // Check if search_analytics table exists, if not create it silently
    await supabase.from('search_analytics').insert({
      user_id: userId,
      query: query.substring(0, 500), // Limit query length
      search_type: searchType,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
      metadata: {
        execution_time: 0, // Could be passed from search execution
      },
    });
  } catch (_error) {}
}
