import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Paciente, CreatePacienteData, UpdatePacienteData } from '@/types/patient';

interface PatientFormProps {
  patient?: Paciente;
  onSubmit: (data: CreatePacienteData | UpdatePacienteData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<CreatePacienteData>>({
    nome: patient?.nome || '',
    email: patient?.email || '',
    telefone: patient?.telefone || '',
    data_nascimento: patient?.data_nascimento || '',
    endereco: patient?.endereco || '',
    observacoes: patient?.observacoes || '',
    cpf: patient?.cpf || '',
    rg: patient?.rg || '',
    estado_civil: patient?.estado_civil || '',
    profissao: patient?.profissao || '',
    contato_emergencia: patient?.contato_emergencia || '',
    telefone_emergencia: patient?.telefone_emergencia || '',
    convenio: patient?.convenio || '',
    numero_convenio: patient?.numero_convenio || '',
    foto_url: patient?.foto_url || '',
    ativo: patient?.ativo ?? true
  });

  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    patient?.data_nascimento ? new Date(patient.data_nascimento) : undefined
  );

  const handleInputChange = (field: keyof CreatePacienteData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field: keyof CreatePacienteData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field: keyof CreatePacienteData) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDateOfBirth(date);
    setFormData(prev => ({
      ...prev,
      data_nascimento: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = patient
      ? { ...formData, id: patient.id } as UpdatePacienteData
      : formData as CreatePacienteData;

    await onSubmit(submitData);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {patient ? 'Editar Paciente' : 'Novo Paciente'}
        </CardTitle>
        <CardDescription>
          {patient ? 'Atualize as informações do paciente' : 'Cadastre um novo paciente no sistema'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="medicos">Dados Médicos</TabsTrigger>
            </TabsList>

            <TabsContent value="pessoais" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={handleInputChange('nome')}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? (
                          format(dateOfBirth, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={handleDateChange}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value);
                      setFormData(prev => ({ ...prev, cpf: formatted }));
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={formData.rg}
                    onChange={handleInputChange('rg')}
                    placeholder="Digite o RG"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={formData.estado_civil} onValueChange={handleSelectChange('estado_civil')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao_estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={handleInputChange('profissao')}
                    placeholder="Digite a profissão"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData(prev => ({ ...prev, telefone: formatted }));
                    }}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange('endereco')}
                    placeholder="Rua, número, bairro, cidade - UF"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contato_emergencia">Contato de Emergência</Label>
                  <Input
                    id="contato_emergencia"
                    value={formData.contato_emergencia}
                    onChange={handleInputChange('contato_emergencia')}
                    placeholder="Nome do contato"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone_emergencia">Telefone de Emergência</Label>
                  <Input
                    id="telefone_emergencia"
                    value={formData.telefone_emergencia}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData(prev => ({ ...prev, telefone_emergencia: formatted }));
                    }}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medicos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="convenio">Convênio</Label>
                  <Input
                    id="convenio"
                    value={formData.convenio}
                    onChange={handleInputChange('convenio')}
                    placeholder="Nome do convênio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_convenio">Número do Convênio</Label>
                  <Input
                    id="numero_convenio"
                    value={formData.numero_convenio}
                    onChange={handleInputChange('numero_convenio')}
                    placeholder="Número da carteirinha"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange('observacoes')}
                    placeholder="Informações adicionais sobre o paciente"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={handleSwitchChange('ativo')}
                  />
                  <Label htmlFor="ativo">Paciente Ativo</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.nome}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
