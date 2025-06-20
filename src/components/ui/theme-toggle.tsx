"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Palette, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showCustom?: boolean;
}

export function ThemeToggle({
  className,
  showCustom = false,
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme();

  const themes = showCustom
    ? (["dark", "light", "custom"] as const)
    : (["dark", "light"] as const);

  const getIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "custom":
        return <Palette className="w-4 h-4" />;
      default:
        return <Moon className="w-4 h-4" />;
    }
  };

  const handleClick = () => {
    if (showCustom) {
      const currentIndex = themes.indexOf(theme as any);
      const nextIndex = (currentIndex + 1) % themes.length;
      setTheme(themes[nextIndex]);
    } else {
      toggleTheme();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "relative p-2 rounded-xl",
        "bg-white/5 backdrop-blur-md",
        "border border-white/10",
        "hover:bg-white/10 transition-colors",
        "group overflow-hidden",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Animated icon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -180 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 180 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-10 text-foreground"
        >
          {getIcon(theme)}
        </motion.div>
      </AnimatePresence>

      {/* Glow effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
          theme === "dark" && "bg-blue-500/20 blur-xl",
          theme === "light" && "bg-yellow-500/20 blur-xl",
          theme === "custom" &&
            "bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-xl"
        )}
      />
    </motion.button>
  );
}

// Expanded theme toggle with labels
export function ThemeToggleExpanded({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "custom", label: "Custom", icon: Palette },
  ] as const;

  return (
    <div
      className={cn(
        "flex gap-2 p-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10",
        className
      )}
    >
      {themes.map((themeOption) => {
        const Icon = themeOption.icon;
        const isActive = theme === themeOption.value;

        return (
          <motion.button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value as any)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
              "hover:bg-white/10",
              isActive && "bg-white/20 text-primary"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{themeOption.label}</span>

            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
