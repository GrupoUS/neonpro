"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizationProfilesManagement = PersonalizationProfilesManagement;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var mockProfiles = [
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
function PersonalizationProfilesManagement() {
    var _a = (0, react_1.useState)(mockProfiles), profiles = _a[0], setProfiles = _a[1];
    var _b = (0, react_1.useState)(false), isCreateDialogOpen = _b[0], setIsCreateDialogOpen = _b[1];
    var _c = (0, react_1.useState)(null), editingProfile = _c[0], setEditingProfile = _c[1];
    var handleToggleProfile = function (profileId) {
        setProfiles(profiles.map(function (p) {
            return p.id === profileId ? __assign(__assign({}, p), { isActive: !p.isActive }) : p;
        }));
    };
    var handleDeleteProfile = function (profileId) {
        setProfiles(profiles.filter(function (p) { return p.id !== profileId; }));
    };
    return (<div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Perfis de Personalização</h2>
          <p className="text-muted-foreground">
            Gerencie perfis para personalizar recomendações e experiências
          </p>
        </div>
        <dialog_1.Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button>
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Novo Perfil
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Criar Novo Perfil</dialog_1.DialogTitle>
              <dialog_1.DialogDescription>
                Configure um novo perfil de personalização para seus clientes
              </dialog_1.DialogDescription>
            </dialog_1.DialogHeader>
            <ProfileForm onSave={function () { return setIsCreateDialogOpen(false); }}/>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      <div className="grid gap-4">
        {profiles.map(function (profile) { return (<card_1.Card key={profile.id} className={profile.isActive ? "border-green-200" : "border-gray-200"}>
            <card_1.CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <card_1.CardTitle className="text-lg">{profile.name}</card_1.CardTitle>
                    <badge_1.Badge variant={profile.isActive ? "default" : "secondary"}>
                      {profile.isActive ? "Ativo" : "Inativo"}
                    </badge_1.Badge>
                  </div>
                  <card_1.CardDescription>{profile.description}</card_1.CardDescription>
                  <p className="text-sm text-muted-foreground">
                    <lucide_react_1.User className="h-4 w-4 inline mr-1"/>
                    {profile.targetAudience}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <switch_1.Switch checked={profile.isActive} onCheckedChange={function () { return handleToggleProfile(profile.id); }}/>
                  <button_1.Button variant="outline" size="sm">
                    <lucide_react_1.Edit className="h-4 w-4"/>
                  </button_1.Button>
                  <button_1.Button variant="outline" size="sm" onClick={function () { return handleDeleteProfile(profile.id); }}>
                    <lucide_react_1.Trash2 className="h-4 w-4 text-red-500"/>
                  </button_1.Button>
                </div>
              </div>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <label_1.Label className="font-medium">Tratamentos Preferidos</label_1.Label>
                  <div className="space-y-1 mt-1">
                    {profile.preferences.treatmentTypes.map(function (treatment, index) { return (<badge_1.Badge key={index} variant="outline" className="text-xs">
                          {treatment}
                        </badge_1.Badge>); })}
                  </div>
                </div>
                <div>
                  <label_1.Label className="font-medium">Faixa de Preço</label_1.Label>
                  <p className="text-muted-foreground mt-1">
                    {profile.preferences.priceRange}
                  </p>
                </div>
                <div>
                  <label_1.Label className="font-medium">Horário Preferido</label_1.Label>
                  <p className="text-muted-foreground mt-1">
                    {profile.preferences.timePreference}
                  </p>
                </div>
                <div>
                  <label_1.Label className="font-medium">Estilo de Comunicação</label_1.Label>
                  <p className="text-muted-foreground mt-1">
                    {profile.preferences.communicationStyle}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t text-xs text-muted-foreground">
                <span>
                  Criado em:{" "}
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                </span>
                <span>
                  Último uso:{" "}
                  {new Date(profile.lastUsed).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </card_1.CardContent>
          </card_1.Card>); })}
      </div>
    </div>);
}
function ProfileForm(_a) {
    var onSave = _a.onSave;
    return (<div className="space-y-6">
      <tabs_1.Tabs defaultValue="basic" className="w-full">
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="basic">Informações Básicas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="preferences">Preferências</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="targeting">Segmentação</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="name">Nome do Perfil</label_1.Label>
              <input_1.Input id="name" placeholder="Ex: Cliente Premium"/>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="target">Público-Alvo</label_1.Label>
              <input_1.Input id="target" placeholder="Ex: Mulheres 35-50 anos"/>
            </div>
          </div>
          <div className="space-y-2">
            <label_1.Label htmlFor="description">Descrição</label_1.Label>
            <textarea_1.Textarea id="description" placeholder="Descreva o perfil e suas características..."/>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="priceRange">Faixa de Preço</label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione a faixa"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="low">R$ 100 - R$ 500</select_1.SelectItem>
                  <select_1.SelectItem value="medium">R$ 500 - R$ 1.500</select_1.SelectItem>
                  <select_1.SelectItem value="high">R$ 1.500 - R$ 5.000</select_1.SelectItem>
                  <select_1.SelectItem value="premium">Acima de R$ 5.000</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="timePreference">Horário Preferido</label_1.Label>
              <select_1.Select>
                <select_1.SelectTrigger>
                  <select_1.SelectValue placeholder="Selecione o horário"/>
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="morning">Manhã (8h-12h)</select_1.SelectItem>
                  <select_1.SelectItem value="afternoon">Tarde (12h-18h)</select_1.SelectItem>
                  <select_1.SelectItem value="evening">Noite (18h-22h)</select_1.SelectItem>
                  <select_1.SelectItem value="flexible">Flexível</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
          <div className="space-y-2">
            <label_1.Label htmlFor="communication">Estilo de Comunicação</label_1.Label>
            <select_1.Select>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Selecione o estilo"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="formal">Formal e detalhado</select_1.SelectItem>
                <select_1.SelectItem value="casual">Casual e direto</select_1.SelectItem>
                <select_1.SelectItem value="objective">Objetivo e eficiente</select_1.SelectItem>
                <select_1.SelectItem value="friendly">Amigável e pessoal</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="targeting" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label_1.Label>Faixa Etária</label_1.Label>
              <div className="grid grid-cols-2 gap-4">
                <input_1.Input placeholder="Idade mínima" type="number"/>
                <input_1.Input placeholder="Idade máxima" type="number"/>
              </div>
            </div>
            <div className="space-y-2">
              <label_1.Label htmlFor="treatments">Tratamentos de Interesse</label_1.Label>
              <textarea_1.Textarea id="treatments" placeholder="Lista os tratamentos separados por vírgula..."/>
            </div>
            <div className="flex items-center space-x-2">
              <switch_1.Switch id="active"/>
              <label_1.Label htmlFor="active">Ativar perfil imediatamente</label_1.Label>
            </div>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      <div className="flex justify-end space-x-2">
        <button_1.Button variant="outline" onClick={onSave}>
          Cancelar
        </button_1.Button>
        <button_1.Button onClick={onSave}>
          <lucide_react_1.Brain className="h-4 w-4 mr-2"/>
          Criar Perfil
        </button_1.Button>
      </div>
    </div>);
}
