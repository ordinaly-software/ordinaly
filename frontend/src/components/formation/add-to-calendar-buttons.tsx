
import { Button } from "@/components/ui/button";
import { CalendarPlus } from 'lucide-react';
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const GoogleIcon = () => (
  <Image
    src="/icons/google-calendar.webp"
    alt="Google Calendar"
    className="w-5 h-5 mr-2"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    width={20}
    height={20}
    loading="lazy"
    unoptimized
  />
);
const OutlookIcon = () => (
  <Image
    src="/icons/outlook.webp"
    alt="Outlook Calendar"
    className="w-5 h-5 mr-2"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    width={20}
    height={20}
    loading="lazy"
    unoptimized
  />
);


interface AddToCalendarButtonsProps {
  // Accept either the numeric id (legacy) or the slug (preferred)
  courseId: number;
  courseSlug?: string;
  courseTitle: string;
  isEnrolled: boolean;
  disabled?: boolean;
}

export const AddToCalendarButtons = ({
  courseId,
  courseSlug,
  courseTitle,
  isEnrolled,
  disabled = false,
}: AddToCalendarButtonsProps) => {
  const t = useTranslations("formation.courseDetails");
  const [downloading, setDownloading] = useState(false);

  const handleAddToCalendar = async (format: "ics" | "google" | "outlook") => {
  // Prefer slug when available, fall back to id for backwards compatibility
  const identifier = (courseSlug && courseSlug.trim()) ? courseSlug : courseId;
  if (!identifier) return;
    setDownloading(true);
    try {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://ordinaly.duckdns.org";
  const url = `${apiUrl}/api/courses/courses/${identifier}/calendar-export-test/?calendar_format=${format}`;
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch calendar");
      if (format === "ics") {
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${courseTitle || "course"}.ics`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const data = await res.json();
        if (data.events && data.events.length > 0 && data.events[0].url) {
          window.open(data.events[0].url, "_blank");
        } else {
          throw new Error("No calendar event URL found");
        }
      }
    } catch {
      alert(t("calendarDownloadError") || "Could not download calendar.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isEnrolled) return null;

  return (
    <div className="space-y-2">
      {/* .ics Button */}
      <Button
        onClick={() => handleAddToCalendar("ics")}
        variant="outline"
        className="w-full border-blue-300 text-blue-700 bg-white hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-gray-900 dark:hover:bg-blue-900/30 h-12 text-base font-semibold transition-colors"
        disabled={downloading || disabled}
      >
        <CalendarPlus className="w-5 h-5 mr-2" />
        {downloading ? t("downloadingCalendar") || "Downloading..." : t("addToCalendarICS") || "Add to Calendar (.ics)"}
      </Button>
      {/* Google Calendar Button */}
      <Button
        onClick={() => handleAddToCalendar("google")}
        variant="outline"
        className="w-full border-blue-400 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:border-blue-600 dark:text-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 h-12 text-base font-bold shadow-md transition-colors"
        disabled={downloading || disabled}
      >
        <GoogleIcon />
        {downloading ? t("downloadingCalendar") || "Downloading..." : t("addToGoogleCalendar") || "Add to Google Calendar"}
      </Button>
      {/* Outlook Calendar Button */}
      <Button
        onClick={() => handleAddToCalendar("outlook")}
        variant="outline"
        className="w-full border-blue-300 text-blue-700 bg-white hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:bg-gray-900 dark:hover:bg-blue-900/30 h-12 text-base font-semibold transition-colors"
        disabled={downloading || disabled}
      >
        <OutlookIcon />
        {downloading ? t("downloadingCalendar") || "Downloading..." : t("addToOutlookCalendar") || "Add to Outlook Calendar"}
      </Button>
    </div>
  );
}
