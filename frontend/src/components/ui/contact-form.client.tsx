"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Status = "idle" | "loading";
type AlertState = {
  key: number;
  type: "success" | "error";
  message: string;
};

export default function ContactForm({ className }: { className?: string }) {
  const t = useTranslations("contactPage");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [alert, setAlert] = useState<AlertState | null>(null);
  const contactEndpoint = "/api/leads";
  // Keep the list intentionally short; expand or load dynamically if broader international coverage is needed.
  const phonePrefixes = [
    { label: "ES +34", value: "+34" },
    { label: "PT +351", value: "+351" },
    { label: "FR +33", value: "+33" },
    { label: "DE +49", value: "+49" },
    { label: "IT +39", value: "+39" },
    { label: "UK +44", value: "+44" },
    { label: "US +1", value: "+1" },
    { label: "MX +52", value: "+52" },
    { label: "AR +54", value: "+54" },
    { label: "CO +57", value: "+57" },
    { label: "PE +51", value: "+51" },
    { label: "CL +56", value: "+56" },
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setAlert(null);
    const formData = new FormData(event.currentTarget);
    const rawPhone = String(formData.get("phone") ?? "");
    const phoneDigits = rawPhone.replace(/[^\d]/g, "");
    if (phoneDigits.length > 0 && (phoneDigits.length < 6 || phoneDigits.length > 15)) {
      setStatus("idle");
      setAlert({
        key: Date.now(),
        type: "error",
        message: t("form.phoneInvalid"),
      });
      return;
    }
    const phonePrefix = String(formData.get("phonePrefix") ?? "+34");
    const payload: Record<string, string> = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      // Map UI "message" field to the API "details" payload expected by the webhook.
      details: String(formData.get("message") ?? ""),
    };

    if (phoneDigits) {
      payload.phone = `${phonePrefix}${phoneDigits}`;
    }

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus("idle");
        setAlert({
          key: Date.now(),
          type: "error",
          message: data?.message ?? t("form.errorFallback"),
        });
        return;
      }

      setStatus("idle");
      setAlert({
        key: Date.now(),
        type: "success",
        message: t("form.success"),
      });
      formRef.current?.reset();
    } catch {
      setStatus("idle");
      setAlert({
        key: Date.now(),
        type: "error",
        message: t("form.errorFallback"),
      });
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
              {t("form.phone")}
            </label>
            <div className="flex gap-3">
              <div className="min-w-[120px]">
                <label className="sr-only" htmlFor="phonePrefix">
                  {t("form.phonePrefix")}
                </label>
                <div className="p-[2px] rounded-lg transition duration-300 group/input">
                  <select
                    id="phonePrefix"
                    name="phonePrefix"
                    defaultValue="+34"
                    className="h-10 w-full rounded-md bg-card text-card-foreground px-3 py-2 text-sm shadow-input dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-green"
                  >
                    {phonePrefixes.map((prefix) => (
                      <option key={prefix.value} value={prefix.value}>
                        {prefix.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1">
                <Input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder={t("form.phonePlaceholder")}
                />
              </div>
            </div>
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

          <div className="flex flex-col items-center gap-3">
            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full md:w-auto bg-[#0d6e0c] dark:bg-[#7CFC00] hover:bg-[#0A4D08] text-white dark:text-black px-6 py-6 rounded-xl text-lg shadow-lg shadow-[#1F8A0D]/30 flex items-center gap-2 justify-center"
            >
              {status === "loading" ? t("form.sending") : t("form.submit")}
            </Button>

          </div>
        </form>
        {alert && (
          <Alert
            key={alert.key}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            duration={alert.type === "success" ? 3000 : 5000}
          />
        )}
      </div>
    </div>
  );
}
