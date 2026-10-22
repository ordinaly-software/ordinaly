import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  company: string;
  newsletter_status: NewsletterStatus;
  course_email_notifications: boolean;
}

type NewsletterStatus = "active" | "pending" | "unsubscribed" | "none";

const NEWSLETTER_BADGE_CLASSES: Record<NewsletterStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  unsubscribed: "bg-ivory-dark text-slate-light dark:bg-white/[0.04] dark:text-cloud-medium",
  none: "bg-ivory-dark text-slate-light dark:bg-white/[0.04] dark:text-cloud-medium",
};

const AdminUsersTab = () => {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [newsletterFilter, setNewsletterFilter] = useState<"all" | NewsletterStatus>("all");
  const [courseFilter, setCourseFilter] = useState<"all" | "on" | "off">("all");

  const handleSelectUser = (id: number | string) => {
    setSelectedUsers((prev) =>
      prev.includes(Number(id)) ? prev.filter((uid) => uid !== Number(id)) : [...prev, Number(id)]
    );
  };

  const handleSelectAll = (visibleIds: Array<number | string>) => {
    const ids = visibleIds.map(Number);
    const allVisibleSelected = ids.length > 0 && ids.every((id) => selectedUsers.includes(id));
    if (allVisibleSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !ids.includes(id)));
      return;
    }
    setSelectedUsers((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => newsletterFilter === "all" || u.newsletter_status === newsletterFilter)
      .filter(u => courseFilter === "all" || u.course_email_notifications === (courseFilter === "on"))
      .filter(u => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.surname.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.company.toLowerCase().includes(q) ||
          String(u.id).includes(q)
        );
      });
  }, [users, search, newsletterFilter, courseFilter]);

  const handleSendMail = () => {
    const selectedEmails = users.filter(u => selectedUsers.includes(u.id)).map(u => u.email);
    if (selectedEmails.length === 0) return;
    const mailto = `mailto:?bcc=${encodeURIComponent(selectedEmails.join(","))}&subject=${encodeURIComponent(t('mailSubject'))}&body=${encodeURIComponent(`${t('mailGreeting')}\r\n\r\n`)}`;
    window.location.href = mailto;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const token = localStorage.getItem("auth_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
        const response = await fetch(`${apiUrl}/api/users/`, {
          headers: { "Authorization": `Token ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
        } else {
          setErrorMsg(t("errorFetching"));
        }
      } catch {
        setErrorMsg(t("errorFetching"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [t]);

  const columns: DataTableColumn<User>[] = [
    { key: "id", label: t("userId"), sortable: true },
    { key: "name", label: t("name"), sortable: true },
    { key: "surname", label: t("surname"), sortable: true },
    {
      key: "email",
      label: t("email"),
      sortable: true,
      render: (user) => (
        <a href={`mailto:${user.email}?from=noreply@ordinaly.ai`} target="_blank" rel="noopener noreferrer" className="text-cobalt dark:text-cobalt-light underline">{user.email}</a>
      ),
    },
    { key: "company", label: t("company"), sortable: true },
    {
      key: "newsletter_status",
      label: t("newsletter"),
      sortable: true,
      render: (user) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${NEWSLETTER_BADGE_CLASSES[user.newsletter_status ?? 'none']}`}>
          {t(`newsletterStatus.${user.newsletter_status ?? 'none'}`)}
        </span>
      ),
    },
    {
      key: "course_email_notifications",
      label: t("courseNotifications"),
      sortable: true,
      render: (user) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${user.course_email_notifications ? NEWSLETTER_BADGE_CLASSES.active : NEWSLETTER_BADGE_CLASSES.none}`}>
          {user.course_email_notifications ? t('courseNotificationsOn') : t('courseNotificationsOff')}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--swatch--clay)] border-t-transparent"></div>
      </div>
    );
  }

  if (errorMsg) {
    return <div className="text-center text-red-500 py-8">{errorMsg}</div>;
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="mb-6 flex flex-col gap-3 px-2 py-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:items-center">
          <div className="relative min-w-0 sm:col-span-2 xl:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cloud-medium" />
            <Input
              placeholder={t('searchPlaceholder') || 'Buscar usuarios...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
          <div className="min-w-0 xl:w-60">
            <Dropdown
              options={[
                { value: "all", label: `${t('newsletter')}: ${t('filterAll')}` },
                { value: "active", label: t('newsletterStatus.active') },
                { value: "pending", label: t('newsletterStatus.pending') },
                { value: "unsubscribed", label: t('newsletterStatus.unsubscribed') },
                { value: "none", label: t('newsletterStatus.none') },
              ]}
              value={newsletterFilter}
              onChange={(value) => setNewsletterFilter(value as "all" | NewsletterStatus)}
              minWidth="0"
              width="100%"
              theme="orange"
            />
          </div>
          <div className="min-w-0 xl:w-72">
            <Dropdown
              options={[
                { value: "all", label: `${t('courseNotifications')}: ${t('filterAll')}` },
                { value: "on", label: t('courseNotificationsOn') },
                { value: "off", label: t('courseNotificationsOff') },
              ]}
              value={courseFilter}
              onChange={(value) => setCourseFilter(value as "all" | "on" | "off")}
              minWidth="0"
              width="100%"
              theme="orange"
            />
          </div>
        </div>
        <Button
          onClick={handleSendMail}
          disabled={selectedUsers.length === 0}
          size="sm"
          className="bg-clay-fill dark:bg-clay-fill hover:bg-[var(--swatch--flame)] text-white dark:text-white flex items-center gap-1 whitespace-nowrap px-3 min-w-[140px] justify-center w-full xl:w-auto disabled:bg-cloud-medium disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>{t('sendMail')}</span>
        </Button>
      </div>

      <p className="text-sm text-slate-light dark:text-cloud-medium mb-2">
        {filteredUsers.length} {t('users')}
      </p>

      <DataTable
        columns={columns}
        rows={filteredUsers}
        getRowId={(user) => user.id}
        initialSortKey="name"
        pageSize={25}
        selection={{
          selectedIds: selectedUsers,
          onToggleRow: handleSelectUser,
          onToggleAll: handleSelectAll,
        }}
      />
    </div>
  );
};

export default AdminUsersTab;
