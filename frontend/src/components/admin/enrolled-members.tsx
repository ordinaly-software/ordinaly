import React from "react";
import { Send } from "lucide-react";
import { Users, User } from "lucide-react";
import { Button } from "../ui/button";

interface Enrollment {
  id: number;
  user: number;
  enrolled_at: string;
  user_details?: {
    name?: string;
    surname?: string;
    email?: string;
    company?: string;
  };
}

interface EnrolledMembersProps {
  enrollments: Enrollment[];
  isLoading: boolean;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
  dateLocale: string;
}

const EnrolledMembers: React.FC<EnrolledMembersProps> = ({ enrollments, isLoading, t, dateLocale }) => {
  const handleSendMail = () => {
    const emails = enrollments
      .map(e => e.user_details?.email)
      .filter(email => !!email);
    if (emails.length === 0) return;
    const subject = encodeURIComponent(t("details.mailSubject") || "Información sobre el curso");
    const body = encodeURIComponent(t("details.mailBody") || "Hola,\n\nTe enviamos información relevante sobre tu curso en Ordinaly.");
    const mailto = `mailto:?bcc=${encodeURIComponent(emails.join(","))}&subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };
  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-xl border border-[--color-border-subtle] dark:border-white/10 p-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-slate-dark dark:text-white">
            {t("details.enrolledMembers")}
          </h3>
        </div>
        <Button
          onClick={handleSendMail}
          disabled={enrollments.length === 0}
          size="sm"
          className="bg-clay-fill dark:bg-clay-fill hover:bg-[var(--swatch--flame)] text-white dark:text-white flex items-center gap-1 whitespace-nowrap px-2 sm:px-3 min-w-[140px] justify-center w-full sm:w-auto disabled:bg-cloud-medium disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
          <span className="xs:inline"> {t('details.sendMail')}</span>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--swatch--clay)] border-t-transparent"></div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-6 text-slate-light dark:text-cloud-medium">
          <Users className="h-12 w-12 mx-auto mb-3 text-cloud-medium" />
          <p>{t("details.noEnrollments")}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {enrollments.map((enrollment, ) => {
            const userName = enrollment.user_details?.name?.trim();
            const userSurname = enrollment.user_details?.surname?.trim();
            const userEmail = enrollment.user_details?.email;
            let displayName = '';
            if (userName && userSurname) {
              displayName = `${userName} ${userSurname}`;
            } else if (userName) {
              displayName = userName;
            } else if (userSurname) {
              displayName = userSurname;
            } else if (userEmail) {
              displayName = userEmail.split('@')[0];
            } else {
              displayName = `User #${enrollment.user}`;
            }
            return (
              <div
                key={enrollment.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-ivory-medium dark:bg-white/[0.04] rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-[color-mix(in_srgb,var(--swatch--clay)_10%,transparent)] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-[var(--swatch--clay)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-dark dark:text-white truncate">
                      {displayName}
                    </p>
                    {enrollment.user_details?.email && (
                      <p className="text-xs text-slate-light dark:text-cloud-medium truncate">
                        {enrollment.user_details.email}
                      </p>
                    )}
                    {enrollment.user_details?.company && (
                      <p className="text-xs text-cobalt dark:text-cobalt-light truncate">
                        {enrollment.user_details.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-light dark:text-cloud-medium whitespace-nowrap">
                    {t("details.enrolledOn")} {new Date(enrollment.enrolled_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnrolledMembers;
