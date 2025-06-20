import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NeonProLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

export function NeonProLogo({
  size = "md",
  animated = true,
  className,
}: NeonProLogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const containerClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
    xl: "p-6",
  };

  return (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : {}}
      animate={animated ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "relative inline-flex items-center justify-center",
        containerClasses[size],
        className
      )}
    >
      {/* Background glow */}
      <motion.div
        initial={animated ? { opacity: 0 } : {}}
        animate={animated ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-grupous-secondary/20 blur-xl"
      />

      {/* Main logo container */}
      <motion.div
        whileHover={animated ? { scale: 1.05, rotate: 2 } : {}}
        transition={{ duration: 0.3 }}
        className="relative bg-gradient-to-br from-grupous-primary via-primary to-grupous-secondary rounded-2xl shadow-2xl"
      >
        {/* Inner logo - Custom NeonPro Icon */}
        <svg
          className={cn(sizeClasses[size], "text-white")}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* N letter with neon effect */}
          <motion.path
            initial={animated ? { pathLength: 0 } : {}}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
            d="M6 8V24H9V16L15 24H18V8H15V16L9 8H6Z"
            fill="currentColor"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />

          {/* Neon glow lines */}
          <motion.path
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: [0, 1, 0] } : {}}
            transition={{
              delay: 1.8,
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            d="M22 8L26 16L22 24"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Secondary accent */}
          <motion.circle
            initial={animated ? { scale: 0 } : {}}
            animate={animated ? { scale: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
            cx="26"
            cy="8"
            r="2"
            fill="rgba(255,255,255,0.6)"
          />
        </svg>

        {/* Animated shine effect */}
        {animated && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: [0, 1, 0], x: 20 }}
            transition={{
              delay: 2,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 4,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 overflow-hidden rounded-2xl"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export default NeonProLogo;
