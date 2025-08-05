"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartCard = ChartCard;
var card_1 = require("@/components/ui/card");
function ChartCard(_a) {
  var title = _a.title,
    description = _a.description,
    children = _a.children,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  return (
    <card_1.Card className={"hover:shadow-lg transition-shadow duration-200 ".concat(className)}>
      <card_1.CardHeader>
        <card_1.CardTitle className="text-lg">{title}</card_1.CardTitle>
        {description && (
          <card_1.CardDescription className="text-sm text-muted-foreground">
            {description}
          </card_1.CardDescription>
        )}
      </card_1.CardHeader>
      <card_1.CardContent className="p-4">{children}</card_1.CardContent>
    </card_1.Card>
  );
}
