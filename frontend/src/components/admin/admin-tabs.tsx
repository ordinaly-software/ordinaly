import React, { useRef, useEffect } from "react";

export interface AdminTabsTab {
  id: string;
  name: string;
  icon?: React.ElementType;
  external?: boolean;
  href?: string;
}

interface AdminTabsProps {
  tabs: AdminTabsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable sticky tab bar with scroll and tab memory for admin pages.
 * - Remembers last selected tab in localStorage (key: adminActiveTab)
 * - Scrolls to keep active tab in view
 * - Hides scrollbar but allows horizontal scroll
 */
export const AdminTabs: React.FC<AdminTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  style = {},
}) => {
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll the active tab into view on mount and when activeTab changes
  useEffect(() => {
    const idx = tabs.findIndex((tab) => tab.id === activeTab);
    if (tabButtonRefs.current[idx]) {
      tabButtonRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab, tabs]);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  // On mount, restore tab from localStorage if present
  useEffect(() => {
    const savedTab = localStorage.getItem("adminActiveTab");
    if (savedTab && tabs.some((tab) => tab.id === savedTab) && savedTab !== activeTab) {
      onTabChange(savedTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={tabBarRef}
      className={`border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto sticky top-[64px] z-30 bg-[#F9FAFB] dark:bg-[#1A1924] bg-opacity-95 backdrop-blur-sm min-h-[56px] flex items-center ${className}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", ...style }}
    >
      <nav
        className="-mb-px flex space-x-8 min-w-max overflow-x-auto overflow-y-hidden w-full"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          return tab.external ? (
            <a
              key={tab.id}
              href={tab.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.name}</span>
            </a>
          ) : (
            <button
              key={tab.id}
              ref={(el) => {
                tabButtonRefs.current[idx] = el;
              }}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#22A60D] text-[#22A60D]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.name}</span>
            </button>
          );
        })}
        <style>{`
          div[role='tablist'], nav::-webkit-scrollbar { display: none !important; }
          nav { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </nav>
    </div>
  );
};
