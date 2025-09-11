import React from "react";
import { cn } from "@/lib/utils";

interface AceternityButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "shimmer" | "glow";
}

export const AceternityButton = ({ 
  children, 
  className, 
  variant = "default",
  ...props 
}: AceternityButtonProps) => {
  const variants = {
    default: "px-4 py-2 rounded-md bg-black text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-black",
    shimmer: "animate-shimmer border border-border bg-[linear-gradient(110deg,hsl(var(--background)),45%,hsl(var(--primary)),55%,hsl(var(--background)))] bg-[length:200%_100%] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background px-4 py-2 rounded-md font-medium",
    glow: "px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold transition duration-200 hover:shadow-lg hover:shadow-blue-500/25"
  };

  return (
    <button
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};
