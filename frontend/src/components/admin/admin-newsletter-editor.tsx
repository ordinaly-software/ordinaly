import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Copy, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import {
  NEWSLETTER_STATUS_CLASSES,
  Newsletter,
  apiRequest,
  formatDateTime,
  toLocalInput,
} from "@/components/admin/admin-newsletter-shared";

const STARTER_HTML = `<h1 style="margin:0 0 12px;font-size:24px;">Hola {{name}}</h1>
<p>Escribe aquí el contenido de la newsletter.</p>
<p><a href="https://ordinaly.ai/formacion" style="display:inline-block;padding:12px 18px;background:#D97757;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:700;">Ver formación</a></p>`;

const EDITABLE = new Set(["draft", "scheduled"]);

interface Props {
  newsletter: Newsletter | null; // null = new
  onBack: () => void;
  onChanged: () => void;
  notify: (type: "success" | "error", message: string) => void;
}

export default function AdminNewsletterEditor({ newsletter, onBack, onChanged, notify }: Props) {
  const t = useTranslations("admin.newsletter");
  const locale = useLocale();

  const [current, setCurrent] = useState<Newsletter | null>(newsletter);
  const [subject, setSubject] = useState(newsletter?.subject ?? "");
  const [html, setHtml] = useState(newsletter ? newsletter.html_body : STARTER_HTML);
  const [when, setWhen] = useState(toLocalInput(newsletter?.scheduled_for ?? null));
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<"delete" | "cancel" | null>(null);
  const [preview, setPreview] = useState("");
  const [showSeries, setShowSeries] = useState(false);
  const [series, setSeries] = useState({ count: 4, everyDays: 7 });

  const status = current?.status ?? "draft";
  const editable = EDITABLE.has(status);

  const errorText = useCallback(
    (data: unknown) => {
      const code = (data as { detail?: string })?.detail;
      const key = code && ["locked", "empty_newsletter", "not_scheduled", "not_sending", "invalid_series"].includes(code) ? code : null;
      if ((data as { scheduled_for?: string })?.scheduled_for) return t("errors.scheduled_for");
      return key ? t(`errors.${key}`) : t("errors.generic");
    },
    [t],
  );

  // Live preview: the backend renders it exactly as subscribers will receive it.
  useEffect(() => {
    const timer = setTimeout(async () => {
      const res = await apiRequest("/api/newsletters/preview/", {
        method: "POST",
        body: JSON.stringify({ subject, html_body: html }),
      });
      if (res.ok) setPreview((res.data as { html: string }).html);
    }, 500);
    return () => clearTimeout(timer);
  }, [subject, html]);

  const run = async (action: () => Promise<{ ok: boolean; data: unknown }>, okText: string, afterOk?: (data: unknown) => void) => {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (!res.ok) {
      notify("error", errorText(res.data));
      return false;
    }
    notify("success", okText);
    afterOk?.(res.data);
    return true;
  };

  const payload = () => ({
    subject,
    html_body: html,
    scheduled_for: when ? new Date(when).toISOString() : null,
  });

  const save = async (): Promise<Newsletter | null> => {
    const res = current
      ? await apiRequest(`/api/newsletters/${current.id}/`, { method: "PATCH", body: JSON.stringify(payload()) })
      : await apiRequest("/api/newsletters/", { method: "POST", body: JSON.stringify(payload()) });
    if (!res.ok) {
      notify("error", errorText(res.data));
      return null;
    }
    setCurrent(res.data as Newsletter);
    return res.data as Newsletter;
  };

  const handleSave = () =>
    run(async () => {
      const saved = await save();
      return { ok: saved !== null, data: saved };
    }, t("editor.saved"));

  const handleSchedule = async () => {
    if (!when) {
      notify("error", t("errors.scheduled_for"));
      return;
    }
    setBusy(true);
    const saved = await save();
    if (!saved) {
      setBusy(false);
      return;
    }
    const res = await apiRequest(`/api/newsletters/${saved.id}/schedule/`, {
      method: "POST",
      body: JSON.stringify({ scheduled_for: new Date(when).toISOString() }),
    });
    setBusy(false);
    if (!res.ok) {
      notify("error", errorText(res.data));
      return;
    }
    notify("success", t("editor.scheduledOk"));
    onChanged();
  };

  const handleTest = async () => {
    const saved = await save();
    if (!saved) return;
    await run(
      () => apiRequest(`/api/newsletters/${saved.id}/test/`, { method: "POST", body: "{}" }),
      t("editor.testSent"),
    );
  };

  const handlePost = (path: string, okText: string, goBack = true) =>
    run(
      () => apiRequest(`/api/newsletters/${current!.id}/${path}/`, { method: "POST", body: "{}" }),
      okText,
      (data) => {
        if (goBack) onChanged();
        else setCurrent(data as Newsletter);
      },
    );

  const handleDelete = async () => {
    setConfirming(null);
    if (!current) return;
    await run(
      () => apiRequest(`/api/newsletters/${current.id}/`, { method: "DELETE" }),
      t("editor.deleted"),
      () => onChanged(),
    );
  };

  const handleCancelSending = async () => {
    setConfirming(null);
    await handlePost("cancel", t("editor.cancelled"));
  };

  const handleSeries = () =>
    run(
      async () => {
        // Copy what is on screen, not the last saved version.
        const source = editable ? await save() : current;
        if (!source) return { ok: false, data: null };
        return apiRequest(`/api/newsletters/${source.id}/duplicate/`, {
          method: "POST",
          body: JSON.stringify({
            count: series.count,
            every_days: series.everyDays,
            start: when ? new Date(when).toISOString() : undefined,
          }),
        });
      },
      t("series.created", { count: series.count }),
      () => onChanged(),
    );

  const stats = current?.stats;
  const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("editor.back")}
        </button>
        {current && (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${NEWSLETTER_STATUS_CLASSES[status]}`}>
            {t(`status.${status}`)}
          </span>
        )}
        {current?.status === "scheduled" && current.scheduled_for && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{formatDateTime(current.scheduled_for, locale)}</span>
        )}
      </div>

      {!editable && <p className="mb-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">{t("editor.readOnly")}</p>}

      {stats && ["sending", "sent", "cancelled"].includes(status) && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            [t("stats.recipients"), stats.recipients],
            [t("stats.sent"), stats.sent],
            [t("stats.opened"), `${stats.opened} (${pct(stats.opened, stats.sent)})`],
            [t("stats.clicked"), `${stats.clicked} (${pct(stats.clicked, stats.sent)})`],
            [t("stats.undelivered"), status === "sending" ? "…" : stats.undelivered],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
            </div>
          ))}
          <p className="col-span-full text-xs text-gray-500 dark:text-gray-400">{t("stats.opensNote")}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("editor.subject")}</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              disabled={!editable}
              placeholder={t("editor.subjectPlaceholder")}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("editor.body")}</span>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              disabled={!editable}
              spellCheck={false}
              rows={18}
              className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-xs text-gray-900 disabled:opacity-70 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{t("editor.bodyHint")}</span>
          </label>

          {editable && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("editor.scheduledFor")}</span>
              <DateTimePicker value={when} onChange={setWhen} className="sm:max-w-sm" />
            </label>
          )}
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("editor.preview")}</span>
          <iframe
            title={t("editor.preview")}
            sandbox=""
            srcDoc={preview}
            className="h-[640px] w-full rounded-md border border-gray-200 bg-white dark:border-gray-700"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {editable && (
          <Button onClick={handleSave} disabled={busy} variant="outline" size="sm">
            {t("editor.save")}
          </Button>
        )}
        {editable && (
          <Button onClick={handleTest} disabled={busy} variant="outline" size="sm" className="gap-1">
            <Send className="h-4 w-4" />
            {t("editor.test")}
          </Button>
        )}
        {editable && (
          <Button
            onClick={handleSchedule}
            disabled={busy}
            size="sm"
            className="bg-clay-fill text-white hover:bg-[var(--swatch--flame)]"
          >
            {status === "scheduled" ? t("editor.reschedule") : t("editor.schedule")}
          </Button>
        )}
        {status === "scheduled" && (
          <Button onClick={() => handlePost("unschedule", t("editor.unscheduled"))} disabled={busy} variant="outline" size="sm">
            {t("editor.unschedule")}
          </Button>
        )}
        {status === "sending" && (
          <Button onClick={() => setConfirming("cancel")} disabled={busy} variant="outline" size="sm">
            {t("editor.cancelSending")}
          </Button>
        )}
        {current && (
          <Button onClick={() => setShowSeries((v) => !v)} disabled={busy} variant="outline" size="sm" className="gap-1">
            <Copy className="h-4 w-4" />
            {t("editor.duplicate")}
          </Button>
        )}
        {current && ["draft", "cancelled"].includes(status) && (
          <Button onClick={() => setConfirming("delete")} disabled={busy} variant="outline" size="sm" className="gap-1 text-red-600">
            <Trash2 className="h-4 w-4" />
            {t("editor.delete")}
          </Button>
        )}
      </div>

      {showSeries && current && (
        <div className="mt-4 max-w-xl rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("series.title")}</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("series.description")}</p>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">{t("series.count")}</span>
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={series.count}
                  onChange={(e) => setSeries((s) => ({ ...s, count: Number(e.target.value) }))}
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">{t("series.everyDays")}</span>
              <div className="w-24">
                <Input
                  type="number"
                  min={1}
                  value={series.everyDays}
                  onChange={(e) => setSeries((s) => ({ ...s, everyDays: Number(e.target.value) }))}
                />
              </div>
            </label>
            <Button onClick={handleSeries} disabled={busy} size="sm" className="bg-clay-fill text-white hover:bg-[var(--swatch--flame)]">
              {t("series.create")}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("series.startNote")}</p>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={confirming === "delete" ? handleDelete : handleCancelSending}
        title={confirming === "delete" ? t("editor.delete") : t("editor.cancelSending")}
        message={confirming === "delete" ? t("editor.deleteConfirm") : t("editor.cancelConfirm")}
        confirmText={confirming === "delete" ? t("editor.delete") : t("editor.cancelSending")}
        cancelText={t("editor.keep")}
        isLoading={busy}
      />
    </div>
  );
}
