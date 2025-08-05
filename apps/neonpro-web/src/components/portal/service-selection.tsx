"use client";

import type { motion } from "framer-motion";
import type {
  Clock,
  DollarSign,
  Heart,
  Info,
  Search,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import type { useTranslation } from "@/app/lib/i18n/use-translation";
import type { Service, ServiceCategory } from "@/app/types/appointments";
import type { createClient } from "@/app/utils/supabase/client";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Skeleton } from "@/components/ui/skeleton";

interface ServiceSelectionProps {
  selectedService?: Service;
  onServiceSelect: (service: Service) => void;
  isLoading: boolean;
}

export default function ServiceSelection({
  selectedService,
  onServiceSelect,
  isLoading,
}: ServiceSelectionProps) {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<Service | null>(null);
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

  // Category icons mapping
  const categoryIcons = {
    facial: Sparkles,
    corporal: User,
    capilar: Heart,
    wellness: Zap,
    all: Star,
  };

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);

        const supabase = createClient();
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (error) {
          console.error("Error loading services:", error);
          // Fall back to mock data if Supabase fails
          const mockServices: Service[] = [
            {
              id: "1",
              name: "Limpeza de Pele Profunda",
              description:
                "Procedimento completo de limpeza facial com extração de cravos e hidratação",
              category: "facial",
              duration_minutes: 90,
              price: 150,
              is_active: true,
              requires_evaluation: false,
              preparation_instructions: "Evitar produtos com ácidos 3 dias antes do procedimento",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Peeling Químico",
              description: "Renovação celular com ácidos específicos para melhorar textura da pele",
              category: "facial",
              duration_minutes: 60,
              price: 200,
              is_active: true,
              requires_evaluation: true,
              preparation_instructions:
                "Consulta prévia obrigatória para avaliação do tipo de pele",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "3",
              name: "Massagem Relaxante",
              description:
                "Massagem corporal completa para alívio do estresse e tensões musculares",
              category: "corporal",
              duration_minutes: 60,
              price: 120,
              is_active: true,
              requires_evaluation: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "4",
              name: "Drenagem Linfática",
              description: "Técnica especializada para redução de inchaço e retenção de líquidos",
              category: "corporal",
              duration_minutes: 90,
              price: 180,
              is_active: true,
              requires_evaluation: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "5",
              name: "Botox",
              description: "Aplicação de toxina botulínica para suavização de rugas de expressão",
              category: "facial",
              duration_minutes: 30,
              price: 800,
              is_active: true,
              requires_evaluation: true,
              preparation_instructions:
                "Consulta médica obrigatória. Evitar anticoagulantes 7 dias antes",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];

          setServices(mockServices);
        } else {
          setServices(data || []);
        }
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  // Group services by category
  const serviceCategories = useMemo((): ServiceCategory[] => {
    const grouped = services.reduce(
      (acc, service) => {
        if (!acc[service.category]) {
          acc[service.category] = [];
        }
        acc[service.category].push(service);
        return acc;
      },
      {} as Record<string, Service[]>,
    );

    return Object.entries(grouped).map(([category, services]) => ({
      category,
      services,
      icon: categoryIcons[category as keyof typeof categoryIcons]?.name || "Star",
      description: t(`booking.categories.${category}.description`),
    }));
  }, [services, t]);

  // Filter services based on search and category
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          service.description?.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [services, selectedCategory, searchTerm]);

  // Get unique categories for filter buttons
  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category))];
    return [
      { id: "all", name: t("booking.categories.all"), icon: Star },
      ...cats.map((cat) => ({
        id: cat,
        name: t(`booking.categories.${cat}.name`),
        icon: categoryIcons[cat as keyof typeof categoryIcons] || Star,
      })),
    ];
  }, [services, t]);

  const handleServiceSelect = (service: Service) => {
    if (isLoading) return;

    if (isMobile && service.preparation_instructions) {
      // Show modal with details on mobile for services with preparation instructions
      setSelectedServiceForModal(service);
    } else {
      onServiceSelect(service);
    }
  };

  const handleModalServiceSelect = (service: Service) => {
    setSelectedServiceForModal(null);
    onServiceSelect(service);
  };

  if (isLoadingServices) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
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
          {t("booking.steps.service.title")}
        </h2>
        <p className="text-muted-foreground">{t("booking.steps.service.subtitle")}</p>
      </div>
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("booking.service.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("booking.service.results", { count: filteredServices.length })}
        </p>
        {selectedService && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{t("booking.service.selected")}</span>
            <span className="font-medium">{selectedService.name}</span>
          </Badge>
        )}
      </div>{" "}
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, index) => {
          const isSelected = selectedService?.id === service.id;
          const Icon = categoryIcons[service.category as keyof typeof categoryIcons] || Star;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                onClick={() => handleServiceSelect(service)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{service.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {t(`booking.categories.${service.category}.name`)}
                        </Badge>
                      </div>
                    </div>
                    {service.requires_evaluation && (
                      <Badge variant="secondary" className="text-xs">
                        {t("booking.service.evaluation_required")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes}min</span>
                    </div>

                    {service.price && (
                      <div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4" />
                        <span>R$ {service.price.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {service.preparation_instructions && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>{t("booking.service.preparation")}:</strong>{" "}
                        {service.preparation_instructions}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      variant={isSelected ? "default" : "outline"}
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isMobile || !service.preparation_instructions) {
                          handleServiceSelect(service);
                        }
                      }}
                    >
                      {isSelected ? t("booking.service.selected") : t("booking.service.select")}
                    </Button>
                    {isMobile && service.preparation_instructions && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceForModal(service);
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
      {filteredServices.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{t("booking.service.no_results.title")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("booking.service.no_results.description")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          >
            {t("booking.service.clear_filters")}
          </Button>
        </div>
      )}
      {/* Service Details Modal for Mobile */}
      <Dialog
        open={!!selectedServiceForModal}
        onOpenChange={(open) => !open && setSelectedServiceForModal(null)}
      >
        <DialogContent className="max-w-md mx-4">
          {selectedServiceForModal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon =
                      categoryIcons[
                        selectedServiceForModal.category as keyof typeof categoryIcons
                      ] || Star;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {selectedServiceForModal.name}
                </DialogTitle>
                <DialogDescription>{selectedServiceForModal.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {t(`booking.categories.${selectedServiceForModal.category}.name`)}
                  </Badge>
                  {selectedServiceForModal.requires_evaluation && (
                    <Badge variant="secondary" className="text-xs">
                      {t("booking.service.evaluation_required")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{selectedServiceForModal.duration_minutes}min</span>
                  </div>

                  {selectedServiceForModal.price && (
                    <div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {selectedServiceForModal.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {selectedServiceForModal.preparation_instructions && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">{t("booking.service.preparation")}:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedServiceForModal.preparation_instructions}
                    </p>
                  </div>
                )}

                {selectedServiceForModal.post_care_instructions && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">{t("booking.service.post_care")}:</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedServiceForModal.post_care_instructions}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleModalServiceSelect(selectedServiceForModal)}
                  disabled={isLoading}
                >
                  {selectedService?.id === selectedServiceForModal.id
                    ? t("booking.service.selected")
                    : t("booking.service.select")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
