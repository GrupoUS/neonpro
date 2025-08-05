"use client";

import type { createClient } from "@/app/utils/supabase/client";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent } from "@/components/ui/card";
import type { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { MapPin, Star, User } from "lucide-react";
import type { useEffect, useState } from "react";

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  avatar_url: string | null;
  is_available: boolean;
  rating: number | null;
  location: string | null;
}

interface ProfessionalSelectionProps {
  serviceId: string;
  selectedProfessional: Professional | null;
  onProfessionalSelect: (professional: Professional | null) => void;
  allowAnyProfessional?: boolean;
  className?: string;
}

export function ProfessionalSelection({
  serviceId,
  selectedProfessional,
  onProfessionalSelect,
  allowAnyProfessional = true,
  className = "",
}: ProfessionalSelectionProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (serviceId) {
      fetchProfessionals();
    }
  }, [serviceId]);

  const fetchProfessionals = async () => {
    try {
      const supabase = createClient();

      // Fetch professionals who can perform this service
      const { data, error: fetchError } = await supabase.rpc("get_professionals_for_service", {
        p_service_id: serviceId,
      });

      if (fetchError) throw fetchError;

      setProfessionals(data || []);
    } catch (err) {
      console.error("Error fetching professionals:", err);
      setError("Erro ao carregar profissionais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={`${className} border-red-200 bg-red-50`}>
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Escolha o Profissional</h2>
        <p className="text-gray-600">
          Selecione um profissional específico ou deixe que escolhamos o melhor disponível
        </p>
      </div>

      {/* Any Professional Option */}
      {allowAnyProfessional && (
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedProfessional === null
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:border-blue-300"
          }`}
          onClick={() => onProfessionalSelect(null)}
          role="button"
          tabIndex={0}
          aria-pressed={selectedProfessional === null}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onProfessionalSelect(null);
            }
          }}
        >
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-4">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Qualquer Profissional Disponível
              </h3>
              <p className="text-gray-600 text-sm">
                Escolheremos automaticamente o melhor profissional disponível para seu horário
              </p>
              {selectedProfessional === null && (
                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700">
                  Selecionado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((professional) => (
          <Card
            key={professional.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProfessional?.id === professional.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:border-blue-300"
            } ${!professional.is_available ? "opacity-60" : ""}`}
            onClick={() => {
              if (professional.is_available) {
                onProfessionalSelect(professional);
              }
            }}
            role="button"
            tabIndex={professional.is_available ? 0 : -1}
            aria-pressed={selectedProfessional?.id === professional.id}
            aria-disabled={!professional.is_available}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && professional.is_available) {
                e.preventDefault();
                onProfessionalSelect(professional);
              }
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={professional.avatar_url || undefined}
                      alt={`Foto de ${professional.name}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                      {getInitials(professional.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!professional.is_available && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                      <Badge variant="secondary" className="text-xs px-1">
                        Indisponível
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                    {selectedProfessional?.id === professional.id && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Selecionado
                      </Badge>
                    )}
                  </div>

                  {professional.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {professional.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {professional.rating && renderStars(professional.rating)}

                  {professional.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{professional.location}</span>
                    </div>
                  )}

                  {professional.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2">{professional.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card className="p-6 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum profissional encontrado</h3>
          <p className="text-gray-600">
            Não há profissionais disponíveis para este serviço no momento.
          </p>
          <Button variant="outline" onClick={fetchProfessionals} className="mt-4">
            Atualizar Lista
          </Button>
        </Card>
      )}

      {/* Info about professional selection */}
      <Alert className="border-blue-200 bg-blue-50">
        <User className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          Você pode escolher um profissional específico ou deixar que selecionemos automaticamente
          com base na disponibilidade e especialização.
        </AlertDescription>
      </Alert>
    </div>
  );
}
