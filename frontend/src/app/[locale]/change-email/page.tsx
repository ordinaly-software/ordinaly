"use client";

import { useState, useEffect } from "react";

export default function ChangeEmailPage() {
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [oldEmail, setOldEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("pending_email");
    if (savedEmail) setOldEmail(savedEmail);
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    const res = await fetch("http://localhost:8000/auth/change-email-unverified/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_email: newEmail }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.new_email?.[0] || data.detail || "Error");
      return;
    }

    // Save new email
    localStorage.setItem("pending_email", newEmail);

    setSuccess("Email actualizado. Revisa tu bandeja para el nuevo código.");
    setNewEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900">
          Cambiar email
        </h1>

        <p className="text-gray-600">
          Email actual:
        </p>

        <p className="text-gray-900 font-medium bg-gray-100 px-4 py-2 rounded-lg">
          {oldEmail}
        </p>

        <div className="space-y-2">
          <label className="text-gray-700 font-medium">Nuevo email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-black focus:outline-none"
            placeholder="nuevo@email.com"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
        {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg text-lg font-medium hover:bg-gray-900 transition disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar email"}
        </button>

        <button
          onClick={() => (window.location.href = "/verify-email")}
          className="w-full text-gray-700 font-medium hover:underline"
        >
          Volver a verificar
        </button>
      </div>
    </div>
  );
}
