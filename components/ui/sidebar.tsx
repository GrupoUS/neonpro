'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type SidebarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-sidebar-background text-sidebar-foreground transition-all duration-300',
        open ? 'w-64' : 'w-16',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 border-b p-4', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex-1 overflow-auto p-2', className)} {...props} />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-t p-4', className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav className={cn('flex flex-col space-y-1', className)} {...props} />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('group', className)} {...props} />;
}

function SidebarMenuButton({
  className,
  isActive = false,
  children,
  ...props
}: React.ComponentProps<'button'> & {
  isActive?: boolean;
}) {
  const { open } = useSidebar();

  return (
    <button
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isActive &&
          'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        !open && 'justify-center px-2',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  const { open, setOpen } = useSidebar();

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium text-sm',
        'h-9 w-9 hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <svg
        fill="none"
        height="15"
        viewBox="0 0 15 15"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
};
