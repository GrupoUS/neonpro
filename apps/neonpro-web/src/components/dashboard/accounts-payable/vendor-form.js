"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorForm = VendorForm;
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var documents_1 = require("@/lib/services/documents");
var vendors_1 = require("@/lib/services/vendors");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
var document_upload_1 = require("./document-upload");
var vendorTypes = [
  { value: "supplier", label: "Fornecedor" },
  { value: "service_provider", label: "Prestador de Serviços" },
  { value: "contractor", label: "Empreiteiro" },
  { value: "consultant", label: "Consultor" },
  { value: "other", label: "Outro" },
];
var paymentMethods = [
  { value: "cash", label: "Dinheiro" },
  { value: "check", label: "Cheque" },
  { value: "bank_transfer", label: "Transferência Bancária" },
  { value: "pix", label: "PIX" },
  { value: "credit_card", label: "Cartão de Crédito" },
  { value: "other", label: "Outro" },
];
function VendorForm(_a) {
  var vendor = _a.vendor,
    open = _a.open,
    onOpenChange = _a.onOpenChange,
    onSuccess = _a.onSuccess;
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)([]),
    documents = _c[0],
    setDocuments = _c[1];
  var _d = (0, react_1.useState)(false),
    loadingDocuments = _d[0],
    setLoadingDocuments = _d[1];
  var _e = (0, react_1.useState)({
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
    }),
    formData = _e[0],
    setFormData = _e[1];
  // Generate vendor code when creating new vendor
  (0, react_1.useEffect)(() => {
    if (!vendor && open && !formData.vendor_code) {
      generateVendorCode();
    }
  }, [vendor, open, formData.vendor_code]);
  // Populate form when editing existing vendor
  (0, react_1.useEffect)(() => {
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
  var loadDocuments = () =>
    __awaiter(this, void 0, void 0, function () {
      var vendorDocuments, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!(vendor === null || vendor === void 0 ? void 0 : vendor.id)) return [2 /*return*/];
            setLoadingDocuments(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, documents_1.documentsService.getDocuments("vendor", vendor.id)];
          case 2:
            vendorDocuments = _a.sent();
            setDocuments(vendorDocuments);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Erro ao carregar documentos:", error_1);
            sonner_1.toast.error("Erro ao carregar documentos do fornecedor");
            return [3 /*break*/, 5];
          case 4:
            setLoadingDocuments(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Load documents when vendor changes or dialog opens
  (0, react_1.useEffect)(() => {
    if (open && (vendor === null || vendor === void 0 ? void 0 : vendor.id)) {
      loadDocuments();
    }
  }, [open, vendor === null || vendor === void 0 ? void 0 : vendor.id]);
  var generateVendorCode = () =>
    __awaiter(this, void 0, void 0, function () {
      var code_1, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, vendors_1.VendorService.generateVendorCode()];
          case 1:
            code_1 = _a.sent();
            setFormData((prev) => __assign(__assign({}, prev), { vendor_code: code_1 }));
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Error generating vendor code:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var handleSubmit = (e) =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            e.preventDefault();
            if (!formData.vendor_code || !formData.company_name) {
              sonner_1.toast.error("Código do fornecedor e nome da empresa são obrigatórios");
              return [2 /*return*/];
            }
            setLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, 7, 8]);
            if (!vendor) return [3 /*break*/, 3];
            return [4 /*yield*/, vendors_1.VendorService.updateVendor(vendor.id, formData)];
          case 2:
            _a.sent();
            sonner_1.toast.success("Fornecedor atualizado com sucesso!");
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, vendors_1.VendorService.createVendor(formData)];
          case 4:
            _a.sent();
            sonner_1.toast.success("Fornecedor criado com sucesso!");
            _a.label = 5;
          case 5:
            onSuccess();
            onOpenChange(false);
            return [3 /*break*/, 8];
          case 6:
            error_3 = _a.sent();
            console.error("Error saving vendor:", error_3);
            sonner_1.toast.error(error_3.message || "Erro ao salvar fornecedor");
            return [3 /*break*/, 8];
          case 7:
            setLoading(false);
            return [7 /*endfinally*/];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  var updateField = (field, value) => {
    setFormData((prev) => {
      var _a;
      return __assign(__assign({}, prev), ((_a = {}), (_a[field] = value), _a));
    });
  };
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>
            {vendor ? "Editar Fornecedor" : "Novo Fornecedor"}
          </dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            {vendor
              ? "Atualize as informações do fornecedor."
              : "Cadastre um novo fornecedor no sistema."}
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <tabs_1.Tabs defaultValue="info" className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-2">
            <tabs_1.TabsTrigger value="info" className="flex items-center gap-2">
              <lucide_react_1.Building className="h-4 w-4" />
              Informações
            </tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger
              value="documents"
              className="flex items-center gap-2"
              disabled={!(vendor === null || vendor === void 0 ? void 0 : vendor.id)}
            >
              <lucide_react_1.FileText className="h-4 w-4" />
              Documentos
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="info" className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Building className="h-5 w-5" />
                    Informações Básicas
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="vendor_code">Código *</label_1.Label>
                    <input_1.Input
                      id="vendor_code"
                      value={formData.vendor_code}
                      onChange={(e) => updateField("vendor_code", e.target.value)}
                      placeholder="VEND001"
                      required
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="company_name">Nome da Empresa *</label_1.Label>
                    <input_1.Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => updateField("company_name", e.target.value)}
                      placeholder="Nome da empresa"
                      required
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="legal_name">Razão Social</label_1.Label>
                    <input_1.Input
                      id="legal_name"
                      value={formData.legal_name}
                      onChange={(e) => updateField("legal_name", e.target.value)}
                      placeholder="Razão social"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="vendor_type">Tipo</label_1.Label>
                    <select_1.Select
                      value={formData.vendor_type}
                      onValueChange={(value) => updateField("vendor_type", value)}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {vendorTypes.map((type) => (
                          <select_1.SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </select_1.SelectItem>
                        ))}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Contact Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Mail className="h-5 w-5" />
                    Informações de Contato
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="contact_person">Pessoa de Contato</label_1.Label>
                    <input_1.Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => updateField("contact_person", e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="email">E-mail</label_1.Label>
                    <input_1.Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="phone">Telefone</label_1.Label>
                    <input_1.Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(11) 1234-5678"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="mobile">Celular</label_1.Label>
                    <input_1.Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Address Information */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Endereço</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label_1.Label htmlFor="address_line1">Endereço</label_1.Label>
                      <input_1.Input
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={(e) => updateField("address_line1", e.target.value)}
                        placeholder="Rua, número"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label_1.Label htmlFor="address_line2">Complemento</label_1.Label>
                      <input_1.Input
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={(e) => updateField("address_line2", e.target.value)}
                        placeholder="Apartamento, sala, etc."
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="city">Cidade</label_1.Label>
                      <input_1.Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="state">Estado</label_1.Label>
                      <input_1.Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="SP"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="postal_code">CEP</label_1.Label>
                      <input_1.Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => updateField("postal_code", e.target.value)}
                        placeholder="01234-567"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="country">País</label_1.Label>
                      <input_1.Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        placeholder="Brasil"
                      />
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Tax and Banking Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Information */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Informações Fiscais</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div>
                      <label_1.Label htmlFor="tax_id">CPF/CNPJ</label_1.Label>
                      <input_1.Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) => updateField("tax_id", e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="state_registration">Inscrição Estadual</label_1.Label>
                      <input_1.Input
                        id="state_registration"
                        value={formData.state_registration}
                        onChange={(e) => updateField("state_registration", e.target.value)}
                        placeholder="123.456.789.012"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="municipal_registration">
                        Inscrição Municipal
                      </label_1.Label>
                      <input_1.Input
                        id="municipal_registration"
                        value={formData.municipal_registration}
                        onChange={(e) => updateField("municipal_registration", e.target.value)}
                        placeholder="123456789"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <checkbox_1.Checkbox
                        id="tax_exempt"
                        checked={formData.tax_exempt}
                        onCheckedChange={(checked) => updateField("tax_exempt", checked)}
                      />
                      <label_1.Label htmlFor="tax_exempt">Isento de Impostos</label_1.Label>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Banking Information */}
                <card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle>Informações Bancárias</card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent className="space-y-4">
                    <div>
                      <label_1.Label htmlFor="bank_name">Banco</label_1.Label>
                      <input_1.Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => updateField("bank_name", e.target.value)}
                        placeholder="Nome do banco"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="bank_branch">Agência</label_1.Label>
                      <input_1.Input
                        id="bank_branch"
                        value={formData.bank_branch}
                        onChange={(e) => updateField("bank_branch", e.target.value)}
                        placeholder="0123-4"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="bank_account">Conta</label_1.Label>
                      <input_1.Input
                        id="bank_account"
                        value={formData.bank_account}
                        onChange={(e) => updateField("bank_account", e.target.value)}
                        placeholder="12345-6"
                      />
                    </div>

                    <div>
                      <label_1.Label htmlFor="pix_key">Chave PIX</label_1.Label>
                      <input_1.Input
                        id="pix_key"
                        value={formData.pix_key}
                        onChange={(e) => updateField("pix_key", e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              </div>

              {/* Payment Terms */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Termos de Pagamento</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label_1.Label htmlFor="payment_terms_days">Prazo (dias)</label_1.Label>
                    <input_1.Input
                      id="payment_terms_days"
                      type="number"
                      value={formData.payment_terms_days}
                      onChange={(e) =>
                        updateField("payment_terms_days", parseInt(e.target.value) || 30)
                      }
                      min="0"
                      max="365"
                    />
                  </div>

                  <div>
                    <label_1.Label htmlFor="payment_method">Método de Pagamento</label_1.Label>
                    <select_1.Select
                      value={formData.payment_method}
                      onValueChange={(value) => updateField("payment_method", value)}
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {paymentMethods.map((method) => (
                          <select_1.SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </select_1.SelectItem>
                        ))}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="credit_limit">Limite de Crédito</label_1.Label>
                    <input_1.Input
                      id="credit_limit"
                      type="number"
                      value={formData.credit_limit || ""}
                      onChange={(e) =>
                        updateField("credit_limit", parseFloat(e.target.value) || undefined)
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Status and Options */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Status e Opções</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => updateField("is_active", checked)}
                    />
                    <label_1.Label htmlFor="is_active">Ativo</label_1.Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <checkbox_1.Checkbox
                      id="requires_approval"
                      checked={formData.requires_approval}
                      onCheckedChange={(checked) => updateField("requires_approval", checked)}
                    />
                    <label_1.Label htmlFor="requires_approval">Requer Aprovação</label_1.Label>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            </form>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="documents" className="mt-6">
            {(vendor === null || vendor === void 0 ? void 0 : vendor.id) && (
              <document_upload_1.default
                entityType="vendor"
                entityId={vendor.id}
                existingDocuments={documents}
                onDocumentsChange={loadDocuments}
              />
            )}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        <dialog_1.DialogFooter>
          <button_1.Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </button_1.Button>
          <button_1.Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {vendor ? "Atualizar" : "Criar"} Fornecedor
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
