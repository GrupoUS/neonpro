"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PatientActions;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var sonner_1 = require("sonner");
function PatientActions(_a) {
  var selectedCount = _a.selectedCount,
    onBulkAction = _a.onBulkAction,
    onClearSelection = _a.onClearSelection;
  var _b = (0, react_1.useState)(false),
    showExportDialog = _b[0],
    setShowExportDialog = _b[1];
  var _c = (0, react_1.useState)(false),
    showMessageDialog = _c[0],
    setShowMessageDialog = _c[1];
  var _d = (0, react_1.useState)(false),
    showArchiveDialog = _d[0],
    setShowArchiveDialog = _d[1];
  // Export settings
  var _e = (0, react_1.useState)("csv"),
    exportFormat = _e[0],
    setExportFormat = _e[1];
  var _f = (0, react_1.useState)({
      personal: true,
      contact: true,
      medical: false,
      lgpd_sensitive: false,
    }),
    exportFields = _f[0],
    setExportFields = _f[1];
  var _g = (0, react_1.useState)(true),
    anonymizeData = _g[0],
    setAnonymizeData = _g[1];
  // Message settings
  var _h = (0, react_1.useState)("email"),
    messageType = _h[0],
    setMessageType = _h[1];
  var _j = (0, react_1.useState)(""),
    messageContent = _j[0],
    setMessageContent = _j[1];
  var _k = (0, react_1.useState)(""),
    messageTemplate = _k[0],
    setMessageTemplate = _k[1];
  var handleExport = () => {
    // LGPD compliance validation
    if (exportFields.medical || exportFields.lgpd_sensitive) {
      if (!anonymizeData) {
        sonner_1.toast.error(
          "Dados médicos e sensíveis devem ser anonimizados para conformidade LGPD",
        );
        return;
      }
    }
    // Simulate export process
    var exportData = {
      format: exportFormat,
      fields: exportFields,
      anonymize: anonymizeData,
      selectedCount: selectedCount,
      timestamp: new Date().toISOString(),
      lgpdCompliant: true,
    };
    console.log("LGPD Compliant Export:", exportData);
    onBulkAction("export");
    setShowExportDialog(false);
    // Log LGPD audit
    logLGPDAudit("data_export", {
      patients_count: selectedCount,
      anonymized: anonymizeData,
      fields_exported: Object.keys(exportFields).filter((key) => exportFields[key]),
    });
  };
  var handleSendMessage = () => {
    if (!messageContent.trim()) {
      sonner_1.toast.error("Digite o conteúdo da mensagem");
      return;
    }
    // Log communication for LGPD compliance
    logLGPDAudit("communication_sent", {
      patients_count: selectedCount,
      message_type: messageType,
      content_length: messageContent.length,
    });
    onBulkAction("send_message");
    setShowMessageDialog(false);
    setMessageContent("");
  };
  var handleArchive = () => {
    // Simulate archive with LGPD compliance
    logLGPDAudit("patients_archived", {
      patients_count: selectedCount,
      reason: "bulk_action",
    });
    onBulkAction("archive");
    setShowArchiveDialog(false);
  };
  var logLGPDAudit = (action, details) => {
    var auditLog = {
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      user_agent: navigator.userAgent,
      lgpd_compliant: true,
    };
    console.log("LGPD Audit Log:", auditLog);
    // In production, this would be sent to audit logging system
  };
  var messageTemplates = {
    appointment_reminder:
      "Lembrete: Você tem uma consulta agendada para {date} às {time}. Por favor, confirme sua presença.",
    follow_up:
      "Olá! Como você está se sentindo após sua última consulta? Entre em contato se precisar de alguma coisa.",
    wellness_check:
      "Esperamos que você esteja bem! Lembre-se de manter seus cuidados de saúde em dia.",
    custom: "",
  };
  var populateTemplate = (template) => {
    var content = messageTemplates[template];
    setMessageContent(content);
  };
  return (
    <card_1.Card className="bg-blue-50 border-blue-200">
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <lucide_react_1.Users className="h-5 w-5 text-blue-600" />
            <card_1.CardTitle className="text-lg text-blue-900">Ações em Lote</card_1.CardTitle>
            <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedCount} selecionado{selectedCount !== 1 ? "s" : ""}
            </badge_1.Badge>
          </div>
          <button_1.Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <lucide_react_1.X className="h-4 w-4 mr-1" />
            Limpar seleção
          </button_1.Button>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <div className="flex flex-wrap gap-2">
          {/* Export Data Button */}
          <dialog_1.Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button variant="outline" size="sm" className="flex items-center">
                <lucide_react_1.Download className="h-4 w-4 mr-1" />
                Exportar Dados
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-md">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle className="flex items-center">
                  <lucide_react_1.Shield className="h-5 w-5 mr-2 text-green-600" />
                  Exportação LGPD Compliant
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure as opções de exportação respeitando as diretrizes da LGPD
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="space-y-4">
                {/* Format Selection */}
                <div className="space-y-2">
                  <label_1.Label>Formato do arquivo</label_1.Label>
                  <select_1.Select value={exportFormat} onValueChange={setExportFormat}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="csv">CSV (Planilha)</select_1.SelectItem>
                      <select_1.SelectItem value="pdf">PDF (Relatório)</select_1.SelectItem>
                      <select_1.SelectItem value="json">
                        JSON (Dados estruturados)
                      </select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Fields Selection */}
                <div className="space-y-2">
                  <label_1.Label>Campos a exportar</label_1.Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="personal"
                        checked={exportFields.personal}
                        onCheckedChange={(checked) =>
                          setExportFields(
                            __assign(__assign({}, exportFields), { personal: !!checked }),
                          )
                        }
                      />
                      <label_1.Label htmlFor="personal" className="text-sm">
                        Dados pessoais básicos (nome, idade, gênero)
                      </label_1.Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="contact"
                        checked={exportFields.contact}
                        onCheckedChange={(checked) =>
                          setExportFields(
                            __assign(__assign({}, exportFields), { contact: !!checked }),
                          )
                        }
                      />
                      <label_1.Label htmlFor="contact" className="text-sm">
                        Informações de contato (telefone, email)
                      </label_1.Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="medical"
                        checked={exportFields.medical}
                        onCheckedChange={(checked) =>
                          setExportFields(
                            __assign(__assign({}, exportFields), { medical: !!checked }),
                          )
                        }
                      />
                      <label_1.Label htmlFor="medical" className="text-sm text-orange-600">
                        Dados médicos (condições, alergias) - Sensível
                      </label_1.Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="lgpd_sensitive"
                        checked={exportFields.lgpd_sensitive}
                        onCheckedChange={(checked) =>
                          setExportFields(
                            __assign(__assign({}, exportFields), { lgpd_sensitive: !!checked }),
                          )
                        }
                      />
                      <label_1.Label htmlFor="lgpd_sensitive" className="text-sm text-red-600">
                        Dados altamente sensíveis (CPF, endereço) - LGPD Crítico
                      </label_1.Label>
                    </div>
                  </div>
                </div>

                {/* Anonymization Option */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="anonymize"
                      checked={anonymizeData}
                      onCheckedChange={(checked) => setAnonymizeData(!!checked)}
                    />
                    <label_1.Label htmlFor="anonymize" className="text-sm font-medium">
                      Anonimizar dados sensíveis (Recomendado)
                    </label_1.Label>
                  </div>
                  {!anonymizeData && (exportFields.medical || exportFields.lgpd_sensitive) && (
                    <alert_1.Alert>
                      <lucide_react_1.AlertTriangle className="h-4 w-4" />
                      <alert_1.AlertTitle>Atenção LGPD</alert_1.AlertTitle>
                      <alert_1.AlertDescription>
                        Exportar dados sensíveis sem anonimização requer justificativa legal
                        específica
                      </alert_1.AlertDescription>
                    </alert_1.Alert>
                  )}
                </div>

                {/* LGPD Compliance Notice */}
                <alert_1.Alert>
                  <lucide_react_1.CheckCircle className="h-4 w-4" />
                  <alert_1.AlertTitle>Conformidade LGPD</alert_1.AlertTitle>
                  <alert_1.AlertDescription>
                    Esta exportação será registrada no log de auditoria para conformidade com a
                    LGPD.
                    <a href="/lgpd/privacy-policy" className="text-blue-600 hover:underline ml-1">
                      Saiba mais <lucide_react_1.ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleExport}>
                  <lucide_react_1.Download className="h-4 w-4 mr-1" />
                  Exportar ({selectedCount} pacientes)
                </button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>

          {/* Send Message Button */}
          <dialog_1.Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button variant="outline" size="sm" className="flex items-center">
                <lucide_react_1.MessageSquare className="h-4 w-4 mr-1" />
                Enviar Mensagem
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-lg">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Enviar Mensagem em Lote</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Envie uma mensagem para {selectedCount} paciente{selectedCount !== 1 ? "s" : ""}{" "}
                  selecionado{selectedCount !== 1 ? "s" : ""}
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="space-y-4">
                {/* Message Type */}
                <div className="space-y-2">
                  <label_1.Label>Tipo de mensagem</label_1.Label>
                  <select_1.Select value={messageType} onValueChange={setMessageType}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="email">
                        <div className="flex items-center">
                          <lucide_react_1.Mail className="h-4 w-4 mr-2" />
                          Email
                        </div>
                      </select_1.SelectItem>
                      <select_1.SelectItem value="whatsapp">
                        <div className="flex items-center">
                          <lucide_react_1.Phone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </div>
                      </select_1.SelectItem>
                      <select_1.SelectItem value="sms">
                        <div className="flex items-center">
                          <lucide_react_1.MessageSquare className="h-4 w-4 mr-2" />
                          SMS
                        </div>
                      </select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Message Template */}
                <div className="space-y-2">
                  <label_1.Label>Template de mensagem</label_1.Label>
                  <select_1.Select
                    value={messageTemplate}
                    onValueChange={(value) => {
                      setMessageTemplate(value);
                      populateTemplate(value);
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um template" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="appointment_reminder">
                        Lembrete de consulta
                      </select_1.SelectItem>
                      <select_1.SelectItem value="follow_up">
                        Acompanhamento pós-consulta
                      </select_1.SelectItem>
                      <select_1.SelectItem value="wellness_check">
                        Check-up de bem-estar
                      </select_1.SelectItem>
                      <select_1.SelectItem value="custom">
                        Mensagem personalizada
                      </select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Message Content */}
                <div className="space-y-2">
                  <label_1.Label>Conteúdo da mensagem</label_1.Label>
                  <textarea_1.Textarea
                    placeholder="Digite sua mensagem aqui..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                  />
                  <div className="text-xs text-muted-foreground">
                    Caracteres: {messageContent.length}/500
                  </div>
                </div>

                {/* LGPD Notice for Communication */}
                <alert_1.Alert>
                  <lucide_react_1.Shield className="h-4 w-4" />
                  <alert_1.AlertTitle>Política de Comunicação</alert_1.AlertTitle>
                  <alert_1.AlertDescription>
                    Apenas pacientes que consentiram receber comunicações promocionais receberão
                    esta mensagem.
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                  <lucide_react_1.MessageSquare className="h-4 w-4 mr-1" />
                  Enviar para {selectedCount}
                </button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>

          {/* Archive Button */}
          <dialog_1.Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button
                variant="outline"
                size="sm"
                className="flex items-center text-orange-600"
              >
                <lucide_react_1.Archive className="h-4 w-4 mr-1" />
                Arquivar
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent>
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Arquivar Pacientes</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Tem certeza que deseja arquivar {selectedCount} paciente
                  {selectedCount !== 1 ? "s" : ""}? Esta ação pode ser revertida posteriormente.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <alert_1.Alert>
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertTitle>Atenção</alert_1.AlertTitle>
                <alert_1.AlertDescription>
                  Pacientes arquivados não aparecerão nas listas padrão, mas seus dados serão
                  mantidos para conformidade com os prazos de retenção da LGPD (20 anos para dados
                  médicos).
                </alert_1.AlertDescription>
              </alert_1.Alert>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                  Cancelar
                </button_1.Button>
                <button_1.Button variant="destructive" onClick={handleArchive}>
                  <lucide_react_1.Archive className="h-4 w-4 mr-1" />
                  Arquivar {selectedCount} paciente{selectedCount !== 1 ? "s" : ""}
                </button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>

          {/* Schedule Appointments */}
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={() => onBulkAction("schedule_bulk")}
            className="flex items-center"
          >
            <lucide_react_1.Calendar className="h-4 w-4 mr-1" />
            Agendar Consultas
          </button_1.Button>
        </div>

        {/* LGPD Compliance Footer */}
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex items-center text-xs text-blue-600">
            <lucide_react_1.Shield className="h-3 w-3 mr-1" />
            Todas as ações em lote são registradas para conformidade LGPD e auditoria
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
