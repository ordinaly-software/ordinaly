"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname.split("/")[1] || "es";
    const token = params.get("token");

    if (token) {
      localStorage.setItem("auth_token", token);
      router.push(`/${locale}/profile`);
    } else {
      router.push(`/${locale}/auth/signin`);
    }
  }, [params, router, pathname]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Procesando autenticación...</p>
    </div>
  );
}
