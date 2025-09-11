import { Toaster as SonnerToaster, toast } from 'sonner';

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      theme="system"
      position="top-center"
      expand={false}
      closeButton
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: 'rounded-lg border border-border/40 backdrop-blur-sm',
          title: 'text-foreground',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-foreground',
        },
      }}
    />
  );
}
