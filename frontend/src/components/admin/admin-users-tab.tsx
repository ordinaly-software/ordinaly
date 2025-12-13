import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  company: string;
}

const AdminUsersTab = () => {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof User>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSelectUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredAndSortedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAndSortedUsers.map((u) => u.id));
    }
  };

  const handleSendMail = () => {
    const selectedEmails = filteredAndSortedUsers.filter(u => selectedUsers.includes(u.id)).map(u => u.email);
    if (selectedEmails.length === 0) return;
    const mailto = `mailto:?bcc=${encodeURIComponent(selectedEmails.join(","))}&subject=Ordinaly%20Diffusion&body=Dear%20users,%0D%0A%0D%0A`;
    window.location.href = mailto;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const token = localStorage.getItem("authToken");
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

  // Filter and sort users client-side
  const filteredAndSortedUsers = users
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
    })
    .sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22A60D]"></div>
      </div>
    );
  }

  if (errorMsg) {
    return <div className="text-center text-red-500 py-8">{errorMsg}</div>;
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="sticky top-0 z-30 bg-transparent dark:bg-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-2 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('searchPlaceholder') || 'Buscar usuarios...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full min-w-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={handleSendMail}
            disabled={selectedUsers.length === 0}
            size="sm"
            className="bg-[#22A60D] hover:bg-[#22A010] text-white flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span className="xs:inline"> {t('sendMail')}</span>
          </Button>
        </div>
      </div>

      {/* Select All - below header, full width, styled like courses/services */}
      <div className="flex items-center space-x-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-2">
        <input
          type="checkbox"
          checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('selectAll')} ({filteredAndSortedUsers.length} {t('users')})
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3"></th>
              {([
                { key: 'id', label: t('userId') },
                { key: 'name', label: t('name') },
                { key: 'surname', label: t('surname') },
                { key: 'email', label: t('email') },
                { key: 'company', label: t('company') },
              ] as { key: keyof User, label: string }[]).map(col => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:underline"
                  onClick={() => {
                    if (sortKey === col.key) setSortAsc(a => !a);
                    else { setSortKey(col.key); setSortAsc(true); }
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortAsc ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.surname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 underline">
                  <a href={`mailto:${user.email}?from=noreply@ordinaly.ai`} target="_blank" rel="noopener noreferrer">{user.email}</a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.company}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersTab;
