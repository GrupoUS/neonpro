// Progressive Disclosure Error Dialog Component
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorDialog = ErrorDialog;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var card_1 = require("@/components/ui/card");
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_react_1 = require("lucide-react");
var SEVERITY_ICONS = {
    low: lucide_react_1.Info,
    medium: lucide_react_1.AlertTriangle,
    high: lucide_react_1.XCircle,
    critical: lucide_react_1.XCircle
};
var SEVERITY_COLORS = {
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
    critical: 'bg-red-100 text-red-800 border-red-300'
};
function ErrorDialog(_a) {
    var error = _a.error, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onRetry = _a.onRetry, onContactSupport = _a.onContactSupport, _b = _a.showTechnicalDetails, showTechnicalDetails = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)(false), showDetails = _c[0], setShowDetails = _c[1];
    var _d = (0, react_1.useState)(false), showContext = _d[0], setShowContext = _d[1];
    if (!error)
        return null;
    var SeverityIcon = SEVERITY_ICONS[error.severity];
    var severityColorClass = SEVERITY_COLORS[error.severity];
    return (<dialog_1.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <div className="flex items-center gap-3">
            <div className={"p-2 rounded-full ".concat(severityColorClass.replace('text-', 'bg-').replace('-700', '-100').replace('-800', '-100'))}>
              <SeverityIcon className="w-5 h-5"/>
            </div>
            <div className="flex-1">
              <dialog_1.DialogTitle className="text-lg font-semibold text-left">
                {error.title}
              </dialog_1.DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <badge_1.Badge variant="outline" className={severityColorClass}>
                  {error.severity === 'low' && 'Informação'}
                  {error.severity === 'medium' && 'Atenção'}
                  {error.severity === 'high' && 'Erro'}
                  {error.severity === 'critical' && 'Crítico'}
                </badge_1.Badge>
                <badge_1.Badge variant="secondary" className="text-xs">
                  {error.code}
                </badge_1.Badge>
              </div>
            </div>
          </div>
          <dialog_1.DialogDescription className="text-left pt-3">
            {error.message}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-4">
          {/* LGPD Privacy Notice */}
          <card_1.Card className="border-blue-200 bg-blue-50/50">
            <card_1.CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <lucide_react_1.Shield className="w-4 h-4 text-blue-600"/>
                <card_1.CardTitle className="text-sm font-medium text-blue-800">
                  Proteção de Dados (LGPD)
                </card_1.CardTitle>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0">
              <p className="text-xs text-blue-700">
                Seus dados pessoais estão protegidos. Este erro foi registrado de forma anônima para melhorar nosso sistema, sem exposição de informações sensíveis.
              </p>
            </card_1.CardContent>
          </card_1.Card>

          {/* Suggested Actions */}
          <card_1.Card>
            <card_1.CardHeader className="pb-3">
              <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
                <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600"/>
                O que você pode fazer
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="pt-0">
              <ul className="space-y-2">
                {error.suggestedActions.map(function (action, index) { return (<li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"/>
                    {action}
                  </li>); })}
              </ul>
            </card_1.CardContent>
          </card_1.Card>

          {/* Progressive Disclosure - Additional Details */}
          {error.description && (<collapsible_1.Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <collapsible_1.CollapsibleTrigger asChild>
                <button_1.Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center gap-2">
                    {showDetails ? <lucide_react_1.EyeOff className="w-4 h-4"/> : <lucide_react_1.Eye className="w-4 h-4"/>}
                    <span className="font-medium">
                      {showDetails ? 'Ocultar detalhes' : 'Ver mais detalhes'}
                    </span>
                  </div>
                  {showDetails ? (<lucide_react_1.ChevronDown className="w-4 h-4"/>) : (<lucide_react_1.ChevronRight className="w-4 h-4"/>)}
                </button_1.Button>
              </collapsible_1.CollapsibleTrigger>
              <collapsible_1.CollapsibleContent className="space-y-3">
                <card_1.Card className="bg-gray-50">
                  <card_1.CardContent className="pt-4">
                    <p className="text-sm text-gray-700">{error.description}</p>
                  </card_1.CardContent>
                </card_1.Card>
              </collapsible_1.CollapsibleContent>
            </collapsible_1.Collapsible>)}

          {/* Technical Details - Only for authorized users */}
          {showTechnicalDetails && error.technicalDetails && (<collapsible_1.Collapsible open={showContext} onOpenChange={setShowContext}>
              <collapsible_1.CollapsibleTrigger asChild>
                <button_1.Button variant="ghost" className="w-full justify-between p-3 h-auto text-orange-600">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Info className="w-4 h-4"/>
                    <span className="font-medium">
                      {showContext ? 'Ocultar informações técnicas' : 'Ver informações técnicas'}
                    </span>
                  </div>
                  {showContext ? (<lucide_react_1.ChevronDown className="w-4 h-4"/>) : (<lucide_react_1.ChevronRight className="w-4 h-4"/>)}
                </button_1.Button>
              </collapsible_1.CollapsibleTrigger>
              <collapsible_1.CollapsibleContent className="space-y-3">
                <card_1.Card className="border-orange-200 bg-orange-50/50">
                  <card_1.CardHeader className="pb-3">
                    <card_1.CardTitle className="text-sm font-medium text-orange-800">
                      Informações Técnicas (Uso Interno)
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="pt-0">
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">ID do Erro:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.id}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Componente:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.context.component}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Ação:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.context.action}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Clock className="w-3 h-3 text-gray-500"/>
                        <span className="font-medium text-gray-600">Timestamp:</span>
                        <span className="text-gray-700">
                          {new Date(error.context.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {error.technicalDetails && (<div>
                          <span className="font-medium text-gray-600">Detalhes:</span>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {error.technicalDetails}
                          </pre>
                        </div>)}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </collapsible_1.CollapsibleContent>
            </collapsible_1.Collapsible>)}

          {/* Help Link */}
          {error.helpUrl && (<card_1.Card className="border-green-200 bg-green-50/50">
              <card_1.CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Info className="w-4 h-4 text-green-600"/>
                    <span className="text-sm font-medium text-green-800">
                      Precisa de ajuda adicional?
                    </span>
                  </div>
                  <button_1.Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-100" onClick={function () { return window.open(error.helpUrl, '_blank'); }}>
                    <lucide_react_1.ExternalLink className="w-3 h-3 mr-1"/>
                    Ver Guia
                  </button_1.Button>
                </div>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>

        <dialog_1.DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Retry Button */}
            {error.canRetry && onRetry && (<button_1.Button onClick={function () {
                onRetry();
                onOpenChange(false);
            }} className="flex-1 sm:flex-none" disabled={error.retryDelay ? true : false}>
                <lucide_react_1.RotateCcw className="w-4 h-4 mr-2"/>
                {error.retryDelay ? 'Aguarde...' : 'Tentar Novamente'}
              </button_1.Button>)}

            {/* Contact Support Button */}
            {error.requiresSupport && onContactSupport && (<button_1.Button variant="outline" onClick={function () {
                onContactSupport();
                onOpenChange(false);
            }} className="flex-1 sm:flex-none">
                Contatar Suporte
              </button_1.Button>)}
          </div>

          {/* Close Button */}
          <button_1.Button variant="ghost" onClick={function () { return onOpenChange(false); }} className="w-full sm:w-auto">
            Fechar
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
