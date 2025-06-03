import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-xl transition-all duration-300 group glow-sacha"
      aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      title={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <div className="relative">
        {theme === 'light' ? (
          <Moon className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        ) : (
          <Sun className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        )}
        <div className="absolute inset-0 rounded-full bg-accent/20 scale-0 group-hover:scale-150 transition-transform duration-300 opacity-0 group-hover:opacity-100 blur-sm" />
      </div>
    </Button>
  );
};
