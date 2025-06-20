"use client";

import { registerServiceWorker } from "@/lib/pwa-register";
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
