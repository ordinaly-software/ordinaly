export type NewsletterStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";

export interface Newsletter {
  id: number;
  subject: string;
  html_body: string;
  status: NewsletterStatus;
  scheduled_for: string | null;
  started_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  stats: { recipients: number; sent: number; opened: number; clicked: number; undelivered: number };
}

export type SubscriberStatus = "active" | "pending" | "unsubscribed";

export interface Subscriber {
  id: number;
  email: string;
  name: string;
  status: SubscriberStatus;
  source: "account" | "banner";
  user_id: number | null;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

export const NEWSLETTER_STATUS_CLASSES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  sending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  sent: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  unsubscribed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export async function apiRequest(path: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  const token = localStorage.getItem("auth_token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.ordinaly.ai";
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}`, ...init.headers },
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

/** ISO instant → value for <input type="datetime-local"> in the browser's time zone. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
