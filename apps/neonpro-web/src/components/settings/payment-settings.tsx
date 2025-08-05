"use client";

import type { useState, useEffect } from "react";
import type { useForm } from "react-hook-form";
import type { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Input } from "@/components/ui/input";
import type { Button } from "@/components/ui/button";
import type { Switch } from "@/components/ui/switch";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { CreditCard, Banknote, Smartphone, Save, Loader2, CheckCircle2 } from "lucide-react";
import type { toast } from "sonner";

const paymentSettingsSchema = z.object({
  // PIX Configuration
  pix: z.object({
    enabled: z.boolean(),
    pixKey: z.string().optional(),
    merchantName: z.string().optional(),
    merchantCity: z.string().optional(),
    automaticConfirmation: z.boolean(),
    expirationMinutes: z.number().min(5).max(1440),
  }),

  // Credit/Debit Cards
  cards: z.object({
    enabled: z.boolean(),
    acceptCredit: z.boolean(),
    acceptDebit: z.boolean(),
    installments: z.object({
      enabled: z.boolean(),
      maxInstallments: z.number().min(1).max(12),
      minAmountPerInstallment: z.number().min(10),
      interestRate: z.number().min(0).max(10),
    }),
  }),

  // Bank Transfer
  bankTransfer: z.object({
    enabled: z.boolean(),
    bankName: z.string().optional(),
    accountType: z.enum(["corrente", "poupanca"]).optional(),
    agency: z.string().optional(),
    account: z.string().optional(),
    accountHolder: z.string().optional(),
    cpfCnpj: z.string().optional(),
  }),

  // Boleto
  boleto: z.object({
    enabled: z.boolean(),
    expirationDays: z.number().min(1).max(30),
    instructions: z.string().optional(),
    fine: z.number().min(0).max(10),
    interest: z.number().min(0).max(1),
  }),

  // Cash
  cash: z.object({
    enabled: z.boolean(),
    discountPercent: z.number().min(0).max(50),
  }),

  // Payment Terms
  paymentTerms: z.object({
    requireUpfrontPayment: z.boolean(),
    upfrontPercentage: z.number().min(0).max(100),
    allowPartialPayments: z.boolean(),
    lateFeePercentage: z.number().min(0).max(10),
    cancelationRefundPolicy: z.enum(["full", "partial", "none"]),
  }),
});

type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>;

export default function PaymentSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<PaymentSettingsFormData>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      pix: {
        enabled: true,
        pixKey: "",
        merchantName: "",
        merchantCity: "",
        automaticConfirmation: true,
        expirationMinutes: 30,
      },
      cards: {
        enabled: true,
        acceptCredit: true,
        acceptDebit: true,
        installments: {
          enabled: true,
          maxInstallments: 12,
          minAmountPerInstallment: 50,
          interestRate: 2.99,
        },
      },
      bankTransfer: {
        enabled: true,
        bankName: "",
        accountType: "corrente",
        agency: "",
        account: "",
        accountHolder: "",
        cpfCnpj: "",
      },
      boleto: {
        enabled: false,
        expirationDays: 3,
        instructions: "Não receber após o vencimento",
        fine: 2,
        interest: 0.033,
      },
      cash: {
        enabled: true,
        discountPercent: 5,
      },
      paymentTerms: {
        requireUpfrontPayment: false,
        upfrontPercentage: 50,
        allowPartialPayments: true,
        lateFeePercentage: 2,
        cancelationRefundPolicy: "partial",
      },
    },
  });

  // Load existing settings
  useEffect(() => {
    const loadPaymentSettings = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações de pagamento");
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentSettings();
  }, [form]);

  const onSubmit = async (data: PaymentSettingsFormData) => {
    setIsSaving(true);
    try {
      setLastSaved(new Date());
      toast.success("Configurações de pagamento salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>Métodos de Pagamento:</strong> Configure as formas de pagamento aceitas pela
          clínica, incluindo PIX, cartões, transferência e dinheiro.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* PIX */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                PIX
              </CardTitle>
              <CardDescription>Sistema de pagamentos instantâneos do Banco Central</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pix.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aceitar PIX</FormLabel>
                      <FormDescription>Habilitar pagamentos via PIX</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("pix.enabled") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pix.pixKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave PIX</FormLabel>
                        <FormControl>
                          <Input placeholder="CPF, CNPJ, email ou telefone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pix.expirationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validade (minutos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="5"
                            max="1440"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormDescription>Tempo para expiração do QR Code</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartões de Crédito e Débito
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cards.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aceitar Cartões</FormLabel>
                      <FormDescription>Habilitar pagamentos com cartão</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("cards.enabled") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cards.acceptCredit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Cartão de Crédito</FormLabel>
                            <FormDescription>Aceitar cartões de crédito</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cards.acceptDebit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Cartão de Débito</FormLabel>
                            <FormDescription>Aceitar cartões de débito</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="cards.installments.enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Parcelamento</FormLabel>
                            <FormDescription>Permitir pagamento parcelado</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch("cards.installments.enabled") && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="cards.installments.maxInstallments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Máx. Parcelas</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 12)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cards.installments.minAmountPerInstallment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mín. por Parcela (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 50)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cards.installments.interestRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Taxa de Juros (% a.m.)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="10"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value) || 2.99)
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Transferência Bancária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankTransfer.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aceitar Transferência</FormLabel>
                      <FormDescription>TED, DOC ou transferência via app</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("bankTransfer.enabled") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bankTransfer.bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banco</FormLabel>
                        <FormControl>
                          <Input placeholder="Banco do Brasil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankTransfer.accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Conta</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="corrente">Conta Corrente</option>
                            <option value="poupanca">Poupança</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankTransfer.agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agência</FormLabel>
                        <FormControl>
                          <Input placeholder="1234-5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankTransfer.account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conta</FormLabel>
                        <FormControl>
                          <Input placeholder="12345-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cash */}
          <Card>
            <CardHeader>
              <CardTitle>Dinheiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="cash.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aceitar Dinheiro</FormLabel>
                      <FormDescription>Pagamento em espécie</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("cash.enabled") && (
                <FormField
                  control={form.control}
                  name="cash.discountPercent"
                  render={({ field }) => (
                    <FormItem className="md:w-1/3">
                      <FormLabel>Desconto à Vista (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Desconto para pagamento em dinheiro</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
