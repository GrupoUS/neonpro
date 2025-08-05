"use client";

import type { zodResolver } from "@hookform/resolvers/zod";
import type {
  AlertCircle,
  CheckCircle2,
  Download,
  Edit,
  FileCheck,
  Filter,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";
import type { toast } from "sonner";
import * as z from "zod";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// CRM validation function for different states
const validateCRM = (crm: string, state: string): boolean => {
  const cleanCRM = crm.replace(/[^\d]/g, "");

  // Basic validation - CRM numbers typically have 4-6 digits
  if (cleanCRM.length < 4 || cleanCRM.length > 6) return false;

  // State-specific validation could be added here
  return true;
};

// CPF validation function
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cleanCPF.charAt(10));
};

const professionalTypes = [
  { value: "medico", label: "Médico", requiresCRM: true },
  { value: "enfermeiro", label: "Enfermeiro", requiresCRM: true },
  { value: "esteticista", label: "Esteticista", requiresCRM: false },
  { value: "fisioterapeuta", label: "Fisioterapeuta", requiresCRM: true },
  { value: "nutricionista", label: "Nutricionista", requiresCRM: true },
  { value: "psicologo", label: "Psicólogo", requiresCRM: true },
  { value: "recepcionista", label: "Recepcionista", requiresCRM: false },
  { value: "administrativo", label: "Administrativo", requiresCRM: false },
];

const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const staffMemberSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
    cpf: z.string().refine(validateCPF, "CPF inválido"),
    professionalType: z.string().min(1, "Tipo profissional é obrigatório"),
    crm: z.string().optional(),
    crmState: z.string().optional(),
    specialty: z.string().optional(),
    active: z.boolean().default(true),
    canPerformProcedures: z.boolean().default(false),
    canAccessFinancial: z.boolean().default(false),
    canManageSchedule: z.boolean().default(false),
    isAdmin: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const professionalType = professionalTypes.find((pt) => pt.value === data.professionalType);

    if (professionalType?.requiresCRM) {
      if (!data.crm || data.crm.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM é obrigatório para este tipo profissional",
          path: ["crm"],
        });
      } else if (!validateCRM(data.crm, data.crmState || "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CRM inválido",
          path: ["crm"],
        });
      }

      if (!data.crmState || data.crmState.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Estado do CRM é obrigatório",
          path: ["crmState"],
        });
      }
    }
  });

type StaffMemberFormData = z.infer<typeof staffMemberSchema>;

interface StaffMember extends StaffMemberFormData {
  id: string;
  createdAt: Date;
  lastLogin?: Date;
}

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const form = useForm<StaffMemberFormData>({
    resolver: zodResolver(staffMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      professionalType: "",
      crm: "",
      crmState: "",
      specialty: "",
      active: true,
      canPerformProcedures: false,
      canAccessFinancial: false,
      canManageSchedule: false,
      isAdmin: false,
    },
  });

  const watchedProfessionalType = form.watch("professionalType");
  const requiresCRM =
    professionalTypes.find((pt) => pt.value === watchedProfessionalType)?.requiresCRM || false;

  // Format CPF input
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Load staff members
  useEffect(() => {
    const loadStaffMembers = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch("/api/settings/staff");
        // const data = await response.json();
        // setStaffMembers(data);

        // Mock data for demonstration
        setStaffMembers([
          {
            id: "1",
            name: "Dr. João Silva",
            email: "joao@clinica.com.br",
            phone: "(11) 99999-9999",
            cpf: "123.456.789-00",
            professionalType: "medico",
            crm: "123456",
            crmState: "SP",
            specialty: "Dermatologia",
            active: true,
            canPerformProcedures: true,
            canAccessFinancial: false,
            canManageSchedule: true,
            isAdmin: false,
            createdAt: new Date(),
            lastLogin: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Erro ao carregar equipe:", error);
        toast.error("Erro ao carregar equipe médica");
      } finally {
        setIsLoading(false);
      }
    };

    loadStaffMembers();
  }, []);

  const onSubmit = async (data: StaffMemberFormData) => {
    try {
      if (editingMember) {
        // Update existing member
        const updatedMember: StaffMember = {
          ...editingMember,
          ...data,
        };
        setStaffMembers((prev) =>
          prev.map((member) => (member.id === editingMember.id ? updatedMember : member)),
        );
        toast.success("Profissional atualizado com sucesso!");
      } else {
        // Add new member
        const newMember: StaffMember = {
          ...data,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        setStaffMembers((prev) => [...prev, newMember]);
        toast.success("Profissional adicionado com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingMember(null);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      toast.error("Erro ao salvar profissional");
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member);
    form.reset(member);
    setIsDialogOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (confirm("Tem certeza que deseja remover este profissional?")) {
      try {
        setStaffMembers((prev) => prev.filter((member) => member.id !== memberId));
        toast.success("Profissional removido com sucesso!");
      } catch (error) {
        console.error("Erro ao remover profissional:", error);
        toast.error("Erro ao remover profissional");
      }
    }
  };

  const handleToggleActive = async (memberId: string) => {
    try {
      setStaffMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, active: !member.active } : member,
        ),
      );
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredMembers = staffMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.crm && member.crm.includes(searchTerm));

    const matchesFilter = filterType === "all" || member.professionalType === filterType;

    return matchesSearch && matchesFilter;
  });

  const exportStaffData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Nome,Email,Telefone,Tipo,CRM,Estado CRM,Especialidade,Ativo\n" +
      staffMembers
        .map((member) =>
          [
            member.name,
            member.email,
            member.phone,
            professionalTypes.find((pt) => pt.value === member.professionalType)?.label ||
              member.professionalType,
            member.crm || "",
            member.crmState || "",
            member.specialty || "",
            member.active ? "Sim" : "Não",
          ].join(","),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "equipe_medica.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* CFM Compliance Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Conformidade CFM:</strong> Todos os profissionais da saúde devem ter registro
          válido no conselho profissional. O sistema valida automaticamente os números de CRM.
        </AlertDescription>
      </Alert>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Equipe Médica ({staffMembers.length})
          </h2>
          <p className="text-gray-600">Gerenciar profissionais e permissões de acesso</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportStaffData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingMember(null);
                  form.reset();
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Editar Profissional" : "Adicionar Profissional"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do profissional. Campos com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="joao@clinica.com.br" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatCPF(e.target.value);
                                field.onChange(formatted);
                              }}
                              maxLength={14}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Professional Information */}
                  <FormField
                    control={form.control}
                    name="professionalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Profissional *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo profissional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {professionalTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  {type.label}
                                  {type.requiresCRM && (
                                    <Badge variant="secondary" className="text-xs">
                                      CRM
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {requiresCRM && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="crm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do CRM *</FormLabel>
                            <FormControl>
                              <Input placeholder="123456" {...field} />
                            </FormControl>
                            <FormDescription>Conselho Regional de Medicina</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="crmState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado do CRM *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brazilianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Dermatologia, Estética, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Permissions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Permissões de Acesso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="canPerformProcedures"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Realizar Procedimentos</FormLabel>
                              <FormDescription>
                                Pode executar tratamentos e procedimentos
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="canManageSchedule"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Gerenciar Agenda</FormLabel>
                              <FormDescription>Pode criar e modificar agendamentos</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="canAccessFinancial"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Acesso Financeiro</FormLabel>
                              <FormDescription>
                                Pode visualizar informações financeiras
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isAdmin"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="rounded border-gray-300"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Administrador</FormLabel>
                              <FormDescription>Acesso completo ao sistema</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingMember(null);
                        form.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingMember ? "Atualizar" : "Adicionar"} Profissional
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou CRM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {professionalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profissionais Cadastrados</CardTitle>
          <CardDescription>Lista completa da equipe médica e administrativa</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Adicione o primeiro profissional à equipe"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const professionalType = professionalTypes.find(
                      (pt) => pt.value === member.professionalType,
                    );
                    const permissions = [
                      member.canPerformProcedures && "Procedimentos",
                      member.canManageSchedule && "Agenda",
                      member.canAccessFinancial && "Financeiro",
                      member.isAdmin && "Admin",
                    ].filter(Boolean);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-600">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {professionalType?.label}
                            {professionalType?.requiresCRM && (
                              <Badge variant="secondary" className="text-xs">
                                CRM
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.crm ? `${member.crm}/${member.crmState}` : "-"}
                        </TableCell>
                        <TableCell>{member.specialty || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleActive(member.id)}
                            className="flex items-center gap-1"
                          >
                            {member.active ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Ativo</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-600">Inativo</span>
                              </>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(member.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
