"use client";

// =============================================
// NeonPro Clinic Holiday Management
// Story 1.2: Business rules configuration
// =============================================

import type { ClinicHoliday, HolidayConfig } from "@/app/lib/types/conflict-prevention";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Textarea } from "@/components/ui/textarea";
import type { format, parseISO } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertCircle,
  Calendar,
  Clock,
  Edit,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { toast } from "sonner";

interface ClinicHolidayManagerProps {
  clinicId: string;
  onHolidaysChange?: (holidays: ClinicHoliday[]) => void;
}

export function ClinicHolidayManager({ clinicId, onHolidaysChange }: ClinicHolidayManagerProps) {
  // State management
  const [holidays, setHolidays] = useState<ClinicHoliday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<ClinicHoliday | null>(null);
  const [formData, setFormData] = useState<HolidayConfig>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    is_recurring: false,
    recurrence_type: undefined,
  });

  // Load existing holidays
  useEffect(() => {
    loadHolidays();
  }, [clinicId]);

  const loadHolidays = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/clinic/${clinicId}/holidays`);

      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
        onHolidaysChange?.(data);
      }
    } catch (error) {
      console.error("Error loading holidays:", error);
      toast.error("Erro ao carregar feriados");
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (holiday?: ClinicHoliday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        description: holiday.description || "",
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        start_time: holiday.start_time || "",
        end_time: holiday.end_time || "",
        is_recurring: holiday.is_recurring,
        recurrence_type: holiday.recurrence_type,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        is_recurring: false,
        recurrence_type: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      is_recurring: false,
      recurrence_type: undefined,
    });
  };

  const saveHoliday = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.start_date || !formData.end_date) {
        toast.error("Nome, data inicial e data final são obrigatórios");
        return;
      }

      if (formData.start_date > formData.end_date) {
        toast.error("Data inicial deve ser anterior à data final");
        return;
      }

      if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
        toast.error("Horário inicial deve ser anterior ao horário final");
        return;
      }

      const method = editingHoliday ? "PUT" : "POST";
      const url = editingHoliday
        ? `/api/clinic/${clinicId}/holidays/${editingHoliday.id}`
        : `/api/clinic/${clinicId}/holidays`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save holiday");
      }

      const savedHoliday = await response.json();

      if (editingHoliday) {
        setHolidays((prev) => prev.map((h) => (h.id === editingHoliday.id ? savedHoliday : h)));
        toast.success("Feriado atualizado com sucesso!");
      } else {
        setHolidays((prev) => [...prev, savedHoliday]);
        toast.success("Feriado adicionado com sucesso!");
      }

      closeDialog();
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast.error("Erro ao salvar feriado");
    }
  };

  const deleteHoliday = async (holidayId: string) => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/holidays/${holidayId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete holiday");
      }

      setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
      toast.success("Feriado removido com sucesso!");
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Erro ao remover feriado");
    }
  };

  const toggleHolidayStatus = async (holidayId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/clinic/${clinicId}/holidays/${holidayId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update holiday status");
      }

      setHolidays((prev) =>
        prev.map((h) => (h.id === holidayId ? { ...h, is_active: isActive } : h)),
      );

      toast.success(`Feriado ${isActive ? "ativado" : "desativado"} com sucesso!`);
    } catch (error) {
      console.error("Error updating holiday status:", error);
      toast.error("Erro ao atualizar status do feriado");
    }
  };

  const getHolidayDateRange = (holiday: ClinicHoliday): string => {
    const startDate = parseISO(holiday.start_date);
    const endDate = parseISO(holiday.end_date);

    if (holiday.start_date === holiday.end_date) {
      return format(startDate, "dd/MM/yyyy", { locale: ptBR });
    }

    return `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", {
      locale: ptBR,
    })}`;
  };

  const getHolidayTimeRange = (holiday: ClinicHoliday): string => {
    if (!holiday.start_time || !holiday.end_time) {
      return "Dia todo";
    }
    return `${holiday.start_time} - ${holiday.end_time}`;
  };

  const getRecurrenceLabel = (holiday: ClinicHoliday): string => {
    if (!holiday.is_recurring) return "";

    const labels = {
      yearly: "Anual",
      monthly: "Mensal",
      weekly: "Semanal",
    };

    return labels[holiday.recurrence_type || "yearly"] || "";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 animate-spin" />
            <span>Carregando feriados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feriados e Fechamentos
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingHoliday ? "Editar" : "Adicionar"} Feriado</DialogTitle>
                <DialogDescription>
                  Configure um período de fechamento ou feriado para a clínica.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="holiday-name">Nome *</Label>
                  <Input
                    id="holiday-name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Natal, Fechamento para reformas..."
                  />
                </div>

                <div>
                  <Label htmlFor="holiday-description">Descrição</Label>
                  <Textarea
                    id="holiday-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detalhes adicionais (opcional)"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Data inicial *</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                          end_date: prev.end_date || e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">Data final *</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Início (opcional)</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          start_time: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">Fim (opcional)</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          end_time: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_recurring: checked,
                          recurrence_type: checked ? "yearly" : undefined,
                        }))
                      }
                    />
                    <Label>Recorrente</Label>
                  </div>

                  {formData.is_recurring && (
                    <Select
                      value={formData.recurrence_type}
                      onValueChange={(value: "yearly" | "monthly" | "weekly") =>
                        setFormData((prev) => ({
                          ...prev,
                          recurrence_type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de recorrência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button onClick={saveHoliday}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {holidays.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum feriado configurado</p>
              <p className="text-sm">Clique em "Adicionar" para criar um novo feriado</p>
            </div>
          ) : (
            holidays.map((holiday) => (
              <Card key={holiday.id} className={!holiday.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{holiday.name}</h4>
                        {holiday.is_recurring && (
                          <Badge variant="secondary" className="text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {getRecurrenceLabel(holiday)}
                          </Badge>
                        )}
                        {!holiday.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getHolidayDateRange(holiday)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getHolidayTimeRange(holiday)}
                        </div>
                        {holiday.description && <p className="text-xs">{holiday.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Switch
                        checked={holiday.is_active}
                        onCheckedChange={(checked) => toggleHolidayStatus(holiday.id, checked)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => openDialog(holiday)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHoliday(holiday.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {holidays.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Feriados ativos bloqueiam automaticamente agendamentos</li>
                  <li>Horários específicos permitem fechamentos parciais</li>
                  <li>Feriados recorrentes se repetem automaticamente</li>
                  <li>Agendamentos existentes em feriados precisam ser reagendados manualmente</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
