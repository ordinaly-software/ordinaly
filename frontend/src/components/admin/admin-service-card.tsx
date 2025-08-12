import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Eye, Edit, Trash2 } from "lucide-react";
import { renderIcon } from "@/components/ui/icon-select";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface AdminServiceCardProps {
  service: any;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onView: (service: any) => void;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
  tAdmin: (key: string, params?: any) => string;
  t: (key: string, params?: any) => string;
  getServiceColor: (service: any, isDarkMode?: boolean) => string;
}

export const AdminServiceCard: React.FC<AdminServiceCardProps> = ({
  service,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  tAdmin,
  t,
  getServiceColor,
}) => {
  const isDarkMode = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const serviceColor = getServiceColor(service, isDarkMode);

  return (
    <Card
      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
      style={{
        '--hover-border-color': serviceColor,
        '--hover-shadow-color': `${serviceColor}10`,
      } as React.CSSProperties}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = serviceColor;
        e.currentTarget.style.boxShadow = `0 10px 25px -12px ${serviceColor}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <CardContent className="p-4">
        {/* Mobile layout */}
        <div className="block sm:hidden">
          <div className="flex flex-row items-start gap-2 mb-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(service.id)}
              className="mt-1 rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D] flex-shrink-0"
            />
            {service.icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${serviceColor}10` }}
              >
                <div style={{ color: serviceColor }}>
                  {renderIcon(service.icon, "w-4 h-4")}
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate max-w-[10rem]">
                  {service.title}
                </h3>
                {service.is_featured && (
                  <Star className="h-4 w-4 fill-current flex-shrink-0" style={{ color: serviceColor }} />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate max-w-[12rem]">
                {service.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="truncate max-w-[8rem]">{tAdmin("labels.price")}: {service.price ? `€${Math.round(Number(service.price))}` : t("form.contactForQuote") || 'Contact for quote'}</span>
                {service.duration && <span className="truncate max-w-[7rem]">{tAdmin("labels.duration")}: {service.duration === 1 ? t("durationDay") : t("durationDays", { count: service.duration })}</span>}
              </div>
            </div>
          </div>
          {/* Action buttons row for mobile */}
          <div className="flex flex-row gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(service)}
              className="text-[#22A60D] hover:text-[#22A010] hover:bg-[#22A60D]/10 w-full"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(service)}
              style={{ color: '#46B1C9' }}
              className="hover:bg-opacity-10 w-full"
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#46B1C9' + '10';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '';
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(service)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Desktop layout */}
        <div className="hidden sm:flex items-start space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(service.id)}
            className="mt-1 rounded border-gray-300 text-[#22A60D] focus:ring-[#22A60D]"
          />
          {service.icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${serviceColor}10` }}
            >
              <div style={{ color: serviceColor }}>
                {renderIcon(service.icon, "w-4 h-4")}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div
                className="flex-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors duration-200"
                onClick={() => onView(service)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView(service);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  {service.is_featured && (
                    <Star className="h-4 w-4 fill-current" style={{ color: serviceColor }} />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {service.subtitle}
                </p>
                {/* Hide description on small screens, show on md+ */}
                <div className="hidden md:block">
                  <MarkdownRenderer>
                    {service.description.length > 200
                      ? `${service.description.substring(0, 200)}...`
                      : service.description}
                  </MarkdownRenderer>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{tAdmin("labels.price")}: {service.price ? `€${Math.round(Number(service.price))}` : t("form.contactForQuote") || 'Contact for quote'}</span>
                  {service.duration && <span>{tAdmin("labels.duration")}: {service.duration === 1 ? t("durationDay") : t("durationDays", { count: service.duration })}</span>}
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:space-x-2 ml-0 md:ml-4 mt-2 md:mt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(service)}
                  className="text-[#22A60D] hover:text-[#22A010] hover:bg-[#22A60D]/10 w-full md:w-auto"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(service)}
                  style={{ color: '#46B1C9' }}
                  className="hover:bg-opacity-10 w-full md:w-auto"
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#46B1C9' + '10';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(service)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 w-full md:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
