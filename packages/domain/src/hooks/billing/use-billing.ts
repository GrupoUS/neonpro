/**
 * Placeholder billing hook
 */
import { useState } from 'react';

export const useBilling = () => {
  const [invoices, setInvoices] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return {
    invoices,
    isLoading,
    loadInvoices: async () => {
      setIsLoading(true);
      setTimeout(() => {
        setInvoices([]);
        setIsLoading(false);
      }, 1000);
    },
    createInvoice: async (_data: unknown) => {
      return { id: 'placeholder' };
    },
    payInvoice: async (_invoiceId: string) => {
      return { success: true };
    },
  };
};
