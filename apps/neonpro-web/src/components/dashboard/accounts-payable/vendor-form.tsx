"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documentsService } from "@/lib/services/documents";
import { VendorService } from "@/lib/services/vendors";
import { Vendor, VendorFormData } from "@/lib/types/accounts-payable";
import { Building, FileText, Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DocumentUpload from "./document-upload";

interface VendorFormProps {
  vendor?: Vendor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const vendorTypes = [
  { value: "supplier", label: "Fornecedor" },
  { value: "service_provider", label: "Prestador de Serviços" },
  { value: "contractor", label: "Empreiteiro" },
  { value: "consultant", label: "Consultor" },
  { value: "other", label: "Outro" },
];

const paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "check", label: "Cheque" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "other", label: "Outro" },
];

export function VendorForm({
  vendor,
  open,
  onOpenChange,
  onSuccess,
}: VendorFormProps) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>({
    vendor_code: "",
    company_name: "",
    legal_name: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Brazil",
    tax_id: "",
    state_registration: "",
    municipal_registration: "",
    bank_name: "",
    bank_branch: "",
    bank_account: "",
    pix_key: "",
    vendor_type: "supplier",
    payment_terms_days: 30,
    payment_method: "pix",
    credit_limit: undefined,
    is_active: true,
    requires_approval: false,
    tax_exempt: false,
  });

  // Generate vendor code when creating new vendor
  useEffect(() => {
    if (!vendor && open && !formData.vendor_code) {
      generateVendorCode();
    }
  }, [vendor, open, formData.vendor_code]);

  // Populate form when editing existing vendor
  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code,
        company_name: vendor.company_name,
        legal_name: vendor.legal_name || "",
        contact_person: vendor.contact_person || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        mobile: vendor.mobile || "",
        address_line1: vendor.address_line1 || "",
        address_line2: vendor.address_line2 || "",
        city: vendor.city || "",
        state: vendor.state || "",
        postal_code: vendor.postal_code || "",
        country: vendor.country || "Brazil",
        tax_id: vendor.tax_id || "",
        state_registration: vendor.state_registration || "",
        municipal_registration: vendor.municipal_registration || "",
        bank_name: vendor.bank_name || "",
        bank_branch: vendor.bank_branch || "",
        bank_account: vendor.bank_account || "",
        pix_key: vendor.pix_key || "",
        vendor_type: vendor.vendor_type,
        payment_terms_days: vendor.payment_terms_days,
        payment_method: vendor.payment_method,
        credit_limit: vendor.credit_limit,
        is_active: vendor.is_active,
        requires_approval: vendor.requires_approval,
        tax_exempt: vendor.tax_exempt,
      });
    } else if (open) {
      // Reset form for new vendor
      setFormData({
        vendor_code: "",
        company_name: "",
        legal_name: "",
        contact_person: "",
        email: "",
        phone: "",
        mobile: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Brazil",
        tax_id: "",
        state_registration: "",
        municipal_registration: "",
        bank_name: "",
        bank_branch: "",
        bank_account: "",
        pix_key: "",
        vendor_type: "supplier",
        payment_terms_days: 30,
        payment_method: "pix",
        credit_limit: undefined,
        is_active: true,
        requires_approval: false,
        tax_exempt: false,
      });
    }
  }, [vendor, open]);

  const loadDocuments = async () => {
    if (!vendor?.id) return;

    setLoadingDocuments(true);
    try {
      const vendorDocuments = await documentsService.getDocuments(
        "vendor",
        vendor.id
      );
      setDocuments(vendorDocuments);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast.error("Erro ao carregar documentos do fornecedor");
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load documents when vendor changes or dialog opens
  useEffect(() => {
    if (open && vendor?.id) {
      loadDocuments();
    }
  }, [open, vendor?.id]);

  const generateVendorCode = async () => {
    try {
      const code = await VendorService.generateVendorCode();
      setFormData((prev) => ({ ...prev, vendor_code: code }));
    } catch (error) {
      console.error("Error generating vendor code:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor_code || !formData.company_name) {
      toast.error("Código do fornecedor e nome da empresa são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      if (vendor) {
        await VendorService.updateVendor(vendor.id, formData);
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        await VendorService.createVendor(formData);
        toast.success("Fornecedor criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving vendor:", error);
      toast.error(error.message || "Erro ao salvar fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof VendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vendor ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {vendor
              ? "Atualize as informações do fornecedor."
              : "Cadastre um novo fornecedor no sistema."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2"
              disabled={!vendor?.id}
            >
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor_code">Código *</Label>
                    <Input
                      id="vendor_code"
                      value={formData.vendor_code}
                      onChange={(e) =>
                        updateField("vendor_code", e.target.value)
                      }
                      placeholder="VEND001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="company_name">Nome da Empresa *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) =>
                        updateField("company_name", e.target.value)
                      }
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="legal_name">Razão Social</Label>
                    <Input
                      id="legal_name"
                      value={formData.legal_name}
                      onChange={(e) =>
                        updateField("legal_name", e.target.value)
                      }
                      placeholder="Razão social"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vendor_type">Tipo</Label>
                    <Select
                      value={formData.vendor_type}
                      onValueChange={(value) =>
                        updateField("vendor_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {vendorTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_person">Pessoa de Contato</Label>
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) =>
                        updateField("contact_person", e.target.value)
                      }
                      placeholder="Nome do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(11) 1234-5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mobile">Celular</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address_line1">Endereço</Label>
                      <Input
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={(e) =>
                          updateField("address_line1", e.target.value)
                        }
                        placeholder="Rua, número"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address_line2">Complemento</Label>
                      <Input
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={(e) =>
                          updateField("address_line2", e.target.value)
                        }
                        placeholder="Apartamento, sala, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postal_code">CEP</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) =>
                          updateField("postal_code", e.target.value)
                        }
                        placeholder="01234-567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax and Banking Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Fiscais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="tax_id">CPF/CNPJ</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) => updateField("tax_id", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state_registration">
                        Inscrição Estadual
                      </Label>
                      <Input
                        id="state_registration"
                        value={formData.state_registration}
                        onChange={(e) =>
                          updateField("state_registration", e.target.value)
                        }
                        placeholder="123.456.789.012"
                      />
                    </div>

                    <div>
                      <Label htmlFor="municipal_registration">
                        Inscrição Municipal
                      </Label>
                      <Input
                        id="municipal_registration"
                        value={formData.municipal_registration}
                        onChange={(e) =>
                          updateField("municipal_registration", e.target.value)
                        }
                        placeholder="123456789"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tax_exempt"
                        checked={formData.tax_exempt}
                        onCheckedChange={(checked) =>
                          updateField("tax_exempt", checked)
                        }
                      />
                      <Label htmlFor="tax_exempt">Isento de Impostos</Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Banking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Bancárias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bank_name">Banco</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) =>
                          updateField("bank_name", e.target.value)
                        }
                        placeholder="Nome do banco"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bank_branch">Agência</Label>
                      <Input
                        id="bank_branch"
                        value={formData.bank_branch}
                        onChange={(e) =>
                          updateField("bank_branch", e.target.value)
                        }
                        placeholder="0123-4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bank_account">Conta</Label>
                      <Input
                        id="bank_account"
                        value={formData.bank_account}
                        onChange={(e) =>
                          updateField("bank_account", e.target.value)
                        }
                        placeholder="12345-6"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pix_key">Chave PIX</Label>
                      <Input
                        id="pix_key"
                        value={formData.pix_key}
                        onChange={(e) => updateField("pix_key", e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Terms */}
              <Card>
                <CardHeader>
                  <CardTitle>Termos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="payment_terms_days">Prazo (dias)</Label>
                    <Input
                      id="payment_terms_days"
                      type="number"
                      value={formData.payment_terms_days}
                      onChange={(e) =>
                        updateField(
                          "payment_terms_days",
                          parseInt(e.target.value) || 30
                        )
                      }
                      min="0"
                      max="365"
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment_method">Método de Pagamento</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) =>
                        updateField("payment_method", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="credit_limit">Limite de Crédito</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      value={formData.credit_limit || ""}
                      onChange={(e) =>
                        updateField(
                          "credit_limit",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status and Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Status e Opções</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        updateField("is_active", checked)
                      }
                    />
                    <Label htmlFor="is_active">Ativo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requires_approval"
                      checked={formData.requires_approval}
                      onCheckedChange={(checked) =>
                        updateField("requires_approval", checked)
                      }
                    />
                    <Label htmlFor="requires_approval">Requer Aprovação</Label>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            {vendor?.id && (
              <DocumentUpload
                entityType="vendor"
                entityId={vendor.id}
                existingDocuments={documents}
                onDocumentsChange={loadDocuments}
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {vendor ? "Atualizar" : "Criar"} Fornecedor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
