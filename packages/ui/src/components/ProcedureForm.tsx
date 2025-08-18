import { AlertTriangle, Clock, FileText, Plus, User, X } from "lucide-react";
import * as React from "react";
import type { PractitionerData, ProcedureData, TreatmentData } from "../types";
import { cn } from "../utils/cn";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { DatePicker } from "./DatePicker";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Textarea } from "./Textarea";
import { TimePicker } from "./TimePicker";

type ProcedureFormProps = {
  procedure?: Partial<ProcedureData>;
  availablePractitioners: PractitionerData[];
  availableTreatments: TreatmentData[];
  onSubmit: (data: ProcedureData) => void;
  onCancel?: () => void;
  mode?: "create" | "edit";
  loading?: boolean;
  className?: string;
};

type FormData = {
  name: string;
  description: string;
  category: string;
  practitionerId: string;
  treatmentId?: string;
  scheduledDate: Date | null;
  scheduledTime: string;
  estimatedDuration: number;
  location: string;
  notes: string;
  preRequirements: string[];
  postCareInstructions: string[];
  risks: string[];
  consentRequired: boolean;
  lgpdConsent: boolean;
};

const categories = [
  { value: "facial", label: "Facial" },
  { value: "body", label: "Corporal" },
  { value: "skin", label: "Dermatológico" },
  { value: "laser", label: "Laser" },
  { value: "injectables", label: "Injetáveis" },
  { value: "other", label: "Outros" },
];
const ProcedureForm = React.forwardRef<HTMLFormElement, ProcedureFormProps>(
  (
    {
      procedure,
      availablePractitioners,
      availableTreatments,
      onSubmit,
      onCancel,
      mode = "create",
      loading = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [formData, setFormData] = React.useState<FormData>({
      name: procedure?.name || "",
      description: procedure?.description || "",
      category: procedure?.category || "",
      practitionerId: procedure?.practitionerId || "",
      treatmentId: procedure?.treatmentId || "",
      scheduledDate: procedure?.scheduledDate ? new Date(procedure.scheduledDate) : null,
      scheduledTime: procedure?.scheduledTime || "",
      estimatedDuration: procedure?.estimatedDuration || 60,
      location: procedure?.location || "",
      notes: procedure?.notes || "",
      preRequirements: procedure?.preRequirements || [],
      postCareInstructions: procedure?.postCareInstructions || [],
      risks: procedure?.risks || [],
      consentRequired: procedure?.consentRequired ?? true,
      lgpdConsent: procedure?.lgpdConsent ?? true,
    });

    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleInputChange = (field: keyof FormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

    const addListItem = (
      field: "preRequirements" | "postCareInstructions" | "risks",
      item: string,
    ) => {
      if (item.trim()) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], item.trim()],
        }));
      }
    };
    const removeListItem = (
      field: "preRequirements" | "postCareInstructions" | "risks",
      index: number,
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.name.trim()) {
        newErrors.name = "Nome do procedimento é obrigatório";
      }

      if (!formData.category) {
        newErrors.category = "Categoria é obrigatória";
      }

      if (!formData.practitionerId) {
        newErrors.practitionerId = "Profissional é obrigatório";
      }

      if (!formData.scheduledDate) {
        newErrors.scheduledDate = "Data é obrigatória";
      }

      if (!formData.scheduledTime) {
        newErrors.scheduledTime = "Horário é obrigatório";
      }

      if (formData.estimatedDuration <= 0) {
        newErrors.estimatedDuration = "Duração deve ser maior que 0";
      }

      if (!formData.lgpdConsent) {
        newErrors.lgpdConsent = "Consentimento LGPD é obrigatório";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      const procedureData: ProcedureData = {
        id: procedure?.id || "",
        name: formData.name,
        description: formData.description,
        category: formData.category,
        practitionerId: formData.practitionerId,
        treatmentId: formData.treatmentId,
        scheduledDate: formData.scheduledDate!,
        scheduledTime: formData.scheduledTime,
        estimatedDuration: formData.estimatedDuration,
        location: formData.location,
        notes: formData.notes,
        preRequirements: formData.preRequirements,
        postCareInstructions: formData.postCareInstructions,
        risks: formData.risks,
        consentRequired: formData.consentRequired,
        lgpdConsent: formData.lgpdConsent,
        status: procedure?.status || "scheduled",
        createdAt: procedure?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSubmit(procedureData);
    };

    return (
      <form className={cn("space-y-6", className)} onSubmit={handleSubmit} ref={ref} {...props}>
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Informações do Procedimento</h3>
          </div>{" "}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField error={errors.name} label="Nome do Procedimento" required>
              <Input
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Limpeza de Pele Profunda"
                value={formData.name}
              />
            </FormField>

            <FormField error={errors.category} label="Categoria" required>
              <Select
                onValueChange={(value) => handleInputChange("category", value)}
                value={formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField error={errors.description} label="Descrição">
            <Textarea
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva o procedimento em detalhes..."
              rows={3}
              value={formData.description}
            />
          </FormField>
        </div>{" "}
        {/* Scheduling */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Agendamento</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField error={errors.scheduledDate} label="Data" required>
              <DatePicker
                date={formData.scheduledDate}
                onDateChange={(date) => handleInputChange("scheduledDate", date)}
                placeholder="Selecione a data"
              />
            </FormField>

            <FormField error={errors.scheduledTime} label="Horário" required>
              <TimePicker
                onChange={(time) => handleInputChange("scheduledTime", time)}
                placeholder="Selecione o horário"
                value={formData.scheduledTime}
              />
            </FormField>

            <FormField error={errors.estimatedDuration} label="Duração (minutos)" required>
              <Input
                min="1"
                onChange={(e) =>
                  handleInputChange("estimatedDuration", Number.parseInt(e.target.value, 10) || 0)
                }
                step="15"
                type="number"
                value={formData.estimatedDuration}
              />
            </FormField>
          </div>{" "}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField error={errors.practitionerId} label="Profissional" required>
              <Select
                onValueChange={(value) => handleInputChange("practitionerId", value)}
                value={formData.practitionerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {availablePractitioners.map((practitioner) => (
                    <SelectItem key={practitioner.id} value={practitioner.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {practitioner.name} - {practitioner.specialization}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField error={errors.location} label="Local">
              <Input
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Ex: Sala 1, Consultório Principal"
                value={formData.location}
              />
            </FormField>
          </div>
          {availableTreatments.length > 0 && (
            <FormField error={errors.treatmentId} label="Tratamento Relacionado">
              <Select
                onValueChange={(value) => handleInputChange("treatmentId", value || undefined)}
                value={formData.treatmentId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vincular a um tratamento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum tratamento</SelectItem>
                  {availableTreatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}
        </div>{" "}
        {/* Lists */}
        <div className="space-y-6">
          {/* Pre-requirements */}
          <ListField
            icon={<AlertTriangle className="h-5 w-5" />}
            items={formData.preRequirements}
            onAdd={(item) => addListItem("preRequirements", item)}
            onRemove={(index) => removeListItem("preRequirements", index)}
            placeholder="Ex: Jejum de 2 horas, não usar maquiagem..."
            title="Pré-requisitos"
          />

          {/* Post-care instructions */}
          <ListField
            icon={<FileText className="h-5 w-5" />}
            items={formData.postCareInstructions}
            onAdd={(item) => addListItem("postCareInstructions", item)}
            onRemove={(index) => removeListItem("postCareInstructions", index)}
            placeholder="Ex: Aplicar protetor solar, evitar exposição ao sol..."
            title="Cuidados Pós-Procedimento"
          />

          {/* Risks */}
          <ListField
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            items={formData.risks}
            onAdd={(item) => addListItem("risks", item)}
            onRemove={(index) => removeListItem("risks", index)}
            placeholder="Ex: Vermelhidão temporária, sensibilidade..."
            title="Riscos e Contraindicações"
          />
        </div>
        {/* Notes */}
        <FormField error={errors.notes} label="Observações Adicionais">
          <Textarea
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Informações adicionais sobre o procedimento..."
            rows={3}
            value={formData.notes}
          />
        </FormField>{" "}
        {/* Consent Checkboxes */}
        <div className="space-y-4 rounded-lg bg-muted/30 p-4">
          <h4 className="font-semibold">Consentimentos Obrigatórios</h4>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={formData.consentRequired}
                onCheckedChange={(checked) => handleInputChange("consentRequired", checked)}
              />
              <div className="space-y-1">
                <label className="font-medium text-sm">
                  Termo de Consentimento do Procedimento
                </label>
                <p className="text-muted-foreground text-xs">
                  O paciente deve assinar o termo específico para este procedimento
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={formData.lgpdConsent}
                onCheckedChange={(checked) => handleInputChange("lgpdConsent", checked)}
              />
              <div className="space-y-1">
                <label className="font-medium text-sm">
                  Consentimento LGPD <span className="text-red-500">*</span>
                </label>
                <p className="text-muted-foreground text-xs">
                  Autorização para tratamento de dados pessoais conforme LGPD
                </p>
              </div>
            </div>

            {errors.lgpdConsent && <p className="text-red-600 text-sm">{errors.lgpdConsent}</p>}
          </div>
        </div>{" "}
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t pt-6">
          {onCancel && (
            <Button disabled={loading} onClick={onCancel} type="button" variant="outline">
              Cancelar
            </Button>
          )}

          <Button disabled={loading} type="submit" variant="medical">
            {loading
              ? "Salvando..."
              : mode === "create"
                ? "Criar Procedimento"
                : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    );
  },
);

// Helper component for list fields
type ListFieldProps = {
  title: string;
  icon: React.ReactNode;
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
};

const ListField: React.FC<ListFieldProps> = ({
  title,
  icon,
  items,
  onAdd,
  onRemove,
  placeholder,
}) => {
  const [newItem, setNewItem] = React.useState("");
  const handleAdd = () => {
    onAdd(newItem);
    setNewItem("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div className="flex items-center gap-2 rounded bg-muted/50 p-2" key={index}>
              <span className="flex-1 text-sm">{item}</span>
              <Button onClick={() => onRemove(index)} size="icon-sm" type="button" variant="ghost">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          value={newItem}
        />
        <Button
          disabled={!newItem.trim()}
          onClick={handleAdd}
          size="sm"
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

ProcedureForm.displayName = "ProcedureForm";

export { ProcedureForm };
