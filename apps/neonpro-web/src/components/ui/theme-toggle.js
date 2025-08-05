"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
exports.SimpleThemeToggle = SimpleThemeToggle;
var React = require("react");
var lucide_react_1 = require("lucide-react");
var next_themes_1 = require("next-themes");
var button_1 = require("@/components/ui/button");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
function ThemeToggle() {
  var setTheme = (0, next_themes_1.useTheme)().setTheme;
  return (
    <dropdown_menu_1.DropdownMenu>
      <dropdown_menu_1.DropdownMenuTrigger asChild>
        <button_1.Button variant="outline" size="icon">
          <lucide_react_1.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <lucide_react_1.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </button_1.Button>
      </dropdown_menu_1.DropdownMenuTrigger>
      <dropdown_menu_1.DropdownMenuContent align="end">
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("light");
          }}
        >
          Claro
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("dark");
          }}
        >
          Escuro
        </dropdown_menu_1.DropdownMenuItem>
        <dropdown_menu_1.DropdownMenuItem
          onClick={function () {
            return setTheme("system");
          }}
        >
          Sistema
        </dropdown_menu_1.DropdownMenuItem>
      </dropdown_menu_1.DropdownMenuContent>
    </dropdown_menu_1.DropdownMenu>
  );
}
// Versão simplificada do botão de alternância
function SimpleThemeToggle() {
  var _a = (0, next_themes_1.useTheme)(),
    theme = _a.theme,
    setTheme = _a.setTheme;
  var _b = React.useState(false),
    mounted = _b[0],
    setMounted = _b[1];
  React.useEffect(function () {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <button_1.Button
      variant="outline"
      size="icon"
      onClick={function () {
        return setTheme(theme === "light" ? "dark" : "light");
      }}
      className="relative"
    >
      <lucide_react_1.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <lucide_react_1.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {theme === "light" ? "Alternar para modo escuro" : "Alternar para modo claro"}
      </span>
    </button_1.Button>
  );
}
