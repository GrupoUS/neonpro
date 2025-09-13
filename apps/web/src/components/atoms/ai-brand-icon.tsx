"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBrandIconProps {
  size?: number;
  className?: string;
  alt?: string;
  title?: string;
}

/**
 * AIBrandIcon — NeonPro AI icon with graceful fallback
 * - Uses `/brand/iconeneonpro.png` if available
 * - Falls back to a Sparkles icon if the PNG is missing or fails to load
 */
export function AIBrandIcon({
  size = 24,
  className,
  alt = "NeonPro AI",
  title = "NeonPro AI",
}: AIBrandIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Sparkles
        width={size}
        height={size}
        className={cn("text-[#AC9469]", className)}
        aria-hidden
      />
    );
  }

  return (
    <img
      src="/brand/iconeneonpro.png"
      width={size}
      height={size}
      alt={alt}
      title={title}
      className={cn("inline-block", className)}
      onError={() => setFailed(true)}
    />
  );
}
