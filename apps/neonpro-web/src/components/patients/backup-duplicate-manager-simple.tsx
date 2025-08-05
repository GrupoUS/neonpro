"use client";

import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CheckCircle, Eye, Users, X } from "lucide-react";
import React from "react";

interface DuplicateManagerProps {
  onMergeComplete?: (result: any) => void;
}

export default function DuplicateManager({ onMergeComplete }: DuplicateManagerProps) {
  const duplicatesState = React.useState<any[]>([]);
  const duplicates = duplicatesState[0];
  const setDuplicates = duplicatesState[1];

  const loadingState = React.useState(true);
  const loading = loadingState[0];
  const setLoading = loadingState[1];

  React.useEffect(() => {
    // Simulate loading duplicates
    setTimeout(() => {
      setDuplicates([]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carregando duplicatas...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Verificando pacientes duplicados...</div>
        </CardContent>
      </Card>
    );
  }

  if (duplicates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Duplicatas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Nenhuma duplicata pendente encontrada.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciamento de Duplicatas ({duplicates.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">Duplicata {index + 1}</h4>
                  <Badge variant="secondary">Confiança: 95%</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Comparar
                  </Button>
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
