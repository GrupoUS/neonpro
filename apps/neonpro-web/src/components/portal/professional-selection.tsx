"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { motion } from "framer-motion";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Skeleton } from "@/components/ui/skeleton";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Star, User, Award, Clock, MapPin, Calendar, Info, X } from "lucide-react";
import type { useTranslation } from "@/app/lib/i18n/use-translation";
import type { createClient } from "@/app/utils/supabase/client";
import type { Professional, ProfessionalSpecialty } from "@/app/types/appointments";

interface ProfessionalSelectionProps {
  serviceId?: string;
  selectedProfessional?: Professional;
  onProfessionalSelect: (professional: Professional) => void;
  isLoading: boolean;
}

export default function ProfessionalSelection({
  serviceId,
  selectedProfessional,
  onProfessionalSelect,
  isLoading,
}: ProfessionalSelectionProps) {
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<ProfessionalSpecialty | "all">("all");
  const [selectedProfessionalForModal, setSelectedProfessionalForModal] =
    useState<Professional | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Specialty translations mapping
  const specialtyNames: Record<ProfessionalSpecialty, string> = {
    dermatologist: t("professionals.specialties.dermatologist"),
    aesthetician: t("professionals.specialties.aesthetician"),
    cosmetologist: t("professionals.specialties.cosmetologist"),
    plastic_surgeon: t("professionals.specialties.plastic_surgeon"),
    nutritionist: t("professionals.specialties.nutritionist"),
    physiotherapist: t("professionals.specialties.physiotherapist"),
  };

  // Load professionals based on service
  useEffect(() => {
    const loadProfessionals = async () => {
      if (!serviceId) return;

      try {
        setIsLoadingProfessionals(true);

        const supabase = createClient();

        // Query professionals with service-professional relationships
        // This allows us to filter professionals who can provide the selected service
        const { data, error } = await supabase
          .from("professionals")
          .select(`
            *,
            professional_services!inner(
              service_id,
              is_primary_service
            )
          `)
          .eq("is_active", true)
          .eq("accepts_new_patients", true)
          .eq("professional_services.service_id", serviceId)
          .order("name", { ascending: true });

        if (error) {
          console.error("Error loading professionals:", error);

          // Fall back to mock data if Supabase fails or tables don't exist yet
          const mockProfessionals: Professional[] = [
            {
              id: "1",
              user_id: "user-1",
              name: "Dra. Maria Silva",
              specialty: "dermatologist",
              license_number: "CRM-12345",
              bio: "Especialista em dermatologia estética com mais de 15 anos de experiência. Formada pela USP com especialização em procedimentos minimamente invasivos.",
              photo_url: "/avatars/maria-silva.jpg",
              years_experience: 15,
              is_active: true,
              accepts_new_patients: true,
              working_hours: {
                monday: { start: "08:00", end: "18:00" },
                tuesday: { start: "08:00", end: "18:00" },
                wednesday: { start: "08:00", end: "16:00" },
                thursday: { start: "08:00", end: "18:00" },
                friday: { start: "08:00", end: "16:00" },
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "2",
              user_id: "user-2",
              name: "Ana Santos",
              specialty: "aesthetician",
              license_number: "COREN-54321",
              bio: "Esteticista certificada especializada em tratamentos faciais e corporais. Atualização constante em novas técnicas e tecnologias.",
              photo_url: "/avatars/ana-santos.jpg",
              years_experience: 8,
              is_active: true,
              accepts_new_patients: true,
              working_hours: {
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "17:00" },
                saturday: { start: "08:00", end: "14:00" },
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "3",
              user_id: "user-3",
              name: "Dr. João Oliveira",
              specialty: "plastic_surgeon",
              license_number: "CRM-67890",
              bio: "Cirurgião plástico membro da SBCP com foco em harmonização facial e procedimentos estéticos minimamente invasivos.",
              photo_url: "/avatars/joao-oliveira.jpg",
              years_experience: 12,
              is_active: true,
              accepts_new_patients: true,
              working_hours: {
                monday: { start: "14:00", end: "20:00" },
                tuesday: { start: "14:00", end: "20:00" },
                wednesday: { start: "08:00", end: "12:00" },
                thursday: { start: "14:00", end: "20:00" },
                friday: { start: "08:00", end: "12:00" },
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];

          setProfessionals(mockProfessionals);
        } else {
          // Remove the professional_services property from the data as it's not part of Professional interface
          const cleanedData = (data || []).map(
            ({ professional_services, ...professional }) => professional,
          );
          setProfessionals(cleanedData);
        }
      } catch (error) {
        console.error("Error loading professionals:", error);
        // Set empty array on error
        setProfessionals([]);
      } finally {
        setIsLoadingProfessionals(false);
      }
    };

    loadProfessionals();
  }, [serviceId]);

  // Filter professionals by specialty and availability
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals;

    // Filter by specialty
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter((prof) => prof.specialty === selectedSpecialty);
    }

    // Keep all professionals for now - availability is shown in the status
    // This allows users to see unavailable professionals but with clear status
    return filtered;
  }, [professionals, selectedSpecialty]);

  // Get unique specialties for filter
  const availableSpecialties = useMemo(() => {
    const specialties = [...new Set(professionals.map((p) => p.specialty))];
    return [
      { id: "all" as const, name: t("common.all") },
      ...specialties.map((specialty) => ({
        id: specialty,
        name: specialtyNames[specialty],
      })),
    ];
  }, [professionals, specialtyNames, t]);

  const handleProfessionalSelect = (professional: Professional) => {
    if (isLoading) return;

    // Check availability before selection
    const availability = getAvailabilityStatus(professional);
    if (!availability.available) {
      // Optionally show a toast or alert here
      console.warn("Professional is not available for selection:", availability.message);
      return;
    }

    if (isMobile && professional.bio) {
      // Show modal with details on mobile for professionals with bio/detailed info
      setSelectedProfessionalForModal(professional);
    } else {
      onProfessionalSelect(professional);
    }
  };

  const handleModalProfessionalSelect = (professional: Professional) => {
    // Check availability before selection
    const availability = getAvailabilityStatus(professional);
    if (!availability.available) {
      // Optionally show a toast or alert here
      console.warn("Professional is not available for selection:", availability.message);
      return;
    }

    setSelectedProfessionalForModal(null);
    onProfessionalSelect(professional);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatWorkingHours = (workingHours: Record<string, any> | undefined) => {
    if (!workingHours) return t("professionals.working_hours.not_available");

    const days = Object.keys(workingHours);
    if (days.length === 0) return t("professionals.working_hours.not_available");

    // Simple format for now - could be enhanced
    return t("professionals.working_hours.available", { count: days.length });
  };

  // Check if professional is available on current day (basic availability logic)
  const isProfessionalAvailable = (professional: Professional) => {
    if (!professional.working_hours) return false;

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayName = dayNames[today];

    return !!professional.working_hours[todayName];
  };

  // Get availability status for display
  const getAvailabilityStatus = (professional: Professional) => {
    if (!professional.accepts_new_patients) {
      return {
        available: false,
        message: t("professionals.not_accepting_patients"),
        color: "text-red-600 dark:text-red-400",
      };
    }

    if (!isProfessionalAvailable(professional)) {
      return {
        available: false,
        message: t("professionals.unavailable_today"),
        color: "text-orange-600 dark:text-orange-400",
      };
    }

    return {
      available: true,
      message: t("professionals.accepting_patients"),
      color: "text-green-600 dark:text-green-400",
    };
  };

  if (isLoadingProfessionals) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-32" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("booking.steps.professional.title")}
        </h2>
        <p className="text-muted-foreground">{t("booking.steps.professional.subtitle")}</p>
      </div>
      {/* Specialty Filters */}
      {availableSpecialties.length > 2 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {availableSpecialties.map((specialty) => {
            const isSelected = selectedSpecialty === specialty.id;

            return (
              <Button
                key={specialty.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty.id)}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                {specialty.name}
              </Button>
            );
          })}
        </div>
      )}
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("professionals.results", { count: filteredProfessionals.length })}
        </p>
        {selectedProfessional && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{t("professionals.selected")}</span>
            <span className="font-medium">{selectedProfessional.name}</span>
          </Badge>
        )}
      </div>{" "}
      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProfessionals.map((professional, index) => {
          const isSelected = selectedProfessional?.id === professional.id;

          return (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                onClick={() => handleProfessionalSelect(professional)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={professional.photo_url} alt={professional.name} />
                      <AvatarFallback className="text-lg font-medium">
                        {getInitials(professional.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{professional.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {specialtyNames[professional.specialty]}
                      </Badge>

                      {professional.license_number && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {professional.license_number}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {professional.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{professional.bio}</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>
                        {t("professionals.experience", {
                          years: professional.years_experience,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">
                        {formatWorkingHours(professional.working_hours)}
                      </span>
                    </div>
                  </div>

                  {/* Rating placeholder - could be enhanced with real ratings */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">5.0 (24 avaliações)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(() => {
                      const availability = getAvailabilityStatus(professional);
                      return (
                        <div className={`flex items-center gap-1 ${availability.color}`}>
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">{availability.message}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex gap-2">
                    {(() => {
                      const availability = getAvailabilityStatus(professional);
                      return (
                        <Button
                          className="flex-1"
                          variant={isSelected ? "default" : "outline"}
                          disabled={isLoading || !availability.available}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isMobile || !professional.bio) {
                              handleProfessionalSelect(professional);
                            }
                          }}
                        >
                          {isSelected
                            ? t("professionals.selected")
                            : availability.available
                              ? t("professionals.select")
                              : t("professionals.unavailable")}
                        </Button>
                      );
                    })()}
                    {isMobile && professional.bio && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfessionalForModal(professional);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {/* Empty State */}
      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("professionals.no_results.title")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("professionals.no_results.description")}
            </p>
          </div>
          <Button variant="outline" onClick={() => setSelectedSpecialty("all")}>
            {t("professionals.show_all")}
          </Button>
        </div>
      )}
      {/* Professional Details Modal for Mobile */}
      <Dialog
        open={!!selectedProfessionalForModal}
        onOpenChange={(open) => !open && setSelectedProfessionalForModal(null)}
      >
        <DialogContent className="max-w-md mx-4">
          {selectedProfessionalForModal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={selectedProfessionalForModal.photo_url}
                      alt={selectedProfessionalForModal.name}
                    />
                    <AvatarFallback className="text-lg font-medium">
                      {getInitials(selectedProfessionalForModal.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{selectedProfessionalForModal.name}</div>
                    <Badge variant="secondary" className="mt-1">
                      {specialtyNames[selectedProfessionalForModal.specialty]}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-left">
                  {selectedProfessionalForModal.bio}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  {selectedProfessionalForModal.license_number && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Registro:</strong> {selectedProfessionalForModal.license_number}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>
                      {t("professionals.experience", {
                        years: selectedProfessionalForModal.years_experience,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">
                      {formatWorkingHours(selectedProfessionalForModal.working_hours)}
                    </span>
                  </div>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">5.0 (24 avaliações)</span>
                </div>

                <div className="flex items-center gap-2">
                  {(() => {
                    const availability = getAvailabilityStatus(selectedProfessionalForModal);
                    return (
                      <div className={`flex items-center gap-1 ${availability.color}`}>
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">{availability.message}</span>
                      </div>
                    );
                  })()}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleModalProfessionalSelect(selectedProfessionalForModal)}
                  disabled={
                    isLoading || !getAvailabilityStatus(selectedProfessionalForModal).available
                  }
                >
                  {(() => {
                    const availability = getAvailabilityStatus(selectedProfessionalForModal);
                    if (selectedProfessional?.id === selectedProfessionalForModal.id) {
                      return t("professionals.selected");
                    }
                    return availability.available
                      ? t("professionals.select")
                      : t("professionals.unavailable");
                  })()}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
