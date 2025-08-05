'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveBarChart = InteractiveBarChart;
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
function InteractiveBarChart(_a) {
    var title = _a.title, data = _a.data, bars = _a.bars, _b = _a.height, height = _b === void 0 ? 350 : _b, className = _a.className, _c = _a.xAxisDataKey, xAxisDataKey = _c === void 0 ? 'name' : _c, _d = _a.showGrid, showGrid = _d === void 0 ? true : _d, _e = _a.showLegend, showLegend = _e === void 0 ? true : _e, formatTooltip = _a.formatTooltip, formatXAxisLabel = _a.formatXAxisLabel, formatYAxisLabel = _a.formatYAxisLabel;
    var defaultTooltipFormatter = function (value, name) {
        if (formatTooltip) {
            return formatTooltip(value, name);
        }
        // Default formatting for common cases
        if (typeof value === 'number') {
            if (name.toLowerCase().includes('revenue') || name.toLowerCase().includes('receita')) {
                return ["R$ ".concat(value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })), name];
            }
            return [value.toLocaleString('pt-BR'), name];
        }
        return [value, name];
    };
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle>{title}</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent>
        <recharts_1.ResponsiveContainer width="100%" height={height}>
          <recharts_1.BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <recharts_1.CartesianGrid strokeDasharray="3 3" className="stroke-muted"/>}
            <recharts_1.XAxis dataKey={xAxisDataKey} tick={{ fontSize: 12 }} tickFormatter={formatXAxisLabel} className="text-muted-foreground"/>
            <recharts_1.YAxis tick={{ fontSize: 12 }} tickFormatter={formatYAxisLabel} className="text-muted-foreground"/>
            <recharts_1.Tooltip formatter={defaultTooltipFormatter} labelClassName="font-medium" contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
        }}/>
            {showLegend && <recharts_1.Legend />}
            {bars.map(function (bar) { return (<recharts_1.Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color} name={bar.name} radius={[4, 4, 0, 0]}/>); })}
          </recharts_1.BarChart>
        </recharts_1.ResponsiveContainer>
      </card_1.CardContent>
    </card_1.Card>);
}
