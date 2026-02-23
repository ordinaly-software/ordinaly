"use client";

import { useState, useEffect } from "react";

export default function VerifyEmailPage() {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  // email through local storage
  useEffect(() => {
    const savedEmail = localStorage.getItem("pending_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // Countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("auth_token");

    const res = await fetch("http://localhost:8000/auth/verify-email/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify({email, code }),
    });

    const data = await res.json();
    console.log("RESPUESTA DEL BACKEND:", data);
    setLoading(false);

    if (!res.ok) {
      setError(data.code?.[0] || data.email?.[0] || data.detail || "Error");
      return;
    }

    window.location.href = "/";
  };


  const handleResend = async () => {
    setError("");

    const res = await fetch("http://localhost:8000/auth/resend-verification/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.email?.[0] || data.detail || "Error");
      return;
    }

    setSeconds(120);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">
          Verifica tu correo
        </h1>

        <p className="text-gray-600">
          Hemos enviado un código de verificación a:
        </p>

        <p className="text-gray-900 font-medium bg-gray-100 px-4 py-2 rounded-lg">
          {email}
        </p>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium">Código de verificación</label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg tracking-widest text-center focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="••••••"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg text-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Verificar"}
        </button>

        <div className="text-center text-gray-600">
          {seconds > 0 ? (
            <p>Reenviar código en {seconds}s</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-black font-medium hover:underline"
            >
              Reenviar código
            </button>
          )}
        </div>

        <button
          onClick={() => (window.location.href = "/change-email")}
          className="w-full text-gray-700 font-medium hover:underline"
        >
          Cambiar email
        </button>
      </div>
    </div>
  );
}
