"use client";

import type { AlertTriangle, Calendar, FileText, MessageSquare, Smartphone } from "lucide-react";
import type { useRef, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Label } from "@/components/ui/label";
import type { Textarea } from "@/components/ui/textarea";

interface AppointmentNote {
  id: string;
  text: string;
  type: "general" | "medical" | "preference" | "accessibility";
  icon: React.ComponentType<any>;
  color: string;
}

interface AppointmentNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  specialRequests: string[];
  onSpecialRequestsChange: (requests: string[]) => void;
  className?: string;
}

const SUGGESTED_NOTES: AppointmentNote[] = [
  {
    id: "first-time",
    text: "É minha primeira consulta nesta clínica",
    type: "general",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "follow-up",
    text: "Consulta de retorno/acompanhamento",
    type: "medical",
    icon: FileText,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "urgent",
    text: "Consulta urgente/prioritária",
    type: "medical",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700",
  },
  {
    id: "reminder",
    text: "Enviar lembrete por SMS",
    type: "preference",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "accessibility",
    text: "Preciso de acessibilidade especial",
    type: "accessibility",
    icon: MessageSquare,
    color: "bg-orange-100 text-orange-700",
  },
];

export function AppointmentNotesForm({
  notes,
  onNotesChange,
  specialRequests,
  onSpecialRequestsChange,
  className = "",
}: AppointmentNotesProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>(specialRequests);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionToggle = (noteId: string, noteText: string) => {
    const isSelected = selectedSuggestions.includes(noteId);
    let newSuggestions: string[];

    if (isSelected) {
      newSuggestions = selectedSuggestions.filter((id) => id !== noteId);
    } else {
      newSuggestions = [...selectedSuggestions, noteId];
    }

    setSelectedSuggestions(newSuggestions);
    onSpecialRequestsChange(newSuggestions);

    // Add to notes if not already present
    if (!isSelected && !notes.includes(noteText)) {
      const newNotes = notes ? `${notes}\n• ${noteText}` : `• ${noteText}`;
      onNotesChange(newNotes);
    } else if (isSelected) {
      // Remove from notes
      const notePattern = new RegExp(
        `\n?• ?${noteText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "gi",
      );
      const newNotes = notes.replace(notePattern, "").trim();
      onNotesChange(newNotes);
    }
  };

  const handleNotesChange = (value: string) => {
    onNotesChange(value);

    // Auto-adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const getCharacterCount = () => {
    return notes.length;
  };

  const isCharacterLimitNear = () => {
    return getCharacterCount() > 450; // Warning at 450 chars, limit at 500
  };

  const isCharacterLimitExceeded = () => {
    return getCharacterCount() > 500;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Observações e Solicitações Especiais
        </h2>
        <p className="text-gray-600">
          Adicione informações relevantes sobre sua consulta ou necessidades especiais
        </p>
      </div>

      {/* Quick Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Seleções Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTED_NOTES.map((note) => {
              const IconComponent = note.icon;
              const isSelected = selectedSuggestions.includes(note.id);

              return (
                <div key={note.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={note.id}
                    checked={isSelected}
                    onCheckedChange={() => handleSuggestionToggle(note.id, note.text)}
                    className="flex-shrink-0"
                  />
                  <Label
                    htmlFor={note.id}
                    className="flex items-center gap-2 cursor-pointer text-sm flex-1"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{note.text}</span>
                    {isSelected && (
                      <Badge variant="secondary" className={note.color}>
                        Selecionado
                      </Badge>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appointment-notes">Observações adicionais (opcional)</Label>
            <Textarea
              ref={textareaRef}
              id="appointment-notes"
              placeholder="Digite aqui qualquer informação adicional que considere importante para sua consulta..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className={`min-h-[100px] resize-none transition-colors ${
                isCharacterLimitExceeded()
                  ? "border-red-300 focus:border-red-500"
                  : isCharacterLimitNear()
                    ? "border-yellow-300 focus:border-yellow-500"
                    : ""
              }`}
              maxLength={500}
              rows={4}
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Máximo 500 caracteres</span>
              <span
                className={`font-medium ${
                  isCharacterLimitExceeded()
                    ? "text-red-600"
                    : isCharacterLimitNear()
                      ? "text-yellow-600"
                      : "text-gray-500"
                }`}
              >
                {getCharacterCount()}/500
              </span>
            </div>
          </div>

          {/* Character limit warning */}
          {isCharacterLimitNear() && (
            <Alert
              className={
                isCharacterLimitExceeded()
                  ? "border-red-200 bg-red-50"
                  : "border-yellow-200 bg-yellow-50"
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription
                className={isCharacterLimitExceeded() ? "text-red-700" : "text-yellow-700"}
              >
                {isCharacterLimitExceeded()
                  ? "Limite de caracteres excedido. Por favor, reduza o texto."
                  : "Você está próximo do limite de caracteres."}
              </AlertDescription>
            </Alert>
          )}

          {/* Helpful tips */}
          <Alert className="border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4" />
            <AlertDescription className="text-blue-700">
              <strong>Dicas:</strong> Inclua informações sobre sintomas, medicamentos em uso,
              alergias, ou qualquer preferência específica para sua consulta.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Selected summary */}
      {(selectedSuggestions.length > 0 || notes.trim()) && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Resumo das Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedSuggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Seleções:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestions.map((suggestionId) => {
                    const suggestion = SUGGESTED_NOTES.find((note) => note.id === suggestionId);
                    if (!suggestion) return null;

                    const IconComponent = suggestion.icon;
                    return (
                      <Badge
                        key={suggestionId}
                        variant="secondary"
                        className={`${suggestion.color} flex items-center gap-1`}
                      >
                        <IconComponent className="h-3 w-3" />
                        {suggestion.text}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {notes.trim() && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Observações:</h4>
                <div className="bg-white p-3 rounded-md border text-sm text-gray-700">
                  {notes.split("\n").map((line, index) => (
                    <div key={index}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
