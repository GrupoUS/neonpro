'use client';

import { MapPin, Star, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type Professional = {
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
};

type ProfessionalSelectionProps = {
  serviceId: string;
  selectedProfessional: Professional | null;
  onProfessionalSelect: (professional: Professional | null) => void;
  allowAnyProfessional?: boolean;
  className?: string;
};

export function ProfessionalSelection({
  serviceId,
  selectedProfessional,
  onProfessionalSelect,
  allowAnyProfessional = true,
  className = '',
}: ProfessionalSelectionProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (serviceId) {
      fetchProfessionals();
    }
  }, [serviceId, fetchProfessionals]);

  const fetchProfessionals = async () => {
    try {
      const supabase = createClient();

      // Fetch professionals who can perform this service
      const { data, error: fetchError } = await supabase.rpc(
        'get_professionals_for_service',
        {
          p_service_id: serviceId,
        }
      );

      if (fetchError) {
        throw fetchError;
      }

      setProfessionals(data || []);
    } catch (_err) {
      setError('Erro ao carregar profissionais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) {
      return null;
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" key={i} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star className="h-4 w-4 fill-yellow-200 text-yellow-400" key="half" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star className="h-4 w-4 text-gray-300" key={`empty-${i}`} />);
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-1 text-gray-600 text-sm">
          ({rating.toFixed(1)})
        </span>
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
        <h2 className="mb-2 font-semibold text-gray-900 text-xl">
          Escolha o Profissional
        </h2>
        <p className="text-gray-600">
          Selecione um profissional específico ou deixe que escolhamos o melhor
          disponível
        </p>
      </div>

      {/* Any Professional Option */}
      {allowAnyProfessional && (
        <Card
          aria-pressed={selectedProfessional === null}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedProfessional === null
              ? 'bg-blue-50 ring-2 ring-blue-500'
              : 'hover:border-blue-300'
          }`}
          onClick={() => onProfessionalSelect(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProfessionalSelect(null);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <CardContent className="flex items-center p-6">
            <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-gray-900 text-lg">
                Qualquer Profissional Disponível
              </h3>
              <p className="text-gray-600 text-sm">
                Escolheremos automaticamente o melhor profissional disponível
                para seu horário
              </p>
              {selectedProfessional === null && (
                <Badge
                  className="mt-2 bg-blue-100 text-blue-700"
                  variant="secondary"
                >
                  Selecionado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {professionals.map((professional) => (
          <Card
            aria-disabled={!professional.is_available}
            aria-pressed={selectedProfessional?.id === professional.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedProfessional?.id === professional.id
                ? 'bg-blue-50 ring-2 ring-blue-500'
                : 'hover:border-blue-300'
            } ${professional.is_available ? '' : 'opacity-60'}`}
            key={professional.id}
            onClick={() => {
              if (professional.is_available) {
                onProfessionalSelect(professional);
              }
            }}
            onKeyDown={(e) => {
              if (
                (e.key === 'Enter' || e.key === ' ') &&
                professional.is_available
              ) {
                e.preventDefault();
                onProfessionalSelect(professional);
              }
            }}
            role="button"
            tabIndex={professional.is_available ? 0 : -1}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      alt={`Foto de ${professional.name}`}
                      src={professional.avatar_url || undefined}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-lg text-white">
                      {getInitials(professional.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!professional.is_available && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-500 bg-opacity-50">
                      <Badge className="px-1 text-xs" variant="secondary">
                        Indisponível
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {professional.name}
                    </h3>
                    {selectedProfessional?.id === professional.id && (
                      <Badge
                        className="bg-blue-100 text-blue-700"
                        variant="secondary"
                      >
                        Selecionado
                      </Badge>
                    )}
                  </div>

                  {professional.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.slice(0, 3).map((specialty) => (
                        <Badge
                          className="text-xs"
                          key={specialty}
                          variant="outline"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {professional.specialties.length > 3 && (
                        <Badge className="text-xs" variant="outline">
                          +{professional.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {professional.rating && renderStars(professional.rating)}

                  {professional.location && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{professional.location}</span>
                    </div>
                  )}

                  {professional.bio && (
                    <p className="line-clamp-2 text-gray-600 text-sm">
                      {professional.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card className="p-6 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 font-medium text-gray-900 text-lg">
            Nenhum profissional encontrado
          </h3>
          <p className="text-gray-600">
            Não há profissionais disponíveis para este serviço no momento.
          </p>
          <Button
            className="mt-4"
            onClick={fetchProfessionals}
            variant="outline"
          >
            Atualizar Lista
          </Button>
        </Card>
      )}

      {/* Info about professional selection */}
      <Alert className="border-blue-200 bg-blue-50">
        <User className="h-4 w-4" />
        <AlertDescription className="text-blue-700">
          Você pode escolher um profissional específico ou deixar que
          selecionemos automaticamente com base na disponibilidade e
          especialização.
        </AlertDescription>
      </Alert>
    </div>
  );
}
