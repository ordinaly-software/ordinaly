"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("auth_token", token);
      router.push(`/profile`);
    } else {
      router.push(`/`);
    }
  }, [params, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Procesando autenticación...</p>
    </div>
  );
}
