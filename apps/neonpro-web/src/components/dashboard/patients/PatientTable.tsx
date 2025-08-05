import React from "react";
import type {
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TablePatient {
  id: number;
  medical_record_number: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  status: React.ReactNode;
  created_at: string;
  actions: number;
}

interface PatientTableProps {
  data: TablePatient[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewPatient?: (id: number) => void;
  onEditPatient?: (id: number) => void;
  onDeletePatient?: (id: number) => void;
}

export function PatientTable({
  data,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onViewPatient,
  onEditPatient,
  onDeletePatient,
}: PatientTableProps) {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewPatient = (id: number) => {
    onViewPatient?.(id);
  };

  const handleEditPatient = (id: number) => {
    onEditPatient?.(id);
  };

  const handleDeletePatient = (id: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.",
      )
    ) {
      onDeletePatient?.(id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros de busca ou cadastre um novo paciente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes ({data.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{patient.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Prontuário: {patient.medical_record_number}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{patient.age} anos</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{patient.gender}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {patient.phone !== "N/A" && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{patient.status}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{patient.created_at}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewPatient(patient.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPatient(patient.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
