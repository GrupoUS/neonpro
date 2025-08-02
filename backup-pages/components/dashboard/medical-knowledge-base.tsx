// Medical Knowledge Base Dashboard Component
// Story 9.5: Comprehensive medical knowledge base management interface

"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import {
  KnowledgeBaseDashboard as DashboardData,
  DrugInformation,
  DrugInteraction,
  EvidenceValidationRequest,
  KnowledgeSource,
  MedicalGuideline,
  MedicalKnowledge,
  ValidationResult,
} from "@/app/types/medical-knowledge-base";

interface MedicalKnowledgeBaseDashboardProps {
  initialData?: DashboardData;
}

export default function MedicalKnowledgeBaseDashboard({
  initialData,
}: MedicalKnowledgeBaseDashboardProps) {
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    initialData || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MedicalKnowledge[]>([]);
  const [drugSearchResults, setDrugSearchResults] = useState<DrugInformation[]>(
    []
  );
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>(
    []
  );
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );
  const [guidelines, setGuidelines] = useState<MedicalGuideline[]>([]);
  const [validationQueue, setValidationQueue] = useState<ValidationResult[]>(
    []
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Filters
  const [knowledgeFilter, setKnowledgeFilter] = useState({
    knowledge_type: "",
    evidence_level: "",
    medical_categories: "",
    quality_threshold: "",
  });

  const [drugFilter, setDrugFilter] = useState({
    drug_class: "",
    indication: "",
    interaction_check: "",
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/medical-knowledge?action=dashboard");
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search medical knowledge
  const searchMedicalKnowledge = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        action: "knowledge",
        query: searchQuery,
        ...knowledgeFilter,
      });

      const response = await fetch(`/api/medical-knowledge?${params}`);
      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data.results);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search medical knowledge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search drugs
  const searchDrugs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        action: "search",
        drug_name: searchQuery,
        ...drugFilter,
      });

      const response = await fetch(`/api/medical-knowledge/drugs?${params}`);
      if (response.ok) {
        const result = await response.json();
        setDrugSearchResults(result.data.drugs);
        if (result.data.interactions) {
          setDrugInteractions(result.data.interactions);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search drugs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load knowledge sources
  const loadKnowledgeSources = async () => {
    try {
      const response = await fetch("/api/medical-knowledge?action=sources");
      if (response.ok) {
        const result = await response.json();
        setKnowledgeSources(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load knowledge sources",
        variant: "destructive",
      });
    }
  };

  // Load guidelines
  const loadGuidelines = async () => {
    try {
      const response = await fetch("/api/medical-knowledge?action=guidelines");
      if (response.ok) {
        const result = await response.json();
        setGuidelines(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load guidelines",
        variant: "destructive",
      });
    }
  };

  // Load validation queue
  const loadValidationQueue = async () => {
    try {
      const response = await fetch(
        "/api/medical-knowledge/validation?action=pending-validations"
      );
      if (response.ok) {
        const result = await response.json();
        setValidationQueue(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load validation queue",
        variant: "destructive",
      });
    }
  };

  // Trigger sync for a source
  const triggerSync = async (sourceId: string) => {
    try {
      const response = await fetch("/api/medical-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger-sync",
          data: { source_id: sourceId, force_full: false },
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sync triggered successfully",
        });
        loadKnowledgeSources();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger sync",
        variant: "destructive",
      });
    }
  };

  // Validate evidence
  const validateEvidence = async (
    validationRequest: EvidenceValidationRequest
  ) => {
    try {
      const response = await fetch("/api/medical-knowledge/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-recommendation",
          data: validationRequest,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Evidence validation completed",
        });
        return result.data;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate evidence",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!dashboardData) {
      loadDashboardData();
    }
    loadKnowledgeSources();
    loadGuidelines();
    loadValidationQueue();
  }, []);

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "syncing":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (level: number) => {
    if (level >= 8) return "bg-red-100 text-red-800";
    if (level >= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Knowledge Base</h1>
          <p className="text-muted-foreground">
            Evidence-based medical information and drug interaction management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {dashboardData.overview.total_sources}
                </span>
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {dashboardData.overview.active_sources}
                </span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Knowledge Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {dashboardData.overview.total_knowledge_items}
                </span>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {dashboardData.overview.recent_updates}
                </span>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Validation Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {dashboardData.overview.validation_pending}
                </span>
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="drugs">Drugs</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Source Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.source_status.map((source) => (
                    <div
                      key={source.source_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">{source.source_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {source.item_count} items
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(source.status)}>
                          {source.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerSync(source.source_id)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validation Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Validation Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validationQueue.slice(0, 5).map((validation) => (
                    <div
                      key={validation.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">
                          Validation #{validation.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {validation.recommendation_type}
                        </div>
                      </div>
                      <Badge
                        className={getStatusColor(validation.validation_status)}
                      >
                        {validation.validation_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Knowledge Search</CardTitle>
              <CardDescription>
                Search through medical literature, guidelines, and
                evidence-based content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Controls */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search medical knowledge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && searchMedicalKnowledge()
                    }
                  />
                </div>
                <Button onClick={searchMedicalKnowledge} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={knowledgeFilter.knowledge_type}
                  onValueChange={(value) =>
                    setKnowledgeFilter((prev) => ({
                      ...prev,
                      knowledge_type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Knowledge Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="guideline">Guidelines</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="drug_info">Drug Information</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="treatment">Treatment</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={knowledgeFilter.evidence_level}
                  onValueChange={(value) =>
                    setKnowledgeFilter((prev) => ({
                      ...prev,
                      evidence_level: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Evidence Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="A">Level A</SelectItem>
                    <SelectItem value="B">Level B</SelectItem>
                    <SelectItem value="C">Level C</SelectItem>
                    <SelectItem value="D">Level D</SelectItem>
                    <SelectItem value="Expert Opinion">
                      Expert Opinion
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Medical Categories"
                  value={knowledgeFilter.medical_categories}
                  onChange={(e) =>
                    setKnowledgeFilter((prev) => ({
                      ...prev,
                      medical_categories: e.target.value,
                    }))
                  }
                />

                <Input
                  placeholder="Quality Threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={knowledgeFilter.quality_threshold}
                  onChange={(e) =>
                    setKnowledgeFilter((prev) => ({
                      ...prev,
                      quality_threshold: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Search Results ({searchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {searchResults.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.summary}
                              </p>
                              <div className="flex gap-2">
                                <Badge
                                  className={getEvidenceLevelColor(
                                    item.evidence_level || ""
                                  )}
                                >
                                  {item.evidence_level}
                                </Badge>
                                <Badge variant="outline">
                                  {item.knowledge_type}
                                </Badge>
                                {item.quality_score && (
                                  <Badge variant="secondary">
                                    Quality:{" "}
                                    {(item.quality_score * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drugs Tab */}
        <TabsContent value="drugs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drug Information & Interactions</CardTitle>
              <CardDescription>
                Search drug information and check for potential interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drug Search */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search drugs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchDrugs()}
                  />
                </div>
                <Button onClick={searchDrugs} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Drug Results */}
              {drugSearchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Drug Results ({drugSearchResults.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drugSearchResults.map((drug) => (
                      <Card key={drug.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{drug.drug_name}</h4>
                            {drug.generic_name && (
                              <p className="text-sm text-muted-foreground">
                                Generic: {drug.generic_name}
                              </p>
                            )}
                            {drug.drug_class && (
                              <Badge variant="outline">{drug.drug_class}</Badge>
                            )}
                            {drug.indications &&
                              drug.indications.length > 0 && (
                                <div className="text-sm">
                                  <strong>Indications:</strong>{" "}
                                  {drug.indications.slice(0, 3).join(", ")}
                                  {drug.indications.length > 3 && "..."}
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug Interactions */}
              {drugInteractions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Drug Interactions ({drugInteractions.length})
                  </h3>
                  <div className="space-y-3">
                    {drugInteractions.map((interaction) => (
                      <Alert key={interaction.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>Interaction:</strong>{" "}
                              {interaction.interaction_type}
                              {interaction.clinical_effects && (
                                <div className="text-sm mt-1">
                                  {interaction.clinical_effects}
                                </div>
                              )}
                            </div>
                            <Badge
                              className={getSeverityColor(
                                interaction.severity_level
                              )}
                            >
                              Level {interaction.severity_level}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Guidelines</CardTitle>
              <CardDescription>
                Clinical practice guidelines and protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guidelines.map((guideline) => (
                  <Card key={guideline.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            {guideline.guideline_title}
                          </h4>
                          {guideline.organization && (
                            <p className="text-sm text-muted-foreground">
                              {guideline.organization}
                            </p>
                          )}
                          {guideline.specialty && (
                            <Badge variant="outline">
                              {guideline.specialty}
                            </Badge>
                          )}
                          {guideline.publication_date && (
                            <div className="text-sm text-muted-foreground">
                              Published:{" "}
                              {new Date(
                                guideline.publication_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Validation</CardTitle>
              <CardDescription>
                Review and validate medical recommendations against evidence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationQueue.map((validation) => (
                  <Card key={validation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            Validation #{validation.id.slice(0, 8)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Type: {validation.recommendation_type}
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              className={getStatusColor(
                                validation.validation_status
                              )}
                            >
                              {validation.validation_status}
                            </Badge>
                            {validation.confidence_score && (
                              <Badge variant="secondary">
                                Confidence:{" "}
                                {(validation.confidence_score * 100).toFixed(0)}
                                %
                              </Badge>
                            )}
                          </div>
                          {validation.validation_notes && (
                            <p className="text-sm">
                              {validation.validation_notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          <Button size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>
                Manage and monitor medical knowledge data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {knowledgeSources.map((source) => (
                  <Card key={source.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{source.source_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {source.description}
                          </p>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(source.status)}>
                              {source.status}
                            </Badge>
                            <Badge variant="outline">
                              {source.source_type}
                            </Badge>
                          </div>
                          {source.last_sync && (
                            <div className="text-sm text-muted-foreground">
                              Last sync:{" "}
                              {new Date(source.last_sync).toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerSync(source.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
