// Drug Search and Interaction API Endpoints
// Story 9.5: API endpoints for drug information and interaction checking

import { MedicalKnowledgeBaseService } from '@/app/lib/services/medical-knowledge-base';
import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const service = new MedicalKnowledgeBaseService();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'search':
        const searchQuery = {
          drug_name: searchParams.get('drug_name') || undefined,
          generic_name: searchParams.get('generic_name') || undefined,
          drug_class: searchParams.get('drug_class') || undefined,
          indication: searchParams.get('indication') || undefined,
          interaction_check: searchParams.get('interaction_check')?.split(',') || undefined,
        };

        const searchResults = await service.searchDrugs(searchQuery);
        return NextResponse.json({ success: true, data: searchResults });

      case 'drug':
        const drugId = searchParams.get('id');
        if (!drugId) {
          return NextResponse.json({ error: 'Drug ID required' }, { status: 400 });
        }
        
        const drug = await service.getDrugById(drugId);
        if (!drug) {
          return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: drug });

      case 'interactions':
        const drugIds = searchParams.get('drug_ids')?.split(',');
        if (!drugIds || drugIds.length < 2) {
          return NextResponse.json({ 
            error: 'At least 2 drug IDs required for interaction check' 
          }, { status: 400 });
        }
        
        const interactions = await service.checkDrugInteractions(drugIds);
        return NextResponse.json({ success: true, data: interactions });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Drug Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'batch-search':
        // Allow searching for multiple drugs at once
        const { queries } = data;
        if (!Array.isArray(queries)) {
          return NextResponse.json({ error: 'Queries must be an array' }, { status: 400 });
        }

        const batchResults = await Promise.all(
          queries.map(query => service.searchDrugs(query))
        );
        
        return NextResponse.json({ success: true, data: batchResults });

      case 'complex-interaction-check':
        // Check interactions for complex drug combinations
        const { drug_combinations, patient_factors } = data;
        
        if (!Array.isArray(drug_combinations) || drug_combinations.length === 0) {
          return NextResponse.json({ 
            error: 'Drug combinations required' 
          }, { status: 400 });
        }

        const complexInteractions = await Promise.all(
          drug_combinations.map(combo => service.checkDrugInteractions(combo))
        );

        // Flatten and deduplicate interactions
        const allInteractions = complexInteractions.flat();
        const uniqueInteractions = allInteractions.filter((interaction, index, arr) => 
          arr.findIndex(i => i.id === interaction.id) === index
        );

        return NextResponse.json({ 
          success: true, 
          data: {
            interactions: uniqueInteractions,
            combination_count: drug_combinations.length,
            patient_factors: patient_factors || {},
            risk_assessment: {
              total_interactions: uniqueInteractions.length,
              high_severity: uniqueInteractions.filter(i => i.severity_level >= 8).length,
              moderate_severity: uniqueInteractions.filter(i => i.severity_level >= 5 && i.severity_level < 8).length,
              low_severity: uniqueInteractions.filter(i => i.severity_level < 5).length,
            }
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Drug Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
