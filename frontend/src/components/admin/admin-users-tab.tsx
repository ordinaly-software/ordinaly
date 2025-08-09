import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const handleSelectUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSendMail = () => {
    const selectedEmails = users.filter(u => selectedUsers.includes(u.id)).map(u => u.email);
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ordinaly.duckdns.org";
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
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-[#22A60D]" />
        {t("title")}
      </h2>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUsers.length === users.length && users.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('selectAll')} ({users.length})
          </span>
        </div>
        <Button
          onClick={handleSendMail}
          disabled={selectedUsers.length === 0}
          className="bg-[#22A60D] hover:bg-[#22A010] text-white flex items-center space-x-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span>{t('sendMail')}</span>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3">
                {/* Empty for checkboxes */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("userId")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("name")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("surname")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("email")}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t("company")}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
        {users.map((user) => (
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
                  <a href={`mailto:${user.email}?from=ordinalysoftware@gmail.com`} target="_blank" rel="noopener noreferrer">{user.email}</a>
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
