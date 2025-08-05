'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePickerWithRange = DatePickerWithRange;
var React = require("react");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
function DatePickerWithRange(_a) {
    var className = _a.className, date = _a.date, onDateChange = _a.onDateChange;
    return (<div className={(0, utils_1.cn)('grid gap-2', className)}>
      <popover_1.Popover>
        <popover_1.PopoverTrigger asChild>
          <button_1.Button id="date" variant={'outline'} className={(0, utils_1.cn)('w-[300px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
            <lucide_react_1.CalendarIcon className="mr-2 h-4 w-4"/>
            {(date === null || date === void 0 ? void 0 : date.from) ? (date.to ? (<>
                  {(0, date_fns_1.format)(date.from, 'dd/MM/yyyy', { locale: locale_1.ptBR })} -{' '}
                  {(0, date_fns_1.format)(date.to, 'dd/MM/yyyy', { locale: locale_1.ptBR })}
                </>) : ((0, date_fns_1.format)(date.from, 'dd/MM/yyyy', { locale: locale_1.ptBR }))) : (<span>Selecione o período</span>)}
          </button_1.Button>
        </popover_1.PopoverTrigger>
        <popover_1.PopoverContent className="w-auto p-0" align="start">
          <calendar_1.Calendar initialFocus mode="range" defaultMonth={date === null || date === void 0 ? void 0 : date.from} selected={date} onSelect={onDateChange} numberOfMonths={2} locale={locale_1.ptBR}/>
        </popover_1.PopoverContent>
      </popover_1.Popover>
    </div>);
}
