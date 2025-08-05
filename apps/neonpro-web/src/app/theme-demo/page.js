"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ThemeDemoPage;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var utils_1 = require("@/lib/utils");
var NeonGradientCard = function (_a) {
  var className = _a.className,
    children = _a.children,
    _b = _a.borderSize,
    borderSize = _b === void 0 ? 2 : _b,
    _c = _a.borderRadius,
    borderRadius = _c === void 0 ? 20 : _c,
    _d = _a.neonColors,
    neonColors =
      _d === void 0
        ? {
            firstColor: "oklch(0.5854 0.2041 277.1173)",
            secondColor: "oklch(0.5106 0.2301 276.9656)",
          }
        : _d;
  var containerRef = (0, react_1.useRef)(null);
  var _e = (0, react_1.useState)({ width: 0, height: 0 }),
    dimensions = _e[0],
    setDimensions = _e[1];
  (0, react_1.useEffect)(function () {
    var updateDimensions = function () {
      if (containerRef.current) {
        var _a = containerRef.current,
          offsetWidth = _a.offsetWidth,
          offsetHeight = _a.offsetHeight;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return function () {
      return window.removeEventListener("resize", updateDimensions);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      style={{
        "--border-size": "".concat(borderSize, "px"),
        "--border-radius": "".concat(borderRadius, "px"),
        "--neon-first-color": neonColors.firstColor,
        "--neon-second-color": neonColors.secondColor,
        "--card-width": "".concat(dimensions.width, "px"),
        "--card-height": "".concat(dimensions.height, "px"),
        "--card-content-radius": "".concat(borderRadius - borderSize, "px"),
        "--pseudo-element-width": "".concat(dimensions.width + borderSize * 2, "px"),
        "--pseudo-element-height": "".concat(dimensions.height + borderSize * 2, "px"),
        "--after-blur": "".concat(dimensions.width / 3, "px"),
      }}
      className={(0, utils_1.cn)(
        "relative z-10 size-full rounded-[var(--border-radius)]",
        className,
      )}
    >
      <div
        className={(0, utils_1.cn)(
          "relative size-full min-h-[inherit] rounded-[var(--card-content-radius)] bg-background p-6",
          "before:absolute before:-left-[var(--border-size)] before:-top-[var(--border-size)] before:-z-10 before:block",
          "before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']",
          "before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-[length:100%_200%]",
          "before:animate-[background-position-spin_3s_infinite_alternate]",
          "after:absolute after:-left-[var(--border-size)] after:-top-[var(--border-size)] after:-z-10 after:block",
          "after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']",
          "after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-[length:100%_200%] after:opacity-80",
          "after:animate-[background-position-spin_3s_infinite_alternate]",
        )}
      >
        {children}
      </div>
    </div>
  );
};
// NEONPROV1 Theme Demo Page
function ThemeDemoPage() {
  var _a = (0, react_1.useState)(null),
    activeMetric = _a[0],
    setActiveMetric = _a[1];
  var metrics = [
    {
      title: "Pacientes Ativos",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: lucide_react_1.Users,
      neonColors: {
        firstColor: "oklch(0.5854 0.2041 277.1173)",
        secondColor: "oklch(0.5106 0.2301 276.9656)",
      },
    },
    {
      title: "Consultas Hoje",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: lucide_react_1.Calendar,
      neonColors: {
        firstColor: "oklch(0.4568 0.2146 277.0229)",
        secondColor: "oklch(0.3984 0.1773 277.3662)",
      },
    },
    {
      title: "Taxa de Recuperação",
      value: "94.8%",
      change: "+2.1%",
      trend: "up",
      icon: lucide_react_1.Heart,
      neonColors: {
        firstColor: "oklch(0.3984 0.1773 277.3662)",
        secondColor: "oklch(0.3588 0.1354 278.6973)",
      },
    },
    {
      title: "Emergências",
      value: "23",
      change: "-5.3%",
      trend: "down",
      icon: lucide_react_1.Activity,
      neonColors: {
        firstColor: "oklch(0.6368 0.2078 25.3313)",
        secondColor: "oklch(0.5854 0.2041 277.1173)",
      },
    },
  ];
  return (
    <div className="min-h-screen bg-background p-6">
      <style jsx global>
        {
          "\n        @keyframes background-position-spin {\n          0% { background-position: top center; }\n          100% { background-position: bottom center; }\n        }\n      "
        }
      </style>

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">NEONPROV1 Theme Demo</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Demonstração do tema NEONPROV1 do tweakcn.com aplicado ao sistema NeonPro
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <badge_1.Badge variant="default" className="px-3 py-1">
              OKLCH Colors
            </badge_1.Badge>
            <badge_1.Badge variant="secondary" className="px-3 py-1">
              Healthcare UI
            </badge_1.Badge>
            <badge_1.Badge variant="outline" className="px-3 py-1">
              shadcn/ui
            </badge_1.Badge>
          </div>
        </div>

        {/* Color Palette Demo */}
        <card_1.Card className="mb-8">
          <card_1.CardHeader>
            <card_1.CardTitle>Paleta de Cores NEONPROV1</card_1.CardTitle>
            <card_1.CardDescription>
              Cores baseadas em OKLCH do tema tweakcn.com para máxima fidelidade visual
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.5854 0.2041 277.1173)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Primary</p>
              </div>
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.8687 0.0043 56.3660)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Secondary</p>
              </div>
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.9376 0.0260 321.9388)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Accent</p>
              </div>
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.6368 0.2078 25.3313)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Destructive</p>
              </div>
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.9232 0.0026 48.7171)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Muted</p>
              </div>
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: "oklch(0.9699 0.0013 106.4238)" }}
                ></div>
                <p className="text-xs font-mono text-muted-foreground">Card</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Button Variants Demo */}
        <card_1.Card className="mb-8">
          <card_1.CardHeader>
            <card_1.CardTitle>Variações de Botões</card_1.CardTitle>
            <card_1.CardDescription>
              Botões usando as cores do tema NEONPROV1 com estados hover e focus
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-wrap gap-4">
              <button_1.Button variant="default">
                <lucide_react_1.Stethoscope className="w-4 h-4 mr-2" />
                Primary Button
              </button_1.Button>
              <button_1.Button variant="secondary">
                <lucide_react_1.Users className="w-4 h-4 mr-2" />
                Secondary Button
              </button_1.Button>
              <button_1.Button variant="outline">
                <lucide_react_1.Calendar className="w-4 h-4 mr-2" />
                Outline Button
              </button_1.Button>
              <button_1.Button variant="ghost">
                <lucide_react_1.Activity className="w-4 h-4 mr-2" />
                Ghost Button
              </button_1.Button>
              <button_1.Button variant="destructive">
                <lucide_react_1.X className="w-4 h-4 mr-2" />
                Destructive Button
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Metrics Grid with Neon Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Cartões com Efeito Neon (NeonGradientCard)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map(function (metric, index) {
              var Icon = metric.icon;
              return (
                <NeonGradientCard
                  key={metric.title}
                  className="h-48"
                  neonColors={metric.neonColors}
                >
                  <div
                    className="h-full flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-105"
                    onMouseEnter={function () {
                      return setActiveMetric(metric.title);
                    }}
                    onMouseLeave={function () {
                      return setActiveMetric(null);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <badge_1.Badge
                        variant={metric.trend === "up" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {metric.change}
                      </badge_1.Badge>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{metric.value}</h3>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                    </div>
                    {activeMetric === metric.title && (
                      <div className="mt-4 flex items-center gap-2">
                        <lucide_react_1.TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Hover ativo</span>
                      </div>
                    )}
                  </div>
                </NeonGradientCard>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Indicators */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Indicadores de Status</card_1.CardTitle>
              <card_1.CardDescription>
                Badges e indicadores usando as cores do tema NEONPROV1
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <badge_1.Badge className="status-scheduled">Agendado</badge_1.Badge>
                  <badge_1.Badge className="status-confirmed">Confirmado</badge_1.Badge>
                  <badge_1.Badge className="status-pending">Pendente</badge_1.Badge>
                  <badge_1.Badge className="status-cancelled">Cancelado</badge_1.Badge>
                  <badge_1.Badge className="status-completed">Concluído</badge_1.Badge>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <lucide_react_1.UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Dr. Silva</p>
                        <p className="text-sm text-muted-foreground">Cardiologista</p>
                      </div>
                    </div>
                    <badge_1.Badge variant="default">Online</badge_1.Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <lucide_react_1.Clock className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Próxima Consulta</p>
                        <p className="text-sm text-muted-foreground">15:30 - Maria Santos</p>
                      </div>
                    </div>
                    <badge_1.Badge variant="secondary">Em 30min</badge_1.Badge>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Theme Information */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Informações do Tema</card_1.CardTitle>
              <card_1.CardDescription>
                Especificações técnicas do tema NEONPROV1
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Fonte Principal</p>
                    <p className="text-muted-foreground">Inter</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fonte Serifada</p>
                    <p className="text-muted-foreground">Lora</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fonte Mono</p>
                    <p className="text-muted-foreground">Libre Baskerville</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Border Radius</p>
                    <p className="text-muted-foreground">1.25rem</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-foreground mb-2">Cores Primárias (OKLCH)</p>
                  <div className="space-y-1 text-xs font-mono">
                    <p className="text-muted-foreground">Primary: oklch(0.5854 0.2041 277.1173)</p>
                    <p className="text-muted-foreground">Secondary: oklch(0.8687 0.0043 56.3660)</p>
                    <p className="text-muted-foreground">Accent: oklch(0.9376 0.0260 321.9388)</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-foreground mb-2">Sistema de Sombras</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-card shadow-xs border">Shadow XS</div>
                    <div className="p-3 rounded-lg bg-card shadow-sm border">Shadow SM</div>
                    <div className="p-3 rounded-lg bg-card shadow-md border">Shadow MD</div>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        {/* Footer */}
        <card_1.Card>
          <card_1.CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                ✅ Tema NEONPROV1 Instalado com Sucesso!
              </h3>
              <p className="text-muted-foreground mb-4">
                Todas as cores, componentes e estilos do tema tweakcn.com foram aplicados
                corretamente ao projeto NeonPro
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button_1.Button variant="default">
                  <lucide_react_1.Star className="w-4 h-4 mr-2" />
                  Começar Desenvolvimento
                </button_1.Button>
                <button_1.Button variant="outline">
                  <lucide_react_1.Settings className="w-4 h-4 mr-2" />
                  Personalizar Tema
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>
  );
}
