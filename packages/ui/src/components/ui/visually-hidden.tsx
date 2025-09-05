import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * NEONPRO HEALTHCARE - VISUALLY HIDDEN COMPONENT
 *
 * Component that hides content visually but keeps it available to screen readers.
 * Essential for providing context and additional information to assistive technologies
 * without cluttering the visual interface.
 *
 * WCAG 2.1 AA Compliance:
 * - Success Criterion 1.3.1 Info and Relationships (Level A)
 * - Success Criterion 4.1.3 Status Messages (Level AA)
 * - Provides additional context for screen readers
 * - Maintains semantic meaning while reducing visual noise
 *
 * Healthcare Use Cases:
 * - Medical terminology explanations
 * - Privacy and LGPD notices
 * - Form field instructions
 * - Status announcements
 * - Emergency procedure details
 */

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Content to be hidden visually but available to screen readers
   */
  children: React.ReactNode;

  /**
   * Whether the content should be focusable (useful for skip links)
   */
  focusable?: boolean;

  /**
   * Healthcare context for specialized styling or behavior
   */
  medicalContext?:
    | "instruction"
    | "warning"
    | "privacy"
    | "emergency"
    | "definition";

  /**
   * ARIA live region type for dynamic content
   */
  liveRegion?: "off" | "polite" | "assertive";

  /**
   * Whether to use atomic announcement (entire region is announced)
   */
  atomic?: boolean;

  /**
   * For form-related hidden content, associate with form control
   */
  htmlFor?: string;

  /**
   * Element tag to render (default: span)
   */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * CSS classes that hide content visually but keep it available to screen readers
 *
 * This implementation:
 * - Positions element off-screen
 * - Uses 1px size to avoid complete display:none
 * - Prevents text from appearing in visual viewport
 * - Maintains accessibility tree presence
 * - Allows focus when needed
 */
const visuallyHiddenClasses = cn(
  "absolute",
  "h-px w-px",
  "m-[-1px] p-0",
  "overflow-hidden",
  "whitespace-nowrap",
  "border-0",
  "clip-path-[inset(50%)]", // Modern browsers
  "[clip:rect(0,0,0,0)]", // Legacy browsers fallback
);

const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  (
    {
      children,
      className,
      focusable = false,
      medicalContext,
      liveRegion = "off",
      atomic = false,
      htmlFor,
      as: Component = "span",
      ...props
    },
    ref,
  ) => {
    // Determine additional attributes based on medical context
    const getContextAttributes = () => {
      const attrs: Record<string, unknown> = {};

      if (medicalContext) {
        attrs["data-medical-context"] = medicalContext;

        // Add role based on context
        switch (medicalContext) {
          case "warning":
          case "emergency": {
            attrs.role = "alert";
            attrs["aria-live"] = "assertive";
            break;
          }
          case "instruction":
          case "definition": {
            attrs.role = "note";
            break;
          }
          case "privacy": {
            attrs.role = "region";
            attrs["aria-label"] = "Informações de Privacidade";
            break;
          }
        }
      }

      // Live region attributes
      if (liveRegion !== "off") {
        attrs["aria-live"] = liveRegion;
        attrs["aria-atomic"] = atomic;
      }

      // Form association
      if (htmlFor) {
        attrs["data-form-control"] = htmlFor;
      }

      return attrs;
    };

    const contextAttributes = getContextAttributes();

    return React.createElement(
      Component as any,
      {
        ref,
        className: cn(
          visuallyHiddenClasses,
          // Allow focusing if focusable
          focusable
            && "focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible focus:whitespace-normal focus:rounded-md focus:border focus:bg-background focus:p-2 focus:text-foreground focus:shadow-lg",
          className,
        ),
        ...contextAttributes,
        ...props,
      },
      children,
    );
  },
);

VisuallyHidden.displayName = "VisuallyHidden";

/**
 * ScreenReaderOnly - Alias for VisuallyHidden with clearer intent
 */
const ScreenReaderOnly = VisuallyHidden;

/**
 * MedicalDefinition - Hidden medical term definitions
 */
interface MedicalDefinitionProps extends Omit<VisuallyHiddenProps, "medicalContext"> {
  term: string;
  definition: string;
}

const MedicalDefinition = React.forwardRef<HTMLElement, MedicalDefinitionProps>(
  ({ term, definition, children, ...props }, ref) => (
    <VisuallyHidden
      medicalContext="definition"
      ref={ref}
      role="definition"
      {...props}
    >
      {children || `${term}: ${definition}`}
    </VisuallyHidden>
  ),
);

MedicalDefinition.displayName = "MedicalDefinition";

/**
 * LGPDNotice - Hidden LGPD/privacy notices
 */
interface LGPDNoticeProps extends Omit<VisuallyHiddenProps, "medicalContext" | "children"> {
  context: "collection" | "processing" | "storage" | "sharing" | "rights";
  notice?: string;
  children?: React.ReactNode;
}

const LGPDNotice = React.forwardRef<HTMLElement, LGPDNoticeProps>(
  ({ context, notice, children, ...props }, ref) => {
    const defaultNotices = {
      collection: "Este campo coleta dados pessoais em conformidade com a LGPD",
      processing: "Seus dados serão processados conforme nossa política de privacidade",
      storage: "Dados armazenados com segurança por período determinado pela LGPD",
      sharing: "Dados não serão compartilhados sem seu consentimento explícito",
      rights: "Você pode exercer seus direitos LGPD a qualquer momento",
    };

    return (
      <VisuallyHidden
        aria-label={`Aviso LGPD - ${context}`}
        medicalContext="privacy"
        ref={ref}
        role="region"
        {...props}
      >
        {children || notice || defaultNotices[context]}
      </VisuallyHidden>
    );
  },
);

LGPDNotice.displayName = "LGPDNotice";

/**
 * EmergencyInstruction - Hidden emergency procedure instructions
 */
interface EmergencyInstructionProps
  extends Omit<VisuallyHiddenProps, "medicalContext" | "liveRegion">
{
  instruction: string;
  priority?: "normal" | "high" | "critical";
}

const EmergencyInstruction = React.forwardRef<
  HTMLElement,
  EmergencyInstructionProps
>(({ instruction, priority = "normal", children, ...props }, ref) => (
  <VisuallyHidden
    atomic={priority === "critical"}
    data-priority={priority}
    liveRegion={priority === "critical" ? "assertive" : "polite"}
    medicalContext="emergency"
    ref={ref}
    role="alert"
    {...props}
  >
    {children || instruction}
  </VisuallyHidden>
));

EmergencyInstruction.displayName = "EmergencyInstruction";

/**
 * FormInstruction - Hidden form field instructions
 */
interface FormInstructionProps extends Omit<VisuallyHiddenProps, "medicalContext" | "children"> {
  fieldId: string;
  instruction: string;
  required?: boolean;
  sensitive?: boolean;
  children?: React.ReactNode;
}

const FormInstruction = React.forwardRef<HTMLElement, FormInstructionProps>(
  (
    {
      fieldId,
      instruction,
      required = false,
      sensitive = false,
      children,
      ...props
    },
    ref,
  ) => (
    <VisuallyHidden
      data-required={required}
      data-sensitive={sensitive}
      htmlFor={fieldId}
      id={`${fieldId}-instruction`}
      medicalContext="instruction"
      ref={ref}
      {...props}
    >
      {children
        || `${instruction}${required ? " (Campo obrigatório)" : ""}${
          sensitive ? " (Dados sensíveis - protegido pela LGPD)" : ""
        }`}
    </VisuallyHidden>
  ),
);

FormInstruction.displayName = "FormInstruction";

/**
 * StatusAnnouncement - Live region for status announcements
 */
interface StatusAnnouncementProps extends Omit<VisuallyHiddenProps, "liveRegion"> {
  message: string;
  priority?: "polite" | "assertive";
  temporary?: boolean;
  clearAfter?: number; // milliseconds
}

const StatusAnnouncement = React.forwardRef<
  HTMLElement,
  StatusAnnouncementProps
>(
  (
    {
      message,
      priority = "polite",
      temporary = false,
      clearAfter = 5000,
      children,
      ...props
    },
    ref,
  ) => {
    const [currentMessage, setCurrentMessage] = React.useState(message);

    React.useEffect(() => {
      setCurrentMessage(message);

      if (temporary && clearAfter > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage("");
        }, clearAfter);

        return () => clearTimeout(timer);
      }
    }, [message, temporary, clearAfter]);

    return (
      <VisuallyHidden
        aria-label="Status do sistema"
        atomic
        liveRegion={priority}
        ref={ref}
        role="status"
        {...props}
      >
        {currentMessage || children}
      </VisuallyHidden>
    );
  },
);

StatusAnnouncement.displayName = "StatusAnnouncement";

/**
 * Hook for programmatic announcements to screen readers
 */
export const useScreenReaderAnnouncement = () => {
  const announce = React.useCallback(
    (
      message: string,
      priority: "polite" | "assertive" = "polite",
      clearAfter = 5000,
    ) => {
      // Create temporary announcement element
      const announcement = document.createElement("div");
      announcement.className = visuallyHiddenClasses;
      announcement.setAttribute("aria-live", priority);
      announcement.setAttribute("aria-atomic", "true");
      announcement.textContent = message;

      // Add to DOM
      document.body.append(announcement);

      // Remove after screen reader processes it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, clearAfter);
    },
    [],
  );

  return { announce };
};

export {
  EmergencyInstruction,
  type EmergencyInstructionProps,
  FormInstruction,
  type FormInstructionProps,
  LGPDNotice,
  type LGPDNoticeProps,
  MedicalDefinition,
  type MedicalDefinitionProps,
  ScreenReaderOnly,
  StatusAnnouncement,
  type StatusAnnouncementProps,
  VisuallyHidden,
  visuallyHiddenClasses,
  type VisuallyHiddenProps,
};
