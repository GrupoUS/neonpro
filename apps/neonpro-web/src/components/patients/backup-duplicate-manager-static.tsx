"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AlertTriangle,
  Calendar,
  Check,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";

export interface DuplicateManagerProps {
  onMergeComplete?: () => void;
}

// Static component to demonstrate UI without React hooks
export default function DuplicateManagerStatic({ onMergeComplete }: DuplicateManagerProps) {
  // Mock data for demonstration
  const duplicates = [
    {
      id: "1",
      patients: [
        {
          id: "p1",
          name: "João Silva",
          email: "joao@email.com",
          phone: "(11) 99999-9999",
          birthDate: "1985-03-15",
          address: "Rua A, 123",
          createdAt: "2024-01-15",
          confidence: 95,
        },
        {
          id: "p2",
          name: "João da Silva",
          email: "joao.silva@email.com",
          phone: "(11) 9999-9999",
          birthDate: "1985-03-15",
          address: "Rua A, 123 - Apt 45",
          createdAt: "2024-01-20",
          confidence: 95,
        },
      ],
      matchFields: ["name", "birthDate", "phone"],
      confidence: 95,
    },
  ];

  const handleMerge = (duplicateId: string) => {
    console.log("Merging duplicate:", duplicateId);
    onMergeComplete?.();
  };

  const handleDismiss = (duplicateId: string) => {
    console.log("Dismissing duplicate:", duplicateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-semibold">Possíveis Duplicatas Detectadas</h2>
        <Badge variant="secondary">{duplicates.length}</Badge>
      </div>

      {duplicates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma duplicata encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {duplicates.map((duplicate) => (
            <Card key={duplicate.id} className="border-orange-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Possível Duplicata</CardTitle>
                  <Badge variant="outline" className="text-orange-600">
                    {duplicate.confidence}% confiança
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Campos coincidentes: {duplicate.matchFields.join(", ")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {duplicate.patients.map((patient, index) => (
                    <div key={patient.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Paciente {index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          ID: {patient.id}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{patient.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{patient.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(patient.birthDate).toLocaleDateString("pt-BR")}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{patient.address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>
                            Criado em {new Date(patient.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleDismiss(duplicate.id)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Não é duplicata
                  </Button>
                  <Button onClick={() => handleMerge(duplicate.id)} className="gap-2">
                    <Check className="h-4 w-4" />
                    Unificar pacientes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
