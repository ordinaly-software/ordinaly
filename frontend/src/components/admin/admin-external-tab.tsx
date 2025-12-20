import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";

interface AdminExternalTabProps {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  warning?: string;
  accentColor?: string;
  backgroundImage?: string;
}

const AdminExternalTab: React.FC<AdminExternalTabProps> = ({
  title,
  description,
  buttonLabel,
  href,
  warning,
  accentColor = "#1F8A0D",
  backgroundImage = "/static/backgrounds/blog_background.webp",
}) => {
  const handleOpen = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative overflow-hidden rounded-lg min-h-[360px] border border-gray-200/60 dark:border-white/10">
      <div
        className="absolute inset-0 bg-center bg-cover opacity-60"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/80 dark:bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 min-h-[360px]">
        <h2
          className="text-2xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
          style={{ color: accentColor }}
        >
          {title}
        </h2>
        <p className="text-gray-800 dark:text-gray-100 max-w-2xl drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
          {description}
        </p>
        <Button
          variant="default"
          onClick={handleOpen}
          className="flex items-center gap-2 text-white shadow-lg hover:shadow-xl dark:shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
          style={{ backgroundColor: accentColor, borderColor: accentColor }}
        >
          {buttonLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Button>
        {warning && (
          <div className="text-sm text-yellow-900 dark:text-yellow-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]">
            {warning}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExternalTab;
