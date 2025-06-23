"use client";

import { useEffect } from "react";

/**
 * OAuth Popup Callback Handler
 * This page handles the OAuth callback in a popup window
 * and communicates with the parent window
 */
export default function PopupCallbackPage() {
  useEffect(() => {
    console.log("=== OAuth Popup Callback ===");
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const state = urlParams.get("state");
    
    console.log("Callback params:", { code: !!code, error, state });
    
    if (error) {
      console.error("OAuth error in popup:", error);
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: "OAUTH_ERROR",
          error: error,
          description: urlParams.get("error_description")
        }, window.location.origin);
      }
      window.close();
      return;
    }
    
    if (code) {
      console.log("OAuth code received in popup");
      // Send success to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: "OAUTH_SUCCESS",
          code: code,
          state: state
        }, window.location.origin);
      }
      window.close();
      return;
    }
    
    // No code or error - something went wrong
    console.error("Invalid OAuth callback - no code or error");
    if (window.opener) {
      window.opener.postMessage({
        type: "OAUTH_ERROR",
        error: "invalid_callback",
        description: "No authorization code received"
      }, window.location.origin);
    }
    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Processando autenticação...</p>
        <p className="text-sm text-muted-foreground mt-1">Esta janela será fechada automaticamente.</p>
      </div>
    </div>
  );
}
