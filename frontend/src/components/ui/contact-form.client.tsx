"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { ChevronDown } from "lucide-react";

type Status = "idle" | "loading";
type AlertState = {
  key: number;
  type: "success" | "error";
  message: string;
};

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

type ContactFormProps = {
  className?: string;
  recaptchaAction?: string;
  recaptchaBadgeId?: string;
};

export default function ContactForm({
  className,
  recaptchaAction = "contact_form",
  recaptchaBadgeId = "recaptcha-badge-contact",
}: ContactFormProps) {
  const t = useTranslations("contactPage");
  const formRef = useRef<HTMLFormElement | null>(null);
  const prefixDropdownRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [prefixOpen, setPrefixOpen] = useState(false);
  const [prefixSearch, setPrefixSearch] = useState("");
  const [selectedPrefix, setSelectedPrefix] = useState(phonePrefixes[0]);
  const contactEndpoint = "/api/leads";
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (prefixDropdownRef.current && !prefixDropdownRef.current.contains(event.target as Node)) {
        setPrefixOpen(false);
        setPrefixSearch("");
      }
    };
    if (prefixOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [prefixOpen]);

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
      details: String(formData.get("message") ?? ""),
      page: String(window.location.href ?? ""),
    };

    if (phoneDigits) {
      payload.phone = `${phonePrefix}${phoneDigits}`;
    }

    try {
      // Skip reCAPTCHA when the provider is not available (key not configured)
      if (executeRecaptcha) {
        payload.recaptchaToken = await executeRecaptcha(recaptchaAction);
      }

      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const serverMessage = data?.error;
        const message = serverMessage ?? t("form.errorFallback");
        setStatus("idle");
        setAlert({
          key: Date.now(),
          type: "error",
          message,
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-dark] border border-[--color-border-subtle] dark:border-[--color-border-strong] rounded-2xl shadow-xl p-6 md:p-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-clay dark:text-clay font-semibold">
              {t("form.eyebrow")}
            </p>
            <h2 className="text-3xl font-bold text-slate-dark dark:text-[var(--swatch--ivory-light)]">{t("form.title")}</h2>
            <p className="text-slate-medium dark:text-cloud-medium">{t("form.subtitle")}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-medium dark:text-cloud-medium mb-1">
                  {t("form.name")}
                </label>
                <Input name="name" required placeholder={t("form.namePlaceholder")} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-medium dark:text-cloud-medium mb-1">
                  {t("form.email")}
                </label>
                <Input name="email" type="email" required placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-medium dark:text-cloud-medium mb-1">
                {t("form.company")}
              </label>
              <Input name="company" placeholder={t("form.companyPlaceholder")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-medium dark:text-cloud-medium mb-1">
                {t("form.phone")}
              </label>
              <div className="flex gap-3">
                <div className="min-w-[120px] relative" ref={prefixDropdownRef}>
                  <label className="sr-only" htmlFor="phonePrefix">
                    {t("form.phonePrefix")}
                  </label>
                  <input type="hidden" name="phonePrefix" value={selectedPrefix.value} />
                  <button
                    type="button"
                    onClick={() => { setPrefixOpen((o) => !o); setPrefixSearch(""); }}
                    className="flex items-center justify-between w-full h-10 px-3 text-sm rounded-md bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-medium] border border-[--color-border-subtle] dark:border-[--color-border-strong] shadow-sm text-slate-dark dark:text-ivory-light focus:outline-none focus:ring-1 focus:ring-clay"
                  >
                    <span>{selectedPrefix.label}</span>
                    <ChevronDown className={`h-4 w-4 ml-1 shrink-0 transition-transform ${prefixOpen ? "rotate-180" : ""}`} />
                  </button>
                  {prefixOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-52 rounded-xl border border-[--color-border-subtle] dark:border-[--color-border-strong] bg-white dark:bg-[--swatch--slate-medium] shadow-lg overflow-hidden">
                      <div className="p-2">
                        <input
                          autoFocus
                          type="text"
                          value={prefixSearch}
                          onChange={(e) => setPrefixSearch(e.target.value)}
                          placeholder="+34, ES..."
                          className="w-full h-8 px-2 text-sm rounded-md border border-[--color-border-subtle] dark:border-[--color-border-strong] bg-[--swatch--ivory-light] dark:bg-[--swatch--slate-dark] text-slate-dark dark:text-ivory-light outline-none focus:ring-1 focus:ring-clay"
                        />
                      </div>
                      <ul className="max-h-44 overflow-y-auto">
                        {phonePrefixes
                          .filter((p) =>
                            p.label.toLowerCase().includes(prefixSearch.toLowerCase()) ||
                            p.value.includes(prefixSearch)
                          )
                          .map((prefix) => (
                            <li
                              key={prefix.value}
                              onClick={() => { setSelectedPrefix(prefix); setPrefixOpen(false); setPrefixSearch(""); }}
                              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-clay/10 dark:hover:bg-clay/20 text-slate-dark dark:text-ivory-light${selectedPrefix.value === prefix.value ? " bg-clay/15 text-clay font-semibold" : ""}`}
                            >
                              {prefix.label}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
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
              <label className="block text-sm font-medium text-slate-medium dark:text-cloud-medium mb-1">
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
                className="w-full md:w-auto bg-clay dark:bg-clay hover:bg-flame dark:hover:bg-flame text-white px-6 py-6 rounded-xl text-lg shadow-lg shadow-clay/30 flex items-center gap-2 justify-center"
              >
                {status === "loading" ? t("form.sending") : t("form.submit")}
              </Button>
              <div id={recaptchaBadgeId} className="recaptcha-inline-badge self-end" aria-hidden="true" />
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
      </section>
    </div>
  );
}
