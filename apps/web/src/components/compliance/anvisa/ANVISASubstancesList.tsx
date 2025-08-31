import { Card, CardContent, CardHeader, CardTitle } from "@neonpro/ui";
import { Badge, Button, Input } from "@neonpro/ui";
import React from "react";
// Using native select for simplicity to avoid type conflicts
import { Filter, Search } from "lucide-react";
import type { ANVISAControlledClass, ANVISASubstance } from "../../../types/compliance";

interface ANVISASubstancesListProps {
  substances: ANVISASubstance[];
  searchTerm: string;
  selectedClass: ANVISAControlledClass | "all";
  onSearchChange: (term: string) => void;
  onClassChange: (substanceClass: ANVISAControlledClass | "all") => void;
  onSubstanceSelect?: (substance: ANVISASubstance) => void;
}

export function ANVISASubstancesList({
  substances,
  searchTerm,
  selectedClass,
  onSearchChange,
  onClassChange,
  onSubstanceSelect,
}: ANVISASubstancesListProps) {
  const getClassBadgeVariant = (substanceClass: ANVISAControlledClass) => {
    switch (substanceClass) {
      case "A1":
      case "A2":
      case "A3":
        return "destructive";
      case "B1":
      case "B2":
        return "secondary";
      case "C1":
      case "C2":
      case "C3":
        return "outline";
      default:
        return "default";
    }
  };

  const getClassIcon = (substanceClass: ANVISAControlledClass) => {
    switch (substanceClass) {
      case "A1":
      case "A2":
      case "A3":
        return "⚠️";
      case "B1":
      case "B2":
        return "🔒";
      case "C1":
      case "C2":
      case "C3":
        return "📋";
      default:
        return "💊";
    }
  };

  const filteredSubstances = substances.filter((substance) => {
    const matchesSearch = substance.substanceName.toLowerCase().includes(searchTerm.toLowerCase())
      || substance.commercialName.toLowerCase().includes(searchTerm.toLowerCase())
      || substance.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || substance.controlledClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Substâncias Controladas ANVISA
        </CardTitle>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar substâncias..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value as ANVISAControlledClass | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Classes</option>
              <option value="A1">Classe A1</option>
              <option value="A2">Classe A2</option>
              <option value="A3">Classe A3</option>
              <option value="B1">Classe B1</option>
              <option value="B2">Classe B2</option>
              <option value="C1">Classe C1</option>
              <option value="C2">Classe C2</option>
              <option value="C3">Classe C3</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSubstances.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma substância encontrada
              </div>
            )
            : (
              filteredSubstances.map((substance) => (
                <div
                  key={substance.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getClassIcon(substance.controlledClass)}</span>
                      <Badge variant={getClassBadgeVariant(substance.controlledClass)}>
                        {substance.controlledClass}
                      </Badge>
                      <Badge variant="outline">{substance.prescriptionType}</Badge>
                    </div>
                    <h3 className="font-medium">{substance.substanceName}</h3>
                    <p className="text-sm text-muted-foreground">{substance.commercialName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ingrediente Ativo: {substance.activeIngredient}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Concentração: {substance.concentration}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Forma Farmacêutica: {substance.pharmaceuticalForm}
                    </p>
                    {substance.restrictions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-orange-600">Restrições:</p>
                        <p className="text-xs text-muted-foreground">
                          {substance.restrictions.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  {onSubstanceSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSubstanceSelect(substance)}
                    >
                      Selecionar
                    </Button>
                  )}
                </div>
              ))
            )}
        </div>
      </CardContent>
    </Card>
  );
}
