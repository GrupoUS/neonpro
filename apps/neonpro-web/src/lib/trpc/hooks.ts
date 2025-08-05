/**
 * Healthcare-specific tRPC hooks for NeonPro
 *
 * Custom hooks with:
 * - Healthcare role validation
 * - LGPD compliance checks
 * - Medical data handling patterns
 * - Error handling for healthcare scenarios
 */

// Enhanced auth hook with healthcare validation
export function useHealthcareAuth() {
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        // Redirect to login for unauthorized healthcare access
        router.push("/login");
      } else if (error.data?.code === "FORBIDDEN") {
        // Handle LGPD consent issues
        if (error.message.includes("LGPD")) {
          router.push("/consent");
        }
      }
    },
  });

  // Validate medical professional access
  const isMedicalProfessional = user?.role === "healthcare_professional" && !!user.medical_license;

  // Validate admin access
  const isAdmin = user?.role === "admin";

  // Validate LGPD compliance
  const isLGPDCompliant = user?.lgpd_consent && user?.data_consent_given;

  // Healthcare role checker
  const hasRole = useCallback(
    (roles: string[]) => {
      return user ? roles.includes(user.role) : false;
    },
    [user],
  );

  // Check if user can access patient data
  const canAccessPatientData = user && isLGPDCompliant && (isMedicalProfessional || isAdmin);

  return {
    user,
    isLoading,
    error,
    refetch,
    isAuthenticated: !!user,
    isMedicalProfessional,
    isAdmin,
    isLGPDCompliant,
    canAccessPatientData,
    hasRole,
    tenantId: user?.tenant_id,
  };
}

// LGPD consent management hook
export function useLGPDConsent() {
  const updateConsent = trpc.auth.updateConsent.useMutation({
    onSuccess: () => {
      // Refetch user data after consent update
      trpc.auth.me.useQuery().refetch();
    },
    onError: (error) => {
      console.error("Failed to update LGPD consent:", error);
    },
  });

  const grantConsent = useCallback(() => {
    updateConsent.mutate({
      lgpd_consent: true,
      data_consent_given: true,
    });
  }, [updateConsent]);

  const revokeConsent = useCallback(() => {
    updateConsent.mutate({
      lgpd_consent: false,
      data_consent_given: false,
    });
  }, [updateConsent]);

  return {
    updateConsent: updateConsent.mutate,
    grantConsent,
    revokeConsent,
    isLoading: updateConsent.isLoading,
    error: updateConsent.error,
    isSuccess: updateConsent.isSuccess,
  };
}

// Healthcare error handler hook
export function useHealthcareErrorHandler() {
  const router = useRouter();

  const handleError = useCallback(
    (error: any) => {
      const errorCode = error?.data?.code;
      const errorMessage = error?.message;

      switch (errorCode) {
        case "UNAUTHORIZED":
          router.push("/login");
          break;
        case "FORBIDDEN":
          if (errorMessage?.includes("LGPD")) {
            router.push("/consent");
          } else if (errorMessage?.includes("medical license")) {
            // Handle medical license validation errors
            console.error("Medical license validation failed");
          } else {
            // General permission error
            console.error("Access forbidden:", errorMessage);
          }
          break;
        case "NOT_FOUND":
          console.error("Healthcare resource not found:", errorMessage);
          break;
        default:
          console.error("Healthcare API error:", errorMessage);
      }
    },
    [router],
  );

  return { handleError };
}
