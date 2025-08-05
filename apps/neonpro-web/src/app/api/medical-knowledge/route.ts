// Medical Knowledge Base Main API Endpoints
// Story 9.5: API endpoints for medical knowledge base management

import type { MedicalKnowledgeBaseService } from "@/app/lib/services/medical-knowledge-base";
import type { createClient } from "@/lib/supabase/server";
import type { NextRequest, NextResponse } from "next/server";

const service = new MedicalKnowledgeBaseService();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "dashboard":
        const dashboard = await service.getKnowledgeBaseDashboard();
        return NextResponse.json({ success: true, data: dashboard });

      case "sources":
        const statusFilter = searchParams.get("status") || undefined;
        const typeFilter = searchParams.get("type") || undefined;
        const sources = await service.getKnowledgeSources({
          status: statusFilter,
          source_type: typeFilter,
        });
        return NextResponse.json({ success: true, data: sources });

      case "knowledge":
        const knowledgeId = searchParams.get("id");
        if (knowledgeId) {
          const knowledge = await service.getMedicalKnowledgeById(knowledgeId);
          if (!knowledge) {
            return NextResponse.json({ error: "Knowledge not found" }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: knowledge });
        }

        // Search medical knowledge
        const searchQuery = {
          query: searchParams.get("query") || undefined,
          filters: {
            knowledge_type: searchParams.get("knowledge_type")?.split(",") || [],
            evidence_level: searchParams.get("evidence_level")?.split(",") || [],
            medical_categories: searchParams.get("medical_categories")?.split(",") || [],
            quality_threshold: searchParams.get("quality_threshold")
              ? parseFloat(searchParams.get("quality_threshold")!)
              : undefined,
            date_range: {
              start: searchParams.get("date_start") || undefined,
              end: searchParams.get("date_end") || undefined,
            },
          },
          sort: {
            field: (searchParams.get("sort_field") || "quality_score") as any,
            direction: (searchParams.get("sort_direction") || "desc") as "asc" | "desc",
          },
          pagination: {
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "20"),
          },
        };

        const searchResults = await service.searchMedicalKnowledge(searchQuery);
        return NextResponse.json({ success: true, data: searchResults });

      case "guidelines":
        const specialty = searchParams.get("specialty") || undefined;
        const guidelineStatus = searchParams.get("status") || undefined;
        const conditions = searchParams.get("conditions")?.split(",") || undefined;

        const guidelines = await service.getMedicalGuidelines({
          specialty,
          status: guidelineStatus,
          conditions,
        });
        return NextResponse.json({ success: true, data: guidelines });

      case "guideline":
        const guidelineId = searchParams.get("id");
        if (!guidelineId) {
          return NextResponse.json({ error: "Guideline ID required" }, { status: 400 });
        }

        const guideline = await service.getGuidelineById(guidelineId);
        if (!guideline) {
          return NextResponse.json({ error: "Guideline not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: guideline });

      case "evidence-levels":
        const evidenceLevels = await service.getEvidenceLevels();
        return NextResponse.json({ success: true, data: evidenceLevels });

      case "knowledge-types":
        const knowledgeTypes = await service.getKnowledgeTypes();
        return NextResponse.json({ success: true, data: knowledgeTypes });

      case "categories":
        const categories = await service.getMedicalCategories();
        return NextResponse.json({ success: true, data: categories });

      case "cache":
        const cacheQuery = searchParams.get("query");
        const sourceId = searchParams.get("source_id") || undefined;

        if (!cacheQuery) {
          return NextResponse.json({ error: "Query required for cache lookup" }, { status: 400 });
        }

        const cachedResults = await service.getCachedSearchResults(cacheQuery, sourceId);
        return NextResponse.json({
          success: true,
          data: cachedResults,
          cached: !!cachedResults,
        });

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Medical Knowledge Base API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "create-source":
        const source = await service.createKnowledgeSource(data);
        return NextResponse.json({ success: true, data: source }, { status: 201 });

      case "create-knowledge":
        const knowledge = await service.createMedicalKnowledge(data);
        return NextResponse.json({ success: true, data: knowledge }, { status: 201 });

      case "validate-evidence":
        const validationResult = await service.validateRecommendation(data);
        return NextResponse.json({ success: true, data: validationResult });

      case "cache-results":
        const cachedData = await service.cacheSearchResults(data);
        return NextResponse.json({ success: true, data: cachedData }, { status: 201 });

      case "trigger-sync":
        const { source_id, force_full } = data;
        if (!source_id) {
          return NextResponse.json({ error: "Source ID required" }, { status: 400 });
        }

        await service.triggerSync(source_id, force_full || false);
        return NextResponse.json({ success: true, message: "Sync triggered successfully" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Medical Knowledge Base API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required for update operations" }, { status: 400 });
    }

    switch (action) {
      case "update-source":
        const updatedSource = await service.updateKnowledgeSource(id, data);
        return NextResponse.json({ success: true, data: updatedSource });

      case "update-knowledge":
        const updatedKnowledge = await service.updateMedicalKnowledge(id, data);
        return NextResponse.json({ success: true, data: updatedKnowledge });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Medical Knowledge Base API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id) {
      return NextResponse.json({ error: "ID required for delete operations" }, { status: 400 });
    }

    switch (action) {
      case "delete-source":
        await service.deleteKnowledgeSource(id);
        return NextResponse.json({
          success: true,
          message: "Knowledge source deleted successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Medical Knowledge Base API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
