"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type { Brain, Edit, Plus, Trash2, User } from "lucide-react";
import type { useState } from "react";

interface PersonalizationProfile {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  preferences: {
    treatmentTypes: string[];
    priceRange: string;
    timePreference: string;
    communicationStyle: string;
  };
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
}

const mockProfiles: PersonalizationProfile[] = [
  {
    id: "1",
    name: "Cliente Premium",
    description: "Perfil para clientes com alto valor de ticket médio",
    targetAudience: "Mulheres 35-50 anos, alta renda",
    preferences: {
      treatmentTypes: ["Harmonização Facial", "Peeling", "Botox"],
      priceRange: "R$ 1.000 - R$ 5.000",
      timePreference: "Manhã",
      communicationStyle: "Formal e detalhado",
    },
    isActive: true,
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
  },
  {
    id: "2",
    name: "Cliente Jovem",
    description: "Perfil para público jovem, foco em prevenção",
    targetAudience: "Mulheres 20-35 anos, renda média",
    preferences: {
      treatmentTypes: ["Limpeza de Pele", "Hidratação", "Microagulhamento"],
      priceRange: "R$ 200 - R$ 800",
      timePreference: "Tarde/Noite",
      communicationStyle: "Casual e direto",
    },
    isActive: true,
    createdAt: "2024-01-10",
    lastUsed: "2024-01-19",
  },
  {
    id: "3",
    name: "Cliente Executiva",
    description: "Perfil para profissionais com agenda apertada",
    targetAudience: "Mulheres 28-45 anos, executivas",
    preferences: {
      treatmentTypes: ["Express Facial", "Botox", "Massagem"],
      priceRange: "R$ 500 - R$ 2.000",
      timePreference: "Almoço/Final do dia",
      communicationStyle: "Objetivo e eficiente",
    },
    isActive: false,
    createdAt: "2024-01-05",
    lastUsed: "2024-01-15",
  },
];

export function PersonalizationProfilesManagement() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PersonalizationProfile | null>(null);

  const handleToggleProfile = (profileId: string) => {
    setProfiles(profiles.map((p) => (p.id === profileId ? { ...p, isActive: !p.isActive } : p)));
  };

  const handleDeleteProfile = (profileId: string) => {
    setProfiles(profiles.filter((p) => p.id !== profileId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Perfis de Personalização</h2>
          <p className="text-muted-foreground">
            Gerencie perfis para personalizar recomendações e experiências
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
              <DialogDescription>
                Configure um novo perfil de personalização para seus clientes
              </DialogDescription>
            </DialogHeader>
            <ProfileForm onSave={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={profile.isActive ? "border-green-200" : "border-gray-200"}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <Badge variant={profile.isActive ? "default" : "secondary"}>
                      {profile.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <CardDescription>{profile.description}</CardDescription>
                  <p className="text-sm text-muted-foreground">
                    <User className="h-4 w-4 inline mr-1" />
                    {profile.targetAudience}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={profile.isActive}
                    onCheckedChange={() => handleToggleProfile(profile.id)}
                  />
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Tratamentos Preferidos</Label>
                  <div className="space-y-1 mt-1">
                    {profile.preferences.treatmentTypes.map((treatment, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Faixa de Preço</Label>
                  <p className="text-muted-foreground mt-1">{profile.preferences.priceRange}</p>
                </div>
                <div>
                  <Label className="font-medium">Horário Preferido</Label>
                  <p className="text-muted-foreground mt-1">{profile.preferences.timePreference}</p>
                </div>
                <div>
                  <Label className="font-medium">Estilo de Comunicação</Label>
                  <p className="text-muted-foreground mt-1">
                    {profile.preferences.communicationStyle}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-muted-foreground">
                <span>Criado em: {new Date(profile.createdAt).toLocaleDateString("pt-BR")}</span>
                <span>Último uso: {new Date(profile.lastUsed).toLocaleDateString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProfileForm({ onSave }: { onSave: () => void }) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="targeting">Segmentação</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Perfil</Label>
              <Input id="name" placeholder="Ex: Cliente Premium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Público-Alvo</Label>
              <Input id="target" placeholder="Ex: Mulheres 35-50 anos" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" placeholder="Descreva o perfil e suas características..." />
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceRange">Faixa de Preço</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">R$ 100 - R$ 500</SelectItem>
                  <SelectItem value="medium">R$ 500 - R$ 1.500</SelectItem>
                  <SelectItem value="high">R$ 1.500 - R$ 5.000</SelectItem>
                  <SelectItem value="premium">Acima de R$ 5.000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timePreference">Horário Preferido</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (8h-12h)</SelectItem>
                  <SelectItem value="afternoon">Tarde (12h-18h)</SelectItem>
                  <SelectItem value="evening">Noite (18h-22h)</SelectItem>
                  <SelectItem value="flexible">Flexível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="communication">Estilo de Comunicação</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal e detalhado</SelectItem>
                <SelectItem value="casual">Casual e direto</SelectItem>
                <SelectItem value="objective">Objetivo e eficiente</SelectItem>
                <SelectItem value="friendly">Amigável e pessoal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Faixa Etária</Label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Idade mínima" type="number" />
                <Input placeholder="Idade máxima" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="treatments">Tratamentos de Interesse</Label>
              <Textarea
                id="treatments"
                placeholder="Lista os tratamentos separados por vírgula..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" />
              <Label htmlFor="active">Ativar perfil imediatamente</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onSave}>
          Cancelar
        </Button>
        <Button onClick={onSave}>
          <Brain className="h-4 w-4 mr-2" />
          Criar Perfil
        </Button>
      </div>
    </div>
  );
}
