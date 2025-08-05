'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentNotesForm = AppointmentNotesForm;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var SUGGESTED_NOTES = [
    {
        id: 'first-time',
        text: 'É minha primeira consulta nesta clínica',
        type: 'general',
        icon: lucide_react_1.Calendar,
        color: 'bg-blue-100 text-blue-700'
    },
    {
        id: 'follow-up',
        text: 'Consulta de retorno/acompanhamento',
        type: 'medical',
        icon: lucide_react_1.FileText,
        color: 'bg-green-100 text-green-700'
    },
    {
        id: 'urgent',
        text: 'Consulta urgente/prioritária',
        type: 'medical',
        icon: lucide_react_1.AlertTriangle,
        color: 'bg-red-100 text-red-700'
    },
    {
        id: 'reminder',
        text: 'Enviar lembrete por SMS',
        type: 'preference',
        icon: lucide_react_1.Smartphone,
        color: 'bg-purple-100 text-purple-700'
    },
    {
        id: 'accessibility',
        text: 'Preciso de acessibilidade especial',
        type: 'accessibility',
        icon: lucide_react_1.MessageSquare,
        color: 'bg-orange-100 text-orange-700'
    }
];
function AppointmentNotesForm(_a) {
    var notes = _a.notes, onNotesChange = _a.onNotesChange, specialRequests = _a.specialRequests, onSpecialRequestsChange = _a.onSpecialRequestsChange, _b = _a.className, className = _b === void 0 ? "" : _b;
    var _c = (0, react_1.useState)(specialRequests), selectedSuggestions = _c[0], setSelectedSuggestions = _c[1];
    var textareaRef = (0, react_1.useRef)(null);
    var handleSuggestionToggle = function (noteId, noteText) {
        var isSelected = selectedSuggestions.includes(noteId);
        var newSuggestions;
        if (isSelected) {
            newSuggestions = selectedSuggestions.filter(function (id) { return id !== noteId; });
        }
        else {
            newSuggestions = __spreadArray(__spreadArray([], selectedSuggestions, true), [noteId], false);
        }
        setSelectedSuggestions(newSuggestions);
        onSpecialRequestsChange(newSuggestions);
        // Add to notes if not already present
        if (!isSelected && !notes.includes(noteText)) {
            var newNotes = notes ? "".concat(notes, "\n\u2022 ").concat(noteText) : "\u2022 ".concat(noteText);
            onNotesChange(newNotes);
        }
        else if (isSelected) {
            // Remove from notes
            var notePattern = new RegExp("\n?\u2022 ?".concat(noteText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'gi');
            var newNotes = notes.replace(notePattern, '').trim();
            onNotesChange(newNotes);
        }
    };
    var handleNotesChange = function (value) {
        onNotesChange(value);
        // Auto-adjust textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = "".concat(textareaRef.current.scrollHeight, "px");
        }
    };
    var getCharacterCount = function () {
        return notes.length;
    };
    var isCharacterLimitNear = function () {
        return getCharacterCount() > 450; // Warning at 450 chars, limit at 500
    };
    var isCharacterLimitExceeded = function () {
        return getCharacterCount() > 500;
    };
    return (<div className={"space-y-6 ".concat(className)}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Observações e Solicitações Especiais
        </h2>
        <p className="text-gray-600">
          Adicione informações relevantes sobre sua consulta ou necessidades especiais
        </p>
      </div>

      {/* Quick Selection */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.MessageSquare className="h-5 w-5"/>
            Seleções Rápidas
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTED_NOTES.map(function (note) {
            var IconComponent = note.icon;
            var isSelected = selectedSuggestions.includes(note.id);
            return (<div key={note.id} className="flex items-center space-x-3">
                  <checkbox_1.Checkbox id={note.id} checked={isSelected} onCheckedChange={function () { return handleSuggestionToggle(note.id, note.text); }} className="flex-shrink-0"/>
                  <label_1.Label htmlFor={note.id} className="flex items-center gap-2 cursor-pointer text-sm flex-1">
                    <IconComponent className="h-4 w-4 flex-shrink-0"/>
                    <span className="flex-1">{note.text}</span>
                    {isSelected && (<badge_1.Badge variant="secondary" className={note.color}>
                        Selecionado
                      </badge_1.Badge>)}
                  </label_1.Label>
                </div>);
        })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Custom Notes */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="text-lg flex items-center gap-2">
            <lucide_react_1.FileText className="h-5 w-5"/>
            Observações Personalizadas
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="space-y-2">
            <label_1.Label htmlFor="appointment-notes">
              Observações adicionais (opcional)
            </label_1.Label>
            <textarea_1.Textarea ref={textareaRef} id="appointment-notes" placeholder="Digite aqui qualquer informação adicional que considere importante para sua consulta..." value={notes} onChange={function (e) { return handleNotesChange(e.target.value); }} className={"min-h-[100px] resize-none transition-colors ".concat(isCharacterLimitExceeded()
            ? 'border-red-300 focus:border-red-500'
            : isCharacterLimitNear()
                ? 'border-yellow-300 focus:border-yellow-500'
                : '')} maxLength={500} rows={4}/>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Máximo 500 caracteres
              </span>
              <span className={"font-medium ".concat(isCharacterLimitExceeded()
            ? 'text-red-600'
            : isCharacterLimitNear()
                ? 'text-yellow-600'
                : 'text-gray-500')}>
                {getCharacterCount()}/500
              </span>
            </div>
          </div>

          {/* Character limit warning */}
          {isCharacterLimitNear() && (<alert_1.Alert className={isCharacterLimitExceeded()
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"}>
              <lucide_react_1.AlertTriangle className="h-4 w-4"/>
              <alert_1.AlertDescription className={isCharacterLimitExceeded()
                ? "text-red-700"
                : "text-yellow-700"}>
                {isCharacterLimitExceeded()
                ? 'Limite de caracteres excedido. Por favor, reduza o texto.'
                : 'Você está próximo do limite de caracteres.'}
              </alert_1.AlertDescription>
            </alert_1.Alert>)}

          {/* Helpful tips */}
          <alert_1.Alert className="border-blue-200 bg-blue-50">
            <lucide_react_1.FileText className="h-4 w-4"/>
            <alert_1.AlertDescription className="text-blue-700">
              <strong>Dicas:</strong> Inclua informações sobre sintomas, medicamentos em uso, 
              alergias, ou qualquer preferência específica para sua consulta.
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>

      {/* Selected summary */}
      {(selectedSuggestions.length > 0 || notes.trim()) && (<card_1.Card className="bg-gray-50">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg text-gray-900">
              Resumo das Informações
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-3">
            {selectedSuggestions.length > 0 && (<div>
                <h4 className="font-medium text-gray-900 mb-2">Seleções:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSuggestions.map(function (suggestionId) {
                    var suggestion = SUGGESTED_NOTES.find(function (note) { return note.id === suggestionId; });
                    if (!suggestion)
                        return null;
                    var IconComponent = suggestion.icon;
                    return (<badge_1.Badge key={suggestionId} variant="secondary" className={"".concat(suggestion.color, " flex items-center gap-1")}>
                        <IconComponent className="h-3 w-3"/>
                        {suggestion.text}
                      </badge_1.Badge>);
                })}
                </div>
              </div>)}
            
            {notes.trim() && (<div>
                <h4 className="font-medium text-gray-900 mb-2">Observações:</h4>
                <div className="bg-white p-3 rounded-md border text-sm text-gray-700">
                  {notes.split('\n').map(function (line, index) { return (<div key={index}>{line || <br />}</div>); })}
                </div>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
