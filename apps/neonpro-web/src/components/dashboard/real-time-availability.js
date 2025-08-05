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
exports.RealTimeAvailability = RealTimeAvailability;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var use_availability_manager_1 = require("@/hooks/use-availability-manager");
function RealTimeAvailability(_a) {
    var professionalId = _a.professionalId, serviceId = _a.serviceId, selectedDate = _a.selectedDate, onSlotSelect = _a.onSlotSelect, className = _a.className;
    var _b = (0, use_availability_manager_1.useAvailabilityManager)(), timeSlots = _b.timeSlots, groupedSlots = _b.groupedSlots, selectedSlot = _b.selectedSlot, isConnected = _b.isConnected, isLoading = _b.isLoading, error = _b.error, availability = _b.availability, updateFilters = _b.updateFilters, selectSlot = _b.selectSlot, isSlotBookable = _b.isSlotBookable;
    // Atualizar filtros quando props mudarem
    (0, react_1.useEffect)(function () {
        updateFilters({
            professionalId: professionalId,
            serviceId: serviceId,
            date: selectedDate
        });
    }, [professionalId, serviceId, selectedDate, updateFilters]);
    var handleSlotClick = function (slot) {
        selectSlot(slot);
        onSlotSelect === null || onSlotSelect === void 0 ? void 0 : onSlotSelect(slot);
    };
    if (isLoading) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5"/>
                Disponibilidade em Tempo Real
              </card_1.CardTitle>
              <card_1.CardDescription>
                Carregando horários disponíveis...
              </card_1.CardDescription>
            </div>
            <skeleton_1.Skeleton className="h-6 w-6 rounded-full"/>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {__spreadArray([], Array(6), true).map(function (_, i) { return (<div key={i} className="flex gap-2">
              {__spreadArray([], Array(4), true).map(function (_, j) { return (<skeleton_1.Skeleton key={j} className="h-12 w-20"/>); })}
            </div>); })}
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-destructive">
            <lucide_react_1.XCircle className="h-5 w-5"/>
            Erro de Conectividade
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <alert_1.Alert variant="destructive">
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5"/>
              Disponibilidade em Tempo Real
              {isConnected ? (<lucide_react_1.Wifi className="h-4 w-4 text-green-500"/>) : (<lucide_react_1.WifiOff className="h-4 w-4 text-red-500"/>)}
            </card_1.CardTitle>
            <card_1.CardDescription>
              {isConnected
            ? 'Atualizações automáticas ativadas'
            : 'Reconectando...'}
            </card_1.CardDescription>
          </div>
          
          {/* Indicadores de status */}
          <div className="flex items-center gap-2">
            <badge_1.Badge variant="outline" className="text-xs">
              <lucide_react_1.Activity className="h-3 w-3 mr-1"/>
              {availability.available} disponíveis
            </badge_1.Badge>
            <badge_1.Badge variant="secondary" className="text-xs">
              <lucide_react_1.Users className="h-3 w-3 mr-1"/>
              {availability.booked} ocupados
            </badge_1.Badge>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        {Object.keys(groupedSlots).length === 0 ? (<div className="text-center py-8">
            <lucide_react_1.Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4"/>
            <p className="text-muted-foreground">
              Nenhum horário encontrado para os filtros selecionados
            </p>
          </div>) : (<div className="space-y-6">
            {Object.entries(groupedSlots).map(function (_a) {
                var date = _a[0], slots = _a[1];
                return (<div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <lucide_react_1.Calendar className="h-4 w-4"/>
                  <h3 className="font-medium">
                    {(0, date_fns_1.format)(new Date(date + 'T00:00:00'), 'EEEE, dd/MM/yyyy', { locale: locale_1.pt })}
                  </h3>
                  <badge_1.Badge variant="outline" className="ml-auto text-xs">
                    {slots.filter(function (slot) { return slot.is_available; }).length} disponíveis
                  </badge_1.Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {slots.map(function (slot) {
                        var isSelected = (selectedSlot === null || selectedSlot === void 0 ? void 0 : selectedSlot.id) === slot.id;
                        var isBookable = isSlotBookable(slot);
                        return (<button_1.Button key={slot.id} variant={isSelected ? 'default' : slot.is_available ? 'outline' : 'ghost'} size="sm" className={(0, utils_1.cn)('h-12 flex flex-col items-center justify-center text-xs', !slot.is_available && 'opacity-50 cursor-not-allowed', !isBookable && slot.is_available && 'opacity-60', isSelected && 'ring-2 ring-primary ring-offset-1')} disabled={!slot.is_available || !isBookable} onClick={function () { return isBookable && handleSlotClick(slot); }}>
                        <span className="font-medium">
                          {(0, date_fns_1.format)(new Date("2000-01-01T".concat(slot.start_time)), 'HH:mm')}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {slot.is_available ? 'Livre' : 'Ocupado'}
                        </span>
                        {isSelected && (<lucide_react_1.CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-primary"/>)}
                      </button_1.Button>);
                    })}
                </div>
              </div>);
            })}
          </div>)}

        {/* Resumo de disponibilidade */}
        {availability.total > 0 && (<div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de disponibilidade:</span>
              <span className="font-medium">
                {availability.availabilityRate}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: "".concat(availability.availabilityRate, "%") }}/>
            </div>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
