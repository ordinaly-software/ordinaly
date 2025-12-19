"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiEndpoint } from "@/lib/api-config";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm({ className }: { className?: string }) {
  const t = useTranslations("contactPage");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const contactEndpoint = getApiEndpoint("/api/contact/");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 404) {
        const subject = encodeURIComponent("Contacto desde la web");
        const body = encodeURIComponent(
          `Nombre: ${payload.name}\nEmail: ${payload.email}\nEmpresa: ${payload.company}\n\nMensaje:\n${payload.message}`
        );
        window.location.href = `mailto:info@ordinaly.ai?subject=${subject}&body=${body}`;
        setStatus("success");
        formRef.current?.reset();
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setStatus("success");
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFormError(t("form.errorFallback"));
    }
  };

  return (
    <div className={className}>
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[#1F8A0D] dark:text-[#7CFC00] font-semibold">
            {t("form.eyebrow")}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t("form.title")}</h2>
          <p className="text-gray-700 dark:text-gray-300">{t("form.subtitle")}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("form.name")}
              </label>
              <Input name="name" required placeholder={t("form.namePlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("form.email")}
              </label>
              <Input name="email" type="email" required placeholder="you@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("form.company")}
            </label>
            <Input name="company" placeholder={t("form.companyPlaceholder")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("form.message")}
            </label>
            <Textarea
              name="message"
              required
              rows={4}
              placeholder={t("form.messagePlaceholder")}
              className="min-h-[120px]"
            />
          </div>

          {formError && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full md:w-auto bg-[#1F8A0D] dark:bg-[#7CFC00] hover:bg-[#1A740B] text-white dark:text-black px-6 py-6 rounded-xl text-lg shadow-lg shadow-[#1F8A0D]/30 flex items-center gap-2 justify-center"
            >
              {status === "loading" ? t("form.sending") : t("form.submit")}
            </Button>

            {status === "success" && (
              <p className="text-sm text-green-700 dark:text-green-400">{t("form.success")}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
