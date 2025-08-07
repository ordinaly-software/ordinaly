"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { renderIcon } from "@/components/ui/icon-select";
import { Service } from "@/hooks/useServices";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: () => void;
}

export const ServiceDetailsModal = ({ service, isOpen, onClose, onContact }: ServiceDetailsModalProps) => {
  const t = useTranslations("home");

  if (!service) return null;

  // Function to get the appropriate color for dark/light mode
  const getServiceColor = (service: Service) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (service.color === '1A1924' && isDarkMode) {
      return '#efefefbb';
    } else if (service.color === '623CEA' && isDarkMode) {
      return '#8B5FF7';
    }
    return service.color_hex;
  };

  const serviceColor = getServiceColor(service);

  if (!service) return null;

  const getDurationText = (duration: number) => {
    if (duration === 1) {
      return t("services.durationDay");
    }
    return t("services.durationDays", { count: duration });
  };

  const getEmailSubject = (service: Service) => {
    // Generate email subject based on service title
    const baseSubject = "Consulta sobre servicio";
    return `${baseSubject}: ${service.title}`;
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent(getEmailSubject(service));
    const body = encodeURIComponent(
      `Hola,\n\nEstoy interesado en el servicio "${service.title}".\n\n${service.clean_description}\n\n¿Podrían proporcionarme más información?\n\nGracias.`
    );
    const emailUrl = `mailto:ordinalysoftware@gmail.com?subject=${subject}&body=${body}`;
    window.open(emailUrl, '_self');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service.title}
      showHeader={true}
      className="max-w-4xl w-full mx-4 my-8"
    >
      <div className="flex flex-col max-h-[calc(100vh-8rem)]">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E0 transparent'
          }}
        >
          {/* Service Icon and Title Section */}
          <div className="flex items-center space-x-4">
            {service.icon && (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${serviceColor}10` }}
              >
                <div style={{ color: serviceColor }}>
                  {renderIcon(service.icon, "h-8 w-8")}
                </div>
              </div>
            )}
            <div className="flex-1">
              {/* Subtitle */}
              {service.subtitle && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {service.subtitle}
                </p>
              )}
              {/* Featured Badge */}
              {service.is_featured && (
                <div 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white mt-2"
                  style={{ backgroundColor: serviceColor }}
                >
                  {t("services.featured")}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t("services.description")}
            </h3>
            <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={{
                  // Handle tables with proper styling
                  table: ({children}) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({children}) => (
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      {children}
                    </thead>
                  ),
                  tbody: ({children}) => (
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {children}
                    </tbody>
                  ),
                  tr: ({children}) => (
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({children}) => (
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
                      {children}
                    </th>
                  ),
                  td: ({children}) => (
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {children}
                    </td>
                  ),
                  h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white mt-6">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white mt-4">{children}</h3>,
                  h4: ({children}) => <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white mt-3">{children}</h4>,
                  p: ({children}) => <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>,
                  br: () => <br className="mb-2" />,
                  ul: ({children}) => <ul className="list-disc list-inside mb-4 text-gray-600 dark:text-gray-400 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-gray-600 dark:text-gray-400 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({children}) => (
                    <blockquote 
                      className="border-l-4 pl-4 py-2 mb-4 italic bg-gray-50 dark:bg-gray-800/50 rounded-r-lg"
                      style={{ borderLeftColor: serviceColor }}
                    >
                      <div className="text-gray-700 dark:text-gray-300">
                        {children}
                      </div>
                    </blockquote>
                  ),
                  code: ({children, className}) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="mb-4">
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  pre: ({children}) => (
                    <div className="mb-4">
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        {children}
                      </pre>
                    </div>
                  ),
                  strong: ({children}) => <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                  a: ({children, href}) => (
                    <a 
                      href={href} 
                      className="hover:underline transition-colors" 
                      style={{ color: serviceColor }}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="border-gray-200 dark:border-gray-700 my-6" />,
                }}
              >
                {service.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Service Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration */}
            {service.duration && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("services.duration")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getDurationText(service.duration)}
                  </p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("services.price")}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.price ? `€${service.price}` : t("services.contactForQuote")}
                </p>
              </div>
            </div>
          </div>

          {/* Requisites */}
          {service.requisites && (
            <div className="pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t("services.requisites")}
              </h3>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {service.requisites}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Contact Buttons */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onContact}
              className="text-white px-8 py-3 flex items-center justify-center gap-2 transition-all duration-300"
              size="lg"
              style={{
                backgroundColor: serviceColor,
                borderColor: serviceColor
              }}
              onMouseEnter={(e) => {
                const darker = serviceColor + 'dd';
                e.currentTarget.style.backgroundColor = darker;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = serviceColor;
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t("services.contactNow")}
            </Button>
            <Button 
              onClick={handleEmailContact}
              variant="outline"
              className="px-8 py-3 flex items-center justify-center gap-2 transition-all duration-300"
              size="lg"
              style={{
                borderColor: serviceColor,
                color: serviceColor
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = serviceColor;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = serviceColor;
              }}
            >
              <Mail className="h-5 w-5" />
              {t("services.contactEmail")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
