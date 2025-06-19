import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const cardVariants = cva(
  "relative overflow-hidden rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10",
          "border border-white/20 dark:border-gray-700/20",
          "shadow-[0_8px_32px_rgba(17,32,49,0.08)]",
          "hover:shadow-[0_8px_40px_rgba(172,148,105,0.12)]",
          "hover:backdrop-blur-2xl",
          "hover:bg-white/15 dark:hover:bg-gray-900/15",
        ],
        elevated: [
          "backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/5",
          "dark:from-gray-900/20 dark:to-gray-900/5",
          "border border-white/25 dark:border-gray-700/25",
          "shadow-[0_20px_60px_rgba(17,32,49,0.12)]",
          "hover:shadow-[0_30px_80px_rgba(172,148,105,0.2)]",
          "hover:scale-[1.02] hover:-translate-y-1",
        ],
        interactive: [
          "backdrop-blur-lg bg-gradient-to-br from-white/15 via-white/10 to-transparent",
          "dark:from-gray-900/15 dark:via-gray-900/10",
          "border border-white/30 dark:border-gray-700/30",
          "shadow-[0_10px_40px_rgba(17,32,49,0.1)]",
          "hover:shadow-[0_15px_50px_rgba(172,148,105,0.15)]",
          "hover:border-[#AC9469]/30",
          "cursor-pointer select-none",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      "relative z-10", // Ensure content is above gradient backgrounds
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", "relative z-10", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", "relative z-10", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Gradient accent component for cards
export const CardGradientAccent = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "absolute inset-0 opacity-0 transition-opacity duration-300",
      "bg-gradient-to-br from-[#AC9469]/20 via-transparent to-[#112031]/20",
      "group-hover:opacity-100",
      className
    )}
  />
);

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
