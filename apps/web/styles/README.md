# TweakCN NEONPRO Theme Foundation

> **Healthcare Design System com Otimização Portuguesa**  
> Sistema de design completo otimizado para aplicações healthcare seguindo princípios KISS de simplicidade e compliance WCAG 2.1 AA+.

## 🎯 **Visão Geral**

O TweakCN NEONPRO Theme Foundation é um sistema de design abrangente desenvolvido especificamente para aplicações healthcare em ambiente brasileiro, combinando:

- **Cores NEONPRO**: Paleta assinatura com `oklch(142, 71%, 78%)` como primary
- **Acessibilidade Healthcare**: WCAG 2.1 AA+ com contrast ratios de 4.5:1 e 7:1
- **Tipografia Portuguesa**: Otimizada para terminologia médica com `line-height: 1.65`
- **Componentes Healthcare**: Button, Card, Alert, Input customizados para contextos médicos
- **Semantic Colors**: Sistema completo para vital signs, emergency, e compliance LGPD

---

## 🎨 **Sistema de Cores**

### **Core NEONPRO Palette**

```css
/* Cores Primárias NEONPRO */
--primary: 142 71% 78%;           /* NEONPRO signature green */
--primary-light: 142 60% 85%;     /* Variante clara */
--primary-dark: 142 80% 65%;      /* Variante escura */

/* Cores de Emergência Healthcare */
--status-critical: 0 84% 60%;     /* Emergency red */
--status-urgent: 15 90% 53%;      /* Orange urgente */
--status-warning: 45 93% 47%;     /* Amber warning */
--status-normal: 142 71% 78%;     /* NEONPRO para normal */

/* LGPD Compliance */
--lgpd-compliant: 160 95% 30%;    /* Legal compliance green */
--lgpd-warning: 45 93% 47%;       /* Compliance warning */
--lgpd-violation: 0 84% 60%;      /* Compliance violation */
```

### **Healthcare Semantic Colors**

#### **Vital Signs System**
```css
/* Pressão Arterial */
--bp-normal: var(--vital-normal);     /* <120/80 */
--bp-elevated: 45 70% 55%;            /* 120-129/<80 */
--bp-stage1: var(--vital-high);       /* 130-139/80-89 */
--bp-stage2: var(--vital-critical);   /* 140-179/90-119 */
--bp-crisis: 0 95% 45%;               /* >180/>120 */

/* Frequência Cardíaca */
--hr-bradycardia: 217 91% 60%;        /* <60 bpm */
--hr-normal: var(--vital-normal);     /* 60-100 bpm */
--hr-tachycardia: var(--vital-high);  /* 100-150 bpm */
--hr-severe: var(--vital-critical);   /* >150 bpm */

/* Temperatura */
--temp-hypothermia: 217 91% 60%;      /* <36°C */
--temp-normal: var(--vital-normal);   /* 36-37.5°C */
--temp-fever: var(--vital-high);      /* 37.6-39°C */
--temp-high-fever: var(--vital-critical); /* >39°C */
```

#### **Pain Scale (0-10)**
```css
--pain-0: var(--vital-normal);        /* Sem dor */
--pain-1-3: 142 60% 70%;              /* Dor leve */
--pain-4-6: var(--vital-high);        /* Dor moderada */
--pain-7-8: 15 90% 53%;               /* Dor severa */
--pain-9-10: var(--vital-critical);   /* Dor máxima */
```

#### **Triage Manchester System**
```css
--triage-red: var(--vital-critical);     /* Imediato */
--triage-orange: 15 90% 53%;             /* Muito urgente - 10min */
--triage-yellow: var(--vital-high);      /* Urgente - 60min */
--triage-green: var(--vital-normal);     /* Padrão - 120min */
--triage-blue: 217 91% 60%;              /* Não urgente - 240min */
```

---

## 🎭 **Sistema de Temas**

### **Light Theme (Padrão)**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 142 71% 78%;
  /* ... */
}
```

### **Dark Theme**
```css
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 142 71% 65%;
  /* ... */
}
```

### **High Contrast Theme (WCAG 2.1 AAA)**
```css
.high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 142 100% 25%;
  --contrast-aa-normal: 8.0;
  --contrast-aaa-normal: 10.0;
  /* ... */
}
```

#### **Ativação de Temas**
```typescript
// Tema automático baseado em preferências do sistema
<html className="dark"> // ou "high-contrast"
```

---

## 📝 **Tipografia Portuguesa**

### **Configuração Otimizada**
```css
:root {
  --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-serif: "Lora", Georgia, serif;
  --font-mono: "JetBrains Mono", Menlo, Monaco, Consolas, monospace;
  
  /* Otimização para português */
  --line-height-base: 1.65;           /* Melhor readability */
  --text-scale-medical: 1.1;          /* 10% maior para terminologia médica */
  --letter-spacing-medical: 0.01em;    /* Claridade em termos médicos */
}
```

### **Classes Utilitárias**
```css
.text-medical-normal     /* Line height e spacing otimizados */
.text-patient-facing     /* Para conteúdo voltado ao paciente */
.text-emergency          /* Texto de emergência compacto */
.medical-term            /* Terminologia médica com scaling */
```

---

## 🧩 **Componentes Healthcare**

### **Button Healthcare**

#### **Variantes Médicas**
```tsx
// Variantes healthcare específicas
<Button variant="medical">Salvar Prontuário</Button>
<Button variant="emergency">EMERGÊNCIA</Button>
<Button variant="patient-safe">Aprovar Medicação</Button>
<Button variant="critical">PARADA CARDÍACA</Button>
<Button variant="lgpd">Consentimento LGPD</Button>
```

#### **Touch Targets WCAG**
```tsx
// Sizes otimizados para healthcare
<Button size="touch">44px mínimo</Button>
<Button size="touch-lg">56px emergência</Button>
<Button size="touch-xl">64px pós-procedimento</Button>
<Button size="mobile-emergency">Full width emergency</Button>
```

#### **Props Healthcare**
```tsx
interface HealthcareButtonProps {
  urgency?: "low" | "medium" | "high" | "critical";
  lgpdCompliant?: boolean;
  emergencyMode?: boolean;
  srAnnouncement?: string;
  isLoading?: boolean;
}
```

### **Card Healthcare**

#### **Variantes Contextuais**
```tsx
<Card variant="patient">Cartão do Paciente</Card>
<Card variant="emergency">Emergência</Card>
<Card variant="medical">Informações Médicas</Card>
<Card variant="lgpd">Dados Protegidos</Card>
<Card variant="critical">Atenção Crítica</Card>
```

#### **Props Healthcare**
```tsx
interface HealthcareCardProps {
  urgency?: "low" | "medium" | "high" | "critical";
  medicalContext?: "patient" | "emergency" | "consultation" | "prescription";
  patientSafe?: boolean;
  lgpdSensitive?: boolean;
  emergencyMode?: boolean;
  status?: "normal" | "warning" | "critical" | "inactive";
}
```

### **Alert Healthcare**

#### **Tipos Médicos**
```tsx
<Alert variant="vital-critical">Sinais vitais críticos</Alert>
<Alert variant="emergency">Emergência médica</Alert>
<Alert variant="compliance">Conformidade LGPD</Alert>
<Alert variant="medication">Alerta medicamentoso</Alert>
```

#### **Props Especializadas**
```tsx
interface HealthcareAlertProps {
  urgency?: "low" | "medium" | "high" | "critical";
  vitalStatus?: "normal" | "warning" | "critical" | "urgent";
  medicationAlert?: "allergy" | "interaction" | "dosage" | "contraindication";
  clinicalAlert?: boolean;
  autoDismiss?: number;
}
```

### **Input Healthcare**

#### **Tipos Brasileiros**
```tsx
<Input healthcareType="cpf" autoFormat />
<Input healthcareType="cns" /> {/* Cartão Nacional de Saúde */}
<Input healthcareType="crm" /> {/* CRM médico */}
<Input healthcareType="phone-brazil" />
<Input healthcareType="patient-name" />
<Input healthcareType="medical-notes" />
```

#### **Contextos Médicos**
```tsx
<Input 
  medicalContext="emergency" 
  urgency="critical"
  lgpdSensitive
  validationState="critical"
/>
```

---

## ♿ **Acessibilidade & Tokens**

### **Touch Targets WCAG 2.1**
```css
--touch-target-min: 44px;              /* Mínimo WCAG AA */
--touch-target-emergency: 56px;        /* Modo emergência */
--touch-target-post-procedure: 60px;   /* Pós-procedimento */
--touch-target-tremor-friendly: 64px;  /* Deficiência motora */
```

### **Contrast Ratios**
```css
--contrast-aa-normal: 4.5;     /* WCAG 2.1 AA */
--contrast-aaa-normal: 7.0;    /* WCAG 2.1 AAA */
--contrast-critical: 10.0;     /* Healthcare crítico */
--contrast-emergency: 8.5;     /* Emergência */
```

### **Focus System**
```css
--focus-ring-width: 2px;           /* Padrão */
--focus-emergency-width: 3px;      /* Emergência */
--focus-critical-width: 4px;       /* Crítico */
--focus-critical-offset: 1px;      /* Offset crítico */
```

### **Classes Utilitárias de Acessibilidade**
```css
.touch-min            /* 44px touch target */
.touch-emergency      /* 56px emergency touch */
.focus-emergency      /* Focus de emergência */
.focus-critical       /* Focus crítico */
.vital-normal         /* Cor vital normal */
.vital-critical       /* Cor vital crítica */
.triage-red           /* Cor triage vermelho */
```

---

## 🎬 **Sistema de Animações**

### **Animações Healthcare**
```css
.pulse-emergency      /* Pulse de emergência */
.pulse-healthcare     /* Pulse healthcare padrão */
.animate-pulse-healthcare /* Pulse customizado */
.blink-critical       /* Piscar crítico */
.fade-warning         /* Fade de warning */
```

### **Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-emergency-pulse: 0.01ms;
    --animation-critical-blink: 0.01ms;
    --focus-transition-duration: 0.01ms;
  }
}
```

---

## 🚀 **Guias de Uso**

### **Implementação Básica**

1. **Importar Estilos**
```tsx
import './styles/globals.css'
// accessibility-tokens.css é importado automaticamente
```

2. **Configurar Tema**
```tsx
// Tema automático
<html className="dark"> // ou "high-contrast"

// Programaticamente
document.documentElement.className = theme;
```

3. **Usar Componentes**
```tsx
import { Button, Card, Alert, Input } from '@/components/ui'

function EmergencyInterface() {
  return (
    <Card variant="emergency" emergencyMode>
      <Alert variant="vital-critical" urgency="critical">
        Sinais vitais críticos detectados
      </Alert>
      <Button variant="critical" size="touch-lg">
        CHAMAR EQUIPE MÉDICA
      </Button>
    </Card>
  );
}
```

### **Exemplo Completo: Formulário do Paciente**
```tsx
function PatientForm() {
  return (
    <Card variant="patient" medicalContext="patient" patientSafe>
      <CardHeader>
        <CardTitle urgency="medium">Dados do Paciente</CardTitle>
        <CardDescription medicalTerm>
          Informações protegidas pela LGPD
        </CardDescription>
      </CardHeader>
      
      <CardContent spacing="comfortable">
        <Input 
          healthcareType="patient-name"
          medicalContext="patient-registration"
          lgpdSensitive
          placeholder="Nome completo do paciente"
        />
        <Input 
          healthcareType="cpf"
          autoFormat
          lgpdSensitive
        />
        <Input 
          healthcareType="cns"
          medicalDescription="Cartão Nacional de Saúde do paciente"
        />
      </CardContent>
      
      <CardFooter variant="actions">
        <Button variant="lgpd" lgpdCompliant>
          Salvar com Consentimento
        </Button>
        <Button variant="medical" patientSafe>
          Confirmar Cadastro
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### **Exemplo: Interface de Emergência**
```tsx
function EmergencyInterface() {
  return (
    <div className="emergency-mode p-6">
      <Alert 
        variant="emergency" 
        urgency="critical" 
        emergencyMode
        clinicalAlert
        announcementLevel="assertive"
      >
        <AlertIcon type="emergency" />
        <AlertTitle urgency="critical">EMERGÊNCIA MÉDICA</AlertTitle>
        <AlertDescription>
          Paciente com sinais vitais críticos
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          variant="critical" 
          size="emergency-mode" 
          urgency="critical"
          srAnnouncement="Chamando equipe de emergência"
        >
          🚨 CHAMAR EQUIPE
        </Button>
        
        <Button 
          variant="emergency" 
          size="touch-lg"
          urgency="high"
        >
          📋 PROTOCOLO RCP
        </Button>
      </div>
    </div>
  );
}
```

---

## 📊 **Métricas de Conformidade**

### **WCAG 2.1 Compliance**
- ✅ **AA Level**: 4.5:1 contrast ratio mínimo
- ✅ **AAA Level**: 7:1 contrast ratio para elementos críticos
- ✅ **Touch Targets**: 44px mínimo, 56px emergência
- ✅ **Focus Management**: Focus visível e navegação por teclado
- ✅ **Screen Readers**: Suporte completo com aria-labels

### **Performance Healthcare**
- ✅ **Touch Response**: <100ms para ações críticas
- ✅ **Animation**: Respeita prefers-reduced-motion
- ✅ **Loading States**: Feedback visual imediato
- ✅ **Error Handling**: Estados de erro claros

### **Compliance Brasileiro**
- ✅ **LGPD**: Indicadores visuais para dados sensíveis
- ✅ **ANVISA**: Cores de alerta médico conforme regulamentação
- ✅ **CFM**: Padrões de interface para sistemas médicos

---

## 🔧 **Customização Avançada**

### **Extendendo Cores**
```css
:root {
  /* Custom healthcare colors */
  --specialty-cardiology: 220 70% 50%;
  --specialty-neurology: 285 85% 60%;
  --specialty-pediatrics: 45 100% 70%;
}
```

### **Componentes Personalizados**
```tsx
// Extender com variantes customizadas
const customButtonVariants = cva(
  buttonVariants.base,
  {
    variants: {
      ...buttonVariants.variants,
      variant: {
        ...buttonVariants.variants.variant,
        "custom-specialty": "bg-specialty-cardiology text-white"
      }
    }
  }
);
```

### **Temas Personalizados**
```css
.custom-hospital-theme {
  --primary: 200 80% 60%; /* Hospital blue */
  --background: 210 20% 98%;
  --accent: 200 50% 90%;
  /* Override other variables as needed */
}
```

---

## 📚 **Recursos Adicionais**

### **Documentação Técnica**
- [`globals.css`](./globals.css) - Sistema base de temas
- [`accessibility-tokens.css`](./accessibility-tokens.css) - Tokens de acessibilidade
- [`responsive.css`](./responsive.css) - Sistema responsivo mobile-first

### **Componentes**
- [`button.tsx`](../components/ui/button.tsx) - Button healthcare
- [`card.tsx`](../components/ui/card.tsx) - Card system
- [`alert.tsx`](../components/ui/alert.tsx) - Alert system
- [`input.tsx`](../components/ui/input.tsx) - Input brasileiro

### **Storybook (Planejado)**
```bash
npm run storybook
# Acesse http://localhost:6006
```

---

## 🏥 **Casos de Uso Healthcare**

### **1. Prontuário Eletrônico**
- Cards de paciente com status vital
- Inputs formatados para dados brasileiros
- Alertas de medicação e alergias
- Compliance LGPD automático

### **2. Interface de Emergência**
- Temas de alto contraste
- Touch targets aumentados
- Animações de alerta crítico
- Navegação por voz planejada

### **3. Telemedicina**
- Responsive design mobile-first
- Indicadores de qualidade de conexão
- Interfaces otimizadas para tablet
- Acessibilidade para idosos

### **4. Gestão Hospitalar**
- Dashboards executivos
- Métricas em tempo real
- Relatórios de conformidade
- Interface administrativa

---

## 🤝 **Contribuindo**

### **Adicionando Novas Variantes**
1. Definir tokens de cor no `globals.css`
2. Criar variantes nos componentes
3. Adicionar utilitários CSS
4. Documentar casos de uso
5. Testar acessibilidade

### **Testando Acessibilidade**
```bash
# Testes automatizados
npm run test:a11y

# Validação manual
- Navegação por teclado
- Screen readers (NVDA, JAWS)
- High contrast mode
- Reduced motion
```

---

## 📈 **Roadmap**

### **v1.1 (Próximo)**
- [ ] Storybook documentation
- [ ] Mais variantes de Input healthcare
- [ ] Sistema de ícones médicos
- [ ] Temas de especialidades médicas

### **v1.2 (Futuro)**
- [ ] Componentes de dados vitais
- [ ] Integração com voice navigation
- [ ] Mais idiomas (EN, ES)
- [ ] Performance optimizations

---

## 📄 **Licença**

Copyright © 2024 NeonPro Healthcare Solutions  
Sistema proprietário - Uso restrito a aplicações healthcare aprovadas.

---

**🩺 TweakCN NEONPRO Theme Foundation**  
*Healthcare Design System com Acessibilidade Constitucional*