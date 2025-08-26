// Mock do hook useToast para uso no pacote domain

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: any;
  variant?: "default" | "destructive" | "success" | "warning";
}

export interface ToastActionElement {
  altText: string;
  action: () => void;
}

export interface UseToastReturn {
  toast: (props: Omit<Toast, "id">) => void;
  dismiss: (toastId?: string) => void;
  toasts: Toast[];
}

// Mock implementation para o pacote domain
export const useToast = (): UseToastReturn => {
  const toast = (_props: Omit<Toast, "id">) => {
    // Mock implementation - apenas log no desenvolvimento
    if (process.env.NODE_ENV === "development") {
    }
  };

  const dismiss = (_toastId?: string) => {
    // Mock implementation
    if (process.env.NODE_ENV === "development") {
    }
  };

  return {
    toast,
    dismiss,
    toasts: [],
  };
};

export default useToast;
