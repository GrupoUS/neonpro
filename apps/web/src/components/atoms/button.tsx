"use client";

import { UniversalButton, type UniversalButtonProps, universalButtonVariants } from "../ui/universal-button";
import { cn } from "@/lib/utils";

// Complete Button interface that extends UniversalButton with backward compatibility
export interface ButtonProps extends UniversalButtonProps {
  // Backward compatibility props (keeping all the old props)
  enableHoverBorder?: boolean;
  borderAnimation?: 'hover' | 'always' | 'none';
  borderDuration?: number;
  clockwise?: boolean;
}

function Button({
  // Map old props to new UniversalButton props
  enableHoverBorder,
  borderAnimation,
  borderDuration = 2,
  clockwise = true,
  
  // Pass through all other props
  className,
  variant = "default",
  size = "default",
  effect = "hover",
  children,
  disabled,
  loading,
  loadingText,
  // Gradient props from UniversalButton
  gradientFrom,
  gradientTo,
  // Shine border props from UniversalButton
  enableShineBorder,
  shineBorderWidth,
  shineDuration,
  shineColor,
  // Hover border props from UniversalButton
  hoverBorderDuration,
  hoverClockwise,
  // Neumorph props from UniversalButton
  neumorphIntensity,
  ...props
}: ButtonProps) {
  // Map legacy props to UniversalButton props
  const shouldEnableHoverBorder = enableHoverBorder || borderAnimation === 'hover';
  
  return (
    <UniversalButton
      variant={variant}
      size={size}
      effect={effect}
      disabled={disabled}
      loading={loading}
      loadingText={loadingText}
      // Gradient props
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      // Shine border props
      enableShineBorder={enableShineBorder}
      shineBorderWidth={shineBorderWidth}
      shineDuration={shineDuration}
      shineColor={shineColor}
      // Hover border props
      enableHoverBorder={shouldEnableHoverBorder}
      hoverBorderDuration={borderDuration}
      hoverClockwise={clockwise}
      // Neumorph props
      neumorphIntensity={neumorphIntensity}
      className={cn("", className)}
      {...props}
    >
      {children}
    </UniversalButton>
  );
}

// Re-export the button variants from UniversalButton
export { universalButtonVariants as buttonVariants };

export { Button };