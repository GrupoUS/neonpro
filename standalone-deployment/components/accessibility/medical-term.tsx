import { cn } from "@/lib/utils";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";

interface MedicalTermProps {
  /** The medical term to be displayed */
  term: string;
  /** Optional phonetic pronunciation guide for screen readers */
  pronunciation?: string;
  /** Medical definition/explanation of the term */
  definition: string;
  /** Category of medical term for context */
  category: "procedure" | "medication" | "equipment" | "emergency" | "regulatory" | "document";
  /** Whether to announce the definition immediately */
  announceOnMount?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** The visual content to display */
  children: React.ReactNode;
}

// Portuguese medical terminology pronunciation dictionary
const MEDICAL_PRONUNCIATION_GUIDE = {
  // Aesthetic Procedures
  "botox": "bó-tocs - Toxina botulínica para relaxamento muscular e redução de rugas",
  "preenchimento": "preen-chi-men-to - Ácido hialurônico para aumento de volume facial",
  "harmonização": "ar-mo-ni-za-ção - Procedimento de equilibrio das proporções faciais",
  "peeling": "pí-ling - Esfoliação química para renovação da pele",
  "microagulhamento": "mi-cro-a-gu-lha-men-to - Procedimento de renovação cutânea com microlesões",

  // Laser Terms
  "fraxel": "frác-sel - Laser fracionado para renovação e rejuvenescimento da pele",
  "ipl": "i-pê-éle - Luz Intensa Pulsada para tratamento de manchas e pelos",
  "co2": "cê-o-dois - Laser de dióxido de carbono para resurfacing da pele",

  // Brazilian Medical Documents
  "cpf": "cê-pê-éfe - Cadastro de Pessoa Física, documento de identificação brasileiro",
  "rg": "erre-gê - Registro Geral, carteira de identidade civil brasileira",
  "cns": "cê-ene-esse - Cartão Nacional de Saúde do Sistema Único de Saúde",
  "crm": "cê-erre-ême - Conselho Regional de Medicina, registro profissional médico",

  // Regulatory Terms
  "lgpd": "éle-gê-pê-dê - Lei Geral de Proteção de Dados, legislação brasileira de privacidade",
  "anvisa": "an-vi-za - Agência Nacional de Vigilância Sanitária, órgão regulador brasileiro",
  "cfm": "cê-éfe-ême - Conselho Federal de Medicina, órgão normativo da medicina brasileira",
  "vigimed": "vi-gi-med - Sistema de Vigilância de Medicamentos da ANVISA",

  // Emergency Medical Terms
  "emergência": "e-mer-gên-ci-a - Situação médica que requer atendimento imediato",
  "socorro": "so-cor-ro - Pedido de ajuda médica urgente",
  "iam": "i-á-ême - Infarto Agudo do Miocárdio, ataque cardíaco",
  "avc": "á-vê-cê - Acidente Vascular Cerebral, derrame cerebral",
  "samu": "sa-mu - Serviço de Atendimento Móvel de Urgência, ambulância brasileira",

  // Vital Signs
  "pa": "pê-á - Pressão Arterial, medida da pressão sanguínea",
  "fc": "éfe-cê - Frequência Cardíaca, batimentos cardíacos por minuto",
  "spo2": "esse-pê-o-dois - Saturação de Oxigênio no sangue periférico",
  "temp": "tem-pe-ra-tu-ra - Temperatura corporal em graus Celsius",
};

// Category-specific contexts for better screen reader understanding
const CATEGORY_CONTEXTS = {
  procedure: "Procedimento médico",
  medication: "Medicamento ou substância terapêutica",
  equipment: "Equipamento ou instrumento médico",
  emergency: "Termo de emergência médica",
  regulatory: "Termo regulatório brasileiro de saúde",
  document: "Documento de identificação brasileiro",
};

/**
 * Enhanced medical terminology component with Portuguese screen reader optimization
 * Provides pronunciation guides and contextual information for Brazilian healthcare terms
 */
export function MedicalTerm({
  term,
  pronunciation,
  definition,
  category,
  announceOnMount = false,
  className,
  children,
}: MedicalTermProps) {
  const termRef = useRef<HTMLSpanElement>(null);

  // Get pronunciation guide from dictionary or use provided pronunciation
  const getPronunciationGuide = useCallback(() => {
    const dictionaryEntry = MEDICAL_PRONUNCIATION_GUIDE[term.toLowerCase()];
    if (dictionaryEntry) {
      return dictionaryEntry;
    }

    const categoryContext = CATEGORY_CONTEXTS[category];
    return pronunciation
      ? `${pronunciation} - ${definition}`
      : `${categoryContext}: ${definition}`;
  }, [term, pronunciation, definition, category]);

  // Announce medical term on mount if requested (for critical terms)
  useEffect(() => {
    if (announceOnMount && termRef.current) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.setAttribute("lang", "pt-BR");
      announcement.className = "sr-only";
      announcement.textContent = `Termo médico: ${getPronunciationGuide()}`;

      document.body.append(announcement);

      // Clean up announcement after screen reader processes it
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 3000);
    }
  }, [announceOnMount, term, getPronunciationGuide]);

  const fullAriaLabel = getPronunciationGuide();

  return (
    <span
      ref={termRef}
      lang="pt-BR"
      aria-label={fullAriaLabel}
      data-medical-term={term}
      data-category={category}
      role="term"
      className={cn(
        "medical-term",
        // Category-specific styling for visual context
        category === "emergency" && "font-semibold text-emergency-critical",
        category === "regulatory" && "text-lgpd-compliant font-medium",
        category === "procedure" && "text-healthcare-info",
        category === "document" && "font-mono text-sm",
        // Focus enhancement for keyboard navigation
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm px-1",
        // Subtle visual indication this is a medical term
        "underline decoration-dotted decoration-muted-foreground underline-offset-2",
        className,
      )}
      // Make medical terms focusable for keyboard users wanting definitions
      tabIndex={0}
      onFocus={() => {
        // Optional: Announce definition when focused
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("lang", "pt-BR");
        announcement.className = "sr-only";
        announcement.textContent = fullAriaLabel;
        document.body.append(announcement);
        setTimeout(() => {
          if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
          }
        }, 4000);
      }}
    >
      {children}
    </span>
  );
}

/**
 * Specialized component for emergency medical terminology with immediate announcements
 */
export function EmergencyMedicalTerm({
  children,
  ...props
}: Omit<MedicalTermProps, "category" | "announceOnMount">) {
  return (
    <MedicalTerm
      {...props}
      category="emergency"
      announceOnMount
      className={cn("animate-pulse", props.className)}
    >
      {children}
    </MedicalTerm>
  );
}

/**
 * Specialized component for Brazilian regulatory terms (LGPD, ANVISA, CFM)
 */
export function RegulatoryTerm({
  children,
  ...props
}: Omit<MedicalTermProps, "category">) {
  return (
    <MedicalTerm
      {...props}
      category="regulatory"
      className={cn("font-medium", props.className)}
    >
      {children}
    </MedicalTerm>
  );
}

/**
 * Specialized component for Brazilian medical documents (CPF, RG, CNS, CRM)
 */
export function MedicalDocumentTerm({
  children,
  ...props
}: Omit<MedicalTermProps, "category">) {
  return (
    <MedicalTerm
      {...props}
      category="document"
      className={cn("font-mono text-sm bg-muted px-1 rounded", props.className)}
    >
      {children}
    </MedicalTerm>
  );
}

/**
 * Hook for announcing medical terms programmatically
 */
export function useMedicalAnnouncement() {
  const announceMedicalTerm = (
    term: string,
    category: MedicalTermProps["category"] = "procedure",
  ) => {
    const dictionaryEntry = MEDICAL_PRONUNCIATION_GUIDE[term.toLowerCase()];
    const categoryContext = CATEGORY_CONTEXTS[category];

    const announcement = dictionaryEntry || `${categoryContext}: ${term}`;

    const element = document.createElement("div");
    element.setAttribute("aria-live", "polite");
    element.setAttribute("aria-atomic", "true");
    element.setAttribute("lang", "pt-BR");
    element.className = "sr-only";
    element.textContent = announcement;

    document.body.append(element);

    setTimeout(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    }, 3000);
  };

  const announceEmergency = (message: string) => {
    const element = document.createElement("div");
    element.setAttribute("role", "alert");
    element.setAttribute("aria-live", "assertive");
    element.setAttribute("lang", "pt-BR");
    element.className = "sr-only";
    element.textContent = `🚨 EMERGÊNCIA MÉDICA: ${message}`;

    document.body.append(element);

    setTimeout(() => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    }, 5000);
  };

  return { announceMedicalTerm, announceEmergency };
}
