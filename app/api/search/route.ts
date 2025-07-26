// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { unifiedSearchSystem, SearchQuery } from "@/lib/search/unified-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query: SearchQuery = {
      term: searchParams.get('q') || '',
      filters: {
        types: searchParams.get('types')?.split(',') as any[] || undefined,
        dateRange: searchParams.get('dateFrom') && searchParams.get('dateTo') ? {
          start: new Date(searchParams.get('dateFrom')!),
          end: new Date(searchParams.get('dateTo')!)
        } : undefined,
        patientId: searchParams.get('patientId') || undefined,
        status: searchParams.get('status')?.split(',') || undefined,
        priority: searchParams.get('priority')?.split(',') || undefined
      },
      options: {
        limit: parseInt(searchParams.get('limit') || '20'),
        offset: parseInt(searchParams.get('offset') || '0'),
        sortBy: searchParams.get('sortBy') || 'relevance',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        fuzzy: searchParams.get('fuzzy') === 'true',
        highlight: searchParams.get('highlight') === 'true'
      }
    };

    const response = await unifiedSearchSystem.search(query);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Erro na API de busca:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { action, ...data } = body;

    switch (action) {
      case 'advanced_search':
        const response = await unifiedSearchSystem.advancedSearch(data.criteria);
        return NextResponse.json({
          success: true,
          data: response
        });

      case 'save_search':
        const savedId = await unifiedSearchSystem.saveSearch(
          data.name,
          data.query,
          data.userId
        );
        return NextResponse.json({
          success: true,
          data: { id: savedId }
        });

      case 'get_statistics':
        const stats = await unifiedSearchSystem.getSearchStatistics(data.timeframe);
        return NextResponse.json({
          success: true,
          data: stats
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação não reconhecida'
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na API de busca (POST):', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}
