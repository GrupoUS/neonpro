import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * NEONPRO HEALTHCARE - SKIP LINK COMPONENT
 *
 * Essential accessibility component that provides keyboard users with a way
 * to skip repetitive navigation elements and jump directly to main content.
 *
 * WCAG 2.1 AA Compliance:
 * - Success Criterion 2.4.1 Bypass Blocks (Level A)
 * - Enhances keyboard navigation efficiency
 * - Critical for screen reader users
 */

const skipLinkVariants = cva(
  "-translate-x-1/2 absolute top-4 left-1/2 z-[9999] transform rounded-md px-4 py-2 font-medium text-sm shadow-lg transition-all duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
  {
    variants: {
      variant: {
        default: "border-2 border-primary bg-primary text-primary-foreground focus:ring-primary",
        healthcare:
          "border-2 border-primary/50 bg-gradient-primary text-primary-foreground shadow-healthcare-lg backdrop-blur-sm focus:ring-primary",
        emergency:
          "animate-pulse-healthcare border-2 border-destructive bg-gradient-to-br from-destructive via-red-600 to-destructive text-destructive-foreground shadow-healthcare-xl focus:ring-destructive",
      },
      position: {
        "top-left": "top-4 left-4 translate-x-0",
        "top-center": "-translate-x-1/2 top-4 left-1/2",
        "top-right": "top-4 right-4 translate-x-0",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        default: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "healthcare",
      position: "top-center",
      size: "default",
    },
  },
);

interface SkipLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof skipLinkVariants>
{
  targetId: string;
  children?: React.ReactNode;
  showOnFocus?: boolean;
  medicalContext?: boolean;
  emergencyMode?: boolean;
}

const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    {
      className,
      variant = "healthcare",
      position = "top-center",
      size = "default",
      targetId,
      children = "Pular para o conteúdo principal",
      showOnFocus = true,
      medicalContext = false,
      emergencyMode = false,
      ...props
    },
    ref,
  ) => {
    // Auto-detect variant based on context
    const finalVariant = emergencyMode
      ? "emergency"
      : medicalContext
      ? "healthcare"
      : variant;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      // Find target element
      const targetElement = document.getElementById(targetId);
      if (!targetElement) {
        return;
      }

      // Focus the target element
      // Make it focusable if it isn't already
      const originalTabIndex = targetElement.getAttribute("tabindex");
      if (targetElement.tabIndex < 0) {
        targetElement.setAttribute("tabindex", "-1");
      }

      targetElement.focus();

      // Restore original tabindex after focus
      if (originalTabIndex === null) {
        targetElement.removeAttribute("tabindex");
      } else {
        targetElement.setAttribute("tabindex", originalTabIndex);
      }

      // Smooth scroll to target
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Announce to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = `Saltou para ${
        targetElement.textContent?.slice(0, 50) || "conteúdo principal"
      }`;

      document.body.append(announcement);

      // Clean up announcement after screen reader processes it
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);

      // Call original onClick if provided
      props.onClick?.(e);
    };

    return (
      <a
        className={cn(
          skipLinkVariants({ variant: finalVariant, position, size }),
          // Hide by default, show on focus (unless showOnFocus is false)
          showOnFocus
            && "-translate-y-full opacity-0 focus:translate-y-0 focus:opacity-100",
          !showOnFocus && "translate-y-0 opacity-100",
          className,
        )}
        data-emergency={emergencyMode}
        data-medical-context={medicalContext}
        data-skip-link="true"
        data-target={targetId}
        href={`#${targetId}`}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {children}
      </a>
    );
  },
);

SkipLink.displayName = "SkipLink";

/**
 * SkipToContent - Specialized skip link for main content
 */
const SkipToContent = React.forwardRef<
  HTMLAnchorElement,
  Omit<SkipLinkProps, "targetId" | "children">
>(({ ...props }, ref) => (
  <SkipLink ref={ref} targetId="main-content" {...props}>
    Pular para o conteúdo principal
  </SkipLink>
));

SkipToContent.displayName = "SkipToContent";

/**
 * SkipToNavigation - Skip link for main navigation
 */
const SkipToNavigation = React.forwardRef<
  HTMLAnchorElement,
  Omit<SkipLinkProps, "targetId" | "children">
>(({ ...props }, ref) => (
  <SkipLink ref={ref} targetId="main-navigation" {...props}>
    Pular para a navegação principal
  </SkipLink>
));

SkipToNavigation.displayName = "SkipToNavigation";

/**
 * SkipToEmergency - Emergency skip link for critical medical interfaces
 */
const SkipToEmergency = React.forwardRef<
  HTMLAnchorElement,
  Omit<SkipLinkProps, "targetId" | "children" | "emergencyMode">
>(({ ...props }, ref) => (
  <SkipLink
    emergencyMode
    ref={ref}
    targetId="emergency-content"
    variant="emergency"
    {...props}
  >
    🚨 Pular para Emergência
  </SkipLink>
));

SkipToEmergency.displayName = "SkipToEmergency";

/**
 * SkipLinkContainer - Container for multiple skip links
 */
interface SkipLinkContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  medicalContext?: boolean;
  emergencyMode?: boolean;
}

const SkipLinkContainer = React.forwardRef<
  HTMLDivElement,
  SkipLinkContainerProps
>(
  (
    {
      className,
      children,
      medicalContext = false,
      emergencyMode = false,
      ...props
    },
    ref,
  ) => (
    <div
      className={cn(
        "skip-link-container relative z-[9999]",
        medicalContext && "healthcare-context",
        emergencyMode && "emergency-context",
        className,
      )}
      data-emergency={emergencyMode}
      data-medical-context={medicalContext}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  ),
);

SkipLinkContainer.displayName = "SkipLinkContainer";

export {
  SkipLink,
  SkipLinkContainer,
  type SkipLinkContainerProps,
  type SkipLinkProps,
  skipLinkVariants,
  SkipToContent,
  SkipToEmergency,
  SkipToNavigation,
};
