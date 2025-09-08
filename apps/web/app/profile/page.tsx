"use client";

import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { Activity, Camera, Edit, Lock, Save, Shield } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
    bio: "",
    specialty: "",
    crm: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
    darkMode: false,
    language: "pt-BR",
  });

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing
            ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )
            : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </>
            )}
        </Button>
      </div>

      <Tabs className="space-y-6" defaultValue="personal">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="professional">Profissional</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent className="space-y-6" value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Suas informações básicas de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={(user as any)?.imageUrl} />
                  <AvatarFallback className="text-lg">
                    {(user as any)?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    {(user as any)?.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">
                    {(user as any)?.firstName || user?.email?.split("@")[0]}{" "}
                    {(user as any)?.lastName || ""}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {user?.email}
                  </p>
                  <Button className="mt-2" size="sm" variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Alterar Foto
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    disabled={!isEditing}
                    id="firstName"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))}
                    value={profileData.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    disabled={!isEditing}
                    id="lastName"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))}
                    value={profileData.lastName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="bg-muted"
                    disabled
                    id="email"
                    type="email"
                    value={profileData.email}
                  />
                  <p className="text-muted-foreground text-xs">
                    Para alterar o email, use as configurações de conta
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    disabled={!isEditing}
                    id="phone"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))}
                    value={profileData.phone}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  disabled={!isEditing}
                  id="bio"
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Conte um pouco sobre você..."
                  rows={3}
                  value={profileData.bio}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    disabled={!isEditing}
                    id="city"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))}
                    value={profileData.city}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    disabled={!isEditing}
                    id="state"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))}
                    value={profileData.state}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    disabled={!isEditing}
                    id="zipCode"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))}
                    value={profileData.zipCode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Information */}
        <TabsContent className="space-y-6" value="professional">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
              <CardDescription>
                Dados relacionados à sua atividade profissional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select disabled={!isEditing} value={profileData.specialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="dermatologia">Dermatologia</SelectItem>
                      <SelectItem value="neurologia">Neurologia</SelectItem>
                      <SelectItem value="pediatria">Pediatria</SelectItem>
                      <SelectItem value="psiquiatria">Psiquiatria</SelectItem>
                      <SelectItem value="ortopedia">Ortopedia</SelectItem>
                      <SelectItem value="oftalmologia">Oftalmologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM</Label>
                  <Input
                    disabled={!isEditing}
                    id="crm"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        crm: e.target.value,
                      }))}
                    placeholder="CRM/SP 123456"
                    value={profileData.crm}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço do Consultório</Label>
                <Textarea
                  disabled={!isEditing}
                  id="address"
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))}
                  placeholder="Endereço completo do consultório..."
                  rows={2}
                  value={profileData.address}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Suas informações profissionais são verificadas e protegidas conforme LGPD.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent className="space-y-6" value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-muted-foreground text-sm">
                    Receber notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por SMS</Label>
                  <p className="text-muted-foreground text-sm">
                    Receber notificações urgentes por SMS
                  </p>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails de Marketing</Label>
                  <p className="text-muted-foreground text-sm">
                    Receber novidades e atualizações do produto
                  </p>
                </div>
                <Switch
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-muted-foreground text-sm">
                    Usar tema escuro na interface
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => handlePreferenceChange("darkMode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={preferences.language}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent className="space-y-6" value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-muted-foreground text-sm">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {preferences.twoFactorAuth && (
                    <Badge className="text-green-600" variant="outline">
                      Ativo
                    </Badge>
                  )}
                  <Switch
                    checked={preferences.twoFactorAuth}
                    onCheckedChange={(checked) => handlePreferenceChange("twoFactorAuth", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Senha</Label>
                    <p className="text-muted-foreground text-sm">
                      Última alteração: há 2 meses
                    </p>
                  </div>
                  <Button variant="outline">
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sessões Ativas</Label>
                    <p className="text-muted-foreground text-sm">
                      Gerencie dispositivos conectados
                    </p>
                  </div>
                  <Button variant="outline">
                    <Activity className="mr-2 h-4 w-4" />
                    Ver Sessões
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Sua conta está protegida com criptografia de ponta a ponta e conformidade LGPD.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
