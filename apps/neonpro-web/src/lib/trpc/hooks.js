"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHealthcareAuth = useHealthcareAuth;
exports.useLGPDConsent = useLGPDConsent;
exports.useHealthcareErrorHandler = useHealthcareErrorHandler;
var client_1 = require("./client");
var navigation_1 = require("next/navigation");
var react_1 = require("react");
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
function useHealthcareAuth() {
    var router = (0, navigation_1.useRouter)();
    var _a = client_1.trpc.auth.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: true,
        onError: function (error) {
            var _a, _b;
            if (((_a = error.data) === null || _a === void 0 ? void 0 : _a.code) === 'UNAUTHORIZED') {
                // Redirect to login for unauthorized healthcare access
                router.push('/login');
            }
            else if (((_b = error.data) === null || _b === void 0 ? void 0 : _b.code) === 'FORBIDDEN') {
                // Handle LGPD consent issues
                if (error.message.includes('LGPD')) {
                    router.push('/consent');
                }
            }
        },
    }), user = _a.data, isLoading = _a.isLoading, error = _a.error, refetch = _a.refetch;
    // Validate medical professional access
    var isMedicalProfessional = (user === null || user === void 0 ? void 0 : user.role) === 'healthcare_professional' &&
        !!user.medical_license;
    // Validate admin access
    var isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    // Validate LGPD compliance
    var isLGPDCompliant = (user === null || user === void 0 ? void 0 : user.lgpd_consent) && (user === null || user === void 0 ? void 0 : user.data_consent_given);
    // Healthcare role checker
    var hasRole = (0, react_1.useCallback)(function (roles) {
        return user ? roles.includes(user.role) : false;
    }, [user]);
    // Check if user can access patient data
    var canAccessPatientData = user &&
        isLGPDCompliant &&
        (isMedicalProfessional || isAdmin);
    return {
        user: user,
        isLoading: isLoading,
        error: error,
        refetch: refetch,
        isAuthenticated: !!user,
        isMedicalProfessional: isMedicalProfessional,
        isAdmin: isAdmin,
        isLGPDCompliant: isLGPDCompliant,
        canAccessPatientData: canAccessPatientData,
        hasRole: hasRole,
        tenantId: user === null || user === void 0 ? void 0 : user.tenant_id,
    };
}
// LGPD consent management hook  
function useLGPDConsent() {
    var updateConsent = client_1.trpc.auth.updateConsent.useMutation({
        onSuccess: function () {
            // Refetch user data after consent update
            client_1.trpc.auth.me.useQuery().refetch();
        },
        onError: function (error) {
            console.error('Failed to update LGPD consent:', error);
        },
    });
    var grantConsent = (0, react_1.useCallback)(function () {
        updateConsent.mutate({
            lgpd_consent: true,
            data_consent_given: true,
        });
    }, [updateConsent]);
    var revokeConsent = (0, react_1.useCallback)(function () {
        updateConsent.mutate({
            lgpd_consent: false,
            data_consent_given: false,
        });
    }, [updateConsent]);
    return {
        updateConsent: updateConsent.mutate,
        grantConsent: grantConsent,
        revokeConsent: revokeConsent,
        isLoading: updateConsent.isLoading,
        error: updateConsent.error,
        isSuccess: updateConsent.isSuccess,
    };
}
// Healthcare error handler hook
function useHealthcareErrorHandler() {
    var router = (0, navigation_1.useRouter)();
    var handleError = (0, react_1.useCallback)(function (error) {
        var _a;
        var errorCode = (_a = error === null || error === void 0 ? void 0 : error.data) === null || _a === void 0 ? void 0 : _a.code;
        var errorMessage = error === null || error === void 0 ? void 0 : error.message;
        switch (errorCode) {
            case 'UNAUTHORIZED':
                router.push('/login');
                break;
            case 'FORBIDDEN':
                if (errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.includes('LGPD')) {
                    router.push('/consent');
                }
                else if (errorMessage === null || errorMessage === void 0 ? void 0 : errorMessage.includes('medical license')) {
                    // Handle medical license validation errors
                    console.error('Medical license validation failed');
                }
                else {
                    // General permission error
                    console.error('Access forbidden:', errorMessage);
                }
                break;
            case 'NOT_FOUND':
                console.error('Healthcare resource not found:', errorMessage);
                break;
            default:
                console.error('Healthcare API error:', errorMessage);
        }
    }, [router]);
    return { handleError: handleError };
}
