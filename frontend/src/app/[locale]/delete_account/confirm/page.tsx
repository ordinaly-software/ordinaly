"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConfirmDeletePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";

    fetch(`${apiUrl}/auth/delete/confirm/?token=${token}`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-xl p-10 max-w-md w-full text-center">

        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 animate-pulse">
              ⏳
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Confirmando eliminación...
            </h1>
            <p className="text-gray-600">
              Estamos procesando tu solicitud. Un momento.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✔️
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Cuenta eliminada
            </h1>
            <p className="text-gray-600">
              Tu cuenta ha sido eliminada correctamente.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ❌
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              No se pudo completar la acción
            </h1>
            <p className="text-gray-600 mb-6">
              No hemos podido confirmar la eliminación de tu cuenta.  
              Es posible que el enlace haya expirado o ya haya sido utilizado.
            </p>

            <a
              href="/"
              className="inline-block border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-medium py-2 px-6 rounded-lg transition"
            >
              Volver al inicio
            </a>
          </>
        )}
      </div>
    </div>
  );
}
