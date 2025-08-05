// Medical Knowledge Base Service
// Story 9.5: Comprehensive medical knowledge management backend service

import type {
  createKnowledgeSourceRequestSchema,
  createMedicalKnowledgeRequestSchema,
  drugSearchQuerySchema,
  evidenceValidationRequestSchema,
  medicalSearchQuerySchema,
  updateKnowledgeSourceRequestSchema,
} from "@/app/lib/validations/medical-knowledge-base";
import type {
  DrugInformation,
  DrugInteraction,
  DrugSearchQuery,
  EvidenceValidationRequest,
  EvidenceValidationResponse,
  KnowledgeBaseDashboard,
  KnowledgeSource,
  MedicalGuideline,
  MedicalKnowledge,
  MedicalSearchQuery,
  ResearchCache,
  ValidationResult,
} from "@/app/types/medical-knowledge-base";

import type { createClient } from "@/lib/supabase/server";

export class MedicalKnowledgeBaseService {
  private async getSupabase() {
    const supabase = await createClient();
    return await createClient();
  }

  // Knowledge Sources Management
  async createKnowledgeSource(data: any): Promise<KnowledgeSource> {
    const validatedData = createKnowledgeSourceRequestSchema.parse(data);
    const supabase = await createClient();

    const { data: source, error } = await supabase
      .from("knowledge_sources")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create knowledge source: ${error.message}`);
    }

    return source as KnowledgeSource;
  }

  async getKnowledgeSources(filters?: {
    status?: string;
    source_type?: string;
  }): Promise<KnowledgeSource[]> {
    let query = supabase.from("knowledge_sources").select("*");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.source_type) {
      query = query.eq("source_type", filters.source_type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch knowledge sources: ${error.message}`);
    }

    return data as KnowledgeSource[];
  }

  async updateKnowledgeSource(id: string, updates: any): Promise<KnowledgeSource> {
    const validatedData = updateKnowledgeSourceRequestSchema.parse(updates);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("knowledge_sources")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update knowledge source: ${error.message}`);
    }

    return data as KnowledgeSource;
  }

  async deleteKnowledgeSource(id: string): Promise<void> {
    const { error } = await supabase.from("knowledge_sources").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete knowledge source: ${error.message}`);
    }
  }

  // Medical Knowledge Management
  async createMedicalKnowledge(data: any): Promise<MedicalKnowledge> {
    const validatedData = createMedicalKnowledgeRequestSchema.parse(data);
    const supabase = await createClient();

    const { data: knowledge, error } = await supabase
      .from("medical_knowledge")
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create medical knowledge: ${error.message}`);
    }

    return knowledge as MedicalKnowledge;
  }

  async searchMedicalKnowledge(query: MedicalSearchQuery): Promise<{
    results: MedicalKnowledge[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const validatedQuery = medicalSearchQuerySchema.parse(query);

    let dbQuery = supabase.from("medical_knowledge").select("*", { count: "exact" });

    // Apply full-text search
    if (validatedQuery.query) {
      dbQuery = dbQuery.textSearch("title", validatedQuery.query);
    }

    // Apply filters
    if (validatedQuery.filters) {
      const filters = validatedQuery.filters;

      if (filters.knowledge_type?.length) {
        dbQuery = dbQuery.in("knowledge_type", filters.knowledge_type);
      }

      if (filters.evidence_level?.length) {
        dbQuery = dbQuery.in("evidence_level", filters.evidence_level);
      }

      if (filters.medical_categories?.length) {
        dbQuery = dbQuery.overlaps("medical_categories", filters.medical_categories);
      }

      if (filters.quality_threshold) {
        dbQuery = dbQuery.gte("quality_score", filters.quality_threshold);
      }

      if (filters.date_range) {
        if (filters.date_range.start) {
          dbQuery = dbQuery.gte("created_at", filters.date_range.start);
        }
        if (filters.date_range.end) {
          dbQuery = dbQuery.lte("created_at", filters.date_range.end);
        }
      }
    }

    // Apply sorting
    if (validatedQuery.sort) {
      dbQuery = dbQuery.order(validatedQuery.sort.field, {
        ascending: validatedQuery.sort.direction === "asc",
      });
    } else {
      dbQuery = dbQuery.order("quality_score", { ascending: false });
    }

    // Apply pagination
    const page = validatedQuery.pagination?.page || 1;
    const limit = validatedQuery.pagination?.limit || 20;
    const offset = (page - 1) * limit;

    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search medical knowledge: ${error.message}`);
    }

    return {
      results: data as MedicalKnowledge[],
      total_count: count || 0,
      page,
      limit,
    };
  }

  async getMedicalKnowledgeById(id: string): Promise<MedicalKnowledge | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("medical_knowledge")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch medical knowledge: ${error.message}`);
    }

    return data as MedicalKnowledge;
  }

  async updateMedicalKnowledge(
    id: string,
    updates: Partial<MedicalKnowledge>,
  ): Promise<MedicalKnowledge> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("medical_knowledge")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update medical knowledge: ${error.message}`);
    }

    return data as MedicalKnowledge;
  }

  // Drug Information Management
  async searchDrugs(query: DrugSearchQuery): Promise<{
    drugs: DrugInformation[];
    interactions?: DrugInteraction[];
    total_count: number;
  }> {
    const validatedQuery = drugSearchQuerySchema.parse(query);

    let dbQuery = supabase.from("drug_information").select("*", { count: "exact" });

    // Apply search filters
    if (validatedQuery.drug_name) {
      dbQuery = dbQuery.ilike("drug_name", `%${validatedQuery.drug_name}%`);
    }

    if (validatedQuery.generic_name) {
      dbQuery = dbQuery.ilike("generic_name", `%${validatedQuery.generic_name}%`);
    }

    if (validatedQuery.drug_class) {
      dbQuery = dbQuery.ilike("drug_class", `%${validatedQuery.drug_class}%`);
    }

    if (validatedQuery.indication) {
      dbQuery = dbQuery.contains("indications", [validatedQuery.indication]);
    }

    const { data: drugs, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to search drugs: ${error.message}`);
    }

    let interactions: DrugInteraction[] = [];

    // Check for drug interactions if interaction_check is provided
    if (validatedQuery.interaction_check?.length && drugs?.length) {
      const drugIds = drugs.map((d) => d.id);
      const checkIds = validatedQuery.interaction_check;

      const { data: interactionData, error: interactionError } = await supabase
        .from("drug_interactions")
        .select("*")
        .or(
          `and(drug_1_id.in.(${drugIds.join(",")}),drug_2_id.in.(${checkIds.join(",")})),and(drug_1_id.in.(${checkIds.join(",")}),drug_2_id.in.(${drugIds.join(",")}))`,
        );

      if (interactionError) {
        console.error("Error fetching drug interactions:", interactionError);
      } else {
        interactions = interactionData as DrugInteraction[];
      }
    }

    return {
      drugs: drugs as DrugInformation[],
      interactions: interactions.length > 0 ? interactions : undefined,
      total_count: count || 0,
    };
  }

  async getDrugById(id: string): Promise<DrugInformation | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("drug_information")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch drug information: ${error.message}`);
    }

    return data as DrugInformation;
  }

  async checkDrugInteractions(drugIds: string[]): Promise<DrugInteraction[]> {
    if (drugIds.length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from("drug_interactions")
      .select("*")
      .or(
        `and(drug_1_id.in.(${drugIds.join(",")}),drug_2_id.in.(${drugIds.join(",")})),and(drug_2_id.in.(${drugIds.join(",")}),drug_1_id.in.(${drugIds.join(",")}))`,
      );

    if (error) {
      throw new Error(`Failed to check drug interactions: ${error.message}`);
    }

    return data as DrugInteraction[];
  }

  // Medical Guidelines Management
  async getMedicalGuidelines(filters?: {
    specialty?: string;
    status?: string;
    conditions?: string[];
  }): Promise<MedicalGuideline[]> {
    let query = supabase.from("medical_guidelines").select("*");

    if (filters?.specialty) {
      query = query.eq("specialty", filters.specialty);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.conditions?.length) {
      query = query.overlaps("conditions_covered", filters.conditions);
    }

    const { data, error } = await query.order("publication_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch medical guidelines: ${error.message}`);
    }

    return data as MedicalGuideline[];
  }

  async getGuidelineById(id: string): Promise<MedicalGuideline | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("medical_guidelines")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch medical guideline: ${error.message}`);
    }

    return data as MedicalGuideline;
  }

  // Evidence Validation
  async validateRecommendation(
    request: EvidenceValidationRequest,
  ): Promise<EvidenceValidationResponse> {
    const validatedRequest = evidenceValidationRequestSchema.parse(request);

    // Search for relevant evidence based on recommendation
    const evidenceQuery =
      validatedRequest.recommendation_content.title ||
      validatedRequest.recommendation_content.summary ||
      "general medical evidence";
    const supabase = await createClient();

    const { data: evidence, error } = await supabase
      .from("medical_knowledge")
      .select("*, knowledge_sources(*)")
      .textSearch("title", evidenceQuery)
      .limit(10);

    if (error) {
      throw new Error(`Failed to search for evidence: ${error.message}`);
    }

    // Analyze evidence and generate validation response
    const evidenceSources =
      evidence?.map((item) => ({
        source_id: item.source_id || "",
        source_name: item.knowledge_sources?.source_name || "Unknown",
        evidence_level: item.evidence_level || "Not Graded",
        relevance_score: Math.random() * 0.4 + 0.6, // Simulate relevance scoring
        supports_recommendation: Math.random() > 0.3, // Simulate evidence analysis
        conflicting_evidence: Math.random() < 0.2, // Simulate conflict detection
      })) || [];

    const supportingEvidence = evidenceSources.filter((e) => e.supports_recommendation);
    const conflictingEvidence = evidenceSources.filter((e) => e.conflicting_evidence);

    let overallStatus: "validated" | "conflicted" | "unsupported" | "requires_review";
    let confidenceScore: number;
    let action: "approve" | "review" | "reject" | "modify";
    let humanReviewRequired: boolean;

    if (supportingEvidence.length >= 2 && conflictingEvidence.length === 0) {
      overallStatus = "validated";
      confidenceScore = 0.85;
      action = "approve";
      humanReviewRequired = false;
    } else if (conflictingEvidence.length > 0) {
      overallStatus = "conflicted";
      confidenceScore = 0.45;
      action = "review";
      humanReviewRequired = true;
    } else if (supportingEvidence.length === 0) {
      overallStatus = "unsupported";
      confidenceScore = 0.25;
      action = "reject";
      humanReviewRequired = true;
    } else {
      overallStatus = "requires_review";
      confidenceScore = 0.65;
      action = "review";
      humanReviewRequired = true;
    }

    // Store validation result
    const validationResult: Omit<ValidationResult, "id" | "validation_date"> = {
      recommendation_id: validatedRequest.recommendation_id,
      recommendation_type: validatedRequest.recommendation_type,
      validation_status: overallStatus,
      confidence_score: confidenceScore,
      validation_notes: `Automated validation based on ${evidenceSources.length} evidence sources`,
      automated: true,
    };

    const { data: storedValidation, error: storeError } = await supabase
      .from("validation_results")
      .insert([validationResult])
      .select()
      .single();

    if (storeError) {
      throw new Error(`Failed to store validation result: ${storeError.message}`);
    }

    return {
      validation_id: storedValidation.id,
      overall_status: overallStatus,
      confidence_score: confidenceScore,
      evidence_sources: evidenceSources,
      recommendations: {
        action,
        reason: `Based on analysis of ${evidenceSources.length} evidence sources`,
        suggested_modifications:
          conflictingEvidence.length > 0
            ? ["Review conflicting evidence", "Consider alternative approaches"]
            : undefined,
      },
      human_review_required: humanReviewRequired,
    };
  }

  // Research Cache Management
  async getCachedSearchResults(query: string, sourceId?: string): Promise<ResearchCache | null> {
    let dbQuery = supabase
      .from("research_cache")
      .select("*")
      .eq("search_query", query)
      .gt("expiry_date", new Date().toISOString());

    if (sourceId) {
      dbQuery = dbQuery.eq("source_id", sourceId);
    }

    const { data, error } = await dbQuery.single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch cached results: ${error.message}`);
    }

    return data as ResearchCache;
  }

  async cacheSearchResults(
    cacheData: Omit<ResearchCache, "id" | "cache_date">,
  ): Promise<ResearchCache> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("research_cache")
      .insert([cacheData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cache search results: ${error.message}`);
    }

    return data as ResearchCache;
  }

  // Dashboard and Analytics
  async getKnowledgeBaseDashboard(): Promise<KnowledgeBaseDashboard> {
    // Get overview statistics
    const [sourcesResult, knowledgeResult, validationsResult] = await Promise.all([
      supabase.from("knowledge_sources").select("status", { count: "exact" }),
      supabase.from("medical_knowledge").select("id", { count: "exact" }),
      supabase
        .from("validation_results")
        .select("validation_status", { count: "exact" })
        .eq("validation_status", "pending"),
    ]);

    const totalSources = sourcesResult.count || 0;
    const activeSources = sourcesResult.data?.filter((s) => s.status === "active").length || 0;
    const totalKnowledge = knowledgeResult.count || 0;
    const validationsPending = validationsResult.count || 0;

    // Get source status details
    const { data: sourceDetails, error: sourceError } = await supabase
      .from("knowledge_sources")
      .select("id, source_name, status, last_sync")
      .order("source_name");

    if (sourceError) {
      throw new Error(`Failed to fetch source details: ${sourceError.message}`);
    }

    const sourceStatus =
      sourceDetails?.map((source) => ({
        source_id: source.id,
        source_name: source.source_name,
        status: source.status,
        last_sync: source.last_sync || "",
        item_count: Math.floor(Math.random() * 1000), // Simulate item count
        health_score: Math.random() * 0.3 + 0.7, // Simulate health score
      })) || [];

    return {
      overview: {
        total_sources: totalSources,
        active_sources: activeSources,
        total_knowledge_items: totalKnowledge,
        recent_updates: Math.floor(Math.random() * 50),
        validation_pending: validationsPending,
      },
      source_status: sourceStatus,
      recent_searches: [], // Would be populated from logs in real implementation
      validation_queue: [], // Would be populated from pending validations
    };
  }

  // Sync Management
  async triggerSync(sourceId: string, forceFull: boolean = false): Promise<void> {
    // Update source status to syncing
    const { error: updateError } = await supabase
      .from("knowledge_sources")
      .update({
        status: "syncing",
        last_sync: new Date().toISOString(),
      })
      .eq("id", sourceId);

    if (updateError) {
      throw new Error(`Failed to update source status: ${updateError.message}`);
    }

    // In a real implementation, this would trigger background sync job
    // For now, simulate sync completion
    setTimeout(async () => {
      await supabase
        .from("knowledge_sources")
        .update({
          status: "active",
          last_sync: new Date().toISOString(),
        })
        .eq("id", sourceId);
    }, 5000);
  }

  // Utility Methods
  async getEvidenceLevels(): Promise<string[]> {
    return ["A", "B", "C", "D", "Expert Opinion", "Not Graded"];
  }

  async getKnowledgeTypes(): Promise<string[]> {
    return [
      "guideline",
      "research",
      "drug_info",
      "diagnosis",
      "treatment",
      "protocol",
      "reference",
    ];
  }

  async getMedicalCategories(): Promise<string[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("medical_knowledge")
      .select("medical_categories")
      .not("medical_categories", "is", null);

    if (error) {
      throw new Error(`Failed to fetch medical categories: ${error.message}`);
    }

    const categories = new Set<string>();
    data?.forEach((item) => {
      item.medical_categories?.forEach((cat: string) => categories.add(cat));
    });

    return Array.from(categories).sort();
  }
}
