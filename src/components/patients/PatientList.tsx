import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  Filter,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Paciente, PatientFilters } from '@/types/patient';

interface PatientListProps {
  patients: Paciente[];
  loading: boolean;
  onEdit: (patient: Paciente) => void;
  onDelete: (patientId: string) => void;
  onNewPatient: () => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  loading,
  onEdit,
  onDelete,
  onNewPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [convenioFilter, setConvenioFilter] = useState<string>('all');

  const getPatientAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const getPatientInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telefone?.includes(searchTerm) ||
      patient.cpf?.includes(searchTerm);

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && patient.ativo) ||
      (statusFilter === 'inactive' && !patient.ativo);

    const matchesConvenio = 
      convenioFilter === 'all' ||
      (convenioFilter === 'with' && patient.convenio) ||
      (convenioFilter === 'without' && !patient.convenio);

    return matchesSearch && matchesStatus && matchesConvenio;
  });

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.ativo).length,
    inactive: patients.filter(p => !p.ativo).length,
    withInsurance: patients.filter(p => p.convenio).length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pacientes</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
        <div className="text-center py-8">
          Carregando pacientes...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie os pacientes cadastrados no sistema
          </p>
        </div>
        <Button onClick={onNewPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <UserX className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Inativos</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Com Convênio</p>
              <p className="text-2xl font-bold">{stats.withInsurance}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre os pacientes por nome, email, telefone ou status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={convenioFilter} onValueChange={setConvenioFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Convênio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="with">Com Convênio</SelectItem>
                <SelectItem value="without">Sem Convênio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || convenioFilter !== 'all'
                      ? 'Nenhum paciente encontrado com os filtros aplicados.'
                      : 'Nenhum paciente cadastrado ainda.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={patient.foto_url} alt={patient.nome} />
                          <AvatarFallback>
                            {getPatientInitials(patient.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.nome}</p>
                          {patient.cpf && (
                            <p className="text-sm text-muted-foreground">
                              CPF: {patient.cpf}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        {patient.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3" />
                            {patient.email}
                          </div>
                        )}
                        {patient.telefone && (
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3" />
                            {patient.telefone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {patient.data_nascimento ? (
                        <div>
                          <p>{getPatientAge(patient.data_nascimento)} anos</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(patient.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>

                    <TableCell>
                      {patient.convenio ? (
                        <div>
                          <p className="font-medium">{patient.convenio}</p>
                          {patient.numero_convenio && (
                            <p className="text-sm text-muted-foreground">
                              {patient.numero_convenio}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Particular</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={patient.ativo ? 'default' : 'secondary'}>
                        {patient.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(patient)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(patient.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {filteredPatients.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Exibindo {filteredPatients.length} de {patients.length} pacientes
        </div>
      )}
    </div>
  );
};

export default PatientList;
