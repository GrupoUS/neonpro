"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new auth login page
    router.replace("/auth/login");
  }, [router]);

  return null;
}
