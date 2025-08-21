import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Heart,
  Info,
  Shield,
  X,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Heart,
  Info,
  Shield,
  X,
} from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg',
  {
    variants: {
      variant: {
        default: 'border-border',
        medical:
          'border-l-4 border-l-primary bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-950/10',
        alert:
          'border-l-4 border-l-destructive bg-gradient-to-r from-red-50/20 to-transparent dark:from-red-950/10',
        warning:
          'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/20 to-transparent dark:from-orange-950/10',
        success:
          'border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/20 to-transparent dark:from-green-950/10',
        info: 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/20 to-transparent dark:from-blue-950/10',
        lgpd: 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/20 to-transparent ring-2 ring-green-200 dark:from-green-950/10 dark:ring-green-800',
      },
      size: {
        default: 'max-w-lg',
        sm: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-h-[95vh] max-w-[95vw]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof dialogContentVariants>
>(({ className, children, variant, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(dialogContentVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Fechar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn(
      'font-semibold text-lg leading-none tracking-tight',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn('text-muted-foreground text-sm', className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName; // Healthcare-specific dialog components

interface HealthcareDialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  lgpdRequired?: boolean;
  medicalContext?:
    | 'appointment'
    | 'patient-data'
    | 'treatment'
    | 'emergency'
    | 'consent';
}

const ConfirmationDialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  HealthcareDialogProps
>(
  (
    {
      title = 'Confirmar Ação',
      description,
      icon,
      showIcon = true,
      onConfirm,
      onCancel,
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      isDestructive = false,
      lgpdRequired = false,
      medicalContext = 'appointment',
      variant,
      children,
      ...props
    },
    ref
  ) => {
    const getDefaultIcon = () => {
      if (icon) return icon;
      if (!showIcon) return null;

      if (isDestructive)
        return <AlertTriangle className="h-6 w-6 text-red-600" />;

      switch (medicalContext) {
        case 'appointment':
          return <Info className="h-6 w-6 text-blue-600" />;
        case 'patient-data':
          return <Shield className="h-6 w-6 text-green-600" />;
        case 'treatment':
          return <Heart className="h-6 w-6 text-red-600" />;
        case 'emergency':
          return <AlertTriangle className="h-6 w-6 text-red-600" />;
        case 'consent':
          return <FileText className="h-6 w-6 text-purple-600" />;
        default:
          return <Info className="h-6 w-6 text-blue-600" />;
      }
    };

    const getVariant = () => {
      if (variant) return variant;
      if (isDestructive) return 'alert';
      if (lgpdRequired) return 'lgpd';

      switch (medicalContext) {
        case 'emergency':
          return 'alert';
        case 'patient-data':
          return 'lgpd';
        case 'treatment':
          return 'medical';
        default:
          return 'default';
      }
    };

    return (
      <DialogContent ref={ref} variant={getVariant()} {...props}>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            {getDefaultIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="py-4">{children}</div>}

        {lgpdRequired && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50/50 p-3 text-sm dark:bg-green-950/20">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-green-700 dark:text-green-300">
              Esta ação está em conformidade com a LGPD e os dados serão
              processados de forma segura.
            </span>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={onCancel}
              type="button"
            >
              {cancelText}
            </button>
          </DialogClose>
          <button
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              isDestructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    );
  }
);
ConfirmationDialog.displayName = 'ConfirmationDialog';
interface LGPDConsentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  dataTypes?: string[];
  purpose?: string;
  retentionPeriod?: string;
}

const LGPDConsentDialog = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  dataTypes = [
    'Dados pessoais básicos',
    'Informações de contato',
    'Histórico médico',
  ],
  purpose = 'Prestação de serviços de saúde e acompanhamento médico',
  retentionPeriod = '5 anos ou conforme legislação vigente',
}: LGPDConsentDialogProps) => {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent size="lg" variant="lgpd">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-600" />
            <DialogTitle>Consentimento LGPD</DialogTitle>
          </div>
          <DialogDescription>
            Precisamos do seu consentimento para processar seus dados pessoais
            de acordo com a Lei Geral de Proteção de Dados (LGPD).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="mb-2 font-medium">Dados que serão coletados:</h4>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground text-sm">
              {dataTypes.map((type, index) => (
                <li key={index}>{type}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Finalidade do tratamento:</h4>
            <p className="text-muted-foreground text-sm">{purpose}</p>
          </div>

          <div>
            <h4 className="mb-2 font-medium">Período de retenção:</h4>
            <p className="text-muted-foreground text-sm">{retentionPeriod}</p>
          </div>

          <div className="rounded-lg bg-green-50/50 p-3 dark:bg-green-950/20">
            <p className="text-green-700 text-xs dark:text-green-300">
              Seus dados serão protegidos com medidas de segurança adequadas e
              você poderá exercer seus direitos (acesso, correção, exclusão,
              portabilidade) a qualquer momento através do nosso canal de
              atendimento.
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={onReject}
            type="button"
          >
            Não Aceito
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={onAccept}
            type="button"
          >
            <Shield className="mr-2 h-4 w-4" />
            Aceito e Consinto
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface MedicalAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  alertType: 'critical' | 'urgent' | 'info';
  title: string;
  message: string;
  patientName?: string;
  timestamp?: Date;
  onAcknowledge?: () => void;
}

const MedicalAlertDialog = ({
  isOpen,
  onClose,
  alertType,
  title,
  message,
  patientName,
  timestamp,
  onAcknowledge,
}: MedicalAlertDialogProps) => {
  const getAlertIcon = () => {
    switch (alertType) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 animate-pulse text-red-600" />;
      case 'urgent':
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getVariant = () => {
    switch (alertType) {
      case 'critical':
      case 'urgent':
        return 'alert';
      default:
        return 'info';
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent variant={getVariant()}>
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            {getAlertIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {patientName && (
            <div className="text-muted-foreground text-sm">
              Paciente: <span className="font-medium">{patientName}</span>
            </div>
          )}
          {timestamp && (
            <div className="text-muted-foreground text-xs">
              {timestamp.toLocaleString('pt-BR')}
            </div>
          )}
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">{message}</p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={onClose}
              type="button"
            >
              Fechar
            </button>
          </DialogClose>
          {onAcknowledge && (
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                onAcknowledge();
                onClose();
              }}
              type="button"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Leitura
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  // Healthcare-specific exports
  ConfirmationDialog,
  LGPDConsentDialog,
  MedicalAlertDialog,
  dialogContentVariants,
  type HealthcareDialogProps,
  type LGPDConsentDialogProps,
  type MedicalAlertDialogProps,
};
