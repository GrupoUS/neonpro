/**
 * Professional Service Manager Component
 * Manages professional-service assignments with filtering and bulk operations
 */

import {
  useDeleteProfessionalService,
  useProfessionalServicesDetailed,
  useSetPrimaryProfessional,
} from "@/hooks/useProfessionalServices";
import {
  getProficiencyColor,
  getProficiencyLabel,
  PROFICIENCY_LEVELS,
  type ProficiencyLevel,
} from "@/types/professional-services";
import type { ProfessionalServiceDetailed } from "@/types/professional-services";
import { cn } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@neonpro/ui";
import { Badge } from "@neonpro/ui";
import { Input } from "@neonpro/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@neonpro/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@neonpro/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@neonpro/ui";
import {
  BarChart3,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

interface ProfessionalServiceManagerProps {
  clinicId: string;
  className?: string;
}

export function ProfessionalServiceManager({
  clinicId,
  className,
}: ProfessionalServiceManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [proficiencyFilter, setProficiencyFilter] = useState<
    ProficiencyLevel | "all"
  >("all");
  const [primaryFilter, setPrimaryFilter] = useState<
    "all" | "primary" | "secondary"
  >("all");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  // Hooks
  const {
    data: assignments,
    isLoading,
    error,
  } = useProfessionalServicesDetailed(clinicId);

  const deleteProfessionalService = useDeleteProfessionalService();
  const setPrimaryProfessional = useSetPrimaryProfessional();

  // Filter assignments based on search and filters
  const filteredAssignments =
    assignments?.filter((assignment) => {
      const matchesSearch =
        assignment.professional_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        assignment.service_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesProficiency =
        proficiencyFilter === "all" ||
        assignment.proficiency_level === proficiencyFilter;

      const matchesPrimary =
        primaryFilter === "all" ||
        (primaryFilter === "primary" && assignment.is_primary) ||
        (primaryFilter === "secondary" && !assignment.is_primary);

      return matchesSearch && matchesProficiency && matchesPrimary;
    }) || [];

  const handleDeleteAssignment = async (
    assignment: ProfessionalServiceDetailed,
  ) => {
    if (
      window.confirm(
        `Remover atribuição de "${assignment.service_name}" para "${assignment.professional_name}"?`,
      )
    ) {
      try {
        await deleteProfessionalService.mutateAsync(assignment.id);
      } catch (error) {
        console.error("Error deleting assignment:", error);
      }
    }
  };

  const handleSetPrimary = async (assignment: ProfessionalServiceDetailed) => {
    try {
      await setPrimaryProfessional.mutateAsync({
        service_id: assignment.service_id,
        professional_id: assignment.professional_id,
      });
    } catch (error) {
      console.error("Error setting primary professional:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atribuições Profissional-Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atribuições Profissional-Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Erro ao carregar atribuições: {error.message}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atribuições Profissional-Serviço
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie quais profissionais podem realizar cada serviço
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estatísticas
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Estatísticas das Atribuições</DialogTitle>
                  <DialogDescription>
                    Visualize o desempenho das atribuições profissional-serviço
                  </DialogDescription>
                </DialogHeader>
                {/* Stats component would go here */}
                <div className="p-4 text-center text-muted-foreground">
                  Estatísticas em desenvolvimento
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Atribuição
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Atribuição</DialogTitle>
                  <DialogDescription>
                    Atribua um serviço a um profissional
                  </DialogDescription>
                </DialogHeader>
                {/* Assignment form would go here */}
                <div className="p-4 text-center text-muted-foreground">
                  Formulário em desenvolvimento
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar profissional ou serviço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={proficiencyFilter}
              onValueChange={(value) => setProficiencyFilter(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nível de proficiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                {Object.entries(PROFICIENCY_LEVELS).map(([level, config]) => (
                  <SelectItem key={level} value={level}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={primaryFilter}
              onValueChange={(value) => setPrimaryFilter(value as any)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="primary">Principais</SelectItem>
                <SelectItem value="secondary">Secundários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ||
                proficiencyFilter !== "all" ||
                primaryFilter !== "all"
                  ? "Nenhuma atribuição encontrada"
                  : "Nenhuma atribuição criada"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                proficiencyFilter !== "all" ||
                primaryFilter !== "all"
                  ? "Tente ajustar os filtros ou criar uma nova atribuição"
                  : "Comece atribuindo serviços aos profissionais"}
              </p>
              <Button onClick={() => setShowAssignDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Atribuição
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAssignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {assignment.professional_name}
                            </h4>
                            {assignment.is_primary && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assignment.service_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: getProficiencyColor(
                              assignment.proficiency_level,
                            ),
                            color: getProficiencyColor(
                              assignment.proficiency_level,
                            ),
                          }}
                        >
                          {getProficiencyLabel(assignment.proficiency_level)}
                        </Badge>

                        {assignment.hourly_rate && (
                          <Badge variant="secondary">
                            R$ {assignment.hourly_rate.toFixed(2)}/h
                          </Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleSetPrimary(assignment)}
                            >
                              {assignment.is_primary ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Remover Principal
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Definir como Principal
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAssignment(assignment)}
                              className="text-destructive"
                              disabled={deleteProfessionalService.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
