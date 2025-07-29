"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface PatientSegment {
  id: string;
  name: string;
  description: string;
  segment_type: string;
  is_active: boolean;
  member_count: number;
  ai_generated: boolean;
  accuracy_score?: number;
}

export default function SimpleSegmentationDashboard() {
  const [segments, setSegments] = useState<PatientSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSegments = async () => {
      try {
        console.log("Loading segments...");
        const response = await fetch("/api/segmentation/segments");

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Segments loaded:", data);

        setSegments(data.data || []);
      } catch (err) {
        console.error("Error loading segments:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadSegments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando segmentação...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  const totalPatients = segments.reduce(
    (sum, segment) => sum + (segment.member_count || 0),
    0
  );
  const activeSegments = segments.filter((s) => s.is_active);
  const aiSegments = segments.filter((s) => s.ai_generated);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Segmentação de Pacientes</h1>
        <Badge variant="outline" className="text-sm">
          Epic 7.1 - Patient Segmentation
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Segmentos
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeSegments.length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pacientes Segmentados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Em todos os segmentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segmentos IA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiSegments.length}</div>
            <p className="text-xs text-muted-foreground">Gerados por IA</p>
          </CardContent>
        </Card>
      </div>

      {/* Segments List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Segmentos Ativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((segment) => (
            <Card
              key={segment.id}
              className={!segment.is_active ? "opacity-50" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{segment.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge
                      variant={segment.is_active ? "default" : "secondary"}
                    >
                      {segment.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    {segment.ai_generated && (
                      <Badge variant="outline">IA</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {segment.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span>Tipo: {segment.segment_type}</span>
                  <span className="font-medium">
                    {segment.member_count || 0} pacientes
                  </span>
                </div>
                {segment.accuracy_score && (
                  <div className="mt-2 text-xs text-green-600">
                    Precisão: {(segment.accuracy_score * 100).toFixed(1)}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            Nenhum segmento encontrado. Os dados estão sendo carregados...
          </div>
        </div>
      )}
    </div>
  );
}
