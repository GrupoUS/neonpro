"use client";

import type { FileText, Filter, Mail, Phone, Search, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function PatientSearch({ searchTerm, onSearchChange }: PatientSearchProps) {
  const [searchType, setSearchType] = useState<"name" | "phone" | "email" | "cpf">("name");
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Optimized debounce search to avoid excessive API calls
  useEffect(() => {
    // Only search if term has minimum length or is empty (for reset)
    if (localSearchTerm.length === 0 || localSearchTerm.length >= 2) {
      const timer = setTimeout(() => {
        onSearchChange(localSearchTerm);
      }, 500); // Increased debounce time for better performance

      return () => clearTimeout(timer);
    }
  }, [localSearchTerm, onSearchChange]);

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onSearchChange("");
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "name":
        return "Digite o nome do paciente...";
      case "phone":
        return "Digite o telefone (ex: 11999999999)...";
      case "email":
        return "Digite o email do paciente...";
      case "cpf":
        return "Digite o CPF (ex: 123.456.789-00)...";
      default:
        return "Digite para buscar...";
    }
  };

  const getSearchIcon = () => {
    switch (searchType) {
      case "name":
        return <User className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "cpf":
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const formatSearchInput = (value: string) => {
    switch (searchType) {
      case "cpf":
        // Format CPF as user types
        return value
          .replace(/\D/g, "")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{1,2})/, "$1-$2")
          .replace(/(-\d{2})\d+?$/, "$1");
      case "phone":
        // Format phone as user types
        return value
          .replace(/\D/g, "")
          .replace(/(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2")
          .replace(/(\d{4})-(\d)(\d{4})/, "$1$2-$3")
          .replace(/(-\d{4})\d+?$/, "$1");
      default:
        return value;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatSearchInput(rawValue);
    setLocalSearchTerm(formattedValue);
  };

  return (
    <div className="space-y-4">
      {/* Search Type Selector */}
      <div className="flex flex-wrap gap-2">
        <Label className="text-sm font-medium flex items-center">Buscar por:</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={searchType === "name" ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchType("name")}
            className="h-8"
          >
            <User className="h-3 w-3 mr-1" />
            Nome
          </Button>
          <Button
            variant={searchType === "phone" ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchType("phone")}
            className="h-8"
          >
            <Phone className="h-3 w-3 mr-1" />
            Telefone
          </Button>
          <Button
            variant={searchType === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchType("email")}
            className="h-8"
          >
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          <Button
            variant={searchType === "cpf" ? "default" : "outline"}
            size="sm"
            onClick={() => setSearchType("cpf")}
            className="h-8"
          >
            <FileText className="h-3 w-3 mr-1" />
            CPF
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {getSearchIcon()}
        </div>
        <Input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={localSearchTerm}
          onChange={handleInputChange}
          className="pl-10 pr-10"
          maxLength={searchType === "cpf" ? 14 : searchType === "phone" ? 15 : undefined}
        />
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>
          <strong>Dicas de busca:</strong>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>• Nome: busca por nome completo ou parcial</div>
          <div>• Telefone: aceita formato (11) 99999-9999</div>
          <div>• Email: busca por endereço de email</div>
          <div>• CPF: aceita formato 123.456.789-00</div>
        </div>
      </div>

      {/* Active Search Indicator */}
      {localSearchTerm && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            Buscando por{" "}
            {searchType === "name"
              ? "nome"
              : searchType === "phone"
                ? "telefone"
                : searchType === "email"
                  ? "email"
                  : "CPF"}
            :<span className="font-medium ml-1">{localSearchTerm}</span>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="h-6 px-2 text-xs"
          >
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
