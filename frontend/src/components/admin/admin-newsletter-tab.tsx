import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import Alert from "@/components/ui/alert";
import AdminNewsletterEditor from "@/components/admin/admin-newsletter-editor";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  NEWSLETTER_STATUS_CLASSES,
  Newsletter,
  Subscriber,
  apiRequest,
  formatDateTime,
} from "@/components/admin/admin-newsletter-shared";

type SubTab = "issues" | "subscribers";

const Badge = ({ status, label }: { status: string; label: string }) => (
  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${NEWSLETTER_STATUS_CLASSES[status]}`}>
    {label}
  </span>
);

const AdminNewsletterTab = () => {
  const t = useTranslations("admin.newsletter");
  const locale = useLocale();

  const [subTab, setSubTab] = useState<SubTab>("issues");
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ key: number; type: "success" | "error"; message: string } | null>(null);
  const [editing, setEditing] = useState<Newsletter | "new" | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [search, setSearch] = useState("");

  const notify = useCallback(
    (type: "success" | "error", message: string) => setAlert({ key: Date.now(), type, message }),
    [],
  );
  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const fetchAll = async () => {
      const [issues, subs] = await Promise.all([apiRequest("/api/newsletters/"), apiRequest("/api/newsletters/subscribers/")]);
      if (!issues.ok || !subs.ok) {
        notify("error", `${t("errors.load")} (HTTP ${[issues, subs].find((r) => !r.ok)?.status || "network"})`);
      } else {
        setNewsletters(issues.data as Newsletter[]);
        setSubscribers(subs.data as Subscriber[]);
      }
      setLoading(false);
    };
    fetchAll();
  }, [t, notify, reloadKey]);

  const visibleIssues = useMemo(() => {
    // Upcoming sends first (soonest on top), then everything else by most recent activity.
    const rank = (n: Newsletter) => (n.status === "sending" ? 0 : n.status === "scheduled" ? 1 : n.status === "draft" ? 2 : 3);
    const when = (n: Newsletter) => new Date(n.scheduled_for ?? n.created_at).getTime();
    return newsletters
      .filter((n) => statusFilter === "all" || n.status === statusFilter)
      .sort((a, b) => rank(a) - rank(b) || (rank(a) < 3 ? when(a) - when(b) : when(b) - when(a)));
  }, [newsletters, statusFilter]);

  const visibleSubscribers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter(
      (s) => (subFilter === "all" || s.status === subFilter) && (!q || s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)),
    );
  }, [subscribers, subFilter, search]);

  const subscriberCounts = useMemo(
    () => ({
      active: subscribers.filter((s) => s.status === "active").length,
      pending: subscribers.filter((s) => s.status === "pending").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    }),
    [subscribers],
  );

  const scheduleDraft = async (n: Newsletter) => {
    const res = await apiRequest(`/api/newsletters/${n.id}/schedule/`, { method: "POST", body: "{}" });
    if (res.ok) {
      notify("success", t("editor.scheduledOk"));
      load();
    } else {
      const code = (res.data as { detail?: string } | null)?.detail;
      notify("error", code === "empty_newsletter" ? t("errors.empty_newsletter") : t("errors.generic"));
    }
  };

  const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "—");

  const issueColumns: DataTableColumn<Newsletter>[] = [
    {
      key: "subject",
      label: t("columns.subject"),
      sortable: true,
      sortValue: (n) => n.subject || "",
      cellClassName: "max-w-xs truncate",
      render: (n) => (
        <button type="button" onClick={() => setEditing(n)} className="text-left font-medium hover:underline">
          {n.subject || t("noSubject")}
        </button>
      ),
    },
    {
      key: "status",
      label: t("columns.status"),
      sortable: true,
      render: (n) => <Badge status={n.status} label={t(`status.${n.status}`)} />,
    },
    {
      key: "date",
      label: t("columns.date"),
      sortable: true,
      sortValue: (n) => new Date(n.sent_at ?? n.scheduled_for ?? n.created_at).getTime(),
      cellClassName: "whitespace-nowrap",
      render: (n) => {
        const date = n.sent_at ?? n.scheduled_for;
        return date ? formatDateTime(date, locale) : t("noDate");
      },
    },
    {
      key: "results",
      label: t("columns.results"),
      sortable: true,
      sortValue: (n) => n.stats.sent,
      cellClassName: "whitespace-nowrap",
      render: (n) =>
        ["sending", "sent", "cancelled"].includes(n.status)
          ? t("results", {
              sent: n.stats.sent,
              opened: n.stats.opened,
              openRate: pct(n.stats.opened, n.stats.sent),
              clicked: n.stats.clicked,
              clickRate: pct(n.stats.clicked, n.stats.sent),
            })
          : "—",
    },
    {
      key: "actions",
      label: "",
      cellClassName: "whitespace-nowrap text-right",
      render: (n) => (
        <>
          {n.status === "draft" && n.scheduled_for && n.subject && n.html_body && (
            <Button onClick={() => scheduleDraft(n)} variant="outline" size="sm" className="mr-2">
              {t("editor.schedule")}
            </Button>
          )}
          <Button onClick={() => setEditing(n)} variant="outline" size="sm">
            {t(["draft", "scheduled"].includes(n.status) ? "actions.edit" : "actions.open")}
          </Button>
        </>
      ),
    },
  ];

  const subscriberColumns: DataTableColumn<Subscriber>[] = [
    { key: "email", label: t("subscribers.columns.email"), sortable: true },
    { key: "name", label: t("subscribers.columns.name"), sortable: true },
    {
      key: "status",
      label: t("subscribers.columns.status"),
      sortable: true,
      render: (s) => <Badge status={s.status} label={t(`subscribers.status.${s.status}`)} />,
    },
    {
      key: "source",
      label: t("subscribers.columns.source"),
      sortable: true,
      render: (s) => t(`subscribers.source.${s.source}`),
    },
    {
      key: "since",
      label: t("subscribers.columns.since"),
      sortable: true,
      sortValue: (s) => new Date(s.created_at).getTime(),
      cellClassName: "whitespace-nowrap",
      render: (s) => formatDateTime(s.created_at, locale),
    },
  ];

  if (editing) {
    return (
      <>
      <AdminNewsletterEditor
        key={editing === "new" ? "new" : editing.id}
        newsletter={editing === "new" ? null : editing}
        onBack={() => {
          setEditing(null);
          load();
        }}
        onChanged={() => {
          setEditing(null);
          load();
        }}
        notify={notify}
      />
      {alert && (
        <Alert
          key={alert.key}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === "success" ? 4000 : 6000}
        />
      )}
      </>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-[--color-border-subtle] p-1 dark:border-white/10" role="tablist">
          {(["issues", "subscribers"] as SubTab[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={subTab === id}
              onClick={() => setSubTab(id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                subTab === id ? "bg-clay-fill text-white" : "text-slate-light hover:text-slate-dark dark:text-cloud-medium dark:hover:text-white"
              }`}
            >
              {t(`subTabs.${id}`)}
              {id === "subscribers" && ` (${subscriberCounts.active})`}
            </button>
          ))}
        </div>
        {subTab === "issues" && (
          <Button onClick={() => setEditing("new")} size="sm" className="gap-1 bg-clay-fill text-white hover:bg-[var(--swatch--flame)]">
            <Plus className="h-4 w-4" />
            {t("new")}
          </Button>
        )}
      </div>

      {alert && (
        <Alert
          key={alert.key}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
          duration={alert.type === "success" ? 4000 : 6000}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--swatch--clay)] border-t-transparent" />
        </div>
      ) : subTab === "issues" ? (
        <>
          <div className="mb-4">
            <Dropdown
              options={[
                { value: "all", label: t("filterAll") },
                ...["draft", "scheduled", "sending", "sent", "cancelled"].map((v) => ({ value: v, label: t(`status.${v}`) })),
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              minWidth="220px"
              width="220px"
              theme="orange"
            />
          </div>
          <DataTable
            columns={issueColumns}
            rows={visibleIssues}
            getRowId={(n) => n.id}
            emptyMessage={t("empty")}
          />
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full min-w-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cloud-medium" />
              <Input placeholder={t("subscribers.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10" />
            </div>
            <Dropdown
              options={[
                { value: "all", label: t("filterAll") },
                ...(["active", "pending", "unsubscribed"] as const).map((v) => ({
                  value: v,
                  label: `${t(`subscribers.status.${v}`)} (${subscriberCounts[v]})`,
                })),
              ]}
              value={subFilter}
              onChange={setSubFilter}
              minWidth="240px"
              width="240px"
              theme="orange"
            />
          </div>
          <DataTable
            columns={subscriberColumns}
            rows={visibleSubscribers}
            getRowId={(s) => s.id}
            emptyMessage={t("subscribers.empty")}
          />
        </>
      )}
    </div>
  );
};

export default AdminNewsletterTab;
