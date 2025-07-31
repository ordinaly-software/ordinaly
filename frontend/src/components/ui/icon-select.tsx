"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Available Lucide React icons for services
export const AVAILABLE_ICONS = [
  'Bot', 'Workflow', 'Zap', 'Users', 'TrendingUp', 'Accessibility',
  'MessageSquare', 'Brain', 'Smartphone', 'Globe', 'Shield', 'Settings',
  'Code', 'Database', 'Cloud', 'Lightbulb', 'Target', 'Rocket',
  'Monitor', 'Headphones', 'BarChart', 'PieChart', 'Activity', 'Briefcase',
  'Camera', 'Video', 'Mic', 'Speaker', 'Wifi', 'Lock', 'Unlock', 'Key',
  'Mail', 'Phone', 'Search', 'Filter', 'Download', 'Upload', 'Share',
  'Heart', 'Star', 'Award', 'Gift', 'ShoppingCart', 'CreditCard',
  'DollarSign', 'Euro', 'Calculator', 'Calendar', 'Clock', 'Timer',
  'MapPin', 'Navigation', 'Compass', 'Home', 'Building', 'Factory',
  'Store', 'Truck', 'Car', 'Plane', 'Ship', 'Gamepad2', 'Music',
  'Film', 'Image', 'FileText', 'File', 'Folder', 'Archive', 'Book',
  'BookOpen', 'GraduationCap', 'Palette', 'Brush', 'Scissors',
  'Wrench', 'Hammer', 'Cog', 'LifeBuoy', 'HelpCircle', 'Info',
  'AlertTriangle', 'CheckCircle', 'XCircle', 'Plus', 'Minus', 'X', 'Check'
] as const;

type IconName = typeof AVAILABLE_ICONS[number];

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const IconSelect = ({ value, onChange, placeholder = "Select an icon", className }: IconSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = AVAILABLE_ICONS.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-4 h-4" />;
  };

  const selectedIcon = value && AVAILABLE_ICONS.includes(value as IconName) ? value : null;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between h-12 px-3 text-left font-normal",
          !selectedIcon && "text-muted-foreground"
        )}
      >
        <div className="flex items-center space-x-2">
          {selectedIcon && renderIcon(selectedIcon)}
          <span>{selectedIcon || placeholder}</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredIcons.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">No icons found</div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      selectedIcon === iconName && "bg-[#29BF12]/10 border border-[#29BF12]"
                    )}
                    title={iconName}
                  >
                    {renderIcon(iconName)}
                    <span className="text-xs mt-1 truncate w-full text-center">
                      {iconName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Helper function to render icons dynamically
export const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};
